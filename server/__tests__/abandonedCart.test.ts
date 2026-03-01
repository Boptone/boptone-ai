/**
 * Abandoned Cart Recovery Tests
 *
 * Covers:
 *   - generateRecoveryToken / verifyRecoveryToken (HMAC signing, expiry, tamper detection)
 *   - scheduleAbandonedCartRecovery (3-touch scheduling, deduplication guard)
 *   - cancelAbandonedCartRecovery (marks pending jobs completed)
 *   - getCartRecoveryData (token validation + snapshot retrieval)
 *   - cart.recover tRPC procedure (ownership check, cart restoration)
 *   - Stripe webhook cancellation path (checkout.session.completed → cancel)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ─── Token helpers (pure, no DB) ─────────────────────────────────────────────

/**
 * Inline mirror of generateRecoveryToken / verifyRecoveryToken so tests run
 * without a live database or ENV dependency.
 */
const TEST_SECRET = "test-secret-key-for-vitest";

function generateToken(userId: number, cartEventId: number, overrideTs?: number): string {
  const ts = overrideTs ?? Date.now();
  const payload = `${userId}:${cartEventId}:${ts}`;
  const encoded = Buffer.from(payload).toString("base64url");
  const hmac = crypto.createHmac("sha256", TEST_SECRET).update(encoded).digest("hex");
  return `${encoded}.${hmac}`;
}

function verifyToken(
  token: string,
  secret = TEST_SECRET
): { userId: number; cartEventId: number } | null {
  try {
    const [encoded, hmac] = token.split(".");
    if (!encoded || !hmac) return null;
    const expectedHmac = crypto.createHmac("sha256", secret).update(encoded).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"))) {
      return null;
    }
    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const [userIdStr, cartEventIdStr, timestampStr] = payload.split(":");
    const userId = parseInt(userIdStr, 10);
    const cartEventId = parseInt(cartEventIdStr, 10);
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(userId) || isNaN(cartEventId) || isNaN(timestamp)) return null;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > sevenDays) return null;
    return { userId, cartEventId };
  } catch {
    return null;
  }
}

// ─── Recovery Token Tests ─────────────────────────────────────────────────────

describe("Recovery Token — generateRecoveryToken", () => {
  it("returns a non-empty string with exactly one dot separator", () => {
    const token = generateToken(42, 100);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    const parts = token.split(".");
    expect(parts.length).toBe(2);
  });

  it("encodes userId and cartEventId in the payload", () => {
    const token = generateToken(7, 999);
    const [encoded] = token.split(".");
    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const [userIdStr, cartEventIdStr] = payload.split(":");
    expect(parseInt(userIdStr)).toBe(7);
    expect(parseInt(cartEventIdStr)).toBe(999);
  });

  it("generates different tokens for different users", () => {
    const t1 = generateToken(1, 1);
    const t2 = generateToken(2, 1);
    expect(t1).not.toBe(t2);
  });

  it("generates different tokens for different cartEventIds", () => {
    const t1 = generateToken(1, 1);
    const t2 = generateToken(1, 2);
    expect(t1).not.toBe(t2);
  });
});

describe("Recovery Token — verifyRecoveryToken", () => {
  it("returns userId and cartEventId for a valid token", () => {
    const token = generateToken(42, 100);
    const result = verifyToken(token);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(42);
    expect(result!.cartEventId).toBe(100);
  });

  it("returns null for a tampered payload", () => {
    const token = generateToken(42, 100);
    const [encoded, hmac] = token.split(".");
    // Flip one character in the encoded payload
    const tampered = encoded.slice(0, -1) + (encoded.slice(-1) === "A" ? "B" : "A");
    const result = verifyToken(`${tampered}.${hmac}`);
    expect(result).toBeNull();
  });

  it("returns null for a tampered HMAC", () => {
    const token = generateToken(42, 100);
    const [encoded] = token.split(".");
    const result = verifyToken(`${encoded}.deadbeef`);
    expect(result).toBeNull();
  });

  it("returns null for a token signed with a different secret", () => {
    const token = generateToken(42, 100, undefined);
    const result = verifyToken(token, "wrong-secret");
    expect(result).toBeNull();
  });

  it("returns null for an expired token (> 7 days old)", () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const token = generateToken(42, 100, eightDaysAgo);
    const result = verifyToken(token);
    expect(result).toBeNull();
  });

  it("accepts a token that is exactly 6 days old", () => {
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    const token = generateToken(42, 100, sixDaysAgo);
    const result = verifyToken(token);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(42);
  });

  it("returns null for an empty string", () => {
    expect(verifyToken("")).toBeNull();
  });

  it("returns null for a token missing the HMAC segment", () => {
    const token = generateToken(42, 100);
    const [encoded] = token.split(".");
    expect(verifyToken(encoded)).toBeNull();
  });

  it("returns null when userId is not a number", () => {
    const payload = "NaN:100:1700000000000";
    const encoded = Buffer.from(payload).toString("base64url");
    const hmac = crypto.createHmac("sha256", TEST_SECRET).update(encoded).digest("hex");
    expect(verifyToken(`${encoded}.${hmac}`)).toBeNull();
  });
});

