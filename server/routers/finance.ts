/**
 * [FINANCE-1] Real-time Artist Financial Dashboard Router
 *
 * Aggregates money flows across:
 *   - BopShop orders (merchandise sales)
 *   - BAP stream payments (streaming revenue)
 *   - Tips / Kick-In (0% fee fan tips)
 *   - Revenue records (manual / third-party entries)
 *   - Writer earnings (songwriter splits owed)
 *   - Loan repayments (royalty-backed micro-loan deductions)
 *   - Payouts (withdrawals to bank)
 *   - Earnings balance (current available balance)
 *
 * All monetary values are returned in cents (integer) unless noted.
 * The frontend converts to dollars for display.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { getArtistProfileByUserId } from "../db";
import { TRPCError } from "@trpc/server";
import {
  orders,
  bapStreamPayments,
  bapTracks,
  tips,
  revenueRecords,
  writerEarnings,
  writerProfiles,
  loanRepayments,
  artistLoans,
  payouts,
  earningsBalance,
  artistProfiles,
} from "../../drizzle/schema";
import { eq, and, gte, lte, sum, count, sql, desc, isNotNull } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toInt(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : Math.round(n);
}

function periodFilter(col: any, period: string) {
  const now = new Date();
  if (period === "7d") {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    return gte(col, d);
  }
  if (period === "30d") {
    const d = new Date(now); d.setDate(d.getDate() - 30);
    return gte(col, d);
  }
  if (period === "90d") {
    const d = new Date(now); d.setDate(d.getDate() - 90);
    return gte(col, d);
  }
  if (period === "1y") {
    const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
    return gte(col, d);
  }
  // "all" — no filter
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const financeRouter = router({
  /**
   * getSummary — the main dashboard endpoint
   *
   * Returns a unified financial summary for the authenticated artist:
   *   grossEarnings:     sum of all revenue streams (before any deductions)
   *   platformFees:      Boptone's share (10% on BAP streams, % on BopShop)
   *   processingFees:    Stripe / payment processor fees
   *   writerSplitsOwed:  pending writer earnings not yet paid out
   *   loanRepaid:        total loan repayments made in period
   *   loanBalance:       remaining loan principal outstanding
   *   netPayout:         grossEarnings - platformFees - processingFees - writerSplitsOwed - loanRepaid
   *   availableBalance:  current withdrawable balance from earningsBalance table
   *   pendingBalance:    earnings in 7-day hold
   *   totalWithdrawn:    lifetime withdrawals
   *
   * Revenue breakdown by source:
   *   bopshop, streaming, tips, thirdParty, other
   *
   * Monthly trend (last 6 months):
   *   Array of { month: "2025-09", gross: number, net: number }
   *
   * Recent transactions (last 10):
   *   Array of { date, type, description, amount, status }
   */
  getSummary: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });

      const artistId = profile.id;
      const pf = periodFilter;

      // ── 1. BopShop orders (paid only) ──────────────────────────────────────
      const shopFilter = [
        eq(orders.artistId, artistId),
        eq(orders.paymentStatus, "paid"),
      ];
      const shopPeriodFilter = pf(orders.paidAt, input.period);
      if (shopPeriodFilter) shopFilter.push(shopPeriodFilter);

      const [shopResult] = await db
        .select({
          gross: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
          fees: sql<number>`COALESCE(SUM(${orders.total} * CAST(${artistProfiles.platformFeePercentage} AS DECIMAL(5,2)) / 100), 0)`,
        })
        .from(orders)
        .leftJoin(artistProfiles, eq(orders.artistId, artistProfiles.id))
        .where(and(...shopFilter));

      const shopGross = toInt(shopResult?.gross);
      const shopPlatformFees = toInt(shopResult?.fees);

      // ── 2. BAP streaming (artist share = 90%) ─────────────────────────────
      const streamFilter = [
        eq(bapTracks.artistId, artistId),
        eq(bapStreamPayments.status, "succeeded"),
      ];
      const streamPeriodFilter = pf(bapStreamPayments.paidAt, input.period);
      if (streamPeriodFilter) streamFilter.push(streamPeriodFilter);

      const [streamResult] = await db
        .select({
          artistShare: sql<number>`COALESCE(SUM(${bapStreamPayments.artistShare}), 0)`,
          platformShare: sql<number>`COALESCE(SUM(${bapStreamPayments.platformShare}), 0)`,
          totalAmount: sql<number>`COALESCE(SUM(${bapStreamPayments.amount}), 0)`,
        })
        .from(bapStreamPayments)
        .innerJoin(bapTracks, eq(bapStreamPayments.trackId, bapTracks.id))
        .where(and(...streamFilter));

      const streamGross = toInt(streamResult?.artistShare);
      const streamPlatformFees = toInt(streamResult?.platformShare);

      // ── 3. Tips / Kick-In (0% platform fee) ───────────────────────────────
      const tipFilter = [
        eq(tips.toArtistId, artistId),
        eq(tips.status, "completed"),
      ];
      const tipPeriodFilter = pf(tips.completedAt, input.period);
      if (tipPeriodFilter) tipFilter.push(tipPeriodFilter);

      const [tipResult] = await db
        .select({
          gross: sql<number>`COALESCE(SUM(${tips.amount}), 0)`,
          processingFees: sql<number>`COALESCE(SUM(${tips.processingFee}), 0)`,
          net: sql<number>`COALESCE(SUM(${tips.netAmount}), 0)`,
        })
        .from(tips)
        .where(and(...tipFilter));

      const tipsGross = toInt(tipResult?.gross);
      const tipsProcessingFees = toInt(tipResult?.processingFees);

      // ── 4. Revenue records (manual / third-party) ─────────────────────────
      const rrFilter = [
        eq(revenueRecords.artistId, artistId),
        eq(revenueRecords.status, "paid"),
      ];
      const rrPeriodFilter = pf(revenueRecords.paymentDate, input.period);
      if (rrPeriodFilter) rrFilter.push(rrPeriodFilter);

      const [rrResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${revenueRecords.amount}), 0)`,
        })
        .from(revenueRecords)
        .where(and(...rrFilter));

      const thirdPartyGross = toInt(rrResult?.total);

      // ── 5. Writer splits owed (pending payout) ────────────────────────────
      // Sum of pendingPayout across all tracks owned by this artist
      const [writerResult] = await db
        .select({
          totalOwed: sql<number>`COALESCE(SUM(${writerEarnings.pendingPayout}), 0)`,
          totalPaid: sql<number>`COALESCE(SUM(${writerEarnings.totalPaidOut}), 0)`,
        })
        .from(writerEarnings)
        .innerJoin(bapTracks, eq(writerEarnings.trackId, bapTracks.id))
        .where(eq(bapTracks.artistId, artistId));

      const writerSplitsOwed = toInt(writerResult?.totalOwed);
      const writerSplitsPaid = toInt(writerResult?.totalPaid);

      // ── 6. Loan repayments ────────────────────────────────────────────────
      const lrFilter = [eq(loanRepayments.artistProfileId, artistId)];
      const lrPeriodFilter = pf(loanRepayments.processedAt, input.period);
      if (lrPeriodFilter) lrFilter.push(lrPeriodFilter);

      const [lrResult] = await db
        .select({
          totalRepaid: sql<number>`COALESCE(SUM(CAST(${loanRepayments.amount} AS DECIMAL(10,2))), 0)`,
        })
        .from(loanRepayments)
        .where(and(...lrFilter));

      const loanRepaidCents = Math.round(toInt(lrResult?.totalRepaid));

      // Active loan balance
      const [loanBalResult] = await db
        .select({
          remaining: sql<number>`COALESCE(SUM(CAST(${artistLoans.remainingBalance} AS DECIMAL(10,2))), 0)`,
        })
        .from(artistLoans)
        .where(and(
          eq(artistLoans.artistProfileId, artistId),
          eq(artistLoans.status, "active"),
        ));

      const loanBalanceCents = Math.round(toInt(loanBalResult?.remaining));

      // ── 7. Payouts (withdrawals) ──────────────────────────────────────────
      const payoutFilter = [
        eq(payouts.artistId, artistId),
        eq(payouts.status, "completed"),
      ];
      const payoutPeriodFilter = pf(payouts.completedAt, input.period);
      if (payoutPeriodFilter) payoutFilter.push(payoutPeriodFilter);

      const [payoutResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${payouts.netAmount}), 0)`,
          fees: sql<number>`COALESCE(SUM(${payouts.fee}), 0)`,
        })
        .from(payouts)
        .where(and(...payoutFilter));

      const totalWithdrawn = toInt(payoutResult?.total);
      const payoutFees = toInt(payoutResult?.fees);

      // ── 8. Earnings balance (current state) ───────────────────────────────
      const [balResult] = await db
        .select()
        .from(earningsBalance)
        .where(eq(earningsBalance.artistId, artistId))
        .limit(1);

      const availableBalance = balResult?.availableBalance ?? 0;
      const pendingBalance = balResult?.pendingBalance ?? 0;
      const totalEarningsLifetime = balResult?.totalEarnings ?? 0;
      const withdrawnLifetime = balResult?.withdrawnBalance ?? 0;

      // ── 9. Aggregated totals ──────────────────────────────────────────────
      const grossEarnings = shopGross + streamGross + tipsGross + thirdPartyGross;
      const platformFees = shopPlatformFees + streamPlatformFees;
      const processingFees = tipsProcessingFees;
      const netPayout = grossEarnings - platformFees - processingFees - writerSplitsOwed - loanRepaidCents;

      // ── 10. Revenue breakdown by source ───────────────────────────────────
      const breakdown = [
        { source: "BopShop Sales", amount: shopGross, color: "#0066ff" },
        { source: "BAP Streaming", amount: streamGross, color: "#00d4aa" },
        { source: "Tips (Kick-In)", amount: tipsGross, color: "#f59e0b" },
        { source: "Third-Party / Other", amount: thirdPartyGross, color: "#8b5cf6" },
      ].filter(s => s.amount > 0);

      // ── 11. Monthly trend (last 6 months) ─────────────────────────────────
      // Build month buckets for the last 6 months
      const monthlyTrend: Array<{ month: string; gross: number; net: number; bopshop: number; streaming: number; tips: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        // Shop for this month
        const [ms] = await db
          .select({ gross: sql<number>`COALESCE(SUM(${orders.total}), 0)` })
          .from(orders)
          .where(and(
            eq(orders.artistId, artistId),
            eq(orders.paymentStatus, "paid"),
            gte(orders.paidAt, monthStart),
            lte(orders.paidAt, monthEnd),
          ));

        // Streaming for this month
        const [mst] = await db
          .select({ gross: sql<number>`COALESCE(SUM(${bapStreamPayments.artistShare}), 0)` })
          .from(bapStreamPayments)
          .innerJoin(bapTracks, eq(bapStreamPayments.trackId, bapTracks.id))
          .where(and(
            eq(bapTracks.artistId, artistId),
            eq(bapStreamPayments.status, "succeeded"),
            gte(bapStreamPayments.paidAt, monthStart),
            lte(bapStreamPayments.paidAt, monthEnd),
          ));

        // Tips for this month
        const [mt] = await db
          .select({ gross: sql<number>`COALESCE(SUM(${tips.netAmount}), 0)` })
          .from(tips)
          .where(and(
            eq(tips.toArtistId, artistId),
            eq(tips.status, "completed"),
            gte(tips.completedAt, monthStart),
            lte(tips.completedAt, monthEnd),
          ));

        const mShop = toInt(ms?.gross);
        const mStream = toInt(mst?.gross);
        const mTips = toInt(mt?.gross);
        const mGross = mShop + mStream + mTips;
        // Approximate net: subtract 10% platform fee on streaming
        const mNet = mGross - Math.round(mStream * 0.1);

        monthlyTrend.push({
          month: monthKey,
          gross: mGross,
          net: mNet,
          bopshop: mShop,
          streaming: mStream,
          tips: mTips,
        });
      }

      // ── 12. Recent transactions (last 10 across all sources) ──────────────
      const recentTransactions: Array<{
        date: Date;
        type: string;
        description: string;
        amountCents: number;
        status: string;
      }> = [];

      // Recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          total: orders.total,
          paidAt: orders.paidAt,
          paymentStatus: orders.paymentStatus,
        })
        .from(orders)
        .where(and(eq(orders.artistId, artistId), eq(orders.paymentStatus, "paid")))
        .orderBy(desc(orders.paidAt))
        .limit(5);

      for (const o of recentOrders) {
        recentTransactions.push({
          date: o.paidAt ?? new Date(),
          type: "bopshop",
          description: `BopShop Order #${o.orderNumber}`,
          amountCents: o.total,
          status: "completed",
        });
      }

      // Recent tips
      const recentTips = await db
        .select({
          amount: tips.netAmount,
          completedAt: tips.completedAt,
          message: tips.message,
          isAnonymous: tips.isAnonymous,
        })
        .from(tips)
        .where(and(eq(tips.toArtistId, artistId), eq(tips.status, "completed")))
        .orderBy(desc(tips.completedAt))
        .limit(5);

      for (const t of recentTips) {
        recentTransactions.push({
          date: t.completedAt ?? new Date(),
          type: "tip",
          description: t.isAnonymous ? "Anonymous Kick-In tip" : (t.message ? `Kick-In: "${t.message.slice(0, 40)}"` : "Kick-In tip"),
          amountCents: t.amount,
          status: "completed",
        });
      }

      // Recent payouts
      const recentPayouts = await db
        .select({
          netAmount: payouts.netAmount,
          payoutType: payouts.payoutType,
          status: payouts.status,
          completedAt: payouts.completedAt,
          createdAt: payouts.createdAt,
        })
        .from(payouts)
        .where(eq(payouts.artistId, artistId))
        .orderBy(desc(payouts.createdAt))
        .limit(5);

      for (const p of recentPayouts) {
        recentTransactions.push({
          date: p.completedAt ?? p.createdAt,
          type: "payout",
          description: `${p.payoutType === "instant" ? "Instant" : "Standard"} withdrawal`,
          amountCents: -p.netAmount, // negative = money leaving
          status: p.status,
        });
      }

      // Sort all recent transactions by date descending, take top 10
      recentTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      const topTransactions = recentTransactions.slice(0, 10);

      return {
        period: input.period,
        // Headline numbers
        grossEarnings,
        platformFees,
        processingFees,
        writerSplitsOwed,
        writerSplitsPaid,
        loanRepaidCents,
        loanBalanceCents,
        netPayout,
        // Balance
        availableBalance,
        pendingBalance,
        totalEarningsLifetime,
        withdrawnLifetime,
        payoutFees,
        // Breakdown
        breakdown,
        // Trend
        monthlyTrend,
        // Recent activity
        recentTransactions: topTransactions,
        // Metadata
        artistId,
        generatedAt: new Date(),
      };
    }),

  /**
   * getWriterSplitDetail — per-track writer split breakdown
   * Shows each track, each writer's split %, earned, pending, paid
   */
  getWriterSplitDetail: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });

      const rows = await db
        .select({
          trackId: bapTracks.id,
          trackTitle: bapTracks.title,
          writerName: writerProfiles.fullName,
          splitPercentage: writerEarnings.splitPercentage,
          totalEarned: writerEarnings.totalEarned,
          pendingPayout: writerEarnings.pendingPayout,
          totalPaidOut: writerEarnings.totalPaidOut,
          lastPayoutAt: writerEarnings.lastPayoutAt,
        })
        .from(writerEarnings)
        .innerJoin(bapTracks, eq(writerEarnings.trackId, bapTracks.id))
        .innerJoin(writerProfiles, eq(writerEarnings.writerProfileId, writerProfiles.id))
        .where(eq(bapTracks.artistId, profile.id))
        .orderBy(desc(writerEarnings.pendingPayout));

      return rows;
    }),

  /**
   * getLoanDetail — active and historical loan summary
   */
  getLoanDetail: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });

      const loans = await db
        .select()
        .from(artistLoans)
        .where(eq(artistLoans.artistProfileId, profile.id))
        .orderBy(desc(artistLoans.createdAt));

      const repaymentsByLoan = await db
        .select({
          loanId: loanRepayments.loanId,
          totalRepaid: sql<number>`COALESCE(SUM(CAST(${loanRepayments.amount} AS DECIMAL(10,2))), 0)`,
          repaymentCount: sql<number>`COUNT(*)`,
        })
        .from(loanRepayments)
        .where(eq(loanRepayments.artistProfileId, profile.id))
        .groupBy(loanRepayments.loanId);

      const repaymentMap = new Map(repaymentsByLoan.map(r => [r.loanId, r]));

      return loans.map(loan => ({
        ...loan,
        repaymentSummary: repaymentMap.get(loan.id) ?? { totalRepaid: 0, repaymentCount: 0 },
      }));
    }),

  /**
   * getPayoutHistory — paginated payout history
   */
  getPayoutHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });

      const rows = await db
        .select()
        .from(payouts)
        .where(eq(payouts.artistId, profile.id))
        .orderBy(desc(payouts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [countResult] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(payouts)
        .where(eq(payouts.artistId, profile.id));

      return {
        payouts: rows,
        total: toInt(countResult?.total),
      };
    }),
});
