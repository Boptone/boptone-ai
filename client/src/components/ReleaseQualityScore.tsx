/**
 * ReleaseQualityScore — Unified "Upload Once, Qualify Everywhere" card
 *
 * Wraps AudioQualityReport, LoudnessMeter, and CoverArtReport into a single
 * 0–100 score with a tier badge. Artists see one number, one status, one action.
 *
 * Scoring weights:
 *   Audio quality:   40 pts  (format, bit depth, sample rate, lossy/lossless)
 *   Loudness:        25 pts  (LUFS, true peak, DSP target alignment)
 *   Cover art:       35 pts  (resolution, format, color space, aspect ratio)
 *
 * Tiers:
 *   90–100  Boptone Premium   — Hi-res lossless + 4000×4000+ art. Perfect on mobile/car.
 *   70–89   Distribution Ready — Meets all DSP requirements. Ready for global delivery.
 *   40–69   Boptone Only       — Streams on Boptone, not eligible for DSP distribution.
 *   0–39    Needs Work         — Critical issues must be fixed before upload is accepted.
 */

import { AudioQualityReport, type AudioQualityReportData } from "@/components/AudioQualityReport";
import { CoverArtReport, type CoverArtReportData } from "@/components/CoverArtReport";
import { LoudnessMeter, type LoudnessData } from "@/components/LoudnessMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  AlertTriangle,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Info,
  Music,
  Smartphone,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QualityTier =
  | "boptone_premium"
  | "distribution_ready"
  | "boptone_only"
  | "needs_work";

export interface ReleaseQualityData {
  /** Audio quality data — matches AudioQualityReportData from AudioQualityReport component */
  audioQuality?: AudioQualityReportData | null;
  /** Loudness data — matches LoudnessData from LoudnessMeter component */
  loudness?: LoudnessData | null;
  /** Cover art data — matches CoverArtReportData from CoverArtReport component */
  coverArt?: CoverArtReportData | null;
}

interface ReleaseQualityScoreProps {
  data: ReleaseQualityData;
  trackTitle?: string;
  /** If true, shows the full expanded report by default */
  defaultExpanded?: boolean;
}

// ─── Score Calculation ────────────────────────────────────────────────────────

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

  // ── Audio: 40 pts ──────────────────────────────────────────────────────────
  if (data.audioQuality) {
    const aq = data.audioQuality;
    const tier = aq.qualityTier;
    if (tier === "distribution_ready") {
      // Check if it's actually premium quality via technicalProfile
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
      audioScore = 20; // unknown tier
    }
  } else {
    audioScore = 20; // No audio data — neutral
  }

  // ── Loudness: 25 pts ───────────────────────────────────────────────────────
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
    loudnessScore = 12; // No loudness data but audio is valid — neutral
  }

  // ── Cover Art: 35 pts ──────────────────────────────────────────────────────
  if (data.coverArt) {
    const ca = data.coverArt;
    const hasErrors = ca.issues.some((i) => i.severity === "error");
    const hasWarnings = ca.warnings.length > 0;
    const w = ca.width ?? 0;
    const h = ca.height ?? 0;
    const isPremiumArt = w >= 4000 && h >= 4000;

    if (ca.qualityTier === "distribution_ready" && isPremiumArt && !hasWarnings) {
      artScore = 35; // 4000×4000+ — perfect for mobile/car
    } else if (ca.qualityTier === "distribution_ready" && !hasWarnings) {
      artScore = 28; // 3000×3000+ clean
    } else if (ca.qualityTier === "distribution_ready") {
      artScore = 24; // 3000×3000+ with minor warnings
    } else if (!hasErrors) {
      artScore = 14; // Uploadable but not DSP-ready
    } else {
      artScore = 0; // Rejected
    }
  } else {
    artScore = 17; // No art data — neutral
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

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<
  QualityTier,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    subtext: string;
    badges: Array<{ icon: React.ReactNode; label: string }>;
  }
> = {
  boptone_premium: {
    label: "Boptone Premium",
    color: "text-violet-400",
    bgColor: "bg-violet-950/40",
    borderColor: "border-violet-500/40",
    icon: <Sparkles className="w-5 h-5 text-violet-400" />,
    subtext:
      "Hi-res lossless audio + premium artwork. Sounds flawless on mobile, car audio, and every DSP worldwide.",
    badges: [
      { icon: <Smartphone className="w-3 h-3" />, label: "Mobile Perfect" },
      { icon: <Car className="w-3 h-3" />, label: "Car Audio Ready" },
      { icon: <Globe className="w-3 h-3" />, label: "DSP Distribution" },
    ],
  },
  distribution_ready: {
    label: "Distribution Ready",
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-500/40",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    subtext:
      "Meets all DSP requirements. You can distribute to Spotify, Apple Music, Tidal, and 30+ platforms right now.",
    badges: [
      { icon: <Globe className="w-3 h-3" />, label: "DSP Distribution" },
      { icon: <Music className="w-3 h-3" />, label: "Boptone Streaming" },
    ],
  },
  boptone_only: {
    label: "Boptone Only",
    color: "text-amber-400",
    bgColor: "bg-amber-950/30",
    borderColor: "border-amber-500/40",
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    subtext:
      "Streams great on Boptone. To distribute to Spotify, Apple Music, and other DSPs, fix the issues below.",
    badges: [{ icon: <Music className="w-3 h-3" />, label: "Boptone Streaming" }],
  },
  needs_work: {
    label: "Needs Work",
    color: "text-red-400",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-500/40",
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    subtext:
      "Critical issues must be resolved before this release can be uploaded.",
    badges: [],
  },
};

