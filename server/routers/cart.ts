import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { cartItems, products, productVariants } from "../../drizzle/schema";
import { getCartRecoveryData, cancelAbandonedCartRecovery } from "../services/abandonedCartService";

export const cartRouter = router({
  /**
   * Get all cart items for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        product: products,
        variant: productVariants,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(and(
        eq(cartItems.userId, ctx.user.id),
        isNull(cartItems.deletedAt)
      ));

    return items;
  }),

  /**
   * Get cart item count for badge
   */
  count: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;

    const items = await db
      .select({ quantity: cartItems.quantity })
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, ctx.user.id),
        isNull(cartItems.deletedAt)
      ));

    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }),

  /**
   * Add item to cart (or update quantity if already exists)
   */
  add: protectedProcedure
    .input(z.object({
      productId: z.number(),
      variantId: z.number().optional(),
      quantity: z.number().min(1).default(1),
      priceAtAdd: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if product exists
      const product = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
      if (product.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      // Check if item already in cart
      const existing = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, ctx.user.id),
          eq(cartItems.productId, input.productId),
          input.variantId ? eq(cartItems.variantId, input.variantId) : isNull(cartItems.variantId),
          isNull(cartItems.deletedAt)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ 
            quantity: existing[0].quantity + input.quantity,
            updatedAt: new Date()
          })
          .where(eq(cartItems.id, existing[0].id));
        
        return { success: true, action: "updated" };
      } else {
        // Insert new item
        await db.insert(cartItems).values({
          userId: ctx.user.id,
          productId: input.productId,
          variantId: input.variantId || null,
          quantity: input.quantity,
          priceAtAdd: input.priceAtAdd,
        });
        
        return { success: true, action: "added" };
      }
    }),

  /**
   * Update cart item quantity
   */
  updateQuantity: protectedProcedure
    .input(z.object({
      cartItemId: z.number(),
      quantity: z.number().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(cartItems)
        .set({ 
          quantity: input.quantity,
          updatedAt: new Date()
        })
        .where(and(
          eq(cartItems.id, input.cartItemId),
          eq(cartItems.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Remove item from cart (soft delete)
   */
  remove: protectedProcedure
    .input(z.object({
      cartItemId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(cartItems)
        .set({ deletedAt: new Date() })
        .where(and(
          eq(cartItems.id, input.cartItemId),
          eq(cartItems.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Clear entire cart (soft delete all items).
   * Also cancels any pending abandoned cart recovery jobs.
   */
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db
      .update(cartItems)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(cartItems.userId, ctx.user.id),
        isNull(cartItems.deletedAt)
      ));

    // Cancel pending abandoned cart recovery jobs when user manually clears cart
    cancelAbandonedCartRecovery(ctx.user.id).catch(err =>
      console.error('[Cart] Failed to cancel abandoned cart recovery on clear:', err)
    );

    return { success: true };
  }),

  /**
   * Recover cart from abandoned cart recovery token.
   * Validates the JWT token, restores cart items from the snapshot,
   * and cancels remaining recovery emails.
   */
  recover: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const recovery = await getCartRecoveryData(input.token);
      if (!recovery) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recovery link is invalid or has expired.' });
      }
      // Only allow the original user to recover their own cart
      if (recovery.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'This recovery link belongs to a different account.' });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Clear existing cart first to avoid duplicates
      await db
        .update(cartItems)
        .set({ deletedAt: new Date() })
        .where(and(eq(cartItems.userId, ctx.user.id), isNull(cartItems.deletedAt)));

      // Re-insert items from snapshot
      const snapshot = recovery.snapshot;
      if (snapshot.items && snapshot.items.length > 0) {
        await db.insert(cartItems).values(
          snapshot.items.map((item: any) => ({
            userId: ctx.user.id,
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd ?? 0,
          }))
        );
      }

      // Cancel remaining recovery jobs now that cart is restored
      cancelAbandonedCartRecovery(ctx.user.id).catch(() => {});

      return { success: true, itemCount: snapshot.items?.length ?? 0 };
    }),
});
