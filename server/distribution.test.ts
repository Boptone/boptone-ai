/**
 * DISTRO-UX1: Distribution Wizard — Server-side unit tests
 *
 * Tests cover:
 * - DSP catalog integrity
 * - Pricing tier configuration
 * - Territory validation helpers
 * - Submission status transitions
 */

import { describe, it, expect } from "vitest";
import {
  DSP_CATALOG,
  PRICING_TIERS,
  validateTerritories,
  validateSubmissionForSubmit,
  getSubmissionSummary,
} from "./routers/distribution";

// ─── DSP Catalog ──────────────────────────────────────────────────────────────

describe("DSP_CATALOG", () => {
  it("should contain at least 5 DSPs", () => {
    expect(DSP_CATALOG.length).toBeGreaterThanOrEqual(5);
  });

  it("should always include boptone as the first entry", () => {
    expect(DSP_CATALOG[0].slug).toBe("boptone");
  });

  it("should mark boptone as alwaysIncluded", () => {
    const boptone = DSP_CATALOG.find((d) => d.slug === "boptone");
    expect(boptone?.alwaysIncluded).toBe(true);
  });

  it("should have unique slugs", () => {
    const slugs = DSP_CATALOG.map((d) => d.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("should have non-empty name and description for all DSPs", () => {
    for (const dsp of DSP_CATALOG) {
      expect(dsp.name).toBeTruthy();
      expect(dsp.description).toBeTruthy();
    }
  });

  it("should have non-negative minLeadTimeDays for all DSPs", () => {
    for (const dsp of DSP_CATALOG) {
      expect(dsp.minLeadTimeDays).toBeGreaterThanOrEqual(0);
    }
  });

  it("should include major platforms: spotify, apple_music, tidal", () => {
    const slugs = DSP_CATALOG.map((d) => d.slug);
    expect(slugs).toContain("spotify");
    expect(slugs).toContain("apple_music");
    expect(slugs).toContain("tidal");
  });

  it("should have revenueShareNote for all DSPs", () => {
    for (const dsp of DSP_CATALOG) {
      expect(typeof dsp.revenueShareNote).toBe("string");
    }
  });
});

// ─── Pricing Tiers ────────────────────────────────────────────────────────────

describe("PRICING_TIERS", () => {
  it("should contain exactly 3 tiers: free, standard, premium", () => {
    const ids = PRICING_TIERS.map((t) => t.id);
    expect(ids).toContain("free");
    expect(ids).toContain("standard");
    expect(ids).toContain("premium");
    expect(PRICING_TIERS.length).toBe(3);
  });

  it("should have boptoneSharePercent between 0 and 100 for all tiers", () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.boptoneSharePercent).toBeGreaterThanOrEqual(0);
      expect(tier.boptoneSharePercent).toBeLessThanOrEqual(100);
    }
  });

  it("should have free tier with 0% share", () => {
    const free = PRICING_TIERS.find((t) => t.id === "free");
    expect(free?.boptoneSharePercent).toBe(0);
  });

  it("should have standard tier with 10% share", () => {
    const standard = PRICING_TIERS.find((t) => t.id === "standard");
    expect(standard?.boptoneSharePercent).toBe(10);
  });

  it("should have premium tier with higher share than standard", () => {
    const standard = PRICING_TIERS.find((t) => t.id === "standard");
    const premium = PRICING_TIERS.find((t) => t.id === "premium");
    expect(premium!.boptoneSharePercent).toBeGreaterThan(standard!.boptoneSharePercent);
  });

  it("should have non-empty label and description for all tiers", () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.label).toBeTruthy();
      expect(tier.description).toBeTruthy();
    }
  });
});

// ─── Territory Validation ─────────────────────────────────────────────────────

