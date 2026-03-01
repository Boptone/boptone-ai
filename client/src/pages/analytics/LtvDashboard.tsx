/**
 * LtvDashboard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cohort-based LTV Analytics Dashboard — /analytics/ltv
 *
 * Surfaces the single most important compounding-business metric:
 * "Do artists who joined in month X still generate revenue N days later?"
 *
 * Panels:
 *  1. KPI Summary bar — total artists, total revenue, avg LTV, best cohort
 *  2. Cohort Retention Heatmap — rows = cohort months, cols = periods (30/60/90/180/365d)
 *  3. Retention Curve — line chart for a selected cohort across all periods
 *  4. Revenue Source Breakdown — donut chart (streaming vs shop vs tips vs subs)
 *  5. Top Cohorts table — ranked by retention rate or avg LTV
 *
 * Admin-only. Redirects non-admins to dashboard.
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { RefreshCw, TrendingUp, Users, DollarSign, Award, ChevronDown } from "lucide-react";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Title, Tooltip, Legend, Filler
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  if (cents === 0) return "$0";
  if (cents < 100) return `$${(cents / 100).toFixed(2)}`;
  if (cents < 100_000) return `$${(cents / 100).toFixed(0)}`;
  if (cents < 10_000_000) return `$${(cents / 100_000).toFixed(1)}k`;
  return `$${(cents / 10_000_000).toFixed(1)}M`;
}

function retentionColor(rate: number): string {
  // Heat scale: 0% = cool grey, 100% = deep green
  if (rate === 0) return "bg-zinc-800 text-zinc-500";
  if (rate < 10) return "bg-red-950 text-red-400";
  if (rate < 20) return "bg-orange-950 text-orange-400";
  if (rate < 30) return "bg-amber-900 text-amber-300";
  if (rate < 40) return "bg-yellow-900 text-yellow-300";
  if (rate < 50) return "bg-lime-900 text-lime-300";
  if (rate < 65) return "bg-green-900 text-green-300";
  if (rate < 80) return "bg-emerald-800 text-emerald-200";
  return "bg-emerald-600 text-white font-bold";
}

function formatMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

const PERIODS = [30, 60, 90, 180, 365] as const;
const PERIOD_LABELS: Record<number, string> = {
  30: "30d", 60: "60d", 90: "90d", 180: "6mo", 365: "1yr",
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 flex items-start gap-4 ${accent ? "border-emerald-500/40 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/60"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-emerald-500/20" : "bg-zinc-800"}`}>
        <Icon className={`w-5 h-5 ${accent ? "text-emerald-400" : "text-zinc-400"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${accent ? "text-emerald-300" : "text-white"}`}>{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LtvDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [topMetric, setTopMetric] = useState<"retentionRate" | "avgLtvCents" | "totalRevenueCents">("retentionRate");
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Redirect non-admins
  if (user && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const { data: summary, isLoading: summaryLoading } = trpc.cohortAnalytics.getCohortSummary.useQuery();
  const { data: matrixData, isLoading: matrixLoading, refetch: refetchMatrix } =
    trpc.cohortAnalytics.getCohortMatrix.useQuery({ limit: 18 });
  const { data: topCohorts, isLoading: topLoading, refetch: refetchTop } =
    trpc.cohortAnalytics.getTopCohorts.useQuery({ metric: topMetric, periodDays: 90, limit: 8 });
  const { data: revenueBreakdown, isLoading: breakdownLoading } =
    trpc.cohortAnalytics.getRevenueBreakdown.useQuery({ periodDays: 90 });
  const { data: retentionCurve } = trpc.cohortAnalytics.getRetentionCurve.useQuery(
    { cohortMonth: selectedCohort! },
    { enabled: !!selectedCohort }
  );

  const seedMutation = trpc.cohortAnalytics.seedDemoData.useMutation({
    onSuccess: () => {
      toast.success("Demo cohort data seeded — refreshing...");
      refetchMatrix();
      refetchTop();
    },
    onError: (e) => toast.error(e.message),
  });

  const recomputeMutation = trpc.cohortAnalytics.triggerRecompute.useMutation({
    onSuccess: (d) => {
      toast.success(`Recomputed ${d.snapshotsComputed} snapshots`);
      refetchMatrix();
      refetchTop();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedMutation.mutateAsync();
    setIsSeeding(false);
  };

  const handleRecompute = async () => {
    setIsRecomputing(true);
    await recomputeMutation.mutateAsync({});
    setIsRecomputing(false);
  };

  // ─── Retention curve chart data ─────────────────────────────────────────────

  const retentionCurveData = useMemo(() => {
    if (!retentionCurve?.curve?.length) return null;
    return {
      labels: retentionCurve.curve.map(p => PERIOD_LABELS[p.periodDays] ?? `${p.periodDays}d`),
      datasets: [{
        label: `Retention — ${formatMonth(retentionCurve.cohortMonth)}`,
        data: retentionCurve.curve.map(p => p.retentionRate),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10b981",
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    };
  }, [retentionCurve]);

  // ─── Revenue breakdown donut ─────────────────────────────────────────────────

  const donutData = useMemo(() => {
    if (!revenueBreakdown) return null;
    return {
      labels: ["Streaming", "BopShop", "Tips", "Subscriptions", "Other"],
      datasets: [{
        data: [
          revenueBreakdown.streaming.pct,
          revenueBreakdown.shop.pct,
          revenueBreakdown.tips.pct,
          revenueBreakdown.subscriptions.pct,
          revenueBreakdown.other.pct,
        ],
        backgroundColor: ["#6366f1","#10b981","#f59e0b","#3b82f6","#8b5cf6"],
        borderColor: "#18181b",
        borderWidth: 3,
        hoverOffset: 8,
      }],
    };
  }, [revenueBreakdown]);

  const isLoading = summaryLoading || matrixLoading;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Cohort LTV Analytics</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Artist retention and lifetime value by signup cohort — the compounding-business signal.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={isSeeding}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full"
            >
              {isSeeding ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              Seed Demo Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecompute}
              disabled={isRecomputing}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full"
            >
              {isRecomputing ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
              Recompute Snapshots
            </Button>
          </div>
        </div>

        {/* KPI Summary */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Total Artists"
              value={summary.totalArtists.toLocaleString()}
              sub={`across ${summary.cohortCount} cohorts`}
              icon={Users}
            />
            <KpiCard
              label="Total Revenue (90d)"
              value={formatCents(summary.totalRevenueCents)}
              sub="gross, all cohorts"
              icon={DollarSign}
            />
            <KpiCard
              label="Avg LTV (90d)"
              value={formatCents(summary.avgLtvCents)}
              sub="per retained artist"
              icon={TrendingUp}
            />
            <KpiCard
              label="Best Cohort"
              value={summary.bestCohortMonth ? formatMonth(summary.bestCohortMonth) : "—"}
              sub={`${summary.bestRetentionRate.toFixed(1)}% 90-day retention`}
              icon={Award}
              accent
            />
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center mb-8">
            <p className="text-zinc-400 text-sm mb-3">No cohort data yet.</p>
            <Button size="sm" onClick={handleSeed} className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white">
              Seed Demo Data to Preview
            </Button>
          </div>
        )}

        {/* Cohort Heatmap */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Retention Heatmap</h2>
              <p className="text-xs text-zinc-500 mt-0.5">% of artists generating revenue within N days of signup. Click a cohort row to drill into its retention curve.</p>
            </div>
          </div>

          {matrixLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : matrixData?.matrix?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider w-28">Cohort</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 px-2 text-xs uppercase tracking-wider w-16">Artists</th>
                    {PERIODS.map(p => (
                      <th key={p} className="text-center text-zinc-500 font-medium pb-3 px-1 text-xs uppercase tracking-wider w-20">
                        {PERIOD_LABELS[p]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[...matrixData.matrix].reverse().map(row => (
                    <tr
                      key={row.cohortMonth}
                      className={`cursor-pointer transition-colors ${selectedCohort === row.cohortMonth ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"}`}
                      onClick={() => setSelectedCohort(
                        selectedCohort === row.cohortMonth ? null : row.cohortMonth
                      )}
                    >
                      <td className="py-2.5 pr-4 text-zinc-300 font-medium text-xs">
                        {formatMonth(row.cohortMonth)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-400 text-xs">
                        {row.cohortSize.toLocaleString()}
                      </td>
                      {PERIODS.map(p => {
                        const cell = row.periods[p];
                        if (!cell) {
                          return (
                            <td key={p} className="py-2.5 px-1 text-center">
                              <span className="inline-flex items-center justify-center w-16 h-7 rounded text-xs bg-zinc-800/50 text-zinc-600">—</span>
                            </td>
                          );
                        }
                        return (
                          <td key={p} className="py-2.5 px-1 text-center">
                            <span className={`inline-flex items-center justify-center w-16 h-7 rounded text-xs ${retentionColor(cell.retentionRate)}`}>
                              {cell.retentionRate.toFixed(1)}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-8">No heatmap data. Seed demo data or trigger a recompute above.</p>
          )}
        </div>

        {/* Bottom row: Retention Curve + Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Retention Curve */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Retention Curve</h2>
            <p className="text-xs text-zinc-500 mb-4">
              {selectedCohort
                ? `Showing ${formatMonth(selectedCohort)} cohort — click a row in the heatmap to change.`
                : "Click any cohort row in the heatmap above to see its retention curve."}
            </p>
            {retentionCurveData ? (
              <div style={{ height: 240 }}>
                <Line
                  data={retentionCurveData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${(ctx.raw as number).toFixed(1)}% retained`,
                        },
                      },
                    },
                    scales: {
                      x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#71717a" } },
                      y: {
                        grid: { color: "rgba(255,255,255,0.05)" },
                        ticks: { color: "#71717a", callback: (v) => `${v}%` },
                        min: 0,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
                Select a cohort row to render curve
              </div>
            )}
          </div>

          {/* Revenue Source Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Revenue Mix (90-day)</h2>
            <p className="text-xs text-zinc-500 mb-4">Share of gross revenue by monetization source across all cohorts.</p>
            {breakdownLoading ? (
              <div className="h-48 bg-zinc-800 rounded animate-pulse" />
            ) : donutData ? (
              <div className="flex items-center gap-6">
                <div style={{ height: 200, width: 200, flexShrink: 0 }}>
                  <Doughnut
                    data={donutData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "68%",
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${(ctx.raw as number).toFixed(1)}%`,
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2 text-sm min-w-0">
                  {[
                    { label: "Streaming", color: "#6366f1", pct: revenueBreakdown?.streaming.pct ?? 0, cents: revenueBreakdown?.streaming.cents ?? 0 },
                    { label: "BopShop", color: "#10b981", pct: revenueBreakdown?.shop.pct ?? 0, cents: revenueBreakdown?.shop.cents ?? 0 },
                    { label: "Tips", color: "#f59e0b", pct: revenueBreakdown?.tips.pct ?? 0, cents: revenueBreakdown?.tips.cents ?? 0 },
                    { label: "Subscriptions", color: "#3b82f6", pct: revenueBreakdown?.subscriptions.pct ?? 0, cents: revenueBreakdown?.subscriptions.cents ?? 0 },
                    { label: "Other", color: "#8b5cf6", pct: revenueBreakdown?.other.pct ?? 0, cents: revenueBreakdown?.other.cents ?? 0 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-300 flex-1">{item.label}</span>
                      <span className="text-zinc-400 text-xs">{item.pct.toFixed(1)}%</span>
                      <span className="text-zinc-500 text-xs w-14 text-right">{formatCents(item.cents)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Top Cohorts Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Top Cohorts</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Best-performing cohorts by 90-day window.</p>
            </div>
            <div className="flex gap-1 bg-zinc-800 rounded-full p-1">
              {(["retentionRate", "avgLtvCents", "totalRevenueCents"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setTopMetric(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    topMetric === m ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {m === "retentionRate" ? "Retention" : m === "avgLtvCents" ? "Avg LTV" : "Total Rev"}
                </button>
              ))}
            </div>
          </div>

          {topLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : topCohorts?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Cohort</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Artists</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Retained</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Retention</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Avg LTV</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Median LTV</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">P90 LTV</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Total Rev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {topCohorts.map((c, i) => (
                    <tr key={c.cohortMonth} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-zinc-200 font-medium">{formatMonth(c.cohortMonth)}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-zinc-400">{c.cohortSize.toLocaleString()}</td>
                      <td className="py-3 text-right text-zinc-400">{c.retainedCount.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs ${retentionColor(c.retentionRate)}`}>
                          {c.retentionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-zinc-300">{formatCents(c.avgLtvCents)}</td>
                      <td className="py-3 text-right text-zinc-400">{formatCents(c.medianLtvCents)}</td>
                      <td className="py-3 text-right text-zinc-400">{formatCents(c.p90LtvCents)}</td>
                      <td className="py-3 text-right text-emerald-400 font-medium">{formatCents(c.totalRevenueCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-8">No cohort data yet.</p>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-zinc-600 mt-6 text-center">
          Snapshots are pre-computed. Use "Recompute Snapshots" to refresh from live revenue data.
          Retention = % of cohort artists generating ≥ $0.01 within the period window.
        </p>

      </div>
    </DashboardLayout>
  );
}
