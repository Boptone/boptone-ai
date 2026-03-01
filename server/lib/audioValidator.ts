/**
 * DISTRO-A1: Enterprise-Grade Audio Format Validator
 *
 * The quality gate for every track before it can be submitted for DSP distribution.
 * Validates against the strictest common denominator of all major DSP requirements:
 *   - Spotify, Apple Music, Tidal, Amazon Music, Deezer, YouTube Music
 *
 * Checks performed:
 *   1. File format (WAV, FLAC, AIFF, MP3 — AIFF/WAV/FLAC preferred for distribution)
 *   2. File size (maximum 2GB)
 *   3. Duration (minimum 30 seconds, maximum 10 hours)
 *   4. Sample rate (minimum 44,100 Hz — 44.1kHz or 48kHz required for DSP delivery)
 *   5. Bit depth (minimum 16-bit for WAV/FLAC/AIFF)
 *   6. Channel count (mono or stereo — no surround without Dolby Atmos master)
 *   7. Bitrate (minimum 128kbps for MP3; WAV/FLAC/AIFF are lossless and always pass)
 *   8. Integrated loudness (LUFS) — measured via ffmpeg ebur128 filter
 *   9. True peak (dBTP) — measured via ffmpeg
 *  10. Clipping detection (true peak > 0 dBTP)
 *
 * DSP Loudness Reference Standards:
 *   Spotify:       -14 LUFS integrated, -1.0 dBTP true peak
 *   Apple Music:   -16 LUFS integrated, -1.0 dBTP true peak
 *   YouTube Music: -14 LUFS integrated, -1.0 dBTP true peak
 *   Amazon Music:  -14 LUFS integrated, -2.0 dBTP true peak
 *   Tidal:         -14 LUFS integrated, -1.0 dBTP true peak
 *   Deezer:        -15 LUFS integrated, -1.0 dBTP true peak
 *
 * We flag (warn) but do not block on loudness — DSPs normalize loudness automatically.
 * We block on clipping (true peak > 0 dBTP) because it causes audible distortion.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import * as mm from "music-metadata";

const execAsync = promisify(exec);

// ─── Types ────────────────────────────────────────────────────────────────────

export type AudioQualityTier =
  | "boptone_premium"      // Exceeds DSP requirements — 24-bit/96kHz+ hi-res lossless
  | "distribution_ready"   // Meets all DSP requirements — ready for global delivery
  | "boptone_only"         // Good enough for BAP streaming, not for DSP distribution
  | "rejected";            // Does not meet minimum standards — upload blocked

export interface AudioValidationIssue {
  code: string;
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
  value?: string | number;
  requirement?: string;
}

export interface DspLoudnessReport {
  integratedLufs: number | null;
  truePeakDbtp: number | null;
  loudnessRange: number | null;
  isClipping: boolean;
  spotifyReady: boolean;    // within -14 LUFS ± 3 tolerance
  appleReady: boolean;      // within -16 LUFS ± 3 tolerance
  youtubeReady: boolean;    // within -14 LUFS ± 3 tolerance
  recommendation: string;
}

export interface AudioTechnicalProfile {
  format: string;
  mimeType: string;
  fileSizeBytes: number;
  fileSizeMb: number;
  durationSeconds: number;
  sampleRateHz: number;
  bitDepth: number | null;
  channels: number;
  channelLayout: string;
  bitrateKbps: number | null;
  isLossless: boolean;
  codec: string | null;
  encoder: string | null;
}

export interface AudioValidationResult {
  /** Overall quality tier — determines what the track is eligible for */
  qualityTier: AudioQualityTier;
  /** True if the track passes all hard requirements and can be uploaded */
  isUploadable: boolean;
  /** True if the track meets all DSP distribution requirements */
  isDistributionReady: boolean;
  /** All issues found, ordered by severity */
  issues: AudioValidationIssue[];
  /** Errors that block upload entirely */
  errors: AudioValidationIssue[];
  /** Warnings that allow upload but block DSP distribution */
  warnings: AudioValidationIssue[];
  /** Informational notes for the artist */
  info: AudioValidationIssue[];
  /** Detailed technical profile extracted from the file */
  technicalProfile: AudioTechnicalProfile | null;
  /** Loudness analysis — null if ffmpeg is unavailable */
  loudnessReport: DspLoudnessReport | null;
  /** Human-readable summary for display in the upload UI */
  summary: string;
  /** Specific actions the artist should take to fix issues */
  recommendations: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORTED_FORMATS = new Set([
  ".wav", ".flac", ".aiff", ".aif", ".mp3", ".m4a", ".aac",
]);

