import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Payout Router
 * Handles all payout-related operations for artists
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
  // PAYOUTS
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
   * Request payout (standard or instant)
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(2000), // Minimum $20.00
        payoutType: z.enum(["standard", "instant"]),
        payoutAccountId: z.number(),
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

      // Get current balance
      const balance = await db.getEarningsBalance(profile.id);
      if (!balance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Earnings balance not found",
        });
      }

      // Check if account is on hold
      if (balance.isOnHold) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Payouts are temporarily on hold: ${balance.holdReason}`,
        });
      }

      // Check if sufficient balance
      if (balance.availableBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient balance. Available: $${(balance.availableBalance / 100).toFixed(2)}`,
        });
      }

      // Verify payout account exists and belongs to artist
      const accounts = await db.getPayoutAccounts(profile.id);
      const account = accounts.find((a) => a.id === input.payoutAccountId);
      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payout account not found",
        });
      }

      if (!account.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payout account is not active",
        });
      }

      if (account.verificationStatus !== "verified") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payout account must be verified before requesting payouts",
        });
      }

      // Calculate fees
      const fee = input.payoutType === "instant" ? Math.ceil(input.amount * 0.01) : 0;
      const netAmount = input.amount - fee;

      // Calculate estimated arrival
      const now = new Date();
      const estimatedArrival = new Date(now);
      if (input.payoutType === "instant") {
        estimatedArrival.setHours(now.getHours() + 1); // 1 hour for instant
      } else {
        estimatedArrival.setDate(now.getDate() + 1); // Next business day for standard
      }

      // Create payout
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
      });

      // Update balance (deduct from available, add to withdrawn)
      await db.updateEarningsBalance(profile.id, {
        availableBalance: balance.availableBalance - input.amount,
        withdrawnBalance: balance.withdrawnBalance + input.amount,
        lastPayoutAt: now,
        lastPayoutAmount: input.amount,
      });

      return payout;
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
});
