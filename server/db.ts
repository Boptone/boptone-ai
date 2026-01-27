import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
  
  return await db.select().from(releases).where(and(...conditions)).orderBy(desc(releases.releaseDate));
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