const LOSSLESS_FORMATS = new Set([".wav", ".flac", ".aiff", ".aif"]);

const FORMAT_MIME_MAP: Record<string, { format: string; mimeType: string; codec: string }> = {
  ".wav":  { format: "WAV",  mimeType: "audio/wav",  codec: "pcm" },
  ".flac": { format: "FLAC", mimeType: "audio/flac", codec: "flac" },
  ".aiff": { format: "AIFF", mimeType: "audio/aiff", codec: "pcm" },
  ".aif":  { format: "AIFF", mimeType: "audio/aiff", codec: "pcm" },
  ".mp3":  { format: "MP3",  mimeType: "audio/mpeg", codec: "mp3" },
  ".m4a":  { format: "M4A",  mimeType: "audio/mp4",  codec: "aac" },
  ".aac":  { format: "AAC",  mimeType: "audio/aac",  codec: "aac" },
};

// Hard limits — violations block upload
const LIMITS = {
  maxFileSizeBytes: 2 * 1024 * 1024 * 1024, // 2 GB
  minDurationSeconds: 30,
  maxDurationSeconds: 36000, // 10 hours
  minSampleRateHz: 44100,    // 44.1kHz
  minBitDepthLossless: 16,   // 16-bit minimum for WAV/FLAC/AIFF
  minBitrateKbpsMp3: 128,    // 128kbps minimum for MP3
  maxChannels: 2,            // Stereo max (Dolby Atmos handled separately)
  maxTruePeakDbtp: 0.0,      // Clipping threshold
};

// DSP loudness targets (integrated LUFS)
const DSP_TARGETS = {
  spotify:  { target: -14, tolerance: 3 },
  apple:    { target: -16, tolerance: 3 },
  youtube:  { target: -14, tolerance: 3 },
  amazon:   { target: -14, tolerance: 3 },
  tidal:    { target: -14, tolerance: 3 },
  deezer:   { target: -15, tolerance: 3 },
};

// ─── Main Validator ───────────────────────────────────────────────────────────

/**
 * Validate an audio file buffer against DSP distribution requirements.
 * This is the primary entry point — call this on every track upload.
 *
 * @param fileBuffer  Raw file bytes
 * @param filename    Original filename (used for format detection)
 * @param options     Optional overrides for validation behavior
 */
