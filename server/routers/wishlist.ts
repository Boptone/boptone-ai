import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { wishlists, products } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Wishlist Router
 * Handles adding/removing products from user wishlist with lightning bolt icons
 */
export const wishlistRouter = router({
  // Add product to wishlist
  add: protectedProcedure
    .input(z.object({
      productId: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already in wishlist
      const existing = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, input.productId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, alreadyExists: true };
      }

      // Add to wishlist
      await db.insert(wishlists).values({
        userId: ctx.user.id,
        productId: input.productId,
      });

      return { success: true, alreadyExists: false };
    }),

  // Remove product from wishlist
  remove: protectedProcedure
    .input(z.object({
      productId: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, input.productId)
          )
        );

      return { success: true };
    }),

  // Check if product is in wishlist
  check: protectedProcedure
    .input(z.object({
      productId: z.number().int().positive(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { inWishlist: false };

      const result = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, input.productId)
          )
        )
        .limit(1);

      return { inWishlist: result.length > 0 };
    }),

  // Get all wishlist items with product details
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select({
        wishlistId: wishlists.id,
        addedAt: wishlists.createdAt,
        product: products,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, ctx.user.id))
      .orderBy(wishlists.createdAt);

    return result;
  }),

  // Get wishlist count
  count: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0 };

    const result = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, ctx.user.id));

    return { count: result.length };
  }),
});
