/**
 * AudioQualityReport
 *
 * Displays the DSP distribution quality report returned by the audio validator
 * after a track upload. Shows quality tier, technical profile, loudness data,
 * warnings, and actionable recommendations — all in plain language for artists.
 *
 * Usage:
 *   <AudioQualityReport report={uploadResult.audioQuality} />
 */

import { CheckCircle, AlertTriangle, XCircle, Info, Music, Zap, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types (mirrors server AudioValidationResult shape) ──────────────────────

interface TechnicalProfile {
  format: string;
  sampleRateHz: number;
  bitDepth: number | null;
  channels: number;
  durationSeconds: number;
  isLossless: boolean;
}

interface LoudnessData {
  integratedLufs: number | null;
  truePeakDbtp: number | null;
  isClipping: boolean;
}

export interface AudioQualityReportData {
  qualityTier: "distribution_ready" | "boptone_only" | "rejected";
  isDistributionReady: boolean;
  summary: string;
  warnings: string[];
  recommendations: string[];
  loudness: LoudnessData | null;
  technicalProfile: TechnicalProfile | null;
}

interface AudioQualityReportProps {
  report: AudioQualityReportData;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSampleRate(hz: number): string {
  if (!hz) return "--";
  return hz === 44100 ? "44.1 kHz" : hz === 48000 ? "48 kHz" : `${(hz / 1000).toFixed(1)} kHz`;
}

function getLufsColor(lufs: number | null): string {
  if (lufs === null) return "text-muted-foreground";
  if (lufs > -9) return "text-red-500";
  if (lufs > -12) return "text-amber-500";
  if (lufs >= -16 && lufs <= -11) return "text-green-500";
  if (lufs < -24) return "text-amber-500";
  return "text-muted-foreground";
}

function getLufsLabel(lufs: number | null): string {
  if (lufs === null) return "Not measured";
  if (lufs > -9) return "Too loud — DSPs will apply heavy gain reduction";
  if (lufs > -12) return "Slightly loud for streaming";
  if (lufs >= -16 && lufs <= -11) return "Optimal for streaming";
  if (lufs < -24) return "Too quiet — may sound low on DSPs";
  return "Acceptable";
}

// ─── Tier Config ─────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  distribution_ready: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    badgeVariant: "default" as const,
    badgeClass: "bg-green-500/10 text-green-600 border-green-200",
    label: "Distribution Ready",
    description: "This track meets all DSP requirements and is eligible for global distribution.",
  },
  boptone_only: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    badgeVariant: "outline" as const,
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-200",
    label: "Boptone Only",
    description: "Uploaded to Boptone. Resolve the warnings below before distributing to external platforms.",
  },
  rejected: {
    icon: XCircle,
    iconColor: "text-red-500",
    badgeVariant: "destructive" as const,
    badgeClass: "bg-red-500/10 text-red-600 border-red-200",
    label: "Upload Rejected",
    description: "This file cannot be uploaded. Please fix the issues below and try again.",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AudioQualityReport({ report, className }: AudioQualityReportProps) {
  const tier = TIER_CONFIG[report.qualityTier];
  const TierIcon = tier.icon;
  const profile = report.technicalProfile;
  const loudness = report.loudness;

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground", className)}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b">
        <TierIcon className={cn("h-5 w-5 mt-0.5 shrink-0", tier.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">Audio Quality Report</span>
            <Badge variant="outline" className={cn("text-xs font-medium", tier.badgeClass)}>
              {tier.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{report.summary}</p>
        </div>
      </div>

      {/* Technical Profile */}
      {profile && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-1.5 mb-3">
            <Music className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Technical Profile
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            <ProfileRow label="Format" value={profile.format} highlight={profile.isLossless} />
            <ProfileRow label="Sample Rate" value={formatSampleRate(profile.sampleRateHz)} />
            <ProfileRow
              label="Bit Depth"
              value={profile.bitDepth ? `${profile.bitDepth}-bit` : "N/A (lossy)"}
            />
            <ProfileRow
              label="Channels"
              value={profile.channels === 1 ? "Mono" : profile.channels === 2 ? "Stereo" : `${profile.channels}ch`}
            />
            <ProfileRow label="Duration" value={formatDuration(profile.durationSeconds)} />
            <ProfileRow
              label="Quality"
              value={profile.isLossless ? "Lossless" : "Lossy (compressed)"}
              highlight={profile.isLossless}
            />
          </div>
        </div>
      )}

      {/* Loudness Report */}
      {loudness && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-1.5 mb-3">
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Loudness Analysis
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Integrated Loudness</p>
              <p className={cn("text-sm font-semibold tabular-nums", getLufsColor(loudness.integratedLufs))}>
                {loudness.integratedLufs !== null ? `${loudness.integratedLufs.toFixed(1)} LUFS` : "Not measured"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getLufsLabel(loudness.integratedLufs)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">True Peak</p>
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  loudness.isClipping
                    ? "text-red-500"
                    : loudness.truePeakDbtp !== null && loudness.truePeakDbtp > -1
                    ? "text-amber-500"
                    : "text-green-500"
                )}
              >
                {loudness.truePeakDbtp !== null ? `${loudness.truePeakDbtp.toFixed(1)} dBTP` : "Not measured"}
              </p>
              {loudness.isClipping && (
                <p className="text-xs text-red-500 mt-0.5 font-medium">Clipping detected</p>
              )}
            </div>
          </div>

          {/* DSP target bar */}
          {loudness.integratedLufs !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>-30 LUFS (quiet)</span>
                <span className="font-medium text-green-600">-14 LUFS (target)</span>
                <span>0 LUFS (loud)</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                {/* Green zone: -17 to -11 LUFS */}
                <div
                  className="absolute h-full bg-green-200"
                  style={{ left: "43%", width: "20%" }}
                />
                {/* Marker */}
                <div
                  className="absolute h-full w-0.5 bg-foreground"
                  style={{
                    left: `${Math.max(0, Math.min(100, ((loudness.integratedLufs + 30) / 30) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Warnings ({report.warnings.length})
            </span>
          </div>
          <ul className="space-y-1.5">
            {report.warnings.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-400">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              How to Improve
            </span>
          </div>
          <ul className="space-y-1.5">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 mt-0.5 text-blue-500">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All clear */}
      {report.qualityTier === "distribution_ready" && report.warnings.length === 0 && (
        <div className="p-4 flex items-center gap-2 text-xs text-green-600">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>No issues found. This track is ready for global distribution.</span>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium", highlight && "text-green-600")}>{value}</p>
    </div>
  );
}

export default AudioQualityReport;
