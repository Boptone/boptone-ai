/**
 * server/releases.test.ts
 * DISTRO-F5: Tests for release metadata schema business logic.
 * Uses actual schema field names: pLineYear/pLineOwner (℗), cLineYear/cLineOwner (©),
 * labelName, globalReleaseDate (string YYYY-MM-DD).
 */

import { describe, it, expect } from "vitest";
import {
  validateReleaseForPublish,
  getPublishWarnings,
} from "./routers/releases";

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeBundle(overrides: Partial<{
  title: string | null;
  artworkUrl: string | null;
  cLineYear: number | null;   // © composition
  cLineOwner: string | null;
  pLineYear: number | null;   // ℗ master
  pLineOwner: string | null;
  upc: string | null;
  labelName: string | null;
  primaryGenre: string | null;
  globalReleaseDate: string | null;
  trackCount: number;
  dealCount: number;
}> = {}) {
  const defaults = {
    title: "Midnight Sessions",
    artworkUrl: "https://cdn.boptone.com/art/midnight.jpg",
    cLineYear: 2025,
    cLineOwner: "Jane Doe",
    pLineYear: 2025,
    pLineOwner: "Boptone Records",
    upc: "123456789012",
    labelName: "Boptone Records",
    primaryGenre: "Hip-Hop",
    globalReleaseDate: "2025-06-01",
    trackCount: 10,
    dealCount: 1,
  };
  const merged = { ...defaults, ...overrides };
  return {
    release: {
      title: merged.title,
      artworkUrl: merged.artworkUrl,
      cLineYear: merged.cLineYear,
      cLineOwner: merged.cLineOwner,
      pLineYear: merged.pLineYear,
      pLineOwner: merged.pLineOwner,
      upc: merged.upc,
      labelName: merged.labelName,
      primaryGenre: merged.primaryGenre,
      globalReleaseDate: merged.globalReleaseDate,
    },
    tracks: Array.from({ length: merged.trackCount }, (_, i) => ({ id: i + 1 })),
    deals: Array.from({ length: merged.dealCount }, (_, i) => ({ id: i + 1 })),
  };
}

// ── validateReleaseForPublish ─────────────────────────────────────────────────

