import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  InsertUser, 
  users,
  artistProfiles,
  InsertArtistProfile,
  streamingMetrics,
  InsertStreamingMetric,
  socialMediaMetrics,
  InsertSocialMediaMetric,
  revenueRecords,
  InsertRevenueRecord,
  microLoans,
  InsertMicroLoan,
  products,
  InsertProduct,
  releases,
  InsertRelease,
  infringements,
  InsertInfringement,
  tours,
  InsertTour,
  healthcarePlans,
  InsertHealthcarePlan,
  aiConversations,
  InsertAIConversation,
  opportunities,
  InsertOpportunity,
  notifications,
  InsertNotification,
  analyticsSnapshots,
  InsertAnalyticsSnapshot,
  payouts,
  type Payout,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

/**
 * Get database connection with connection pooling
 * Enterprise-grade pooling prevents connection exhaustion under load
 * Handles 10x more concurrent users than single connection
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Create connection pool if it doesn't exist
      if (!_pool) {
        _pool = mysql.createPool({
          uri: process.env.DATABASE_URL,
          connectionLimit: 10, // Max 10 concurrent connections
          waitForConnections: true, // Queue requests when pool is full
          queueLimit: 0, // Unlimited queue size
          enableKeepAlive: true, // Keep connections alive
          keepAliveInitialDelay: 0,
        });
        
        console.log("[Database] Connection pool created (max 10 connections)");
      }
      
      // Create Drizzle instance with pooled connection
      // @ts-ignore - Drizzle ORM type inference issue
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Gracefully close database connections
 * Called during server shutdown
 */
export async function closeDb() {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
    console.log("[Database] Connection pool closed");
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ARTIST PROFILE MANAGEMENT
// ============================================================================

export async function createArtistProfile(profile: InsertArtistProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(artistProfiles).values(profile);
  return result;
}

export async function getArtistProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(artistProfiles).where(eq(artistProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArtistProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(artistProfiles).where(eq(artistProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateArtistProfile(id: number, updates: Partial<InsertArtistProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(artistProfiles).set(updates).where(eq(artistProfiles.id, id));
}

export async function getAllArtistProfiles(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(artistProfiles).limit(limit).offset(offset).orderBy(desc(artistProfiles.priorityScore));
}

// ============================================================================
// STREAMING METRICS
// ============================================================================

export async function addStreamingMetric(metric: InsertStreamingMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(streamingMetrics).values(metric);
}

export async function getStreamingMetrics(artistId: number, platform?: string, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(streamingMetrics.artistId, artistId)];
  
  if (platform) {
    conditions.push(eq(streamingMetrics.platform, platform as any));
  }
  if (startDate) {
    conditions.push(gte(streamingMetrics.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(streamingMetrics.date, endDate));
  }
  
  return await db.select().from(streamingMetrics).where(and(...conditions)).orderBy(desc(streamingMetrics.date));
}

// ============================================================================
// SOCIAL MEDIA METRICS
// ============================================================================

export async function addSocialMediaMetric(metric: InsertSocialMediaMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(socialMediaMetrics).values(metric);
}

export async function getSocialMediaMetrics(artistId: number, platform?: string, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(socialMediaMetrics.artistId, artistId)];
  
  if (platform) {
    conditions.push(eq(socialMediaMetrics.platform, platform as any));
  }
  if (startDate) {
    conditions.push(gte(socialMediaMetrics.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(socialMediaMetrics.date, endDate));
  }
  
  return await db.select().from(socialMediaMetrics).where(and(...conditions)).orderBy(desc(socialMediaMetrics.date));
}

// ============================================================================
// REVENUE TRACKING
// ============================================================================

export async function addRevenueRecord(record: InsertRevenueRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(revenueRecords).values(record);
}

export async function getRevenueRecords(artistId: number, source?: string, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(revenueRecords.artistId, artistId)];
  
  if (source) {
    conditions.push(eq(revenueRecords.source, source as any));
  }
  if (status) {
    conditions.push(eq(revenueRecords.status, status as any));
  }
  
  return await db.select().from(revenueRecords).where(and(...conditions)).orderBy(desc(revenueRecords.createdAt));
}

export async function getTotalRevenue(artistId: number, source?: string) {
  const db = await getDb();
  if (!db) return 0;
  
  let conditions = [eq(revenueRecords.artistId, artistId), eq(revenueRecords.status, "paid")];
  
  if (source) {
    conditions.push(eq(revenueRecords.source, source as any));
  }
  
  const result = await db.select({
    total: sql<number>`SUM(${revenueRecords.amount})`
  }).from(revenueRecords).where(and(...conditions));
  
  return result[0]?.total || 0;
}

// ============================================================================
// MICRO-LOANS
// ============================================================================

export async function createMicroLoan(loan: InsertMicroLoan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(microLoans).values(loan);
  return result;
}

export async function getMicroLoans(artistId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(microLoans.artistId, artistId)];
  
  if (status) {
    conditions.push(eq(microLoans.status, status as any));
  }
  
  return await db.select().from(microLoans).where(and(...conditions)).orderBy(desc(microLoans.createdAt));
}

export async function updateMicroLoan(id: number, updates: Partial<InsertMicroLoan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(microLoans).set(updates).where(eq(microLoans.id, id));
}

// ============================================================================
// PRODUCTS / MERCHANDISE
// ============================================================================

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(product);
  return result;
}

// Product functions moved to ecommerceDb.ts

// ============================================================================
// RELEASES / DISTRIBUTION
// ============================================================================

export async function createRelease(release: InsertRelease) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(releases).values(release);
  return result;
}

export async function getReleases(artistId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(releases.artistId, artistId)];
  
  if (status) {
    conditions.push(eq(releases.status, status as any));
  }
  
  return await db.select().from(releases).where(and(...conditions)).orderBy(desc(releases.globalReleaseDate));
}

