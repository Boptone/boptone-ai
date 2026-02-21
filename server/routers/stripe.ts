import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { 
  createCheckoutSession, 
  createProductCheckoutSession,
  STRIPE_PUBLISHABLE_KEY,
  stripe,
} from "../stripe";
import { getUserSubscription, upsertSubscription, cancelSubscription as dbCancelSubscription } from "../db_stripe";

export const stripeRouter = router({
  /**
   * Get Stripe publishable key for frontend
   */
  getPublishableKey: protectedProcedure.query(() => {
    return { publishableKey: STRIPE_PUBLISHABLE_KEY };
  }),

  /**
   * Get user's current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    return subscription;
  }),

  /**
   * Create checkout session for Pro subscription
   */
  createSubscriptionCheckout: protectedProcedure
    .input(z.object({
      tier: z.enum(["pro", "enterprise"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // For now, use a fixed price ID - you'll need to create this in Stripe Dashboard
      // Go to Stripe Dashboard → Products → Create Product → Add Price
      const priceId = input.tier === "pro" 
        ? "price_1QWfOqFFuByvgYTFqLPfJpWb" // Replace with your actual Stripe Price ID
        : "price_enterprise"; // Replace with your actual Stripe Price ID

      const session = await createCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        priceId,
        successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
        cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pricing?payment=canceled`,
      });

      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Create checkout session for merchandise purchase
   * 
   * ENTERPRISE COMPLIANCE: Routes payment directly to artist via Stripe Connect
   * with platform fee deducted automatically. Eliminates money transmitter licensing.
   */
  createProductCheckout: protectedProcedure
    .input(z.object({
      productId: z.number(),
      productName: z.string(),
      amount: z.number(), // in cents
      quantity: z.number().default(1),
      artistId: z.number(), // Artist who owns the product
    }))
    .mutation(async ({ ctx, input }) => {
      // Fetch artist's Stripe Connect account ID
      const { getDb } = await import("../db");
      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const artist = await db.select().from(users).where(eq(users.id, input.artistId)).limit(1);
      if (!artist || artist.length === 0) {
        throw new Error("Artist not found");
      }
      
      const artistData = artist[0];
      
      // Determine platform fee based on artist's subscription tier
      // TODO: Fetch actual subscription tier from database
      // For now, default to Free tier (12%)
      const platformFeePercentage = 12; // 12% Free, 5% Pro, 2% Enterprise
      
      const session = await createProductCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        productName: input.productName,
        amount: input.amount,
        quantity: input.quantity,
        successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/store?payment=success`,
        cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/store?payment=canceled`,
        artistStripeAccountId: artistData.stripeConnectAccountId || undefined,
        platformFeePercentage: artistData.stripeConnectAccountId ? platformFeePercentage : undefined,
      });

      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Cancel user's subscription
   */
  cancelUserSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    // Cancel in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update in database
    await dbCancelSubscription(ctx.user.id);

    return { success: true };
  }),

  /**
   * Reactivate a canceled subscription
   */
  reactivateSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error("No subscription found");
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update in database
    await upsertSubscription({
      ...subscription,
      cancelAtPeriodEnd: false,
      status: "active",
    });

    return { success: true };
  }),
});
