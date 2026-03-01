/**
 * cohortEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise-grade cohort LTV computation engine for Boptone.
 *
 * Responsibilities:
 *  1. Ingest revenue events from all monetization sources into cohort_revenue_events
 *  2. Compute cohort snapshots (retention rate, avg/median/p90 LTV) per period
 *  3. Provide query helpers for the tRPC router
 *
 * Design principles:
 *  - Idempotent: all ingestion uses INSERT IGNORE on (sourceTable, sourceId)
 *  - Append-only ledger: cohort_revenue_events is never mutated, only inserted
 *  - Materialized snapshots: cohort_snapshots are pre-computed and refreshed
 *    on-demand or by a cron job — never computed in real-time per request
 *  - All monetary values stored as integer cents (USD) to avoid float errors
 */

import { and, eq, gte, lte, sql, desc, asc } from "drizzle-orm";
import { getDb } from "../db";
import { cohortSnapshots, cohortRevenueEvents, users } from "../../drizzle/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RevenueSource = "streaming" | "shop_sale" | "tip" | "subscription" | "backing" | "other";

export interface RawRevenueEvent {
  artistId: number;
  revenueSource: RevenueSource;
  amountCents: number;
  platformFeeCents?: number;
  sourceTable: string;
  sourceId: string;
  eventDate: Date;
}

export interface CohortMatrixRow {
  cohortMonth: string;           // "YYYY-MM"
  cohortSize: number;
  periods: {
    [days: number]: {
      retainedCount: number;
      retentionRate: number;     // 0–100
      avgLtvCents: number;
      totalRevenueCents: number;
    };
  };
}

export interface CohortSummary {
  totalArtists: number;
  totalRevenueCents: number;
  avgLtvCents: number;
  bestCohortMonth: string;
  bestRetentionRate: number;
  cohortCount: number;
}

