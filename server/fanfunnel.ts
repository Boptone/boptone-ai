import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  fans,
  fanEvents,
  smartLinks,
  linkClicks,
  fanSegments,
  funnelSnapshots,
  InsertFan,
  InsertFanEvent,
  InsertSmartLink,
  InsertLinkClick,
  InsertFanSegment,
  Fan,
  SmartLink,
} from "../drizzle/schema";
import crypto from "crypto";

// ============================================================================
// FAN MANAGEMENT
// ============================================================================

export async function createOrUpdateFan(data: InsertFan): Promise<Fan | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if fan exists by email or phone
  if (data.email) {
    const existing = await db
      .select()
      .from(fans)
      .where(and(eq(fans.artistId, data.artistId), eq(fans.email, data.email)))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing fan
      await db
        .update(fans)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(fans.id, existing[0].id));
      return { ...existing[0], ...data };
    }
  }

  // Create new fan
  const result = await db.insert(fans).values({
    ...data,
    firstInteractionAt: new Date(),
  });
  
  const newFan = await db
    .select()
    .from(fans)
    .where(eq(fans.id, result[0].insertId))
    .limit(1);
  
  return newFan[0] || null;
}

export async function getFansByArtist(artistId: number, options?: {
  funnelStage?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(fans).where(eq(fans.artistId, artistId));
  
  if (options?.funnelStage) {
    query = query.where(eq(fans.funnelStage, options.funnelStage as any));
  }
  
  return query
    .orderBy(desc(fans.fanScore))
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);
}

export async function getFanById(fanId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(fans).where(eq(fans.id, fanId)).limit(1);
  return result[0] || null;
}

export async function updateFanScore(fanId: number) {
  const db = await getDb();
  if (!db) return;

  // Calculate fan score based on events
  const fan = await getFanById(fanId);
  if (!fan) return;

  // Get event counts
  const events = await db
    .select()
    .from(fanEvents)
    .where(eq(fanEvents.fanId, fanId));

  // Score calculation:
  // - Each interaction: +1
  // - Purchase: +20
  // - Referral: +15
  // - Email signup: +10
  // - Stream: +2
  // - Recency bonus: up to +20 for activity in last 30 days
  
  let score = 0;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  for (const event of events) {
    switch (event.eventType) {
      case "merch_purchase":
      case "ticket_purchase":
        score += 20;
        break;
      case "referral":
        score += 15;
        break;
      case "email_signup":
        score += 10;
        break;
      case "stream":
        score += 2;
        break;
      case "tip":
        score += 25;
        break;
      default:
        score += 1;
    }
    
    // Recency bonus
    if (event.createdAt >= thirtyDaysAgo) {
      score += 2;
    }
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine funnel stage based on score and events
  let funnelStage: "discovered" | "follower" | "engaged" | "customer" | "superfan" = "discovered";
  
  const hasPurchased = events.some(e => 
    e.eventType === "merch_purchase" || e.eventType === "ticket_purchase"
  );
  const hasFollowed = events.some(e => e.eventType === "follow");
  const hasEngaged = events.some(e => 
    ["email_signup", "comment", "share", "like"].includes(e.eventType)
  );

  if (score >= 80 && hasPurchased) {
    funnelStage = "superfan";
  } else if (hasPurchased) {
    funnelStage = "customer";
  } else if (hasEngaged) {
    funnelStage = "engaged";
  } else if (hasFollowed) {
    funnelStage = "follower";
  }

  await db
    .update(fans)
    .set({
      fanScore: score,
      funnelStage,
      totalInteractions: events.length,
      lastInteractionAt: new Date(),
    })
    .where(eq(fans.id, fanId));
}

// ============================================================================
// FAN EVENTS
// ============================================================================

export async function recordFanEvent(data: InsertFanEvent) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(fanEvents).values(data);
  
  // Update fan score after recording event
  if (data.fanId) {
    await updateFanScore(data.fanId);
  }

  return result[0].insertId;
}

export async function getFanEvents(fanId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(fanEvents)
    .where(eq(fanEvents.fanId, fanId))
    .orderBy(desc(fanEvents.createdAt))
    .limit(limit);
}

// ============================================================================
// SMART LINKS
// ============================================================================

export async function createSmartLink(data: InsertSmartLink): Promise<SmartLink | null> {
  const db = await getDb();
  if (!db) return null;

  // Generate unique slug if not provided
  if (!data.slug) {
    data.slug = crypto.randomBytes(4).toString("hex");
  }

  const result = await db.insert(smartLinks).values(data);
  
  const newLink = await db
    .select()
    .from(smartLinks)
    .where(eq(smartLinks.id, result[0].insertId))
    .limit(1);
  
  return newLink[0] || null;
}