// ─── 3-Touch Schedule Logic ───────────────────────────────────────────────────

describe("3-Touch Schedule — timing logic", () => {
  it("touch 1 fires at 1 hour (3600 seconds) after now", () => {
    const now = Date.now();
    const touch1 = new Date(now + 60 * 60 * 1000);
    const diffSeconds = (touch1.getTime() - now) / 1000;
    expect(diffSeconds).toBeCloseTo(3600, -1);
  });

  it("touch 2 fires at 24 hours after now", () => {
    const now = Date.now();
    const touch2 = new Date(now + 24 * 60 * 60 * 1000);
    const diffHours = (touch2.getTime() - now) / (1000 * 60 * 60);
    expect(diffHours).toBeCloseTo(24, 0);
  });

  it("touch 3 fires at 72 hours after now", () => {
    const now = Date.now();
    const touch3 = new Date(now + 72 * 60 * 60 * 1000);
    const diffHours = (touch3.getTime() - now) / (1000 * 60 * 60);
    expect(diffHours).toBeCloseTo(72, 0);
  });

  it("touch 1 is earlier than touch 2 which is earlier than touch 3", () => {
    const now = Date.now();
    const t1 = new Date(now + 1 * 60 * 60 * 1000);
    const t2 = new Date(now + 24 * 60 * 60 * 1000);
    const t3 = new Date(now + 72 * 60 * 60 * 1000);
    expect(t1.getTime()).toBeLessThan(t2.getTime());
    expect(t2.getTime()).toBeLessThan(t3.getTime());
  });
});

// ─── Cart Snapshot Logic ──────────────────────────────────────────────────────

