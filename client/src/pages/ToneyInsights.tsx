/**
 * Toney Insights Page — /toney-insights
 *
 * Displays the Toney autonomous agent's proactive insights and recommended actions.
 * Artists can view, act on, and dismiss individual insights.
 * A "Refresh now" button manually triggers a new agent cycle.
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BellOff,
  Bot,
  CheckCheck,
  ChevronDown,
  DollarSign,
  Loader2,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Category config ──────────────────────────────────────────────────────────

type InsightCategory =
  | "streaming_drop"
  | "streaming_spike"
  | "revenue_milestone"
  | "revenue_drop"
  | "fan_engagement_spike"
  | "release_gap"
  | "workflow_suggestion"
  | "goal_progress"
  | "earnings_available"
  | "superfan_detected"
  | "general";

type InsightPriority = "low" | "medium" | "high" | "critical";

const CATEGORY_CONFIG: Record<
  InsightCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  streaming_drop: { label: "Streaming Drop", icon: TrendingDown, color: "text-red-600" },
  streaming_spike: { label: "Streaming Spike", icon: TrendingUp, color: "text-green-600" },
  revenue_milestone: { label: "Revenue Milestone", icon: DollarSign, color: "text-green-600" },
  revenue_drop: { label: "Revenue Drop", icon: TrendingDown, color: "text-red-600" },
  fan_engagement_spike: { label: "Fan Engagement", icon: Star, color: "text-yellow-600" },
  release_gap: { label: "Release Gap", icon: AlertTriangle, color: "text-orange-600" },
  workflow_suggestion: { label: "Workflow Suggestion", icon: Zap, color: "text-purple-600" },
  goal_progress: { label: "Goal Progress", icon: ArrowUpRight, color: "text-blue-600" },
  earnings_available: { label: "Earnings Available", icon: DollarSign, color: "text-green-600" },
  superfan_detected: { label: "Superfan Detected", icon: Star, color: "text-yellow-600" },
  general: { label: "General", icon: Bot, color: "text-gray-600" },
};

const PRIORITY_BADGE: Record<InsightPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-700 border-gray-300" },
  medium: { label: "Medium", className: "bg-blue-50 text-blue-700 border-blue-300" },
  high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-300" },
  critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-300" },
};

// ─── Insight card ─────────────────────────────────────────────────────────────

interface InsightAction {
  id: number;
  category: InsightCategory;
  title: string;
  insight: string;
  priority: InsightPriority;
  autoExecuted: boolean;
  workflowId: number | null;
  dismissed: boolean;
  createdAt: Date | string;
}

function InsightCard({
  action,
  onDismiss,
}: {
  action: InsightAction;
  onDismiss: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[action.category] ?? CATEGORY_CONFIG.general;
  const Icon = config.icon;
  const priorityBadge = PRIORITY_BADGE[action.priority] ?? PRIORITY_BADGE.medium;
  const createdAt = new Date(action.createdAt);

  return (
    <div
      className={`border-2 border-black bg-white transition-all ${
        action.dismissed ? "opacity-50" : ""
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`mt-0.5 shrink-0 ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm uppercase tracking-tight">{action.title}</span>
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 rounded-none font-medium ${priorityBadge.className}`}
            >
              {priorityBadge.label}
            </Badge>
            {action.autoExecuted && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 rounded-none bg-purple-50 text-purple-700 border-purple-300"
              >
                Auto-executed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{config.label}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-0.5 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded insight body */}
      {expanded && (
        <div className="px-4 pb-4 border-t-2 border-black pt-3">
          <p className="text-sm leading-relaxed text-foreground">{action.insight}</p>
          {action.workflowId && (
            <p className="text-xs text-muted-foreground mt-2">
              Workflow #{action.workflowId} was automatically created.
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              className="rounded-none border-2 border-black text-xs font-bold h-8"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(action.id);
              }}
            >
              <BellOff className="h-3 w-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ToneyInsights() {
  const [showDismissed, setShowDismissed] = useState(false);
  const utils = trpc.useUtils();

  const { data: stats } = trpc.toneyAgent.getStats.useQuery();
  const { data, isLoading } =
    trpc.toneyAgent.getActions.useQuery({
      limit: 20,
      offset: 0,
      showDismissed,
    });

  const dismissMutation = trpc.toneyAgent.dismiss.useMutation({
    onSuccess: () => {
      utils.toneyAgent.getActions.invalidate();
      utils.toneyAgent.getStats.invalidate();
      toast.success("Insight dismissed");
    },
    onError: () => toast.error("Failed to dismiss insight"),
  });

  const dismissAllMutation = trpc.toneyAgent.dismissAll.useMutation({
    onSuccess: () => {
      utils.toneyAgent.getActions.invalidate();
      utils.toneyAgent.getStats.invalidate();
      toast.success("All insights dismissed");
    },
    onError: () => toast.error("Failed to dismiss all insights"),
  });

  const triggerMutation = trpc.toneyAgent.triggerCycle.useMutation({
    onSuccess: (result) => {
      utils.toneyAgent.getActions.invalidate();
      utils.toneyAgent.getStats.invalidate();
      if (result.actionsCreated > 0) {
        toast.success(
          `Toney found ${result.actionsCreated} new insight${result.actionsCreated > 1 ? "s" : ""}!`
        );
      } else {
        toast.info("No new insights right now — check back later.");
      }
    },
    onError: () => toast.error("Failed to trigger agent cycle"),
  });

  const actions = data?.actions ?? [];
  const total = data?.total ?? 0;
  const unread = stats?.unread ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pt-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <h1 className="text-2xl font-black uppercase tracking-tight">Toney Insights</h1>
              {unread > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 text-xs font-bold bg-black text-white rounded-full">
                  {unread}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Toney monitors your metrics every 6 hours and surfaces proactive recommendations.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="rounded-none border-2 border-black text-xs font-bold h-9"
              onClick={() => triggerMutation.mutate()}
              disabled={triggerMutation.isPending}
            >
              {triggerMutation.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh now
            </Button>
            {unread > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-none border-2 border-black text-xs font-bold h-9"
                onClick={() => dismissAllMutation.mutate()}
                disabled={dismissAllMutation.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Dismiss all
              </Button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="border-2 border-black p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total insights</p>
              <p className="text-2xl font-black mt-1">{stats.total}</p>
            </div>
            <div className="border-2 border-black p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Unread</p>
              <p className="text-2xl font-black mt-1">{stats.unread}</p>
            </div>
            <div className="border-2 border-black p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Categories</p>
              <p className="text-2xl font-black mt-1">{stats.byCategory.length}</p>
            </div>
          </div>
        )}

        {/* Filter toggle */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className={`text-xs font-bold uppercase tracking-wide border-b-2 pb-0.5 transition-colors ${
              !showDismissed
                ? "border-black text-black"
                : "border-transparent text-muted-foreground hover:text-black"
            }`}
            onClick={() => setShowDismissed(false)}
          >
            Active ({unread})
          </button>
          <button
            className={`text-xs font-bold uppercase tracking-wide border-b-2 pb-0.5 transition-colors ${
              showDismissed
                ? "border-black text-black"
                : "border-transparent text-muted-foreground hover:text-black"
            }`}
            onClick={() => setShowDismissed(true)}
          >
            All ({total})
          </button>
        </div>

        {/* Insight list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : actions.length === 0 ? (
          <div className="border-2 border-dashed border-black p-12 text-center">
            <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-bold uppercase text-sm">No insights yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {showDismissed
                ? "No insights have been generated yet."
                : "All caught up! Toney will surface new insights as your metrics change."}
            </p>
            <Button
              size="sm"
              className="mt-4 rounded-none border-2 border-black bg-black text-white text-xs font-bold h-9"
              onClick={() => triggerMutation.mutate()}
              disabled={triggerMutation.isPending}
            >
              {triggerMutation.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Run Toney now
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actions.map((action) => (
              <InsightCard
                key={action.id}
                action={action as InsightAction}
                onDismiss={(id) => dismissMutation.mutate({ actionId: id })}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
