import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle2, Clock, AlertCircle, Zap, DollarSign, RefreshCw } from "lucide-react";

export default function Money() {
  useRequireArtist();
  const [loanAmount, setLoanAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutType, setPayoutType] = useState<"standard" | "instant">("standard");

  // Earnings data
  const { data: totalRevenue } = trpc.revenue.getTotal.useQuery({});
  const revenueBySource: any[] = [];

  // Micro-loans data
  const { data: eligibility } = trpc.microloans.checkEligibility.useQuery();
  const { data: activeLoans } = trpc.microloans.getMyLoans.useQuery();
  const loanHistory = activeLoans?.filter((loan) => loan.status !== "active") || [];

  // Kick In (tips) data
  const { data: tips } = trpc.kickin.getTips.useQuery({ limit: 50 });

  // Payout data
  const { data: balance, refetch: refetchBalance } = trpc.payouts.getBalance.useQuery();
  const { data: payoutHistory, refetch: refetchHistory } = trpc.payouts.getHistory.useQuery({ limit: 10 });
  const { data: accountStatus } = trpc.stripeConnect.getAccountStatus.useQuery();
  const amountCents = Math.round(parseFloat(withdrawAmount || "0") * 100);
  const { data: feeCalc } = trpc.payouts.calculateInstantFee.useQuery(
    { amount: amountCents },
    { enabled: amountCents >= 2000 && payoutType === "instant" }
  );

  const utils = trpc.useUtils();
  const applyForLoanMutation = trpc.microloans.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Loan application submitted!");
      setLoanAmount("");
    },
    onError: (error) => toast.error(error.message),
  });

  const requestPayoutMutation = trpc.payouts.requestPayout.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal requested! Funds will arrive within 24 hours.");
      setWithdrawAmount("");
      utils.payouts.getBalance.invalidate();
      utils.payouts.getHistory.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleApplyForLoan = () => {
    const amount = parseInt(loanAmount);
    if (!amount || amount < 50 || amount > 750) {
      toast.error("Loan amount must be between $50 and $750");
      return;
    }
    applyForLoanMutation.mutate({
      amount,
      purpose: "production" as const,
      purposeDescription: "Music production funding",
    });
  };

  const handleWithdraw = () => {
    const cents = Math.round(parseFloat(withdrawAmount) * 100);
    if (!cents || cents < 2000) {
      toast.error("Minimum withdrawal is $20.00");
      return;
    }
    requestPayoutMutation.mutate({ amount: cents, payoutType });
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const availableUSD = balance ? (balance.availableBalance / 100).toFixed(2) : "0.00";
  const pendingUSD = balance ? (balance.pendingBalance / 100).toFixed(2) : "0.00";
  const totalEarnedUSD = balance ? (balance.totalEarnings / 100).toFixed(2) : "0.00";

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      processing: { label: "Processing", className: "bg-blue-100 text-blue-800 border-blue-300" },
      completed: { label: "Paid", className: "bg-green-100 text-green-800 border-green-300" },
      failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-300" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800 border-gray-300" },
    };
    const s = map[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold border rounded ${s.className}`}>
        {s.label}
      </span>
    );
  };

  // Revenue mix (mock — TODO: replace with real backend data)
  const revenueMix = [
    { source: "BAP Streams", amount: 1250, percentage: 35, color: "bg-black" },
    { source: "Third-Party Distribution", amount: 1500, percentage: 42, color: "bg-gray-700" },
    { source: "Merch & Products", amount: 450, percentage: 13, color: "bg-gray-500" },
    { source: "Fan Tips", amount: 200, percentage: 6, color: "bg-gray-400" },
    { source: "Live Events", amount: 150, percentage: 4, color: "bg-gray-300" },
  ];
  const totalMixRevenue = revenueMix.reduce((sum, item) => sum + item.amount, 0);
  const maxPercentage = Math.max(...revenueMix.map((item) => item.percentage));
  const diversificationScore = Math.round(100 - (maxPercentage - 20));
  const dependencyRisk = maxPercentage > 60 ? "HIGH" : maxPercentage > 40 ? "MEDIUM" : "LOW";
  const dependencySource = revenueMix.find((item) => item.percentage === maxPercentage)?.source;

  const forecasts = [
    { period: "30 Days", amount: "$1,200", change: "+12%" },
    { period: "90 Days", amount: "$3,800", change: "+18%" },
    { period: "365 Days", amount: "$16,500", change: "+22%" },
  ];

  const recommendations: string[] = [];
  if (revenueMix[1].percentage > 60)
    recommendations.push("Your revenue is heavily dependent on third-party platforms. Add BAP streaming to reduce platform risk.");
  if (revenueMix[2].percentage < 10)
    recommendations.push("You have minimal merch revenue. Launch products to diversify income streams.");
  if (activeLoans && activeLoans.length > 0) {
    const loanToRevenue = (parseInt(activeLoans[0]?.remainingBalance || "0") / (totalRevenue || 1)) * 100;
    if (loanToRevenue > 40)
      recommendations.push("Your loan-to-revenue ratio is high. Focus on reducing dependency on advances.");
  }
  if (revenueMix[4].percentage < 5)
    recommendations.push("Live events generate minimal revenue. Consider adding tour dates or virtual performances.");

  const stats = [
    { title: "Total Earnings", value: totalRevenue ? formatCurrency(totalRevenue) : "$0.00" },
    { title: "Diversification Score", value: `${diversificationScore}/100` },
    { title: "Active Loans", value: activeLoans?.length || 0 },
    { title: "Dependency Risk", value: dependencyRisk },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase">Revenue</h1>
          <p className="text-xl font-medium mt-3 text-gray-600">
            Independent Revenue Orchestrator — Maximize artist-owned revenue share
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-4 border-4 border-black">
          {stats.map((stat, idx) => (
            <div
              key={stat.title}
              className={`p-6 bg-white ${idx < stats.length - 1 ? "border-r-4 border-black" : ""} ${idx < 2 ? "lg:border-b-0 border-b-4 border-black" : ""} md:border-b-0`}
            >
              <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">{stat.title}</div>
              <div className="text-4xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Dependency Risk Alert */}
        {dependencyRisk !== "LOW" && (
          <Card className="rounded-none border-4 border-black bg-gray-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 uppercase">{dependencyRisk} Dependency Risk Detected</h3>
                  <p className="text-gray-700 font-medium">
                    {maxPercentage}% of your revenue comes from {dependencySource}. Diversify your income streams to reduce
                    platform dependency and increase long-term stability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Mix */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-2xl font-bold uppercase">Revenue Mix</CardTitle>
            <CardDescription className="text-white/90 font-medium">Diversification across income streams</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              {revenueMix.map((item) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm uppercase">{item.source}</span>
                    <span className="font-bold text-lg">
                      ${item.amount.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-8 bg-gray-200 border border-gray-200">
                    <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t-4 border-black">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg uppercase">Total Revenue</span>
                <span className="font-bold text-3xl">${totalMixRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Forecasts */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-2xl font-bold uppercase">Revenue Forecasts</CardTitle>
            <CardDescription className="text-white/90 font-medium">Projected earnings based on current revenue mix</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {forecasts.map((forecast) => (
                <div key={forecast.period} className="p-6 border-4 border-black bg-white">
                  <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">{forecast.period}</div>
                  <div className="text-3xl font-bold font-mono mb-1">{forecast.amount}</div>
                  <div className="text-sm font-bold text-gray-700">{forecast.change} growth</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="rounded-none border-4 border-black">
            <CardHeader className="bg-black text-white">
              <CardTitle className="text-2xl font-bold uppercase">Recommendations</CardTitle>
              <CardDescription className="text-white/90 font-medium">Actions to reduce dependency and increase AORS</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 bg-gray-50">
                  <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{idx + 1}</span>
                  </div>
                  <p className="font-medium text-gray-800 flex-1">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="earnings" className="space-y-4">
          <TabsList className="rounded-none border-4 border-black bg-white">
            <TabsTrigger value="earnings" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="loans" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">
              Micro-Loans
            </TabsTrigger>
            <TabsTrigger value="tips" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-bold uppercase">Revenue Breakdown</CardTitle>
                <CardDescription className="text-white/90 font-medium">Your earnings across all revenue streams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueBySource && revenueBySource.length > 0 ? (
                  revenueBySource.map((source: any) => (
                    <div key={source.source} className="flex items-center justify-between p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-black flex items-center justify-center">
                          <span className="text-white text-xl">$</span>
                        </div>
                        <div>
                          <p className="font-bold capitalize">{source.source}</p>
                          <p className="text-sm text-gray-600 font-medium">{source.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl">{formatCurrency(source.total)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                      <span className="text-gray-400 text-5xl">$</span>
                    </div>
                    <p className="font-medium">No earnings yet. Upload music to start earning!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold uppercase">Payout History</CardTitle>
                    <CardDescription className="text-white/90 font-medium">Your recent payouts and pending payments</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.hash = "#withdraw")}
                    className="bg-white text-black hover:bg-gray-100 rounded-none border-2 border-white font-bold"
                  >
                    Withdraw Funds
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <DollarSign className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="font-medium">No payout history yet</p>
                  <p className="text-sm mt-2">Use the Withdraw tab to request your first payout</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="space-y-6">
            {/* Balance Cards */}
            <div className="grid gap-0 md:grid-cols-3 border-4 border-black">
              {[
                { label: "Available to Withdraw", value: `$${availableUSD}`, accent: true },
                { label: "Pending Clearance", value: `$${pendingUSD}`, accent: false },
                { label: "Total Earned (All Time)", value: `$${totalEarnedUSD}`, accent: false },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`p-6 ${item.accent ? "bg-black text-white" : "bg-white"} ${i < 2 ? "border-r-4 border-black" : ""}`}
                >
                  <div className="text-xs font-bold tracking-wider uppercase mb-2 opacity-60">{item.label}</div>
                  <div className="text-4xl font-bold font-mono">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Stripe Connect Status Warning */}
            {!accountStatus?.payoutsEnabled && (
              <Card className="rounded-none border-4 border-black bg-yellow-50">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-yellow-900 uppercase">Bank Account Required</p>
                    <p className="text-yellow-800 text-sm mt-1">
                      Connect your bank account via Stripe to enable withdrawals. This is a one-time setup that takes about 5 minutes.
                    </p>
                    <Button
                      className="mt-3 rounded-none border-2 border-black bg-black text-white hover:bg-gray-800 font-bold uppercase"
                      onClick={() => (window.location.href = "/artist/payout")}
                    >
                      Connect Bank <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payout Request Form */}
            {accountStatus?.payoutsEnabled && (
              <Card className="rounded-none border-4 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-bold uppercase">Request Withdrawal</CardTitle>
                  <CardDescription className="text-white/80 font-medium">
                    Funds transfer directly to your connected bank account via Stripe
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase text-xs tracking-wider">Amount (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                        <Input
                          type="number"
                          min="20"
                          step="0.01"
                          placeholder="20.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-7 rounded-none border-2 border-black font-mono text-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Minimum: $20.00 &nbsp;|&nbsp; Available: ${availableUSD}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold uppercase text-xs tracking-wider">Speed</Label>
                      <Select value={payoutType} onValueChange={(v) => setPayoutType(v as "standard" | "instant")}>
                        <SelectTrigger className="rounded-none border-2 border-black font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-2 border-black">
                          <SelectItem value="standard" className="font-medium">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Standard — Next business day (Free)
                            </div>
                          </SelectItem>
                          <SelectItem value="instant" className="font-medium">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              Instant — Within 1 hour (1% fee)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fee breakdown */}
                  {withdrawAmount && parseFloat(withdrawAmount) >= 20 && (
                    <div className="border-2 border-black p-4 bg-gray-50">
                      <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Withdrawal amount</span>
                          <span className="font-mono">${parseFloat(withdrawAmount).toFixed(2)}</span>
                        </div>
                        {payoutType === "instant" && feeCalc && (
                          <div className="flex justify-between text-red-600">
                            <span>Instant payout fee (1%)</span>
                            <span className="font-mono">-${(feeCalc.fee / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t-2 border-black pt-2 font-bold text-base">
                          <span>You receive</span>
                          <span className="font-mono">
                            ${payoutType === "instant" && feeCalc
                              ? (feeCalc.netAmount / 100).toFixed(2)
                              : parseFloat(withdrawAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleWithdraw}
                    disabled={
                      requestPayoutMutation.isPending ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) < 20
                    }
                    className="w-full rounded-none border-4 border-black bg-black text-white hover:bg-gray-800 font-bold uppercase text-base py-6"
                  >
                    {requestPayoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Withdraw Funds
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Funds are transferred via Stripe directly to your connected bank. Boptone never holds your money.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Withdrawal History */}
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold uppercase">Withdrawal History</CardTitle>
                    <CardDescription className="text-white/80 font-medium">Your recent payout requests</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      refetchBalance();
                      refetchHistory();
                    }}
                    className="bg-white text-black hover:bg-gray-100 rounded-none border-2 border-white font-bold"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!payoutHistory || payoutHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No withdrawals yet</p>
                    <p className="text-sm mt-1">Your payout history will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-black">
                    {payoutHistory.map((payout: any) => (
                      <div key={payout.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                            {payout.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : payout.status === "processing" ? (
                              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold font-mono">{formatCurrency(payout.netAmount)}</span>
                              {getStatusBadge(payout.status)}
                              {payout.payoutType === "instant" && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
                                  <Zap className="w-3 h-3 inline mr-0.5" />
                                  Instant
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(payout.requestedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {payout.externalPayoutId && (
                                <span className="ml-2 font-mono opacity-50">
                                  {payout.externalPayoutId.slice(0, 12)}...
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {payout.fee > 0 && (
                            <p className="text-xs text-gray-400">Fee: {formatCurrency(payout.fee)}</p>
                          )}
                          {payout.estimatedArrival && payout.status !== "completed" && (
                            <p className="text-xs text-gray-500">
                              Est.{" "}
                              {new Date(payout.estimatedArrival).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Micro-Loans Tab */}
          <TabsContent value="loans" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-bold uppercase">Loan Eligibility</CardTitle>
                <CardDescription className="text-white/90 font-medium">Get funding based on your royalty earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eligibility?.eligible ? (
                  <>
                    <div className="flex items-center gap-2 p-4 bg-gray-100 border border-gray-200">
                      <span className="text-2xl">✓</span>
                      <span className="font-bold">You're eligible for a micro-loan!</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount" className="font-bold">
                        Loan Amount ($50 - $750)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="loanAmount"
                          type="number"
                          min="50"
                          max="750"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="rounded-none border border-gray-200"
                        />
                        <Button
                          className="rounded-full bg-black hover:bg-gray-800 font-bold uppercase"
                          onClick={handleApplyForLoan}
                          disabled={applyForLoanMutation.isPending}
                        >
                          {applyForLoanMutation.isPending ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        • 5% origination fee • 15% automatic repayment from royalties
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-gray-100 border border-gray-200">
                    <span className="text-2xl">⚠</span>
                    <span className="font-medium">
                      {eligibility?.reasons?.[0] || "You need at least $50 in earnings to qualify"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {activeLoans && activeLoans.length > 0 && (
              <Card className="rounded-none border-4 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-bold uppercase">Active Loans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200">
                      <div>
                        <p className="font-bold text-xl">{formatCurrency(parseInt(loan.approvedAmount || "0"))}</p>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatCurrency(parseInt(loan.remainingBalance || "0"))} remaining
                        </p>
                      </div>
                      <Badge
                        variant={loan.status === "active" ? "default" : "secondary"}
                        className="rounded-none border border-gray-200 bg-black text-white font-bold uppercase"
                      >
                        {loan.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-bold uppercase">Loan History</CardTitle>
              </CardHeader>
              <CardContent>
                {loanHistory && loanHistory.length > 0 ? (
                  <div className="space-y-2">
                    {loanHistory.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-3 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black flex items-center justify-center">
                            <span className="text-white text-sm font-bold">$</span>
                          </div>
                          <div>
                            <p className="font-bold">{formatCurrency(parseInt(loan.approvedAmount || "0"))}</p>
                            <p className="text-sm text-gray-600 font-medium">
                              {new Date(loan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={loan.status === "repaid" ? "default" : "secondary"}
                          className="rounded-none border border-gray-200 bg-black text-white font-bold uppercase"
                        >
                          {loan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                      <span className="text-gray-400 text-2xl font-bold">LOANS</span>
                    </div>
                    <p className="font-medium">No loan history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-bold uppercase">Fan Tips</CardTitle>
                <CardDescription className="text-white/90 font-medium">Direct support from your fans via Kick In</CardDescription>
              </CardHeader>
              <CardContent>
                {tips && tips.length > 0 ? (
                  <div className="space-y-3">
                    {tips.map((tip: any) => (
                      <div key={tip.id} className="flex items-center justify-between p-3 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black flex items-center justify-center">
                            <span className="text-white text-sm font-bold">TIP</span>
                          </div>
                          <div>
                            <p className="font-bold">{tip.fanName || "Anonymous"}</p>
                            <p className="text-sm text-gray-600 font-medium">
                              {new Date(tip.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-xl">{formatCurrency(tip.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                      <span className="text-gray-400 text-2xl font-bold">TIPS</span>
                    </div>
                    <p className="font-medium">No tips yet</p>
                    <p className="text-sm mt-2">Share your Kick In link to receive support from fans</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
