/**
 * DISTRO-A5 — Cover Art Validator
 * Enterprise-grade artwork compliance engine for DSP distribution.
 *
 * DSP Requirements Reference:
 * - Spotify:     3000×3000 min, 6000×6000 max, JPEG/PNG, RGB, square, ≤30MB
 * - Apple Music: 3000×3000 min, JPEG/PNG, RGB, square, ≤50MB, no text in corners
 * - Amazon HD:   3000×3000 min, JPEG/PNG, RGB, square, ≤16MB
 * - Tidal HiFi:  3000×3000 min, JPEG/PNG, RGB, square, ≤30MB
 * - Deezer:      3000×3000 min, JPEG/PNG, RGB, square, ≤30MB
 * - YouTube:     3000×3000 min, JPEG/PNG, RGB, square, ≤10MB (thumbnail)
 * - DDEX ERN:    Minimum 1400×1400, recommended 3000×3000, JPEG/PNG, RGB
 */

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CoverArtIssueSeverity = "error" | "warning" | "info";

export interface CoverArtIssue {
  code: string;
  severity: CoverArtIssueSeverity;
  message: string;
  detail?: string;
  affectedDsps?: string[];
}

export type CoverArtQualityTier =
  | "distribution_ready"   // Passes all DSP requirements
  | "boptone_only"         // Acceptable for BAP streaming, not for DSP delivery
  | "rejected";            // Fails basic requirements, must be replaced

export interface DspArtworkCompliance {
  name: string;
  ready: boolean;
  reason?: string;
}

export interface CoverArtValidationResult {
  isValid: boolean;
  qualityTier: CoverArtQualityTier;
  issues: CoverArtIssue[];
  warnings: CoverArtIssue[];
  info: CoverArtIssue[];

  // Measured properties
  width: number | null;
  height: number | null;
  format: string | null;
  colorSpace: string | null;
  fileSizeBytes: number | null;
  hasAlphaChannel: boolean;
  dpi: number | null;

  // Per-DSP compliance
  dspCompliance: DspArtworkCompliance[];

  // Summary
  isDistributionReady: boolean;
  recommendation: string | null;
}

// ─── DSP Requirements ────────────────────────────────────────────────────────

