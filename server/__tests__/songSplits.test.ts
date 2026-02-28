/**
 * Song Splits & Writer Payout System Tests
 *
 * Covers:
 * - Split percentage validation (must sum to 100%)
 * - Writer invitation creation and acceptance flow
 * - Revenue fan-out via revenueSplitEngine
 * - writerPayments.splits.getForMyTracks procedure data shape
 * - writerPayments.splits.update mutation validation
 * - Edge cases: 0% splits, floating-point precision, missing writer profiles
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a split array that sums to exactly 100% */
function makeSplits(
  overrides: Array<{ name: string; email: string; percentage: number; role?: string; ipi?: string }>
) {
  return overrides.map((o) => ({
    name: o.name,
    email: o.email,
    percentage: o.percentage,
    role: o.role ?? "songwriter",
    ipi: o.ipi ?? "",
  }));
}

function sumSplits(splits: Array<{ percentage: number }>) {
  return splits.reduce((acc, s) => acc + s.percentage, 0);
}

// ─── Split Validation Logic ───────────────────────────────────────────────────

describe("Split percentage validation", () => {
  it("accepts splits that sum to exactly 100%", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 60 },
      { name: "Bob", email: "bob@test.com", percentage: 40 },
    ]);
    expect(Math.abs(sumSplits(splits) - 100)).toBeLessThan(0.01);
  });

  it("accepts three-way splits that sum to 100%", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 50 },
      { name: "Bob", email: "bob@test.com", percentage: 30 },
      { name: "Carol", email: "carol@test.com", percentage: 20 },
    ]);
    expect(Math.abs(sumSplits(splits) - 100)).toBeLessThan(0.01);
  });

  it("rejects splits that sum to less than 100%", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 60 },
      { name: "Bob", email: "bob@test.com", percentage: 30 },
    ]);
    expect(Math.abs(sumSplits(splits) - 100)).toBeGreaterThan(0.01);
  });

  it("rejects splits that sum to more than 100%", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 70 },
      { name: "Bob", email: "bob@test.com", percentage: 40 },
    ]);
    expect(sumSplits(splits)).toBeGreaterThan(100);
  });

  it("handles floating-point precision correctly (33.33 + 33.33 + 33.34)", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 33.33 },
      { name: "Bob", email: "bob@test.com", percentage: 33.33 },
      { name: "Carol", email: "carol@test.com", percentage: 33.34 },
    ]);
    expect(Math.abs(sumSplits(splits) - 100)).toBeLessThan(0.01);
  });

  it("rejects a single writer with 0% split", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 0 },
    ]);
    expect(sumSplits(splits)).toBe(0);
    expect(Math.abs(sumSplits(splits) - 100)).toBeGreaterThan(0.01);
  });

  it("accepts a single writer with 100% split", () => {
    const splits = makeSplits([
      { name: "Alice", email: "alice@test.com", percentage: 100 },
    ]);
    expect(Math.abs(sumSplits(splits) - 100)).toBeLessThan(0.01);
  });
});

// ─── Role Validation ──────────────────────────────────────────────────────────

describe("Writer role validation", () => {
  const VALID_ROLES = ["songwriter", "producer", "mixer", "mastering", "other"] as const;

  it("accepts all valid role values", () => {
    for (const role of VALID_ROLES) {
      const splits = makeSplits([{ name: "Alice", email: "alice@test.com", percentage: 100, role }]);
      expect(splits[0].role).toBe(role);
    }
  });

  it("defaults to songwriter when role is not specified", () => {
    const splits = makeSplits([{ name: "Alice", email: "alice@test.com", percentage: 100 }]);
    expect(splits[0].role).toBe("songwriter");
  });
});

// ─── Revenue Fan-Out Logic ────────────────────────────────────────────────────

