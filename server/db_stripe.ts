import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { subscriptions, payments, InsertSubscription, InsertPayment } from "../drizzle/schema";

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Create or update subscription
 */
export async function upsertSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserSubscription(data.userId);
  
  if (existing) {
    await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(subscriptions).values(data);
    return result[0].insertId;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(subscriptions)
    .set({ 
      status: "canceled",
      cancelAtPeriodEnd: true,
    })
    .where(eq(subscriptions.userId, userId));
}

/**
 * Record a payment
 */
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

/**
 * Get user's payment history
 */
export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);
}