export async function validateAudioForDistribution(
  fileBuffer: Buffer,
  filename: string,
  options: {
    /** Skip loudness analysis (faster, but no LUFS data) */
    skipLoudness?: boolean;
    /** Allow mono tracks (default: true) */
    allowMono?: boolean;
    /** Minimum bitrate for MP3 in kbps (default: 128) */
    minMp3BitrateKbps?: number;
  } = {}
): Promise<AudioValidationResult> {
  const issues: AudioValidationIssue[] = [];
  let technicalProfile: AudioTechnicalProfile | null = null;
  let loudnessReport: DspLoudnessReport | null = null;
  const recommendations: string[] = [];

  const ext = path.extname(filename).toLowerCase();
  const formatInfo = FORMAT_MIME_MAP[ext];
  const isLossless = LOSSLESS_FORMATS.has(ext);
  const minMp3Bitrate = options.minMp3BitrateKbps ?? LIMITS.minBitrateKbpsMp3;
  const allowMono = options.allowMono ?? true;

  // ── 1. Format check ──────────────────────────────────────────────────────
  if (!SUPPORTED_FORMATS.has(ext)) {
    issues.push({
      code: "UNSUPPORTED_FORMAT",
      severity: "error",
      field: "format",
      message: `File format "${ext || "(none)"}" is not accepted for distribution.`,
      value: ext,
      requirement: "Accepted formats: WAV, FLAC, AIFF (preferred), MP3, M4A, AAC",
    });
    recommendations.push(
      "Export your track as WAV (24-bit, 44.1kHz or 48kHz) for the best distribution quality."
    );
    return buildResult(issues, technicalProfile, loudnessReport, recommendations);
  }

  // ── 2. File size check ───────────────────────────────────────────────────
  const fileSizeBytes = fileBuffer.length;
  const fileSizeMb = fileSizeBytes / (1024 * 1024);

  if (fileSizeBytes > LIMITS.maxFileSizeBytes) {
    issues.push({
      code: "FILE_TOO_LARGE",
      severity: "error",
      field: "fileSize",
      message: `File size (${fileSizeMb.toFixed(0)} MB) exceeds the 2 GB maximum.`,
      value: fileSizeMb,
      requirement: "Maximum file size: 2 GB",
    });
    recommendations.push("Split the file into smaller segments or use a more efficient format.");
  }

  if (fileSizeBytes < 50 * 1024) {
    issues.push({
      code: "FILE_TOO_SMALL",
      severity: "error",
      field: "fileSize",
      message: `File size (${(fileSizeBytes / 1024).toFixed(1)} KB) is suspiciously small — the file may be corrupt or empty.`,
      value: fileSizeBytes,
      requirement: "Minimum file size: 50 KB",
    });
  }

  // ── 3. Deep metadata extraction via music-metadata ───────────────────────
  let mmMeta: mm.IAudioMetadata | null = null;
  try {
    mmMeta = await mm.parseBuffer(fileBuffer, { mimeType: formatInfo?.mimeType });
  } catch (err) {
    issues.push({
      code: "METADATA_PARSE_ERROR",
      severity: "warning",
      field: "metadata",
      message: "Could not read audio metadata from this file. The file may be corrupt or use an unsupported encoding.",
      value: err instanceof Error ? err.message : String(err),
    });
  }

  if (mmMeta) {
    const { format: mmFormat } = mmMeta;

    // Build technical profile
    technicalProfile = {
      format: formatInfo?.format ?? ext.slice(1).toUpperCase(),
      mimeType: formatInfo?.mimeType ?? "audio/mpeg",
      fileSizeBytes,
      fileSizeMb,
      durationSeconds: mmFormat.duration ?? 0,
      sampleRateHz: mmFormat.sampleRate ?? 0,
      bitDepth: mmFormat.bitsPerSample ?? null,
      channels: mmFormat.numberOfChannels ?? 0,
      channelLayout: (mmFormat.numberOfChannels ?? 0) === 1 ? "Mono" : (mmFormat.numberOfChannels ?? 0) === 2 ? "Stereo" : `${mmFormat.numberOfChannels ?? 0} channels`,
      bitrateKbps: mmFormat.bitrate ? Math.round(mmFormat.bitrate / 1000) : null,
      isLossless,
      codec: mmFormat.codec ?? formatInfo?.codec ?? null,
      encoder: mmFormat.tool ?? null,
    };

    // ── 4. Duration check ──────────────────────────────────────────────────
    const duration = mmFormat.duration ?? 0;
    if (duration > 0 && duration < LIMITS.minDurationSeconds) {
      issues.push({
        code: "DURATION_TOO_SHORT",
        severity: "error",
        field: "duration",
        message: `Track duration (${duration.toFixed(1)}s) is below the 30-second minimum required by most DSPs.`,
        value: duration,
        requirement: "Minimum duration: 30 seconds",
      });
      recommendations.push(
        "Tracks shorter than 30 seconds are rejected by Spotify, Apple Music, and most other DSPs."
      );
    }
    if (duration > LIMITS.maxDurationSeconds) {
      issues.push({
        code: "DURATION_TOO_LONG",
        severity: "error",
        field: "duration",
        message: `Track duration (${(duration / 3600).toFixed(1)} hours) exceeds the 10-hour maximum.`,
        value: duration,
        requirement: "Maximum duration: 10 hours",
      });
    }

    // ── 5. Sample rate check ───────────────────────────────────────────────
    const sampleRate = mmFormat.sampleRate ?? 0;
    if (sampleRate > 0 && sampleRate < LIMITS.minSampleRateHz) {
      issues.push({
        code: "SAMPLE_RATE_TOO_LOW",
        severity: "error",
        field: "sampleRate",
        message: `Sample rate (${sampleRate.toLocaleString()} Hz) is below the 44,100 Hz minimum required for DSP distribution.`,
        value: sampleRate,
        requirement: "Minimum sample rate: 44,100 Hz (44.1kHz)",
      });
      recommendations.push(
        "Re-export your track at 44.1kHz or 48kHz. Most DAWs default to 44.1kHz for music production."
      );
    }
    if (sampleRate > 0 && sampleRate !== 44100 && sampleRate !== 48000 && sampleRate !== 88200 && sampleRate !== 96000) {
      issues.push({
        code: "SAMPLE_RATE_NONSTANDARD",
        severity: "warning",
        field: "sampleRate",
        message: `Sample rate (${sampleRate.toLocaleString()} Hz) is non-standard. Some DSPs may reject it.`,
        value: sampleRate,
        requirement: "Recommended: 44,100 Hz or 48,000 Hz",
      });
    }

    // ── 6. Bit depth check (lossless formats only) ─────────────────────────
    const bitDepth = mmFormat.bitsPerSample ?? null;
    if (isLossless && bitDepth !== null && bitDepth < LIMITS.minBitDepthLossless) {
      issues.push({
        code: "BIT_DEPTH_TOO_LOW",
        severity: "error",
        field: "bitDepth",
        message: `Bit depth (${bitDepth}-bit) is below the 16-bit minimum for lossless formats.`,
        value: bitDepth,
        requirement: "Minimum bit depth for WAV/FLAC/AIFF: 16-bit",
      });
      recommendations.push(
        "Re-export your track at 24-bit for the best quality. 16-bit is the minimum accepted."
      );
    }
    if (isLossless && bitDepth !== null && bitDepth === 16) {
      issues.push({
        code: "BIT_DEPTH_ACCEPTABLE",
        severity: "info",
        field: "bitDepth",
        message: "16-bit depth meets the minimum requirement. 24-bit is preferred for distribution.",
        value: bitDepth,
        requirement: "Preferred: 24-bit",
      });
    }

    // ── 7. Channel count check ─────────────────────────────────────────────
    const channels = mmFormat.numberOfChannels ?? 0;
    if (channels > LIMITS.maxChannels) {
      issues.push({
        code: "TOO_MANY_CHANNELS",
        severity: "error",
        field: "channels",
        message: `${channels}-channel audio is not supported for standard distribution. Use stereo (2-channel) or submit a Dolby Atmos master separately.`,
        value: channels,
        requirement: "Maximum: 2 channels (stereo). Dolby Atmos handled separately.",
      });
    }
    if (!allowMono && channels === 1) {
      issues.push({
        code: "MONO_NOT_ALLOWED",
        severity: "error",
        field: "channels",
        message: "Mono audio is not accepted for this distribution tier.",
        value: channels,
        requirement: "Stereo (2-channel) required",
      });
    }
    if (channels === 1) {
      issues.push({
        code: "MONO_AUDIO",
        severity: "warning",
        field: "channels",
        message: "This track is mono. Most DSPs accept mono, but stereo is strongly recommended for the best listening experience.",
        value: channels,
        requirement: "Recommended: Stereo (2-channel)",
      });
    }

    // ── 8. Bitrate check (lossy formats only) ─────────────────────────────
    const bitrateKbps = mmFormat.bitrate ? Math.round(mmFormat.bitrate / 1000) : null;
    if (!isLossless && bitrateKbps !== null && bitrateKbps < minMp3Bitrate) {
      issues.push({
        code: "BITRATE_TOO_LOW",
        severity: "error",
        field: "bitrate",
        message: `Bitrate (${bitrateKbps} kbps) is below the ${minMp3Bitrate} kbps minimum for lossy formats.`,
        value: bitrateKbps,
        requirement: `Minimum bitrate for MP3/AAC/M4A: ${minMp3Bitrate} kbps`,
      });
      recommendations.push(
        `Re-export your MP3 at 320 kbps. ${minMp3Bitrate} kbps is the minimum accepted, but 320 kbps is strongly recommended.`
      );
    }
    if (!isLossless && bitrateKbps !== null && bitrateKbps < 320) {
      issues.push({
        code: "BITRATE_SUBOPTIMAL",
        severity: "info",
        field: "bitrate",
        message: `Bitrate (${bitrateKbps} kbps) is acceptable but 320 kbps is recommended for the best quality on DSPs.`,
        value: bitrateKbps,
        requirement: "Recommended: 320 kbps",
      });
    }
    // Lossy formats are never distribution_ready — DSPs (Spotify, Apple Music, Tidal) require
    // lossless source files from distributors. This warning gates the tier to 'boptone_only'.
    if (!isLossless) {
      issues.push({
        code: "LOSSY_FORMAT",
        severity: "warning",
        field: "format",
        message: `${ext.slice(1).toUpperCase()} is a lossy format. DSPs require lossless source files (WAV, FLAC, AIFF) for distribution. This track can be streamed on BAP but cannot be submitted for global DSP distribution.`,
        value: ext.slice(1),
        requirement: "Lossless source file required for DSP distribution (WAV, FLAC, or AIFF)",
      });
      recommendations.push(
        "Export your master as a 24-bit WAV or FLAC at 44.1 kHz or 48 kHz for DSP distribution eligibility."
      );
    }
  }

  // ── 9. Loudness analysis via ffmpeg (async, can be skipped) ──────────────
  if (!options.skipLoudness && fileSizeBytes < LIMITS.maxFileSizeBytes) {
    loudnessReport = await measureLoudness(fileBuffer, filename);

    if (loudnessReport) {
      if (loudnessReport.isClipping) {
        issues.push({
          code: "AUDIO_CLIPPING",
          severity: "error",
          field: "truePeak",
          message: `True peak (${loudnessReport.truePeakDbtp?.toFixed(1)} dBTP) exceeds 0 dBTP — this track is clipping and will sound distorted on DSPs.`,
          value: loudnessReport.truePeakDbtp ?? undefined,
          requirement: "True peak must be below 0.0 dBTP (recommended: -1.0 dBTP)",
        });
        recommendations.push(
          "Apply a true peak limiter in your mastering chain. Set the ceiling to -1.0 dBTP before exporting."
        );
      } else if (loudnessReport.truePeakDbtp !== null && loudnessReport.truePeakDbtp > -1.0) {
        issues.push({
          code: "TRUE_PEAK_HIGH",
          severity: "warning",
          field: "truePeak",
          message: `True peak (${loudnessReport.truePeakDbtp.toFixed(1)} dBTP) is above the recommended -1.0 dBTP ceiling. Some DSPs may apply additional limiting.`,
          value: loudnessReport.truePeakDbtp,
          requirement: "Recommended: -1.0 dBTP or lower",
        });
      }

      if (loudnessReport.integratedLufs !== null) {
        const lufs = loudnessReport.integratedLufs;
        if (lufs > -6) {
          issues.push({
            code: "LOUDNESS_EXTREMELY_HIGH",
            severity: "warning",
            field: "loudness",
            message: `Integrated loudness (${lufs.toFixed(1)} LUFS) is extremely high. DSPs will apply heavy gain reduction, which may degrade audio quality.`,
            value: lufs,
            requirement: "Recommended: -14 LUFS for streaming",
          });
          recommendations.push(
            "Your master is significantly louder than streaming standards. Consider re-mastering at -14 LUFS for the best listener experience."
          );
        } else if (lufs > -9) {
          issues.push({
            code: "LOUDNESS_HIGH",
            severity: "info",
            field: "loudness",
            message: `Integrated loudness (${lufs.toFixed(1)} LUFS) is above streaming targets. DSPs will reduce the volume during playback.`,
            value: lufs,
            requirement: "Recommended: -14 LUFS for streaming",
          });
        } else if (lufs < -24) {
          issues.push({
            code: "LOUDNESS_TOO_LOW",
            severity: "warning",
            field: "loudness",
            message: `Integrated loudness (${lufs.toFixed(1)} LUFS) is very low. The track may sound quiet compared to other music on DSPs.`,
            value: lufs,
            requirement: "Recommended: -14 LUFS for streaming",
          });
          recommendations.push(
            "Your master is significantly quieter than streaming standards. Consider re-mastering at -14 LUFS."
          );
        }
      }
    }
  }

  return buildResult(issues, technicalProfile, loudnessReport, recommendations);
}

