import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  ChevronRight,
  Filter,
  BarChart3,
  Users,
  FileText,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: "Received", color: "text-blue-400", bg: "bg-blue-950/40 border-blue-900/50" },
  intake_validation: { label: "Validating", color: "text-blue-400", bg: "bg-blue-950/40 border-blue-900/50" },
  auto_scan_pending: { label: "Scanning", color: "text-purple-400", bg: "bg-purple-950/40 border-purple-900/50" },
  triage: { label: "In Triage", color: "text-amber-400", bg: "bg-amber-950/40 border-amber-900/50" },
  action_taken: { label: "Action Taken", color: "text-orange-400", bg: "bg-orange-950/40 border-orange-900/50" },
  notified: { label: "Artist Notified", color: "text-orange-400", bg: "bg-orange-950/40 border-orange-900/50" },
  counter_notice_window: { label: "Counter-Notice Window", color: "text-yellow-400", bg: "bg-yellow-950/40 border-yellow-900/50" },
  counter_notice_received: { label: "Counter-Notice Filed", color: "text-yellow-400", bg: "bg-yellow-950/40 border-yellow-900/50" },
  reinstated: { label: "Reinstated", color: "text-green-400", bg: "bg-green-950/40 border-green-900/50" },
  appeal_pending: { label: "Appeal Pending", color: "text-red-400", bg: "bg-red-950/40 border-red-900/50" },
  resolved_upheld: { label: "Upheld", color: "text-zinc-400", bg: "bg-zinc-800/40 border-zinc-700/50" },
  resolved_reversed: { label: "Reversed", color: "text-zinc-400", bg: "bg-zinc-800/40 border-zinc-700/50" },
  withdrawn: { label: "Withdrawn", color: "text-zinc-400", bg: "bg-zinc-800/40 border-zinc-700/50" },
  invalid: { label: "Invalid", color: "text-red-400", bg: "bg-red-950/40 border-red-900/50" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "text-red-400", dot: "bg-red-500" },
  high: { label: "High", color: "text-orange-400", dot: "bg-orange-500" },
  normal: { label: "Normal", color: "text-blue-400", dot: "bg-blue-500" },
  low: { label: "Low", color: "text-zinc-400", dot: "bg-zinc-500" },
};

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  accent = false,
  warning = false,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${warning ? "bg-red-950/20 border-red-900/50" : accent ? "bg-zinc-900 border-zinc-700" : "bg-zinc-950 border-zinc-800"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${warning ? "text-red-400" : "text-zinc-400"}`}>{label}</span>
        <Icon className={`w-4 h-4 ${warning ? "text-red-400" : "text-zinc-500"}`} />
      </div>
      <p className={`text-3xl font-bold ${warning ? "text-red-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Notice row ──────────────────────────────────────────────────────────────

function NoticeRow({
  notice,
  onSelect,
}: {
  notice: any;
  onSelect: (id: number) => void;
}) {
  const status = STATUS_CONFIG[notice.status] ?? { label: notice.status, color: "text-zinc-400", bg: "bg-zinc-800/40 border-zinc-700/50" };
  const priority = PRIORITY_CONFIG[notice.priority] ?? { label: notice.priority, color: "text-zinc-400", dot: "bg-zinc-500" };
  const isOverdue = notice.slaDeadline && new Date(notice.slaDeadline) < new Date() && !["resolved_upheld", "resolved_reversed", "withdrawn"].includes(notice.status);

  return (
    <tr
      className="border-b border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer transition-colors"
      onClick={() => onSelect(notice.id)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
          <span className="text-white font-mono text-sm">{notice.ticketId}</span>
          {notice.isTrustedFlagger && (
            <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">Trusted</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded border ${status.bg} ${status.color}`}>{status.label}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-zinc-300 text-sm">{notice.jurisdiction}</span>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-zinc-200 text-sm truncate max-w-[200px]">{notice.claimantName}</p>
          {notice.claimantCompany && (
            <p className="text-zinc-500 text-xs truncate max-w-[200px]">{notice.claimantCompany}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-zinc-300 text-sm truncate max-w-[180px]">{notice.copyrightedWorkTitle}</p>
      </td>
      <td className="px-4 py-3">
        <span className="text-zinc-400 text-sm capitalize">{notice.contentType}</span>
      </td>
      <td className="px-4 py-3">
        {notice.slaDeadline ? (
          <span className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-zinc-400"}`}>
            {isOverdue ? "OVERDUE" : new Date(notice.slaDeadline).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-zinc-600 text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ChevronRight className="w-4 h-4 text-zinc-600" />
      </td>
    </tr>
  );
}

// ─── Action modal ─────────────────────────────────────────────────────────────

function TakeActionModal({
  noticeId,
  open,
  onClose,
  onSuccess,
}: {
  noticeId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [actionType, setActionType] = useState("content_removed");
  const [notes, setNotes] = useState("");
  const [issueStrike, setIssueStrike] = useState(false);

  const mutation = trpc.takedown.adminTakeAction.useMutation({
    onSuccess: () => {
      toast.success("Action recorded. Artist will be notified.");
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Take Action on Notice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-2">Action Type</label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="content_removed" className="text-white focus:bg-zinc-800">Remove Content</SelectItem>
                <SelectItem value="content_disabled" className="text-white focus:bg-zinc-800">Disable Content (Geo-neutral)</SelectItem>
                <SelectItem value="geo_blocked" className="text-white focus:bg-zinc-800">Geo-Block Content</SelectItem>
                <SelectItem value="account_suspended" className="text-white focus:bg-zinc-800">Suspend Account</SelectItem>
                <SelectItem value="notice_forwarded" className="text-white focus:bg-zinc-800">Forward Notice (CA regime)</SelectItem>
                <SelectItem value="no_action" className="text-white focus:bg-zinc-800">No Action — Invalid Notice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-2">Action Notes (required)</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Document your reasoning for this action..."
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="issueStrike"
              checked={issueStrike}
              onChange={e => setIssueStrike(e.target.checked)}
              className="rounded border-zinc-600"
            />
            <label htmlFor="issueStrike" className="text-zinc-300 text-sm cursor-pointer">
              Issue a repeat infringer strike to this artist
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-white hover:bg-zinc-800">
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate({ noticeId, actionType: actionType as any, notes, issueStrike })}
            disabled={mutation.isPending || notes.length < 10}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {mutation.isPending ? "Processing..." : "Confirm Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Notice detail panel ──────────────────────────────────────────────────────

function NoticeDetail({
  noticeId,
  onBack,
  onRefresh,
}: {
  noticeId: number;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading, refetch } = trpc.takedown.adminGetNotice.useQuery({ noticeId });

  const resolveMutation = trpc.takedown.adminResolveNotice.useMutation({
    onSuccess: () => { toast.success("Notice resolved."); refetch(); onRefresh(); },
    onError: (err) => toast.error(err.message),
  });

  const addNoteMutation = trpc.takedown.adminAddNote.useMutation({
    onSuccess: () => { toast.success("Note added."); setAdminNote(""); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { notice, evidence, actions, counterNotice, appeals } = data;
  const status = STATUS_CONFIG[notice.status] ?? { label: notice.status, color: "text-zinc-400", bg: "bg-zinc-800/40 border-zinc-700/50" };
  const canTakeAction = ["submitted", "intake_validation", "auto_scan_pending", "triage"].includes(notice.status);
  const canResolve = !["resolved_upheld", "resolved_reversed", "withdrawn"].includes(notice.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </button>
        <div className="flex-1" />
        <span className={`text-xs px-3 py-1.5 rounded-full border ${status.bg} ${status.color} font-medium`}>
          {status.label}
        </span>
      </div>

      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">{notice.ticketId}</h2>
            <p className="text-zinc-400 text-sm">
              {notice.legalFramework} · {notice.jurisdiction} · Received {new Date(notice.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {canTakeAction && (
              <Button
                onClick={() => setShowActionModal(true)}
                className="bg-white text-black hover:bg-zinc-200 text-sm"
              >
                Take Action
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 mb-1">Priority</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[notice.priority]?.dot ?? "bg-zinc-500"}`} />
              <span className="text-zinc-200 capitalize">{notice.priority}</span>
            </div>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">Content Type</p>
            <span className="text-zinc-200 capitalize">{notice.contentType}</span>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">Infringement Type</p>
            <span className="text-zinc-200 capitalize">{notice.infringementType?.replace(/_/g, " ")}</span>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">SLA Deadline</p>
            <span className={`${notice.slaDeadline && new Date(notice.slaDeadline) < new Date() ? "text-red-400" : "text-zinc-200"}`}>
              {notice.slaDeadline ? new Date(notice.slaDeadline).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claimant */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Claimant</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Name</span>
              <span className="text-zinc-200">{notice.claimantName}</span>
            </div>
            {notice.claimantCompany && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Company</span>
                <span className="text-zinc-200">{notice.claimantCompany}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">Email</span>
              <a href={`mailto:${notice.claimantEmail}`} className="text-blue-400 hover:text-blue-300">{notice.claimantEmail}</a>
            </div>
            {notice.isTrustedFlagger && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className="text-purple-400 font-medium">Trusted Flagger</span>
              </div>
            )}
          </div>
        </div>

        {/* Copyrighted work */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Copyrighted Work</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Title</span>
              <span className="text-zinc-200 text-right max-w-[200px]">{notice.copyrightedWorkTitle}</span>
            </div>
            {notice.isrc && (
              <div className="flex justify-between">
                <span className="text-zinc-500">ISRC</span>
                <span className="text-zinc-200 font-mono">{notice.isrc}</span>
              </div>
            )}
            {notice.copyrightRegistrationNumber && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Reg. No.</span>
                <span className="text-zinc-200 font-mono">{notice.copyrightRegistrationNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Infringing content */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Infringing Content</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-zinc-500 mb-1">URL</p>
            <a href={notice.infringingContentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
              {notice.infringingContentUrl}
            </a>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">Description of Infringement</p>
            <p className="text-zinc-300 leading-relaxed">{notice.infringementDescription}</p>
          </div>
        </div>
      </div>

      {/* Counter-notice */}
      {counterNotice && (
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-5">
          <h3 className="text-amber-300 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Counter-Notice Filed
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-zinc-500 mb-1">Good Faith Belief</p>
              <p className="text-zinc-300 leading-relaxed">{counterNotice.goodFaithBelief}</p>
            </div>
            {counterNotice.fairUseJustification && (
              <div>
                <p className="text-zinc-500 mb-1">Fair Use Justification</p>
                <p className="text-zinc-300 leading-relaxed">{counterNotice.fairUseJustification}</p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">Reinstatement Eligible</span>
              <span className="text-amber-300">{counterNotice.reinstateAfter ? new Date(counterNotice.reinstateAfter).toLocaleDateString() : "—"}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => resolveMutation.mutate({ noticeId, resolution: "resolved_reversed", notes: "Counter-notice accepted. Content reinstated." })}
              disabled={resolveMutation.isPending}
              className="bg-green-700 hover:bg-green-600 text-white text-sm"
            >
              Reinstate Content
            </Button>
            <Button
              onClick={() => resolveMutation.mutate({ noticeId, resolution: "resolved_upheld", notes: "Counter-notice rejected. Takedown upheld." })}
              disabled={resolveMutation.isPending}
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800 text-sm"
            >
              Keep Takedown
            </Button>
          </div>
        </div>
      )}

      {/* Audit trail */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Audit Trail</h3>
        <div className="space-y-3">
          {actions.map((action: any) => (
            <div key={action.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-zinc-600 mt-2 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-zinc-200 font-medium capitalize">{action.actionType.replace(/_/g, " ")}</span>
                  {action.isAutomated && (
                    <span className="text-xs text-purple-400 bg-purple-950/40 border border-purple-900/50 px-1.5 py-0.5 rounded">Auto</span>
                  )}
                </div>
                {action.notes && <p className="text-zinc-400 text-xs leading-relaxed">{action.notes}</p>}
                <p className="text-zinc-600 text-xs mt-1">
                  {new Date(action.createdAt).toLocaleString()}
                  {action.performedByName && ` · ${action.performedByName}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add note */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-zinc-400 text-xs mb-2">Add internal note</p>
          <div className="flex gap-2">
            <Input
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Internal note..."
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
            />
            <Button
              onClick={() => addNoteMutation.mutate({ noticeId, note: adminNote })}
              disabled={addNoteMutation.isPending || !adminNote.trim()}
              className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm shrink-0"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Resolve */}
      {canResolve && !counterNotice && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resolve Notice</h3>
          <Textarea
            value={resolveNotes}
            onChange={e => setResolveNotes(e.target.value)}
            placeholder="Resolution notes (required)..."
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px] mb-4"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => resolveMutation.mutate({ noticeId, resolution: "resolved_upheld", notes: resolveNotes })}
              disabled={resolveMutation.isPending || resolveNotes.length < 10}
              className="bg-white text-black hover:bg-zinc-200 text-sm"
            >
              Uphold Takedown
            </Button>
            <Button
              onClick={() => resolveMutation.mutate({ noticeId, resolution: "resolved_reversed", notes: resolveNotes })}
              disabled={resolveMutation.isPending || resolveNotes.length < 10}
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800 text-sm"
            >
              Reverse — Reinstate Content
            </Button>
            <Button
              onClick={() => resolveMutation.mutate({ noticeId, resolution: "withdrawn", notes: resolveNotes })}
              disabled={resolveMutation.isPending || resolveNotes.length < 10}
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
            >
              Mark Withdrawn
            </Button>
          </div>
        </div>
      )}

      <TakeActionModal
        noticeId={noticeId}
        open={showActionModal}
        onClose={() => setShowActionModal(false)}
        onSuccess={() => { refetch(); onRefresh(); }}
      />
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function ComplianceDashboard() {
  const { user, loading } = useAuth();
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: string;
    jurisdiction?: "US" | "EU" | "UK" | "CA" | "AU" | "WW";
    priority?: "urgent" | "high" | "normal" | "low";
    contentType?: "track" | "bop" | "product" | "profile" | "other";
  }>({});
  const [activeTab, setActiveTab] = useState<"queue" | "metrics" | "flaggers">("queue");

  const { data: listData, isLoading: listLoading, refetch } = trpc.takedown.adminListNotices.useQuery(
    { page, limit: 25, ...filters },
    { enabled: user?.role === "admin" }
  );

  const { data: metricsData } = trpc.takedown.adminDashboardMetrics.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  const { data: flaggers } = trpc.takedown.adminListTrustedFlaggers.useQuery(
    undefined,
    { enabled: user?.role === "admin" && activeTab === "flaggers" }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Shield className="w-12 h-12 text-zinc-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-zinc-400 mb-6">This area requires admin access.</p>
        <Link href="/dashboard">
          <Button className="bg-white text-black hover:bg-zinc-200">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const metrics = metricsData?.volume;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <span className="text-zinc-400 hover:text-white cursor-pointer text-sm">Admin</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-zinc-400" />
              <span className="text-white font-semibold">IP Compliance</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(metrics?.overdueSla ?? 0) > 0 && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">{metrics?.overdueSla ?? 0} SLA Overdue</span>
              </div>
            )}
            <Link href="/dmca">
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 text-sm">
                Public DMCA Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedNoticeId ? (
          <NoticeDetail
            noticeId={selectedNoticeId}
            onBack={() => setSelectedNoticeId(null)}
            onRefresh={refetch}
          />
        ) : (
          <>
            {/* Metrics row */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                <MetricCard label="Active Notices" value={metrics.total} icon={FileText} accent />
                <MetricCard label="Overdue SLA" value={metrics.overdueSla} icon={AlertTriangle} warning={metrics.overdueSla > 0} />
                <MetricCard label="Pending Triage" value={metrics.pendingTriage} icon={Clock} />
                <MetricCard label="Action Taken" value={metrics.actionTaken} icon={CheckCircle} />
                <MetricCard label="Counter-Notice Window" value={metrics.counterNoticeWindow} icon={Shield} />
                <MetricCard label="Resolved (30d)" value={metrics.last30Days} icon={BarChart3} />
                <MetricCard label="Resolved" value={metrics.resolved} icon={CheckCircle} />
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-zinc-800">
              {[
                { key: "queue", label: "Notice Queue", icon: FileText },
                { key: "metrics", label: "Analytics", icon: BarChart3 },
                { key: "flaggers", label: "Trusted Flaggers", icon: Users },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-white text-white"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "queue" && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Filter className="w-4 h-4" />
                    <span>Filter:</span>
                  </div>
                  <Select
                    value={filters.status ?? "all"}
                    onValueChange={v => setFilters(f => ({ ...f, status: v === "all" ? undefined : v }))}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white w-44 h-8 text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="all" className="text-white focus:bg-zinc-800">All Statuses</SelectItem>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white focus:bg-zinc-800">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.jurisdiction ?? "all"}
                    onValueChange={v => setFilters(f => ({ ...f, jurisdiction: v === "all" ? undefined : v as "US" | "EU" | "UK" | "CA" | "AU" | "WW" }))}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white w-36 h-8 text-sm">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="all" className="text-white focus:bg-zinc-800">All Regions</SelectItem>
                      {["US", "EU", "UK", "CA", "AU", "WW"].map(j => (
                        <SelectItem key={j} value={j} className="text-white focus:bg-zinc-800">{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.priority ?? "all"}
                    onValueChange={v => setFilters(f => ({ ...f, priority: v === "all" ? undefined : v as "urgent" | "high" | "normal" | "low" }))}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white w-36 h-8 text-sm">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="all" className="text-white focus:bg-zinc-800">All Priorities</SelectItem>
                      {["urgent", "high", "normal", "low"].map(p => (
                        <SelectItem key={p} value={p} className="text-white focus:bg-zinc-800 capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    onClick={() => { setFilters({}); setPage(1); }}
                    className="text-zinc-400 hover:text-white text-sm ml-auto"
                  >
                    Clear filters
                  </button>
                </div>

                {/* Table */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Ticket</th>
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Region</th>
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Claimant</th>
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Work</th>
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">SLA</th>
                          <th className="px-4 py-3 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {listLoading ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                              Loading notices...
                            </td>
                          </tr>
                        ) : listData?.notices.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                              No notices match the current filters.
                            </td>
                          </tr>
                        ) : (
                          listData?.notices.map((notice: any) => (
                            <NoticeRow key={notice.id} notice={notice} onSelect={setSelectedNoticeId} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {listData && listData.total > 25 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                      <span className="text-zinc-400 text-sm">
                        {(page - 1) * 25 + 1}–{Math.min(page * 25, listData.total)} of {listData.total}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => p + 1)}
                          disabled={page * 25 >= listData.total}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "metrics" && metricsData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* By jurisdiction */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-400" />
                    By Jurisdiction
                  </h3>
                  <div className="space-y-3">
                    {metricsData.byJurisdiction.map((row: any) => (
                      <div key={row.jurisdiction} className="flex items-center justify-between">
                        <span className="text-zinc-300 text-sm font-medium">{row.jurisdiction}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-zinc-800 rounded-full h-1.5">
                            <div
                              className="bg-white rounded-full h-1.5"
                              style={{ width: `${Math.min(100, (row.total / Math.max(1, metricsData.byJurisdiction.reduce((s: number, r: any) => s + r.total, 0))) * 100)}%` }}
                            />
                          </div>
                          <span className="text-zinc-400 text-sm w-8 text-right">{row.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By content type */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">By Content Type</h3>
                  <div className="space-y-3">
                    {metricsData.byContentType.map((row: any) => (
                      <div key={row.contentType} className="flex items-center justify-between">
                        <span className="text-zinc-300 text-sm capitalize">{row.contentType}</span>
                        <span className="text-zinc-400 text-sm">{row.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By infringement type */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">By Infringement Type</h3>
                  <div className="space-y-3">
                    {metricsData.byInfringementType.map((row: any) => (
                      <div key={row.infringementType} className="flex items-center justify-between">
                        <span className="text-zinc-300 text-sm capitalize">{row.infringementType?.replace(/_/g, " ")}</span>
                        <span className="text-zinc-400 text-sm">{row.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fingerprint scan stats */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">Fingerprint Scan Activity</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Scans</span>
                      <span className="text-white">{metricsData.scanStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Matches Found</span>
                      <span className="text-orange-400">{metricsData.scanStats.matchFound}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Uploads Blocked</span>
                      <span className="text-red-400">{metricsData.scanStats.blocked}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "flaggers" && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="text-white font-semibold">Trusted Flaggers</h3>
                  <p className="text-zinc-400 text-sm">
                    Organizations with elevated notice processing priority (EU DSA Article 22 compliant)
                  </p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Organization</th>
                      <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Trust Level</th>
                      <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">DSA Certified</th>
                      <th className="px-4 py-3 text-left text-zinc-400 text-xs font-medium uppercase tracking-wider">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!flaggers || flaggers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                          No trusted flaggers registered yet. Add record labels, PROs, and publishers here.
                        </td>
                      </tr>
                    ) : (
                      flaggers.map((f: any) => (
                        <tr key={f.id} className="border-b border-zinc-800/50">
                          <td className="px-4 py-3">
                            <p className="text-white text-sm font-medium">{f.organizationName}</p>
                            {f.website && <a href={f.website} target="_blank" rel="noopener noreferrer" className="text-zinc-500 text-xs hover:text-zinc-300">{f.website}</a>}
                          </td>
                          <td className="px-4 py-3 text-zinc-300 text-sm capitalize">{f.organizationType?.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              f.trustLevel === "premium" ? "bg-purple-950/40 border-purple-900/50 text-purple-300" :
                              f.trustLevel === "elevated" ? "bg-blue-950/40 border-blue-900/50 text-blue-300" :
                              "bg-zinc-800/40 border-zinc-700/50 text-zinc-400"
                            }`}>
                              {f.trustLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {f.dsaCertified ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-zinc-600" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">{f.contactEmail}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