// ─── Sub-score Bar ────────────────────────────────────────────────────────────

function SubScoreBar({
  label,
  score,
  maxScore,
  icon,
}: {
  label: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
}) {
  const pct = Math.round((score / maxScore) * 100);
  const colorClass =
    pct >= 80
      ? "[&>div]:bg-emerald-500"
      : pct >= 55
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-28 shrink-0 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <Progress value={pct} className={`h-1.5 flex-1 ${colorClass}`} />
      <span className="text-xs text-muted-foreground w-12 text-right">
        {score}/{maxScore}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReleaseQualityScore({
  data,
  trackTitle,
  defaultExpanded = false,
}: ReleaseQualityScoreProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { score, tier, audioScore, loudnessScore, artScore } = computeScore(data);
  const config = TIER_CONFIG[tier];

  const totalIssues =
    (data.audioQuality?.warnings?.length ?? 0) +
    (data.coverArt?.issues?.filter((i) => i.severity === "error").length ?? 0) +
    (data.coverArt?.warnings?.length ?? 0);

  const strokeColor =
    tier === "boptone_premium"
      ? "#a78bfa"
      : tier === "distribution_ready"
      ? "#34d399"
      : tier === "boptone_only"
      ? "#fbbf24"
      : "#f87171";

  return (
    <div
      className={`rounded-xl border ${config.borderColor} ${config.bgColor} overflow-hidden`}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Score circle */}
          <div className="relative shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted/20"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 163.4} 163.4`}
                stroke={strokeColor}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold leading-none ${config.color}`}>
                {score}
              </span>
              <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                /100
              </span>
            </div>
          </div>

          {/* Tier info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {config.icon}
              <span className={`font-semibold text-sm ${config.color}`}>
                {config.label}
              </span>
              {trackTitle && (
                <span className="text-xs text-muted-foreground truncate">
                  — {trackTitle}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.subtext}
            </p>

            {/* Capability badges */}
            {config.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {config.badges.map((b) => (
                  <Badge
                    key={b.label}
                    variant="outline"
                    className={`text-[10px] gap-1 px-2 py-0.5 ${config.color}`}
                  >
                    {b.icon}
                    {b.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Sub-score breakdown */}
        <div className="mt-3 space-y-1.5">
          <SubScoreBar
            label="Audio"
            score={audioScore}
            maxScore={40}
            icon={<Music className="w-3 h-3" />}
          />
          <SubScoreBar
            label="Loudness"
            score={loudnessScore}
            maxScore={25}
            icon={<Star className="w-3 h-3" />}
          />
          <SubScoreBar
            label="Artwork"
            score={artScore}
            maxScore={35}
            icon={
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            }
          />
        </div>

        {/* Issue summary */}
        {totalIssues > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            {tier === "needs_work" ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Info className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {totalIssues} issue{totalIssues !== 1 ? "s" : ""} found
              {tier !== "needs_work"
                ? " — expand for details"
                : " — must fix before distributing"}
            </span>
          </div>
        )}

        {/* Upgrade prompt for boptone_only */}
        {tier === "boptone_only" && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-300 leading-relaxed">
              <strong>To unlock DSP distribution:</strong> Re-export your track as a lossless
              WAV or FLAC file (16-bit minimum, 44.1kHz), and ensure your artwork is at least
              3000×3000px. For the best experience on Boptone mobile and car audio, use
              24-bit/96kHz audio and 4000×4000px artwork.
            </p>
          </div>
        )}

        {/* Premium upgrade prompt for distribution_ready */}
        {tier === "distribution_ready" && (
          <div className="mt-3 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <p className="text-xs text-violet-300 leading-relaxed">
              <strong>Upgrade to Boptone Premium quality:</strong> Re-export at 24-bit/96kHz
              and use 4000×4000px artwork for flawless playback on mobile, Bluetooth speakers,
              and car audio systems.
            </p>
          </div>
        )}
      </div>

      {/* ── Expanded Detail Reports ─────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border/30 divide-y divide-border/20">
          {data.audioQuality && (
            <div className="p-4">
              <AudioQualityReport report={data.audioQuality} />
            </div>
          )}
          {data.loudness && (
            <div className="p-4">
              <LoudnessMeter loudness={data.loudness} />
            </div>
          )}
          {data.coverArt && (
            <div className="p-4">
              <CoverArtReport report={data.coverArt} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