export async function updateRelease(id: number, updates: Partial<InsertRelease>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(releases).set(updates).where(eq(releases.id, id));
}

// ============================================================================
// IP PROTECTION / INFRINGEMENTS
// ============================================================================

export async function createInfringement(infringement: InsertInfringement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(infringements).values(infringement);
  return result;
}

export async function getInfringements(artistId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(infringements.artistId, artistId)];
  
  if (status) {
    conditions.push(eq(infringements.status, status as any));
  }
  
  return await db.select().from(infringements).where(and(...conditions)).orderBy(desc(infringements.detectedAt));
}

export async function updateInfringement(id: number, updates: Partial<InsertInfringement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(infringements).set(updates).where(eq(infringements.id, id));
}

// ============================================================================
// TOURS
// ============================================================================

export async function createTour(tour: InsertTour) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tours).values(tour);
  return result;
}

export async function getTours(artistId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(tours.artistId, artistId)];
  
  if (status) {
    conditions.push(eq(tours.status, status as any));
  }
  
  return await db.select().from(tours).where(and(...conditions)).orderBy(desc(tours.startDate));
}

export async function updateTour(id: number, updates: Partial<InsertTour>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tours).set(updates).where(eq(tours.id, id));
}

// ============================================================================
// HEALTHCARE PLANS
// ============================================================================

export async function createHealthcarePlan(plan: InsertHealthcarePlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(healthcarePlans).values(plan);
  return result;
}

export async function getHealthcarePlans(artistId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(healthcarePlans.artistId, artistId)];
  
  if (status) {
    conditions.push(eq(healthcarePlans.status, status as any));
  }
  
  return await db.select().from(healthcarePlans).where(and(...conditions)).orderBy(desc(healthcarePlans.enrollmentDate));
}

export async function updateHealthcarePlan(id: number, updates: Partial<InsertHealthcarePlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(healthcarePlans).set(updates).where(eq(healthcarePlans.id, id));
}

// ============================================================================
// AI CONVERSATIONS
// ============================================================================

export async function createAIConversation(conversation: InsertAIConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiConversations).values(conversation);
  return result;
}

export async function getAIConversations(artistId: number, context?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(aiConversations.artistId, artistId)];
  
  if (context) {
    conditions.push(eq(aiConversations.context, context as any));
  }
  
  return await db.select().from(aiConversations).where(and(...conditions)).orderBy(desc(aiConversations.updatedAt));
}

