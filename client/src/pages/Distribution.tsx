/**
 * DISTRO-UX1: Distribution Dashboard
 *
 * Shows all distribution submissions with status tracking,
 * per-platform delivery status, and quick actions.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Globe,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Music2,
  RefreshCw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { DSP_CATALOG } from "@shared/distributionConstants";

type SubmissionStatus = "draft" | "pending" | "processing" | "live" | "failed" | "rejected";

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  draft: {
    label: "Draft",
    icon: <Clock className="w-3 h-3" />,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  pending: {
    label: "Pending Review",
    icon: <Clock className="w-3 h-3" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  processing: {
    label: "Processing",
    icon: <RefreshCw className="w-3 h-3 animate-spin" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  live: {
    label: "Live",
    icon: <CheckCircle2 className="w-3 h-3" />,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-3 h-3" />,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  rejected: {
    label: "Rejected",
    icon: <AlertTriangle className="w-3 h-3" />,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
        config.color,
        config.bg
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function DspStatusRow({ dspSlug, status }: { dspSlug: string; status: string }) {
  const dsp = DSP_CATALOG.find((d) => d.slug === dspSlug);
  const dspName = dsp?.name ?? dspSlug;
  const s = (status as SubmissionStatus) in STATUS_CONFIG ? (status as SubmissionStatus) : "pending";
  const config = STATUS_CONFIG[s];

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground">{dspName}</span>
      <StatusBadge status={s} />
    </div>
  );
}

function SubmissionCard({ submission }: { submission: any }) {
  const [expanded, setExpanded] = useState(false);
  const status = (submission.status ?? "draft") as SubmissionStatus;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  const dsps: string[] = (() => {
    try {
      if (Array.isArray(submission.selectedDsps)) return submission.selectedDsps;
      if (typeof submission.selectedDsps === "string") return JSON.parse(submission.selectedDsps);
    } catch {}
    return [];
  })();

  const dspStatuses: Record<string, string> = (() => {
    try {
      if (typeof submission.dspStatuses === "object" && submission.dspStatuses !== null)
        return submission.dspStatuses;
      if (typeof submission.dspStatuses === "string") return JSON.parse(submission.dspStatuses);
    } catch {}
    return {};
  })();

  const releaseDate = submission.releaseDate
    ? new Date(submission.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Immediate";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Send className="w-4 h-4 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground truncate">
              {submission.releaseName ?? `Submission #${submission.id}`}
            </span>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">{dsps.length} platform{dsps.length !== 1 ? "s" : ""}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{releaseDate}</span>
          </div>
        </div>

        <ChevronRight
          className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", expanded && "rotate-90")}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
          {/* Per-DSP status */}
          {dsps.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Platform Status
              </p>
              <div className="rounded-xl border border-border bg-background/50 px-3 py-1">
                {dsps.map((slug) => (
                  <DspStatusRow
                    key={slug}
                    dspSlug={slug}
                    status={dspStatuses[slug] ?? status}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Pricing: </span>
              <span className="text-foreground capitalize">{submission.pricingTier ?? "standard"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Territory: </span>
              <span className="text-foreground capitalize">
                {(() => {
                  try {
                    const t = typeof submission.territories === "string"
                      ? JSON.parse(submission.territories)
                      : submission.territories;
                    return t?.mode ?? "worldwide";
                  } catch {
                    return "worldwide";
                  }
                })()}
              </span>
            </div>
            {submission.upc && (
              <div className="col-span-2">
                <span className="text-muted-foreground">UPC: </span>
                <span className="font-mono text-foreground">{submission.upc}</span>
              </div>
            )}
          </div>

          {/* Error message */}
          {submission.errorMessage && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {submission.errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Distribution() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: submissions, isLoading, refetch } = trpc.distribution.getMySubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30s for status updates
  });

  const liveCount = (submissions ?? []).filter((s: any) => s.status === "live").length;
  const pendingCount = (submissions ?? []).filter((s: any) =>
    ["pending", "processing"].includes(s.status)
  ).length;
  const draftCount = (submissions ?? []).filter((s: any) => s.status === "draft").length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Distribution</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your releases across platforms</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="rounded-full"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate("/my-music")}
              className="rounded-full text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Release
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Live" value={liveCount} color="text-green-500" bg="bg-green-500/10" icon={<CheckCircle2 className="w-4 h-4" />} />
          <StatCard label="In Progress" value={pendingCount} color="text-blue-500" bg="bg-blue-500/10" icon={<RefreshCw className="w-4 h-4" />} />
          <StatCard label="Drafts" value={draftCount} color="text-muted-foreground" bg="bg-muted" icon={<Clock className="w-4 h-4" />} />
        </div>

        {/* Submissions list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No releases yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Go to My Music, select tracks, and click Distribute to get started.
              </p>
            </div>
            <Button
              onClick={() => navigate("/my-music")}
              className="rounded-full"
            >
              <Music2 className="w-4 h-4 mr-2" />
              Go to My Music
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission: any) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  bg,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bg, color)}>
        {icon}
      </div>
      <div>
        <p className={cn("text-2xl font-bold", color)}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
