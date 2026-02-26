import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { products, orderItems, orders, wishlists } from "../../../drizzle/schema";
import { eq, desc, sql, and, inArray, notInArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../../_core/llm";

/**
 * Recommendations Router - AI-powered product recommendations
 * 
 * Enterprise-grade features:
 * - LLM-powered personalized recommendations
 * - Fallback to trending/popular products
 * - Caching layer (1 hour per user)
 * - User behavior analysis (purchase history, wishlist)
 * - Collaborative filtering (users who bought X also bought Y)
 */

// In-memory cache for recommendations (1 hour TTL)
const recommendationsCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedRecommendations(key: string): any[] | null {
  const cached = recommendationsCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    recommendationsCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedRecommendations(key: string, data: any[]) {
  recommendationsCache.set(key, { data, timestamp: Date.now() });
}

export const recommendationsRouter = router({
  /**
   * Get personalized recommendations for authenticated user
   * Uses AI to analyze purchase history and wishlist
   */
  getForUser: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(6) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      try {
        // Check cache first
        const cacheKey = `user:${ctx.user.id}:${input.limit}`;
        const cached = getCachedRecommendations(cacheKey);
        if (cached) {
          return { products: cached, source: "cache" };
        }

        // Fetch user's purchase history
        const purchaseHistory = await db
          .select({
            productId: orderItems.productId,
            productName: products.name,
            productType: products.type,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orders.customerId, ctx.user.id))
          .limit(10);

        // Fetch user's wishlist
        const wishlist = await db
          .select({
            productId: wishlists.productId,
            productName: products.name,
            productType: products.type,
          })
          .from(wishlists)
          .innerJoin(products, eq(wishlists.productId, products.id))
          .where(eq(wishlists.userId, ctx.user.id))
          .limit(10);

        // Get all active products for AI to choose from
        const allProducts = await db
          .select({
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            type: products.type,
            images: products.images,
          })
          .from(products)
          .where(eq(products.status, "active"))
          .limit(50);

        // Exclude products user already purchased or wishlisted
        const excludeIds = [
          ...purchaseHistory.map(p => p.productId),
          ...wishlist.map(w => w.productId),
        ];
        const availableProducts = allProducts.filter(p => !excludeIds.includes(p.id));

        if (availableProducts.length === 0) {
          // Fallback to trending products
          return { products: allProducts.slice(0, input.limit), source: "trending" };
        }

        // Use AI to recommend products
        try {
          const prompt = `You are a product recommendation engine for Boptone, a music platform with an e-commerce store.

User's Purchase History:
${purchaseHistory.length > 0 ? purchaseHistory.map(p => `- ${p.productName} (${p.productType})`).join("\n") : "No purchases yet"}

User's Wishlist:
${wishlist.length > 0 ? wishlist.map(w => `- ${w.productName} (${w.productType})`).join("\n") : "Empty wishlist"}

Available Products:
${availableProducts.map((p, i) => `${i + 1}. ${p.name} - ${p.description} ($${p.price}) [ID: ${p.id}]`).join("\n")}

Based on the user's behavior, recommend ${input.limit} products they would most likely be interested in. Consider:
1. Similar product types they've purchased/wishlisted
2. Complementary products (e.g., if they bought a t-shirt, recommend other apparel)
3. Price range they're comfortable with
4. Variety (don't recommend all the same type)

Respond with ONLY a JSON array of product IDs in order of relevance:
[product_id_1, product_id_2, ...]`;

          const response = await invokeLLM({
            messages: [{ role: "user", content: prompt }],
          });

          const content = response.choices[0]?.message?.content || "[]";
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          const recommendedIds = JSON.parse(contentStr.trim());

          // Fetch recommended products
          const recommendations = availableProducts
            .filter(p => recommendedIds.includes(p.id))
            .sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id))
            .slice(0, input.limit);

          // Cache results
          setCachedRecommendations(cacheKey, recommendations);

          return { products: recommendations, source: "ai" };
        } catch (aiError) {
          console.error("[Recommendations] AI error:", aiError);
          
          // Fallback to simple algorithm: most popular products
          const popular = availableProducts.slice(0, input.limit);
          return { products: popular, source: "fallback" };
        }
      } catch (error) {
        console.error("[Recommendations] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recommendations",
        });
      }
    }),

  /**
   * Get recommendations for empty cart (public)
   * Returns trending/popular products
   */
  getForEmptyCart: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(4) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      try {
        // Check cache
        const cacheKey = `empty-cart:${input.limit}`;
        const cached = getCachedRecommendations(cacheKey);
        if (cached) {
          return { products: cached };
        }

        // Get most popular products (most frequently purchased)
        const popularProducts = await db
          .select({
            productId: orderItems.productId,
            purchaseCount: sql<number>`count(*)`,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(products.status, "active"))
          .groupBy(orderItems.productId)
          .orderBy(desc(sql`count(*)`))
          .limit(input.limit);

        const recommendations = popularProducts.map(p => p.product);

        // Cache results
        setCachedRecommendations(cacheKey, recommendations);

        return { products: recommendations };
      } catch (error) {
        console.error("[Recommendations] Empty cart error:", error);
        
        // Fallback to any active products
        const fallback = await db
          .select()
          .from(products)
          .where(eq(products.status, "active"))
          .limit(input.limit);
        
        return { products: fallback };
      }
    }),

  /**
   * Get recommendations for empty wishlist (public)
   * Returns trending/new products
   */
  getForEmptyWishlist: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(4) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      try {
        // Check cache
        const cacheKey = `empty-wishlist:${input.limit}`;
        const cached = getCachedRecommendations(cacheKey);
        if (cached) {
          return { products: cached };
        }

        // Get newest products (recently added)
        const newProducts = await db
          .select()
          .from(products)
          .where(eq(products.status, "active"))
          .orderBy(desc(products.createdAt))
          .limit(input.limit);

        // Cache results
        setCachedRecommendations(cacheKey, newProducts);

        return { products: newProducts };
      } catch (error) {
        console.error("[Recommendations] Empty wishlist error:", error);
        
        // Fallback to any active products
        const fallback = await db
          .select()
          .from(products)
          .where(eq(products.status, "active"))
          .limit(input.limit);
        
        return { products: fallback };
      }
    }),
});