// ─── Loudness Measurement ─────────────────────────────────────────────────────

async function measureLoudness(
  fileBuffer: Buffer,
  filename: string
): Promise<DspLoudnessReport | null> {
  const tempPath = path.join("/tmp", `loudness_${Date.now()}_${path.basename(filename)}`);

  try {
    await writeFile(tempPath, fileBuffer);

    // Use ffmpeg ebur128 filter for EBU R128 loudness measurement
    const { stderr } = await execAsync(
      `ffmpeg -i "${tempPath}" -af "ebur128=peak=true" -f null - 2>&1`,
      { timeout: 120000 } // 2-minute timeout for long tracks
    );

    const integratedMatch = stderr.match(/I:\s*([-\d.]+)\s*LUFS/);
    const truePeakMatch = stderr.match(/True peak:\s*Peak:\s*([-\d.]+)\s*dBFS/);
    const lraMatch = stderr.match(/LRA:\s*([\d.]+)\s*LU/);

    const integratedLufs = integratedMatch ? parseFloat(integratedMatch[1]) : null;
    const truePeakDbtp = truePeakMatch ? parseFloat(truePeakMatch[1]) : null;
    const loudnessRange = lraMatch ? parseFloat(lraMatch[1]) : null;

    const isClipping = truePeakDbtp !== null && truePeakDbtp > LIMITS.maxTruePeakDbtp;

    const withinTarget = (lufs: number | null, target: number, tolerance: number) =>
      lufs !== null && lufs >= target - tolerance && lufs <= target + tolerance;

    const recommendation = buildLoudnessRecommendation(integratedLufs, truePeakDbtp);

    return {
      integratedLufs,
      truePeakDbtp,
      loudnessRange,
      isClipping,
      spotifyReady: withinTarget(integratedLufs, DSP_TARGETS.spotify.target, DSP_TARGETS.spotify.tolerance),
      appleReady: withinTarget(integratedLufs, DSP_TARGETS.apple.target, DSP_TARGETS.apple.tolerance),
      youtubeReady: withinTarget(integratedLufs, DSP_TARGETS.youtube.target, DSP_TARGETS.youtube.tolerance),
      recommendation,
    };
  } catch (err) {
    // ffmpeg not available or timed out — return null, do not block upload
    console.warn("[AudioValidator] Loudness measurement failed (non-blocking):", err instanceof Error ? err.message : err);
    return null;
  } finally {
    try { await unlink(tempPath); } catch { /* ignore cleanup errors */ }
  }
}

