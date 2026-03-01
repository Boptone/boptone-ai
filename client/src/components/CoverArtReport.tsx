/**
 * CoverArtReport — DISTRO-A5
 * Displays the cover art compliance report returned by the enterprise validator.
 * Shows per-DSP readiness, resolution/format/color space details, and actionable recommendations.
 */

import { CheckCircle, XCircle, AlertTriangle, Info, Image, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Types (mirroring server/lib/coverArtValidator.ts) ───────────────────────

interface DspCompliance {
  name: string;
  ready: boolean;
  reason?: string;
}

interface CoverArtIssue {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  affectedDsps?: string[];
}

export interface CoverArtReportData {
  qualityTier: "distribution_ready" | "boptone_only" | "rejected";
  isDistributionReady: boolean;
  width: number | null;
  height: number | null;
  format: string | null;
  colorSpace: string | null;
  fileSizeBytes: number | null;
  hasAlphaChannel: boolean;
  issues: CoverArtIssue[];
  warnings: CoverArtIssue[];
  dspCompliance: DspCompliance[];
  recommendation: string | null;
}

interface CoverArtReportProps {
  report: CoverArtReportData;
  className?: string;
}

// ─── DSP Icon Map ─────────────────────────────────────────────────────────────

const DSP_COLORS: Record<string, string> = {
  "Spotify":           "#1DB954",
  "Apple Music":       "#FC3C44",
  "Amazon Music HD":   "#00A8E0",
  "Tidal HiFi":        "#000000",
  "Deezer":            "#A238FF",
  "YouTube Music":     "#FF0000",
  "Tencent Music (QQ)":"#12B7F5",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "Unknown";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatResolution(w: number | null, h: number | null): string {
  if (w === null || h === null) return "Unknown";
  return `${w.toLocaleString()} × ${h.toLocaleString()} px`;
}

function getTierConfig(tier: CoverArtReportData["qualityTier"]) {
  switch (tier) {
    case "distribution_ready":
      return {
        label: "Distribution Ready",
        bg: "bg-emerald-950/60",
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        description: "Artwork meets all major DSP requirements.",
      };
    case "boptone_only":
      return {
        label: "Boptone Only",
        bg: "bg-amber-950/60",
        border: "border-amber-500/40",
        text: "text-amber-400",
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        description: "Artwork is acceptable for BAP streaming but does not meet DSP distribution requirements.",
      };
    case "rejected":
      return {
        label: "Rejected",
        bg: "bg-red-950/60",
        border: "border-red-500/40",
        text: "text-red-400",
        icon: <XCircle className="w-5 h-5 text-red-400" />,
        description: "Artwork must be replaced before it can be used on Boptone or submitted to DSPs.",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoverArtReport({ report, className = "" }: CoverArtReportProps) {
  const tier = getTierConfig(report.qualityTier);
  const readyCount = report.dspCompliance.filter(d => d.ready).length;
  const totalCount = report.dspCompliance.length;

  return (
    <div className={`rounded-xl border ${tier.border} ${tier.bg} p-5 space-y-5 ${className}`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{tier.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-base ${tier.text}`}>Cover Art: {tier.label}</span>
            <Badge variant="outline" className={`text-xs ${tier.text} border-current`}>
              {readyCount}/{totalCount} DSPs
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">{tier.description}</p>
        </div>
      </div>

      {/* ── Artwork Specs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SpecCard
          icon={<Maximize2 className="w-4 h-4" />}
          label="Resolution"
          value={formatResolution(report.width, report.height)}
          ok={report.width !== null && report.width >= 3000}
        />
        <SpecCard
          icon={<Image className="w-4 h-4" />}
          label="Format"
          value={report.format ? report.format.toUpperCase() : "Unknown"}
          ok={report.format !== null && ["jpeg", "png"].includes(report.format)}
        />
        <SpecCard
          icon={<Info className="w-4 h-4" />}
          label="Color Space"
          value={report.colorSpace ?? "Unknown"}
          ok={report.colorSpace !== null && !report.colorSpace.toLowerCase().includes("cmyk")}
        />
        <SpecCard
          icon={<Info className="w-4 h-4" />}
          label="File Size"
          value={formatFileSize(report.fileSizeBytes)}
          ok={report.fileSizeBytes !== null && report.fileSizeBytes <= 30 * 1024 * 1024}
        />
      </div>

      {/* ── Per-DSP Compliance Grid ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          DSP Artwork Compliance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {report.dspCompliance.map((dsp) => (
            <DspBadge key={dsp.name} dsp={dsp} />
          ))}
        </div>
      </div>

      {/* ── Issues ──────────────────────────────────────────────────────────── */}
      {report.issues.length > 0 && (
        <IssueList
          title="Issues to Fix"
          items={report.issues}
          icon={<XCircle className="w-4 h-4 text-red-400" />}
          textColor="text-red-300"
          borderColor="border-red-500/20"
        />
      )}

      {/* ── Warnings ────────────────────────────────────────────────────────── */}
      {report.warnings.length > 0 && (
        <IssueList
          title="Warnings"
          items={report.warnings}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          textColor="text-amber-300"
          borderColor="border-amber-500/20"
        />
      )}

      {/* ── Alpha Channel Note ───────────────────────────────────────────────── */}
      {report.hasAlphaChannel && (
        <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-950/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Artwork has a transparency (alpha) channel. Flatten with a solid background for full DSP compatibility.</span>
        </div>
      )}

      {/* ── Recommendation ──────────────────────────────────────────────────── */}
      {report.recommendation && (
        <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/40 px-4 py-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Recommendation</p>
          <p className="text-sm text-zinc-200">{report.recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SpecCard({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${ok ? "border-zinc-700/50 bg-zinc-800/40" : "border-red-500/30 bg-red-950/30"}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${ok ? "text-zinc-400" : "text-red-400"}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-sm font-semibold truncate ${ok ? "text-zinc-100" : "text-red-300"}`}>{value}</p>
    </div>
  );
}

function DspBadge({ dsp }: { dsp: DspCompliance }) {
  const color = DSP_COLORS[dsp.name] ?? "#888";
  return (
    <div
      title={dsp.reason ?? `${dsp.name}: Ready`}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border text-xs font-medium transition-colors ${
        dsp.ready
          ? "bg-zinc-800/50 border-zinc-700/40 text-zinc-300"
          : "bg-red-950/30 border-red-500/20 text-red-300"
      }`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dsp.ready ? color : "#ef4444" }}
      />
      <span className="truncate">{dsp.name}</span>
      {dsp.ready ? (
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto shrink-0" />
      )}
    </div>
  );
}

function IssueList({
  title,
  items,
  icon,
  textColor,
  borderColor,
}: {
  title: string;
  items: CoverArtIssue[];
  icon: React.ReactNode;
  textColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-lg border ${borderColor} bg-zinc-900/40 px-4 py-3 space-y-2`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>{title}</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div>
            <p className={`text-sm ${textColor}`}>{item.message}</p>
            {item.affectedDsps && item.affectedDsps.length > 0 && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Affects: {item.affectedDsps.join(", ")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
