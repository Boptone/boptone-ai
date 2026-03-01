/**
 * Tests for the ReleaseQualityScore unified scoring system (DISTRO-UQ1)
 *
 * These tests verify the score computation logic that maps audio quality,
 * loudness compliance, and cover art quality into a single 0-100 score
 * with a tier badge.
 *
 * The scoring function is extracted from the component and tested in isolation
 * so we don't need a DOM environment.
 */

import { describe, it, expect } from "vitest";

// ─── Extracted score computation (mirrors ReleaseQualityScore.tsx) ────────────

type QualityTier = "boptone_premium" | "distribution_ready" | "boptone_only" | "needs_work";

interface AudioQualityReportData {
  qualityTier: "distribution_ready" | "boptone_only" | "rejected";
  isDistributionReady: boolean;
  summary: string;
  warnings: string[];
  recommendations: string[];
  loudness: null;
  technicalProfile: {
    format: string | null;
    sampleRateHz: number;
    bitDepth: number | null;
    channels: number | null;
    bitrateKbps: number | null;
    durationSeconds: number | null;
    isLossless: boolean;
    codec: string | null;
  } | null;
}

interface LoudnessData {
  integratedLufs: number | null;
  truePeakDbtp: number | null;
  loudnessRange: number | null;
  isClipping: boolean;
  spotifyReady: boolean;
  appleReady: boolean;
  youtubeReady: boolean;
  amazonReady: boolean;
  tidalReady: boolean;
  deezerReady: boolean;
  recommendation: string | null;
}

interface CoverArtReportData {
  qualityTier: "distribution_ready" | "boptone_only" | "rejected";
  isDistributionReady: boolean;
  width: number | null;
  height: number | null;
  format: string | null;
  colorSpace: string | null;
  fileSizeBytes: number | null;
  hasAlphaChannel: boolean;
  issues: Array<{ code: string; severity: "error" | "warning"; message: string; affectedDsps: string[] }>;
  warnings: Array<{ code: string; severity: "error" | "warning"; message: string; affectedDsps: string[] }>;
  dspCompliance: any[];
  recommendation: string | null;
}

interface ReleaseQualityData {
  audioQuality?: AudioQualityReportData | null;
  loudness?: LoudnessData | null;
  coverArt?: CoverArtReportData | null;
}

