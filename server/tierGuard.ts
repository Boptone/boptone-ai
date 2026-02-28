/**
 * Tier Guard — Subscription tier enforcement helpers
 *
 * Usage in tRPC procedures:
 *   await requireProTier(ctx.user.id);
 *
 * Throws TRPCError PAYMENT_REQUIRED (402) when the user's active subscription
 * is on the free tier. PRO and Enterprise users pass through.
 *
 * Admins always pass through regardless of subscription tier.
 */
import { TRPCError } from "@trpc/server";
import { PRO_REQUIRED_ERR_MSG } from "@shared/const";
import { getUserSubscription } from "./db_stripe";

export type SubscriptionTier = "free" | "pro" | "enterprise";

/**
 * Resolve the effective tier for a user.
 * Falls back to "free" when no subscription record exists.
 */
export async function getUserTier(userId: number): Promise<SubscriptionTier> {
  const sub = await getUserSubscription(userId);
  if (!sub) return "free";
  // Use the canonical `tier` field; fall back to `plan` for legacy rows
  const tier = (sub.tier || sub.plan || "free") as SubscriptionTier;
  return tier;
}

/**
 * Assert that the user is on PRO or Enterprise.
 * Throws PAYMENT_REQUIRED (HTTP 402) for free-tier users.
 * Admins bypass this check.
 */
export async function requireProTier(
  userId: number,
  userRole?: string
): Promise<void> {
  // Admins always have full access
  if (userRole === "admin") return;

  const tier = await getUserTier(userId);
  if (tier === "free") {
    throw new TRPCError({
      code: "PAYMENT_REQUIRED",
      message: PRO_REQUIRED_ERR_MSG,
    });
  }
}

/**
 * Check (without throwing) whether a user has PRO or Enterprise access.
 * Useful for frontend-facing queries that return tier metadata.
 */
export async function hasProAccess(
  userId: number,
  userRole?: string
): Promise<boolean> {
  if (userRole === "admin") return true;
  const tier = await getUserTier(userId);
  return tier !== "free";
}
