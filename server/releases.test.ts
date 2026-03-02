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
  rightsType: string | null;
  trackCount: number;
  dealCount: number;
  allRightsConfirmed: boolean;
  hasAttestation: boolean;
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
    rightsType: "independent" as string | null,
    trackCount: 10,
    dealCount: 1,
    allRightsConfirmed: true,
    hasAttestation: true,
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
      rightsType: merged.rightsType,
    },
    tracks: Array.from({ length: merged.trackCount }, (_, i) => ({ id: i + 1 })),
    deals: Array.from({ length: merged.dealCount }, (_, i) => ({
      id: i + 1,
      territory: `T${i}`,
      masterRightsConfirmed: merged.allRightsConfirmed ? 1 : 0,
      publishingHandledBy: "self" as const,
    })),
    latestAttestation: merged.hasAttestation
      ? { attestedAt: new Date("2025-06-01T12:00:00Z") }
      : null,
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

// ── DISTRO-RIGHTS: Territory rights declaration tests ─────────────────────────

describe("DISTRO-RIGHTS: validateReleaseForPublish — rights gating", () => {
  it("passes when all territories have rights confirmed and attestation exists", () => {
    const errors = validateReleaseForPublish(makeBundle({
      dealCount: 3,
      allRightsConfirmed: true,
      hasAttestation: true,
    }));
    expect(errors).toHaveLength(0);
  });

  it("blocks submission when any territory lacks rights confirmation", () => {
    const errors = validateReleaseForPublish(makeBundle({
      dealCount: 2,
      allRightsConfirmed: false,
      hasAttestation: true,
    }));
    expect(errors.some(e => e.toLowerCase().includes("rights not confirmed"))).toBe(true);
  });

  it("blocks submission when no rights attestation exists", () => {
    const errors = validateReleaseForPublish(makeBundle({
      allRightsConfirmed: true,
      hasAttestation: false,
    }));
    expect(errors.some(e => e.toLowerCase().includes("rights declaration"))).toBe(true);
  });

  it("blocks submission when both rights unconfirmed AND no attestation", () => {
    const errors = validateReleaseForPublish(makeBundle({
      dealCount: 2,
      allRightsConfirmed: false,
      hasAttestation: false,
    }));
    // Both errors should appear
    expect(errors.some(e => e.toLowerCase().includes("rights not confirmed"))).toBe(true);
    expect(errors.some(e => e.toLowerCase().includes("rights declaration"))).toBe(true);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it("identifies the specific unconfirmed territories in the error message", () => {
    const bundle = makeBundle({ dealCount: 0, allRightsConfirmed: true, hasAttestation: true });
    // Manually inject a mix of confirmed/unconfirmed deals
    bundle.deals = [
      { id: 1, territory: "US", masterRightsConfirmed: 1, publishingHandledBy: "self" },
      { id: 2, territory: "GB", masterRightsConfirmed: 0, publishingHandledBy: "self" },
      { id: 3, territory: "DE", masterRightsConfirmed: 0, publishingHandledBy: "self" },
    ];
    const errors = validateReleaseForPublish(bundle);
    const rightsError = errors.find(e => e.includes("rights not confirmed"));
    expect(rightsError).toBeDefined();
    expect(rightsError).toContain("GB");
    expect(rightsError).toContain("DE");
    expect(rightsError).not.toContain("US");
  });

  it("split-rights scenario: US/CA confirmed, UK/DE not added — passes", () => {
    const bundle = makeBundle({ dealCount: 0, allRightsConfirmed: true, hasAttestation: true });
    // Only US and CA in the deal list — UK/DE label territory not added
    bundle.deals = [
      { id: 1, territory: "US", masterRightsConfirmed: 1, publishingHandledBy: "self" },
      { id: 2, territory: "CA", masterRightsConfirmed: 1, publishingHandledBy: "self" },
    ];
    const errors = validateReleaseForPublish(bundle);
    expect(errors).toHaveLength(0);
  });

  it("split-rights scenario: artist accidentally adds UK (label territory) — blocked", () => {
    const bundle = makeBundle({ dealCount: 0, allRightsConfirmed: true, hasAttestation: true });
    bundle.deals = [
      { id: 1, territory: "US", masterRightsConfirmed: 1, publishingHandledBy: "self" },
      { id: 2, territory: "CA", masterRightsConfirmed: 1, publishingHandledBy: "self" },
      // Artist forgot to uncheck UK — rights unconfirmed blocks delivery
      { id: 3, territory: "GB", masterRightsConfirmed: 0, publishingHandledBy: "label" },
    ];
    const errors = validateReleaseForPublish(bundle);
    expect(errors.some(e => e.includes("GB"))).toBe(true);
  });

  it("attestation-only check: existing attestation satisfies the requirement", () => {
    const errors = validateReleaseForPublish(makeBundle({
      allRightsConfirmed: true,
      hasAttestation: true,
    }));
    expect(errors.some(e => e.toLowerCase().includes("rights declaration"))).toBe(false);
  });

  it("rights gating does not interfere with other DDEX validation errors", () => {
    const errors = validateReleaseForPublish(makeBundle({
      title: null,
      artworkUrl: null,
      allRightsConfirmed: false,
      hasAttestation: false,
    }));
    // Should have title error, artwork error, rights errors
    expect(errors.some(e => e.includes("title"))).toBe(true);
    expect(errors.some(e => e.toLowerCase().includes("artwork"))).toBe(true);
    expect(errors.some(e => e.toLowerCase().includes("rights"))).toBe(true);
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});
