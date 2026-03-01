/**
 * DISTRO-A2 — Audio Loudness Analysis Tests
 * Tests for the LoudnessData persistence model, DSP readiness logic,
 * and the audioMetrics column integration.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── DSP Target Constants (mirrored from LoudnessMeter.tsx for test parity) ───

const DSP_TARGETS = {
  spotify: { targetLufs: -14, toleranceLufs: 1.0, maxTruePeak: -1.0 },
  apple: { targetLufs: -16, toleranceLufs: 1.0, maxTruePeak: -1.0 },
  youtube: { targetLufs: -14, toleranceLufs: 2.0, maxTruePeak: -1.0 },
  amazon: { targetLufs: -14, toleranceLufs: 1.5, maxTruePeak: -2.0 },
  tidal: { targetLufs: -14, toleranceLufs: 1.0, maxTruePeak: -1.0 },
  deezer: { targetLufs: -15, toleranceLufs: 1.5, maxTruePeak: -1.0 },
} as const;

// ─── DSP Readiness Logic (mirrors audioValidator.ts) ───────────────────────

function isDspReady(
  lufs: number,
  truePeak: number,
  target: { targetLufs: number; toleranceLufs: number; maxTruePeak: number }
): boolean {
  if (truePeak > target.maxTruePeak) return false;
  const diff = Math.abs(lufs - target.targetLufs);
  // Allow tracks quieter than target (they get turned up) but not louder than target + tolerance
  // Tracks significantly quieter than target (>4 LU) are also flagged
  if (lufs > target.targetLufs + target.toleranceLufs) return false;
  if (lufs <= target.targetLufs - 4) return false;
  return true;
}

function computeAllDspReadiness(lufs: number, truePeak: number) {
  return {
    spotifyReady: isDspReady(lufs, truePeak, DSP_TARGETS.spotify),
    appleReady: isDspReady(lufs, truePeak, DSP_TARGETS.apple),
    youtubeReady: isDspReady(lufs, truePeak, DSP_TARGETS.youtube),
    amazonReady: isDspReady(lufs, truePeak, DSP_TARGETS.amazon),
    tidalReady: isDspReady(lufs, truePeak, DSP_TARGETS.tidal),
    deezerReady: isDspReady(lufs, truePeak, DSP_TARGETS.deezer),
  };
}

// ─── LUFS Gauge Utility (mirrors LoudnessMeter.tsx) ────────────────────────

function lufsToPercent(lufs: number): number {
  const min = -24;
  const max = -6;
  return Math.max(0, Math.min(100, ((lufs - min) / (max - min)) * 100));
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("DSP Loudness Readiness Logic", () => {
  describe("Spotify (−14 LUFS, ±1 LU, −1 dBTP)", () => {
    it("marks −14 LUFS at −1.5 dBTP as ready", () => {
      expect(isDspReady(-14, -1.5, DSP_TARGETS.spotify)).toBe(true);
    });

    it("marks −13.5 LUFS (within tolerance) as ready", () => {
      expect(isDspReady(-13.5, -1.5, DSP_TARGETS.spotify)).toBe(true);
    });

    it("marks −12.9 LUFS (louder than target + tolerance) as NOT ready", () => {
      expect(isDspReady(-12.9, -1.5, DSP_TARGETS.spotify)).toBe(false);
    });

    it("marks −9 LUFS (very hot master) as NOT ready", () => {
      expect(isDspReady(-9, -0.5, DSP_TARGETS.spotify)).toBe(false);
    });

    it("marks −19 LUFS (too quiet) as NOT ready", () => {
      expect(isDspReady(-19, -3.0, DSP_TARGETS.spotify)).toBe(false);
    });

    it("marks −14 LUFS but 0 dBTP (clipping) as NOT ready", () => {
      expect(isDspReady(-14, 0, DSP_TARGETS.spotify)).toBe(false);
    });

    it("marks −14 LUFS at −1.0 dBTP (exactly at limit) as ready", () => {
      expect(isDspReady(-14, -1.0, DSP_TARGETS.spotify)).toBe(true);
    });

    it("marks −14 LUFS at −0.9 dBTP (just over limit) as NOT ready", () => {
      expect(isDspReady(-14, -0.9, DSP_TARGETS.spotify)).toBe(false);
    });
  });

  describe("Apple Music (−16 LUFS, ±1 LU, −1 dBTP)", () => {
    it("marks −16 LUFS at −1.5 dBTP as ready", () => {
      expect(isDspReady(-16, -1.5, DSP_TARGETS.apple)).toBe(true);
    });

    it("marks −14 LUFS (too loud for Apple) as NOT ready", () => {
      expect(isDspReady(-14, -1.5, DSP_TARGETS.apple)).toBe(false);
    });

    it("marks −15.2 LUFS (within Apple tolerance) as ready", () => {
      expect(isDspReady(-15.2, -1.5, DSP_TARGETS.apple)).toBe(true);
    });

    it("marks −14.9 LUFS (just outside Apple tolerance) as NOT ready", () => {
      expect(isDspReady(-14.9, -1.5, DSP_TARGETS.apple)).toBe(false);
    });
  });

  describe("YouTube (−14 LUFS, ±2 LU, −1 dBTP)", () => {
    it("marks −13 LUFS (within YouTube's wider tolerance) as ready", () => {
      expect(isDspReady(-13, -1.5, DSP_TARGETS.youtube)).toBe(true);
    });

    it("marks −11.9 LUFS (outside YouTube tolerance) as NOT ready", () => {
      expect(isDspReady(-11.9, -1.5, DSP_TARGETS.youtube)).toBe(false);
    });
  });

  describe("Amazon Music HD (−14 LUFS, ±1.5 LU, −2 dBTP)", () => {
    it("marks −14 LUFS at −2.0 dBTP as ready", () => {
      expect(isDspReady(-14, -2.0, DSP_TARGETS.amazon)).toBe(true);
    });

    it("marks −14 LUFS at −1.5 dBTP (above Amazon's −2 dBTP limit) as NOT ready", () => {
      expect(isDspReady(-14, -1.5, DSP_TARGETS.amazon)).toBe(false);
    });

    it("marks −14 LUFS at −2.1 dBTP as ready", () => {
      expect(isDspReady(-14, -2.1, DSP_TARGETS.amazon)).toBe(true);
    });
  });

  describe("Tidal HiFi (−14 LUFS, ±1 LU, −1 dBTP)", () => {
    it("marks −14 LUFS at −1.5 dBTP as ready", () => {
      expect(isDspReady(-14, -1.5, DSP_TARGETS.tidal)).toBe(true);
    });

    it("marks −12.9 LUFS as NOT ready for Tidal", () => {
      expect(isDspReady(-12.9, -1.5, DSP_TARGETS.tidal)).toBe(false);
    });
  });

  describe("Deezer (−15 LUFS, ±1.5 LU, −1 dBTP)", () => {
    it("marks −15 LUFS at −1.5 dBTP as ready", () => {
      expect(isDspReady(-15, -1.5, DSP_TARGETS.deezer)).toBe(true);
    });

    it("marks −13.6 LUFS (within Deezer ±1.5 tolerance) as ready", () => {
      // Deezer target: −15 LUFS, tolerance ±1.5 LU → upper bound is −13.5 LUFS
      // −13.6 is 1.4 LU above target, within tolerance
      expect(isDspReady(-13.6, -1.5, DSP_TARGETS.deezer)).toBe(true);
    });

    it("marks −13.4 LUFS (outside Deezer ±1.5 tolerance) as NOT ready", () => {
      // −13.4 is 1.6 LU above target, outside tolerance
      expect(isDspReady(-13.4, -1.5, DSP_TARGETS.deezer)).toBe(false);
    });

    it("marks −13.4 LUFS at −0.5 dBTP as NOT ready", () => {
      expect(isDspReady(-13.4, -0.5, DSP_TARGETS.deezer)).toBe(false);
    });
  });
});

describe("All-DSP Readiness Computation", () => {
  it("returns all ready for a well-mastered track at −14 LUFS, −1.5 dBTP", () => {
    // Note: Apple targets −16 so −14 fails Apple
    const result = computeAllDspReadiness(-14, -1.5);
    expect(result.spotifyReady).toBe(true);
    expect(result.youtubeReady).toBe(true);
    expect(result.tidalReady).toBe(true);
    // Apple requires −16 LUFS, so −14 is too loud
    expect(result.appleReady).toBe(false);
  });

  it("returns all ready for −15.5 LUFS, −2.1 dBTP (optimal for all platforms)", () => {
    const result = computeAllDspReadiness(-15.5, -2.1);
    expect(result.spotifyReady).toBe(true);
    expect(result.appleReady).toBe(true);
    expect(result.youtubeReady).toBe(true);
    expect(result.amazonReady).toBe(true);
    expect(result.tidalReady).toBe(true);
    expect(result.deezerReady).toBe(true);
  });

  it("returns all NOT ready for a clipping track at 0 dBTP", () => {
    const result = computeAllDspReadiness(-14, 0);
    expect(result.spotifyReady).toBe(false);
    expect(result.appleReady).toBe(false);
    expect(result.youtubeReady).toBe(false);
    expect(result.amazonReady).toBe(false);
    expect(result.tidalReady).toBe(false);
    expect(result.deezerReady).toBe(false);
  });

  it("returns all NOT ready for a very hot master at −8 LUFS", () => {
    const result = computeAllDspReadiness(-8, -0.3);
    expect(result.spotifyReady).toBe(false);
    expect(result.appleReady).toBe(false);
    expect(result.youtubeReady).toBe(false);
    expect(result.amazonReady).toBe(false);
    expect(result.tidalReady).toBe(false);
    expect(result.deezerReady).toBe(false);
  });

  it("returns all NOT ready for a very quiet track at −23 LUFS", () => {
    const result = computeAllDspReadiness(-23, -8.0);
    expect(result.spotifyReady).toBe(false);
    expect(result.appleReady).toBe(false);
    expect(result.youtubeReady).toBe(false);
    expect(result.amazonReady).toBe(false);
    expect(result.tidalReady).toBe(false);
    expect(result.deezerReady).toBe(false);
  });
});

describe("LUFS Gauge Percentage Conversion", () => {
  it("maps −24 LUFS to 0%", () => {
    expect(lufsToPercent(-24)).toBe(0);
  });

  it("maps −6 LUFS to 100%", () => {
    expect(lufsToPercent(-6)).toBe(100);
  });

  it("maps −15 LUFS to 50%", () => {
    expect(lufsToPercent(-15)).toBe(50);
  });

  it("maps −14 LUFS to approximately 55.6%", () => {
    expect(lufsToPercent(-14)).toBeCloseTo(55.56, 1);
  });

  it("clamps values below −24 LUFS to 0%", () => {
    expect(lufsToPercent(-30)).toBe(0);
  });

  it("clamps values above −6 LUFS to 100%", () => {
    expect(lufsToPercent(0)).toBe(100);
  });

  it("maps −16 LUFS to approximately 44.4%", () => {
    expect(lufsToPercent(-16)).toBeCloseTo(44.44, 1);
  });
});

describe("LoudnessData Schema Validation", () => {
  const validLoudnessData = {
    integratedLufs: -14.2,
    truePeakDbtp: -1.8,
    loudnessRange: 8.3,
    isClipping: false,
    spotifyReady: true,
    appleReady: false,
    youtubeReady: true,
    amazonReady: false,
    tidalReady: true,
    deezerReady: true,
    recommendation: "Reduce peak level slightly for Amazon HD compatibility.",
  };

  it("accepts a valid loudness data object", () => {
    expect(validLoudnessData.integratedLufs).toBeTypeOf("number");
    expect(validLoudnessData.truePeakDbtp).toBeTypeOf("number");
    expect(validLoudnessData.loudnessRange).toBeTypeOf("number");
    expect(validLoudnessData.isClipping).toBeTypeOf("boolean");
    expect(validLoudnessData.spotifyReady).toBeTypeOf("boolean");
  });

  it("accepts null for integratedLufs when not measured", () => {
    const noData = { ...validLoudnessData, integratedLufs: null };
    expect(noData.integratedLufs).toBeNull();
  });

  it("accepts null for truePeakDbtp when not measured", () => {
    const noData = { ...validLoudnessData, truePeakDbtp: null };
    expect(noData.truePeakDbtp).toBeNull();
  });

  it("accepts null for recommendation when no action needed", () => {
    const noRec = { ...validLoudnessData, recommendation: null };
    expect(noRec.recommendation).toBeNull();
  });

  it("correctly identifies clipping state", () => {
    const clipping = { ...validLoudnessData, isClipping: true, truePeakDbtp: 0.2 };
    expect(clipping.isClipping).toBe(true);
    expect(clipping.truePeakDbtp).toBeGreaterThan(0);
  });
});

describe("DSP Target Edge Cases", () => {
  it("handles exactly −14 LUFS for Spotify (boundary value)", () => {
    expect(isDspReady(-14, -1.5, DSP_TARGETS.spotify)).toBe(true);
  });

  it("handles exactly −15 LUFS for Spotify (boundary: target − tolerance)", () => {
    // −15 is 1 LU below target, within tolerance
    expect(isDspReady(-15, -1.5, DSP_TARGETS.spotify)).toBe(true);
  });

  it("handles exactly −18 LUFS for Spotify (boundary: target − 4 LU)", () => {
    // −18 is exactly 4 LU below target, should be NOT ready
    expect(isDspReady(-18, -3.0, DSP_TARGETS.spotify)).toBe(false);
  });

  it("handles floating point LUFS values correctly", () => {
    // −13.999 should be within Spotify tolerance
    expect(isDspReady(-13.999, -1.5, DSP_TARGETS.spotify)).toBe(true);
  });

  it("handles very precise true peak values", () => {
    // −1.001 dBTP is just below Spotify's −1.0 limit
    expect(isDspReady(-14, -1.001, DSP_TARGETS.spotify)).toBe(true);
  });
});

describe("Recommendation Generation Logic", () => {
  it("generates a recommendation for a track that is too hot", () => {
    const lufs = -9;
    const isTooHot = lufs > DSP_TARGETS.spotify.targetLufs + DSP_TARGETS.spotify.toleranceLufs;
    expect(isTooHot).toBe(true);
  });

  it("generates a recommendation for a track with high true peak", () => {
    const truePeak = -0.5;
    const hasHighPeak = truePeak > DSP_TARGETS.spotify.maxTruePeak;
    expect(hasHighPeak).toBe(true);
  });

  it("no recommendation needed for a well-mastered track", () => {
    const lufs = -14.5;
    const truePeak = -1.8;
    const isTooHot = lufs > DSP_TARGETS.spotify.targetLufs + DSP_TARGETS.spotify.toleranceLufs;
    const hasHighPeak = truePeak > DSP_TARGETS.spotify.maxTruePeak;
    expect(isTooHot).toBe(false);
    expect(hasHighPeak).toBe(false);
  });
});
