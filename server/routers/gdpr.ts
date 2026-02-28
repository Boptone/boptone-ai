/**
 * GDPR / CCPA / PIPL Compliance Router
 *
 * Implements:
 * - GDPR Art. 17: Right to erasure ("right to be forgotten")
 * - GDPR Art. 20: Right to data portability
 * - CCPA: Right to delete personal information
 * - PIPL (China): Right to request deletion
 *
 * Deletion is a 30-day delayed pipeline:
 *   1. User requests deletion → creates userDeletionRequest record + schedules BullMQ job
 *   2. User has 30 days to cancel
 *   3. On scheduled date → accountDeletionWorker executes full erasure
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  users,
  artistProfiles,
  products,
  orders,
  productReviews,
  bopsVideos,
  bapTracks,
  bapAlbums,
  bapFollows,
  bapLikes,
  bopsLikes,
  bopsComments,
  bopsArtistFollows,
  notifications,
  wallets,
  payoutAccounts,
  earningsBalance,
  userDeletionRequests,
} from "../../drizzle/schema";
import { storagePut } from "../storage";
import {
  scheduleAccountDeletion,
  cancelAccountDeletion,
} from "../workers/accountDeletionWorker";

// 30 days in milliseconds
const DELETION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export const gdprRouter = router({
  /**
   * Request account deletion (GDPR Art. 17 / CCPA)
   * Schedules deletion 30 days from now. User can cancel during the grace period.
   */
  requestDeletion: protectedProcedure
    .input(
      z.object({
        confirmText: z.string().refine((val) => val === "DELETE MY ACCOUNT", {
          message: "Must type 'DELETE MY ACCOUNT' to confirm",
        }),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.id;

      // Check for existing pending/processing request
      const [existing] = await db
        .select()
        .from(userDeletionRequests)
        .where(
          and(
            eq(userDeletionRequests.userId, userId),
            eq(userDeletionRequests.status, "pending")
          )
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A deletion request is already pending. Scheduled for ${existing.scheduledAt.toISOString()}. You can cancel it before then.`,
        });
      }

      const scheduledAt = new Date(Date.now() + DELETION_GRACE_PERIOD_MS);

      // Create the deletion request record
      const [result] = await db.insert(userDeletionRequests).values({
        userId,
        status: "pending",
        scheduledAt,
        requestedAt: new Date(),
        updatedAt: new Date(),
      });

      const requestId = (result as any).insertId as number;

      // Get user data needed for the deletion job
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      // Schedule the BullMQ job
      const jobId = await scheduleAccountDeletion(
        {
          userId,
          requestId,
          userEmail: user?.email ?? null,
          stripeCustomerId: null, // resolved from subscriptions table inside the worker
          stripeConnectAccountId: user?.stripeConnectAccountId ?? null,
        },
        scheduledAt
      );

      // Save the BullMQ job ID for cancellation
      if (jobId) {
        await db
          .update(userDeletionRequests)
          .set({ jobId: jobId, updatedAt: new Date() })
          .where(eq(userDeletionRequests.id, requestId));
      }

      return {
        success: true,
        requestId,
        scheduledAt: scheduledAt.toISOString(),
        cancelDeadline: scheduledAt.toISOString(),
        message: `Your account is scheduled for deletion on ${scheduledAt.toLocaleDateString()}. You can cancel this request before then.`,
      };
    }),

  /**
   * Cancel a pending deletion request.
   */
  cancelDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user.id;

    const [request] = await db
      .select()
      .from(userDeletionRequests)
      .where(
        and(
          eq(userDeletionRequests.userId, userId),
          eq(userDeletionRequests.status, "pending")
        )
      )
      .limit(1);

    if (!request) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No pending deletion request found.",
      });
    }

    // Check grace period hasn't expired
    if (request.scheduledAt <= new Date()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The cancellation window has passed. Your account deletion is being processed.",
      });
    }

    // Cancel the BullMQ job
    if (request.jobId) {
      await cancelAccountDeletion(request.jobId);
    }

    // Mark as cancelled
    await db
      .update(userDeletionRequests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(userDeletionRequests.id, request.id));

    return {
      success: true,
      message: "Your account deletion request has been cancelled. Your account is safe.",
    };
  }),

  /**
   * Get the current deletion request status for the logged-in user.
   */
  getDeletionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user.id;

    const [request] = await db
      .select()
      .from(userDeletionRequests)
      .where(eq(userDeletionRequests.userId, userId))
      .orderBy(desc(userDeletionRequests.requestedAt))
      .limit(1);

    if (!request) return null;

    const daysRemaining =
      request.status === "pending"
        ? Math.max(0, Math.ceil((request.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    return {
      id: request.id,
      status: request.status,
      requestedAt: request.requestedAt.toISOString(),
      scheduledAt: request.scheduledAt.toISOString(),
      completedAt: request.completedAt?.toISOString() ?? null,
      daysRemaining,
      canCancel: request.status === "pending" && request.scheduledAt > new Date(),
    };
  }),

  /**
   * Export all user data (GDPR Art. 20: Right to data portability)
   * Generates a comprehensive JSON export and uploads to S3.
   */
  exportUserData: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user.id;

    // ── Collect all user data ────────────────────────────────────────────────
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    const [artistProfile] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId));

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, userId));

    const userReviews = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.userId, userId));

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    let artistData: Record<string, any> | null = null;
    if (artistProfile) {
      const [artistProducts, artistBops, artistTracks, artistAlbums, artistFollowers, artistWallet, artistBalance, artistPayoutAccounts] =
        await Promise.all([
          db.select().from(products).where(eq(products.artistId, artistProfile.id)),
          db.select().from(bopsVideos).where(eq(bopsVideos.artistId, artistProfile.id)),
          db.select().from(bapTracks).where(eq(bapTracks.artistId, artistProfile.id)),
          db.select().from(bapAlbums).where(eq(bapAlbums.artistId, artistProfile.id)),
          db.select().from(bopsArtistFollows).where(eq(bopsArtistFollows.artistId, artistProfile.id)),
          db.select().from(wallets).where(eq(wallets.artistId, artistProfile.id)),
          db.select().from(earningsBalance).where(eq(earningsBalance.artistId, artistProfile.id)),
          db.select().from(payoutAccounts).where(eq(payoutAccounts.artistId, artistProfile.id)),
        ]);

      artistData = {
        profile: {
          ...artistProfile,
          // Omit internal IDs from the export
          metadata: undefined,
        },
        products: artistProducts,
        bops: artistBops.map((b) => ({
          id: b.id,
          caption: b.caption,
          processingStatus: b.processingStatus,
          createdAt: b.createdAt,
        })),
        tracks: artistTracks.map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          duration: t.duration,
          genre: t.genre,
          createdAt: t.createdAt,
        })),
        albums: artistAlbums,
        followerCount: artistFollowers.length,
        wallet: artistWallet[0] ?? null,
        earningsBalance: artistBalance[0] ?? null,
        payoutAccounts: artistPayoutAccounts.map((pa) => ({
          id: pa.id,
          accountType: pa.accountType,
          bankName: pa.bankName,
          accountNumberLast4: pa.accountNumberLast4,
          isDefault: pa.isDefault,
          verificationStatus: pa.verificationStatus,
          createdAt: pa.createdAt,
        })),
        salesHistory: await db
          .select()
          .from(orders)
          .where(eq(orders.artistId, artistProfile.id)),
      };
    }

    // Fan-side data
    const [fanFollowing, fanLikes, bopsLiked, fanComments] = await Promise.all([
      db.select().from(bapFollows).where(eq(bapFollows.followerId, userId)),
      db.select().from(bapLikes).where(eq(bapLikes.userId, userId)),
      db.select().from(bopsLikes).where(eq(bopsLikes.userId, userId)),
      db.select().from(bopsComments).where(eq(bopsComments.userId, userId)),
    ]);

    // ── Compile export ───────────────────────────────────────────────────────
    const dataExport = {
      exportDate: new Date().toISOString(),
      exportType: "GDPR / CCPA Data Portability Request",
      legalBasis: "GDPR Article 20 — Right to Data Portability",
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      },
      orders: userOrders,
      reviews: userReviews,
      notifications: userNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      fanActivity: {
        following: fanFollowing,
        bapLikes: fanLikes,
        bopsLikes: bopsLiked,
        comments: fanComments,
      },
      artist: artistData,
    };

    // ── Upload to S3 ─────────────────────────────────────────────────────────
    const exportJson = JSON.stringify(dataExport, null, 2);
    const fileName = `gdpr-export-${userId}-${Date.now()}.json`;

    const { url } = await storagePut(
      `gdpr-exports/${fileName}`,
      Buffer.from(exportJson, "utf-8"),
      "application/json"
    );

    return {
      success: true,
      downloadUrl: url,
      exportedAt: new Date().toISOString(),
      fileSizeBytes: Buffer.byteLength(exportJson, "utf-8"),
      message: "Your data export is ready. This link is valid for 7 days.",
    };
  }),

  /**
   * Get GDPR data processing status — what data is collected and on what legal basis.
   */
  getDataProcessingStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user.id;
    const [artistProfile] = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId));

    return {
      personalData: {
        collected: ["name", "email", "login method", "IP address", "browser data"],
        legalBasis: "Contract performance (Terms of Service)",
        retentionPeriod: "Duration of account + 7 years for business records",
      },
      artistData: artistProfile
        ? {
            collected: [
              "artist profile",
              "music tracks",
              "Bops videos",
              "products",
              "sales data",
              "Stripe Connect account",
              "earnings balance",
            ],
            legalBasis: "Contract performance (Artist Agreement)",
            retentionPeriod: "Duration of account + 7 years for tax/financial records",
          }
        : null,
      marketingData: {
        collected: ["email marketing preferences"],
        legalBasis: "Consent (can be withdrawn anytime)",
        retentionPeriod: "Until consent withdrawn",
      },
      analyticsData: {
        collected: ["page views", "session data", "device information"],
        legalBasis: "Legitimate interest (platform improvement)",
        retentionPeriod: "26 months",
      },
      rights: [
        "Right to access your data (export)",
        "Right to rectify inaccurate data",
        "Right to erasure (delete account — 30-day grace period)",
        "Right to data portability (JSON export)",
        "Right to restrict processing",
        "Right to object to processing",
        "Right to withdraw consent",
      ],
      applicableLaws: ["GDPR (EU)", "CCPA (California)", "PIPL (China)"],
    };
  }),
});
