/**
 * Auto-Payout Scheduler
 *
 * Runs on a cron schedule (every hour) and processes auto-payouts for artists
 * who have enabled automatic payouts and have sufficient balance.
 *
 * Schedule logic:
 * - daily:   fires every day at 02:00 UTC
 * - weekly:  fires every Monday at 02:00 UTC
 * - monthly: fires on the 1st of each month at 02:00 UTC
 * - manual:  never fires automatically
 *
 * Architecture:
 * - BullMQ Queue: "auto-payouts" with repeatable job every hour
 * - Worker processes the job, queries eligible artists, and calls stripe.transfers.create()
 * - Idempotency key: "auto-payout-{artistId}-{dateKey}" prevents double-processing
 */

import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { getDb } from "../db";
import { earningsBalance as earningsBalances, payoutAccounts, artistProfiles, users, payouts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { stripe } from "../stripe";
import { getEarningsBalance, updateEarningsBalance } from "../db";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const MINIMUM_PAYOUT_THRESHOLD = 2000; // $20.00 in cents

let autoPayoutQueue: Queue | null = null;
let autoPayoutWorker: Worker | null = null;

/**
 * Initialize the auto-payout scheduler.
 * Called once at server startup.
 */
export async function startAutoPayoutScheduler() {
  try {
    const connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    autoPayoutQueue = new Queue("auto-payouts", { connection });

    // Schedule a repeatable job that runs every hour
    // The worker itself decides which artists to pay based on their schedule
    await autoPayoutQueue.add(
      "process-auto-payouts",
      {},
      {
        repeat: {
          pattern: "0 * * * *", // Every hour at minute 0
        },
        jobId: "auto-payout-hourly",
        removeOnComplete: { count: 24 }, // Keep last 24 runs
        removeOnFail: { count: 48 },
      }
    );

    autoPayoutWorker = new Worker(
      "auto-payouts",
      async (job: Job) => {
        await processAutoPayouts();
      },
      {
        connection: new IORedis(REDIS_URL, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        }),
        concurrency: 1, // Process one batch at a time
      }
    );

    autoPayoutWorker.on("completed", (job) => {
      console.log(`[AutoPayout] Job ${job.id} completed`);
    });

    autoPayoutWorker.on("failed", (job, err) => {
      console.error(`[AutoPayout] Job ${job?.id} failed:`, err.message);
    });

    console.log("[AutoPayout] Scheduler started — runs every hour");
  } catch (err: any) {
    console.warn("[AutoPayout] Could not start scheduler (Redis unavailable):", err.message);
  }
}

/**
 * Gracefully shut down the scheduler.
 */
export async function stopAutoPayoutScheduler() {
  if (autoPayoutWorker) {
    await autoPayoutWorker.close();
  }
  if (autoPayoutQueue) {
    await autoPayoutQueue.close();
  }
}

/**
 * Core processing function.
 * Queries all artists with auto-payout enabled and sufficient balance,
 * then fires Stripe transfers for those whose schedule window has opened.
 */