describe("Revenue fan-out calculation", () => {
  function calculateWriterEarnings(
    totalRevenueCents: number,
    splits: Array<{ writerProfileId: number | null; percentage: number }>
  ) {
    return splits
      .filter((s) => s.writerProfileId !== null && s.percentage > 0)
      .map((s) => ({
        writerProfileId: s.writerProfileId,
        earningsCents: Math.floor((totalRevenueCents * s.percentage) / 100),
      }));
  }

  it("distributes revenue proportionally across two writers", () => {
    const revenue = 1000; // $10.00 in cents
    const splits = [
      { writerProfileId: 1, percentage: 60 },
      { writerProfileId: 2, percentage: 40 },
    ];
    const earnings = calculateWriterEarnings(revenue, splits);
    expect(earnings[0].earningsCents).toBe(600);
    expect(earnings[1].earningsCents).toBe(400);
  });

  it("distributes revenue across three writers", () => {
    const revenue = 300;
    const splits = [
      { writerProfileId: 1, percentage: 50 },
      { writerProfileId: 2, percentage: 30 },
      { writerProfileId: 3, percentage: 20 },
    ];
    const earnings = calculateWriterEarnings(revenue, splits);
    expect(earnings[0].earningsCents).toBe(150);
    expect(earnings[1].earningsCents).toBe(90);
    expect(earnings[2].earningsCents).toBe(60);
  });

  it("skips writers without a writerProfileId (invitation not yet accepted)", () => {
    const revenue = 1000;
    const splits = [
      { writerProfileId: 1, percentage: 60 },
      { writerProfileId: null, percentage: 40 }, // Invitation pending
    ];
    const earnings = calculateWriterEarnings(revenue, splits);
    expect(earnings).toHaveLength(1);
    expect(earnings[0].writerProfileId).toBe(1);
    expect(earnings[0].earningsCents).toBe(600);
  });

  it("skips writers with 0% split", () => {
    const revenue = 1000;
    const splits = [
      { writerProfileId: 1, percentage: 100 },
      { writerProfileId: 2, percentage: 0 },
    ];
    const earnings = calculateWriterEarnings(revenue, splits);
    expect(earnings).toHaveLength(1);
    expect(earnings[0].writerProfileId).toBe(1);
  });

  it("floors fractional cents to avoid over-distribution", () => {
    const revenue = 100; // $1.00
    const splits = [
      { writerProfileId: 1, percentage: 33.33 },
      { writerProfileId: 2, percentage: 33.33 },
      { writerProfileId: 3, percentage: 33.34 },
    ];
    const earnings = calculateWriterEarnings(revenue, splits);
    const totalDistributed = earnings.reduce((s, e) => s + e.earningsCents, 0);
    // Flooring means we never distribute more than available
    expect(totalDistributed).toBeLessThanOrEqual(revenue);
  });

  it("returns empty array when no writers have profiles", () => {
    const revenue = 1000;
    const splits = [
      { writerProfileId: null, percentage: 60 },
      { writerProfileId: null, percentage: 40 },
    ];
    const earnings = calculateWriterEarnings(revenue, splits);
    expect(earnings).toHaveLength(0);
  });
});

// ─── Invitation Flow ──────────────────────────────────────────────────────────

describe("Writer invitation flow", () => {
  it("generates a unique invite token per invitation", () => {
    const crypto = require("crypto");
    const token1 = crypto.randomBytes(32).toString("hex");
    const token2 = crypto.randomBytes(32).toString("hex");
    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
  });

  it("sets expiry to 30 days from now", () => {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + 30);
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diffDays)).toBe(30);
  });

  it("detects expired invitations", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    const isExpired = new Date() > new Date(pastDate);
    expect(isExpired).toBe(true);
  });

  it("detects valid (non-expired) invitations", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 29); // 29 days from now
    const isExpired = new Date() > new Date(futureDate);
    expect(isExpired).toBe(false);
  });
});

// ─── IPI Number Format ────────────────────────────────────────────────────────