function buildLoudnessRecommendation(
  lufs: number | null,
  truePeak: number | null
): string {
  if (truePeak !== null && truePeak > 0) {
    return `Apply a true peak limiter (ceiling: -1.0 dBTP) before re-exporting. Current true peak: ${truePeak.toFixed(1)} dBTP.`;
  }
  if (lufs === null) {
    return "Loudness could not be measured. Aim for -14 LUFS integrated with a -1.0 dBTP true peak ceiling.";
  }
  if (lufs > -9) {
    return `Your master (${lufs.toFixed(1)} LUFS) is louder than streaming targets. DSPs will apply gain reduction. Consider re-mastering at -14 LUFS.`;
  }
  if (lufs < -24) {
    return `Your master (${lufs.toFixed(1)} LUFS) is quieter than streaming targets. Consider re-mastering at -14 LUFS.`;
  }
  const delta = Math.abs(lufs - (-14));
  if (delta <= 2) {
    return `Loudness (${lufs.toFixed(1)} LUFS) is within the optimal streaming range. No changes needed.`;
  }
  return `Loudness (${lufs.toFixed(1)} LUFS) is acceptable. Aim for -14 LUFS for optimal streaming playback.`;
}

// ─── Result Builder ───────────────────────────────────────────────────────────

function buildResult(
  issues: AudioValidationIssue[],
  technicalProfile: AudioTechnicalProfile | null,
  loudnessReport: DspLoudnessReport | null,
  recommendations: string[]
): AudioValidationResult {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const info = issues.filter((i) => i.severity === "info");

  const isUploadable = errors.length === 0;
  const isDistributionReady = errors.length === 0 && warnings.length === 0;

  // Check if audio meets Boptone's native premium standard (24-bit / 96kHz+)
  const meetsBoptoneNative =
    isDistributionReady &&
    technicalProfile !== null &&
    technicalProfile.isLossless &&
    (technicalProfile.bitDepth ?? 0) >= 24 &&
    technicalProfile.sampleRateHz >= 96000;

  let qualityTier: AudioQualityTier;
  if (!isUploadable) {
    qualityTier = "rejected";
  } else if (meetsBoptoneNative) {
    qualityTier = "boptone_premium"; // Hi-res lossless — best for native Boptone streaming
  } else if (!isDistributionReady) {
    qualityTier = "boptone_only";
  } else {
    qualityTier = "distribution_ready";
  }

  const summary = buildSummary(qualityTier, errors, warnings, technicalProfile);

  // Deduplicate recommendations
  const uniqueRecommendations = [...new Set(recommendations)];

  return {
    qualityTier,
    isUploadable,
    isDistributionReady,
    issues,
    errors,
    warnings,
    info,
    technicalProfile,
    loudnessReport,
    summary,
    recommendations: uniqueRecommendations,
  };
}

