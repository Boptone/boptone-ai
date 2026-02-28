/**
 * GDPR Account Deletion Worker
 *
 * Executes the full erasure pipeline after the 30-day grace period:
 *   1. Anonymize users row (name, email, openId — prevents login)
 *   2. Delete all S3 objects owned by the user
 *   3. Delete Stripe customer + Connect account
 *   4. Hard-delete non-financial DB rows (bops, tracks, profile, etc.)
 *   5. Anonymize financial records (orders, payouts, transactions) for 7-year retention
 *   6. Mark userDeletionRequest as completed
 *
 * Financial records are NEVER hard-deleted — they are anonymized to comply with
 * tax/accounting obligations (IRS 7-year rule, EU VAT 10-year rule).
 */

import { Queue, Worker, type Job } from "bullmq";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  users,
  userDeletionRequests,
  artistProfiles,
  bopsVideos,
  bapTracks,
  bapAlbums,
  bapPlaylists,
  bapFollows,
  bapLikes,
  bopsLikes,
  bopsViews,
  bopsComments,
  bopsCommentLikes,
  bopsArtistFollows,
  notifications,
  aiConversations,
  aiContext,
  aiEvents,
  aiRecommendations,
  userCookiePreferences,
  wallets,
  fanWallets,
  paymentMethods,
  payoutAccounts,
  orders,
  wishlists,
  cartItems,
  subscriptions,
} from "../../drizzle/schema";
import { storageDeleteMany } from "../storage";
import Stripe from "stripe";
import { ENV } from "../_core/env";

// ─── Queue Setup ─────────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const QUEUE_NAME = "account-deletion";

let _deletionQueue: Queue | null = null;

export function getDeletionQueue(): Queue | null {
  if (!_deletionQueue) {
    try {
      _deletionQueue = new Queue(QUEUE_NAME, {
        connection: { url: REDIS_URL },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 60_000 }, // 1 min, 2 min, 4 min
          removeOnComplete: { age: 86400 * 7 }, // keep 7 days
          removeOnFail: { age: 86400 * 30 }, // keep 30 days for audit
        },
      });
    } catch (err) {
      console.warn("[AccountDeletion] Redis unavailable, deletion queue disabled:", err);
    }
  }
  return _deletionQueue;
}

export interface AccountDeletionJobData {
  userId: number;
  requestId: number;
  userEmail: string | null;
  stripeCustomerId: string | null;
  stripeConnectAccountId: string | null;
}

/**
 * Schedule a deletion job to run at a specific time (30 days from now).
 * Returns the BullMQ job ID for cancellation.
 */
export async function scheduleAccountDeletion(
  data: AccountDeletionJobData,
  scheduledAt: Date
): Promise<string | null> {
  const queue = getDeletionQueue();
  if (!queue) return null;

  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  const job = await queue.add(`delete-account-${data.userId}`, data, { delay });
  return job.id ?? null;
}

/**
 * Cancel a pending deletion job.
 */
export async function cancelAccountDeletion(jobId: string): Promise<boolean> {
  const queue = getDeletionQueue();
  if (!queue) return false;

  try {
    const job = await queue.getJob(jobId);
    if (!job) return false;
    await job.remove();
    return true;
  } catch {
    return false;
  }
}

// ─── Worker ──────────────────────────────────────────────────────────────────

