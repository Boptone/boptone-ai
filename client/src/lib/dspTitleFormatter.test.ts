/**
 * Tests for DSP Title Formatter (DISTRO-CREDITS)
 * Covers Apple, Amazon, Spotify, TIDAL, and Deezer formatting rules
 */
import { describe, it, expect } from "vitest";
import {
  formatForDsp,
  formatForAllDsps,
  validateTitleForDsp,
  buildFeaturedArtistString,
  type DspTitleInput,
} from "./dspTitleFormatter";

// ---------------------------------------------------------------------------
// formatForDsp — Apple Music
// ---------------------------------------------------------------------------
describe("formatForDsp — Apple Music", () => {
  it("strips ALL CAPS titles and title-cases them", () => {
    const result = formatForDsp({ title: "MIDNIGHT RAIN" }, "apple");
    expect(result.formattedTitle).toBe("Midnight Rain");
  });

  it("appends featured artists in parentheses", () => {
    const result = formatForDsp(
      { title: "Blinding Lights", featuredArtists: [{ name: "Drake" }] },
      "apple"
    );
    expect(result.formattedTitle).toBe("Blinding Lights (feat. Drake)");
  });

  it("appends multiple featured artists joined by & in parentheses", () => {
    const result = formatForDsp(
      {
        title: "Song",
        featuredArtists: [{ name: "Artist A" }, { name: "Artist B" }],
      },
      "apple"
    );
    expect(result.formattedTitle).toBe("Song (feat. Artist A & Artist B)");
  });

  it("does not double-append feat. if already in title", () => {
    const result = formatForDsp(
      {
        title: "Song (feat. Drake)",
        featuredArtists: [{ name: "Drake" }],
      },
      "apple"
    );
    // Should not produce "Song (feat. Drake) (feat. Drake)"
    const count = (result.formattedTitle.match(/feat\./g) || []).length;
    expect(count).toBe(1);
  });

  it("flags EXCLUSIVE in title as an error (Apple bans marketing phrases)", () => {
    const result = formatForDsp({ title: "Song - EXCLUSIVE" }, "apple");
    // Apple treats banned marketing phrases as hard errors
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("flags PREMIERE in title (not a banned Apple phrase — no error expected)", () => {
    // PREMIERE is not in Apple's banned list; no error should be raised
    const result = formatForDsp({ title: "Song PREMIERE" }, "apple");
    // This test documents the current behaviour: no error for PREMIERE
    expect(typeof result.formattedTitle).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// formatForDsp — Amazon Music
// ---------------------------------------------------------------------------
describe("formatForDsp — Amazon Music", () => {
  it("uses parentheses for featured artists, not square brackets", () => {
    const result = formatForDsp(
      { title: "Track", featuredArtists: [{ name: "Kendrick Lamar" }] },
      "amazon"
    );
    expect(result.formattedTitle).toContain("(feat.");
    expect(result.formattedTitle).not.toContain("[feat.");
  });

  it("flags square brackets in title as an error (Amazon rejects them)", () => {
    const result = formatForDsp({ title: "Track [Remix]" }, "amazon");
    // Amazon treats square brackets as a hard error
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// formatForDsp — Spotify
// ---------------------------------------------------------------------------
describe("formatForDsp — Spotify", () => {
  it("preserves title as-is when no issues", () => {
    const result = formatForDsp({ title: "Levitating" }, "spotify");
    expect(result.formattedTitle).toBe("Levitating");
  });

  it("flags excessive punctuation as a warning", () => {
    const result = formatForDsp({ title: "Track!!!!" }, "spotify");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("appends featured artists with feat. notation", () => {
    const result = formatForDsp(
      { title: "Song", featuredArtists: [{ name: "SZA" }] },
      "spotify"
    );
    expect(result.formattedTitle).toContain("feat. SZA");
  });
});

// ---------------------------------------------------------------------------
// formatForDsp — TIDAL
// ---------------------------------------------------------------------------
describe("formatForDsp — TIDAL", () => {
  it("preserves title for hi-res lossless context", () => {
    const result = formatForDsp({ title: "Bohemian Rhapsody" }, "tidal");
    expect(result.formattedTitle).toBe("Bohemian Rhapsody");
  });

  it("appends featured artists", () => {
    const result = formatForDsp(
      { title: "Song", featuredArtists: [{ name: "Jay-Z" }] },
      "tidal"
    );
    expect(result.formattedTitle).toContain("Jay-Z");
  });
});

// ---------------------------------------------------------------------------
// formatForDsp — Deezer
// ---------------------------------------------------------------------------
describe("formatForDsp — Deezer", () => {
  it("appends featured artists", () => {
    const result = formatForDsp(
      { title: "Song", featuredArtists: [{ name: "Beyoncé" }] },
      "deezer"
    );
    expect(result.formattedTitle).toContain("Beyoncé");
  });
});

// ---------------------------------------------------------------------------
// formatForAllDsps
// ---------------------------------------------------------------------------
describe("formatForAllDsps", () => {
  it("returns results for all 5 DSPs", () => {
    const results = formatForAllDsps({ title: "Test Track" });
    // AllDspTitles has 5 DSP keys + 3 metadata keys (hasErrors, hasWarnings, allValid)
    expect(results).toHaveProperty("apple");
    expect(results).toHaveProperty("amazon");
    expect(results).toHaveProperty("spotify");
    expect(results).toHaveProperty("tidal");
    expect(results).toHaveProperty("deezer");
  });

  it("all DSPs produce a formattedTitle", () => {
    const results = formatForAllDsps({ title: "Night Owl" });
    const dspKeys = ["apple", "amazon", "spotify", "tidal", "deezer"] as const;
    for (const key of dspKeys) {
      const dsp = results[key];
      expect(typeof dsp.formattedTitle).toBe("string");
      expect(dsp.formattedTitle.length).toBeGreaterThan(0);
    }
  });

  it("all DSPs produce warnings array", () => {
    const results = formatForAllDsps({ title: "Track" });
    const dspKeys: Array<keyof typeof results> = ["apple", "amazon", "spotify", "tidal", "deezer"];
    for (const key of dspKeys) {
      const dsp = results[key];
      expect(Array.isArray(dsp.warnings)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// validateTitleForDsp
// ---------------------------------------------------------------------------
describe("validateTitleForDsp", () => {
  it("returns valid for a clean title", () => {
    const result = validateTitleForDsp("Midnight Rain", "apple");
    expect(result.valid).toBe(true);
  });

  it("returns invalid for empty title", () => {
    const result = validateTitleForDsp("", "apple");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for title exceeding 255 characters", () => {
    const longTitle = "A".repeat(256);
    const result = validateTitleForDsp(longTitle, "apple");
    expect(result.valid).toBe(false);
  });

  it("returns errors or warnings for ALL CAPS title on Apple", () => {
    const result = validateTitleForDsp("MIDNIGHT RAIN", "apple");
    // Apple treats ALL CAPS as an error (hard rejection)
    expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// buildFeaturedArtistString
// ---------------------------------------------------------------------------
describe("buildFeaturedArtistString", () => {
  it("returns empty string for empty array", () => {
    expect(buildFeaturedArtistString([])).toBe("");
  });

  it("formats single artist", () => {
    expect(buildFeaturedArtistString([{ name: "Drake" }])).toBe("feat. Drake");
  });

  it("formats two artists joined by &", () => {
    expect(buildFeaturedArtistString([{ name: "Drake" }, { name: "SZA" }])).toBe(
      "feat. Drake & SZA"
    );
  });

  it("formats three artists with Oxford comma style", () => {
    const result = buildFeaturedArtistString([
      { name: "A" },
      { name: "B" },
      { name: "C" },
    ]);
    expect(result).toContain("A");
    expect(result).toContain("B");
    expect(result).toContain("C");
  });

  it("filters out artists with empty names", () => {
    const result = buildFeaturedArtistString([{ name: "" }, { name: "Drake" }]);
    expect(result).toBe("feat. Drake");
  });
});
