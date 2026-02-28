import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle, XCircle, Eye, Clock, Shield, BarChart3, User } from "lucide-react";

type QueueStatus = "pending" | "under_review" | "approved" | "removed" | "appealed" | "appeal_approved" | "appeal_rejected" | "all";

const FLAG_REASON_LABELS: Record<string, string> = {
  ai_detection_high_confidence: "AI Detection (High)",
  ai_detection_medium_confidence: "AI Detection (Medium)",
  prohibited_tool_disclosed: "Prohibited Tool Disclosed",
  manual_report: "User Report",
  copyright_claim: "Copyright Claim",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  removed: "bg-red-100 text-red-800 border-red-200",
  appealed: "bg-purple-100 text-purple-800 border-purple-200",
  appeal_approved: "bg-green-100 text-green-800 border-green-200",
  appeal_rejected: "bg-red-100 text-red-800 border-red-200",
};

const PENALTY_COLORS: Record<string, string> = {
  warning: "bg-yellow-100 text-yellow-800",
  suspension: "bg-orange-100 text-orange-800",
  permanent_ban: "bg-red-100 text-red-800",
};

function StatsBar() {
  const { data: stats } = trpc.moderation.getStats.useQuery(undefined, { refetchInterval: 30000 });
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[
        { label: "Pending Review", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600" },
        { label: "Under Review", value: stats?.underReview ?? 0, icon: Eye, color: "text-blue-600" },
        { label: "Resolved Today", value: stats?.resolvedToday ?? 0, icon: CheckCircle, color: "text-green-600" },
        { label: "Total Strikes", value: stats?.totalStrikes ?? 0, icon: AlertTriangle, color: "text-red-600" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} className={color} />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
      ))}
    </div>
  );
}