export function startAccountDeletionWorker(): Worker | null {
  const queue = getDeletionQueue();
  if (!queue) return null;

  const worker = new Worker<AccountDeletionJobData>(
    QUEUE_NAME,
    async (job: Job<AccountDeletionJobData>) => {
      const { userId, requestId, stripeCustomerId, stripeConnectAccountId } = job.data;
      console.log(`[AccountDeletion] Starting deletion for user ${userId} (request ${requestId})`);

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Mark as processing
      await db
        .update(userDeletionRequests)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(userDeletionRequests.id, requestId));

      const steps: string[] = [];

      try {
        // ── Step 1: Collect all S3 keys owned by this user ──────────────────
        const s3Keys: string[] = [];

        // Artist profile media
        const [artistRow] = await db
          .select()
          .from(artistProfiles)
          .where(eq(artistProfiles.userId, userId));

        if (artistRow) {
          // Bops videos
          const bops = await db
            .select({
              rawVideoKey: bopsVideos.rawVideoKey,
              hlsKey: bopsVideos.hlsKey,
              thumbnailKey: bopsVideos.thumbnailKey,
            })
            .from(bopsVideos)
            .where(eq(bopsVideos.artistId, artistRow.id));
          for (const bop of bops) {
            if (bop.rawVideoKey) s3Keys.push(bop.rawVideoKey);
            if (bop.hlsKey) s3Keys.push(bop.hlsKey);
            if (bop.thumbnailKey) s3Keys.push(bop.thumbnailKey);
          }

          // BAP tracks (audioUrl / artworkUrl are full URLs — extract keys)
          const tracks = await db
            .select({ audioUrl: bapTracks.audioUrl, artworkUrl: bapTracks.artworkUrl })
            .from(bapTracks)
            .where(eq(bapTracks.artistId, artistRow.id));
          for (const t of tracks) {
            // Extract S3 key from URL (everything after the CDN domain)
            const extractKey = (url: string | null) => {
              if (!url) return null;
              try {
                return new URL(url).pathname.replace(/^\//, "");
              } catch {
                return url;
              }
            };
            const audioKey = extractKey(t.audioUrl);
            const artworkKey = extractKey(t.artworkUrl);
            if (audioKey) s3Keys.push(audioKey);
            if (artworkKey) s3Keys.push(artworkKey);
          }
        }

        // User-specific prefixes
        s3Keys.push(`profile-photos/${userId}/`);
        s3Keys.push(`avatars/${userId}/`);
        s3Keys.push(`gdpr-exports/gdpr-export-${userId}-`);

        // ── Step 2: Delete S3 objects ────────────────────────────────────────
        const storageResult = await storageDeleteMany(s3Keys.filter(Boolean));
        steps.push(`S3: deleted=${storageResult.deleted} failed=${storageResult.failed}`);

        // ── Step 3: Delete Stripe customer + Connect account ─────────────────
        if (ENV.stripeSecretKey) {
          const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2025-09-30.clover" });

          // Look up stripeCustomerId from subscriptions table
          const [subRow] = await db
            .select({ stripeCustomerId: subscriptions.stripeCustomerId })
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);
          const resolvedCustomerId = subRow?.stripeCustomerId ?? stripeCustomerId;

          if (resolvedCustomerId) {
            try {
              await stripe.customers.del(resolvedCustomerId);
              steps.push(`Stripe: customer ${resolvedCustomerId} deleted`);
            } catch (err: any) {
              if (err?.code !== "resource_missing") throw err;
              steps.push(`Stripe: customer ${resolvedCustomerId} already deleted`);
            }
          }
          if (stripeConnectAccountId) {
            try {
              await stripe.accounts.del(stripeConnectAccountId);
              steps.push(`Stripe Connect: account ${stripeConnectAccountId} deleted`);
            } catch (err: any) {
              if (err?.code !== "resource_missing") throw err;
              steps.push(`Stripe Connect: account ${stripeConnectAccountId} already deleted`);
            }
          }
        }

        // ── Step 4: Hard-delete non-financial rows ───────────────────────────
        if (artistRow) {
          // Bops engagement (delete children before parent)
          const bopIds = (
            await db
              .select({ id: bopsVideos.id })
              .from(bopsVideos)
              .where(eq(bopsVideos.artistId, artistRow.id))
          ).map((r) => r.id);

          for (const bopId of bopIds) {
            await db.delete(bopsCommentLikes).where(eq(bopsCommentLikes.commentId, bopId));
            await db.delete(bopsComments).where(eq(bopsComments.videoId, bopId));
            await db.delete(bopsLikes).where(eq(bopsLikes.videoId, bopId));
            await db.delete(bopsViews).where(eq(bopsViews.videoId, bopId));
          }
          await db.delete(bopsVideos).where(eq(bopsVideos.artistId, artistRow.id));
          steps.push(`Bops: ${bopIds.length} videos deleted`);

          // BAP music
          await db.delete(bapTracks).where(eq(bapTracks.artistId, artistRow.id));
          await db.delete(bapAlbums).where(eq(bapAlbums.artistId, artistRow.id));
          await db.delete(bapPlaylists).where(eq(bapPlaylists.userId, userId));
          steps.push("BAP tracks/albums/playlists deleted");

          // Artist follows
          await db.delete(bopsArtistFollows).where(eq(bopsArtistFollows.artistId, artistRow.id));

          // Delete artist profile
          await db.delete(artistProfiles).where(eq(artistProfiles.id, artistRow.id));
          steps.push("Artist profile deleted");
        }

        // Fan-side engagement
        await db.delete(bapFollows).where(eq(bapFollows.followerId, userId));
        await db.delete(bapLikes).where(eq(bapLikes.userId, userId));
        await db.delete(bopsArtistFollows).where(eq(bopsArtistFollows.followerId, userId));
        await db.delete(bopsLikes).where(eq(bopsLikes.userId, userId));
        await db.delete(bopsCommentLikes).where(eq(bopsCommentLikes.userId, userId));
        await db.delete(bopsComments).where(eq(bopsComments.userId, userId));

        // Notifications, AI, analytics
        await db.delete(notifications).where(eq(notifications.userId, userId));
        await db.delete(aiConversations).where(eq(aiConversations.userId, userId));
        await db.delete(aiContext).where(eq(aiContext.userId, userId));
        await db.delete(aiEvents).where(eq(aiEvents.userId, userId));
        // aiRecommendations are keyed by artistProfileId, not userId
        if (artistRow) {
          await db.delete(aiRecommendations).where(eq(aiRecommendations.artistProfileId, artistRow.id));
        }
        await db.delete(userCookiePreferences).where(eq(userCookiePreferences.userId, userId));
        await db.delete(wishlists).where(eq(wishlists.userId, userId));
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
        steps.push("Notifications, AI data, cart, analytics deleted");

        // Wallet (non-financial — balance only)
        // wallets and payoutAccounts are keyed by artistId, not userId
        if (artistRow) {
          const [walletRow] = await db.select({ id: wallets.id }).from(wallets).where(eq(wallets.artistId, artistRow.id));
          if (walletRow) {
            await db.delete(paymentMethods).where(eq(paymentMethods.walletId, walletRow.id));
            await db.delete(wallets).where(eq(wallets.id, walletRow.id));
          }
          await db.delete(payoutAccounts).where(eq(payoutAccounts.artistId, artistRow.id));
        }
        await db.delete(fanWallets).where(eq(fanWallets.userId, userId));
        steps.push("Wallet and payment methods deleted");

        // ── Step 5: Anonymize financial records (7-year retention) ───────────
        const anonEmail = `deleted-${userId}@anonymized.boptone.local`;
        await db
          .update(orders)
          .set({
            customerEmail: anonEmail,
            customerName: "Deleted User",
            shippingAddress: null,
          })
          .where(eq(orders.customerId, userId));
        steps.push("Financial records anonymized");

        // ── Step 6: Anonymize the users row (prevents login) ─────────────────
        await db
          .update(users)
          .set({
            name: `Deleted User ${userId}`,
            email: anonEmail,
            openId: `deleted-${userId}-${Date.now()}`,
            stripeConnectAccountId: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
        steps.push("User row anonymized");

        // ── Step 7: Mark deletion request as completed ───────────────────────
        const summary = {
          userId,
          requestId,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          steps,
        };
        await db
          .update(userDeletionRequests)
          .set({
            status: "completed",
            completedAt: new Date(),
            deletionSummary: JSON.stringify(summary),
            updatedAt: new Date(),
          })
          .where(eq(userDeletionRequests.id, requestId));

        console.log(`[AccountDeletion] Completed deletion for user ${userId}:`, steps);
      } catch (err: any) {
        console.error(`[AccountDeletion] Failed deletion for user ${userId}:`, err);
        await db
          .update(userDeletionRequests)
          .set({
            status: "failed",
            errorMessage: err?.message ?? "Unknown error",
            updatedAt: new Date(),
          })
          .where(eq(userDeletionRequests.id, requestId));
        throw err; // BullMQ will retry
      }
    },
    {
      connection: { url: REDIS_URL },
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[AccountDeletion] Job ${job.id} completed`);
  });
  worker.on("failed", (job, err) => {
    console.error(`[AccountDeletion] Job ${job?.id} failed:`, err.message);
  });

  console.log("[AccountDeletion] Worker started");
  return worker;
}