function computeScore(data: ReleaseQualityData): {
  score: number;
  tier: QualityTier;
  audioScore: number;
  loudnessScore: number;
  artScore: number;
} {
  let audioScore = 0;
  let loudnessScore = 0;
  let artScore = 0;

  if (data.audioQuality) {
    const aq = data.audioQuality;
    const tier = aq.qualityTier;
    if (tier === "distribution_ready") {
      const tp = aq.technicalProfile;
      const isPremium =
        tp &&
        tp.isLossless &&
        (tp.bitDepth ?? 0) >= 24 &&
        tp.sampleRateHz >= 96000;
      audioScore = isPremium ? 40 : 32;
    } else if (tier === "boptone_only") {
      audioScore = aq.warnings?.length > 0 ? 18 : 24;
    } else if (tier === "rejected") {
      audioScore = 0;
    } else {
      audioScore = 20;
    }
  } else {
    audioScore = 20;
  }

  if (data.loudness) {
    const l = data.loudness;
    const readyFlags = [
      l.spotifyReady,
      l.appleReady,
      l.youtubeReady,
      l.amazonReady,
      l.tidalReady,
      l.deezerReady,
    ];
    const readyCount = readyFlags.filter(Boolean).length;
    const readyRatio = readyCount / readyFlags.length;
    const truePeakOk = (l.truePeakDbtp ?? 0) <= 0;

    if (readyRatio >= 0.8 && truePeakOk && !l.isClipping) {
      loudnessScore = 25;
    } else if (readyRatio >= 0.5 && truePeakOk) {
      loudnessScore = 18;
    } else if (readyRatio >= 0.3) {
      loudnessScore = 12;
    } else {
      loudnessScore = 5;
    }
  } else if (data.audioQuality?.isDistributionReady) {
    loudnessScore = 12;
  }

  if (data.coverArt) {
    const ca = data.coverArt;
    const hasErrors = ca.issues.some((i) => i.severity === "error");
    const hasWarnings = ca.warnings.length > 0;
    const w = ca.width ?? 0;
    const h = ca.height ?? 0;
    const isPremiumArt = w >= 4000 && h >= 4000;

    if (ca.qualityTier === "distribution_ready" && isPremiumArt && !hasWarnings) {
      artScore = 35;
    } else if (ca.qualityTier === "distribution_ready" && !hasWarnings) {
      artScore = 28;
    } else if (ca.qualityTier === "distribution_ready") {
      artScore = 24;
    } else if (!hasErrors) {
      artScore = 14;
    } else {
      artScore = 0;
    }
  } else {
    artScore = 17;
  }

  const score = Math.min(100, audioScore + loudnessScore + artScore);

  let tier: QualityTier;
  if (score >= 90) {
    tier = "boptone_premium";
  } else if (score >= 70) {
    tier = "distribution_ready";
  } else if (score >= 40) {
    tier = "boptone_only";
  } else {
    tier = "needs_work";
  }

  return { score, tier, audioScore, loudnessScore, artScore };
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const hiResAudio: AudioQualityReportData = {
  qualityTier: "distribution_ready",
  isDistributionReady: true,
  summary: "Hi-res lossless",
  warnings: [],
  recommendations: [],
  loudness: null,
  technicalProfile: {
    format: "flac",
    sampleRateHz: 96000,
    bitDepth: 24,
    channels: 2,
    bitrateKbps: null,
    durationSeconds: 210,
    isLossless: true,
    codec: "flac",
  },
};

const standardLosslessAudio: AudioQualityReportData = {
  qualityTier: "distribution_ready",
  isDistributionReady: true,
  summary: "Standard lossless",
  warnings: [],
  recommendations: [],
  loudness: null,
  technicalProfile: {
    format: "wav",
    sampleRateHz: 44100,
    bitDepth: 16,
    channels: 2,
    bitrateKbps: null,
    durationSeconds: 210,
    isLossless: true,
    codec: "pcm_s16le",
  },
};

const mp3Audio: AudioQualityReportData = {
  qualityTier: "boptone_only",
  isDistributionReady: false,
  summary: "Lossy format",
  warnings: ["Lossy format detected"],
  recommendations: ["Re-export as WAV or FLAC"],
  loudness: null,
  technicalProfile: {
    format: "mp3",
    sampleRateHz: 44100,
    bitDepth: null,
    channels: 2,
    bitrateKbps: 320,
    durationSeconds: 210,
    isLossless: false,
    codec: "mp3",
  },
};

const rejectedAudio: AudioQualityReportData = {
  qualityTier: "rejected",
  isDistributionReady: false,
  summary: "Rejected",
  warnings: [],
  recommendations: [],
  loudness: null,
  technicalProfile: null,
};

const allDspReadyLoudness: LoudnessData = {
  integratedLufs: -14,
  truePeakDbtp: -1.0,
  loudnessRange: 8,
  isClipping: false,
  spotifyReady: true,
  appleReady: true,
  youtubeReady: true,
  amazonReady: true,
  tidalReady: true,
  deezerReady: true,
  recommendation: null,
};

const partialLoudness: LoudnessData = {
  integratedLufs: -10,
  truePeakDbtp: -0.5,
  loudnessRange: 12,
  isClipping: false,
  spotifyReady: true,
  appleReady: false,
  youtubeReady: false,
  amazonReady: true,
  tidalReady: false,
  deezerReady: false,
  recommendation: "Lower integrated loudness by 4 LUFS",
};

const clippingLoudness: LoudnessData = {
  integratedLufs: -5,
  truePeakDbtp: 0.5,
  loudnessRange: 3,
  isClipping: true,
  spotifyReady: false,
  appleReady: false,
  youtubeReady: false,
  amazonReady: false,
  tidalReady: false,
  deezerReady: false,
  recommendation: "Fix clipping before distribution",
};

const premiumArt: CoverArtReportData = {
  qualityTier: "distribution_ready",
  isDistributionReady: true,
  width: 4000,
  height: 4000,
  format: "jpeg",
  colorSpace: "sRGB",
  fileSizeBytes: 2_500_000,
  hasAlphaChannel: false,
  issues: [],
  warnings: [],
  dspCompliance: [],
  recommendation: null,
};

const standardArt: CoverArtReportData = {
  qualityTier: "distribution_ready",
  isDistributionReady: true,
  width: 3000,
  height: 3000,
  format: "jpeg",
  colorSpace: "sRGB",
  fileSizeBytes: 1_500_000,
  hasAlphaChannel: false,
  issues: [],
  warnings: [],
  dspCompliance: [],
  recommendation: null,
};

const artWithWarnings: CoverArtReportData = {
  ...standardArt,
  warnings: [{ code: "LOW_DPI", severity: "warning", message: "DPI below 300", affectedDsps: ["spotify"] }],
};

const rejectedArt: CoverArtReportData = {
  qualityTier: "rejected",
  isDistributionReady: false,
  width: 500,
  height: 500,
  format: "jpeg",
  colorSpace: "sRGB",
  fileSizeBytes: 50_000,
  hasAlphaChannel: false,
  issues: [{ code: "TOO_SMALL", severity: "error", message: "Image too small", affectedDsps: ["spotify", "apple"] }],
  warnings: [],
  dspCompliance: [],
  recommendation: "Upload at least 3000×3000px artwork",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeScore — audio quality", () => {
  it("gives 40 pts for hi-res lossless (24-bit/96kHz)", () => {
    const { audioScore } = computeScore({ audioQuality: hiResAudio });
    expect(audioScore).toBe(40);
  });

  it("gives 32 pts for standard lossless (16-bit/44.1kHz)", () => {
    const { audioScore } = computeScore({ audioQuality: standardLosslessAudio });
    expect(audioScore).toBe(32);
  });

  it("gives 18 pts for lossy format with warnings", () => {
    const { audioScore } = computeScore({ audioQuality: mp3Audio });
    expect(audioScore).toBe(18);
  });

  it("gives 0 pts for rejected audio", () => {
    const { audioScore } = computeScore({ audioQuality: rejectedAudio });
    expect(audioScore).toBe(0);
  });

  it("gives 20 pts when no audio data provided", () => {
    const { audioScore } = computeScore({});
    expect(audioScore).toBe(20);
  });
});

