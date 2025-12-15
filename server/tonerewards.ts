/**
 * TONE REWARDS - Database Helpers
 * The revolutionary membership system where fans become investors
 * and artists get rewarded for building on Boptone
 */

import { eq, and, sql, desc, sum } from "drizzle-orm";
import { getDb } from "./db";
import {
  fanMemberships,
  artistBacking,
  backingTransactions,
  cashbackRewards,
  artistDividends,
  investorRevenueShare,
  artistProfiles,
  users,
  InsertFanMembership,
  InsertArtistBacking,
  InsertBackingTransaction,
} from "../drizzle/schema";

// Membership tier configuration
export const MEMBERSHIP_TIERS = {
  basic: {
    name: "Basic",
    annualFee: 0,
    monthlyEquivalent: 0,
    cashbackRate: 0,
    features: ["Limited streaming", "Discover artists", "Kick In tips only"],
  },
  member: {
    name: "Member",
    annualFee: 36,
    monthlyEquivalent: 3,
    cashbackRate: 0,
    features: ["Unlimited streaming", "Support unlimited artists", "Early releases", "Named supporter status"],
  },
  executive: {
    name: "Executive",
    annualFee: 99,
    monthlyEquivalent: 8.25,
    cashbackRate: 0.02, // 2% cashback
    features: ["Everything in Member", "2% annual cashback", "Exclusive content", "VIP supporter badge"],
  },
};

// Backing tier configuration
export const BACKING_TIERS = {
  backer: {
    name: "Backer",
    minAmount: 3,
    maxAmount: 9.99,
    revenueShare: 0,
    features: ["Support artist monthly", "Named in supporter list"],
  },
  patron: {
    name: "Patron",
    minAmount: 10,
    maxAmount: 24.99,
    revenueShare: 0,
    features: ["Everything in Backer", "Early access to releases", "Exclusive content"],
  },
  investor: {
    name: "Investor",
    minAmount: 25,
    maxAmount: null,
    revenueShare: 0.0002, // 0.02% of artist earnings
    features: ["Everything in Patron", "Revenue share on artist earnings", "Direct artist access"],
  },
};

// Artist dividend rate
export const ARTIST_DIVIDEND_RATE = 0.03; // 3% of earnings

// ============================================================================
// FAN MEMBERSHIP FUNCTIONS
// ============================================================================

export async function createFanMembership(data: InsertFanMembership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tier = data.tier || "basic";
  const tierConfig = MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS];

  const renewalDate = tier !== "basic" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;

  await db.insert(fanMemberships).values({
    ...data,
    annualFee: tierConfig.annualFee.toString(),
    cashbackRate: tierConfig.cashbackRate.toString(),
    renewalDate,
  });
}

export async function getFanMembership(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(fanMemberships)
    .where(eq(fanMemberships.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function upgradeMembership(userId: number, newTier: "member" | "executive") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tierConfig = MEMBERSHIP_TIERS[newTier];
  const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  await db
    .update(fanMemberships)
    .set({
      tier: newTier,
      annualFee: tierConfig.annualFee.toString(),
      cashbackRate: tierConfig.cashbackRate.toString(),
      renewalDate,
      status: "active",
    })
    .where(eq(fanMemberships.userId, userId));
}

// ============================================================================
// ARTIST BACKING FUNCTIONS
// ============================================================================

export async function createArtistBacking(data: InsertArtistBacking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const amount = parseFloat(data.monthlyAmount as string);
  let tier: "backer" | "patron" | "investor" = "backer";
  let revenueShare = 0;

  if (amount >= 25) {
    tier = "investor";
    revenueShare = BACKING_TIERS.investor.revenueShare;
  } else if (amount >= 10) {
    tier = "patron";
  }

  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(artistBacking).values({
    ...data,
    tier,
    revenueSharePercent: revenueShare.toString(),
    nextBillingDate,
  });
}

export async function getArtistBackers(artistProfileId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      backing: artistBacking,
      fan: users,
    })
    .from(artistBacking)
    .innerJoin(users, eq(artistBacking.fanUserId, users.id))
    .where(
      and(
        eq(artistBacking.artistProfileId, artistProfileId),
        eq(artistBacking.status, "active")
      )
    )
    .orderBy(desc(artistBacking.monthlyAmount));

  return result;
}