export async function getSmartLinkBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(smartLinks)
    .where(eq(smartLinks.slug, slug))
    .limit(1);
  
  return result[0] || null;
}

export async function getSmartLinksByArtist(artistId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(smartLinks)
    .where(eq(smartLinks.artistId, artistId))
    .orderBy(desc(smartLinks.createdAt));
}

export async function updateSmartLink(linkId: number, data: Partial<InsertSmartLink>) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(smartLinks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(smartLinks.id, linkId));
}

export async function incrementLinkClicks(linkId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(smartLinks)
    .set({
      totalClicks: sql`${smartLinks.totalClicks} + 1`,
    })
    .where(eq(smartLinks.id, linkId));
}

// ============================================================================
// LINK CLICKS
// ============================================================================

export async function recordLinkClick(data: InsertLinkClick) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(linkClicks).values(data);
  
  // Increment total clicks on the smart link
  await incrementLinkClicks(data.linkId);

  return result[0].insertId;
}

export async function getLinkClickStats(linkId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get click counts by destination
  const destinationStats = await db
    .select({
      destination: linkClicks.destination,
      count: sql<number>`count(*)`,
    })
    .from(linkClicks)
    .where(eq(linkClicks.linkId, linkId))
    .groupBy(linkClicks.destination);

  // Get click counts by UTM source
  const sourceStats = await db
    .select({
      source: linkClicks.utmSource,
      count: sql<number>`count(*)`,
    })
    .from(linkClicks)
    .where(eq(linkClicks.linkId, linkId))
    .groupBy(linkClicks.utmSource);

  // Get click counts by country
  const countryStats = await db
    .select({
      country: linkClicks.country,
      count: sql<number>`count(*)`,
    })
    .from(linkClicks)
    .where(eq(linkClicks.linkId, linkId))
    .groupBy(linkClicks.country);

  return {
    byDestination: destinationStats,
    bySource: sourceStats,
    byCountry: countryStats,
  };
}

// ============================================================================
// FAN SEGMENTS
// ============================================================================

export async function createFanSegment(data: InsertFanSegment) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(fanSegments).values(data);
  return result[0].insertId;
}

export async function getFanSegmentsByArtist(artistId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(fanSegments)
    .where(eq(fanSegments.artistId, artistId))
    .orderBy(desc(fanSegments.createdAt));
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export async function getFunnelStats(artistId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get counts by funnel stage
  const stageCounts = await db
    .select({
      stage: fans.funnelStage,
      count: sql<number>`count(*)`,
    })
    .from(fans)
    .where(eq(fans.artistId, artistId))
    .groupBy(fans.funnelStage);

  // Get counts by discovery source
  const sourceCounts = await db
    .select({
      source: fans.discoverySource,
      count: sql<number>`count(*)`,
    })
    .from(fans)
    .where(eq(fans.artistId, artistId))
    .groupBy(fans.discoverySource);

  // Get top fans by score
  const topFans = await db
    .select()
    .from(fans)
    .where(eq(fans.artistId, artistId))
    .orderBy(desc(fans.fanScore))
    .limit(10);

  // Calculate totals
  const totalFans = stageCounts.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = await db
    .select({
      total: sql<number>`sum(${fans.lifetimeValue})`,
    })
    .from(fans)
    .where(eq(fans.artistId, artistId));

  return {
    totalFans,
    totalRevenue: totalRevenue[0]?.total || 0,
    byStage: stageCounts.reduce((acc, s) => {
      acc[s.stage] = s.count;
      return acc;
    }, {} as Record<string, number>),
    bySource: sourceCounts.reduce((acc, s) => {
      if (s.source) acc[s.source] = s.count;
      return acc;
    }, {} as Record<string, number>),
    topFans,
  };
}

export async function saveFunnelSnapshot(artistId: number) {
  const db = await getDb();
  if (!db) return;

  const stats = await getFunnelStats(artistId);
  if (!stats) return;

  await db.insert(funnelSnapshots).values({
    artistId,
    snapshotDate: new Date(),
    discoveredCount: stats.byStage.discovered || 0,
    followerCount: stats.byStage.follower || 0,
    engagedCount: stats.byStage.engaged || 0,
    customerCount: stats.byStage.customer || 0,
    superfanCount: stats.byStage.superfan || 0,
    sourceBreakdown: stats.bySource,
  });
}
