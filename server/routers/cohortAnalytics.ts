/**
 * cohortAnalytics.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * tRPC router for cohort-based LTV analytics.
 * All procedures are admin-only — cohort data is internal business intelligence.
 *
 * Procedures:
 *  getCohortMatrix     — Full heatmap data: all cohorts × all periods
 *  getCohortSummary    — Platform-level KPI summary
 *  getTopCohorts       — Best-performing cohorts by retention or LTV
 *  getArtistLtv        — Per-artist LTV breakdown for a given cohort month
 *  triggerRecompute    — Manually trigger snapshot recomputation (admin)
 *  seedDemoData        — Seed synthetic demo data (admin, dev only)
 *  ingestEvents        — Ingest revenue events from source tables (admin/cron)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getCohortMatrix,
  getCohortSummary,
  getArtistLtvByCohort,
  computeCohortSnapshots,
  seedDemoCohortData,
  ingestRevenueEvents,
  COHORT_PERIODS,
  type CohortPeriod,
} from "../lib/cohortEngine";
import { getDb } from "../db";
import { cohortSnapshots } from "../../drizzle/schema";
import { desc, asc } from "drizzle-orm";

// ─── Admin guard middleware ───────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const cohortAnalyticsRouter = router({

  /**
   * getCohortMatrix
   * Returns the full cohort retention heatmap data.
   * Each row = one cohort month; each column = one retention period.
   */
  getCohortMatrix: adminProcedure
    .input(z.object({
      periods: z.array(z.number()).optional(),
      limit: z.number().min(1).max(36).default(24),
    }))
    .query(async ({ input }) => {
      const periods = (input.periods ?? [...COHORT_PERIODS]) as CohortPeriod[];
      const matrix = await getCohortMatrix({ periods, limit: input.limit });
      return { matrix, periods };
    }),

  /**
   * getCohortSummary
   * Platform-level KPI summary using 90-day LTV as the canonical window.
   */
  getCohortSummary: adminProcedure
    .query(async () => {
      return getCohortSummary();
    }),

  /**
   * getTopCohorts
   * Returns the N best-performing cohorts sorted by a given metric.
   */
  getTopCohorts: adminProcedure
    .input(z.object({
      metric: z.enum(["retentionRate", "avgLtvCents", "totalRevenueCents"]).default("retentionRate"),
      periodDays: z.number().default(90),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { eq } = await import("drizzle-orm");
      const rows = await db
        .select()
        .from(cohortSnapshots)
        .where(eq(cohortSnapshots.periodDays, input.periodDays))
        .orderBy(
          input.metric === "retentionRate"
            ? desc(cohortSnapshots.retentionRate)
            : input.metric === "avgLtvCents"
            ? desc(cohortSnapshots.avgLtvCents)
            : desc(cohortSnapshots.totalRevenueCents)
        )
        .limit(input.limit);

      return rows.map(r => ({
        cohortMonth: r.cohortMonth,
        cohortSize: r.cohortSize,
        retainedCount: r.retainedCount,
        retentionRate: Number(r.retentionRate),
        avgLtvCents: r.avgLtvCents,
        medianLtvCents: r.medianLtvCents,
        p90LtvCents: r.p90LtvCents,
        totalRevenueCents: r.totalRevenueCents,
        streamingRevenueCents: r.streamingRevenueCents,
        shopRevenueCents: r.shopRevenueCents,
        tipsRevenueCents: r.tipsRevenueCents,
        subscriptionRevenueCents: r.subscriptionRevenueCents,
        otherRevenueCents: r.otherRevenueCents,
        computedAt: r.computedAt,
      }));
    }),

  /**
   * getRetentionCurve
   * Returns retention rate across all periods for a specific cohort month.
   * Used to draw the retention curve chart.
   */
  getRetentionCurve: adminProcedure
    .input(z.object({
      cohortMonth: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { eq } = await import("drizzle-orm");
      const rows = await db
        .select()
        .from(cohortSnapshots)
        .where(eq(cohortSnapshots.cohortMonth, input.cohortMonth))
        .orderBy(asc(cohortSnapshots.periodDays));

      return {
        cohortMonth: input.cohortMonth,
        curve: rows.map(r => ({
          periodDays: r.periodDays,
          retentionRate: Number(r.retentionRate),
          avgLtvCents: r.avgLtvCents,
          retainedCount: r.retainedCount,
          cohortSize: r.cohortSize,
        })),
      };
    }),

  /**
   * getRevenueBreakdown
   * Returns revenue source breakdown across all cohorts for a given period.
   */
  getRevenueBreakdown: adminProcedure
    .input(z.object({
      periodDays: z.number().default(90),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { eq, sql } = await import("drizzle-orm");
      const rows = await db
        .select({
          totalStreaming: sql<number>`SUM(${cohortSnapshots.streamingRevenueCents})`,
          totalShop: sql<number>`SUM(${cohortSnapshots.shopRevenueCents})`,
          totalTips: sql<number>`SUM(${cohortSnapshots.tipsRevenueCents})`,
          totalSubscriptions: sql<number>`SUM(${cohortSnapshots.subscriptionRevenueCents})`,
          totalOther: sql<number>`SUM(${cohortSnapshots.otherRevenueCents})`,
          totalRevenue: sql<number>`SUM(${cohortSnapshots.totalRevenueCents})`,
        })
        .from(cohortSnapshots)
        .where(eq(cohortSnapshots.periodDays, input.periodDays));

      const r = rows[0] ?? { totalStreaming: 0, totalShop: 0, totalTips: 0, totalSubscriptions: 0, totalOther: 0, totalRevenue: 0 };
      const total = r.totalRevenue || 1;

      return {
        streaming: { cents: r.totalStreaming, pct: Number(((r.totalStreaming / total) * 100).toFixed(1)) },
        shop: { cents: r.totalShop, pct: Number(((r.totalShop / total) * 100).toFixed(1)) },
        tips: { cents: r.totalTips, pct: Number(((r.totalTips / total) * 100).toFixed(1)) },
        subscriptions: { cents: r.totalSubscriptions, pct: Number(((r.totalSubscriptions / total) * 100).toFixed(1)) },
        other: { cents: r.totalOther, pct: Number(((r.totalOther / total) * 100).toFixed(1)) },
        total: r.totalRevenue,
      };
    }),

  /**
   * getArtistLtv
   * Per-artist LTV breakdown for a specific cohort month.
   * Returns top artists by revenue within that cohort.
   */
  getArtistLtv: adminProcedure
    .input(z.object({
      cohortMonth: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const details = await getArtistLtvByCohort(input.cohortMonth);
      return details.slice(0, input.limit);
    }),

  /**
   * triggerRecompute
   * Manually trigger cohort snapshot recomputation.
   * In production this would be called by a cron job.
   */
  triggerRecompute: adminProcedure
    .input(z.object({
      cohortMonths: z.array(z.string()).optional(),
      periods: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const periods = input.periods as CohortPeriod[] | undefined;
      const count = await computeCohortSnapshots({
        cohortMonths: input.cohortMonths,
        periods,
      });
      return { snapshotsComputed: count, recomputedAt: new Date() };
    }),

  /**
   * seedDemoData
   * Seeds 18 months of synthetic cohort data for demo/development.
   * Only available in non-production environments.
   */
  seedDemoData: adminProcedure
    .mutation(async () => {
      await seedDemoCohortData();
      return { seeded: true, seededAt: new Date() };
    }),

  /**
   * ingestEvents
   * Manually ingest revenue events (for backfill or testing).
   */
  ingestEvents: adminProcedure
    .input(z.object({
      events: z.array(z.object({
        artistId: z.number(),
        revenueSource: z.enum(["streaming", "shop_sale", "tip", "subscription", "backing", "other"]),
        amountCents: z.number().min(1),
        platformFeeCents: z.number().optional(),
        sourceTable: z.string(),
        sourceId: z.string(),
        eventDate: z.date(),
      })),
    }))
    .mutation(async ({ input }) => {
      const inserted = await ingestRevenueEvents(input.events);
      return { inserted, total: input.events.length };
    }),
});
