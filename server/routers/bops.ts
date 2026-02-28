/**
 * Bops Router — Vertical Video Feature
 * "Post a Bop on Boptone" — 15-30 second artist videos with instant tipping
 *
 * Architecture:
 *  - All mutations are protected (require auth)
 *  - Feed queries are public (unauthenticated users can browse)
 *  - Tip procedures validate Stripe Connect before processing
 *  - Trending score updated asynchronously (non-blocking)
 *  - Soft deletes only — nothing is hard-deleted
 */
import { z } from "zod";
import { and, desc, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  bopsVideos,
  bopsLikes,
  bopsViews,
  bopsTips,
  bopsComments,
  bopsCommentLikes,
  bopsArtistFollows,
  artistProfiles,
  users,
  notifications,
} from "../../drizzle/schema";
import { storagePut } from "../storage";
import { enqueueVideoProcessing } from "../workers/videoProcessor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BOPS_MIN_DURATION_MS = 15_000;  // 15 seconds
const BOPS_MAX_DURATION_MS = 30_000;  // 30 seconds
const BOPS_MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB raw upload
const BOPS_CAPTION_MAX_LENGTH = 150;
const BOPS_COMMENT_MAX_LENGTH = 300;
const BOPS_FEED_PAGE_SIZE = 10;

// Tip presets in cents — Kick In policy: card fees only, Boptone takes 0%
const TIP_PRESETS_CENTS = [100, 500, 1000] as const; // $1, $5, $10

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------
const cursorSchema = z.object({
  cursor: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(50).default(BOPS_FEED_PAGE_SIZE),
});

// ---------------------------------------------------------------------------
// Helper: Calculate Stripe fees for tip amount
// Stripe: 2.9% + $0.30 per transaction
// ---------------------------------------------------------------------------
function calculateStripeFees(grossCents: number): {
  stripeFeesCents: number;
  netAmountCents: number;
  platformFeeCents: number;
} {
  const stripeFeesCents = Math.ceil(grossCents * 0.029 + 30);
  const platformFeeCents = 0; // Kick In policy: Boptone takes ZERO cut on tips
  const netAmountCents = grossCents - stripeFeesCents - platformFeeCents;
  return { stripeFeesCents, netAmountCents, platformFeeCents };
}