export interface ArtistLtvDetail {
  artistId: number;
  cohortMonth: string;
  totalRevenueCents: number;
  eventCount: number;
  firstRevenueDate: Date | null;
  lastRevenueDate: Date | null;
  revenueBySource: Record<RevenueSource, number>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const COHORT_PERIODS = [30, 60, 90, 180, 365] as const;
export type CohortPeriod = typeof COHORT_PERIODS[number];

// Platform fee rates by source (basis points, 100 = 1%)
const PLATFORM_FEE_BPS: Record<RevenueSource, number> = {
  streaming: 1500,     // 15%
  shop_sale: 1000,     // 10%
  tip: 500,            // 5%
  subscription: 2000,  // 20%
  backing: 500,        // 5%
  other: 1000,         // 10%
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a Date to "YYYY-MM" cohort month string.
 */
export function toCohortMonth(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Parse "YYYY-MM" to a Date (first day of that month, UTC).
 */
export function fromCohortMonth(cohortMonth: string): Date {
  const [y, m] = cohortMonth.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

/**
 * Add N calendar days to a Date (UTC).
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Compute platform fee in cents from gross amount.
 */
export function computePlatformFee(amountCents: number, source: RevenueSource): number {
  return Math.round((amountCents * PLATFORM_FEE_BPS[source]) / 10000);
}

/**
 * Calculate the median of a sorted numeric array.
 */
export function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

/**
 * Calculate the Nth percentile of a sorted numeric array.
 */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

/**
 * Ingest a batch of raw revenue events into cohort_revenue_events.
 * Idempotent: duplicate (sourceTable, sourceId) pairs are silently skipped.
 * Returns the number of new events inserted.
 */
export async function ingestRevenueEvents(events: RawRevenueEvent[]): Promise<number> {
  if (events.length === 0) return 0;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Resolve cohort months for each artist by looking up their signup date
  const artistIds = [...new Set(events.map(e => e.artistId))];
  const artistRows = await db
    .select({ id: users.id, createdAt: users.createdAt })
    .from(users)
    .where(sql`${users.id} IN (${sql.join(artistIds.map(id => sql`${id}`), sql`, `)})`);

  const artistCohortMap = new Map<number, string>(
    artistRows.map(a => [a.id, toCohortMonth(a.createdAt)])
  );

  let inserted = 0;
  for (const event of events) {
    const cohortMonth = artistCohortMap.get(event.artistId);
    if (!cohortMonth) continue; // artist not found, skip

    const platformFeeCents = event.platformFeeCents ?? computePlatformFee(event.amountCents, event.revenueSource);
    const netAmountCents = event.amountCents - platformFeeCents;

    try {
      await db.insert(cohortRevenueEvents).values({
        artistId: event.artistId,
        cohortMonth,
        revenueSource: event.revenueSource,
        amountCents: event.amountCents,
        platformFeeCents,
        netAmountCents,
        sourceTable: event.sourceTable,
        sourceId: event.sourceId,
        eventDate: event.eventDate,
      }).onDuplicateKeyUpdate({
        set: { artistId: event.artistId }, // no-op update to trigger ignore behavior
      });
      inserted++;
    } catch {
      // Duplicate key — already ingested
    }
  }

  return inserted;
}

// ─── Snapshot Computation ─────────────────────────────────────────────────────

/**
 * Compute and upsert cohort snapshots for all cohort months × all periods.
 * This is the expensive operation — call from a background job, not per-request.
 *
 * Algorithm:
 *  For each cohort month C and period P:
 *   1. Find all artists who signed up in month C (cohortSize)
 *   2. Find all revenue events for those artists within [C_start, C_start + P days]
 *   3. Compute per-artist LTV, then aggregate: retained count, avg, median, p90
 *   4. Upsert into cohort_snapshots
 */
export async function computeCohortSnapshots(
  options: { cohortMonths?: string[]; periods?: CohortPeriod[] } = {}
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const periods = options.periods ?? [...COHORT_PERIODS];

  // Get all distinct cohort months from revenue events (or use provided list)
  let cohortMonths: string[];
  if (options.cohortMonths) {
    cohortMonths = options.cohortMonths;
  } else {
    const rows = await db
      .selectDistinct({ cohortMonth: cohortRevenueEvents.cohortMonth })
      .from(cohortRevenueEvents)
      .orderBy(asc(cohortRevenueEvents.cohortMonth));
    cohortMonths = rows.map(r => r.cohortMonth);

    // Also include cohort months from users who haven't generated revenue yet
    const userCohortRows = await db
      .selectDistinct({ cohortMonth: sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%m')` })
      .from(users)
      .orderBy(asc(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`));
    const userCohortMonths = userCohortRows.map(r => r.cohortMonth);
    const allMonths = new Set([...cohortMonths, ...userCohortMonths]);
    cohortMonths = [...allMonths].sort();
  }

  let snapshotsComputed = 0;

  for (const cohortMonth of cohortMonths) {
    const cohortStart = fromCohortMonth(cohortMonth);

    // Count artists in this cohort
    const cohortSizeResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m') = ${cohortMonth}`);
    const cohortSize = cohortSizeResult[0]?.count ?? 0;

    if (cohortSize === 0) continue;

    for (const periodDays of periods) {
      const windowEnd = addDays(cohortStart, periodDays);

      // Get all revenue events for this cohort within the window
      const events = await db
        .select({
          artistId: cohortRevenueEvents.artistId,
          amountCents: cohortRevenueEvents.amountCents,
          revenueSource: cohortRevenueEvents.revenueSource,
        })
        .from(cohortRevenueEvents)
        .where(
          and(
            eq(cohortRevenueEvents.cohortMonth, cohortMonth),
            gte(cohortRevenueEvents.eventDate, cohortStart),
            lte(cohortRevenueEvents.eventDate, windowEnd)
          )
        );

      // Aggregate per artist
      const artistRevenue = new Map<number, Record<RevenueSource, number>>();
      for (const event of events) {
        if (!artistRevenue.has(event.artistId)) {
          artistRevenue.set(event.artistId, {
            streaming: 0, shop_sale: 0, tip: 0, subscription: 0, backing: 0, other: 0,
          });
        }
        artistRevenue.get(event.artistId)![event.revenueSource as RevenueSource] += event.amountCents;
      }

      const retainedCount = artistRevenue.size;
      const ltvValues = [...artistRevenue.values()].map(r =>
        Object.values(r).reduce((a, b) => a + b, 0)
      ).sort((a, b) => a - b);

      const totalRevenueCents = ltvValues.reduce((a, b) => a + b, 0);
      const avgLtvCents = retainedCount > 0 ? Math.round(totalRevenueCents / retainedCount) : 0;
      const medianLtvCents = median(ltvValues);
      const p90LtvCents = percentile(ltvValues, 90);
      const retentionRate = cohortSize > 0
        ? Number(((retainedCount / cohortSize) * 100).toFixed(2))
        : 0;

      // Revenue breakdown
      let streamingRevenueCents = 0, shopRevenueCents = 0, tipsRevenueCents = 0;
      let subscriptionRevenueCents = 0, otherRevenueCents = 0;
      for (const r of artistRevenue.values()) {
        streamingRevenueCents += r.streaming;
        shopRevenueCents += r.shop_sale;
        tipsRevenueCents += r.tip;
        subscriptionRevenueCents += r.subscription + r.backing;
        otherRevenueCents += r.other;
      }

      await db.insert(cohortSnapshots).values({
        cohortMonth,
        periodDays,
        cohortSize,
        retainedCount,
        totalRevenueCents,
        avgLtvCents,
        medianLtvCents,
        p90LtvCents,
        retentionRate: String(retentionRate),
        streamingRevenueCents,
        shopRevenueCents,
        tipsRevenueCents,
        subscriptionRevenueCents,
        otherRevenueCents,
        computedAt: new Date(),
      }).onDuplicateKeyUpdate({
        set: {
          cohortSize,
          retainedCount,
          totalRevenueCents,
          avgLtvCents,
          medianLtvCents,
          p90LtvCents,
          retentionRate: String(retentionRate),
          streamingRevenueCents,
          shopRevenueCents,
          tipsRevenueCents,
          subscriptionRevenueCents,
          otherRevenueCents,
          computedAt: new Date(),
        },
      });

      snapshotsComputed++;
    }
  }

  return snapshotsComputed;
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

/**
 * Fetch the full cohort matrix — all cohort months × all periods.
 * Returns rows sorted by cohortMonth ascending.
 */
export async function getCohortMatrix(
  options: { periods?: CohortPeriod[]; limit?: number } = {}
): Promise<CohortMatrixRow[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const periods = options.periods ?? [...COHORT_PERIODS];
  const limit = options.limit ?? 24; // last 24 months by default

  const rows = await db
    .select()
    .from(cohortSnapshots)
    .where(sql`${cohortSnapshots.periodDays} IN (${sql.join(periods.map(p => sql`${p}`), sql`, `)})`)
    .orderBy(desc(cohortSnapshots.cohortMonth))
    .limit(limit * periods.length);

  // Group by cohortMonth
  const matrix = new Map<string, CohortMatrixRow>();
  for (const row of rows) {
    if (!matrix.has(row.cohortMonth)) {
      matrix.set(row.cohortMonth, {
        cohortMonth: row.cohortMonth,
        cohortSize: row.cohortSize,
        periods: {},
      });
    }
    const entry = matrix.get(row.cohortMonth)!;
    entry.periods[row.periodDays] = {
      retainedCount: row.retainedCount,
      retentionRate: Number(row.retentionRate),
      avgLtvCents: row.avgLtvCents,
      totalRevenueCents: row.totalRevenueCents,
    };
  }

  return [...matrix.values()].sort((a, b) => a.cohortMonth.localeCompare(b.cohortMonth));
}

/**
 * Fetch summary KPIs across all cohorts.
 */
export async function getCohortSummary(): Promise<CohortSummary> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use 90-day period as the canonical LTV window for summary
  const rows = await db
    .select()
    .from(cohortSnapshots)
    .where(eq(cohortSnapshots.periodDays, 90))
    .orderBy(desc(cohortSnapshots.retentionRate));

  if (rows.length === 0) {
    return {
      totalArtists: 0,
      totalRevenueCents: 0,
      avgLtvCents: 0,
      bestCohortMonth: "—",
      bestRetentionRate: 0,
      cohortCount: 0,
    };
  }

  const totalArtists = rows.reduce((s, r) => s + r.cohortSize, 0);
  const totalRevenueCents = rows.reduce((s, r) => s + r.totalRevenueCents, 0);
  const avgLtvCents = totalArtists > 0 ? Math.round(totalRevenueCents / totalArtists) : 0;
  const best = rows[0];

  return {
    totalArtists,
    totalRevenueCents,
    avgLtvCents,
    bestCohortMonth: best.cohortMonth,
    bestRetentionRate: Number(best.retentionRate),
    cohortCount: rows.length,
  };
}

/**
 * Get per-artist LTV detail for a specific cohort month.
 */
export async function getArtistLtvByCohort(cohortMonth: string): Promise<ArtistLtvDetail[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const events = await db
    .select()
    .from(cohortRevenueEvents)
    .where(eq(cohortRevenueEvents.cohortMonth, cohortMonth))
    .orderBy(asc(cohortRevenueEvents.eventDate));

  // Aggregate per artist
  const artistMap = new Map<number, ArtistLtvDetail>();
  for (const event of events) {
    if (!artistMap.has(event.artistId)) {
      artistMap.set(event.artistId, {
        artistId: event.artistId,
        cohortMonth,
        totalRevenueCents: 0,
        eventCount: 0,
        firstRevenueDate: event.eventDate,
        lastRevenueDate: event.eventDate,
        revenueBySource: { streaming: 0, shop_sale: 0, tip: 0, subscription: 0, backing: 0, other: 0 },
      });
    }
    const detail = artistMap.get(event.artistId)!;
    detail.totalRevenueCents += event.amountCents;
    detail.eventCount++;
    detail.lastRevenueDate = event.eventDate;
    detail.revenueBySource[event.revenueSource as RevenueSource] += event.amountCents;
  }

  return [...artistMap.values()].sort((a, b) => b.totalRevenueCents - a.totalRevenueCents);
}

/**
 * Seed synthetic cohort data for demo/development purposes.
 * Generates realistic-looking cohort snapshots without touching live revenue tables.
 */
export async function seedDemoCohortData(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate 18 months of cohort data ending at current month
  const now = new Date();
  const months: string[] = [];
  for (let i = 17; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i, 1));
    months.push(toCohortMonth(d));
  }

  // Simulate a growing platform: cohort sizes grow over time, retention improves slightly
  for (let mi = 0; mi < months.length; mi++) {
    const cohortMonth = months[mi];
    const growthFactor = 1 + (mi / months.length) * 2; // 1x → 3x growth
    const cohortSize = Math.round((20 + mi * 8) * growthFactor);
    const baseRetention = 0.35 + (mi / months.length) * 0.15; // 35% → 50% improving

    for (const periodDays of COHORT_PERIODS) {
      // Retention decays with longer periods
      const periodDecay = periodDays === 30 ? 1 : periodDays === 60 ? 0.85 : periodDays === 90 ? 0.72 : periodDays === 180 ? 0.58 : 0.42;
      const retentionRate = Math.min(95, baseRetention * periodDecay * 100);
      const retainedCount = Math.round((cohortSize * retentionRate) / 100);

      // LTV grows with period length (more time = more revenue)
      const periodMultiplier = periodDays / 30;
      const avgLtvCents = Math.round((1200 + mi * 150) * periodMultiplier * (1 + Math.random() * 0.3));
      const totalRevenueCents = avgLtvCents * retainedCount;
      const medianLtvCents = Math.round(avgLtvCents * 0.65);
      const p90LtvCents = Math.round(avgLtvCents * 2.8);

      // Revenue mix: streaming dominant early, shop/tips grow over time
      const streamingShare = 0.55 - (mi / months.length) * 0.1;
      const shopShare = 0.20 + (mi / months.length) * 0.08;
      const tipsShare = 0.15 + (mi / months.length) * 0.05;
      const subShare = 0.07;
      const otherShare = 1 - streamingShare - shopShare - tipsShare - subShare;

      await db.insert(cohortSnapshots).values({
        cohortMonth,
        periodDays,
        cohortSize,
        retainedCount,
        totalRevenueCents,
        avgLtvCents,
        medianLtvCents,
        p90LtvCents,
        retentionRate: String(retentionRate.toFixed(2)),
        streamingRevenueCents: Math.round(totalRevenueCents * streamingShare),
        shopRevenueCents: Math.round(totalRevenueCents * shopShare),
        tipsRevenueCents: Math.round(totalRevenueCents * tipsShare),
        subscriptionRevenueCents: Math.round(totalRevenueCents * subShare),
        otherRevenueCents: Math.round(totalRevenueCents * Math.max(0, otherShare)),
        computedAt: new Date(),
      }).onDuplicateKeyUpdate({
        set: {
          cohortSize,
          retainedCount,
          totalRevenueCents,
          avgLtvCents,
          medianLtvCents,
          p90LtvCents,
          retentionRate: String(retentionRate.toFixed(2)),
          computedAt: new Date(),
        },
      });
    }
  }
}