export async function getFanBackings(fanUserId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      backing: artistBacking,
      artist: artistProfiles,
    })
    .from(artistBacking)
    .innerJoin(artistProfiles, eq(artistBacking.artistProfileId, artistProfiles.id))
    .where(eq(artistBacking.fanUserId, fanUserId))
    .orderBy(desc(artistBacking.createdAt));

  return result;
}

export async function getArtistBackingStats(artistProfileId: number) {
  const db = await getDb();
  if (!db) return { totalBackers: 0, monthlyRevenue: 0, totalContributed: 0 };

  const result = await db
    .select({
      totalBackers: sql<number>`COUNT(*)`,
      monthlyRevenue: sql<number>`SUM(${artistBacking.monthlyAmount})`,
      totalContributed: sql<number>`SUM(${artistBacking.totalContributed})`,
    })
    .from(artistBacking)
    .where(
      and(
        eq(artistBacking.artistProfileId, artistProfileId),
        eq(artistBacking.status, "active")
      )
    );

  return {
    totalBackers: Number(result[0]?.totalBackers || 0),
    monthlyRevenue: Number(result[0]?.monthlyRevenue || 0),
    totalContributed: Number(result[0]?.totalContributed || 0),
  };
}

// ============================================================================
// TRANSACTION & CASHBACK FUNCTIONS
// ============================================================================

export async function recordBackingTransaction(data: InsertBackingTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get fan's membership to calculate cashback
  const membership = await getFanMembership(data.fanUserId);
  const cashbackRate = membership?.tier === "executive" ? 0.02 : 0;
  const cashbackAmount = parseFloat(data.amount as string) * cashbackRate;

  await db.insert(backingTransactions).values({
    ...data,
    cashbackAmount: cashbackAmount.toFixed(2),
    year: new Date().getFullYear(),
  });

  // Update artist backing total if it's a backing payment
  if (data.type === "backing" && data.artistProfileId) {
    await db
      .update(artistBacking)
      .set({
        totalContributed: sql`${artistBacking.totalContributed} + ${data.amount}`,
      })
      .where(
        and(
          eq(artistBacking.fanUserId, data.fanUserId),
          eq(artistBacking.artistProfileId, data.artistProfileId)
        )
      );
  }
}

export async function getFanYearlySpending(fanUserId: number, year: number) {
  const db = await getDb();
  if (!db) return { totalSpending: 0, cashbackEarned: 0 };

  const result = await db
    .select({
      totalSpending: sql<number>`SUM(${backingTransactions.amount})`,
      cashbackEarned: sql<number>`SUM(${backingTransactions.cashbackAmount})`,
    })
    .from(backingTransactions)
    .where(
      and(
        eq(backingTransactions.fanUserId, fanUserId),
        eq(backingTransactions.year, year),
        eq(backingTransactions.cashbackEligible, true)
      )
    );

  return {
    totalSpending: Number(result[0]?.totalSpending || 0),
    cashbackEarned: Number(result[0]?.cashbackEarned || 0),
  };
}

