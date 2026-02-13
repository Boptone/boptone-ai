/**
 * INVISIBLE FLYWHEEL SYSTEM
 * Strategic moat that amplifies artist revenue through network effects
 * 
 * Core principle: "If artists make money, Boptone makes money"
 * 
 * This module handles:
 * - 1% network pool contributions from all streams
 * - Discovery relationship tracking (who discovered whom)
 * - Discovery bonus calculations (2% for 30 days)
 * - Super Fan detection and 5% multipliers
 * - Milestone detection and automated boosts
 * 
 * Artists never see the mechanics, only the benefits.
 */

import { getDb } from "./db";
import { 
  flywheelNetworkPool, 
  flywheelDiscoveryTracking,
  flywheelDiscoveryBonuses,
  flywheelMilestones,
  flywheelSuperFans,
  flywheelBoosts,
  bapStreams,
  bapTracks,
  artistProfiles
} from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// ============================================================================
// NETWORK POOL MECHANICS
// ============================================================================

/**
 * Contribute 1% of stream revenue to network pool
 * Called automatically when a stream is recorded
 */
export async function contributeToNetworkPool(params: {
  streamId: number;
  trackId: number;
  streamRevenue: number; // Total revenue in cents
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const contributionAmount = Math.floor(params.streamRevenue * 0.01); // 1% of stream revenue

  await db.insert(flywheelNetworkPool).values({
    streamId: params.streamId,
    trackId: params.trackId,
    contributionAmount,
    allocatedTo: "unallocated",
  });
}

/**
 * Get current network pool balance (unallocated funds)
 */
export async function getNetworkPoolBalance(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ total: sql<number>`SUM(${flywheelNetworkPool.contributionAmount})` })
    .from(flywheelNetworkPool)
    .where(eq(flywheelNetworkPool.allocatedTo, "unallocated"));

  return result[0]?.total || 0;
}

/**
 * Allocate pool funds to a specific purpose
 */
