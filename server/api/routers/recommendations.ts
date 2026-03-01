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
   * [COMMERCE-2] Collaborative filter — "Customers who bought X also bought Y"
   *
   * Algorithm:
   *   1. Find all orders that contain the target product.
   *   2. Collect all other products from those same orders.
   *   3. Rank by co-purchase frequency (most frequently co-purchased first).
   *   4. Exclude the seed product itself and already-purchased products.
   *   5. Fall back to category-matched products, then site-wide bestsellers.
   *
   * This is a pure SQL implementation — no ML, no external service.
   */
  getAlsoBought: publicProcedure
    .input(z.object({
      productId: z.number(),
      limit: z.number().min(1).max(20).default(4),
      excludeProductIds: z.array(z.number()).default([]),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection unavailable" });
      }

      const cacheKey = `also-bought:${input.productId}:${input.limit}`;
      const cached = getCachedRecommendations(cacheKey);
      if (cached) {
        return { products: cached, source: "cache" as const };
      }

      try {
        // Step 1: Find all orders containing the seed product
        const seedOrders = await db
          .select({ orderId: orderItems.orderId })
          .from(orderItems)
          .where(eq(orderItems.productId, input.productId));

        const orderIds = seedOrders.map(r => r.orderId);

        if (orderIds.length > 0) {
          // Step 2 & 3: Find co-purchased products, ranked by frequency
          const excludeIds = [input.productId, ...input.excludeProductIds];

          const coPurchased = await db
            .select({
              productId: orderItems.productId,
              coCount: sql<number>`cast(count(*) as unsigned)`,
              product: products,
            })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(
              and(
                inArray(orderItems.orderId, orderIds),
                notInArray(orderItems.productId, excludeIds),
                eq(products.status, "active")
              )
            )
            .groupBy(orderItems.productId)
            .orderBy(desc(sql`count(*)`), desc(products.createdAt))
            .limit(input.limit);

          if (coPurchased.length >= input.limit) {
            const recs = coPurchased.map(r => ({ ...r.product, _coCount: r.coCount }));
            setCachedRecommendations(cacheKey, recs);
            return { products: recs, source: "collaborative" as const };
          }

          // Partial results — pad with category-matched products
          const foundIds = coPurchased.map(r => r.productId);
          const seedProduct = await db
            .select({ category: products.category, type: products.type })
            .from(products)
            .where(eq(products.id, input.productId))
            .limit(1);

          const needed = input.limit - coPurchased.length;
          const padExclude = [...excludeIds, ...foundIds];

          let padded: any[] = [];
          if (seedProduct.length > 0 && (seedProduct[0].category || seedProduct[0].type)) {
            const { category, type } = seedProduct[0];
            const conditions = [
              notInArray(products.id, padExclude),
              eq(products.status, "active"),
            ];
            if (category) conditions.push(eq(products.category, category));
            else if (type) conditions.push(eq(products.type, type));

            padded = await db
              .select()
              .from(products)
              .where(and(...conditions))
              .orderBy(desc(products.createdAt))
              .limit(needed);
          }

          const combined = [
            ...coPurchased.map(r => ({ ...r.product, _coCount: r.coCount })),
            ...padded,
          ].slice(0, input.limit);

          setCachedRecommendations(cacheKey, combined);
          return { products: combined, source: "mixed" as const };
        }

        // No co-purchase data yet — fall back to category / type match
        const seedProduct = await db
          .select({ category: products.category, type: products.type })
          .from(products)
          .where(eq(products.id, input.productId))
          .limit(1);

        const excludeIds = [input.productId, ...input.excludeProductIds];

        if (seedProduct.length > 0 && (seedProduct[0].category || seedProduct[0].type)) {
          const { category, type } = seedProduct[0];
          const conditions = [
            notInArray(products.id, excludeIds),
            eq(products.status, "active"),
          ];
          if (category) conditions.push(eq(products.category, category));
          else if (type) conditions.push(eq(products.type, type));

          const categoryRecs = await db
            .select()
            .from(products)
            .where(and(...conditions))
            .orderBy(desc(products.createdAt))
            .limit(input.limit);

          if (categoryRecs.length > 0) {
            setCachedRecommendations(cacheKey, categoryRecs);
            return { products: categoryRecs, source: "category" as const };
          }
        }

        // Ultimate fallback: site-wide bestsellers
        const bestsellers = await db
          .select({
            productId: orderItems.productId,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(
            and(
              notInArray(orderItems.productId, [input.productId, ...input.excludeProductIds]),
              eq(products.status, "active")
            )
          )
          .groupBy(orderItems.productId)
          .orderBy(desc(sql`count(*)`), desc(products.createdAt))
          .limit(input.limit);

        const fallback = bestsellers.map(r => r.product);
        setCachedRecommendations(cacheKey, fallback);
        return { products: fallback, source: "bestsellers" as const };
      } catch (error) {
        console.error("[Recommendations] getAlsoBought error:", error);
        // Silent fallback — never break the product page
        const fallback = await db
          .select()
          .from(products)
          .where(and(eq(products.status, "active"), notInArray(products.id, [input.productId])))
          .limit(input.limit);
        return { products: fallback, source: "fallback" as const };
      }
    }),

  /**
   * [COMMERCE-2] Cart-level collaborative filter
   *
   * Given the current cart (array of productIds), finds products that are
   * frequently bought alongside ANY item in the cart, de-duplicated and
   * ranked by aggregate co-purchase frequency across all cart items.
   * Excludes products already in the cart.
   */
  getForCartItems: publicProcedure
    .input(z.object({
      productIds: z.array(z.number()).min(1).max(50),
      limit: z.number().min(1).max(20).default(4),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection unavailable" });
      }

      const sortedIds = [...input.productIds].sort((a, b) => a - b);
      const cacheKey = `cart-items:${sortedIds.join(",")}:${input.limit}`;
      const cached = getCachedRecommendations(cacheKey);
      if (cached) {
        return { products: cached, source: "cache" as const };
      }

      try {
        // Find all orders that contain at least one cart product
        const seedOrders = await db
          .select({ orderId: orderItems.orderId })
          .from(orderItems)
          .where(inArray(orderItems.productId, input.productIds));

        const orderIds = [...new Set(seedOrders.map(r => r.orderId))];

        if (orderIds.length > 0) {
          const coPurchased = await db
            .select({
              productId: orderItems.productId,
              coCount: sql<number>`cast(count(*) as unsigned)`,
              product: products,
            })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(
              and(
                inArray(orderItems.orderId, orderIds),
                notInArray(orderItems.productId, input.productIds),
                eq(products.status, "active")
              )
            )
            .groupBy(orderItems.productId)
            .orderBy(desc(sql`count(*)`), desc(products.createdAt))
            .limit(input.limit);

          if (coPurchased.length > 0) {
            const recs = coPurchased.map(r => ({ ...r.product, _coCount: r.coCount }));
            setCachedRecommendations(cacheKey, recs);
            return { products: recs, source: "collaborative" as const };
          }
        }

        // Fallback: site-wide bestsellers not already in cart
        const bestsellers = await db
          .select({
            productId: orderItems.productId,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(
            and(
              notInArray(orderItems.productId, input.productIds),
              eq(products.status, "active")
            )
          )
          .groupBy(orderItems.productId)
          .orderBy(desc(sql`count(*)`), desc(products.createdAt))
          .limit(input.limit);

        const fallback = bestsellers.map(r => r.product);
        setCachedRecommendations(cacheKey, fallback);
        return { products: fallback, source: "bestsellers" as const };
      } catch (error) {
        console.error("[Recommendations] getForCartItems error:", error);
        const fallback = await db
          .select()
          .from(products)
          .where(and(eq(products.status, "active"), notInArray(products.id, input.productIds)))
          .limit(input.limit);
        return { products: fallback, source: "fallback" as const };
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
