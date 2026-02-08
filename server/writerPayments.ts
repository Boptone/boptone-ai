import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  writerProfiles,
  writerPaymentMethods,
  writerInvitations,
  writerEarnings,
  writerPayouts,
  type InsertWriterProfile,
  type InsertWriterPaymentMethod,
  type InsertWriterInvitation,
  type InsertWriterEarning,
  type InsertWriterPayout,
} from "../drizzle/schema";

/**
 * Writer Payment System Database Helpers
 * All functions for managing songwriter splits and payouts
 */

// ============================================================================
// WRITER PROFILES
// ============================================================================

export async function createWriterProfile(profile: InsertWriterProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newProfile] = await db.insert(writerProfiles).values(profile);
  return newProfile;
}

export async function getWriterProfileById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [profile] = await db.select().from(writerProfiles).where(eq(writerProfiles.id, id)).limit(1);
  return profile || null;
}

export async function getWriterProfileByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [profile] = await db.select().from(writerProfiles).where(eq(writerProfiles.email, email)).limit(1);
  return profile || null;
}

export async function getWriterProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [profile] = await db.select().from(writerProfiles).where(eq(writerProfiles.userId, userId)).limit(1);
  return profile || null;
}

export async function updateWriterProfile(id: number, updates: Partial<InsertWriterProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(writerProfiles).set(updates).where(eq(writerProfiles.id, id));
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export async function createWriterPaymentMethod(method: InsertWriterPaymentMethod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newMethod] = await db.insert(writerPaymentMethods).values(method);
  return newMethod;
}

export async function getWriterPaymentMethods(writerProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerPaymentMethods)
    .where(eq(writerPaymentMethods.writerProfileId, writerProfileId))
    .orderBy(desc(writerPaymentMethods.isDefault));
}

export async function getDefaultPaymentMethod(writerProfileId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [method] = await db
    .select()
    .from(writerPaymentMethods)
    .where(
      and(
        eq(writerPaymentMethods.writerProfileId, writerProfileId),
        eq(writerPaymentMethods.isDefault, true)
      )
    )
    .limit(1);
  
  return method || null;
}

export async function setDefaultPaymentMethod(writerProfileId: number, methodId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Remove default from all other methods
  await db
    .update(writerPaymentMethods)
    .set({ isDefault: false })
    .where(eq(writerPaymentMethods.writerProfileId, writerProfileId));
  
  // Set new default
  await db
    .update(writerPaymentMethods)
    .set({ isDefault: true })
    .where(eq(writerPaymentMethods.id, methodId));
}

export async function updateWriterPaymentMethod(id: number, updates: Partial<InsertWriterPaymentMethod>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(writerPaymentMethods).set(updates).where(eq(writerPaymentMethods.id, id));
}

export async function deleteWriterPaymentMethod(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(writerPaymentMethods).where(eq(writerPaymentMethods.id, id));
}

// ============================================================================
// WRITER INVITATIONS
// ============================================================================

export async function createWriterInvitation(invitation: InsertWriterInvitation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newInvitation] = await db.insert(writerInvitations).values(invitation);
  return newInvitation;
}

export async function getWriterInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [invitation] = await db
    .select()
    .from(writerInvitations)
    .where(eq(writerInvitations.inviteToken, token))
    .limit(1);
  
  return invitation || null;
}

export async function getWriterInvitationsByTrack(trackId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerInvitations)
    .where(eq(writerInvitations.trackId, trackId))
    .orderBy(desc(writerInvitations.createdAt));
}

export async function getWriterInvitationsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerInvitations)
    .where(eq(writerInvitations.email, email))
    .orderBy(desc(writerInvitations.createdAt));
}

export async function updateWriterInvitation(id: number, updates: Partial<InsertWriterInvitation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(writerInvitations).set(updates).where(eq(writerInvitations.id, id));
}

export async function acceptWriterInvitation(inviteToken: string, writerProfileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(writerInvitations)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      writerProfileId,
    })
    .where(eq(writerInvitations.inviteToken, inviteToken));
}

// ============================================================================
// WRITER EARNINGS
// ============================================================================

export async function createWriterEarning(earning: InsertWriterEarning) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newEarning] = await db.insert(writerEarnings).values(earning);
  return newEarning;
}

export async function getWriterEarningsByProfile(writerProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerEarnings)
    .where(eq(writerEarnings.writerProfileId, writerProfileId))
    .orderBy(desc(writerEarnings.totalEarned));
}

export async function getWriterEarningsByTrack(trackId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerEarnings)
    .where(eq(writerEarnings.trackId, trackId));
}

export async function getWriterEarning(writerProfileId: number, trackId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [earning] = await db
    .select()
    .from(writerEarnings)
    .where(
      and(
        eq(writerEarnings.writerProfileId, writerProfileId),
        eq(writerEarnings.trackId, trackId)
      )
    )
    .limit(1);
  
  return earning || null;
}

export async function updateWriterEarning(id: number, updates: Partial<InsertWriterEarning>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(writerEarnings).set(updates).where(eq(writerEarnings.id, id));
}

export async function addEarningsToWriter(writerProfileId: number, trackId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(writerEarnings)
    .set({
      totalEarned: sql`${writerEarnings.totalEarned} + ${amount}`,
      pendingPayout: sql`${writerEarnings.pendingPayout} + ${amount}`,
    })
    .where(
      and(
        eq(writerEarnings.writerProfileId, writerProfileId),
        eq(writerEarnings.trackId, trackId)
      )
    );
}

export async function getWritersPendingPayouts(minAmount: number = 1000) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all writers with pending payouts >= minAmount (default $10)
  return db
    .select()
    .from(writerEarnings)
    .where(sql`${writerEarnings.pendingPayout} >= ${minAmount}`)
    .orderBy(desc(writerEarnings.pendingPayout));
}

// ============================================================================
// WRITER PAYOUTS
// ============================================================================

export async function createWriterPayout(payout: InsertWriterPayout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newPayout] = await db.insert(writerPayouts).values(payout);
  return newPayout;
}

export async function getWriterPayoutsByProfile(writerProfileId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerPayouts)
    .where(eq(writerPayouts.writerProfileId, writerProfileId))
    .orderBy(desc(writerPayouts.createdAt))
    .limit(limit);
}

export async function getWriterPayoutById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [payout] = await db
    .select()
    .from(writerPayouts)
    .where(eq(writerPayouts.id, id))
    .limit(1);
  
  return payout || null;
}

export async function updateWriterPayout(id: number, updates: Partial<InsertWriterPayout>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(writerPayouts).set(updates).where(eq(writerPayouts.id, id));
}

export async function getPendingPayouts() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(writerPayouts)
    .where(eq(writerPayouts.status, "pending"))
    .orderBy(writerPayouts.scheduledFor);
}

export async function markPayoutComplete(id: number, externalPaymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(writerPayouts)
    .set({
      status: "completed",
      externalPaymentId,
      completedAt: new Date(),
      processedAt: new Date(),
    })
    .where(eq(writerPayouts.id, id));
}

export async function markPayoutFailed(id: number, failureReason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(writerPayouts)
    .set({
      status: "failed",
      failureReason,
      retryCount: sql`${writerPayouts.retryCount} + 1`,
    })
    .where(eq(writerPayouts.id, id));
}