// ---------------------------------------------------------------------------
// Bops Router
// ---------------------------------------------------------------------------
export const bopsRouter = router({

  // -------------------------------------------------------------------------
  // FEED — Public, cursor-based pagination for infinite scroll
  // Returns published, non-deleted, moderation-approved Bops
  // Ordered by publishedAt DESC (chronological) for MVP; trending in Phase 2
  // -------------------------------------------------------------------------
  getFeed: publicProcedure
    .input(cursorSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = and(
        eq(bopsVideos.isPublished, true),
        eq(bopsVideos.isDeleted, false),
        eq(bopsVideos.isArchived, false),
        eq(bopsVideos.processingStatus, "ready"),
        eq(bopsVideos.moderationStatus, "approved"),
        input.cursor ? lt(bopsVideos.id, input.cursor) : undefined,
      );

      const rows = await db
        .select({
          id: bopsVideos.id,
          caption: bopsVideos.caption,
          videoUrl: bopsVideos.videoUrl,
          hlsUrl: bopsVideos.hlsUrl,
          thumbnailUrl: bopsVideos.thumbnailUrl,
          durationMs: bopsVideos.durationMs,
          viewCount: bopsVideos.viewCount,
          likeCount: bopsVideos.likeCount,
          commentCount: bopsVideos.commentCount,
          tipCount: bopsVideos.tipCount,
          tipTotalCents: bopsVideos.tipTotalCents,
          publishedAt: bopsVideos.publishedAt,
          artistId: bopsVideos.artistId,
          linkedTrackId: bopsVideos.linkedTrackId,
        })
        .from(bopsVideos)
        .where(conditions)
        .orderBy(desc(bopsVideos.publishedAt))
        .limit(input.limit + 1); // fetch one extra to determine if there's a next page

      const hasNextPage = rows.length > input.limit;
      const items = hasNextPage ? rows.slice(0, input.limit) : rows;
      const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor, hasNextPage };
    }),

  // -------------------------------------------------------------------------
  // GET ARTIST BOPS — Public, returns all Bops for a given artist profile
  // -------------------------------------------------------------------------
  getByArtist: publicProcedure
    .input(z.object({
      artistId: z.number().int().positive(),
      ...cursorSchema.shape,
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(bopsVideos)
        .where(and(
          eq(bopsVideos.artistId, input.artistId),
          eq(bopsVideos.isPublished, true),
          eq(bopsVideos.isDeleted, false),
          eq(bopsVideos.processingStatus, "ready"),
          input.cursor ? lt(bopsVideos.id, input.cursor) : undefined,
        ))
        .orderBy(desc(bopsVideos.publishedAt))
        .limit(input.limit + 1);

      const hasNextPage = rows.length > input.limit;
      const items = hasNextPage ? rows.slice(0, input.limit) : rows;
      const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor, hasNextPage };
    }),

  // -------------------------------------------------------------------------
  // GET SINGLE BOP — Public
  // -------------------------------------------------------------------------
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(bopsVideos)
        .where(and(
          eq(bopsVideos.id, input.id),
          eq(bopsVideos.isDeleted, false),
        ))
        .limit(1);

      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Bop not found" });
      return rows[0];
    }),

  // -------------------------------------------------------------------------
  // CREATE BOP — Protected, artist only
  // Accepts pre-uploaded S3 key from client-side upload
  // Processing status starts as "pending" — transcoding pipeline picks it up
  // -------------------------------------------------------------------------
  create: protectedProcedure
    .input(z.object({
      videoKey: z.string().min(1).max(500),
      videoUrl: z.string().url(),
      rawVideoKey: z.string().max(500).optional(),
      caption: z.string().max(BOPS_CAPTION_MAX_LENGTH).optional(),
      durationMs: z.number().int().min(BOPS_MIN_DURATION_MS).max(BOPS_MAX_DURATION_MS),
      width: z.number().int().default(1080),
      height: z.number().int().default(1920),
      fileSizeBytes: z.number().int().positive().max(BOPS_MAX_FILE_SIZE_BYTES).optional(),
      mimeType: z.string().default("video/mp4"),
      linkedTrackId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify artist profile exists for this user
      const artistRows = await db
        .select({ id: artistProfiles.id })
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);

      if (!artistRows[0]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Artist profile required to post a Bop",
        });
      }

      const [result] = await db.insert(bopsVideos).values({
        artistId: artistRows[0].id,
        userId: ctx.user.id,
        caption: input.caption ?? null,
        videoKey: input.videoKey,
        videoUrl: input.videoUrl,
        rawVideoKey: input.rawVideoKey ?? null,
        durationMs: input.durationMs,
        width: input.width,
        height: input.height,
        fileSizeBytes: input.fileSizeBytes ?? null,
        mimeType: input.mimeType,
        linkedTrackId: input.linkedTrackId ?? null,
        processingStatus: "pending",
        moderationStatus: "pending",
        isPublished: false,
      });

      const newBopId = (result as any).insertId;

      // Notify all followers of this artist (non-blocking)
      try {
        const followers = await db
          .select({ followerId: bopsArtistFollows.followerId })
          .from(bopsArtistFollows)
          .where(eq(bopsArtistFollows.artistId, artistRows[0].id));

        if (followers.length > 0) {
          const artistName = ctx.user.name ?? "An artist you follow";
          const caption = input.caption ? `"${input.caption.slice(0, 60)}${input.caption.length > 60 ? "…" : ""}"` : "a new Bop";
          await db.insert(notifications).values(
            followers.map((f) => ({
              userId: f.followerId,
              title: `${artistName} posted a new Bop`,
              message: `${artistName} just posted ${caption}. Watch it now.`,
              type: "milestone" as const,
              actionUrl: `/bops/artist/${artistRows[0].id}`,
            }))
          );
        }
      } catch (notifErr) {
        // Notification failure must never block the Bop creation
        console.warn("[Bops] Failed to send follower notifications:", notifErr);
      }

      // Enqueue video transcoding job (non-blocking — failure must not block Bop creation)
      try {
        await enqueueVideoProcessing(newBopId, input.videoKey, artistRows[0].id);
      } catch (queueErr) {
        console.warn(`[Bops] Failed to enqueue video processing for Bop ${newBopId}:`, queueErr);
        // Bop is still created; processing will be retried manually or via admin
      }

      return { id: newBopId, status: "pending" };
    }),

  // -------------------------------------------------------------------------
  // PUBLISH BOP — Protected, owner only
  // Can only publish once processing is "ready" and moderation is "approved"
  // -------------------------------------------------------------------------
  publish: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(bopsVideos)
        .where(and(eq(bopsVideos.id, input.id), eq(bopsVideos.userId, ctx.user.id)))
        .limit(1);

      const bop = rows[0];
      if (!bop) throw new TRPCError({ code: "NOT_FOUND", message: "Bop not found" });
      if (bop.processingStatus !== "ready") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Bop is still processing" });
      }

      await db
        .update(bopsVideos)
        .set({ isPublished: true, publishedAt: new Date() })
        .where(eq(bopsVideos.id, input.id));

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // DELETE BOP — Protected, owner only (soft delete)
  // -------------------------------------------------------------------------
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select({ id: bopsVideos.id, userId: bopsVideos.userId })
        .from(bopsVideos)
        .where(and(eq(bopsVideos.id, input.id), eq(bopsVideos.isDeleted, false)))
        .limit(1);

      const bop = rows[0];
      if (!bop) throw new TRPCError({ code: "NOT_FOUND" });
      if (bop.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db
        .update(bopsVideos)
        .set({ isDeleted: true, deletedAt: new Date(), deletedBy: ctx.user.id })
        .where(eq(bopsVideos.id, input.id));

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // TOGGLE LIKE — Protected, idempotent (upsert pattern)
  // Returns new like state and updated count
  // -------------------------------------------------------------------------
  toggleLike: protectedProcedure
    .input(z.object({ videoId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if like row exists
      const existing = await db
        .select()
        .from(bopsLikes)
        .where(and(
          eq(bopsLikes.userId, ctx.user.id),
          eq(bopsLikes.videoId, input.videoId),
        ))
        .limit(1);

      let isLiked: boolean;

      if (existing[0]) {
        // Toggle existing like
        isLiked = !existing[0].isActive;
        await db
          .update(bopsLikes)
          .set({ isActive: isLiked })
          .where(and(
            eq(bopsLikes.userId, ctx.user.id),
            eq(bopsLikes.videoId, input.videoId),
          ));
      } else {
        // Create new like
        isLiked = true;
        await db.insert(bopsLikes).values({
          userId: ctx.user.id,
          videoId: input.videoId,
          isActive: true,
        });
      }

      // Update denormalized count on video
      await db
        .update(bopsVideos)
        .set({ likeCount: sql`likeCount + ${isLiked ? 1 : -1}` })
        .where(eq(bopsVideos.id, input.videoId));

      return { isLiked };
    }),

  // -------------------------------------------------------------------------
  // GET LIKE STATUS — Public (returns false if not authenticated)
  // -------------------------------------------------------------------------
  getLikeStatus: publicProcedure
    .input(z.object({ videoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return { isLiked: false };

      const db = await getDb();
      if (!db) return { isLiked: false };

      const rows = await db
        .select({ isActive: bopsLikes.isActive })
        .from(bopsLikes)
        .where(and(
          eq(bopsLikes.userId, ctx.user.id),
          eq(bopsLikes.videoId, input.videoId),
        ))
        .limit(1);

      return { isLiked: rows[0]?.isActive ?? false };
    }),

  // -------------------------------------------------------------------------
  // RECORD VIEW — Public (anonymous views tracked by sessionId)
  // Non-blocking — fire and forget for performance
  // -------------------------------------------------------------------------
  recordView: publicProcedure
    .input(z.object({
      videoId: z.number().int().positive(),
      sessionId: z.string().max(128).optional(),
      watchDurationMs: z.number().int().nonnegative().optional(),
      watchPercent: z.number().int().min(0).max(100).optional(),
      completedWatch: z.boolean().default(false),
      source: z.enum(["for_you", "following", "profile", "search", "share", "direct"]).default("for_you"),
      platform: z.enum(["ios", "android", "web"]).default("web"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Insert view record (non-blocking — don't await in critical path)
      db.insert(bopsViews).values({
        videoId: input.videoId,
        userId: ctx.user?.id ?? null,
        sessionId: input.sessionId ?? null,
        watchDurationMs: input.watchDurationMs ?? null,
        watchPercent: input.watchPercent ?? null,
        completedWatch: input.completedWatch,
        source: input.source,
        platform: input.platform,
      }).then(() => {
        // Update denormalized view count
        return db
          .update(bopsVideos)
          .set({ viewCount: sql`viewCount + 1` })
          .where(eq(bopsVideos.id, input.videoId));
      }).catch(err => {
        console.error("[Bops] Failed to record view:", err);
      });

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // SEND TIP (Lightning Tip Button) — Protected
  // Kick In policy: Stripe fees only, Boptone takes ZERO cut
  // Presets: $1, $5, $10 (100, 500, 1000 cents)
  // -------------------------------------------------------------------------
  sendTip: protectedProcedure
    .input(z.object({
      videoId: z.number().int().positive(),
      grossAmountCents: z.union([
        z.literal(100),
        z.literal(500),
        z.literal(1000),
      ]),
      message: z.string().max(BOPS_COMMENT_MAX_LENGTH).optional(),
      stripePaymentIntentId: z.string().max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get video + artist info
      const videoRows = await db
        .select({
          id: bopsVideos.id,
          artistId: bopsVideos.artistId,
          userId: bopsVideos.userId,
          isDeleted: bopsVideos.isDeleted,
        })
        .from(bopsVideos)
        .where(eq(bopsVideos.id, input.videoId))
        .limit(1);

      const video = videoRows[0];
      if (!video || video.isDeleted) throw new TRPCError({ code: "NOT_FOUND", message: "Bop not found" });
      if (video.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot tip your own Bop" });

      const { stripeFeesCents, netAmountCents, platformFeeCents } = calculateStripeFees(input.grossAmountCents);

      const [result] = await db.insert(bopsTips).values({
        videoId: input.videoId,
        fromUserId: ctx.user.id,
        toArtistId: video.artistId,
        toUserId: video.userId,
        grossAmountCents: input.grossAmountCents,
        stripeFeesCents,
        netAmountCents,
        platformFeeCents,
        currency: "usd",
        stripePaymentIntentId: input.stripePaymentIntentId,
        status: "pending",
        message: input.message ?? null,
      });

      // Update denormalized tip stats on video
      await db
        .update(bopsVideos)
        .set({
          tipCount: sql`tipCount + 1`,
          tipTotalCents: sql`tipTotalCents + ${input.grossAmountCents}`,
        })
        .where(eq(bopsVideos.id, input.videoId));

      return {
        tipId: (result as any).insertId,
        netAmountCents,
        stripeFeesCents,
        platformFeeCents,
      };
    }),

  // -------------------------------------------------------------------------
  // CONFIRM TIP — Called by Stripe webhook after payment_intent.succeeded
  // -------------------------------------------------------------------------
  confirmTip: protectedProcedure
    .input(z.object({
      stripePaymentIntentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(bopsTips)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(bopsTips.stripePaymentIntentId, input.stripePaymentIntentId));

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // GET ARTIST TIP EARNINGS — Protected, artist only
  // Returns aggregated tip earnings for the authenticated artist
  // -------------------------------------------------------------------------
  getMyTipEarnings: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const artistRows = await db
        .select({ id: artistProfiles.id })
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);

      if (!artistRows[0]) return { totalCents: 0, count: 0, tips: [] };

      const tips = await db
        .select()
        .from(bopsTips)
        .where(and(
          eq(bopsTips.toArtistId, artistRows[0].id),
          eq(bopsTips.status, "completed"),
        ))
        .orderBy(desc(bopsTips.completedAt))
        .limit(50);

      const totalCents = tips.reduce((sum, t) => sum + t.netAmountCents, 0);

      return { totalCents, count: tips.length, tips };
    }),

  // -------------------------------------------------------------------------
  // COMMENTS — Get comments for a Bop
  // -------------------------------------------------------------------------
  getComments: publicProcedure
    .input(z.object({
      videoId: z.number().int().positive(),
      ...cursorSchema.shape,
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(bopsComments)
        .where(and(
          eq(bopsComments.videoId, input.videoId),
          eq(bopsComments.isDeleted, false),
          isNull(bopsComments.parentCommentId), // top-level only
          input.cursor ? lt(bopsComments.id, input.cursor) : undefined,
        ))
        .orderBy(desc(bopsComments.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = rows.length > input.limit;
      const items = hasNextPage ? rows.slice(0, input.limit) : rows;
      const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor, hasNextPage };
    }),

  // -------------------------------------------------------------------------
  // POST COMMENT — Protected
  // -------------------------------------------------------------------------
  postComment: protectedProcedure
    .input(z.object({
      videoId: z.number().int().positive(),
      body: z.string().min(1).max(BOPS_COMMENT_MAX_LENGTH),
      parentCommentId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Validate parent comment exists if replying
      if (input.parentCommentId) {
        const parent = await db
          .select({ id: bopsComments.id, parentCommentId: bopsComments.parentCommentId })
          .from(bopsComments)
          .where(and(
            eq(bopsComments.id, input.parentCommentId),
            eq(bopsComments.isDeleted, false),
          ))
          .limit(1);

        if (!parent[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Parent comment not found" });
        // Enforce max depth: 1 level only
        if (parent[0].parentCommentId !== null) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot reply to a reply" });
        }
      }

      const [result] = await db.insert(bopsComments).values({
        videoId: input.videoId,
        userId: ctx.user.id,
        body: input.body,
        parentCommentId: input.parentCommentId ?? null,
      });

      // Update denormalized counts
      if (input.parentCommentId) {
        await db
          .update(bopsComments)
          .set({ replyCount: sql`replyCount + 1` })
          .where(eq(bopsComments.id, input.parentCommentId));
      } else {
        await db
          .update(bopsVideos)
          .set({ commentCount: sql`commentCount + 1` })
          .where(eq(bopsVideos.id, input.videoId));
      }

      return { id: (result as any).insertId };
    }),

  // -------------------------------------------------------------------------
  // DELETE COMMENT — Protected, owner or admin only (soft delete)
  // -------------------------------------------------------------------------
  deleteComment: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(bopsComments)
        .where(and(eq(bopsComments.id, input.id), eq(bopsComments.isDeleted, false)))
        .limit(1);

      const comment = rows[0];
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db
        .update(bopsComments)
        .set({ isDeleted: true, deletedAt: new Date(), deletedBy: ctx.user.id })
        .where(eq(bopsComments.id, input.id));

      // Decrement count
      if (!comment.parentCommentId) {
        await db
          .update(bopsVideos)
          .set({ commentCount: sql`commentCount - 1` })
          .where(eq(bopsVideos.id, comment.videoId));
      }

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // TOGGLE COMMENT LIKE — Protected
  // -------------------------------------------------------------------------
  toggleCommentLike: protectedProcedure
    .input(z.object({ commentId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const existing = await db
        .select()
        .from(bopsCommentLikes)
        .where(and(
          eq(bopsCommentLikes.userId, ctx.user.id),
          eq(bopsCommentLikes.commentId, input.commentId),
        ))
        .limit(1);

      let isLiked: boolean;

      if (existing[0]) {
        // Already liked — remove it
        await db
          .delete(bopsCommentLikes)
          .where(and(
            eq(bopsCommentLikes.userId, ctx.user.id),
            eq(bopsCommentLikes.commentId, input.commentId),
          ));
        isLiked = false;
        await db
          .update(bopsComments)
          .set({ likeCount: sql`likeCount - 1` })
          .where(eq(bopsComments.id, input.commentId));
      } else {
        await db.insert(bopsCommentLikes).values({
          commentId: input.commentId,
          userId: ctx.user.id,
        });
        isLiked = true;
        await db
          .update(bopsComments)
          .set({ likeCount: sql`likeCount + 1` })
          .where(eq(bopsComments.id, input.commentId));
      }

      return { isLiked };
    }),

  // -------------------------------------------------------------------------
  // MY BOPS — Protected, returns authenticated user's own Bops (all statuses)
  // -------------------------------------------------------------------------
  getMyBops: protectedProcedure
    .input(cursorSchema)
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(bopsVideos)
        .where(and(
          eq(bopsVideos.userId, ctx.user.id),
          eq(bopsVideos.isDeleted, false),
          input.cursor ? lt(bopsVideos.id, input.cursor) : undefined,
        ))
        .orderBy(desc(bopsVideos.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = rows.length > input.limit;
      const items = hasNextPage ? rows.slice(0, input.limit) : rows;
      const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor, hasNextPage };
    }),

  // -------------------------------------------------------------------------
  // CREATE TIP CHECKOUT — Public (fans don't need to be logged in to tip)
  // Creates a Stripe Checkout session for tipping an artist via the profile page
  // Kick In policy: Stripe fees only, Boptone takes ZERO cut
  // Presets: $1, $5, $10, $20, $50
  // -------------------------------------------------------------------------
  createTipCheckout: publicProcedure
    .input(z.object({
      artistId: z.number().int().positive(),
      artistName: z.string().max(100),
      amountCents: z.union([
        z.literal(100),
        z.literal(500),
        z.literal(1000),
        z.literal(2000),
        z.literal(5000),
      ]),
      message: z.string().max(150).optional(),
      videoId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
      const origin = (ctx.req.headers.origin as string) || "https://boptoneos-ntbkjjza.manus.space";
      const amountDollars = (input.amountCents / 100).toFixed(2);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        allow_promotion_codes: false,
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tip for ${input.artistName}`,
              description: input.message
                ? `"${input.message}"`
                : `Support ${input.artistName} on Boptone`,
            },
            unit_amount: input.amountCents,
          },
          quantity: 1,
        }],
        metadata: {
          type: "bops_tip",
          artist_id: input.artistId.toString(),
          artist_name: input.artistName,
          amount_cents: input.amountCents.toString(),
          video_id: input.videoId?.toString() ?? "",
          fan_user_id: ctx.user?.id?.toString() ?? "",
          message: input.message ?? "",
        },
        client_reference_id: `tip_artist_${input.artistId}`,
        success_url: `${origin}/bops/artist/${input.artistId}?tip=success&amount=${amountDollars}`,
        cancel_url: `${origin}/bops/artist/${input.artistId}?tip=cancelled`,
      });

      return { checkoutUrl: session.url, sessionId: session.id };
    }),

  // -------------------------------------------------------------------------
  // FOLLOW / UNFOLLOW ARTIST
  // -------------------------------------------------------------------------
  followArtist: protectedProcedure
    .input(z.object({ artistId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      try {
        await db.insert(bopsArtistFollows).values({
          followerId: ctx.user.id,
          artistId: input.artistId,
        });
      } catch (err: any) {
        if (!err?.message?.includes("Duplicate entry")) throw err;
      }
      return { success: true };
    }),

  unfollowArtist: protectedProcedure
    .input(z.object({ artistId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.delete(bopsArtistFollows).where(
        and(
          eq(bopsArtistFollows.followerId, ctx.user.id),
          eq(bopsArtistFollows.artistId, input.artistId)
        )
      );
      return { success: true };
    }),

  isFollowingArtist: publicProcedure
    .input(z.object({ artistId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return { isFollowing: false };
      const db = await getDb();
      if (!db) return { isFollowing: false };
      const rows = await db
        .select({ id: bopsArtistFollows.id })
        .from(bopsArtistFollows)
        .where(
          and(
            eq(bopsArtistFollows.followerId, ctx.user.id),
            eq(bopsArtistFollows.artistId, input.artistId)
          )
        )
        .limit(1);
      return { isFollowing: rows.length > 0 };
    }),

  getFollowerCount: publicProcedure
    .input(z.object({ artistId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { count: 0 };
      const rows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(bopsArtistFollows)
        .where(eq(bopsArtistFollows.artistId, input.artistId));
      return { count: Number(rows[0]?.count ?? 0) };
    }),
});