async function processAutoPayouts() {
  const db = await getDb();
  if (!db) {
    console.warn("[AutoPayout] Database unavailable, skipping run");
    return;
  }

  const now = new Date();
  const todayKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  const dayOfMonth = now.getUTCDate();
  const hour = now.getUTCHours();

  // Only process at 02:00 UTC to avoid duplicate runs within the same day
  if (hour !== 2) {
    console.log(`[AutoPayout] Skipping — not the processing hour (current UTC hour: ${hour})`);
    return;
  }

  console.log(`[AutoPayout] Processing auto-payouts for ${todayKey}`);

  // Query artists with auto-payout enabled and sufficient balance
  const eligibleBalances = await db
    .select({
      balance: earningsBalances,
      artistProfile: artistProfiles,
      user: users,
    })
    .from(earningsBalances)
    .innerJoin(artistProfiles, eq(earningsBalances.artistId, artistProfiles.id))
    .innerJoin(users, eq(artistProfiles.userId, users.id))
    .where(
      and(
        eq(earningsBalances.autoPayoutEnabled, true),
        eq(earningsBalances.isOnHold, false)
      )
    );

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const { balance, artistProfile, user } of eligibleBalances) {
    try {
      // Check schedule window
      const schedule = balance.payoutSchedule;
      const shouldPay =
        (schedule === "daily") ||
        (schedule === "weekly" && dayOfWeek === 1) || // Monday
        (schedule === "monthly" && dayOfMonth === 1); // 1st of month

      if (!shouldPay) {
        skipped++;
        continue;
      }

      // Check minimum threshold
      const threshold = balance.autoPayoutThreshold ?? MINIMUM_PAYOUT_THRESHOLD;
      if (balance.availableBalance < threshold) {
        console.log(
          `[AutoPayout] Artist ${artistProfile.id} below threshold: $${(balance.availableBalance / 100).toFixed(2)} < $${(threshold / 100).toFixed(2)}`
        );
        skipped++;
        continue;
      }

      // Check Stripe Connect account
      if (!user.stripeConnectAccountId || !user.stripeConnectPayoutsEnabled) {
        console.log(`[AutoPayout] Artist ${artistProfile.id} has no active Stripe Connect account`);
        skipped++;
        continue;
      }

      // Get default payout account
      const [defaultAccount] = await db
        .select()
        .from(payoutAccounts)
        .where(
          and(
            eq(payoutAccounts.artistId, artistProfile.id),
            eq(payoutAccounts.isDefault, true),
            eq(payoutAccounts.isActive, true)
          )
        )
        .limit(1);

      if (!defaultAccount) {
        console.log(`[AutoPayout] Artist ${artistProfile.id} has no default payout account`);
        skipped++;
        continue;
      }

      // Create payout record
      const amount = balance.availableBalance;
      const netAmount = amount; // No fee for auto-payouts (standard schedule)
      const idempotencyKey = `auto-payout-${artistProfile.id}-${todayKey}`;

      const insertResult = await db
        .insert(payouts)
        .values({
          artistId: artistProfile.id,
          payoutAccountId: defaultAccount.id,
          amount,
          currency: "USD",
          payoutType: "standard",
          fee: 0,
          netAmount,
          status: "pending",
          paymentProcessor: "stripe",
          scheduledFor: now,
          estimatedArrival: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next day
          metadata: { autoSchedule: schedule, dateKey: todayKey },
        });

      const payoutId = Number(insertResult[0].insertId);

      // Deduct balance before Stripe call
      await updateEarningsBalance(artistProfile.id, {
        availableBalance: 0,
        withdrawnBalance: (balance.withdrawnBalance ?? 0) + amount,
        lastPayoutAt: now,
        lastPayoutAmount: amount,
      });

      // Fire Stripe transfer
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      const transfer = await stripe.transfers.create(
        {
          amount: netAmount,
          currency: "usd",
          destination: user.stripeConnectAccountId,
          description: `Boptone auto-payout (${schedule}) — $${(amount / 100).toFixed(2)}`,
          metadata: {
            boptone_payout_id: payoutId.toString(),
            boptone_artist_id: artistProfile.id.toString(),
            auto_schedule: schedule,
            date_key: todayKey,
          },
        },
        { idempotencyKey }
      );

      // Update payout with transfer ID
      await db
        .update(payouts)
        .set({ externalPayoutId: transfer.id, status: "processing", processedAt: now })
        .where(eq(payouts.id, payoutId));

      console.log(
        `[AutoPayout] Artist ${artistProfile.id} — $${(amount / 100).toFixed(2)} → transfer ${transfer.id}`
      );
      processed++;
    } catch (err: any) {
      console.error(`[AutoPayout] Failed for artist ${artistProfile.id}:`, err.message);
      failed++;
    }
  }

  console.log(`[AutoPayout] Run complete — processed: ${processed}, skipped: ${skipped}, failed: ${failed}`);
}

/**
 * Manually trigger auto-payout processing for a specific artist.
 * Used for testing and admin overrides.
 */
export async function triggerManualAutoPayoutForArtist(artistId: number): Promise<void> {
  if (!autoPayoutQueue) {
    throw new Error("Auto-payout scheduler not running");
  }
  await autoPayoutQueue.add(`manual-payout-${artistId}`, { artistId }, {
    jobId: `manual-payout-${artistId}-${Date.now()}`,
  });
}