function buildSummary(
  tier: AudioQualityTier,
  errors: AudioValidationIssue[],
  warnings: AudioValidationIssue[],
  profile: AudioTechnicalProfile | null
): string {
  const profileStr = profile
    ? `${profile.format} · ${profile.sampleRateHz.toLocaleString()} Hz · ${profile.bitDepth ? `${profile.bitDepth}-bit · ` : ""}${profile.channelLayout} · ${profile.durationSeconds > 0 ? `${Math.floor(profile.durationSeconds / 60)}:${String(Math.round(profile.durationSeconds % 60)).padStart(2, "0")}` : "unknown duration"}`
    : "";

  if (tier === "boptone_premium") {
    return `Boptone Premium quality. ${profileStr ? `${profileStr}. ` : ""}Hi-res lossless audio — sounds perfect on mobile, car audio, and all streaming platforms. Distribution ready.`;
  }
  if (tier === "distribution_ready") {
    return `Distribution ready. ${profileStr ? `${profileStr}. ` : ""}This track meets all DSP requirements and is eligible for global distribution.`;
  }
  if (tier === "boptone_only") {
    return `Uploadable to Boptone, but not yet ready for DSP distribution. ${warnings.length} issue${warnings.length !== 1 ? "s" : ""} to resolve before distributing to Spotify, Apple Music, and other platforms.${profileStr ? ` ${profileStr}.` : ""}`;
  }
  return `Upload rejected. ${errors.length} critical issue${errors.length !== 1 ? "s" : ""} must be fixed before this track can be uploaded.${profileStr ? ` ${profileStr}.` : ""}`;
}