describe("validateReleaseForPublish", () => {
  it("returns no errors for a fully complete release", () => {
    const errors = validateReleaseForPublish(makeBundle());
    expect(errors).toHaveLength(0);
  });

  it("requires a release title", () => {
    const errors = validateReleaseForPublish(makeBundle({ title: null }));
    expect(errors.some(e => e.includes("title"))).toBe(true);
  });

  it("requires cover artwork", () => {
    const errors = validateReleaseForPublish(makeBundle({ artworkUrl: null }));
    expect(errors.some(e => e.toLowerCase().includes("artwork"))).toBe(true);
  });

  it("requires composition copyright year (cLineYear)", () => {
    const errors = validateReleaseForPublish(makeBundle({ cLineYear: null }));
    expect(errors.some(e => e.includes("©"))).toBe(true);
  });

  it("requires composition copyright holder (cLineOwner)", () => {
    const errors = validateReleaseForPublish(makeBundle({ cLineOwner: null }));
    expect(errors.some(e => e.includes("©"))).toBe(true);
  });

  it("requires master copyright year (pLineYear)", () => {
    const errors = validateReleaseForPublish(makeBundle({ pLineYear: null }));
    expect(errors.some(e => e.includes("℗"))).toBe(true);
  });

  it("requires master copyright holder (pLineOwner)", () => {
    const errors = validateReleaseForPublish(makeBundle({ pLineOwner: null }));
    expect(errors.some(e => e.includes("℗"))).toBe(true);
  });

  it("requires at least one track", () => {
    const errors = validateReleaseForPublish(makeBundle({ trackCount: 0 }));
    expect(errors.some(e => e.includes("track"))).toBe(true);
  });

  it("requires at least one territory deal", () => {
    const errors = validateReleaseForPublish(makeBundle({ dealCount: 0 }));
    expect(errors.some(e => e.includes("territory"))).toBe(true);
  });

  it("accumulates multiple errors simultaneously", () => {
    const errors = validateReleaseForPublish(makeBundle({
      title: null,
      artworkUrl: null,
      cLineYear: null,
      cLineOwner: null,
      pLineYear: null,
      pLineOwner: null,
      trackCount: 0,
      dealCount: 0,
    }));
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });

  it("passes with a single track and single territory deal", () => {
    const errors = validateReleaseForPublish(makeBundle({ trackCount: 1, dealCount: 1 }));
    expect(errors).toHaveLength(0);
  });

  it("fails with zero tracks even if everything else is complete", () => {
    const errors = validateReleaseForPublish(makeBundle({ trackCount: 0, dealCount: 5 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes("track"))).toBe(true);
  });
});

// ── getPublishWarnings ────────────────────────────────────────────────────────

describe("getPublishWarnings", () => {
  it("returns no warnings for a fully complete release", () => {
    const warnings = getPublishWarnings(makeBundle());
    expect(warnings).toHaveLength(0);
  });

  it("warns when UPC is missing", () => {
    const warnings = getPublishWarnings(makeBundle({ upc: null }));
    expect(warnings.some(w => w.includes("UPC"))).toBe(true);
  });

  it("warns when label name is missing", () => {
    const warnings = getPublishWarnings(makeBundle({ labelName: null }));
    expect(warnings.some(w => w.includes("label"))).toBe(true);
  });

  it("warns when primary genre is missing", () => {
    const warnings = getPublishWarnings(makeBundle({ primaryGenre: null }));
    expect(warnings.some(w => w.includes("genre"))).toBe(true);
  });

  it("warns when global release date is missing", () => {
    const warnings = getPublishWarnings(makeBundle({ globalReleaseDate: null }));
    expect(warnings.some(w => w.includes("date"))).toBe(true);
  });

  it("accumulates all four warnings when all optional fields are missing", () => {
    const warnings = getPublishWarnings(makeBundle({
      upc: null,
      labelName: null,
      primaryGenre: null,
      globalReleaseDate: null,
    }));
    expect(warnings).toHaveLength(4);
  });

  it("returns no warnings when all optional fields are present", () => {
    const warnings = getPublishWarnings(makeBundle({
      upc: "123456789012",
      labelName: "Boptone Records",
      primaryGenre: "R&B",
      globalReleaseDate: "2025-12-01",
    }));
    expect(warnings).toHaveLength(0);
  });
});

// ── DDEX ERN 4.1 field coverage ───────────────────────────────────────────────

describe("DDEX ERN 4.1 required field coverage", () => {
  it("validates that © (cLine) and ℗ (pLine) are independently required", () => {
    // Missing © but ℗ present
    const errors1 = validateReleaseForPublish(makeBundle({
      cLineYear: null,
      cLineOwner: null,
    }));
    expect(errors1.some(e => e.includes("©"))).toBe(true);
    expect(errors1.some(e => e.includes("℗"))).toBe(false);

    // Missing ℗ but © present
    const errors2 = validateReleaseForPublish(makeBundle({
      pLineYear: null,
      pLineOwner: null,
    }));
    expect(errors2.some(e => e.includes("℗"))).toBe(true);
    expect(errors2.some(e => e.includes("©"))).toBe(false);
  });

  it("treats partial © (year without holder) as an error", () => {
    const errors = validateReleaseForPublish(makeBundle({ cLineOwner: null }));
    expect(errors.some(e => e.includes("©"))).toBe(true);
  });

  it("treats partial ℗ (holder without year) as an error", () => {
    const errors = validateReleaseForPublish(makeBundle({ pLineYear: null }));
    expect(errors.some(e => e.includes("℗"))).toBe(true);
  });

  it("a release with all DDEX required fields passes validation", () => {
    const bundle = makeBundle({
      title: "Test Album",
      artworkUrl: "https://cdn.boptone.com/art/test.jpg",
      cLineYear: 2025,
      cLineOwner: "Test Artist",
      pLineYear: 2025,
      pLineOwner: "Test Label",
      trackCount: 3,
      dealCount: 2,
    });
    expect(validateReleaseForPublish(bundle)).toHaveLength(0);
  });

  it("globalReleaseDate is stored as YYYY-MM-DD string not a Date object", () => {
    const bundle = makeBundle({ globalReleaseDate: "2025-06-01" });
    // Should not warn about missing date
    const warnings = getPublishWarnings(bundle);
    expect(warnings.some(w => w.includes("date"))).toBe(false);
  });

  it("null globalReleaseDate triggers a warning (not an error)", () => {
    const errors = validateReleaseForPublish(makeBundle({ globalReleaseDate: null }));
    const warnings = getPublishWarnings(makeBundle({ globalReleaseDate: null }));
    // Not a hard error
    expect(errors.some(e => e.includes("date"))).toBe(false);
    // But is a warning
    expect(warnings.some(w => w.includes("date"))).toBe(true);
  });
});
