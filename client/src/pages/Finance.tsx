/**
 * [FINANCE-1] Real-time Artist Financial Dashboard
 *
 * Unified /finance view showing:
 *   - Headline KPIs: gross earnings, platform fees, writer splits, loan deductions, net payout
 *   - Available / pending balance with withdraw CTA
 *   - Revenue breakdown by source (bar chart)
 *   - 6-month earnings trend (line chart)
 *   - Writer split detail table
 *   - Loan repayment status
 *   - Recent transaction feed
 */

import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, TrendingDown, ArrowUpRight, Wallet, AlertCircle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function cents(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n / 100);
}

function shortCents(n: number): string {
  const d = n / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${(d / 1_000).toFixed(1)}K`;
  return cents(n);
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMonth(m: string): string {
  const [year, month] = m.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

type Period = "7d" | "30d" | "90d" | "1y" | "all";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent = false,
  warning = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`p-6 bg-white border-4 ${warning ? "border-amber-400" : accent ? "border-black" : "border-black"}`}
    >
      <div className="text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">{label}</div>
      <div className={`text-3xl font-bold font-mono ${warning ? "text-amber-600" : ""}`}>{value}</div>
      {sub && <div className="text-sm text-gray-500 mt-1 font-medium">{sub}</div>}
    </div>
  );
}

function TransactionRow({
  tx,
}: {
  tx: { date: Date | string; type: string; description: string; amountCents: number; status: string };
}) {
  const isNeg = tx.amountCents < 0;
  const typeColors: Record<string, string> = {
    bopshop: "bg-blue-100 text-blue-800",
    streaming: "bg-teal-100 text-teal-800",
    tip: "bg-amber-100 text-amber-800",
    payout: "bg-gray-100 text-gray-700",
    other: "bg-purple-100 text-purple-800",
  };
  const typeLabels: Record<string, string> = {
    bopshop: "BopShop",
    streaming: "Streaming",
    tip: "Kick-In",
    payout: "Withdrawal",
    other: "Other",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide ${typeColors[tx.type] ?? typeColors.other}`}>
          {typeLabels[tx.type] ?? tx.type}
        </span>
        <div>
          <div className="text-sm font-semibold text-gray-900">{tx.description}</div>
          <div className="text-xs text-gray-400">{fmtDate(tx.date)}</div>
        </div>
      </div>
      <div className={`text-sm font-bold font-mono ${isNeg ? "text-red-600" : "text-green-700"}`}>
        {isNeg ? "-" : "+"}{cents(Math.abs(tx.amountCents))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function Finance() {
  useRequireArtist();
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<Period>("30d");

  const { data: summary, isLoading: summaryLoading } = trpc.finance.getSummary.useQuery({ period });
  const { data: writerDetail, isLoading: writerLoading } = trpc.finance.getWriterSplitDetail.useQuery();
  const { data: loanDetail, isLoading: loanLoading } = trpc.finance.getLoanDetail.useQuery();

  const periodLabel: Record<Period, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "1y": "Last 12 months",
    all: "All time",
  };

  if (summaryLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  const s = summary;

  // Chart data
  const trendData = (s?.monthlyTrend ?? []).map((m) => ({
    month: fmtMonth(m.month),
    "Gross": Math.round(m.gross / 100),
    "Net": Math.round(m.net / 100),
    "BopShop": Math.round(m.bopshop / 100),
    "Streaming": Math.round(m.streaming / 100),
    "Tips": Math.round(m.tips / 100),
  }));

  const breakdownData = (s?.breakdown ?? []).map((b) => ({
    name: b.source,
    value: Math.round(b.amount / 100),
    color: b.color,
  }));

  const hasLoanBalance = (s?.loanBalanceCents ?? 0) > 0;
  const hasWriterSplits = (s?.writerSplitsOwed ?? 0) > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b-4 border-black pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase">Finance</h1>
            <p className="text-xl font-medium mt-2 text-gray-600">
              Real-time money flow — every dollar in, every dollar out
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-44 rounded-none border-2 border-black font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-black">
                {(Object.keys(periodLabel) as Period[]).map((p) => (
                  <SelectItem key={p} value={p} className="font-medium">
                    {periodLabel[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="rounded-none border-2 border-black bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-900"
              onClick={() => setLocation("/revenue")}
            >
              Withdraw <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* ── Balance Banner ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-black">
          <div className="p-6 bg-black text-white">
            <div className="text-xs font-bold tracking-wider uppercase text-white/60 mb-2">Available Balance</div>
            <div className="text-5xl font-bold font-mono">{cents(s?.availableBalance ?? 0)}</div>
            <div className="text-sm text-white/70 mt-2">Ready to withdraw — no hold</div>
          </div>
          <div className="p-6 bg-white border-l-4 border-black">
            <div className="text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">Pending (7-day hold)</div>
            <div className="text-5xl font-bold font-mono text-gray-400">{cents(s?.pendingBalance ?? 0)}</div>
            <div className="text-sm text-gray-400 mt-2">Clears automatically after hold period</div>
          </div>
        </div>

        {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-0 border-4 border-black divide-x-4 divide-black">
          <KpiCard
            label="Gross Earnings"
            value={shortCents(s?.grossEarnings ?? 0)}
            sub={periodLabel[period]}
            accent
          />
          <KpiCard
            label="Platform Fees"
            value={shortCents(s?.platformFees ?? 0)}
            sub="Boptone's share"
          />
          <KpiCard
            label="Writer Splits Owed"
            value={shortCents(s?.writerSplitsOwed ?? 0)}
            sub="Pending songwriter payouts"
            warning={hasWriterSplits}
          />
          <KpiCard
            label="Loan Deductions"
            value={shortCents(s?.loanRepaidCents ?? 0)}
            sub={hasLoanBalance ? `$${((s?.loanBalanceCents ?? 0) / 100).toFixed(2)} remaining` : "No active loans"}
            warning={hasLoanBalance}
          />
          <KpiCard
            label="Net Payout"
            value={shortCents(s?.netPayout ?? 0)}
            sub="After all deductions"
            accent
          />
        </div>

        {/* ── Alerts ───────────────────────────────────────────────────────── */}
        {(hasLoanBalance || hasWriterSplits) && (
          <div className="space-y-3">
            {hasLoanBalance && (
              <div className="flex items-start gap-4 p-4 border-4 border-amber-400 bg-amber-50">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-800">Active Micro-Loan: </span>
                  <span className="text-amber-700">
                    {cents(s?.loanBalanceCents ?? 0)} remaining balance. Repayments are automatically deducted from your royalties at {" "}
                    the configured percentage until fully repaid.
                  </span>
                </div>
              </div>
            )}
            {hasWriterSplits && (
              <div className="flex items-start gap-4 p-4 border-4 border-blue-400 bg-blue-50">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-800">Writer Splits Pending: </span>
                  <span className="text-blue-700">
                    {cents(s?.writerSplitsOwed ?? 0)} owed to co-writers. These are queued for the next payout cycle.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Charts ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* 6-month trend */}
          <Card className="rounded-none border-4 border-black lg:col-span-3">
            <CardHeader className="bg-black text-white pb-3">
              <CardTitle className="text-xl font-bold uppercase">6-Month Earnings Trend</CardTitle>
              <CardDescription className="text-white/70 font-medium">Gross vs. net by month</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {trendData.length === 0 || trendData.every(d => d["Gross"] === 0) ? (
                <div className="flex items-center justify-center h-48 text-gray-400 font-medium">
                  No earnings data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="Gross" stroke="#111827" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Net" stroke="#5DCCCC" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue breakdown */}
          <Card className="rounded-none border-4 border-black lg:col-span-2">
            <CardHeader className="bg-black text-white pb-3">
              <CardTitle className="text-xl font-bold uppercase">Revenue by Source</CardTitle>
              <CardDescription className="text-white/70 font-medium">{periodLabel[period]}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {breakdownData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 font-medium">
                  No revenue data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={breakdownData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} width={110} />
                    <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                    <Bar dataKey="value" fill="#111827" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Detail Tabs ───────────────────────────────────────────────────── */}
        <Tabs defaultValue="transactions">
          <TabsList className="rounded-none border-4 border-black bg-white h-auto p-0 gap-0">
            {["transactions", "writers", "loans", "payouts"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-r-4 border-black last:border-r-0 px-6 py-3 font-bold uppercase tracking-wide text-sm data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {tab === "transactions" ? "Recent Activity" : tab === "writers" ? "Writer Splits" : tab === "loans" ? "Loans" : "Withdrawals"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Recent Activity */}
          <TabsContent value="transactions" className="mt-0">
            <Card className="rounded-none border-4 border-black border-t-0">
              <CardContent className="p-6">
                {(s?.recentTransactions ?? []).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-medium">No transactions yet</div>
                ) : (
                  <div>
                    {(s?.recentTransactions ?? []).map((tx, i) => (
                      <TransactionRow key={i} tx={tx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writer Splits */}
          <TabsContent value="writers" className="mt-0">
            <Card className="rounded-none border-4 border-black border-t-0">
              <CardContent className="p-6">
                {writerLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : !writerDetail || writerDetail.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-medium">
                    No writer splits configured. Add co-writers in the Splits section.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="text-left py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Track</th>
                          <th className="text-left py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Writer</th>
                          <th className="text-right py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Split %</th>
                          <th className="text-right py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Total Earned</th>
                          <th className="text-right py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Pending</th>
                          <th className="text-right py-3 font-bold uppercase tracking-wide text-xs text-gray-500">Paid Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {writerDetail.map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 pr-4 font-semibold">{row.trackTitle}</td>
                            <td className="py-3 pr-4 text-gray-700">{row.writerName}</td>
                            <td className="py-3 pr-4 text-right font-mono font-bold">{row.splitPercentage}%</td>
                            <td className="py-3 pr-4 text-right font-mono">{cents(Number(row.totalEarned))}</td>
                            <td className="py-3 pr-4 text-right font-mono text-amber-600 font-bold">{cents(Number(row.pendingPayout))}</td>
                            <td className="py-3 text-right font-mono text-green-700">{cents(Number(row.totalPaidOut))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loans */}
          <TabsContent value="loans" className="mt-0">
            <Card className="rounded-none border-4 border-black border-t-0">
              <CardContent className="p-6">
                {loanLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : !loanDetail || loanDetail.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-medium">No loan history</div>
                ) : (
                  <div className="space-y-4">
                    {loanDetail.map((loan) => {
                      const statusColors: Record<string, string> = {
                        active: "bg-amber-100 text-amber-800",
                        repaid: "bg-green-100 text-green-800",
                        pending: "bg-gray-100 text-gray-700",
                        approved: "bg-blue-100 text-blue-800",
                        rejected: "bg-red-100 text-red-800",
                        defaulted: "bg-red-200 text-red-900",
                      };
                      return (
                        <div key={loan.id} className="border-2 border-black p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg font-mono">${Number(loan.approvedAmount ?? loan.requestedAmount).toFixed(2)}</span>
                              <Badge className={`rounded-none font-bold uppercase text-xs ${statusColors[loan.status] ?? "bg-gray-100"}`}>
                                {loan.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-400">{fmtDate(loan.appliedAt)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Owed</div>
                              <div className="font-mono font-bold">${Number(loan.totalOwed ?? 0).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Repaid</div>
                              <div className="font-mono font-bold text-green-700">${Number(loan.repaymentSummary.totalRepaid ?? 0).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Remaining</div>
                              <div className={`font-mono font-bold ${loan.status === "active" ? "text-amber-600" : ""}`}>
                                ${Number(loan.remainingBalance ?? 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {loan.status === "active" && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="w-full bg-gray-200 h-2">
                                <div
                                  className="bg-black h-2 transition-all"
                                  style={{
                                    width: `${Math.min(100, (Number(loan.totalRepaid ?? 0) / Number(loan.totalOwed ?? 1)) * 100)}%`,
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {Math.round((Number(loan.totalRepaid ?? 0) / Number(loan.totalOwed ?? 1)) * 100)}% repaid
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="payouts" className="mt-0">
            <Card className="rounded-none border-4 border-black border-t-0">
              <CardContent className="p-6">
                <PayoutHistoryTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Lifetime Summary Footer ───────────────────────────────────────── */}
        <div className="border-4 border-black p-6 bg-gray-50">
          <div className="text-xs font-bold tracking-wider uppercase text-gray-500 mb-4">Lifetime Summary</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-1">Total Earned</div>
              <div className="text-2xl font-bold font-mono">{cents(s?.totalEarningsLifetime ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-1">Total Withdrawn</div>
              <div className="text-2xl font-bold font-mono">{cents(s?.withdrawnLifetime ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-1">Writer Splits Paid</div>
              <div className="text-2xl font-bold font-mono">{cents(s?.writerSplitsPaid ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-1">Withdrawal Fees</div>
              <div className="text-2xl font-bold font-mono">{cents(s?.payoutFees ?? 0)}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payout history sub-component (paginated)
// ─────────────────────────────────────────────────────────────────────────────

function PayoutHistoryTab() {
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const { data, isLoading } = trpc.finance.getPayoutHistory.useQuery({ limit, offset });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!data || data.payouts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 font-medium">
        No withdrawals yet.{" "}
        <button className="underline text-black font-bold" onClick={() => window.location.href = "/revenue"}>
          Request your first payout
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-600",
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Date</th>
              <th className="text-left py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Type</th>
              <th className="text-right py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Amount</th>
              <th className="text-right py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Fee</th>
              <th className="text-right py-3 pr-4 font-bold uppercase tracking-wide text-xs text-gray-500">Net</th>
              <th className="text-left py-3 font-bold uppercase tracking-wide text-xs text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.payouts.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-500">{fmtDate(p.requestedAt)}</td>
                <td className="py-3 pr-4 font-semibold capitalize">{p.payoutType}</td>
                <td className="py-3 pr-4 text-right font-mono">{cents(p.amount)}</td>
                <td className="py-3 pr-4 text-right font-mono text-gray-500">{p.fee > 0 ? cents(p.fee) : "—"}</td>
                <td className="py-3 pr-4 text-right font-mono font-bold">{cents(p.netAmount)}</td>
                <td className="py-3">
                  <Badge className={`rounded-none font-bold uppercase text-xs ${statusColors[p.status] ?? "bg-gray-100"}`}>
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.total > limit && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Showing {offset + 1}–{Math.min(offset + limit, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-none border-2 border-black font-bold"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="rounded-none border-2 border-black font-bold"
              disabled={offset + limit >= data.total}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
