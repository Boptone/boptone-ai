/**
 * Admin Content Moderation Router
 * Provides procedures for reviewing flagged content, issuing strikes, and managing appeals.
 * All procedures are admin-only (role === 'admin').
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

/** Middleware that enforces admin-only access */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const moderationRouter = router({
  /**
   * Get the full moderation queue with optional status filter
   */
  getQueue: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "under_review", "approved", "removed", "appealed", "appeal_approved", "appeal_rejected", "all"])
          .default("pending"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { contentModerationQueue, bapTracks, artistProfiles, users, aiDetectionResults } = await import("../../drizzle/schema");
      const { eq, desc, and, ne } = await import("drizzle-orm");

      const whereClause = input.status === "all"
        ? undefined
        : eq(contentModerationQueue.status, input.status as any);

      const rows = await db
        .select({
          id: contentModerationQueue.id,
          trackId: contentModerationQueue.trackId,
          artistId: contentModerationQueue.artistId,
          flagReason: contentModerationQueue.flagReason,
          flagDetails: contentModerationQueue.flagDetails,
          status: contentModerationQueue.status,
          reviewNotes: contentModerationQueue.reviewNotes,
          reviewedAt: contentModerationQueue.reviewedAt,
          strikeIssued: contentModerationQueue.strikeIssued,
          strikeNumber: contentModerationQueue.strikeNumber,
          flaggedAt: contentModerationQueue.flaggedAt,
          // Track info
          trackTitle: bapTracks.title,
          trackArtist: bapTracks.artist,
          trackAudioUrl: bapTracks.audioUrl,
          // Artist info
          artistName: artistProfiles.stageName,
          artistUserId: artistProfiles.userId,
          // Reviewer info
          reviewedBy: contentModerationQueue.reviewedBy,
        })
        .from(contentModerationQueue)
        .leftJoin(bapTracks, eq(contentModerationQueue.trackId, bapTracks.id))
        .leftJoin(artistProfiles, eq(contentModerationQueue.artistId, artistProfiles.id))
        .where(whereClause)
        .orderBy(desc(contentModerationQueue.flaggedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count for pagination
      const { count } = await import("drizzle-orm");
      const [{ total }] = await db
        .select({ total: count() })
        .from(contentModerationQueue)
        .where(whereClause);

      return { items: rows, total: Number(total) };
    }),

  /**
   * Get a single moderation queue item with full detail
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { contentModerationQueue, bapTracks, artistProfiles, aiDetectionResults, artistStrikeHistory } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const [item] = await db
        .select()
        .from(contentModerationQueue)
        .leftJoin(bapTracks, eq(contentModerationQueue.trackId, bapTracks.id))
        .leftJoin(artistProfiles, eq(contentModerationQueue.artistId, artistProfiles.id))
        .where(eq(contentModerationQueue.id, input.id))
        .limit(1);

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Moderation item not found" });
      }

      // Get AI detection result if linked
      let aiDetection = null;
      if (item.content_moderation_queue.aiDetectionId) {
        const [det] = await db
          .select()
          .from(aiDetectionResults)
          .where(eq(aiDetectionResults.id, item.content_moderation_queue.aiDetectionId))
          .limit(1);
        aiDetection = det ?? null;
      }

      // Get strike history for this artist
      const strikes = await db
        .select()
        .from(artistStrikeHistory)
        .where(eq(artistStrikeHistory.artistId, item.content_moderation_queue.artistId))
        .orderBy(artistStrikeHistory.issuedAt);

      return {
        ...item.content_moderation_queue,
        track: item.bap_tracks,
        artistProfile: item.artist_profiles,
        aiDetection,
        strikes,
      };
    }),

  /**
   * Approve content — mark as legitimate, no action taken
   */
  approve: adminProcedure
    .input(
      z.object({
        id: z.number(),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { contentModerationQueue } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(contentModerationQueue)
        .set({
          status: "approved",
          reviewedBy: ctx.user.id,
          reviewNotes: input.reviewNotes ?? null,
          reviewedAt: new Date(),
        })
        .where(eq(contentModerationQueue.id, input.id));

      return { success: true };
    }),

  /**
   * Remove content — mark as removed for policy violation
   */
  remove: adminProcedure
    .input(
      z.object({
        id: z.number(),
        reviewNotes: z.string().min(1, "Review notes are required when removing content"),
        issueStrike: z.boolean().default(false),
        strikeReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { contentModerationQueue, bapTracks, artistProfiles, artistStrikeHistory } = await import("../../drizzle/schema");
      const { eq, count } = await import("drizzle-orm");

      // Get the queue item
      const [item] = await db
        .select()
        .from(contentModerationQueue)
        .where(eq(contentModerationQueue.id, input.id))
        .limit(1);

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Moderation item not found" });
      }

      // Update queue status
      await db
        .update(contentModerationQueue)
        .set({
          status: "removed",
          reviewedBy: ctx.user.id,
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date(),
          strikeIssued: input.issueStrike,
        })
        .where(eq(contentModerationQueue.id, input.id));

      // Remove the track from BAP
      await db
        .update(bapTracks)
        .set({ status: "removed" as any })
        .where(eq(bapTracks.id, item.trackId));

      let strikeResult = null;
      if (input.issueStrike) {
        // Count existing strikes for this artist
        const [{ strikeCount }] = await db
          .select({ strikeCount: count() })
          .from(artistStrikeHistory)
          .where(eq(artistStrikeHistory.artistId, item.artistId));

        const nextStrikeNumber = Number(strikeCount) + 1;

        // Determine penalty
        let penalty: "warning" | "suspension" | "permanent_ban" = "warning";
        let suspensionEndsAt: Date | null = null;

        if (nextStrikeNumber === 2) {
          penalty = "suspension";
          suspensionEndsAt = new Date();
          suspensionEndsAt.setDate(suspensionEndsAt.getDate() + 30);
        } else if (nextStrikeNumber >= 3) {
          penalty = "permanent_ban";
        }

        // Insert strike record
        await db.insert(artistStrikeHistory).values({
          artistId: item.artistId,
          strikeNumber: nextStrikeNumber,
          reason: input.strikeReason ?? input.reviewNotes,
          trackId: item.trackId,
          moderationQueueId: item.id,
          penalty,
          suspensionEndsAt,
          issuedBy: ctx.user.id,
        });

        // Update queue with strike number
        await db
          .update(contentModerationQueue)
          .set({ strikeNumber: nextStrikeNumber })
          .where(eq(contentModerationQueue.id, input.id));

        // Suspend artist if strike 2
        if (penalty === "suspension" && suspensionEndsAt) {
          // Store suspension status in metadata since artistProfiles has no status enum
          const currentMeta = (item as any).artistMetadata || {};
          await db
            .update(artistProfiles)
            .set({ metadata: { ...currentMeta, accountStatus: 'suspended', suspensionEndsAt: suspensionEndsAt?.toISOString() } })
            .where(eq(artistProfiles.id, item.artistId));
        }

        // Ban artist if strike 3
        if (penalty === "permanent_ban") {
          const currentMeta = (item as any).artistMetadata || {};
          await db
            .update(artistProfiles)
            .set({ metadata: { ...currentMeta, accountStatus: 'banned' } })
            .where(eq(artistProfiles.id, item.artistId));
        }

        strikeResult = { strikeNumber: nextStrikeNumber, penalty };
      }

      return { success: true, strikeResult };
    }),

  /**
   * Mark item as under review (claim it)
   */
  claimForReview: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { contentModerationQueue } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(contentModerationQueue)
        .set({ status: "under_review", reviewedBy: ctx.user.id })
        .where(eq(contentModerationQueue.id, input.id));

      return { success: true };
    }),

  /**
   * Get strike history for a specific artist
   */
  getArtistStrikes: adminProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { artistStrikeHistory, bapTracks, users } = await import("../../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");

      const strikes = await db
        .select({
          id: artistStrikeHistory.id,
          strikeNumber: artistStrikeHistory.strikeNumber,
          reason: artistStrikeHistory.reason,
          penalty: artistStrikeHistory.penalty,
          suspensionEndsAt: artistStrikeHistory.suspensionEndsAt,
          issuedAt: artistStrikeHistory.issuedAt,
          appealStatus: artistStrikeHistory.appealStatus,
          appealReason: artistStrikeHistory.appealReason,
          appealedAt: artistStrikeHistory.appealedAt,
          appealNotes: artistStrikeHistory.appealNotes,
          trackTitle: bapTracks.title,
          issuerName: users.name,
        })
        .from(artistStrikeHistory)
        .leftJoin(bapTracks, eq(artistStrikeHistory.trackId, bapTracks.id))
        .leftJoin(users, eq(artistStrikeHistory.issuedBy, users.id))
        .where(eq(artistStrikeHistory.artistId, input.artistId))
        .orderBy(desc(artistStrikeHistory.issuedAt));

      return strikes;
    }),

  /**
   * Review an appeal — approve or reject
   */
  reviewAppeal: adminProcedure
    .input(
      z.object({
        strikeId: z.number(),
        decision: z.enum(["approved", "rejected"]),
        notes: z.string().min(1, "Notes are required for appeal decisions"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { artistStrikeHistory, artistProfiles } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const [strike] = await db
        .select()
        .from(artistStrikeHistory)
        .where(eq(artistStrikeHistory.id, input.strikeId))
        .limit(1);

      if (!strike) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Strike not found" });
      }

      await db
        .update(artistStrikeHistory)
        .set({
          appealStatus: input.decision,
          appealNotes: input.notes,
          appealReviewedBy: ctx.user.id,
          appealReviewedAt: new Date(),
        })
        .where(eq(artistStrikeHistory.id, input.strikeId));

      // If appeal approved and artist was suspended/banned, restore them via metadata
      if (input.decision === "approved" && (strike.penalty === "suspension" || strike.penalty === "permanent_ban")) {
        // Restore account status in metadata (artistProfiles has no status enum column)
        const [currentProfile] = await db
          .select({ metadata: artistProfiles.metadata })
          .from(artistProfiles)
          .where(eq(artistProfiles.id, strike.artistId))
          .limit(1);
        const currentMeta = (currentProfile?.metadata as Record<string, any>) || {};
        await db
          .update(artistProfiles)
          .set({ metadata: { ...currentMeta, accountStatus: 'active', suspensionEndsAt: null } })
          .where(eq(artistProfiles.id, strike.artistId));
      }

      return { success: true };
    }),

  /**
   * Get moderation stats for the dashboard header
   */
  getStats: adminProcedure.query(async () => {
    const { getDb } = await import("../db");
    const db = await getDb();
    if (!db) return { pending: 0, underReview: 0, resolvedToday: 0, totalStrikes: 0 };

    const { contentModerationQueue, artistStrikeHistory } = await import("../../drizzle/schema");
    const { eq, gte, count } = await import("drizzle-orm");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingResult, underReviewResult, resolvedTodayResult, totalStrikesResult] = await Promise.all([
      db.select({ n: count() }).from(contentModerationQueue).where(eq(contentModerationQueue.status, "pending")),
      db.select({ n: count() }).from(contentModerationQueue).where(eq(contentModerationQueue.status, "under_review")),
      db.select({ n: count() }).from(contentModerationQueue).where(gte(contentModerationQueue.reviewedAt, today)),
      db.select({ n: count() }).from(artistStrikeHistory),
    ]);

    return {
      pending: Number(pendingResult[0]?.n ?? 0),
      underReview: Number(underReviewResult[0]?.n ?? 0),
      resolvedToday: Number(resolvedTodayResult[0]?.n ?? 0),
      totalStrikes: Number(totalStrikesResult[0]?.n ?? 0),
    };
  }),
});