export async function allocatePoolFunds(params: {
  amount: number;
  allocatedTo: "milestone_boost" | "discovery_bonus" | "superfan_multiplier";
  allocationId: number;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get oldest unallocated contributions up to the amount needed
  const contributions = await db
    .select()
    .from(flywheelNetworkPool)
    .where(eq(flywheelNetworkPool.allocatedTo, "unallocated"))
    .orderBy(flywheelNetworkPool.createdAt)
    .limit(1000); // Process in batches

  let remaining = params.amount;
  const idsToUpdate: number[] = [];

  for (const contrib of contributions) {
    if (remaining <= 0) break;
    idsToUpdate.push(contrib.id);
    remaining -= contrib.contributionAmount;
  }

  if (idsToUpdate.length === 0) return false; // Not enough funds

  // Update contributions to mark as allocated
  for (const id of idsToUpdate) {
    await db
      .update(flywheelNetworkPool)
      .set({
        allocatedTo: params.allocatedTo,
        allocationId: params.allocationId,
      })
      .where(eq(flywheelNetworkPool.id, id));
  }

  return true;
}

// ============================================================================
// DISCOVERY TRACKING
// ============================================================================

/**
 * Track a discovery event when a fan first streams an artist
 * Enables 2% discovery bonuses for the referring artist
 */
export async function trackDiscovery(params: {
  fanUserId: number;
  discoveredArtistId: number;
  firstStreamId: number;
  source: "discover_page" | "artist_profile" | "playlist" | "search" | "recommendation";
  referrerArtistId?: number; // Artist whose page/playlist led to discovery
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Only track if there's a referrer artist (discovery bonus applies)
  if (!params.referrerArtistId) return;

  // Check if this fan has already discovered this artist
  const existing = await db
    .select()
    .from(flywheelDiscoveryTracking)
    .where(
      and(
        eq(flywheelDiscoveryTracking.fanUserId, params.fanUserId),
        eq(flywheelDiscoveryTracking.discoveredArtistId, params.discoveredArtistId)
      )
    )
    .limit(1);

  if (existing.length > 0) return; // Already tracked

  // Create discovery tracking record
  const bonusExpiresAt = new Date();
  bonusExpiresAt.setDate(bonusExpiresAt.getDate() + 30); // 30-day bonus window

  await db.insert(flywheelDiscoveryTracking).values({
    discovererArtistId: params.referrerArtistId,
    discoveredArtistId: params.discoveredArtistId,
    fanUserId: params.fanUserId,
    source: params.source,
    firstStreamId: params.firstStreamId,
    bonusActive: true,
    bonusExpiresAt,
    totalBonusEarned: 0,
  });
}

/**
 * Get active discovery relationships for an artist
 * Returns artists who should receive discovery bonuses from this artist's streams
 */
export async function getActiveDiscoverers(artistId: number): Promise<Array<{
  discovererArtistId: number;
  discoveryTrackingId: number;
  bonusExpiresAt: Date;
}>> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  const discoveries = await db
    .select({
      discovererArtistId: flywheelDiscoveryTracking.discovererArtistId,
      discoveryTrackingId: flywheelDiscoveryTracking.id,
      bonusExpiresAt: flywheelDiscoveryTracking.bonusExpiresAt,
    })
    .from(flywheelDiscoveryTracking)
    .where(
      and(
        eq(flywheelDiscoveryTracking.discoveredArtistId, artistId),
        eq(flywheelDiscoveryTracking.bonusActive, true),
        gte(flywheelDiscoveryTracking.bonusExpiresAt, now)
      )
    );

  return discoveries;
}

/**
 * Calculate and record discovery bonus
 * Called when a stream happens on a discovered artist
 */
export async function recordDiscoveryBonus(params: {
  discoveryTrackingId: number;
  discovererArtistId: number;
  discoveredArtistId: number;
  streamId: number;
  trackId: number;
  baseRevenue: number; // Artist's 90% share in cents
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const bonusAmount = Math.floor(params.baseRevenue * 0.02); // 2% of artist revenue

  // Create discovery bonus record
  await db.insert(flywheelDiscoveryBonuses).values({
    discoveryTrackingId: params.discoveryTrackingId,
    discovererArtistId: params.discovererArtistId,
    discoveredArtistId: params.discoveredArtistId,
    streamId: params.streamId,
    trackId: params.trackId,
    baseRevenue: params.baseRevenue,
    bonusAmount,
    fundedBy: "network_pool",
    status: "pending",
  });

  // Update total bonus earned on discovery tracking record
  await db
    .update(flywheelDiscoveryTracking)
    .set({
      totalBonusEarned: sql`${flywheelDiscoveryTracking.totalBonusEarned} + ${bonusAmount}`,
    })
    .where(eq(flywheelDiscoveryTracking.id, params.discoveryTrackingId));

  // Allocate pool funds for this bonus
  await allocatePoolFunds({
    amount: bonusAmount,
    allocatedTo: "discovery_bonus",
    allocationId: params.discoveryTrackingId,
  });
}

/**
 * Get discovery bonuses for an artist (for earnings display)
 */
export async function getArtistDiscoveryBonuses(params: {
  artistId: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  totalBonus: number;
  bonusCount: number;
}> {
  const db = await getDb();
  if (!db) return { totalBonus: 0, bonusCount: 0 };

  const conditions = [eq(flywheelDiscoveryBonuses.discovererArtistId, params.artistId)];
  
  if (params.startDate) {
    conditions.push(gte(flywheelDiscoveryBonuses.createdAt, params.startDate));
  }
  if (params.endDate) {
    conditions.push(lte(flywheelDiscoveryBonuses.createdAt, params.endDate));
  }

  const result = await db
    .select({
      totalBonus: sql<number>`SUM(${flywheelDiscoveryBonuses.bonusAmount})`,
      bonusCount: sql<number>`COUNT(*)`,
    })
    .from(flywheelDiscoveryBonuses)
    .where(and(...conditions));

  return {
    totalBonus: result[0]?.totalBonus || 0,
    bonusCount: result[0]?.bonusCount || 0,
  };
}

// ============================================================================
// MILESTONE DETECTION
// ============================================================================

/**
 * Check if artist has reached a new milestone
 * Called periodically or after each stream
 */
export async function checkMilestones(artistId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get total stream count for artist
  const streamCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bapStreams)
    .innerJoin(bapTracks, eq(bapStreams.trackId, bapTracks.id))
    .where(eq(bapTracks.artistId, artistId));

  const totalStreams = streamCount[0]?.count || 0;

  // Define milestones
  const milestones: Array<{ type: string; threshold: number }> = [
    { type: "1k_streams", threshold: 1000 },
    { type: "10k_streams", threshold: 10000 },
    { type: "50k_streams", threshold: 50000 },
    { type: "100k_streams", threshold: 100000 },
    { type: "500k_streams", threshold: 500000 },
    { type: "1m_streams", threshold: 1000000 },
  ];

  for (const milestone of milestones) {
    if (totalStreams >= milestone.threshold) {
      // Check if milestone already recorded
      const existing = await db
        .select()
        .from(flywheelMilestones)
        .where(
          and(
            eq(flywheelMilestones.artistProfileId, artistId),
            eq(flywheelMilestones.milestoneType, milestone.type as any)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Record new milestone
        await db.insert(flywheelMilestones).values({
          artistProfileId: artistId,
          milestoneType: milestone.type as any,
          streamCount: totalStreams,
          boostTriggered: false,
          additionalStreams: 0,
          additionalRevenue: 0,
        });

        // Trigger automated boost (handled in next phase)
        await triggerMilestoneBoost(artistId, milestone.type);
      }
    }
  }
}

/**
 * Trigger automated promotional boost for milestone achievement
 * Creates 7-day boost campaign (Discover featuring, email blast, etc.)
 */
async function triggerMilestoneBoost(artistId: number, milestoneType: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get milestone record
  const milestone = await db
    .select()
    .from(flywheelMilestones)
    .where(
      and(
        eq(flywheelMilestones.artistProfileId, artistId),
        eq(flywheelMilestones.milestoneType, milestoneType as any)
      )
    )
    .limit(1);

  if (milestone.length === 0) return;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // 7-day boost

  // Create boost campaign
  await db.insert(flywheelBoosts).values({
    milestoneId: milestone[0].id,
    artistProfileId: artistId,
    boostType: "discover_featured", // Primary boost type
    startDate,
    endDate,
    targetAudience: "all",
    impressions: 0,
    clicks: 0,
    newStreams: 0,
    newFollowers: 0,
    revenueGenerated: 0,
    poolCostCents: 0,
    status: "active",
  });

  // Mark milestone as boost triggered
  await db
    .update(flywheelMilestones)
    .set({
      boostTriggered: true,
      boostType: "discover_featured",
      boostStartDate: startDate,
      boostEndDate: endDate,
    })
    .where(eq(flywheelMilestones.id, milestone[0].id));
}

/**
 * Get active boosts for Discover page featuring
 */
export async function getActiveBoosts(): Promise<Array<{
  artistProfileId: number;
  boostType: string;
  endDate: Date;
}>> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  const boosts = await db
    .select({
      artistProfileId: flywheelBoosts.artistProfileId,
      boostType: flywheelBoosts.boostType,
      endDate: flywheelBoosts.endDate,
    })
    .from(flywheelBoosts)
    .where(
      and(
        eq(flywheelBoosts.status, "active"),
        gte(flywheelBoosts.endDate, now)
      )
    );

  return boosts;
}

// ============================================================================
// SUPER FAN DETECTION
// ============================================================================

/**
 * Check if user qualifies as Super Fan (streams 3+ artists in 30 days)
 * Called after each stream
 */
export async function checkSuperFanStatus(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Count unique artists streamed in last 30 days
  const uniqueArtists = await db
    .select({ 
      count: sql<number>`COUNT(DISTINCT ${bapTracks.artistId})`,
      totalStreams: sql<number>`COUNT(*)`,
    })
    .from(bapStreams)
    .innerJoin(bapTracks, eq(bapStreams.trackId, bapTracks.id))
    .where(
      and(
        eq(bapStreams.userId, userId),
        gte(bapStreams.createdAt, thirtyDaysAgo)
      )
    );

  const uniqueArtistCount = uniqueArtists[0]?.count || 0;
  const totalStreams = uniqueArtists[0]?.totalStreams || 0;

  // Check if user already has Super Fan record
  const existing = await db
    .select()
    .from(flywheelSuperFans)
    .where(eq(flywheelSuperFans.userId, userId))
    .limit(1);

  if (uniqueArtistCount >= 3) {
    // User qualifies as Super Fan
    if (existing.length === 0) {
      // Create new Super Fan record
      await db.insert(flywheelSuperFans).values({
        userId,
        status: "active",
        uniqueArtistsStreamed: uniqueArtistCount,
        totalStreamsLast30Days: totalStreams,
        multiplierStreams: 0,
        totalBonusGenerated: 0,
      });
    } else {
      // Update existing record
      await db
        .update(flywheelSuperFans)
        .set({
          status: "active",
          uniqueArtistsStreamed: uniqueArtistCount,
          totalStreamsLast30Days: totalStreams,
          lastStreamAt: new Date(),
        })
        .where(eq(flywheelSuperFans.userId, userId));
    }
  } else {
    // User no longer qualifies
    if (existing.length > 0) {
      await db
        .update(flywheelSuperFans)
        .set({ status: "inactive" })
        .where(eq(flywheelSuperFans.userId, userId));
    }
  }
}

/**
 * Check if user is an active Super Fan
 */
export async function isSuperFan(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const superFan = await db
    .select()
    .from(flywheelSuperFans)
    .where(
      and(
        eq(flywheelSuperFans.userId, userId),
        eq(flywheelSuperFans.status, "active")
      )
    )
    .limit(1);

  return superFan.length > 0;
}

/**
 * Apply Super Fan 5% multiplier to stream revenue
 */
export async function applySuperFanMultiplier(params: {
  userId: number;
  baseRevenue: number;
}): Promise<number> {
  const isSF = await isSuperFan(params.userId);
  if (!isSF) return 0;

  const bonusAmount = Math.floor(params.baseRevenue * 0.05); // 5% multiplier

  const db = await getDb();
  if (!db) return 0;

  // Update Super Fan stats
  await db
    .update(flywheelSuperFans)
    .set({
      multiplierStreams: sql`${flywheelSuperFans.multiplierStreams} + 1`,
      totalBonusGenerated: sql`${flywheelSuperFans.totalBonusGenerated} + ${bonusAmount}`,
    })
    .where(eq(flywheelSuperFans.userId, params.userId));

  // Allocate pool funds for multiplier
  await allocatePoolFunds({
    amount: bonusAmount,
    allocatedTo: "superfan_multiplier",
    allocationId: params.userId,
  });

  return bonusAmount;
}
