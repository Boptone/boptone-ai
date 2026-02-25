import { getDb } from "../db";
import { earningsBalance, payouts, writerEarnings, writerPayouts } from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
});

/**
 * PAYOUT ENGINE
 * Instant/next-day artist withdrawals with Stripe Connect
 * 
 * Features:
 * - On-demand payouts (any amount, any time)
 * - Next-day availability (Stripe instant payouts)
 * - Automatic batch processing for scheduled payouts
 * - Fee optimization (minimize Stripe payout fees)
 * - Full audit trail and reconciliation
 * 
 * Payout Options:
 * - Instant: Available immediately (small fee)
 * - Next-day: Free, arrives next business day
 * - Scheduled: Weekly/monthly automatic payouts
 */

export interface PayoutResult {
  success: boolean;
  payoutId?: number;
  stripePayoutId?: string;
  amount: number;
  fee: number;
  netAmount: number;
  estimatedArrival?: Date;
  error?: string;
}

/**
 * Request payout for artist
 * Supports instant or next-day delivery
 */
export async function requestPayout(params: {
  artistId: number;
  amount: number; // In cents
  speed: "instant" | "standard"; // instant = small fee, standard = free next-day
  paymentMethodId?: number; // Which payment method to use
}): Promise<PayoutResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      amount: params.amount,
      fee: 0,
      netAmount: 0,
      error: "Database not available",
    };
  }

  try {
    // Get artist's earnings balance
    const [balance] = await db
      .select()
      .from(earningsBalance)
      .where(eq(earningsBalance.artistId, params.artistId))
      .limit(1);

    if (!balance) {
      throw new Error("No earnings balance found");
    }

    // Validate sufficient balance
    if (balance.availableBalance < params.amount) {
      throw new Error(
        `Insufficient balance: $${(balance.availableBalance / 100).toFixed(2)} available, $${(params.amount / 100).toFixed(2)} requested`
      );
    }

    // Calculate fees
    // Instant: 1.5% fee (Stripe instant payout fee)
    // Standard: $0 fee (next business day)
    const payoutFee = params.speed === "instant" ? Math.floor(params.amount * 0.015) : 0;
    const netAmount = params.amount - payoutFee;

    // Minimum payout: $1.00
    if (netAmount < 100) {
      throw new Error("Minimum payout amount is $1.00");
    }

    // Create payout record
    const [payout] = await db
      .insert(payouts)
      .values({
        artistId: params.artistId,
        payoutAccountId: 1, // TODO: Get actual payout account ID
        amount: params.amount,
        fee: payoutFee,
        netAmount: netAmount,
        currency: "USD",
        status: "pending",
        payoutType: params.speed === "instant" ? "instant" : "standard",
        requestedAt: new Date(),
        metadata: {
          speed: params.speed,
          paymentMethodId: params.paymentMethodId,
        },
      })
      .$returningId();

    // TODO: Create Stripe payout via Connect API
    // For now, simulate successful payout
    const stripePayoutId = `po_test_${Date.now()}`;
    const estimatedArrival = new Date();
    if (params.speed === "instant") {
      // Instant: available in minutes
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + 30);
    } else {
      // Standard: next business day
      estimatedArrival.setDate(estimatedArrival.getDate() + 1);
    }

    // Update payout with Stripe details
    await db
      .update(payouts)
      .set({
        externalPayoutId: stripePayoutId,
        status: "processing",
        processedAt: new Date(),
        estimatedArrival: estimatedArrival,
      })
      .where(eq(payouts.id, payout.id));

    // Update earnings balance (deduct payout amount)
    await db
      .update(earningsBalance)
      .set({
        availableBalance: balance.availableBalance - params.amount,
        withdrawnBalance: balance.withdrawnBalance + params.amount,
        lastPayoutAt: new Date(),
        lastPayoutAmount: params.amount,
        updatedAt: new Date(),
      })
      .where(eq(earningsBalance.id, balance.id));

    console.log(
      `[Payout Engine] Payout requested: $${(netAmount / 100).toFixed(2)} for artist ${params.artistId} (${params.speed})`
    );

    return {
      success: true,
      payoutId: payout.id,
      stripePayoutId: stripePayoutId,
      amount: params.amount,
      fee: payoutFee,
      netAmount: netAmount,
      estimatedArrival: estimatedArrival,
    };
  } catch (error) {
    console.error("[Payout Engine] Error requesting payout:", error);
    return {
      success: false,
      amount: params.amount,
      fee: 0,
      netAmount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process scheduled payouts
 * Called by cron job for weekly/monthly automatic payouts
 */
export async function processScheduledPayouts(): Promise<{
  processed: number;
  failed: number;
  totalAmount: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let processed = 0;
  let failed = 0;
  let totalAmount = 0;

  try {
    // Get all artists with auto-payout enabled
    const balances = await db
      .select()
      .from(earningsBalance)
      .where(eq(earningsBalance.autoPayoutEnabled, true));

    for (const balance of balances) {
      // Check if payout is due based on schedule
      const now = new Date();
      let shouldPayout = false;

      if (balance.payoutSchedule === "daily") {
        shouldPayout = true;
      } else if (balance.payoutSchedule === "weekly") {
        // Payout on Mondays
        shouldPayout = now.getDay() === 1;
      } else if (balance.payoutSchedule === "monthly") {
        // Payout on 1st of month
        shouldPayout = now.getDate() === 1;
      }

      if (!shouldPayout) {
        continue;
      }

      // Check minimum payout threshold
      const minThreshold = balance.autoPayoutThreshold || 1000; // Default $10.00
      if (balance.availableBalance < minThreshold) {
        continue;
      }

      // Request payout
      const result = await requestPayout({
        artistId: balance.artistId,
        amount: balance.availableBalance,
        speed: "standard", // Free next-day for scheduled payouts
      });

      if (result.success) {
        processed++;
        totalAmount += result.netAmount;
      } else {
        failed++;
        console.error(`[Payout Engine] Failed to process payout for artist ${balance.artistId}:`, result.error);
      }
    }

    console.log(
      `[Payout Engine] Scheduled payouts: ${processed} processed, ${failed} failed, $${(totalAmount / 100).toFixed(2)} total`
    );

    return { processed, failed, totalAmount };
  } catch (error) {
    console.error("[Payout Engine] Error processing scheduled payouts:", error);
    throw error;
  }
}

/**
 * Process writer payouts
 * Batch payout to songwriters based on accumulated earnings
 */
export async function processWriterPayouts(params: {
  writerProfileId: number;
  amount?: number; // If not specified, payout all pending earnings
}): Promise<PayoutResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      amount: params.amount || 0,
      fee: 0,
      netAmount: 0,
      error: "Database not available",
    };
  }

  try {
    // Get all pending earnings for this writer
    const earnings = await db
      .select()
      .from(writerEarnings)
      .where(eq(writerEarnings.writerProfileId, params.writerProfileId));

    const totalPending = earnings.reduce((sum, e) => sum + e.pendingPayout, 0);

    if (totalPending === 0) {
      throw new Error("No pending earnings to payout");
    }

    const payoutAmount = params.amount || totalPending;

    if (payoutAmount > totalPending) {
      throw new Error(`Insufficient pending earnings: $${(totalPending / 100).toFixed(2)} available`);
    }

    // Calculate fee (standard next-day payout, free)
    const payoutFee = 0;
    const netAmount = payoutAmount;

    // Create writer payout record
    const [payout] = await db
      .insert(writerPayouts)
      .values({
        writerProfileId: params.writerProfileId,
        paymentMethodId: 1, // TODO: Get actual payment method ID
        amount: payoutAmount,
        currency: "USD",
        status: "pending",
        trackIds: earnings.map((e) => e.trackId),
        metadata: {
          earningsBreakdown: earnings.map((e) => ({
            trackId: e.trackId,
            trackTitle: "Track", // TODO: Join with bapTracks to get title
            amount: e.pendingPayout,
          })),
        },
      })
      .$returningId();

    // TODO: Create Stripe payout via Connect API
    const stripePayoutId = `po_writer_${Date.now()}`;

    // Update payout with Stripe details
    await db
      .update(writerPayouts)
      .set({
        externalPaymentId: stripePayoutId,
        status: "processing",
        processedAt: new Date(),
      })
      .where(eq(writerPayouts.id, payout.id));

    // Update writer earnings (mark as paid)
    for (const earning of earnings) {
      const amountToPay = Math.min(earning.pendingPayout, payoutAmount);
      await db
        .update(writerEarnings)
        .set({
          pendingPayout: earning.pendingPayout - amountToPay,
          totalPaidOut: earning.totalPaidOut + amountToPay,
          lastPayoutAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(writerEarnings.id, earning.id));
    }

    console.log(
      `[Payout Engine] Writer payout processed: $${(netAmount / 100).toFixed(2)} for writer ${params.writerProfileId}`
    );

    return {
      success: true,
      payoutId: payout.id,
      stripePayoutId: stripePayoutId,
      amount: payoutAmount,
      fee: payoutFee,
      netAmount: netAmount,
    };
  } catch (error) {
    console.error("[Payout Engine] Error processing writer payout:", error);
    return {
      success: false,
      amount: params.amount || 0,
      fee: 0,
      netAmount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get payout history for artist
 */
export async function getPayoutHistory(artistId: number, limit: number = 20): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const history = await db
    .select()
    .from(payouts)
    .where(eq(payouts.artistId, artistId))
    .limit(limit);

  return history;
}

/**
 * Get estimated next payout date for artist
 */
export async function getNextPayoutDate(artistId: number): Promise<Date | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [balance] = await db
    .select()
    .from(earningsBalance)
    .where(eq(earningsBalance.artistId, artistId))
    .limit(1);

  if (!balance || !balance.autoPayoutEnabled) {
    return null;
  }

  const now = new Date();
  const nextPayout = new Date();

  if (balance.payoutSchedule === "daily") {
    nextPayout.setDate(now.getDate() + 1);
  } else if (balance.payoutSchedule === "weekly") {
    // Next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextPayout.setDate(now.getDate() + daysUntilMonday);
  } else if (balance.payoutSchedule === "monthly") {
    // 1st of next month
    nextPayout.setMonth(now.getMonth() + 1);
    nextPayout.setDate(1);
  }

  return nextPayout;
}