export async function calculateAnnualCashback(fanUserId: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const membership = await getFanMembership(fanUserId);
  if (!membership || membership.tier !== "executive") {
    return null; // Only Executive members get cashback
  }

  const spending = await getFanYearlySpending(fanUserId, year);
  const cashbackRate = 0.02;
  const cashbackAmount = spending.totalSpending * cashbackRate;

  // Create or update cashback reward record
  const existing = await db
    .select()
    .from(cashbackRewards)
    .where(
      and(
        eq(cashbackRewards.fanUserId, fanUserId),
        eq(cashbackRewards.year, year)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cashbackRewards)
      .set({
        totalEligibleSpending: spending.totalSpending.toFixed(2),
        cashbackAmount: cashbackAmount.toFixed(2),
        status: "calculated",
      })
      .where(eq(cashbackRewards.id, existing[0].id));
  } else {
    await db.insert(cashbackRewards).values({
      fanUserId,
      year,
      totalEligibleSpending: spending.totalSpending.toFixed(2),
      cashbackRate: cashbackRate.toString(),
      cashbackAmount: cashbackAmount.toFixed(2),
      status: "calculated",
    });
  }

  return {
    totalSpending: spending.totalSpending,
    cashbackRate,
    cashbackAmount,
  };
}

// ============================================================================
// ARTIST DIVIDEND FUNCTIONS
// ============================================================================

export async function calculateArtistDividend(artistProfileId: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate total earnings from all backing transactions
  const result = await db
    .select({
      totalEarnings: sql<number>`SUM(${backingTransactions.artistShare})`,
    })
    .from(backingTransactions)
    .where(
      and(
        eq(backingTransactions.artistProfileId, artistProfileId),
        eq(backingTransactions.year, year)
      )
    );

  const totalEarnings = Number(result[0]?.totalEarnings || 0);
  const dividendAmount = totalEarnings * ARTIST_DIVIDEND_RATE;

  // Create or update dividend record
  const existing = await db
    .select()
    .from(artistDividends)
    .where(
      and(
        eq(artistDividends.artistProfileId, artistProfileId),
        eq(artistDividends.year, year)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(artistDividends)
      .set({
        totalEarnings: totalEarnings.toFixed(2),
        dividendAmount: dividendAmount.toFixed(2),
        status: "calculated",
      })
      .where(eq(artistDividends.id, existing[0].id));
  } else {
    await db.insert(artistDividends).values({
      artistProfileId,
      year,
      totalEarnings: totalEarnings.toFixed(2),
      dividendRate: ARTIST_DIVIDEND_RATE.toString(),
      dividendAmount: dividendAmount.toFixed(2),
      status: "calculated",
    });
  }

  return {
    totalEarnings,
    dividendRate: ARTIST_DIVIDEND_RATE,
    dividendAmount,
  };
}

export async function getArtistDividends(artistProfileId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(artistDividends)
    .where(eq(artistDividends.artistProfileId, artistProfileId))
    .orderBy(desc(artistDividends.year));
}

// ============================================================================
// INVESTOR REVENUE SHARE FUNCTIONS
// ============================================================================

export async function calculateInvestorShares(artistProfileId: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all investor-tier backers for this artist
  const investors = await db
    .select()
    .from(artistBacking)
    .where(
      and(
        eq(artistBacking.artistProfileId, artistProfileId),
        eq(artistBacking.tier, "investor"),
        eq(artistBacking.status, "active")
      )
    );

  if (investors.length === 0) return [];

  // Get artist's total earnings for the year
  const earningsResult = await db
    .select({
      totalEarnings: sql<number>`SUM(${backingTransactions.artistShare})`,
    })
    .from(backingTransactions)
    .where(
      and(
        eq(backingTransactions.artistProfileId, artistProfileId),
        eq(backingTransactions.year, year)
      )
    );

  const totalEarnings = Number(earningsResult[0]?.totalEarnings || 0);

  // Calculate and record each investor's share
  const shares = [];
  for (const investor of investors) {
    const sharePercent = parseFloat(investor.revenueSharePercent as string);
    const shareAmount = totalEarnings * sharePercent;

    await db.insert(investorRevenueShare).values({
      backingId: investor.id,
      fanUserId: investor.fanUserId,
      artistProfileId,
      year,
      artistTotalEarnings: totalEarnings.toFixed(2),
      sharePercent: sharePercent.toString(),
      shareAmount: shareAmount.toFixed(2),
      status: "calculated",
    });

    shares.push({
      investorId: investor.fanUserId,
      sharePercent,
      shareAmount,
    });
  }

  return shares;
}