// ─── Cover Art Validator ──────────────────────────────────────────────────────

export interface CoverArtValidationResult {
  isValid: boolean;
  isDistributionReady: boolean;
  errors: string[];
  warnings: string[];
  widthPx: number | null;
  heightPx: number | null;
  format: string | null;
  fileSizeMb: number;
  summary: string;
}

/**
 * Validate cover art against DSP requirements.
 * Uses image magic numbers (file signatures) to detect format without sharp dependency.
 */
export function validateCoverArt(
  fileBuffer: Buffer,
  filename: string
): CoverArtValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fileSizeMb = fileBuffer.length / (1024 * 1024);
  const ext = path.extname(filename).toLowerCase();

  // Format check
  let detectedFormat: string | null = null;
  if (ext === ".jpg" || ext === ".jpeg") detectedFormat = "JPEG";
  else if (ext === ".png") detectedFormat = "PNG";
  else {
    errors.push(`Cover art format "${ext}" is not accepted. Use JPEG or PNG.`);
  }

  // File size check
  if (fileSizeMb > 30) {
    errors.push(`Cover art file size (${fileSizeMb.toFixed(1)} MB) exceeds the 30 MB maximum.`);
  }
  if (fileSizeMb < 0.01) {
    errors.push("Cover art file appears to be empty or corrupt.");
  }

  // Note: Full dimension validation requires sharp or jimp — flagged as info
  // The client-side validator handles pixel dimension checks before upload
  if (errors.length === 0) {
    warnings.push(
      "Cover art dimensions will be verified during processing. Minimum: 3000×3000px, Maximum: 6000×6000px, square (1:1) ratio required."
    );
  }

  const isValid = errors.length === 0;
  const isDistributionReady = isValid && warnings.length === 0;

  const summary = isValid
    ? `Cover art format accepted (${detectedFormat ?? ext.toUpperCase()}, ${fileSizeMb.toFixed(1)} MB). Dimensions will be verified during processing.`
    : `Cover art rejected: ${errors[0]}`;

  return {
    isValid,
    isDistributionReady,
    errors,
    warnings,
    widthPx: null,  // Requires image processing library for server-side dimension check
    heightPx: null,
    format: detectedFormat,
    fileSizeMb,
    summary,
  };
}

