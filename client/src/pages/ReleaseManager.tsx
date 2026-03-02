/**
 * ReleaseManager.tsx
 * DISTRO-F5: Album-level release container management.
 * Artists create and manage releases (albums, EPs, singles) here.
 * Each release is the DDEX ERN 4.1 "Release" container that ties together
 * tracks, artwork, credits, territory deals, and distribution submissions.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Music2,
  Globe,
  CheckCircle2,
  Clock,
  AlertCircle,
  Disc3,
  ChevronRight,
  Upload,
  Trash2,
  Edit3,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

// ── Types ────────────────────────────────────────────────────────────────────

type ReleaseStatus = "draft" | "ready" | "submitted" | "distributed" | "takedown";
type ReleaseType = "album" | "single" | "ep" | "compilation" | "soundtrack" | "mixtape" | "live" | "remix" | "ringtone" | "other";

const STATUS_CONFIG: Record<ReleaseStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-zinc-700 text-zinc-200", icon: <Edit3 className="w-3 h-3" /> },
  ready: { label: "Ready", color: "bg-emerald-900 text-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  submitted: { label: "Submitted", color: "bg-blue-900 text-blue-300", icon: <Clock className="w-3 h-3" /> },
  distributed: { label: "Distributed", color: "bg-violet-900 text-violet-300", icon: <Globe className="w-3 h-3" /> },
  takedown: { label: "Takedown", color: "bg-red-900 text-red-300", icon: <AlertCircle className="w-3 h-3" /> },
};

const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  album: "Album", single: "Single", ep: "EP", compilation: "Compilation",
  soundtrack: "Soundtrack", mixtape: "Mixtape", live: "Live", remix: "Remix",
  ringtone: "Ringtone", other: "Other",
};

// ── Create Release Dialog ─────────────────────────────────────────────────────

function CreateReleaseDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [releaseType, setReleaseType] = useState<ReleaseType>("album");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = trpc.releases.create.useMutation({
    onSuccess: () => {
      toast.success("Release created");
      setOpen(false);
      setTitle("");
      setLabel("");
      setNotes("");
      onCreated();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="w-4 h-4" />
          New Release
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Release</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Release Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Sessions"
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Release Type</Label>
            <Select value={releaseType} onValueChange={(v) => setReleaseType(v as ReleaseType)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {Object.entries(RELEASE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-white hover:bg-zinc-700">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Record Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Leave blank for Independent"
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes (not published)"
              className="bg-zinc-800 border-zinc-600 text-white resize-none"
              rows={2}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              disabled={!title.trim() || createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  title: title.trim(),
                  releaseType,
                  labelName: label.trim() || undefined,
                  notes: notes.trim() || undefined,
                })
              }
            >
              {createMutation.isPending ? "Creating…" : "Create Release"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Release Card ──────────────────────────────────────────────────────────────

function ReleaseCard({
  release,
  onDelete,
  onRefresh,
}: {
  release: {
    id: number;
    title: string | null;
    releaseType: string | null;
    status: string | null;
    artworkUrl: string | null;
    labelName: string | null;
    globalReleaseDate: string | null;
    upc: string | null;
    createdAt: Date;
  };
  onDelete: (id: number) => void;
  onRefresh: () => void;
}) {
  const [, navigate] = useLocation();
  const status = (release.status ?? "draft") as ReleaseStatus;
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const releaseType = (release.releaseType ?? "album") as ReleaseType;

  const { data: readiness } = trpc.releases.getDdexReadiness.useQuery(
    { id: release.id },
    { retry: false }
  );

  const deleteMutation = trpc.releases.delete.useMutation({
    onSuccess: () => {
      toast.success("Release deleted");
      onRefresh();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card className="bg-zinc-900 border-zinc-700 hover:border-zinc-500 transition-colors">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-4">
          {/* Artwork thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 flex items-center justify-center">
            {release.artworkUrl ? (
              <img src={release.artworkUrl} alt={release.title ?? ""} className="w-full h-full object-cover" />
            ) : (
              <Disc3 className="w-8 h-8 text-zinc-600" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate">{release.title ?? "Untitled"}</h3>
                <p className="text-sm text-zinc-400">
                  {RELEASE_TYPE_LABELS[releaseType]} · {release.labelName ?? "Independent"}
                </p>
              </div>
              <Badge className={`text-xs flex-shrink-0 gap-1 ${statusCfg.color}`}>
                {statusCfg.icon}
                {statusCfg.label}
              </Badge>
            </div>

            {/* DDEX readiness bar */}
            {readiness && (
              <div className="mt-2">
                {readiness.ready ? (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> DDEX ready · {readiness.trackCount} track{readiness.trackCount !== 1 ? "s" : ""} · {readiness.dealCount} territory deal{readiness.dealCount !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {readiness.errors.length} issue{readiness.errors.length !== 1 ? "s" : ""} to fix before distribution
                  </p>
                )}
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
              {release.upc && <span>UPC: {release.upc}</span>}
              {release.globalReleaseDate && (
                <span>Release: {new Date(release.globalReleaseDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-4 pb-3 border-t border-zinc-800 pt-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1.5 text-xs"
            onClick={() => navigate(`/releases/${release.id}`)}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1.5 text-xs"
            onClick={() => navigate(`/distribution/wizard?releaseId=${release.id}`)}
          >
            <Send className="w-3.5 h-3.5" /> Distribute
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-400 hover:bg-zinc-800 gap-1.5 text-xs"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirm("Delete this release? This cannot be undone.")) {
                deleteMutation.mutate({ id: release.id });
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReleaseManager() {
  const utils = trpc.useUtils();
  const { data: releases, isLoading } = trpc.releases.getMy.useQuery();

  const refresh = () => utils.releases.getMy.invalidate();

  const stats = {
    total: releases?.length ?? 0,
    distributed: releases?.filter((r) => r.status === "distributed").length ?? 0,
    ready: releases?.filter((r) => r.status === "ready").length ?? 0,
    draft: releases?.filter((r) => r.status === "draft").length ?? 0,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Releases</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage your albums, EPs, and singles. Each release is a DDEX ERN container for distribution.
            </p>
          </div>
          <CreateReleaseDialog onCreated={refresh} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Distributed", value: stats.distributed, color: "text-violet-400" },
            { label: "Ready", value: stats.ready, color: "text-emerald-400" },
            { label: "Draft", value: stats.draft, color: "text-zinc-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Release list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : releases && releases.length > 0 ? (
          <div className="space-y-3">
            {releases.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                onDelete={(id) => {
                  // handled inside card
                }}
                onRefresh={refresh}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-700 rounded-xl">
            <Disc3 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No releases yet</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
              Create your first release to start organizing tracks for distribution to Spotify, Apple Music, TIDAL, and more.
            </p>
            <CreateReleaseDialog onCreated={refresh} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