export async function updateAIConversation(id: number, updates: Partial<InsertAIConversation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(aiConversations).set(updates).where(eq(aiConversations.id, id));
}

// ============================================================================
// OPPORTUNITIES
// ============================================================================

export async function createOpportunity(opportunity: InsertOpportunity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(opportunities).values(opportunity);
  return result;
}

export async function getOpportunities(artistId: number, status?: string, opportunityType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(opportunities.artistId, artistId)];
  
  if (status) {
    conditions.push(eq(opportunities.status, status as any));
  }
  if (opportunityType) {
    conditions.push(eq(opportunities.opportunityType, opportunityType as any));
  }
  
  return await db.select().from(opportunities).where(and(...conditions)).orderBy(desc(opportunities.createdAt));
}

export async function updateOpportunity(id: number, updates: Partial<InsertOpportunity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(opportunities).set(updates).where(eq(opportunities.id, id));
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getNotifications(userId: number, isRead?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(notifications.userId, userId)];
  
  if (isRead !== undefined) {
    conditions.push(eq(notifications.isRead, isRead));
  }
  
  return await db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

// ============================================================================
// ANALYTICS SNAPSHOTS
// ============================================================================

export async function createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(analyticsSnapshots).values(snapshot);
  return result;
}

export async function getAnalyticsSnapshots(artistId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(analyticsSnapshots.artistId, artistId)];
  
  if (startDate) {
    conditions.push(gte(analyticsSnapshots.snapshotDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(analyticsSnapshots.snapshotDate, endDate));
  }
  
  return await db.select().from(analyticsSnapshots).where(and(...conditions)).orderBy(desc(analyticsSnapshots.snapshotDate));
}

// ============================================================================
// PAYOUT SYSTEM
// ============================================================================

import { 
  payoutAccounts,
  InsertPayoutAccount,
  PayoutAccount,
  InsertPayout,
  earningsBalance,
  InsertEarningsBalance,
  EarningsBalance,
} from "../drizzle/schema";

// Note: payouts and Payout type imported at top of file
import crypto from "crypto";

/**
 * Hash account number for duplicate detection (never store full account number)
 */
export function hashAccountNumber(accountNumber: string): string {
  return crypto.createHash("sha256").update(accountNumber).digest("hex");
}

/**
 * Get artist's payout accounts
 */
export async function getPayoutAccounts(artistId: number): Promise<PayoutAccount[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payout accounts: database not available");
    return [];
  }

  try {
    const accounts = await db
      .select()
      .from(payoutAccounts)
      .where(eq(payoutAccounts.artistId, artistId))
      .orderBy(desc(payoutAccounts.isDefault), desc(payoutAccounts.createdAt));
    
    return accounts;
  } catch (error) {
    console.error("[Database] Failed to get payout accounts:", error);
    throw error;
  }
}

/**
 * Add new payout account for artist
 */
export async function addPayoutAccount(account: InsertPayoutAccount): Promise<PayoutAccount> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // If this is set as default, unset other defaults
    if (account.isDefault) {
      await db
        .update(payoutAccounts)
        .set({ isDefault: false })
        .where(eq(payoutAccounts.artistId, account.artistId));
    }

    const result = await db.insert(payoutAccounts).values(account);
    const insertedId = Number(result[0].insertId);
    
    const inserted = await db
      .select()
      .from(payoutAccounts)
      .where(eq(payoutAccounts.id, insertedId))
      .limit(1);
    
    return inserted[0]!;
  } catch (error) {
    console.error("[Database] Failed to add payout account:", error);
    throw error;
  }
}

/**
 * Update payout account
 */
export async function updatePayoutAccount(
  accountId: number,
  artistId: number,
  updates: Partial<PayoutAccount>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // If setting as default, unset other defaults first
    if (updates.isDefault) {
      await db
        .update(payoutAccounts)
        .set({ isDefault: false })
        .where(eq(payoutAccounts.artistId, artistId));
    }

    await db
      .update(payoutAccounts)
      .set(updates)
      .where(
        and(
          eq(payoutAccounts.id, accountId),
          eq(payoutAccounts.artistId, artistId)
        )
      );
  } catch (error) {
    console.error("[Database] Failed to update payout account:", error);
    throw error;
  }
}