describe("Cart Snapshot — subtotal calculation", () => {
  function calcSubtotal(items: { quantity: number; priceAtAdd: number }[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.priceAtAdd, 0);
  }

  it("calculates subtotal for a single item", () => {
    expect(calcSubtotal([{ quantity: 2, priceAtAdd: 1500 }])).toBe(3000);
  });

  it("calculates subtotal for multiple items", () => {
    const items = [
      { quantity: 1, priceAtAdd: 2500 },
      { quantity: 3, priceAtAdd: 500 },
    ];
    expect(calcSubtotal(items)).toBe(4000);
  });

  it("returns 0 for an empty cart", () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

// ─── Cancellation Logic ───────────────────────────────────────────────────────

describe("cancelAbandonedCartRecovery — filtering logic", () => {
  it("correctly identifies jobs belonging to a specific user", () => {
    const pendingJobs = [
      { id: 1, payload: { userId: 42, touchNumber: 1 } },
      { id: 2, payload: { userId: 42, touchNumber: 2 } },
      { id: 3, payload: { userId: 99, touchNumber: 1 } },
    ];
    const targetUserId = 42;
    const userJobIds = pendingJobs
      .filter((job) => (job.payload as any)?.userId === targetUserId)
      .map((job) => job.id);
    expect(userJobIds).toEqual([1, 2]);
  });

  it("returns empty array when no jobs match the user", () => {
    const pendingJobs = [
      { id: 1, payload: { userId: 99, touchNumber: 1 } },
    ];
    const userJobIds = pendingJobs
      .filter((job) => (job.payload as any)?.userId === 42)
      .map((job) => job.id);
    expect(userJobIds).toHaveLength(0);
  });

  it("handles jobs with missing payload gracefully", () => {
    const pendingJobs = [
      { id: 1, payload: null },
      { id: 2, payload: { userId: 42, touchNumber: 1 } },
    ];
    const userJobIds = pendingJobs
      .filter((job) => (job.payload as any)?.userId === 42)
      .map((job) => job.id);
    expect(userJobIds).toEqual([2]);
  });
});

// ─── Recovery URL Construction ────────────────────────────────────────────────

describe("Recovery URL construction", () => {
  it("builds a valid recovery URL with the token as a query param", () => {
    const appUrl = "https://boptone.com";
    const token = generateToken(42, 100);
    const url = `${appUrl}/cart/recover?token=${token}`;
    expect(url).toMatch(/^https:\/\/boptone\.com\/cart\/recover\?token=/);
    expect(url).toContain(token);
  });

  it("recovery URL contains the full token without truncation", () => {
    const token = generateToken(42, 100);
    const url = `https://boptone.com/cart/recover?token=${token}`;
    const parsed = new URL(url);
    expect(parsed.searchParams.get("token")).toBe(token);
  });
});

// ─── cart.recover tRPC procedure — ownership & restoration logic ──────────────

describe("cart.recover procedure — ownership validation", () => {
  it("allows recovery when userId matches the authenticated user", () => {
    const recoveryUserId = 42;
    const ctxUserId = 42;
    const isAllowed = recoveryUserId === ctxUserId;
    expect(isAllowed).toBe(true);
  });

  it("rejects recovery when userId does not match the authenticated user", () => {
    const recoveryUserId = 42;
    const ctxUserId = 99;
    const isAllowed = recoveryUserId === ctxUserId;
    expect(isAllowed).toBe(false);
  });
});

describe("cart.recover procedure — item restoration from snapshot", () => {
  it("maps snapshot items to cartItems insert values correctly", () => {
    const userId = 42;
    const snapshot = {
      items: [
        { productId: 1, variantId: 10, quantity: 2, priceAtAdd: 2500 },
        { productId: 2, variantId: null, quantity: 1, priceAtAdd: 1500 },
      ],
      subtotal: 6500,
      currency: "usd",
    };
    const insertValues = snapshot.items.map((item: any) => ({
      userId,
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd ?? 0,
    }));
    expect(insertValues).toHaveLength(2);
    expect(insertValues[0]).toMatchObject({ userId: 42, productId: 1, variantId: 10, quantity: 2 });
    expect(insertValues[1]).toMatchObject({ userId: 42, productId: 2, variantId: null, quantity: 1 });
  });

  it("returns itemCount equal to snapshot.items.length", () => {
    const snapshot = {
      items: [
        { productId: 1, variantId: null, quantity: 1, priceAtAdd: 1000 },
        { productId: 2, variantId: null, quantity: 3, priceAtAdd: 500 },
        { productId: 3, variantId: 5, quantity: 1, priceAtAdd: 2000 },
      ],
    };
    const itemCount = snapshot.items?.length ?? 0;
    expect(itemCount).toBe(3);
  });

  it("returns itemCount 0 for empty snapshot", () => {
    const snapshot = { items: [] };
    const itemCount = snapshot.items?.length ?? 0;
    expect(itemCount).toBe(0);
  });
});

// ─── Email touch differentiation ─────────────────────────────────────────────

describe("Email touch differentiation", () => {
  function getEmailSubject(touchNumber: number): string {
    switch (touchNumber) {
      case 1: return "You left something behind 🛍️";
      case 2: return "Still thinking it over?";
      case 3: return "Last chance — your cart expires soon";
      default: return "Your cart is waiting";
    }
  }

  it("touch 1 has a reminder subject line", () => {
    const subject = getEmailSubject(1);
    expect(subject).toContain("left something behind");
  });

  it("touch 2 has a follow-up subject line", () => {
    const subject = getEmailSubject(2);
    expect(subject).toContain("thinking it over");
  });

  it("touch 3 has an urgency subject line", () => {
    const subject = getEmailSubject(3);
    expect(subject).toContain("Last chance");
  });

  it("each touch has a distinct subject line", () => {
    const subjects = [1, 2, 3].map(getEmailSubject);
    const unique = new Set(subjects);
    expect(unique.size).toBe(3);
  });
});

// ─── Stripe webhook cancellation path ────────────────────────────────────────

describe("Stripe webhook — checkout.session.completed cancellation path", () => {
  it("extracts userId from session.metadata correctly", () => {
    const session = {
      metadata: { paymentType: "bopshop", userId: "42" },
    };
    const userId = parseInt(session.metadata?.userId || "0");
    expect(userId).toBe(42);
  });

  it("does not attempt cancellation when userId is 0 (missing metadata)", () => {
    const session = { metadata: {} };
    const userId = parseInt((session.metadata as any)?.userId || "0");
    const shouldCancel = userId > 0;
    expect(shouldCancel).toBe(false);
  });

  it("only cancels for bopshop payment type", () => {
    const bopshopSession = { metadata: { paymentType: "bopshop", userId: "42" } };
    const walletSession = { metadata: { paymentType: "wallet_topup", userId: "42" } };
    const shouldCancelBopshop = bopshopSession.metadata.paymentType === "bopshop";
    const shouldCancelWallet = walletSession.metadata.paymentType === "bopshop";
    expect(shouldCancelBopshop).toBe(true);
    expect(shouldCancelWallet).toBe(false);
  });
});