describe("validateTerritories", () => {
  it("should accept worldwide mode", () => {
    const result = validateTerritories({ mode: "worldwide" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject regions mode with no regions selected", () => {
    const result = validateTerritories({ mode: "regions", regions: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should accept regions mode with at least one region", () => {
    const result = validateTerritories({ mode: "regions", regions: ["north_america"] });
    expect(result.valid).toBe(true);
  });

  it("should reject custom mode with no countries selected", () => {
    const result = validateTerritories({ mode: "custom", countries: [] });
    expect(result.valid).toBe(false);
  });

  it("should accept custom mode with at least one country", () => {
    const result = validateTerritories({ mode: "custom", countries: ["US"] });
    expect(result.valid).toBe(true);
  });

  it("should default to worldwide when mode is not specified", () => {
    const result = validateTerritories({} as any);
    expect(result.valid).toBe(true);
  });
});

// ─── Submission Validation ────────────────────────────────────────────────────

describe("validateSubmissionForSubmit", () => {
  const validBase = {
    trackIds: [1],
    selectedDsps: ["boptone", "spotify"],
    territories: { mode: "worldwide" as const },
    pricingTier: "standard" as const,
    releaseDate: null,
    preSaveEnabled: false,
    exclusiveWindowDays: 0,
  };

  it("should pass with valid minimal submission", () => {
    const result = validateSubmissionForSubmit(validBase);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail when no tracks are selected", () => {
    const result = validateSubmissionForSubmit({ ...validBase, trackIds: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("track"))).toBe(true);
  });

  it("should fail when no DSPs are selected", () => {
    const result = validateSubmissionForSubmit({ ...validBase, selectedDsps: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("platform"))).toBe(true);
  });

  it("should fail when territory mode is regions but no regions selected", () => {
    const result = validateSubmissionForSubmit({
      ...validBase,
      territories: { mode: "regions", regions: [] },
    });
    expect(result.valid).toBe(false);
  });

  it("should fail when territory mode is custom but no countries selected", () => {
    const result = validateSubmissionForSubmit({
      ...validBase,
      territories: { mode: "custom", countries: [] },
    });
    expect(result.valid).toBe(false);
  });

  it("should pass with scheduled release date in the future", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const result = validateSubmissionForSubmit({
      ...validBase,
      releaseDate: future.toISOString().split("T")[0],
    });
    expect(result.valid).toBe(true);
  });

  it("should fail when release date is in the past", () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const result = validateSubmissionForSubmit({
      ...validBase,
      releaseDate: past.toISOString().split("T")[0],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("date") || e.includes("past"))).toBe(true);
  });

  it("should warn when pre-save is enabled but no release date is set", () => {
    const result = validateSubmissionForSubmit({
      ...validBase,
      preSaveEnabled: true,
      releaseDate: null,
    });
    expect(result.warnings.some((w) => w.includes("pre-save") || w.includes("date"))).toBe(true);
  });
});

// ─── Submission Summary ───────────────────────────────────────────────────────

describe("getSubmissionSummary", () => {
  it("should return a summary with dspCount and territoryLabel", () => {
    const summary = getSubmissionSummary({
      selectedDsps: ["boptone", "spotify", "tidal"],
      territories: { mode: "worldwide" },
      pricingTier: "standard",
      releaseDate: null,
      exclusiveWindowDays: 0,
    });
    expect(summary.dspCount).toBe(3);
    expect(summary.territoryLabel).toBe("Worldwide");
    expect(summary.pricingLabel).toBe("Standard");
  });

  it("should return correct territory label for regions mode", () => {
    const summary = getSubmissionSummary({
      selectedDsps: ["boptone"],
      territories: { mode: "regions", regions: ["north_america", "europe"] },
      pricingTier: "free",
      releaseDate: null,
      exclusiveWindowDays: 0,
    });
    expect(summary.territoryLabel).toContain("2 region");
  });

  it("should return correct territory label for custom mode", () => {
    const summary = getSubmissionSummary({
      selectedDsps: ["boptone"],
      territories: { mode: "custom", countries: ["US", "GB", "DE"] },
      pricingTier: "premium",
      releaseDate: null,
      exclusiveWindowDays: 0,
    });
    expect(summary.territoryLabel).toContain("3 countr");
  });

  it("should include exclusiveWindowLabel when exclusiveWindowDays > 0", () => {
    const summary = getSubmissionSummary({
      selectedDsps: ["boptone"],
      territories: { mode: "worldwide" },
      pricingTier: "standard",
      releaseDate: null,
      exclusiveWindowDays: 14,
    });
    expect(summary.exclusiveWindowLabel).toContain("14");
  });

  it("should return null exclusiveWindowLabel when exclusiveWindowDays is 0", () => {
    const summary = getSubmissionSummary({
      selectedDsps: ["boptone"],
      territories: { mode: "worldwide" },
      pricingTier: "standard",
      releaseDate: null,
      exclusiveWindowDays: 0,
    });
    expect(summary.exclusiveWindowLabel).toBeNull();
  });
});