/**
 * Delete payout account
 */
export async function deletePayoutAccount(accountId: number, artistId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .delete(payoutAccounts)
      .where(
        and(
          eq(payoutAccounts.id, accountId),
          eq(payoutAccounts.artistId, artistId)
        )
      );
  } catch (error) {
    console.error("[Database] Failed to delete payout account:", error);
    throw error;
  }
}

/**
 * Get artist's earnings balance
 */
export async function getEarningsBalance(artistId: number): Promise<EarningsBalance | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get earnings balance: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(earningsBalance)
      .where(eq(earningsBalance.artistId, artistId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get earnings balance:", error);
    throw error;
  }
}

/**
 * Initialize earnings balance for new artist
 */
export async function initializeEarningsBalance(artistId: number): Promise<EarningsBalance> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const balance: InsertEarningsBalance = {
      artistId,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      withdrawnBalance: 0,
      payoutSchedule: "manual",
      autoPayoutEnabled: false,
      autoPayoutThreshold: 2000, // $20.00
    };

    const result = await db.insert(earningsBalance).values(balance);
    const insertedId = Number(result[0].insertId);
    
    const inserted = await db
      .select()
      .from(earningsBalance)
      .where(eq(earningsBalance.id, insertedId))
      .limit(1);
    
    return inserted[0]!;
  } catch (error) {
    console.error("[Database] Failed to initialize earnings balance:", error);
    throw error;
  }
}

/**
 * Update earnings balance
 */
export async function updateEarningsBalance(
  artistId: number,
  updates: Partial<EarningsBalance>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(earningsBalance)
      .set(updates)
      .where(eq(earningsBalance.artistId, artistId));
  } catch (error) {
    console.error("[Database] Failed to update earnings balance:", error);
    throw error;
  }
}

/**
 * Create payout request
 */
export async function createPayout(payout: InsertPayout): Promise<Payout> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(payouts).values(payout);
    const insertedId = Number(result[0].insertId);
    
    const inserted = await db
      .select()
      .from(payouts)
      .where(eq(payouts.id, insertedId))
      .limit(1);
    
    return inserted[0]!;
  } catch (error) {
    console.error("[Database] Failed to create payout:", error);
    throw error;
  }
}

/**
 * Get artist's payout history
 */
export async function getPayoutHistory(artistId: number, limit: number = 50): Promise<Payout[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payout history: database not available");
    return [];
  }

  try {
    const history = await db
      .select()
      .from(payouts)
      .where(eq(payouts.artistId, artistId))
      .orderBy(desc(payouts.requestedAt))
      .limit(limit);
    
    return history;
  } catch (error) {
    console.error("[Database] Failed to get payout history:", error);
    throw error;
  }
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(
  payoutId: number,
  status: Payout["status"],
  updates?: Partial<Payout>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(payouts)
      .set({ status, ...updates })
      .where(eq(payouts.id, payoutId));
  } catch (error) {
    console.error("[Database] Failed to update payout status:", error);
    throw error;
  }
}

// ============================================================================
// TONEY AI CONVERSATIONS (WITH MANDATORY USER ISOLATION)
// ============================================================================

/**
 * Get all Toney conversations for a specific user
 * CRITICAL SECURITY: Always filters by userId to prevent data leakage
 */
export async function getToneyConversations(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get Toney conversations: database not available");
    return [];
  }

  try {
    const conversations = await db
      .select()
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.userId, userId),
          eq(aiConversations.conversationType, "toney")
        )
      )
      .orderBy(desc(aiConversations.updatedAt));

    return conversations;
  } catch (error) {
    console.error("[Database] Failed to get Toney conversations:", error);
    return [];
  }
}

/**
 * Get a single Toney conversation by ID
 * CRITICAL SECURITY: Always validates userId ownership
 */
export async function getToneyConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get Toney conversation: database not available");
    return null;
  }

  try {
    const [conversation] = await db
      .select()
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, userId),
          eq(aiConversations.conversationType, "toney")
        )
      )
      .limit(1);

    return conversation || null;
  } catch (error) {
    console.error("[Database] Failed to get Toney conversation:", error);
    return null;
  }
}

