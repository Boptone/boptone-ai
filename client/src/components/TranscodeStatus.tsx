/**
 * DISTRO-A3: TranscodeStatus Component
 *
 * Displays the DSP format transcoding progress for a track.
 * Shows per-format status badges (queued / processing / done / error / skipped)
 * with animated spinners for in-progress jobs, file size, and download links.
 *
 * Used in: MyMusic.tsx track detail sheet
 */

import React from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, SkipForward, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TranscodeFormat = "aac_256" | "ogg_vorbis" | "flac_16" | "mp3_320" | "wav_24_96";
type TranscodeStatus = "queued" | "processing" | "done" | "error" | "skipped";

interface TranscodeJob {
  id: number;
  format: TranscodeFormat;
  status: TranscodeStatus;
  s3Url: string | null;
  fileSizeBytes: number | null;
  attempts: number;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

// ─── Format Metadata ──────────────────────────────────────────────────────────

const FORMAT_META: Record<TranscodeFormat, { label: string; dsps: string; ext: string }> = {
  aac_256:    { label: "AAC 256 kbps",       dsps: "Apple Music",          ext: "m4a"  },
  ogg_vorbis: { label: "Ogg Vorbis ~320 kbps", dsps: "Spotify",            ext: "ogg"  },
  flac_16:    { label: "FLAC 16-bit",         dsps: "Tidal / Amazon HD",   ext: "flac" },
  mp3_320:    { label: "MP3 320 kbps",        dsps: "Universal fallback",  ext: "mp3"  },
  wav_24_96:  { label: "WAV 24-bit / 96 kHz", dsps: "Boptone Native",      ext: "wav"  },
};

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TranscodeStatus, {
  icon: React.ReactNode;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  label: string;
  className: string;
}> = {
  queued: {
    icon: <Clock className="h-3 w-3" />,
    badgeVariant: "outline",
    label: "Queued",
    className: "text-muted-foreground border-muted-foreground/30",
  },
  processing: {
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    badgeVariant: "secondary",
    label: "Processing",
    className: "text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
  },
  done: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    badgeVariant: "default",
    label: "Ready",
    className: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  error: {
    icon: <XCircle className="h-3 w-3" />,
    badgeVariant: "destructive",
    label: "Error",
    className: "text-red-700 border-red-300 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
  },
  skipped: {
    icon: <SkipForward className="h-3 w-3" />,
    badgeVariant: "outline",
    label: "Skipped",
    className: "text-muted-foreground border-muted-foreground/20",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Single Format Row ────────────────────────────────────────────────────────

function FormatRow({ job }: { job: TranscodeJob }) {
  const meta = FORMAT_META[job.format];
  const statusCfg = STATUS_CONFIG[job.status];

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Format info */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">{meta.label}</p>
          <p className="text-xs text-muted-foreground">{meta.dsps}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* File size */}
        {job.status === "done" && job.fileSizeBytes && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatBytes(job.fileSizeBytes)}
          </span>
        )}

        {/* Download link (done only) */}
        {job.status === "done" && job.s3Url && (
          <a
            href={job.s3Url}
            download={`track.${meta.ext}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={`Download ${meta.label}`}
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}

        {/* Status badge */}
        <Badge
          variant="outline"
          className={cn("flex items-center gap-1 text-xs px-2 py-0.5 font-medium", statusCfg.className)}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </Badge>
      </div>
    </div>
  );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-0">
      {(["aac_256", "ogg_vorbis", "flac_16", "mp3_320", "wav_24_96"] as TranscodeFormat[]).map((fmt) => (
        <div key={fmt} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
          <div className="space-y-1">
            <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted/60 animate-pulse rounded" />
          </div>
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TranscodeStatusProps {
  trackId: number;
  /** If true, auto-polls every 8 seconds while any job is in-progress */
  autoRefresh?: boolean;
}

export function TranscodeStatus({ trackId, autoRefresh = true }: TranscodeStatusProps) {
  const { data, isLoading, error } = trpc.bap.tracks.transcodeStatus.useQuery(
    { trackId },
    {
      // Poll while any job is still processing or queued
      refetchInterval: (query) => {
        if (!autoRefresh) return false;
        const d = query.state.data;
        if (!d) return false;
        const active = d.summary.processing + d.summary.queued;
        return active > 0 ? 8_000 : false;
      },
      staleTime: 5_000,
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          DSP Format Variants
        </p>
        <SkeletonRows />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        Format variants not available yet — they will appear after the first upload.
      </div>
    );
  }

  const { jobs, summary } = data;

  // If no jobs exist yet (track was uploaded before DISTRO-A3), show a pending state
  if (jobs.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          DSP Format Variants
        </p>
        <p className="text-xs text-muted-foreground py-1">
          Format variants will be generated on the next upload.
        </p>
      </div>
    );
  }

  // Progress summary bar
  const pct = summary.total > 0 ? Math.round(((summary.done + summary.skipped) / summary.total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          DSP Format Variants
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {summary.done + summary.skipped} / {summary.total} ready
        </span>
      </div>

      {/* Progress bar */}
      {summary.total > 0 && (
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              summary.error > 0 ? "bg-red-500" : "bg-emerald-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Format rows */}
      <div>
        {(["aac_256", "ogg_vorbis", "flac_16", "mp3_320", "wav_24_96"] as TranscodeFormat[]).map((fmt) => {
          const job = jobs.find((j) => j.format === fmt);
          if (!job) {
            // Job not yet created — show as queued placeholder
            return (
              <div key={fmt} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{FORMAT_META[fmt].label}</p>
                  <p className="text-xs text-muted-foreground">{FORMAT_META[fmt].dsps}</p>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/20 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              </div>
            );
          }
          return <FormatRow key={fmt} job={job as TranscodeJob} />;
        })}
      </div>
    </div>
  );
}

export default TranscodeStatus;