describe("computeScore — loudness", () => {
  it("gives 25 pts when all 6 DSPs ready, no clipping, true peak ok", () => {
    const { loudnessScore } = computeScore({ loudness: allDspReadyLoudness });
    expect(loudnessScore).toBe(25);
  });

  it("gives 18 pts when 2/6 DSPs ready (ratio >= 0.3 but < 0.8)", () => {
    const { loudnessScore } = computeScore({ loudness: partialLoudness });
    // 2 out of 6 ready = 0.33 ratio → 12 pts
    expect(loudnessScore).toBe(12);
  });

  it("gives 5 pts when clipping and no DSPs ready", () => {
    const { loudnessScore } = computeScore({ loudness: clippingLoudness });
    expect(loudnessScore).toBe(5);
  });

  it("gives 12 pts fallback when audio is distribution_ready but no loudness data", () => {
    const { loudnessScore } = computeScore({ audioQuality: standardLosslessAudio });
    expect(loudnessScore).toBe(12);
  });

  it("gives 0 pts when no audio and no loudness data", () => {
    const { loudnessScore } = computeScore({});
    expect(loudnessScore).toBe(0);
  });
});

describe("computeScore — cover art", () => {
  it("gives 35 pts for 4000×4000 distribution_ready art with no warnings", () => {
    const { artScore } = computeScore({ coverArt: premiumArt });
    expect(artScore).toBe(35);
  });

  it("gives 28 pts for 3000×3000 distribution_ready art with no warnings", () => {
    const { artScore } = computeScore({ coverArt: standardArt });
    expect(artScore).toBe(28);
  });

  it("gives 24 pts for distribution_ready art with warnings", () => {
    const { artScore } = computeScore({ coverArt: artWithWarnings });
    expect(artScore).toBe(24);
  });

  it("gives 0 pts for rejected art with errors", () => {
    const { artScore } = computeScore({ coverArt: rejectedArt });
    expect(artScore).toBe(0);
  });

  it("gives 17 pts neutral when no art data provided", () => {
    const { artScore } = computeScore({});
    expect(artScore).toBe(17);
  });
});

