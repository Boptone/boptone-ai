import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { subscriptions, subscriptionChanges, InsertSubscription, InsertSubscriptionChange } from "../drizzle/schema";

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
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
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(subscriptions).values(data);
    return result[0].insertId;
  }
}

/**
 * Calculate prorated credit when changing plans
 * Returns the credit amount in dollars
 */
export function calculateProratedCredit(params: {
  currentPlan: string;
  currentBillingCycle: string;
  newPlan: string;
  newBillingCycle: string;
  daysRemainingInPeriod: number;
  totalDaysInPeriod: number;
}): number {
  const {
    currentPlan,
    currentBillingCycle,
    newPlan,
    newBillingCycle,
    daysRemainingInPeriod,
    totalDaysInPeriod,
  } = params;

  // Plan pricing (monthly)
  const pricing: Record<string, number> = {
    creator: 0,
    pro: 29,
    studio: 99,
    label: 499,
  };

  // Get current plan cost
  let currentCost = pricing[currentPlan] || 0;
  if (currentBillingCycle === "annual") {
    currentCost = currentCost * 12 * 0.8; // 20% discount for annual
  }

  // Calculate unused portion
  const unusedRatio = daysRemainingInPeriod / totalDaysInPeriod;
  const credit = currentCost * unusedRatio;

  // Downgrade: full credit
  // Upgrade: credit applied to new plan
  return Math.round(credit * 100) / 100; // Round to 2 decimals
}

/**
 * Change subscription plan
 */
export async function changePlan(params: {
  userId: number;
  newPlan: string;
  newBillingCycle: string;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const currentSub = await getUserSubscription(params.userId);
  if (!currentSub) {
    throw new Error("No active subscription found");
  }

  // Calculate proration
  const now = new Date();
  const periodEnd = currentSub.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd) : now;
  const periodStart = currentSub.currentPeriodStart ? new Date(currentSub.currentPeriodStart) : now;
  
  const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

  const proratedCredit = calculateProratedCredit({
    currentPlan: currentSub.plan,
    currentBillingCycle: currentSub.billingCycle,
    newPlan: params.newPlan,
    newBillingCycle: params.newBillingCycle,
    daysRemainingInPeriod: daysRemaining,
    totalDaysInPeriod: totalDays,
  });

  // Record the change
  await db.insert(subscriptionChanges).values({
    subscriptionId: currentSub.id,
    fromPlan: currentSub.plan as any,
    toPlan: params.newPlan as any,
    fromBillingCycle: currentSub.billingCycle as any,
    toBillingCycle: params.newBillingCycle as any,
    proratedCredit: proratedCredit.toString(),
    effectiveDate: now,
    reason: params.reason,
  });

  // Update subscription
  await db
    .update(subscriptions)
    .set({
      plan: params.newPlan as any,
      billingCycle: params.newBillingCycle as any,
      updatedAt: now,
    })
    .where(eq(subscriptions.id, currentSub.id));

  return {
    success: true,
    proratedCredit,
    newPlan: params.newPlan,
    newBillingCycle: params.newBillingCycle,
  };
}

/**
 * Get subscription change history for a user
 */
export async function getSubscriptionHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const userSub = await getUserSubscription(userId);
  if (!userSub) return [];

  const history = await db
    .select()
    .from(subscriptionChanges)
    .where(eq(subscriptionChanges.subscriptionId, userSub.id))
    .orderBy(subscriptionChanges.createdAt);

  return history;
}