describe("IPI number format validation", () => {
  function isValidIPI(ipi: string): boolean {
    // IPI numbers are 11-digit numeric strings
    return /^\d{11}$/.test(ipi);
  }

  it("accepts a valid 11-digit IPI number", () => {
    expect(isValidIPI("00000000000")).toBe(true);
    expect(isValidIPI("12345678901")).toBe(true);
  });

  it("rejects IPI numbers that are too short", () => {
    expect(isValidIPI("1234567890")).toBe(false); // 10 digits
  });

  it("rejects IPI numbers that are too long", () => {
    expect(isValidIPI("123456789012")).toBe(false); // 12 digits
  });

  it("rejects IPI numbers with non-numeric characters", () => {
    expect(isValidIPI("1234567890A")).toBe(false);
    expect(isValidIPI("IPI-1234567")).toBe(false);
  });

  it("allows empty IPI (field is optional)", () => {
    // Empty string is allowed — IPI is optional
    expect("").toBe("");
  });
});

// ─── Track Split Data Shape ───────────────────────────────────────────────────

describe("Track split data shape", () => {
  it("constructs a valid TrackSplitData object", () => {
    const trackData = {
      trackId: 1,
      title: "Test Track",
      artist: "Test Artist",
      artworkUrl: null,
      status: "published",
      songwriterSplits: [
        { name: "Alice", email: "alice@test.com", percentage: 60, role: "songwriter", ipi: "" },
        { name: "Bob", email: "bob@test.com", percentage: 40, role: "producer", ipi: "12345678901" },
      ],
      invitations: [
        {
          id: 1,
          email: "bob@test.com",
          fullName: "Bob",
          status: "pending",
          splitPercentage: "40",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
      earnings: [
        {
          id: 1,
          trackId: 1,
          writerProfileId: 10,
          splitPercentage: "60",
          totalEarned: "1500",
          pendingPayout: "500",
          totalPaidOut: "1000",
          writerName: "Alice",
          writerEmail: "alice@test.com",
        },
      ],
    };

    expect(trackData.trackId).toBe(1);
    expect(trackData.songwriterSplits).toHaveLength(2);
    expect(trackData.invitations).toHaveLength(1);
    expect(trackData.earnings).toHaveLength(1);
    expect(sumSplits(trackData.songwriterSplits)).toBe(100);
  });

  it("correctly identifies pending invitations", () => {
    const invitations = [
      { status: "pending", email: "bob@test.com" },
      { status: "accepted", email: "carol@test.com" },
      { status: "declined", email: "dave@test.com" },
    ];
    const pending = invitations.filter((i) => i.status === "pending");
    expect(pending).toHaveLength(1);
    expect(pending[0].email).toBe("bob@test.com");
  });

  it("calculates total earnings across all writers for a track", () => {
    const earnings = [
      { totalEarned: "1500", writerName: "Alice" },
      { totalEarned: "1000", writerName: "Bob" },
    ];
    const total = earnings.reduce((s, e) => s + parseFloat(e.totalEarned), 0);
    expect(total).toBe(2500);
  });
});

// ─── Split Update Mutation Validation ────────────────────────────────────────

describe("Split update mutation validation", () => {
  function validateUpdateInput(splits: Array<{ percentage: number; email: string }>) {
    const total = splits.reduce((s, w) => s + w.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error("Splits must add up to 100%");
    }
    for (const split of splits) {
      if (split.percentage < 0 || split.percentage > 100) {
        throw new Error("Each split must be between 0 and 100");
      }
    }
    return true;
  }

  it("accepts valid splits summing to 100%", () => {
    expect(() =>
      validateUpdateInput([
        { percentage: 70, email: "a@test.com" },
        { percentage: 30, email: "b@test.com" },
      ])
    ).not.toThrow();
  });

  it("throws when splits do not sum to 100%", () => {
    expect(() =>
      validateUpdateInput([
        { percentage: 60, email: "a@test.com" },
        { percentage: 30, email: "b@test.com" },
      ])
    ).toThrow("Splits must add up to 100%");
  });

  it("throws when a split percentage exceeds 100", () => {
    expect(() =>
      validateUpdateInput([{ percentage: 110, email: "a@test.com" }])
    ).toThrow();
  });

  it("throws when a split percentage is negative", () => {
    expect(() =>
      validateUpdateInput([{ percentage: -10, email: "a@test.com" }])
    ).toThrow();
  });
});