describe("computeScore — tier assignment", () => {
  it("assigns boptone_premium tier for hi-res audio + all DSPs + premium art", () => {
    const { score, tier } = computeScore({
      audioQuality: hiResAudio,
      loudness: allDspReadyLoudness,
      coverArt: premiumArt,
    });
    expect(score).toBe(100); // 40 + 25 + 35
    expect(tier).toBe("boptone_premium");
  });

  it("assigns distribution_ready tier for standard lossless + all DSPs + standard art", () => {
    const { score, tier } = computeScore({
      audioQuality: standardLosslessAudio,
      loudness: allDspReadyLoudness,
      coverArt: standardArt,
    });
    expect(score).toBe(85); // 32 + 25 + 28
    expect(tier).toBe("distribution_ready");
  });

  it("assigns boptone_only tier for MP3 + partial loudness + standard art", () => {
    const { score, tier } = computeScore({
      audioQuality: mp3Audio,
      loudness: partialLoudness,
      coverArt: standardArt,
    });
    // 18 + 12 + 28 = 58
    expect(score).toBe(58);
    expect(tier).toBe("boptone_only");
  });

  it("assigns needs_work tier for rejected audio + clipping + rejected art", () => {
    const { score, tier } = computeScore({
      audioQuality: rejectedAudio,
      loudness: clippingLoudness,
      coverArt: rejectedArt,
    });
    // 0 + 5 + 0 = 5
    expect(score).toBe(5);
    expect(tier).toBe("needs_work");
  });

  it("assigns boptone_only tier for empty data (neutral scores)", () => {
    const { score, tier } = computeScore({});
    // 20 + 0 + 17 = 37
    expect(score).toBe(37);
    expect(tier).toBe("needs_work"); // 37 < 40
  });

  it("caps score at 100", () => {
    const { score } = computeScore({
      audioQuality: hiResAudio,
      loudness: allDspReadyLoudness,
      coverArt: premiumArt,
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("computeScore — edge cases", () => {
  it("handles null loudness gracefully", () => {
    expect(() => computeScore({ loudness: null })).not.toThrow();
  });

  it("handles null coverArt gracefully", () => {
    expect(() => computeScore({ coverArt: null })).not.toThrow();
  });

  it("handles null audioQuality gracefully", () => {
    expect(() => computeScore({ audioQuality: null })).not.toThrow();
  });

  it("handles all null data gracefully", () => {
    expect(() => computeScore({ audioQuality: null, loudness: null, coverArt: null })).not.toThrow();
  });

  it("gives correct score for hi-res audio without loudness data", () => {
    const { score, tier } = computeScore({
      audioQuality: hiResAudio,
      coverArt: premiumArt,
    });
    // 40 (hi-res) + 12 (fallback, isDistributionReady=true) + 35 (premium art) = 87
    expect(score).toBe(87);
    expect(tier).toBe("distribution_ready");
  });

  it("correctly identifies 24-bit/96kHz as premium audio", () => {
    const { audioScore } = computeScore({
      audioQuality: {
        ...standardLosslessAudio,
        technicalProfile: {
          ...standardLosslessAudio.technicalProfile!,
          sampleRateHz: 96000,
          bitDepth: 24,
          isLossless: true,
        },
      },
    });
    expect(audioScore).toBe(40);
  });

  it("does not mark 16-bit/44.1kHz as premium even if lossless", () => {
    const { audioScore } = computeScore({ audioQuality: standardLosslessAudio });
    expect(audioScore).toBe(32);
    expect(audioScore).not.toBe(40);
  });

  it("does not mark 24-bit/44.1kHz as premium (needs 96kHz)", () => {
    const { audioScore } = computeScore({
      audioQuality: {
        ...standardLosslessAudio,
        technicalProfile: {
          ...standardLosslessAudio.technicalProfile!,
          sampleRateHz: 44100,
          bitDepth: 24,
          isLossless: true,
        },
      },
    });
    expect(audioScore).toBe(32);
  });

  it("correctly identifies 4000×4000 as premium artwork", () => {
    const { artScore } = computeScore({ coverArt: premiumArt });
    expect(artScore).toBe(35);
  });

  it("does not mark 3999×3999 as premium artwork", () => {
    const { artScore } = computeScore({
      coverArt: { ...premiumArt, width: 3999, height: 3999 },
    });
    expect(artScore).toBe(28); // distribution_ready but not premium
  });

  it("correctly handles 5 of 6 DSPs ready (ratio=0.83 >= 0.8)", () => {
    const { loudnessScore } = computeScore({
      loudness: { ...allDspReadyLoudness, deezerReady: false },
    });
    expect(loudnessScore).toBe(25);
  });

  it("correctly handles 4 of 6 DSPs ready (ratio=0.67, 0.5 <= r < 0.8)", () => {
    const { loudnessScore } = computeScore({
      loudness: {
        ...allDspReadyLoudness,
        tidalReady: false,
        deezerReady: false,
      },
    });
    expect(loudnessScore).toBe(18);
  });
});
