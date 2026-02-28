import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { payouts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { User } from "../../drizzle/schema";

/**
 * Payout Router
 * Handles all payout-related operations for artists.
 *
 * Architecture:
 * - Stripe Connect Express accounts handle KYC/AML and bank account linking
 * - stripe.transfers.create() moves funds from Boptone's Stripe balance to artist's connected account
 * - Idempotency keys prevent duplicate transfers on retries
 * - Webhooks (transfer.created, transfer.paid, transfer.failed) reconcile DB status
 * - BullMQ auto-payout scheduler triggers daily/weekly/monthly payouts
 */
export const payoutsRouter = router({
  // ============================================================================
  // PAYOUT ACCOUNTS
  // ============================================================================

  /**
   * Get all payout accounts for current artist
   */
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Artist profile not found",
      });
    }

    return await db.getPayoutAccounts(profile.id);
  }),

  /**
   * Add new payout account
   * NOTE: For Stripe Connect users, bank accounts are managed directly in Stripe Dashboard.
   * This endpoint is kept for legacy/manual bank account tracking only.
   */
  addAccount: protectedProcedure
    .input(
      z.object({
        accountHolderName: z.string().min(1).max(255),
        accountType: z.enum(["checking", "savings"]),
        routingNumber: z.string().length(9), // US routing numbers are 9 digits
        accountNumber: z.string().min(4).max(17), // US account numbers are typically 4-17 digits
        bankName: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      // Hash the account number for duplicate detection
      const accountNumberHash = db.hashAccountNumber(input.accountNumber);

      // Extract last 4 digits for display
      const accountNumberLast4 = input.accountNumber.slice(-4);

      // Create payout account (never store full account number)
      const account = await db.addPayoutAccount({
        artistId: profile.id,
        accountHolderName: input.accountHolderName,
        accountType: input.accountType,
        routingNumber: input.routingNumber,
        accountNumberLast4,
        accountNumberHash,
        bankName: input.bankName,
        isDefault: input.isDefault,
        verificationStatus: "pending", // Start as pending, verify later
      });

      return account;
    }),

  /**
   * Update payout account (set as default, activate/deactivate)
   */
  updateAccount: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      await db.updatePayoutAccount(input.accountId, profile.id, {
        isDefault: input.isDefault,
        isActive: input.isActive,
      });

      return { success: true };
    }),

  /**
   * Delete payout account
   */
  deleteAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      await db.deletePayoutAccount(input.accountId, profile.id);
      return { success: true };
    }),

  // ============================================================================
  // EARNINGS BALANCE
  // ============================================================================

  /**
   * Get current earnings balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Artist profile not found",
      });
    }

    let balance = await db.getEarningsBalance(profile.id);

    // Initialize balance if it doesn't exist
    if (!balance) {
      balance = await db.initializeEarningsBalance(profile.id);
    }

    return balance;
  }),

  /**
   * Update payout schedule preferences
   */
  updatePayoutSchedule: protectedProcedure
    .input(
      z.object({
        payoutSchedule: z.enum(["daily", "weekly", "monthly", "manual"]),
        autoPayoutEnabled: z.boolean().optional(),
        autoPayoutThreshold: z.number().optional(), // In cents
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      await db.updateEarningsBalance(profile.id, {
        payoutSchedule: input.payoutSchedule,
        autoPayoutEnabled: input.autoPayoutEnabled,
        autoPayoutThreshold: input.autoPayoutThreshold,
      });

      return { success: true };
    }),

  // ============================================================================
  // PAYOUTS — REAL STRIPE TRANSFERS
  // ============================================================================

  /**
   * Calculate instant payout fee (1% of amount)
   */
  calculateInstantFee: protectedProcedure
    .input(z.object({ amount: z.number() })) // In cents
    .query(({ input }) => {
      const fee = Math.ceil(input.amount * 0.01); // 1% fee, rounded up
      const netAmount = input.amount - fee;

      return {
        amount: input.amount,
        fee,
        netAmount,
        feePercentage: 1,
      };
    }),

  /**
   * Request payout — creates a real Stripe transfer to the artist's connected account.
   *
   * Flow:
   * 1. Validate balance, hold status, and Connect account readiness
   * 2. Create a DB payout record (status = "pending")
   * 3. Deduct from availableBalance atomically
   * 4. Call stripe.transfers.create() with idempotency key = "payout-{payoutId}"
   * 5. Update payout record with externalPayoutId and status = "processing"
   * 6. On Stripe error: rollback balance, mark payout as "failed"
   *
   * Webhook reconciliation (server/webhooks/stripe.ts):
   * - transfer.created  → already handled (logs processing)
   * - transfer.paid     → sets status = "completed", completedAt = now
   * - transfer.reversed → sets status = "failed", restores balance
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(2000), // Minimum $20.00
        payoutType: z.enum(["standard", "instant"]),
        // payoutAccountId is optional — Stripe Connect users don't need a local bank record
        payoutAccountId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      // ── 1. Validate Stripe Connect account ──────────────────────────────────
      // ctx.user is the full User row from DB (all columns including stripeConnect fields)
      const user = ctx.user as User;
      if (!user?.stripeConnectAccountId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Connect your payout account in Settings → Payouts before requesting a payout.",
        });
      }
      if (!user.stripeConnectChargesEnabled || !user.stripeConnectPayoutsEnabled) { // int fields: 0 = false, 1 = true
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Your payout account is not fully verified yet. Complete the setup in Settings → Payouts.",
        });
      }

      // ── 2. Validate earnings balance ─────────────────────────────────────────
      const balance = await db.getEarningsBalance(profile.id);
      if (!balance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Earnings balance not found",
        });
      }

      if (balance.isOnHold) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Payouts are temporarily on hold: ${balance.holdReason}`,
        });
      }

      if (balance.availableBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient balance. Available: $${(balance.availableBalance / 100).toFixed(2)}`,
        });
      }

      // ── 3. Verify payout account record (optional for Stripe Connect users) ──
      let account: Awaited<ReturnType<typeof db.getPayoutAccounts>>[number] | undefined;
      if (input.payoutAccountId) {
        const accounts = await db.getPayoutAccounts(profile.id);
        account = accounts.find((a) => a.id === input.payoutAccountId);
      }

      // ── 4. Calculate fees and timing ─────────────────────────────────────────
      const fee = input.payoutType === "instant" ? Math.ceil(input.amount * 0.01) : 0;
      const netAmount = input.amount - fee;
      const now = new Date();
      const estimatedArrival = new Date(now);
      if (input.payoutType === "instant") {
        estimatedArrival.setHours(now.getHours() + 1);
      } else {
        estimatedArrival.setDate(now.getDate() + 1); // Next business day
      }

      // ── 5. Create DB payout record (status = pending) ─────────────────────────
      const payout = await db.createPayout({
        artistId: profile.id,
        payoutAccountId: input.payoutAccountId,
        amount: input.amount,
        currency: "USD",
        payoutType: input.payoutType,
        fee,
        netAmount,
        status: "pending",
        paymentProcessor: "stripe",
        scheduledFor: input.payoutType === "instant" ? now : estimatedArrival,
        estimatedArrival,
        metadata: {
          ipAddress: (ctx.req as any).ip,
          userAgent: (ctx.req as any).headers?.["user-agent"],
        },
      });

      // ── 6. Deduct balance atomically before Stripe call ───────────────────────
      await db.updateEarningsBalance(profile.id, {
        availableBalance: balance.availableBalance - input.amount,
        withdrawnBalance: balance.withdrawnBalance + input.amount,
        lastPayoutAt: now,
        lastPayoutAmount: input.amount,
      });

      // ── 7. Execute real Stripe transfer ──────────────────────────────────────
      try {
        if (!stripe) {
          throw new Error("Stripe is not configured. Please contact support.");
        }

        const transfer = await stripe.transfers.create(
          {
            amount: netAmount, // Transfer net amount (after Boptone fee)
            currency: "usd",
            destination: user.stripeConnectAccountId,
            description: `Boptone payout — ${input.payoutType} — $${(input.amount / 100).toFixed(2)}`,
            metadata: {
              boptone_payout_id: payout.id.toString(),
              boptone_artist_id: profile.id.toString(),
              boptone_user_id: ctx.user.id.toString(),
              payout_type: input.payoutType,
            },
          },
          {
            // Idempotency key prevents duplicate transfers on retries
            idempotencyKey: `payout-${payout.id}`,
          }
        );

        // ── 8. Update payout record with Stripe transfer ID ───────────────────
        const drizzleDb = await getDb();
        if (drizzleDb) {
          await drizzleDb
            .update(payouts)
            .set({
              externalPayoutId: transfer.id,
              status: "processing",
              processedAt: now,
            })
            .where(eq(payouts.id, payout.id));
        }

        console.log(
          `[Payouts] Transfer created: ${transfer.id} for artist ${profile.id}, amount $${(netAmount / 100).toFixed(2)}`
        );

        return {
          ...payout,
          externalPayoutId: transfer.id,
          status: "processing" as const,
          estimatedArrival,
        };
      } catch (stripeError: any) {
        // ── 9. Rollback balance on Stripe failure ─────────────────────────────
        console.error(`[Payouts] Stripe transfer failed for payout ${payout.id}:`, stripeError.message);

        // Restore balance
        await db.updateEarningsBalance(profile.id, {
          availableBalance: balance.availableBalance, // Restore original
          withdrawnBalance: balance.withdrawnBalance, // Restore original
          lastPayoutAt: balance.lastPayoutAt ?? undefined,
          lastPayoutAmount: balance.lastPayoutAmount ?? undefined,
        });

        // Mark payout as failed
        await db.updatePayoutStatus(payout.id, "failed", {
          failureReason: stripeError.message,
          failureCode: stripeError.code || "stripe_error",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Payout failed: ${stripeError.message}. Your balance has been restored.`,
        });
      }
    }),

  /**
   * Get payout history
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(50) }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      return await db.getPayoutHistory(profile.id, input.limit);
    }),

  /**
   * Get single payout details
   */
  getPayoutDetails: protectedProcedure
    .input(z.object({ payoutId: z.number() }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      const history = await db.getPayoutHistory(profile.id, 1000);
      const payout = history.find((p) => p.id === input.payoutId);

      if (!payout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payout not found",
        });
      }

      return payout;
    }),

  /**
   * Cancel a pending payout (before Stripe processes it)
   */
  cancelPayout: protectedProcedure
    .input(z.object({ payoutId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      const history = await db.getPayoutHistory(profile.id, 1000);
      const payout = history.find((p) => p.id === input.payoutId);

      if (!payout) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payout not found" });
      }

      if (payout.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot cancel a payout with status "${payout.status}". Only pending payouts can be cancelled.`,
        });
      }

      // Restore balance
      const balance = await db.getEarningsBalance(profile.id);
      if (balance) {
        await db.updateEarningsBalance(profile.id, {
          availableBalance: balance.availableBalance + payout.amount,
          withdrawnBalance: Math.max(0, balance.withdrawnBalance - payout.amount),
        });
      }

      await db.updatePayoutStatus(input.payoutId, "cancelled");

      return { success: true };
    }),
});