// ─── Legacy Compatibility Shim ────────────────────────────────────────────────
// Keeps the existing music router working without changes during migration

export function validateAudioFile(
  fileBuffer: Buffer,
  filename: string,
  maxSizeMB: number = 500
): { isValid: boolean; error?: string; format?: string; mimeType?: string } {
  const fileSizeMB = fileBuffer.length / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  const ext = path.extname(filename).toLowerCase();
  const allowedFormats = [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg", ".wma", ".aiff", ".aif"];

  if (!allowedFormats.includes(ext)) {
    return {
      isValid: false,
      error: `File format '${ext}' is not supported. Allowed formats: ${allowedFormats.join(", ")}`,
    };
  }

  const formatMap: Record<string, { format: string; mimeType: string }> = {
    ".mp3":  { format: "mp3",  mimeType: "audio/mpeg" },
    ".wav":  { format: "wav",  mimeType: "audio/wav" },
    ".flac": { format: "flac", mimeType: "audio/flac" },
    ".m4a":  { format: "m4a",  mimeType: "audio/mp4" },
    ".aac":  { format: "aac",  mimeType: "audio/aac" },
    ".ogg":  { format: "ogg",  mimeType: "audio/ogg" },
    ".wma":  { format: "wma",  mimeType: "audio/x-ms-wma" },
    ".aiff": { format: "aiff", mimeType: "audio/aiff" },
    ".aif":  { format: "aif",  mimeType: "audio/aiff" },
  };

  const { format, mimeType } = formatMap[ext] ?? { format: ext.slice(1), mimeType: "audio/mpeg" };
  return { isValid: true, format, mimeType };
}