/**
 * Create a new Toney conversation
 * CRITICAL SECURITY: userId is mandatory and cannot be null
 */
export async function createToneyConversation(
  userId: number,
  title?: string,
  context: "career_advice" | "release_strategy" | "content_ideas" | "financial_planning" | "tour_planning" | "general" = "general"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create Toney conversation: database not available");
    return null;
  }

  try {
    // Get artistId from userId
    const artistProfile = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId))
      .limit(1);
    
    if (!artistProfile || artistProfile.length === 0) {
      console.warn("[Database] Cannot create Toney conversation: artist profile not found for userId", userId);
      return null;
    }

    const [conversation] = await db
      .insert(aiConversations)
      .values({
        artistId: artistProfile[0].id,
        userId,
        conversationType: "toney",
        title: title || "New Conversation",
        context,
        messages: [],
        tokensUsed: 0,
      })
      .$returningId();

    return conversation.id;
  } catch (error) {
    console.error("[Database] Failed to create Toney conversation:", error);
    return null;
  }
}

/**
 * Add a message to a Toney conversation
 * CRITICAL SECURITY: Validates userId ownership before adding message
 */
export async function addToneyMessage(
  conversationId: number,
  userId: number,
  role: "user" | "assistant" | "system",
  content: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add Toney message: database not available");
    return false;
  }

  try {
    // First verify ownership
    const conversation = await getToneyConversation(conversationId, userId);
    if (!conversation) {
      console.error("[Database] Cannot add message: conversation not found or access denied");
      return false;
    }

    // Get current messages
    const currentMessages = conversation.messages || [];
    
    // Add new message
    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    // Update conversation with new message
    await db
      .update(aiConversations)
      .set({
        messages: [...currentMessages, newMessage],
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, userId)
        )
      );

    return true;
  } catch (error) {
    console.error("[Database] Failed to add Toney message:", error);
    return false;
  }
}

/**
 * Delete a Toney conversation
 * CRITICAL SECURITY: Validates userId ownership before deletion
 */
export async function deleteToneyConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete Toney conversation: database not available");
    return false;
  }

  try {
    await db
      .delete(aiConversations)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, userId),
          eq(aiConversations.conversationType, "toney")
        )
      );

    return true;
  } catch (error) {
    console.error("[Database] Failed to delete Toney conversation:", error);
    return false;
  }
}


// ============================================================================
// COOKIE PREFERENCES
// ============================================================================

/**
 * Get user's cookie preferences
 * Returns null if user has never set preferences
 */
export async function getUserCookiePreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cookie preferences: database not available");
    return null;
  }

  try {
    const { userCookiePreferences } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(userCookiePreferences)
      .where(eq(userCookiePreferences.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get cookie preferences:", error);
    return null;
  }
}

/**
 * Save or update user's cookie preferences
 * Creates new record if doesn't exist, updates if exists
 */
export async function saveUserCookiePreferences(
  userId: number,
  analyticsCookies: boolean,
  marketingCookies: boolean,
  userAgent?: string,
  ipAddress?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save cookie preferences: database not available");
    return false;
  }

  try {
    const { userCookiePreferences } = await import("../drizzle/schema");
    
    // Check if preferences already exist
    const existing = await getUserCookiePreferences(userId);

    if (existing) {
      // Update existing preferences
      await db
        .update(userCookiePreferences)
        .set({
          analyticsCookies: analyticsCookies ? 1 : 0,
          marketingCookies: marketingCookies ? 1 : 0,
          lastUpdatedAt: new Date(),
          userAgent,
          ipAddress,
        })
        .where(eq(userCookiePreferences.userId, userId));
    } else {
      // Insert new preferences
      await db.insert(userCookiePreferences).values({
        userId,
        analyticsCookies: analyticsCookies ? 1 : 0,
        marketingCookies: marketingCookies ? 1 : 0,
        consentGivenAt: new Date(),
        lastUpdatedAt: new Date(),
        userAgent,
        ipAddress,
      });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to save cookie preferences:", error);
    return false;
  }
}
