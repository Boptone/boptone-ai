import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Music, Users, DollarSign, Mail, CheckCircle, Clock, AlertCircle, Edit2 } from "lucide-react";

type SplitEntry = {
  fullName: string;
  email: string;
  percentage: number;
  role: "songwriter" | "producer" | "mixer" | "mastering" | "other";
  ipiNumber?: string;
};

type TrackSplitData = {
  trackId: number;
  title: string;
  artist: string;
  artworkUrl?: string;
  status: string;
  songwriterSplits: Array<{ name: string; percentage: number; role?: string; ipi?: string }>;
  invitations: Array<{
    id: number;
    email: string;
    fullName: string;
    splitPercentage: string;
    status: string;
    createdAt: Date;
  }>;
  earnings: Array<{
    id: number;
    writerProfileId: number;
    splitPercentage: string;
    totalEarned: number;
    pendingPayout: number;
    totalPaidOut: number;
    writerName: string | null;
    writerEmail: string | null;
  }>;
};

const ROLE_LABELS: Record<string, string> = {
  songwriter: "Songwriter",
  producer: "Producer",
  mixer: "Mixer",
  mastering: "Mastering",
  other: "Other",
};

const ROLE_COLORS: Record<string, string> = {
  songwriter: "bg-gray-900 text-white",
  producer: "bg-gray-700 text-white",
  mixer: "bg-gray-500 text-white",
  mastering: "bg-gray-400 text-white",
  other: "bg-gray-200 text-gray-900",
};

