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
   */
  createProductCheckout: protectedProcedure
    .input(z.object({
      productId: z.number(),
      productName: z.string(),
      amount: z.number(), // in cents
      quantity: z.number().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await createProductCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        productName: input.productName,
        amount: input.amount,
        quantity: input.quantity,
        successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/store?payment=success`,
        cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/store?payment=canceled`,
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
