/**
 * Product Ratings Router
 *
 * Lightweight 1-5 star ratings for BopShop products.
 * One rating per user per product (upsert semantics).
 * Ratings feed into the recommendation engine's collaborative filter.
 */

import { and, avg, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { productRatings, products } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const productRatingsRouter = router({
  /**
   * Submit or update a star rating for a product.
   * Upsert: if the user has already rated this product, the rating is updated.
   */
  rate: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        note: z.string().max(280).optional(),
        source: z.enum(["quick_rate", "post_purchase", "review_flow"]).default("quick_rate"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify the product exists and is active
      const product = await db
        .select({ id: products.id, name: products.name })
        .from(products)
        .where(and(eq(products.id, input.productId), eq(products.status, "active")))
        .limit(1);

      if (product.length === 0) {
        throw new Error("Product not found or not available for rating");
      }

      // Upsert: insert or update on duplicate (userId, productId)
      await db
        .insert(productRatings)
        .values({
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          note: input.note ?? null,
          source: input.source,
        })
        .onDuplicateKeyUpdate({
          set: {
            rating: input.rating,
            note: input.note ?? null,
            source: input.source,
            updatedAt: new Date(),
          },
        });

      return { success: true, productId: input.productId, rating: input.rating };
    }),

  /**
   * Get the current user's rating for a specific product.
   * Returns null if the user has not rated this product.
   */
  getMyRating: protectedProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(productRatings)
        .where(
          and(
            eq(productRatings.productId, input.productId),
            eq(productRatings.userId, ctx.user.id)
          )
        )
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Delete the current user's rating for a product.
   */
  deleteMyRating: protectedProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .delete(productRatings)
        .where(
          and(
            eq(productRatings.productId, input.productId),
            eq(productRatings.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Get aggregated rating stats for a product.
   * Returns average rating, total count, and distribution by star level.
   */
  getProductStats: publicProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { average: 0, total: 0, distribution: {} };

      const [stats] = await db
        .select({
          average: avg(productRatings.rating),
          total: count(productRatings.id),
        })
        .from(productRatings)
        .where(eq(productRatings.productId, input.productId));

      // Distribution: count per star level (1-5)
      const dist = await db
        .select({
          star: productRatings.rating,
          cnt: count(productRatings.id),
        })
        .from(productRatings)
        .where(eq(productRatings.productId, input.productId))
        .groupBy(productRatings.rating);

      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const row of dist) {
        distribution[row.star] = Number(row.cnt);
      }

      return {
        average: stats?.average ? Number(Number(stats.average).toFixed(1)) : 0,
        total: Number(stats?.total ?? 0),
        distribution,
      };
    }),

  /**
   * Get recent ratings for a product (public, for social proof display).
   * Only returns ratings with notes (anonymous star-only ratings are excluded).
   */
  getRecentWithNotes: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        limit: z.number().int().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select({
          id: productRatings.id,
          rating: productRatings.rating,
          note: productRatings.note,
          createdAt: productRatings.createdAt,
        })
        .from(productRatings)
        .where(
          and(
            eq(productRatings.productId, input.productId),
            sql`${productRatings.note} IS NOT NULL AND ${productRatings.note} != ''`
          )
        )
        .orderBy(desc(productRatings.createdAt))
        .limit(input.limit);

      return rows;
    }),

  /**
   * Get top-rated products for a given artist.
   * Used by the recommendation engine as a quality signal.
   */
  getTopRatedForArtist: publicProcedure
    .input(
      z.object({
        artistId: z.number().int().positive(),
        minRatings: z.number().int().min(1).default(3),
        limit: z.number().int().min(1).max(20).default(8),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select({
          productId: productRatings.productId,
          avgRating: avg(productRatings.rating),
          ratingCount: count(productRatings.id),
          product: products,
        })
        .from(productRatings)
        .innerJoin(products, eq(productRatings.productId, products.id))
        .where(
          and(
            eq(products.artistId, input.artistId),
            eq(products.status, "active")
          )
        )
        .groupBy(productRatings.productId)
        .having(sql`count(${productRatings.id}) >= ${input.minRatings}`)
        .orderBy(desc(avg(productRatings.rating)), desc(count(productRatings.id)))
        .limit(input.limit);

      return rows.map((r) => ({
        ...r.product,
        _avgRating: Number(Number(r.avgRating).toFixed(1)),
        _ratingCount: Number(r.ratingCount),
      }));
    }),
});
