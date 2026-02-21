import { z } from "zod";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { productReviews, products, artistProfiles } from "../../drizzle/schema";

export const reviewAnalyticsRouter = router({
  /**
   * Get review analytics for an artist's products
   */
  getArtistAnalytics: protectedProcedure
    .input(z.object({
      artistId: z.number(),
      timeRange: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify user owns the artist profile
      const [artist] = await db
        .select()
        .from(artistProfiles)
        .where(and(
          eq(artistProfiles.id, input.artistId),
          eq(artistProfiles.userId, ctx.user.id)
        ))
        .limit(1);

      if (!artist) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only view analytics for your own products" });
      }

      // Calculate date filter
      const now = new Date();
      let dateFilter;
      switch (input.timeRange) {
        case "7d":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(0); // All time
      }

      // Get overall stats
      const [stats] = await db
        .select({
          totalReviews: sql<number>`COUNT(*)`,
          averageRating: sql<number>`AVG(${productReviews.rating})`,
          fiveStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 5 THEN 1 ELSE 0 END)`,
          fourStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 4 THEN 1 ELSE 0 END)`,
          threeStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 3 THEN 1 ELSE 0 END)`,
          twoStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 2 THEN 1 ELSE 0 END)`,
          oneStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 1 THEN 1 ELSE 0 END)`,
          verifiedPurchaseCount: sql<number>`SUM(CASE WHEN ${productReviews.verifiedPurchase} = 1 THEN 1 ELSE 0 END)`,
        })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .where(and(
          eq(products.artistId, input.artistId),
          eq(productReviews.status, "approved"),
          gte(productReviews.createdAt, dateFilter)
        ));

      // Get rating trend (reviews per day)
      const trend = await db
        .select({
          date: sql<string>`DATE(${productReviews.createdAt})`,
          count: sql<number>`COUNT(*)`,
          averageRating: sql<number>`AVG(${productReviews.rating})`,
        })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .where(and(
          eq(products.artistId, input.artistId),
          eq(productReviews.status, "approved"),
          gte(productReviews.createdAt, dateFilter)
        ))
        .groupBy(sql`DATE(${productReviews.createdAt})`)
        .orderBy(sql`DATE(${productReviews.createdAt})`);

      // Get most helpful reviews
      const topReviews = await db
        .select({
          id: productReviews.id,
          productId: productReviews.productId,
          productName: products.name,
          rating: productReviews.rating,
          title: productReviews.title,
          content: productReviews.content,
          reviewerName: productReviews.reviewerName,
          helpfulVotes: productReviews.helpfulVotes,
          createdAt: productReviews.createdAt,
        })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .where(and(
          eq(products.artistId, input.artistId),
          eq(productReviews.status, "approved"),
          gte(productReviews.createdAt, dateFilter)
        ))
        .orderBy(desc(productReviews.helpfulVotes))
        .limit(10);

      // Get product breakdown
      const productBreakdown = await db
        .select({
          productId: products.id,
          productName: products.name,
          reviewCount: sql<number>`COUNT(*)`,
          averageRating: sql<number>`AVG(${productReviews.rating})`,
        })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .where(and(
          eq(products.artistId, input.artistId),
          eq(productReviews.status, "approved"),
          gte(productReviews.createdAt, dateFilter)
        ))
        .groupBy(products.id, products.name)
        .orderBy(desc(sql`COUNT(*)`));

      return {
        stats: {
          totalReviews: Number(stats?.totalReviews || 0),
          averageRating: Number(stats?.averageRating || 0),
          distribution: {
            5: Number(stats?.fiveStarCount || 0),
            4: Number(stats?.fourStarCount || 0),
            3: Number(stats?.threeStarCount || 0),
            2: Number(stats?.twoStarCount || 0),
            1: Number(stats?.oneStarCount || 0),
          },
          verifiedPurchasePercentage: stats?.totalReviews
            ? (Number(stats.verifiedPurchaseCount) / Number(stats.totalReviews)) * 100
            : 0,
        },
        trend: trend.map(t => ({
          date: t.date,
          count: Number(t.count),
          averageRating: Number(t.averageRating),
        })),
        topReviews: topReviews.map(r => ({
          ...r,
          rating: Number(r.rating),
          helpfulVotes: Number(r.helpfulVotes),
        })),
        productBreakdown: productBreakdown.map(p => ({
          productId: Number(p.productId),
          productName: p.productName || "Unknown Product",
          reviewCount: Number(p.reviewCount),
          averageRating: Number(p.averageRating),
        })),
      };
    }),
});
