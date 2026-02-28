import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildKnowThisArtistBlock } from "../db_toney";
import type { ArtistToneyProfile } from "../../drizzle/schema";

// Mock getDb so tests run without a live DB
vi.mock("../db", () => ({ getDb: vi.fn().mockResolvedValue(null) }));

const baseProfile: ArtistToneyProfile = {
  id: 1,
  artistProfileId: 42,
  userId: 7,
  careerStage: "developing",
  primaryGenre: "R&B",
  subGenre: "Neo-Soul",
  teamStructure: "managed",
  geographicBase: "Atlanta, GA",
  releaseHistorySummary: "Two EPs (2023, 2024), one single in 2025",
  financialPatternsSummary: "Revenue up 34% YoY, driven by BopShop merch",
  primaryIncomeSource: "BopShop",
  seasonalPatterns: "Q4 spike aligned with holiday merch drops",
  activeGoals: "Hit 10k monthly listeners by Q3 2026; land first sync placement",
  implicitPriorities: "Fan community building",
  prefersBriefResponses: false,
  prefersDataHeavy: true,
  communicationNotes: "Likes data with context, not raw numbers alone",
  sensitivities: "Anxious about the 2024 EP underperformance; protective of creative direction",
  protectedTopics: "Label negotiations",
  conversationSummary: "Discussed release strategy for upcoming single; decided on a 6-week promo window",
  summaryUpdatedAt: new Date("2026-02-01"),
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2026-02-01"),
};

describe("buildKnowThisArtistBlock", () => {
  it("returns empty string when profile is null", () => {
    expect(buildKnowThisArtistBlock(null)).toBe("");
  });

  it("includes the KNOW THIS ARTIST header", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("KNOW THIS ARTIST");
  });

  it("includes career stage", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("developing");
  });

  it("combines primary genre and sub-genre with slash", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("R&B / Neo-Soul");
  });

  it("shows genre alone when no sub-genre", () => {
    const profile = { ...baseProfile, subGenre: null };
    const block = buildKnowThisArtistBlock(profile);
    expect(block).toContain("R&B");
    expect(block).not.toContain("/");
  });

  it("includes team structure with underscore replaced by space", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("managed");
    expect(block).not.toContain("label_affiliated");
  });

  it("includes geographic base", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("Atlanta, GA");
  });

  it("includes release history summary", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("Two EPs (2023, 2024)");
  });

  it("includes financial patterns summary", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("Revenue up 34% YoY");
  });

  it("includes primary income source", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("BopShop");
  });

  it("includes seasonal patterns", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("Q4 spike");
  });

  it("includes active goals", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("10k monthly listeners");
  });

  it("includes implicit priorities", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("Fan community building");
  });

  it("includes data-heavy preference when true", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("comfortable with data-heavy responses");
  });

  it("includes brief preference when true", () => {
    const profile = { ...baseProfile, prefersBriefResponses: true, prefersDataHeavy: false };
    const block = buildKnowThisArtistBlock(profile);
    expect(block).toContain("prefers brief responses");
  });

  it("includes communication notes", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("Likes data with context");
  });

  it("includes sensitivities", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("2024 EP underperformance");
  });

  it("includes conversation summary", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("6-week promo window");
  });

  it("includes the active-use instruction at the end", () => {
    const block = buildKnowThisArtistBlock(baseProfile);
    expect(block).toContain("The artist should feel known");
  });

  it("omits sections that have no data", () => {
    const sparse: ArtistToneyProfile = {
      id: 2,
      artistProfileId: 99,
      userId: 8,
      careerStage: "emerging",
      primaryGenre: null,
      subGenre: null,
      teamStructure: "solo",
      geographicBase: null,
      releaseHistorySummary: null,
      financialPatternsSummary: null,
      primaryIncomeSource: null,
      seasonalPatterns: null,
      activeGoals: null,
      implicitPriorities: null,
      prefersBriefResponses: false,
      prefersDataHeavy: false,
      communicationNotes: null,
      sensitivities: null,
      protectedTopics: null,
      conversationSummary: null,
      summaryUpdatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const block = buildKnowThisArtistBlock(sparse);
    expect(block).toContain("KNOW THIS ARTIST");
    expect(block).not.toContain("Financial patterns:");
    expect(block).not.toContain("Active goals:");
    expect(block).not.toContain("Recent conversation context:");
  });
});
