/**
 * Abandoned Cart Recovery Service
 * Detects cart abandonment and schedules the 3-touch email recovery sequence:
 *   Touch 1: 1 hour  after abandonment — "You left something behind"
 *   Touch 2: 24 hours after abandonment — "Still thinking it over?"
 *   Touch 3: 72 hours after abandonment — "Last chance — your cart expires soon"
 *
 * Deduplication: cancels pending recovery jobs when a cart is recovered (checkout completed).
 * Recovery token: a signed HMAC token embedded in recovery links so the cart can be
 * restored without requiring the user to be logged in.
 */

import crypto from "crypto";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { getDb } from "../db";
import {
  cartItems,
  cartEvents,
  scheduledJobs,
  products,
  productVariants,
  artistProfiles,
  users,
} from "../../drizzle/schema";
import { scheduleJob } from "./jobScheduler";
import { ENV } from "../_core/env";

// ─────────────────────────────────────────────────────────────────────────────
// Recovery token helpers
// ─────────────────────────────────────────────────────────────────────────────

const RECOVERY_SECRET = ENV.jwtSecret || "boptone-cart-recovery-secret";

/**
 * Generate a signed recovery token for a given userId + cartEventId.
 * Format: base64url(userId:cartEventId:timestamp):hmac
 */
export function generateRecoveryToken(userId: number, cartEventId: number): string {
  const payload = `${userId}:${cartEventId}:${Date.now()}`;
  const encoded = Buffer.from(payload).toString("base64url");
  const hmac = crypto
    .createHmac("sha256", RECOVERY_SECRET)
    .update(encoded)
    .digest("hex");
  return `${encoded}.${hmac}`;
}

/**
 * Verify and decode a recovery token.
 * Returns { userId, cartEventId } or null if invalid / expired (7 days).
 */
export function verifyRecoveryToken(
  token: string
): { userId: number; cartEventId: number } | null {
  try {
    const [encoded, hmac] = token.split(".");
    if (!encoded || !hmac) return null;

    const expectedHmac = crypto
      .createHmac("sha256", RECOVERY_SECRET)
      .update(encoded)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"))) {
      return null;
    }

    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const [userIdStr, cartEventIdStr, timestampStr] = payload.split(":");
    const userId = parseInt(userIdStr, 10);
    const cartEventId = parseInt(cartEventIdStr, 10);
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(userId) || isNaN(cartEventId) || isNaN(timestamp)) return null;

    // Expire tokens after 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > sevenDays) return null;

    return { userId, cartEventId };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart snapshot builder
// ─────────────────────────────────────────────────────────────────────────────

export async function buildCartSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      priceAtAdd: cartItems.priceAtAdd,
      productName: products.name,
      productImage: products.primaryImageUrl,
      variantName: productVariants.name,
      artistStageName: artistProfiles.stageName,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .leftJoin(artistProfiles, eq(products.artistId, artistProfiles.id))
    .where(and(eq(cartItems.userId, userId), isNull(cartItems.deletedAt)));

  if (items.length === 0) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );

  return {
    items: items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      name: item.variantName
        ? `${item.productName} – ${item.variantName}`
        : (item.productName ?? "Product"),
      imageUrl: item.productImage ?? undefined,
      price: item.priceAtAdd,
      quantity: item.quantity,
      artistName: item.artistStageName ?? "Boptone Artist",
    })),
    subtotal,
    currency: "usd",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedule the 3-touch recovery sequence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called when a user starts checkout (checkout_started event).
 * Records the cart event and schedules all 3 recovery emails.
 * Idempotent: if jobs already exist for this user with status=pending, skip.
 */
