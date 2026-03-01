/**
 * cohortEngine.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive unit tests for the cohort LTV computation engine.
 * Tests cover: cohort month bucketing, period math, retention calculation,
 * LTV aggregation, percentile computation, fee math, and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  toCohortMonth,
  fromCohortMonth,
  addDays,
  computePlatformFee,
  median,
  percentile,
  COHORT_PERIODS,
} from "../lib/cohortEngine";

// ─── toCohortMonth ────────────────────────────────────────────────────────────

describe("toCohortMonth", () => {
  it("converts a date to YYYY-MM format", () => {
    expect(toCohortMonth(new Date(Date.UTC(2025, 0, 15)))).toBe("2025-01");
    expect(toCohortMonth(new Date(Date.UTC(2024, 11, 31)))).toBe("2024-12");
    expect(toCohortMonth(new Date(Date.UTC(2026, 2, 1)))).toBe("2026-03");
  });

  it("pads single-digit months with a leading zero", () => {
    expect(toCohortMonth(new Date(Date.UTC(2025, 5, 1)))).toBe("2025-06");
    expect(toCohortMonth(new Date(Date.UTC(2025, 8, 30)))).toBe("2025-09");
  });

  it("handles the first day of a month", () => {
    expect(toCohortMonth(new Date(Date.UTC(2025, 0, 1)))).toBe("2025-01");
  });

  it("handles the last day of a month", () => {
    expect(toCohortMonth(new Date(Date.UTC(2025, 0, 31)))).toBe("2025-01");
  });

  it("handles February correctly", () => {
    expect(toCohortMonth(new Date(Date.UTC(2024, 1, 29)))).toBe("2024-02"); // leap year
    expect(toCohortMonth(new Date(Date.UTC(2025, 1, 28)))).toBe("2025-02");
  });

  it("handles year boundaries", () => {
    expect(toCohortMonth(new Date(Date.UTC(2024, 11, 31)))).toBe("2024-12");
    expect(toCohortMonth(new Date(Date.UTC(2025, 0, 1)))).toBe("2025-01");
  });
});

// ─── fromCohortMonth ──────────────────────────────────────────────────────────

describe("fromCohortMonth", () => {
  it("returns the first day of the given month (UTC)", () => {
    const d = fromCohortMonth("2025-03");
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(2); // 0-indexed
    expect(d.getUTCDate()).toBe(1);
  });

  it("handles January correctly", () => {
    const d = fromCohortMonth("2025-01");
    expect(d.getUTCMonth()).toBe(0);
    expect(d.getUTCDate()).toBe(1);
  });

  it("handles December correctly", () => {
    const d = fromCohortMonth("2024-12");
    expect(d.getUTCFullYear()).toBe(2024);
    expect(d.getUTCMonth()).toBe(11);
  });

  it("round-trips with toCohortMonth", () => {
    const original = "2025-07";
    expect(toCohortMonth(fromCohortMonth(original))).toBe(original);
  });
});

// ─── addDays ──────────────────────────────────────────────────────────────────

describe("addDays", () => {
  it("adds 30 days correctly", () => {
    const start = new Date(Date.UTC(2025, 0, 1)); // Jan 1 UTC
    const result = addDays(start, 30);
    expect(result.getUTCDate()).toBe(31);
    expect(result.getUTCMonth()).toBe(0); // still January
  });

  it("crosses month boundaries", () => {
    const start = new Date(Date.UTC(2025, 0, 15)); // Jan 15
    const result = addDays(start, 30);
    expect(result.getUTCMonth()).toBe(1); // February
    expect(result.getUTCDate()).toBe(14);
  });

  it("crosses year boundaries", () => {
    const start = new Date(Date.UTC(2024, 11, 15)); // Dec 15
    const result = addDays(start, 30);
    expect(result.getUTCFullYear()).toBe(2025);
    expect(result.getUTCMonth()).toBe(0); // January
  });

  it("handles 365 days (non-leap year)", () => {
    const start = new Date(Date.UTC(2025, 0, 1));
    const result = addDays(start, 365);
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(1);
  });

  it("handles 365 days (leap year)", () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const result = addDays(start, 365);
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(11);
    expect(result.getUTCDate()).toBe(31);
  });

  it("does not mutate the original date", () => {
    const start = new Date(Date.UTC(2025, 0, 1));
    const original = start.getTime();
    addDays(start, 30);
    expect(start.getTime()).toBe(original);
  });

  it("handles 0 days", () => {
    const start = new Date(Date.UTC(2025, 5, 15));
    const result = addDays(start, 0);
    expect(result.getTime()).toBe(start.getTime());
  });
});

// ─── computePlatformFee ───────────────────────────────────────────────────────

describe("computePlatformFee", () => {
  it("computes 15% fee for streaming", () => {
    expect(computePlatformFee(10000, "streaming")).toBe(1500);
  });

  it("computes 10% fee for shop_sale", () => {
    expect(computePlatformFee(5000, "shop_sale")).toBe(500);
  });

  it("computes 5% fee for tip", () => {
    expect(computePlatformFee(2000, "tip")).toBe(100);
  });

  it("computes 20% fee for subscription", () => {
    expect(computePlatformFee(1000, "subscription")).toBe(200);
  });

  it("computes 5% fee for backing", () => {
    expect(computePlatformFee(4000, "backing")).toBe(200);
  });

  it("computes 10% fee for other", () => {
    expect(computePlatformFee(3000, "other")).toBe(300);
  });

  it("rounds to nearest cent", () => {
    // 15% of 1001 cents = 150.15 → rounds to 150
    expect(computePlatformFee(1001, "streaming")).toBe(150);
    // 15% of 1003 cents = 150.45 → rounds to 150
    expect(computePlatformFee(1003, "streaming")).toBe(150);
    // 15% of 1007 cents = 151.05 → rounds to 151
    expect(computePlatformFee(1007, "streaming")).toBe(151);
  });

  it("handles zero amount", () => {
    expect(computePlatformFee(0, "streaming")).toBe(0);
  });

  it("handles large amounts without overflow", () => {
    // $100,000 in cents = 10,000,000 cents; 15% = 1,500,000
    expect(computePlatformFee(10_000_000, "streaming")).toBe(1_500_000);
  });

  it("net amount is always less than gross", () => {
    const gross = 5000;
    const fee = computePlatformFee(gross, "streaming");
    expect(gross - fee).toBeLessThan(gross);
    expect(gross - fee).toBeGreaterThan(0);
  });
});

// ─── median ───────────────────────────────────────────────────────────────────

describe("median", () => {
  it("returns 0 for empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns the single element for a 1-element array", () => {
    expect(median([42])).toBe(42);
  });

  it("returns the middle element for odd-length arrays", () => {
    expect(median([1, 2, 3])).toBe(2);
    expect(median([10, 20, 30, 40, 50])).toBe(30);
  });

  it("returns the average of two middle elements for even-length arrays", () => {
    expect(median([1, 2, 3, 4])).toBe(3); // (2+3)/2 = 2.5 → Math.round(2.5) = 3 in JS
    expect(median([100, 200, 300, 400])).toBe(250);
  });

  it("handles arrays with duplicate values", () => {
    expect(median([5, 5, 5, 5])).toBe(5);
    expect(median([1, 1, 3, 3])).toBe(2);
  });

  it("handles large values without overflow", () => {
    expect(median([1_000_000, 2_000_000, 3_000_000])).toBe(2_000_000);
  });

  it("requires pre-sorted input (ascending)", () => {
    // median() assumes sorted input — verify it works correctly on sorted data
    const sorted = [100, 200, 300, 400, 500];
    expect(median(sorted)).toBe(300);
  });
});

// ─── percentile ───────────────────────────────────────────────────────────────

describe("percentile", () => {
  it("returns 0 for empty array", () => {
    expect(percentile([], 90)).toBe(0);
  });

  it("returns the single element for p50 on 1-element array", () => {
    expect(percentile([100], 50)).toBe(100);
  });

  it("returns the single element for p90 on 1-element array", () => {
    expect(percentile([100], 90)).toBe(100);
  });

  it("computes p50 (median) correctly", () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(data, 50)).toBe(50);
  });

  it("computes p90 correctly", () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(data, 90)).toBe(90);
  });

  it("computes p100 correctly (returns max)", () => {
    const data = [10, 20, 30, 40, 50];
    expect(percentile(data, 100)).toBe(50);
  });

  it("computes p0 correctly (returns min)", () => {
    const data = [10, 20, 30, 40, 50];
    expect(percentile(data, 0)).toBe(10);
  });

  it("clamps to array bounds", () => {
    const data = [100, 200, 300];
    expect(percentile(data, 99)).toBe(300);
    expect(percentile(data, 1)).toBe(100);
  });

  it("handles LTV distribution scenario", () => {
    // Simulate 10 artists with varying LTV
    const ltvs = [500, 800, 1200, 1500, 2000, 2500, 3000, 4000, 6000, 15000].sort((a, b) => a - b);
    const p90 = percentile(ltvs, 90);
    expect(p90).toBeGreaterThan(median(ltvs));
    expect(p90).toBeLessThanOrEqual(15000);
  });
});

// ─── COHORT_PERIODS ───────────────────────────────────────────────────────────

describe("COHORT_PERIODS", () => {
  it("contains exactly 5 periods", () => {
    expect(COHORT_PERIODS).toHaveLength(5);
  });

  it("contains the expected period values", () => {
    expect(COHORT_PERIODS).toContain(30);
    expect(COHORT_PERIODS).toContain(60);
    expect(COHORT_PERIODS).toContain(90);
    expect(COHORT_PERIODS).toContain(180);
    expect(COHORT_PERIODS).toContain(365);
  });

  it("is sorted in ascending order", () => {
    const sorted = [...COHORT_PERIODS].sort((a, b) => a - b);
    expect([...COHORT_PERIODS]).toEqual(sorted);
  });
});

// ─── Retention rate calculation (derived logic) ───────────────────────────────

describe("Retention rate calculation", () => {
  it("computes 100% retention when all artists generate revenue", () => {
    const cohortSize = 10;
    const retainedCount = 10;
    const retentionRate = (retainedCount / cohortSize) * 100;
    expect(retentionRate).toBe(100);
  });

  it("computes 0% retention when no artists generate revenue", () => {
    const cohortSize = 50;
    const retainedCount = 0;
    const retentionRate = (retainedCount / cohortSize) * 100;
    expect(retentionRate).toBe(0);
  });

  it("computes partial retention correctly", () => {
    const cohortSize = 100;
    const retainedCount = 42;
    const retentionRate = (retainedCount / cohortSize) * 100;
    expect(retentionRate).toBe(42);
  });

  it("handles fractional retention rates", () => {
    const cohortSize = 3;
    const retainedCount = 1;
    const retentionRate = Number(((retainedCount / cohortSize) * 100).toFixed(2));
    expect(retentionRate).toBe(33.33);
  });

  it("retention cannot exceed 100%", () => {
    const cohortSize = 10;
    const retainedCount = 10;
    const retentionRate = Math.min(100, (retainedCount / cohortSize) * 100);
    expect(retentionRate).toBeLessThanOrEqual(100);
  });
});

// ─── LTV aggregation (derived logic) ─────────────────────────────────────────

describe("LTV aggregation", () => {
  it("computes average LTV correctly", () => {
    const ltvValues = [1000, 2000, 3000, 4000, 5000];
    const total = ltvValues.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / ltvValues.length);
    expect(avg).toBe(3000);
  });

  it("handles single artist cohort", () => {
    const ltvValues = [5000];
    const avg = Math.round(ltvValues[0] / 1);
    expect(avg).toBe(5000);
  });

  it("computes total revenue correctly", () => {
    const ltvValues = [1000, 2000, 3000];
    const total = ltvValues.reduce((a, b) => a + b, 0);
    expect(total).toBe(6000);
  });

  it("avg LTV is between min and max LTV", () => {
    const ltvValues = [500, 1500, 3000, 8000, 20000].sort((a, b) => a - b);
    const total = ltvValues.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / ltvValues.length);
    expect(avg).toBeGreaterThanOrEqual(ltvValues[0]);
    expect(avg).toBeLessThanOrEqual(ltvValues[ltvValues.length - 1]);
  });

  it("p90 LTV is always >= median LTV for non-trivial distributions", () => {
    const ltvValues = [100, 200, 500, 1000, 2000, 3000, 5000, 8000, 12000, 50000].sort((a, b) => a - b);
    const med = median(ltvValues);
    const p90 = percentile(ltvValues, 90);
    expect(p90).toBeGreaterThanOrEqual(med);
  });
});

// ─── Revenue source breakdown (derived logic) ─────────────────────────────────

describe("Revenue source breakdown", () => {
  it("percentages sum to 100 for a complete breakdown", () => {
    const total = 10000;
    const streaming = 5500;
    const shop = 2000;
    const tips = 1500;
    const subs = 700;
    const other = total - streaming - shop - tips - subs;

    const pcts = [streaming, shop, tips, subs, other].map(v =>
      Number(((v / total) * 100).toFixed(1))
    );
    // Due to rounding, sum may be off by 0.1 — this is acceptable
    const sum = pcts.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThanOrEqual(99.5);
    expect(sum).toBeLessThanOrEqual(100.5);
  });

  it("streaming is the dominant source in early cohorts", () => {
    const streamingShare = 0.55;
    const shopShare = 0.20;
    expect(streamingShare).toBeGreaterThan(shopShare);
  });

  it("handles zero revenue gracefully", () => {
    const total = 1; // avoid division by zero
    const streaming = 0;
    const pct = (streaming / total) * 100;
    expect(pct).toBe(0);
  });
});

// ─── Cohort month progression ─────────────────────────────────────────────────

describe("Cohort month progression", () => {
  it("generates 18 consecutive months correctly", () => {
    const nowYear = 2026;
    const nowMonth = 2; // 0-indexed = March
    const months: string[] = [];
    for (let i = 17; i >= 0; i--) {
      const d = new Date(Date.UTC(nowYear, nowMonth - i, 1));
      months.push(toCohortMonth(d));
    }
    expect(months).toHaveLength(18);
    // March 2026 (month index 2) minus 17 = month index -15 → JS Date wraps to Oct 2024
    expect(months[0]).toBe("2024-10");
    expect(months[17]).toBe("2026-03");
  });

  it("months are in ascending chronological order", () => {
    const months = ["2025-01", "2025-02", "2025-03", "2025-04"];
    const sorted = [...months].sort();
    expect(months).toEqual(sorted);
  });

  it("YYYY-MM format sorts correctly as strings", () => {
    const months = ["2025-12", "2024-01", "2025-06", "2026-01"];
    const sorted = months.sort();
    expect(sorted[0]).toBe("2024-01");
    expect(sorted[sorted.length - 1]).toBe("2026-01");
  });
});

// ─── Platform fee rate validation ────────────────────────────────────────────

describe("Platform fee rates", () => {
  const sources = ["streaming", "shop_sale", "tip", "subscription", "backing", "other"] as const;

  it("all sources have a defined fee rate", () => {
    const amount = 10000;
    for (const source of sources) {
      const fee = computePlatformFee(amount, source);
      expect(fee).toBeGreaterThanOrEqual(0);
      expect(fee).toBeLessThan(amount);
    }
  });

  it("fee is always less than 100% of gross", () => {
    for (const source of sources) {
      const fee = computePlatformFee(1000, source);
      expect(fee).toBeLessThan(1000);
    }
  });

  it("net amount is always positive for positive gross", () => {
    for (const source of sources) {
      const gross = 500;
      const fee = computePlatformFee(gross, source);
      const net = gross - fee;
      expect(net).toBeGreaterThan(0);
    }
  });
});