function SplitBar({ splits }: { splits: Array<{ name: string; percentage: number }> }) {
  const colors = ["bg-gray-900", "bg-gray-600", "bg-gray-400", "bg-gray-300", "bg-gray-200"];
  return (
    <div className="space-y-1">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        {splits.map((s, i) =>
          s.percentage > 0 ? (
            <div
              key={i}
              className={`${colors[i % colors.length]} transition-all`}
              style={{ width: `${s.percentage}%` }}
              title={`${s.name}: ${s.percentage}%`}
            />
          ) : null
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {splits.map((s, i) => (
          <span key={i} className="flex items-center gap-1 text-xs text-gray-600">
            <span className={`inline-block w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
            {s.name || "Unknown"}: {s.percentage}%
          </span>
        ))}
      </div>
    </div>
  );
}

function InvitationStatusBadge({ status }: { status: string }) {
  if (status === "accepted") return (
    <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
      <CheckCircle className="w-3 h-3" /> Accepted
    </span>
  );
  if (status === "pending") return (
    <span className="flex items-center gap-1 text-xs text-yellow-700 font-medium">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
      <AlertCircle className="w-3 h-3" /> {status}
    </span>
  );
}

function EditSplitsDialog({
  track,
  open,
  onClose,
}: {
  track: TrackSplitData;
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [splits, setSplits] = useState<SplitEntry[]>(
    track.songwriterSplits.map((s) => ({
      fullName: s.name,
      email: track.invitations.find((inv) => inv.fullName === s.name)?.email || "",
      percentage: s.percentage,
      role: (s.role as SplitEntry["role"]) || "songwriter",
      ipiNumber: s.ipi || "",
    }))
  );

  const updateMutation = trpc.writerPayments.splits.update.useMutation({
    onSuccess: () => {
      toast.success("Splits updated successfully");
      utils.writerPayments.splits.getForMyTracks.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const total = splits.reduce((s, w) => s + w.percentage, 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const update = (i: number, field: keyof SplitEntry, value: string | number) => {
    setSplits((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    if (!isValid) {
      toast.error("Splits must add up to 100%");
      return;
    }
    updateMutation.mutate({
      trackId: track.trackId,
      splits: splits.map((s) => ({
        fullName: s.fullName,
        email: s.email,
        percentage: s.percentage,
        role: s.role,
        ipiNumber: s.ipiNumber || undefined,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Splits — {track.title}</DialogTitle>
          <DialogDescription>
            Adjust percentage splits for this track. All splits must total 100%.
          </DialogDescription>
        </DialogHeader>

        {/* Visual bar */}
        <div className="space-y-1">
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            {splits.map((s, i) => {
              const colors = ["bg-gray-900", "bg-gray-600", "bg-gray-400", "bg-gray-300", "bg-gray-200"];
              return s.percentage > 0 ? (
                <div
                  key={i}
                  className={`${colors[i % colors.length]} transition-all`}
                  style={{ width: `${Math.min(s.percentage, 100)}%` }}
                />
              ) : null;
            })}
          </div>
          <p className={`text-xs font-medium ${isValid ? "text-green-700" : total > 100 ? "text-red-600" : "text-gray-500"}`}>
            {total.toFixed(1)}% assigned {isValid ? "✓" : total > 100 ? `(over by ${(total - 100).toFixed(1)}%)` : `(${(100 - total).toFixed(1)}% remaining)`}
          </p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {splits.map((s, i) => (
            <div key={i} className="p-3 border border-black bg-gray-50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {i === 0 ? "Primary Artist" : `Co-Writer ${i}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={s.fullName}
                  onChange={(e) => update(i, "fullName", e.target.value)}
                  placeholder="Full legal name"
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={s.percentage}
                    onChange={(e) => update(i, "percentage", parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={s.role} onValueChange={(v) => update(i, "role", v)}>
                  <SelectTrigger className="border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="songwriter">Songwriter</SelectItem>
                    <SelectItem value="producer">Producer</SelectItem>
                    <SelectItem value="mixer">Mixer</SelectItem>
                    <SelectItem value="mastering">Mastering</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={s.ipiNumber || ""}
                  onChange={(e) => update(i, "ipiNumber", e.target.value)}
                  placeholder="IPI (optional)"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 border-black">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || updateMutation.isPending}
            className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
          >
            {updateMutation.isPending ? "Saving..." : "Save Splits"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrackSplitCard({ track }: { track: TrackSplitData }) {
  const [editOpen, setEditOpen] = useState(false);
  const totalEarned = track.earnings.reduce((s, e) => s + (e.totalEarned || 0), 0);
  const pendingPayout = track.earnings.reduce((s, e) => s + (e.pendingPayout || 0), 0);

  return (
    <div className="border border-black bg-white">
      {/* Track header */}
      <div className="flex items-center gap-4 p-4 border-b border-black">
        <div className="w-12 h-12 bg-gray-100 border border-black flex-shrink-0 flex items-center justify-center overflow-hidden">
          {track.artworkUrl ? (
            <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <Music className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{track.title}</h3>
          <p className="text-sm text-gray-500">{track.artist}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {totalEarned > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Total earned</p>
              <p className="font-bold text-gray-900">${(totalEarned / 100).toFixed(2)}</p>
            </div>
          )}
          {pendingPayout > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="font-bold text-green-700">${(pendingPayout / 100).toFixed(2)}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="border-black flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Edit Splits
          </Button>
        </div>
      </div>

      {/* Split visualization */}
      <div className="p-4 border-b border-gray-100">
        {track.songwriterSplits.length > 0 ? (
          <SplitBar splits={track.songwriterSplits.map((s) => ({ name: s.name, percentage: s.percentage }))} />
        ) : (
          <p className="text-sm text-gray-400 italic">No splits configured — 100% goes to primary artist</p>
        )}
      </div>

      {/* Writers table */}
      {track.songwriterSplits.length > 0 && (
        <div className="divide-y divide-gray-100">
          {track.songwriterSplits.map((split, i) => {
            const invitation = track.invitations.find(
              (inv) => inv.fullName === split.name || inv.splitPercentage === split.percentage.toString()
            );
            const earning = track.earnings[i];
            const role = split.role || "songwriter";

            return (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">{split.name || "Unknown"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role] || ROLE_COLORS.other}`}>
                      {ROLE_LABELS[role] || role}
                    </span>
                    {split.ipi && (
                      <span className="text-xs text-gray-400">IPI: {split.ipi}</span>
                    )}
                  </div>
                  {invitation && (
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{invitation.email}</span>
                      <InvitationStatusBadge status={invitation.status} />
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{split.percentage}%</p>
                  {earning && earning.totalEarned > 0 && (
                    <p className="text-xs text-gray-500">${(earning.totalEarned / 100).toFixed(2)} earned</p>
                  )}
                  {earning && earning.pendingPayout > 0 && (
                    <p className="text-xs text-green-700 font-medium">${(earning.pendingPayout / 100).toFixed(2)} pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editOpen && (
        <EditSplitsDialog track={track} open={editOpen} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}

export default function SplitsDashboard() {
  useRequireArtist();
  const [search, setSearch] = useState("");

  const { data: tracks, isLoading } = trpc.writerPayments.splits.getForMyTracks.useQuery();

  const filtered = (tracks || []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  const totalEarned = (tracks || []).reduce(
    (sum, t) => sum + t.earnings.reduce((s, e) => s + (e.totalEarned || 0), 0),
    0
  );
  const totalPending = (tracks || []).reduce(
    (sum, t) => sum + t.earnings.reduce((s, e) => s + (e.pendingPayout || 0), 0),
    0
  );
  const totalCoWriters = (tracks || []).reduce(
    (sum, t) => sum + Math.max(0, t.songwriterSplits.length - 1),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Song Splits</h1>
          <p className="text-gray-600 text-lg">
            Transparent royalty splits for every track. Every co-writer gets paid their exact share, automatically.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-black p-4 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tracks with Splits</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{(tracks || []).length}</p>
          </div>
          <div className="border border-black p-4 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Co-Writers</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalCoWriters}</p>
          </div>
          <div className="border border-black p-4 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Distributed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${(totalEarned / 100).toFixed(2)}</p>
            {totalPending > 0 && (
              <p className="text-xs text-green-700 font-medium mt-1">${(totalPending / 100).toFixed(2)} pending payout</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks..."
            className="max-w-sm border-black"
          />
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
              Clear
            </Button>
          )}
        </div>

        {/* Track list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-black h-32 bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-black p-12 text-center bg-white">
            <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {search ? "No tracks match your search" : "No tracks with splits yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? "Try a different search term."
                : "Upload a track and add co-writers to see splits here. Every collaborator gets paid their exact percentage — automatically."}
            </p>
            {!search && (
              <Button
                onClick={() => window.location.href = "/upload"}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Upload Your First Track
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((track) => (
              <TrackSplitCard key={track.trackId} track={track as TrackSplitData} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
