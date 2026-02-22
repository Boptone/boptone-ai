/**
 * Analytics Router
 * 
 * Provides tRPC procedures for querying BOPixel tracking data
 * Powers the Artist Insights Dashboard (invisible to artists)
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { pixelEvents, pixelSessions, pixelUsers } from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

export const analyticsRouter = router({
  /**
   * Get overview stats for artist dashboard
   * Returns real-time visitor count, total views, conversions, revenue
   */
  getOverview: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { artistId, startDate, endDate } = input;
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Real-time visitors (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const [realtimeResult] = await db
        .select({ count: count() })
        .from(pixelSessions)
        .where(
          and(
            eq(pixelSessions.artistId, artistId.toString()),
            gte(pixelSessions.lastActivityAt, thirtyMinutesAgo)
          )
        );

      // Total page views
      const [pageViewsResult] = await db
        .select({ count: count() })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "page_view"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      // Total conversions (purchases)
      const [conversionsResult] = await db
        .select({ count: count() })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "purchase"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      // Total revenue
      const [revenueResult] = await db
        .select({ total: sql<number>`SUM(${pixelEvents.revenue})` })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "purchase"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      return {
        realtimeVisitors: realtimeResult?.count || 0,
        totalPageViews: pageViewsResult?.count || 0,
        totalConversions: conversionsResult?.count || 0,
        totalRevenue: revenueResult?.total || 0,
      };
    }),

  /**
   * Get traffic sources breakdown
   * Returns referrer data showing where visitors come from
   */
  getTrafficSources: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { artistId, startDate, endDate } = input;
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Group by referrer
      const sources = await db
        .select({
          source: pixelEvents.referrer,
          visits: count(),
        })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "page_view"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        )
        .groupBy(pixelEvents.referrer)
        .orderBy(desc(count()))
        .limit(10);

      // Categorize sources
      return sources.map((s) => {
        const referrer = s.source || "Direct";
        let category = "Direct";

        if (referrer.includes("google")) category = "Google";
        else if (referrer.includes("facebook") || referrer.includes("fb"))
          category = "Facebook";
        else if (referrer.includes("instagram") || referrer.includes("ig"))
          category = "Instagram";
        else if (referrer.includes("twitter") || referrer.includes("x.com"))
          category = "Twitter";
        else if (referrer.includes("tiktok")) category = "TikTok";
        else if (referrer.includes("youtube")) category = "YouTube";
        else if (referrer !== "Direct") category = "Other";

        return {
          source: referrer,
          category,
          visits: s.visits,
        };
      });
    }),

  /**
   * Get product performance metrics
   * Returns top-selling products with views and conversions
   */
  getProductPerformance: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { artistId, startDate, endDate } = input;
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get product views
      const productViews = await db
        .select({
          productId: pixelEvents.productId,
          productName: sql<string>`JSON_EXTRACT(${pixelEvents.customData}, '$.productName')`,
          views: count(),
        })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventName, "Product Viewed"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        )
        .groupBy(pixelEvents.productId)
        .orderBy(desc(count()))
        .limit(10);

      // Get product purchases
      const productPurchases = await db
        .select({
          productId: pixelEvents.productId,
          purchases: count(),
          revenue: sql<number>`SUM(${pixelEvents.revenue})`,
        })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "purchase"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        )
        .groupBy(pixelEvents.productId);

      // Merge views and purchases
      const purchaseMap = new Map(
        productPurchases.map((p) => [
          p.productId,
          { purchases: p.purchases, revenue: p.revenue },
        ])
      );

      return productViews.map((v) => {
        const purchaseData = purchaseMap.get(v.productId) || {
          purchases: 0,
          revenue: 0,
        };
        const conversionRate =
          v.views > 0 ? (purchaseData.purchases / v.views) * 100 : 0;

        return {
          productId: v.productId,
          productName: v.productName || "Unknown Product",
          views: v.views,
          purchases: purchaseData.purchases,
          revenue: purchaseData.revenue,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      });
    }),

  /**
   * Get revenue attribution by channel
   * Shows which traffic sources drive the most revenue
   */
  getRevenueAttribution: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { artistId, startDate, endDate } = input;
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get purchases with session data (to get referrer)
      const purchases = await db
        .select({
          sessionId: pixelEvents.sessionId,
          revenue: pixelEvents.revenue,
        })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "purchase"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      // Get session referrers
      const sessionIds = purchases.map((p) => p.sessionId);
      if (sessionIds.length === 0) {
        return [];
      }

      const sessions = await db
        .select({
          sessionId: pixelSessions.sessionId,
          referrer: pixelSessions.referrer,
        })
        .from(pixelSessions)
        .where(sql`${pixelSessions.sessionId} IN (${sql.join(sessionIds, sql`, `)})`);

      // Map sessions to referrers
      const sessionReferrerMap = new Map(
        sessions.map((s) => [s.sessionId, s.referrer])
      );

      // Aggregate revenue by referrer
      const revenueByReferrer = new Map<string, number>();
      purchases.forEach((p) => {
        const referrer = sessionReferrerMap.get(p.sessionId) || "Direct";
        const current = revenueByReferrer.get(referrer) || 0;
        revenueByReferrer.set(referrer, current + (p.revenue || 0));
      });

      // Convert to array and categorize
      const attribution = Array.from(revenueByReferrer.entries())
        .map(([referrer, revenue]) => {
          let category = "Direct";

          if (referrer.includes("google")) category = "Google";
          else if (referrer.includes("facebook") || referrer.includes("fb"))
            category = "Facebook";
          else if (referrer.includes("instagram") || referrer.includes("ig"))
            category = "Instagram";
          else if (referrer.includes("twitter") || referrer.includes("x.com"))
            category = "Twitter";
          else if (referrer.includes("tiktok")) category = "TikTok";
          else if (referrer.includes("youtube")) category = "YouTube";
          else if (referrer !== "Direct") category = "Other";

          return {
            source: referrer,
            category,
            revenue,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return attribution;
    }),

  /**
   * Get conversion funnel data
   * Shows drop-off rates from view → add to cart → checkout → purchase
   */
  getConversionFunnel: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { artistId, startDate, endDate } = input;
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Count each funnel stage
      const [productViews] = await db
        .select({ count: count() })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventName, "Product Viewed"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      const [addToCarts] = await db
        .select({ count: count() })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventName, "Add to Cart"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      const [checkouts] = await db
        .select({ count: count() })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventName, "Checkout Started"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      const [purchases] = await db
        .select({ count: count() })
        .from(pixelEvents)
        .where(
          and(
            eq(pixelEvents.artistId, artistId.toString()),
            eq(pixelEvents.eventType, "purchase"),
            gte(pixelEvents.timestamp, start),
            lte(pixelEvents.timestamp, end)
          )
        );

      const views = productViews?.count || 0;
      const carts = addToCarts?.count || 0;
      const checkoutStarts = checkouts?.count || 0;
      const completedPurchases = purchases?.count || 0;

      return {
        stages: [
          {
            name: "Product Views",
            count: views,
            percentage: 100,
          },
          {
            name: "Add to Cart",
            count: carts,
            percentage: views > 0 ? Math.round((carts / views) * 100) : 0,
          },
          {
            name: "Checkout Started",
            count: checkoutStarts,
            percentage: views > 0 ? Math.round((checkoutStarts / views) * 100) : 0,
          },
          {
            name: "Purchase Completed",
            count: completedPurchases,
            percentage:
              views > 0 ? Math.round((completedPurchases / views) * 100) : 0,
          },
        ],
        overallConversionRate:
          views > 0 ? Math.round((completedPurchases / views) * 10000) / 100 : 0,
      };
    }),

  /**
   * Get realtime visitor count
   * Returns number of active visitors in last 5 minutes
   */
  getRealtimeVisitors: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { artistId } = input;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const [result] = await db
        .select({ count: count() })
        .from(pixelSessions)
        .where(
          and(
            eq(pixelSessions.artistId, artistId.toString()),
            gte(pixelSessions.lastActivityAt, fiveMinutesAgo)
          )
        );

      return {
        count: result?.count || 0,
        timestamp: new Date().toISOString(),
      };
    }),
});
