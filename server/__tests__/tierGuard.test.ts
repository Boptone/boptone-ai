/**
 * Tier Guard Tests
 *
 * Verifies that requireProTier and hasProAccess correctly enforce
 * PRO/Enterprise subscription requirements for workflow automation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// ---------------------------------------------------------------------------
// Mock getUserSubscription so tests don't need a live database
// ---------------------------------------------------------------------------
vi.mock("../db_stripe", () => ({
  getUserSubscription: vi.fn(),
}));

import { getUserSubscription } from "../db_stripe";
import { requireProTier, hasProAccess, getUserTier } from "../tierGuard";

const mockGetUserSubscription = getUserSubscription as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeSubscription(tier: "free" | "pro" | "enterprise") {
  return {
    id: 1,
    userId: 42,
    tier,
    plan: tier,
    status: "active",
    billingCycle: "monthly",
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// getUserTier
// ---------------------------------------------------------------------------
describe("getUserTier", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 'free' when no subscription record exists", async () => {
    mockGetUserSubscription.mockResolvedValue(null);
    expect(await getUserTier(1)).toBe("free");
  });

  it("returns 'free' for a free-tier subscription", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    expect(await getUserTier(1)).toBe("free");
  });

  it("returns 'pro' for a PRO subscription", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("pro"));
    expect(await getUserTier(1)).toBe("pro");
  });

  it("returns 'enterprise' for an Enterprise subscription", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("enterprise"));
    expect(await getUserTier(1)).toBe("enterprise");
  });

  it("falls back to plan field when tier is missing", async () => {
    const sub = { ...makeSubscription("pro"), tier: undefined as any };
    mockGetUserSubscription.mockResolvedValue(sub);
    expect(await getUserTier(1)).toBe("pro");
  });
});

// ---------------------------------------------------------------------------
// requireProTier
// ---------------------------------------------------------------------------
describe("requireProTier", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws PAYMENT_REQUIRED for free-tier users", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    await expect(requireProTier(42)).rejects.toThrow(TRPCError);
    await expect(requireProTier(42)).rejects.toMatchObject({
      code: "PAYMENT_REQUIRED",
    });
  });

  it("throws PAYMENT_REQUIRED when no subscription exists", async () => {
    mockGetUserSubscription.mockResolvedValue(null);
    await expect(requireProTier(42)).rejects.toMatchObject({
      code: "PAYMENT_REQUIRED",
    });
  });

  it("does NOT throw for PRO users", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("pro"));
    await expect(requireProTier(42)).resolves.toBeUndefined();
  });

  it("does NOT throw for Enterprise users", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("enterprise"));
    await expect(requireProTier(42)).resolves.toBeUndefined();
  });

  it("does NOT throw for admin users regardless of subscription tier", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    // Admin role bypasses tier check — getUserSubscription should NOT be called
    await expect(requireProTier(42, "admin")).resolves.toBeUndefined();
    expect(mockGetUserSubscription).not.toHaveBeenCalled();
  });

  it("error message includes the PRO_REQUIRED code (10003)", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    let caught: TRPCError | null = null;
    try {
      await requireProTier(42);
    } catch (e) {
      caught = e as TRPCError;
    }
    expect(caught).not.toBeNull();
    expect(caught!.message).toContain("10003");
  });
});

// ---------------------------------------------------------------------------
// hasProAccess
// ---------------------------------------------------------------------------
describe("hasProAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns false for free-tier users", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    expect(await hasProAccess(42)).toBe(false);
  });

  it("returns false when no subscription exists", async () => {
    mockGetUserSubscription.mockResolvedValue(null);
    expect(await hasProAccess(42)).toBe(false);
  });

  it("returns true for PRO users", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("pro"));
    expect(await hasProAccess(42)).toBe(true);
  });

  it("returns true for Enterprise users", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("enterprise"));
    expect(await hasProAccess(42)).toBe(true);
  });

  it("returns true for admin users regardless of subscription tier", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    expect(await hasProAccess(42, "admin")).toBe(true);
    expect(mockGetUserSubscription).not.toHaveBeenCalled();
  });

  it("returns true for admin with no subscription record", async () => {
    mockGetUserSubscription.mockResolvedValue(null);
    expect(await hasProAccess(42, "admin")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("tierGuard edge cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("handles database errors gracefully in hasProAccess", async () => {
    mockGetUserSubscription.mockRejectedValue(new Error("DB connection lost"));
    await expect(hasProAccess(42)).rejects.toThrow("DB connection lost");
  });

  it("handles database errors gracefully in requireProTier", async () => {
    mockGetUserSubscription.mockRejectedValue(new Error("DB connection lost"));
    await expect(requireProTier(42)).rejects.toThrow("DB connection lost");
  });

  it("non-admin role string does not bypass tier check", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("free"));
    // 'artist' role is not admin — should still be gated
    await expect(requireProTier(42, "artist")).rejects.toMatchObject({
      code: "PAYMENT_REQUIRED",
    });
  });

  it("non-admin role with PRO subscription passes", async () => {
    mockGetUserSubscription.mockResolvedValue(makeSubscription("pro"));
    await expect(requireProTier(42, "artist")).resolves.toBeUndefined();
  });
});
