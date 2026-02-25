/**
 * FAN WALLET ROUTER
 * Core monetization layer for Boptone's "Music Business 2.0" model
 * 
 * Features:
 * - Wallet balance management
 * - Stripe topup integration
 * - Transaction history
 * - Auto-reload settings
 * - Protocol fee tracking (5% to Boptone, 95% to artist)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { fanWallets, streamDebits, walletTopups } from "../../drizzle/schema";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2024-11-20.acacia",
});

export const fanWalletRouter = router({
  /**
   * Get wallet balance and lifetime stats
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    // Get or create wallet for user
    let wallet = await db
      .select()
      .from(fanWallets)
      .where(eq(fanWallets.userId, ctx.user.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!wallet) {
      // Create wallet on first access
      await db.insert(fanWallets).values({
        userId: ctx.user.id,
        balance: 0,
        lifetimeSpent: 0,
        lifetimeTopups: 0,
        autoReloadEnabled: false,
        autoReloadThreshold: 500, // $5
        autoReloadAmount: 2000, // $20
      });

      wallet = await db
        .select()
        .from(fanWallets)
        .where(eq(fanWallets.userId, ctx.user.id))
        .limit(1)
        .then((rows) => rows[0]);
    }

    return {
      balance: wallet!.balance, // In cents
      lifetimeSpent: wallet!.lifetimeSpent,
      lifetimeTopups: wallet!.lifetimeTopups,
      autoReloadEnabled: wallet!.autoReloadEnabled,
      autoReloadThreshold: wallet!.autoReloadThreshold,
      autoReloadAmount: wallet!.autoReloadAmount,
      lastTopupAt: wallet!.lastTopupAt,
      lastDebitAt: wallet!.lastDebitAt,
    };
  }),

  /**
   * Create Stripe payment intent for wallet topup
   */
  topup: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().min(500).max(100000), // $5 - $1000 in cents
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Get or create wallet
      let wallet = await db
        .select()
        .from(fanWallets)
        .where(eq(fanWallets.userId, ctx.user.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!wallet) {
        await db.insert(fanWallets).values({
          userId: ctx.user.id,
          balance: 0,
          lifetimeSpent: 0,
          lifetimeTopups: 0,
        });

        wallet = await db
          .select()
          .from(fanWallets)
          .where(eq(fanWallets.userId, ctx.user.id))
          .limit(1)
          .then((rows) => rows[0]);
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          type: "wallet_topup",
          userId: ctx.user.id.toString(),
          fanWalletId: wallet!.id.toString(),
          amount: input.amount.toString(),
        },
      });

      // Record topup in database (pending status)
      await db.insert(walletTopups).values({
        fanWalletId: wallet!.id,
        amount: input.amount,
        paymentMethod: "stripe",
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        isAutoReload: false,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    }),

  /**
   * Confirm topup after Stripe payment success
   * Called by Stripe webhook or frontend after payment confirmation
   */
  confirmTopup: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Get topup record
      const topup = await db
        .select()
        .from(walletTopups)
        .where(eq(walletTopups.stripePaymentIntentId, input.paymentIntentId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!topup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topup not found",
        });
      }

      if (topup.status === "completed") {
        // Already processed
        return { success: true, alreadyProcessed: true };
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment not successful",
        });
      }

      // Update wallet balance
      await db
        .update(fanWallets)
        .set({
          balance: sql`${fanWallets.balance} + ${topup.amount}`,
          lifetimeTopups: sql`${fanWallets.lifetimeTopups} + ${topup.amount}`,
          lastTopupAt: new Date(),
        })
        .where(eq(fanWallets.id, topup.fanWalletId));

      // Mark topup as completed
      await db
        .update(walletTopups)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(walletTopups.id, topup.id));

      return { success: true, alreadyProcessed: false };
    }),

  /**
   * Get paginated transaction history (debits + topups)
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Get wallet
      const wallet = await db
        .select()
        .from(fanWallets)
        .where(eq(fanWallets.userId, ctx.user.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!wallet) {
        return {
          transactions: [],
          totalCount: 0,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: 0,
        };
      }

      // Get debits (stream payments)
      const debits = await db
        .select({
          id: streamDebits.id,
          type: sql<string>`'debit'`,
          amount: streamDebits.amount,
          balanceBefore: streamDebits.balanceBefore,
          balanceAfter: streamDebits.balanceAfter,
          createdAt: streamDebits.createdAt,
          trackId: streamDebits.trackId,
          artistId: streamDebits.artistId,
        })
        .from(streamDebits)
        .where(eq(streamDebits.fanWalletId, wallet.id))
        .orderBy(desc(streamDebits.createdAt))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      // Get topups (wallet recharges)
      const topups = await db
        .select({
          id: walletTopups.id,
          type: sql<string>`'topup'`,
          amount: walletTopups.amount,
          status: walletTopups.status,
          paymentMethod: walletTopups.paymentMethod,
          isAutoReload: walletTopups.isAutoReload,
          createdAt: walletTopups.createdAt,
          completedAt: walletTopups.completedAt,
        })
        .from(walletTopups)
        .where(eq(walletTopups.fanWalletId, wallet.id))
        .orderBy(desc(walletTopups.createdAt))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      // Merge and sort by date
      const transactions = [...debits, ...topups].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      // Get total count
      const [debitCount, topupCount] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(streamDebits)
          .where(eq(streamDebits.fanWalletId, wallet.id))
          .then((rows) => rows[0].count),
        db
          .select({ count: sql<number>`count(*)` })
          .from(walletTopups)
          .where(eq(walletTopups.fanWalletId, wallet.id))
          .then((rows) => rows[0].count),
      ]);

      const totalCount = debitCount + topupCount;
      const totalPages = Math.ceil(totalCount / input.pageSize);

      return {
        transactions,
        totalCount,
        page: input.page,
        pageSize: input.pageSize,
        totalPages,
      };
    }),

  /**
   * Enable/disable auto-reload
   */
  setAutoReload: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        threshold: z.number().int().min(100).max(5000).optional(), // $1 - $50
        amount: z.number().int().min(500).max(10000).optional(), // $5 - $100
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Get wallet
      const wallet = await db
        .select()
        .from(fanWallets)
        .where(eq(fanWallets.userId, ctx.user.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!wallet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        });
      }

      // Update auto-reload settings
      await db
        .update(fanWallets)
        .set({
          autoReloadEnabled: input.enabled,
          ...(input.threshold && { autoReloadThreshold: input.threshold }),
          ...(input.amount && { autoReloadAmount: input.amount }),
        })
        .where(eq(fanWallets.id, wallet.id));

      return { success: true };
    }),

  /**
   * Get auto-reload settings
   */
  getAutoReloadSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    const wallet = await db
      .select()
      .from(fanWallets)
      .where(eq(fanWallets.userId, ctx.user.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!wallet) {
      return {
        enabled: false,
        threshold: 500,
        amount: 2000,
      };
    }

    return {
      enabled: wallet.autoReloadEnabled,
      threshold: wallet.autoReloadThreshold,
      amount: wallet.autoReloadAmount,
    };
  }),
});