function QueueItem({
  item,
  onClaim,
  onApprove,
  onRemove,
  onViewStrikes,
}: {
  item: any;
  onClaim: (id: number) => void;
  onApprove: (item: any) => void;
  onRemove: (item: any) => void;
  onViewStrikes: (artistId: number, artistName: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{item.trackTitle ?? "Unknown Track"}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[item.status] ?? ""}`}>
              {item.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {FLAG_REASON_LABELS[item.flagReason] ?? item.flagReason}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-1">
            Artist: <span className="font-medium">{item.artistName ?? "Unknown"}</span>
            {item.strikeIssued && (
              <span className="ml-2 text-red-600 font-medium">Strike #{item.strikeNumber} issued</span>
            )}
          </div>
          {item.flagDetails && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.flagDetails}</p>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Flagged {new Date(item.flaggedAt).toLocaleDateString()} at {new Date(item.flaggedAt).toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.status === "pending" && (
            <Button size="sm" variant="outline" onClick={() => onClaim(item.id)}>
              Claim
            </Button>
          )}
          {(item.status === "pending" || item.status === "under_review") && (
            <>
              <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => onApprove(item)}>
                <CheckCircle size={14} className="mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" onClick={() => onRemove(item)}>
                <XCircle size={14} className="mr-1" /> Remove
              </Button>
            </>
          )}
          {item.artistId && (
            <Button size="sm" variant="ghost" onClick={() => onViewStrikes(item.artistId, item.artistName ?? "Artist")}>
              <Shield size={14} className="mr-1" /> Strikes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StrikeHistoryDialog({
  artistId,
  artistName,
  open,
  onClose,
}: {
  artistId: number | null;
  artistName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: strikes } = trpc.moderation.getArtistStrikes.useQuery(
    { artistId: artistId! },
    { enabled: open && artistId !== null }
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={18} /> Strike History — {artistName}
          </DialogTitle>
          <DialogDescription>
            {strikes?.length ?? 0} strike{(strikes?.length ?? 0) !== 1 ? "s" : ""} on record
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {!strikes?.length ? (
            <p className="text-sm text-gray-500 text-center py-6">No strikes on record for this artist.</p>
          ) : (
            strikes.map((strike) => (
              <div key={strike.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Strike #{strike.strikeNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PENALTY_COLORS[strike.penalty] ?? ""}`}>
                      {strike.penalty.replace(/_/g, " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700`}>
                      Appeal: {strike.appealStatus}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{strike.reason}</p>
                {strike.trackTitle && (
                  <p className="text-xs text-gray-500 mt-1">Track: {strike.trackTitle}</p>
                )}
                {strike.suspensionEndsAt && (
                  <p className="text-xs text-orange-600 mt-1">
                    Suspension ends: {new Date(strike.suspensionEndsAt).toLocaleDateString()}
                  </p>
                )}
                {strike.appealReason && (
                  <div className="mt-2 bg-purple-50 rounded p-2">
                    <p className="text-xs font-medium text-purple-700">Appeal reason:</p>
                    <p className="text-xs text-purple-600">{strike.appealReason}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Issued {new Date(strike.issuedAt).toLocaleDateString()} by {strike.issuerName ?? "Admin"}
                </p>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminModeration() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<QueueStatus>("pending");
  const [approveItem, setApproveItem] = useState<any | null>(null);
  const [removeItem, setRemoveItem] = useState<any | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [removeNotes, setRemoveNotes] = useState("");
  const [issueStrike, setIssueStrike] = useState(false);
  const [strikeReason, setStrikeReason] = useState("");
  const [strikesArtist, setStrikesArtist] = useState<{ id: number; name: string } | null>(null);

  // Redirect non-admins
  if (user && user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const utils = trpc.useUtils();

  const { data: queueData, isLoading } = trpc.moderation.getQueue.useQuery({
    status: activeTab,
    limit: 50,
    offset: 0,
  });

  const claimMutation = trpc.moderation.claimForReview.useMutation({
    onSuccess: () => {
      toast.success("Item claimed for review");
      utils.moderation.getQueue.invalidate();
      utils.moderation.getStats.invalidate();
    },
  });

  const approveMutation = trpc.moderation.approve.useMutation({
    onSuccess: () => {
      toast.success("Content approved");
      setApproveItem(null);
      setApproveNotes("");
      utils.moderation.getQueue.invalidate();
      utils.moderation.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = trpc.moderation.remove.useMutation({
    onSuccess: (data) => {
      const msg = data.strikeResult
        ? `Content removed. Strike #${data.strikeResult.strikeNumber} issued (${data.strikeResult.penalty.replace(/_/g, " ")}).`
        : "Content removed.";
      toast.success(msg);
      setRemoveItem(null);
      setRemoveNotes("");
      setIssueStrike(false);
      setStrikeReason("");
      utils.moderation.getQueue.invalidate();
      utils.moderation.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const items = queueData?.items ?? [];
  const total = queueData?.total ?? 0;

  const TAB_LABELS: { value: QueueStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "removed", label: "Removed" },
    { value: "appealed", label: "Appealed" },
    { value: "all", label: "All" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={24} /> Content Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review flagged content, issue strikes, and manage artist appeals.
          </p>
        </div>

        <StatsBar />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QueueStatus)}>
          <TabsList className="mb-4">
            {TAB_LABELS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>

          {TAB_LABELS.map(({ value }) => (
            <TabsContent key={value} value={value}>
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading queue...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                  <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                  <p className="text-gray-500 font-medium">No items in this queue</p>
                  <p className="text-sm text-gray-400">All content in this category has been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">{total} item{total !== 1 ? "s" : ""}</p>
                  {items.map((item: any) => (
                    <QueueItem
                      key={item.id}
                      item={item}
                      onClaim={(id) => claimMutation.mutate({ id })}
                      onApprove={(i) => { setApproveItem(i); setApproveNotes(""); }}
                      onRemove={(i) => { setRemoveItem(i); setRemoveNotes(""); setIssueStrike(false); setStrikeReason(""); }}
                      onViewStrikes={(artistId, artistName) => setStrikesArtist({ id: artistId, name: artistName })}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Approve Dialog */}
      <Dialog open={!!approveItem} onOpenChange={() => setApproveItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle size={18} /> Approve Content
            </DialogTitle>
            <DialogDescription>
              Approve "{approveItem?.trackTitle}" by {approveItem?.artistName}. The track will remain published and no action will be taken.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="approve-notes">Review notes (optional)</Label>
            <Textarea
              id="approve-notes"
              placeholder="Add any notes about why this content was approved..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveItem(null)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => approveMutation.mutate({ id: approveItem.id, reviewNotes: approveNotes || undefined })}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={!!removeItem} onOpenChange={() => setRemoveItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle size={18} /> Remove Content
            </DialogTitle>
            <DialogDescription>
              Remove "{removeItem?.trackTitle}" by {removeItem?.artistName}. The track will be taken down immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="remove-notes">Review notes (required)</Label>
              <Textarea
                id="remove-notes"
                placeholder="Explain why this content is being removed..."
                value={removeNotes}
                onChange={(e) => setRemoveNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Checkbox
                id="issue-strike"
                checked={issueStrike}
                onCheckedChange={(v) => setIssueStrike(!!v)}
              />
              <div>
                <Label htmlFor="issue-strike" className="font-medium text-red-800 cursor-pointer">
                  Issue a strike to this artist
                </Label>
                <p className="text-xs text-red-600 mt-0.5">
                  Strike 1 = Warning. Strike 2 = 30-day suspension. Strike 3 = Permanent ban.
                </p>
              </div>
            </div>
            {issueStrike && (
              <div>
                <Label htmlFor="strike-reason">Strike reason (optional — defaults to review notes)</Label>
                <Textarea
                  id="strike-reason"
                  placeholder="Specific reason for the strike..."
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveItem(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() =>
                removeMutation.mutate({
                  id: removeItem.id,
                  reviewNotes: removeNotes,
                  issueStrike,
                  strikeReason: strikeReason || undefined,
                })
              }
              disabled={!removeNotes.trim() || removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : issueStrike ? "Remove & Issue Strike" : "Remove Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Strike History Dialog */}
      <StrikeHistoryDialog
        artistId={strikesArtist?.id ?? null}
        artistName={strikesArtist?.name ?? ""}
        open={!!strikesArtist}
        onClose={() => setStrikesArtist(null)}
      />
    </DashboardLayout>
  );
}
