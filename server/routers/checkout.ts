import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { cartItems, products, productVariants } from "../../drizzle/schema";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
});

export const checkoutRouter = router({
  /**
   * Create Stripe checkout session from cart
   */
  createSession: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    // Get cart items with product details
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

    if (items.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => {
      if (!item.product) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Product not found" });
      }

      const price = item.variant?.price || item.product.price;
      const name = item.variant 
        ? `${item.product.name} - ${item.variant.name}`
        : item.product.name;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name,
            description: item.product.description || undefined,
            images: item.product.images ? [item.product.images[0]] : undefined,
            metadata: {
              productId: item.product.id.toString(),
              variantId: item.variant?.id?.toString() || "",
            },
          },
          unit_amount: Math.round(price), // Already in cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${ctx.req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ctx.req.headers.origin}/cart`,
      customer_email: ctx.user.email || undefined,
      client_reference_id: ctx.user.id.toString(),
      metadata: {
        userId: ctx.user.id.toString(),
        customerEmail: ctx.user.email || "",
        customerName: ctx.user.name || "",
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"], // Expand as needed
      },
      allow_promotion_codes: true,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }),

  /**
   * Get checkout session details after successful payment
   */
  getSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["line_items", "payment_intent"],
      });

      return {
        id: session.id,
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        lineItems: session.line_items?.data || [],
      };
    }),
});
