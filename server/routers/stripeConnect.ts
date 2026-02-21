import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

/**
 * Stripe Connect Router
 * 
 * Handles artist onboarding for Stripe Connect accounts to enable direct payouts.
 * This eliminates money transmitter licensing requirements by routing payments
 * directly from customers to artists, with Boptone taking a platform fee.
 */
export const stripeConnectRouter = router({
  /**
   * Create or retrieve Stripe Connect account for current user
   */
  createConnectAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const user = ctx.user;

    // Check if user already has a Connect account
    if (user.stripeConnectAccountId) {
      return {
        accountId: user.stripeConnectAccountId,
        onboardingComplete: user.stripeConnectOnboardingComplete === 1,
      };
    }

    try {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // TODO: Detect user country or make configurable
        email: user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual", // Most artists are sole proprietors
        metadata: {
          boptone_user_id: user.id.toString(),
          boptone_user_name: user.name || "",
        },
      });

      // Save Connect account ID to database
      await db
        .update(users)
        .set({
          stripeConnectAccountId: account.id,
        })
        .where(eq(users.id, user.id));

      return {
        accountId: account.id,
        onboardingComplete: false,
      };
    } catch (error) {
      console.error("[Stripe Connect] Failed to create account:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create payout account",
      });
    }
  }),

  /**
   * Generate Stripe Connect onboarding link
   */
  createOnboardingLink: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const user = ctx.user;

    if (!user.stripeConnectAccountId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No Connect account found. Create account first.",
      });
    }

    try {
      // Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeConnectAccountId,
        refresh_url: `${ctx.req.headers.origin}/settings/payouts?refresh=true`,
        return_url: `${ctx.req.headers.origin}/settings/payouts?success=true`,
        type: "account_onboarding",
      });

      return {
        url: accountLink.url,
      };
    } catch (error) {
      console.error("[Stripe Connect] Failed to create onboarding link:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate onboarding link",
      });
    }
  }),

  /**
   * Get Connect account status
   */
  getAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;

    if (!user.stripeConnectAccountId) {
      return {
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      };
    }

    try {
      // Fetch latest account status from Stripe
      const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);

      const db = await getDb();
      if (db) {
        // Update cached status in database
        await db
          .update(users)
          .set({
            stripeConnectOnboardingComplete: account.details_submitted ? 1 : 0,
            stripeConnectChargesEnabled: account.charges_enabled ? 1 : 0,
            stripeConnectPayoutsEnabled: account.payouts_enabled ? 1 : 0,
          })
          .where(eq(users.id, user.id));
      }

      return {
        hasAccount: true,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
      };
    } catch (error) {
      console.error("[Stripe Connect] Failed to fetch account status:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payout account status",
      });
    }
  }),

  /**
   * Generate Stripe Connect dashboard login link
   */
  createDashboardLink: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;

    if (!user.stripeConnectAccountId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No Connect account found",
      });
    }

    try {
      const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectAccountId);

      return {
        url: loginLink.url,
      };
    } catch (error) {
      console.error("[Stripe Connect] Failed to create dashboard link:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate dashboard link",
      });
    }
  }),
});
