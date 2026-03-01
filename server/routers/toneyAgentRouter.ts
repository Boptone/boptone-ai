/**
 * Toney Agent tRPC Router
 *
 * Exposes the agent action history and control procedures to the frontend.
 *
 * Procedures:
 *   - getActions: paginated list of agent actions for the current artist
 *   - dismiss: mark an action as dismissed
 *   - undismiss: restore a dismissed action
 *   - getStats: summary stats (total, unread, by category)
 *   - triggerCycle: manually trigger an agent cycle for the current artist (admin/dev)
 */

import { z } from "zod";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { artistProfiles, toneyAgentActions } from "../../drizzle/schema";
import { runAgentForArtist } from "../agents/toneyAgent";

export const toneyAgentRouter = router({
  /**
   * Get paginated agent actions for the authenticated artist.
   * Defaults to undismissed actions only; pass showDismissed=true to include all.
   */
  getActions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        showDismissed: z.boolean().default(false),
        category: z
          .enum([
            "streaming_drop",
            "streaming_spike",
            "revenue_milestone",
            "revenue_drop",
            "fan_engagement_spike",
            "release_gap",
            "workflow_suggestion",
            "goal_progress",
            "earnings_available",
            "superfan_detected",
            "general",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { actions: [], total: 0 };

      // Get artist profile for this user
      const [profile] = await db
        .select({ id: artistProfiles.id })
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);

      if (!profile) return { actions: [], total: 0 };

      const conditions = [eq(toneyAgentActions.artistProfileId, profile.id)];
      if (!input.showDismissed) {
        conditions.push(eq(toneyAgentActions.dismissed, false));
      }
      if (input.category) {
        conditions.push(eq(toneyAgentActions.category, input.category));
      }

      const [actions, [countRow]] = await Promise.all([
        db
          .select()
          .from(toneyAgentActions)
          .where(and(...conditions))
          .orderBy(desc(toneyAgentActions.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ total: sql<number>`COUNT(*)` })
          .from(toneyAgentActions)
          .where(and(...conditions)),
      ]);

      return {
        actions,
        total: Number(countRow?.total ?? 0),
      };
    }),

  /**
   * Summary stats for the agent panel badge and header.
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, unread: 0, byCategory: [] };

    const [profile] = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, ctx.user.id))
      .limit(1);

    if (!profile) return { total: 0, unread: 0, byCategory: [] };

    const [totalRow] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(toneyAgentActions)
      .where(eq(toneyAgentActions.artistProfileId, profile.id));

    const [unreadRow] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(toneyAgentActions)
      .where(
        and(
          eq(toneyAgentActions.artistProfileId, profile.id),
          eq(toneyAgentActions.dismissed, false)
        )
      );

    const byCategory = await db
      .select({
        category: toneyAgentActions.category,
        count: sql<number>`COUNT(*)`,
      })
      .from(toneyAgentActions)
      .where(
        and(
          eq(toneyAgentActions.artistProfileId, profile.id),
          eq(toneyAgentActions.dismissed, false)
        )
      )
      .groupBy(toneyAgentActions.category);

    return {
      total: Number(totalRow?.total ?? 0),
      unread: Number(unreadRow?.total ?? 0),
      byCategory: byCategory.map((r) => ({
        category: r.category,
        count: Number(r.count),
      })),
    };
  }),

  /**
   * Dismiss an action (mark as read/done).
   */
  dismiss: protectedProcedure
    .input(z.object({ actionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [profile] = await db
        .select({ id: artistProfiles.id })
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);

      if (!profile) throw new Error("Artist profile not found");

      // Verify ownership before updating
      const [action] = await db
        .select({ id: toneyAgentActions.id })
        .from(toneyAgentActions)
        .where(
          and(
            eq(toneyAgentActions.id, input.actionId),
            eq(toneyAgentActions.artistProfileId, profile.id)
          )
        )
        .limit(1);

      if (!action) throw new Error("Action not found");

      await db
        .update(toneyAgentActions)
        .set({ dismissed: true })
        .where(eq(toneyAgentActions.id, input.actionId));

      return { success: true };
    }),

  /**
   * Dismiss all undismissed actions for the current artist.
   */
  dismissAll: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [profile] = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, ctx.user.id))
      .limit(1);

    if (!profile) throw new Error("Artist profile not found");

    await db
      .update(toneyAgentActions)
      .set({ dismissed: true })
      .where(
        and(
          eq(toneyAgentActions.artistProfileId, profile.id),
          eq(toneyAgentActions.dismissed, false)
        )
      );

    return { success: true };
  }),

  /**
   * Manually trigger an agent cycle for the current artist (useful for testing
   * and for artists who want an immediate refresh).
   */
  triggerCycle: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [profile] = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, ctx.user.id))
      .limit(1);

    if (!profile) throw new Error("Artist profile not found");

    const result = await runAgentForArtist(profile.id);

    return {
      success: true,
      actionsCreated: result.actionsCreated,
      skipped: result.skipped,
      errors: result.errors,
    };
  }),
});