const DSP_REQUIREMENTS = {
  spotify: {
    name: "Spotify",
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: 6000,
    maxHeight: 6000,
    maxFileSizeMb: 30,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
  apple: {
    name: "Apple Music",
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: null,
    maxHeight: null,
    maxFileSizeMb: 50,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
  amazon: {
    name: "Amazon Music HD",
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: null,
    maxHeight: null,
    maxFileSizeMb: 16,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
  tidal: {
    name: "Tidal HiFi",
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: null,
    maxHeight: null,
    maxFileSizeMb: 30,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
  deezer: {
    name: "Deezer",
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: null,
    maxHeight: null,
    maxFileSizeMb: 30,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
  youtube: {
    name: "YouTube Music",
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: null,
    maxHeight: null,
    maxFileSizeMb: 10,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
  tencent: {
    name: "Tencent Music (QQ)",
    minWidth: 1400,
    minHeight: 1400,
    maxWidth: null,
    maxHeight: null,
    maxFileSizeMb: 10,
    allowedFormats: ["jpeg", "png"],
    requiresRgb: true,
    requiresSquare: true,
  },
} as const;

// ─── Limits ──────────────────────────────────────────────────────────────────

const LIMITS = {
  absoluteMinWidth: 1400,       // Minimum for any DSP (Tencent/DDEX)
  absoluteMinHeight: 1400,
  recommendedMinWidth: 3000,    // Recommended for all major DSPs
  recommendedMinHeight: 3000,
  absoluteMaxFileSizeMb: 50,    // Apple Music's limit (most permissive)
  strictMaxFileSizeMb: 10,      // YouTube Music's limit (most restrictive)
  allowedFormats: ["jpeg", "jpg", "png"] as string[],
  allowedColorSpaces: ["srgb", "rgb"] as string[],
};

// ─── Core Validator ──────────────────────────────────────────────────────────

/**
 * Validate cover art from a file path or Buffer.
 * Returns a structured compliance report with per-DSP readiness.
 */
export async function validateCoverArtFile(
  input: string | Buffer,
  fileSizeBytes?: number
): Promise<CoverArtValidationResult> {
  const issues: CoverArtIssue[] = [];
  const warnings: CoverArtIssue[] = [];
  const infoItems: CoverArtIssue[] = [];

  let width: number | null = null;
  let height: number | null = null;
  let format: string | null = null;
  let colorSpace: string | null = null;
  let hasAlphaChannel = false;
  let dpi: number | null = null;
  let actualFileSizeBytes: number | null = fileSizeBytes ?? null;

  // ── Get file size if path provided ─────────────────────────────────────────
  if (typeof input === "string" && !fileSizeBytes) {
    try {
      const stat = fs.statSync(input);
      actualFileSizeBytes = stat.size;
    } catch {
      // File might be a URL or temp path — skip
    }
  } else if (Buffer.isBuffer(input) && !fileSizeBytes) {
    actualFileSizeBytes = input.length;
  }

  // ── Analyze image with Sharp ────────────────────────────────────────────────
  try {
    const image = sharp(input);
    const metadata = await image.metadata();

    width = metadata.width ?? null;
    height = metadata.height ?? null;
    format = metadata.format ?? null;
    colorSpace = metadata.space ?? null;
    hasAlphaChannel = metadata.hasAlpha ?? false;
    dpi = metadata.density ?? null;

    // Normalize format name
    if (format === "jpg") format = "jpeg";

  } catch (err: any) {
    issues.push({
      code: "UNREADABLE_IMAGE",
      severity: "error",
      message: "Cover art file could not be read or is corrupted.",
      detail: err?.message,
    });

    return buildResult({
      isValid: false,
      qualityTier: "rejected",
      issues,
      warnings,
      info: infoItems,
      width,
      height,
      format,
      colorSpace,
      fileSizeBytes: actualFileSizeBytes,
      hasAlphaChannel,
      dpi,
    });
  }

  // ── Format Validation ───────────────────────────────────────────────────────
  if (!format || !LIMITS.allowedFormats.includes(format)) {
    issues.push({
      code: "UNSUPPORTED_FORMAT",
      severity: "error",
      message: `Cover art format "${format ?? "unknown"}" is not accepted by DSPs.`,
      detail: "All major DSPs require JPEG or PNG artwork. Convert your file and re-upload.",
      affectedDsps: ["Spotify", "Apple Music", "Amazon Music HD", "Tidal", "Deezer", "YouTube Music"],
    });
  }

  // ── File Size Validation ────────────────────────────────────────────────────
  if (actualFileSizeBytes !== null) {
    const fileSizeMb = actualFileSizeBytes / (1024 * 1024);

    if (fileSizeMb > LIMITS.absoluteMaxFileSizeMb) {
      issues.push({
        code: "FILE_TOO_LARGE",
        severity: "error",
        message: `Cover art file size (${fileSizeMb.toFixed(1)} MB) exceeds the maximum allowed by any DSP (50 MB).`,
        detail: "Compress the image or reduce resolution to under 50 MB.",
        affectedDsps: ["All DSPs"],
      });
    } else if (fileSizeMb > LIMITS.strictMaxFileSizeMb) {
      warnings.push({
        code: "FILE_SIZE_EXCEEDS_YOUTUBE",
        severity: "warning",
        message: `Cover art file size (${fileSizeMb.toFixed(1)} MB) exceeds YouTube Music's 10 MB limit.`,
        detail: "The artwork will be accepted by most DSPs but rejected by YouTube Music. Consider compressing to under 10 MB for full compatibility.",
        affectedDsps: ["YouTube Music"],
      });
    }
  }

  // ── Resolution Validation ───────────────────────────────────────────────────
  if (width !== null && height !== null) {
    if (width < LIMITS.absoluteMinWidth || height < LIMITS.absoluteMinHeight) {
      issues.push({
        code: "RESOLUTION_TOO_LOW",
        severity: "error",
        message: `Cover art resolution (${width}×${height}px) is below the minimum required by any DSP (1400×1400px).`,
        detail: "Re-export your artwork at a minimum of 3000×3000px for full DSP compatibility.",
        affectedDsps: ["All DSPs"],
      });
    } else if (width < LIMITS.recommendedMinWidth || height < LIMITS.recommendedMinHeight) {
      warnings.push({
        code: "RESOLUTION_BELOW_RECOMMENDED",
        severity: "warning",
        message: `Cover art resolution (${width}×${height}px) is below the recommended 3000×3000px minimum for major DSPs.`,
        detail: "Spotify, Apple Music, Amazon, Tidal, and Deezer all require at least 3000×3000px. This artwork will be rejected by these platforms.",
        affectedDsps: ["Spotify", "Apple Music", "Amazon Music HD", "Tidal", "Deezer"],
      });
    }

    // Spotify max resolution check
    if (width > 6000 || height > 6000) {
      warnings.push({
        code: "RESOLUTION_EXCEEDS_SPOTIFY_MAX",
        severity: "warning",
        message: `Cover art resolution (${width}×${height}px) exceeds Spotify's 6000×6000px maximum.`,
        detail: "Resize to 3000×3000px or 6000×6000px for Spotify compatibility.",
        affectedDsps: ["Spotify"],
      });
    }
  }

  // ── Aspect Ratio Validation ─────────────────────────────────────────────────
  if (width !== null && height !== null) {
    const aspectRatio = width / height;
    const isSquare = Math.abs(aspectRatio - 1.0) < 0.01; // Allow 1% tolerance

    if (!isSquare) {
      const ratioStr = `${width}:${height} (${aspectRatio.toFixed(3)})`;
      issues.push({
        code: "NOT_SQUARE",
        severity: "error",
        message: `Cover art must be square (1:1 aspect ratio). Current ratio: ${ratioStr}.`,
        detail: "All DSPs require perfectly square artwork. Crop or pad your image to a 1:1 ratio.",
        affectedDsps: ["All DSPs"],
      });
    }
  }

  // ── Color Space Validation ──────────────────────────────────────────────────
  if (colorSpace) {
    const normalizedColorSpace = colorSpace.toLowerCase();
    const isRgb = LIMITS.allowedColorSpaces.some(cs => normalizedColorSpace.includes(cs));

    if (!isRgb) {
      if (normalizedColorSpace.includes("cmyk")) {
        issues.push({
          code: "CMYK_COLOR_SPACE",
          severity: "error",
          message: "Cover art is in CMYK color space. DSPs require RGB.",
          detail: "Open in Photoshop or GIMP and convert to RGB color mode before re-uploading.",
          affectedDsps: ["All DSPs"],
        });
      } else if (normalizedColorSpace.includes("grey") || normalizedColorSpace.includes("gray")) {
        warnings.push({
          code: "GRAYSCALE_COLOR_SPACE",
          severity: "warning",
          message: "Cover art is in grayscale. DSPs require RGB color space.",
          detail: "Convert to RGB mode even for black-and-white artwork.",
          affectedDsps: ["Spotify", "Apple Music", "Amazon Music HD"],
        });
      } else {
        warnings.push({
          code: "UNUSUAL_COLOR_SPACE",
          severity: "warning",
          message: `Cover art color space "${colorSpace}" may not be accepted by all DSPs.`,
          detail: "Convert to sRGB for maximum compatibility.",
          affectedDsps: ["Spotify", "Apple Music"],
        });
      }
    }
  }

  // ── Alpha Channel Warning ───────────────────────────────────────────────────
  if (hasAlphaChannel) {
    warnings.push({
      code: "HAS_ALPHA_CHANNEL",
      severity: "warning",
      message: "Cover art has a transparency (alpha) channel.",
      detail: "Some DSPs do not support transparent backgrounds. Flatten the image with a solid background color.",
      affectedDsps: ["Spotify", "Apple Music"],
    });
  }

  // ── DPI Info ────────────────────────────────────────────────────────────────
  if (dpi !== null && dpi < 72) {
    infoItems.push({
      code: "LOW_DPI",
      severity: "info",
      message: `Cover art DPI (${dpi}) is low, but DSPs use pixel dimensions, not DPI.`,
      detail: "DPI does not affect DSP acceptance, but may affect print quality if used for physical releases.",
    });
  }

  // ── Per-DSP Compliance ──────────────────────────────────────────────────────
  const dspCompliance = computeDspCompliance(
    width,
    height,
    format,
    colorSpace,
    actualFileSizeBytes
  );

  // ── Quality Tier ────────────────────────────────────────────────────────────
  const hasErrors = issues.length > 0;
  const hasWarnings = warnings.length > 0;
  const allDspsReady = dspCompliance.every(d => d.ready);
  const majorDspsReady = dspCompliance
    .filter(d => ["Spotify", "Apple Music", "Tidal HiFi", "Deezer"].includes(d.name))
    .every(d => d.ready);

  let qualityTier: CoverArtQualityTier;
  if (hasErrors) {
    qualityTier = "rejected";
  } else if (allDspsReady) {
    qualityTier = "distribution_ready";
  } else if (majorDspsReady && !hasErrors) {
    qualityTier = "distribution_ready"; // Minor DSP issues only
  } else {
    qualityTier = "boptone_only";
  }

  // ── Recommendation ──────────────────────────────────────────────────────────
  const recommendation = buildRecommendation(issues, warnings, dspCompliance);

  return buildResult({
    isValid: !hasErrors,
    qualityTier,
    issues,
    warnings,
    info: infoItems,
    width,
    height,
    format,
    colorSpace,
    fileSizeBytes: actualFileSizeBytes,
    hasAlphaChannel,
    dpi,
    dspCompliance,
    recommendation,
  });
}

// ─── Per-DSP Compliance Computation ─────────────────────────────────────────

function computeDspCompliance(
  width: number | null,
  height: number | null,
  format: string | null,
  colorSpace: string | null,
  fileSizeBytes: number | null
): DspArtworkCompliance[] {
  return Object.values(DSP_REQUIREMENTS).map((dsp) => {
    const reasons: string[] = [];

    // Resolution check
    if (width !== null && height !== null) {
      if (width < dsp.minWidth || height < dsp.minHeight) {
        reasons.push(`Resolution ${width}×${height}px below ${dsp.minWidth}×${dsp.minHeight}px minimum`);
      }
      if (dsp.maxWidth && (width > dsp.maxWidth || height > (dsp.maxHeight ?? Infinity))) {
        reasons.push(`Resolution ${width}×${height}px exceeds ${dsp.maxWidth}×${dsp.maxHeight ?? "∞"}px maximum`);
      }
      // Square check
      const isSquare = Math.abs(width / height - 1.0) < 0.01;
      if (!isSquare) {
        reasons.push("Not square (1:1 aspect ratio required)");
      }
    } else {
      reasons.push("Resolution unknown");
    }

    // Format check
    if (format && !dsp.allowedFormats.includes(format as any)) {
      reasons.push(`Format "${format}" not accepted (JPEG/PNG required)`);
    }

    // Color space check
    if (colorSpace && dsp.requiresRgb) {
      const normalized = colorSpace.toLowerCase();
      if (normalized.includes("cmyk")) {
        reasons.push("CMYK color space not accepted (RGB required)");
      }
    }

    // File size check
    if (fileSizeBytes !== null) {
      const fileSizeMb = fileSizeBytes / (1024 * 1024);
      if (fileSizeMb > dsp.maxFileSizeMb) {
        reasons.push(`File size ${fileSizeMb.toFixed(1)} MB exceeds ${dsp.maxFileSizeMb} MB limit`);
      }
    }

    return {
      name: dsp.name,
      ready: reasons.length === 0,
      reason: reasons.length > 0 ? reasons.join("; ") : undefined,
    };
  });
}

// ─── Recommendation Builder ──────────────────────────────────────────────────

function buildRecommendation(
  issues: CoverArtIssue[],
  warnings: CoverArtIssue[],
  dspCompliance: DspArtworkCompliance[]
): string | null {
  if (issues.length === 0 && warnings.length === 0) return null;

  const parts: string[] = [];

  const hasResolutionError = issues.some(i => i.code === "RESOLUTION_TOO_LOW");
  const hasResolutionWarning = warnings.some(i => i.code === "RESOLUTION_BELOW_RECOMMENDED");
  const hasFormatError = issues.some(i => i.code === "UNSUPPORTED_FORMAT");
  const hasCmykError = issues.some(i => i.code === "CMYK_COLOR_SPACE");
  const hasSquareError = issues.some(i => i.code === "NOT_SQUARE");
  const hasSizeWarning = warnings.some(i => i.code === "FILE_SIZE_EXCEEDS_YOUTUBE");
  const hasAlphaWarning = warnings.some(i => i.code === "HAS_ALPHA_CHANNEL");

  if (hasResolutionError) parts.push("Re-export artwork at 3000×3000px minimum");
  if (hasResolutionWarning) parts.push("Increase resolution to 3000×3000px for major DSP compatibility");
  if (hasFormatError) parts.push("Convert to JPEG or PNG format");
  if (hasCmykError) parts.push("Convert color space from CMYK to RGB");
  if (hasSquareError) parts.push("Crop to a perfect 1:1 square aspect ratio");
  if (hasSizeWarning) parts.push("Compress to under 10 MB for YouTube Music compatibility");
  if (hasAlphaWarning) parts.push("Flatten transparency with a solid background color");

  return parts.length > 0 ? parts.join(". ") + "." : null;
}

// ─── Result Builder ──────────────────────────────────────────────────────────

function buildResult(params: {
  isValid: boolean;
  qualityTier: CoverArtQualityTier;
  issues: CoverArtIssue[];
  warnings: CoverArtIssue[];
  info: CoverArtIssue[];
  width: number | null;
  height: number | null;
  format: string | null;
  colorSpace: string | null;
  fileSizeBytes: number | null;
  hasAlphaChannel: boolean;
  dpi: number | null;
  dspCompliance?: DspArtworkCompliance[];
  recommendation?: string | null;
}): CoverArtValidationResult {
  const dspCompliance = params.dspCompliance ?? [];
  const isDistributionReady = params.qualityTier === "distribution_ready";

  return {
    isValid: params.isValid,
    qualityTier: params.qualityTier,
    issues: params.issues,
    warnings: params.warnings,
    info: params.info,
    width: params.width,
    height: params.height,
    format: params.format,
    colorSpace: params.colorSpace,
    fileSizeBytes: params.fileSizeBytes,
    hasAlphaChannel: params.hasAlphaChannel,
    dpi: params.dpi,
    dspCompliance,
    isDistributionReady,
    recommendation: params.recommendation ?? null,
  };
}

// ─── Convenience: Validate from URL (S3) ─────────────────────────────────────

/**
 * Validate cover art from a publicly accessible URL.
 * Downloads the image buffer and runs the full validation pipeline.
 */
export async function validateCoverArtUrl(
  url: string
): Promise<CoverArtValidationResult> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return validateCoverArtFile(buffer, buffer.length);
  } catch (err: any) {
    return buildResult({
      isValid: false,
      qualityTier: "rejected",
      issues: [{
        code: "FETCH_FAILED",
        severity: "error",
        message: "Could not retrieve cover art for validation.",
        detail: err?.message,
      }],
      warnings: [],
      info: [],
      width: null,
      height: null,
      format: null,
      colorSpace: null,
      fileSizeBytes: null,
      hasAlphaChannel: false,
      dpi: null,
    });
  }
}
