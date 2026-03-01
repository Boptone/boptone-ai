import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createCheckoutSession,
  createProductCheckoutSession,
  createProCheckoutSession,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PRICES,
  PRO_PRICE_MONTHLY_CENTS,
  PRO_PRICE_ANNUAL_CENTS,
  stripe,
} from "../stripe";
import {
  getUserSubscription,
  upsertSubscription,
  cancelSubscription as dbCancelSubscription,
} from "../db_stripe";

export const stripeRouter = router({
  /**
   * Get Stripe publishable key for frontend
   */
  getPublishableKey: protectedProcedure.query(() => {
    return { publishableKey: STRIPE_PUBLISHABLE_KEY };
  }),

  /**
   * Get user's current subscription with tier, status, and period info.
   * This is the canonical query for tier-gated UI.
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getUserSubscription(ctx.user.id);
    if (!sub) {
      return {
        tier: "free" as const,
        status: "active" as const,
        billingCycle: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      };
    }
    return {
      tier: (sub.tier || "free") as "free" | "pro" | "enterprise",
      status: sub.status,
      billingCycle: sub.billingCycle ?? null,
      currentPeriodEnd: sub.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
    };
  }),

  /**
   * Legacy: get full subscription row
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscription(ctx.user.id);
  }),

  /**
   * Create a Stripe Checkout Session for the PRO tier.
   * Supports monthly ($49/mo) and annual ($39/mo, billed $468/yr) billing.
   * Opens in a new tab on the frontend.
   */
  createProCheckout: protectedProcedure
    .input(
      z.object({
        billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe is not configured. Please contact support.",
        });
      }

      // Fetch existing Stripe customer ID to avoid creating duplicates
      const existingSub = await getUserSubscription(ctx.user.id);

      const origin = ctx.req.headers.origin || "https://boptoneos-ntbkjjza.manus.space";

      const session = await createProCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        userName: ctx.user.name || undefined,
        billingCycle: input.billingCycle,
        existingCustomerId: existingSub?.stripeCustomerId ?? null,
        successUrl: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/upgrade?canceled=1`,
      });

      // Upsert a pending subscription row so the webhook can update it
      await upsertSubscription({
        userId: ctx.user.id,
        stripeCustomerId: session.customer as string,
        tier: "free",
        plan: "free",
        billingCycle: input.billingCycle,
        status: "incomplete",
      });

      return { url: session.url, sessionId: session.id };
    }),

  /**
   * Legacy: create subscription checkout (kept for backward compatibility)
   */
  createSubscriptionCheckout: protectedProcedure
    .input(z.object({ tier: z.enum(["pro", "enterprise"]) }))
    .mutation(async ({ ctx, input }) => {
      const priceId =
        input.tier === "pro" ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.PRO_MONTHLY;

      const session = await createCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        priceId,
        successUrl: `${ctx.req.headers.origin || ""}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${ctx.req.headers.origin || ""}/upgrade?canceled=1`,
      });

      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Create a Stripe Billing Portal session so the user can manage their subscription.
   */
  createBillingPortal: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe is not configured.",
      });
    }

    const sub = await getUserSubscription(ctx.user.id);
    if (!sub?.stripeCustomerId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No billing account found. Please upgrade to PRO first.",
      });
    }

    const origin = ctx.req.headers.origin || "https://boptoneos-ntbkjjza.manus.space";
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/settings/billing`,
    });

    return { url: session.url };
  }),

  /**
   * Create checkout session for merchandise purchase (BopShop).
   */
  createProductCheckout: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        productName: z.string(),
        amount: z.number(),
        quantity: z.number().default(1),
        artistId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const artist = await db.select().from(users).where(eq(users.id, input.artistId)).limit(1);
      if (!artist.length) throw new TRPCError({ code: "NOT_FOUND", message: "Artist not found" });

      const artistData = artist[0];
      const platformFeePercentage = 12;

      const session = await createProductCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        productName: input.productName,
        amount: input.amount,
        quantity: input.quantity,
        successUrl: `${ctx.req.headers.origin || ""}/store?payment=success`,
        cancelUrl: `${ctx.req.headers.origin || ""}/store?payment=canceled`,
        artistStripeAccountId: artistData.stripeConnectAccountId || undefined,
        platformFeePercentage: artistData.stripeConnectAccountId ? platformFeePercentage : undefined,
      });

      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Cancel user's subscription at period end.
   */
  cancelUserSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription?.stripeSubscriptionId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No active subscription found" });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await dbCancelSubscription(ctx.user.id);
    return { success: true };
  }),

  /**
   * Reactivate a subscription that was set to cancel at period end.
   */
  reactivateSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription?.stripeSubscriptionId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No subscription found" });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await upsertSubscription({
      ...subscription,
      cancelAtPeriodEnd: false,
      status: "active",
    });

    return { success: true };
  }),

  /**
   * Expose PRO pricing for the frontend upgrade page.
   */
  getPricing: protectedProcedure.query(() => {
    return {
      monthly: { cents: PRO_PRICE_MONTHLY_CENTS, display: "$49" },
      annual: {
        cents: PRO_PRICE_ANNUAL_CENTS,
        display: "$468",
        perMonth: "$39",
        savingsPercent: 20,
      },
    };
  }),
});