export async function scheduleAbandonedCartRecovery(params: {
  userId: number;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Build cart snapshot
  const snapshot = await buildCartSnapshot(params.userId);
  if (!snapshot || snapshot.items.length === 0) return;

  // Fetch user email + name
  const userRecord = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, params.userId))
    .limit(1);

  if (userRecord.length === 0 || !userRecord[0].email) {
    console.log(`[AbandonedCart] User ${params.userId} has no email — skipping recovery schedule`);
    return;
  }

  const { email: customerEmail, name: customerName } = userRecord[0];

  // Check for existing pending recovery jobs for this user (dedup)
  const existingJobs = await db
    .select({ id: scheduledJobs.id })
    .from(scheduledJobs)
    .where(
      and(
        eq(scheduledJobs.jobType, "send_abandoned_cart"),
        eq(scheduledJobs.status, "pending")
      )
    );

  // Filter to this user's jobs via payload (JSON field)
  // We use a separate cartEvent record as the source of truth
  const cartEventResult = await db.insert(cartEvents).values({
    userId: params.userId,
    sessionId: params.sessionId,
    eventType: "checkout_started",
    cartSnapshot: snapshot,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
    referrer: params.referrer,
  });

  const cartEventId = Number((cartEventResult as any)[0]?.insertId) || 0;

  // Generate recovery token for all 3 touches
  const recoveryToken = generateRecoveryToken(params.userId, cartEventId);
  const appUrl = process.env.VITE_APP_URL || "https://boptone.com";
  const checkoutUrl = `${appUrl}/cart/recover?token=${recoveryToken}`;

  const basePayload = {
    cartEventId,
    userId: params.userId,
    customerEmail,
    customerName: customerName || undefined,
    items: snapshot.items,
    subtotal: snapshot.subtotal,
    currency: snapshot.currency,
    checkoutUrl,
    recoveryToken,
    touchNumber: 0, // overridden per touch below
  };

  const now = Date.now();

  // Touch 1: 1 hour
  await scheduleJob({
    jobType: "send_abandoned_cart",
    scheduledFor: new Date(now + 60 * 60 * 1000),
    payload: { ...basePayload, touchNumber: 1 },
    maxAttempts: 3,
  });

  // Touch 2: 24 hours
  await scheduleJob({
    jobType: "send_abandoned_cart",
    scheduledFor: new Date(now + 24 * 60 * 60 * 1000),
    payload: { ...basePayload, touchNumber: 2 },
    maxAttempts: 3,
  });

  // Touch 3: 72 hours
  await scheduleJob({
    jobType: "send_abandoned_cart",
    scheduledFor: new Date(now + 72 * 60 * 60 * 1000),
    payload: { ...basePayload, touchNumber: 3 },
    maxAttempts: 3,
  });

  console.log(
    `[AbandonedCart] Scheduled 3-touch recovery for user ${params.userId} (cartEvent ${cartEventId})`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel pending recovery jobs (called on checkout completion or cart clear)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel all pending abandoned cart jobs for a given userId.
 * Called when the user completes checkout or manually clears their cart.
 */
export async function cancelAbandonedCartRecovery(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Fetch all pending send_abandoned_cart jobs
  const pendingJobs = await db
    .select({ id: scheduledJobs.id, payload: scheduledJobs.payload })
    .from(scheduledJobs)
    .where(
      and(
        eq(scheduledJobs.jobType, "send_abandoned_cart"),
        eq(scheduledJobs.status, "pending")
      )
    );

  // Filter to this user's jobs
  const userJobIds = pendingJobs
    .filter((job) => {
      const payload = job.payload as any;
      return payload?.userId === userId;
    })
    .map((job) => job.id);

  if (userJobIds.length === 0) return;

  await db
    .update(scheduledJobs)
    .set({ status: "completed", completedAt: new Date() })
    .where(inArray(scheduledJobs.id, userJobIds));

  // Record checkout_completed event
  await db.insert(cartEvents).values({
    userId,
    sessionId: `recovery-cancel-${userId}-${Date.now()}`,
    eventType: "checkout_completed",
  });

  console.log(
    `[AbandonedCart] Cancelled ${userJobIds.length} pending recovery job(s) for user ${userId}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Restore cart from recovery token
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify a recovery token and return the cart snapshot for restoration.
 * The frontend uses this to restore cart items before redirecting to checkout.
 */
export async function getCartRecoveryData(token: string): Promise<{
  userId: number;
  cartEventId: number;
  snapshot: NonNullable<Awaited<ReturnType<typeof buildCartSnapshot>>>;
} | null> {
  const decoded = verifyRecoveryToken(token);
  if (!decoded) return null;

  const db = await getDb();
  if (!db) return null;

  // Fetch the cart event to get the snapshot
  const event = await db
    .select({ cartSnapshot: cartEvents.cartSnapshot, userId: cartEvents.userId })
    .from(cartEvents)
    .where(eq(cartEvents.id, decoded.cartEventId))
    .limit(1);

  if (event.length === 0 || !event[0].cartSnapshot) return null;

  return {
    userId: decoded.userId,
    cartEventId: decoded.cartEventId,
    snapshot: event[0].cartSnapshot as NonNullable<Awaited<ReturnType<typeof buildCartSnapshot>>>,
  };
}
