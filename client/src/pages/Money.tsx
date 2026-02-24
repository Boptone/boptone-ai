import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Money() {
  const { user } = useAuth();
  const [loanAmount, setLoanAmount] = useState("");
  
  // Earnings data
  const { data: totalRevenue } = trpc.revenue.getTotal.useQuery({});
  // Revenue by source not yet implemented
  const revenueBySource: any[] = [];
  
  // Micro-loans data
  const { data: eligibility } = trpc.microloans.checkEligibility.useQuery();
  const { data: activeLoans } = trpc.microloans.getMyLoans.useQuery();
  const loanHistory = activeLoans?.filter((loan) => loan.status !== "active") || [];
  
  // Kick In (tips) data
  const { data: tips } = trpc.kickin.getTips.useQuery({ limit: 50 });
  
  const applyForLoanMutation = trpc.microloans.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Loan application submitted!");
      setLoanAmount("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
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
      purposeDescription: "Music production funding"
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Mock revenue mix data (TODO: Replace with real data from backend)
  const revenueMix = [
    { source: "BAP Streams", amount: 1250, percentage: 35, color: "bg-black" },
    { source: "Third-Party Distribution", amount: 1500, percentage: 42, color: "bg-gray-700" },
    { source: "Merch & Products", amount: 450, percentage: 13, color: "bg-gray-500" },
    { source: "Fan Tips", amount: 200, percentage: 6, color: "bg-gray-400" },
    { source: "Live Events", amount: 150, percentage: 4, color: "bg-gray-300" },
  ];

  const totalMixRevenue = revenueMix.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate diversification score (0-100, where 100 = perfectly balanced)
  const maxPercentage = Math.max(...revenueMix.map(item => item.percentage));
  const diversificationScore = Math.round(100 - (maxPercentage - 20)); // 20% would be perfect balance for 5 sources
  
  // Dependency risk check
  const dependencyRisk = maxPercentage > 60 ? "HIGH" : maxPercentage > 40 ? "MEDIUM" : "LOW";
  const dependencySource = revenueMix.find(item => item.percentage === maxPercentage)?.source;

  // Revenue forecasts (mock data - TODO: Replace with real forecasting logic)
  const forecasts = [
    { period: "30 Days", amount: "$1,200", change: "+12%" },
    { period: "90 Days", amount: "$3,800", change: "+18%" },
    { period: "365 Days", amount: "$16,500", change: "+22%" },
  ];

  // Actionable recommendations based on revenue mix
  const recommendations = [];
  if (revenueMix[1].percentage > 60) {
    recommendations.push("Your revenue is heavily dependent on third-party platforms. Add BAP streaming to reduce platform risk.");
  }
  if (revenueMix[2].percentage < 10) {
    recommendations.push("You have minimal merch revenue. Launch products to diversify income streams.");
  }
  if (activeLoans && activeLoans.length > 0) {
    const loanToRevenue = (parseInt(activeLoans[0]?.remainingBalance || "0") / (totalRevenue || 1)) * 100;
    if (loanToRevenue > 40) {
      recommendations.push("Your loan-to-revenue ratio is high. Focus on reducing dependency on advances.");
    }
  }
  if (revenueMix[4].percentage < 5) {
    recommendations.push("Live events generate minimal revenue. Consider adding tour dates or virtual performances.");
  }

  const stats = [
    {
      title: "Total Earnings",
      value: totalRevenue ? formatCurrency(totalRevenue) : "$0.00",
    },
    {
      title: "Diversification Score",
      value: `${diversificationScore}/100`,
    },
    {
      title: "Active Loans",
      value: activeLoans?.length || 0,
    },
    {
      title: "Dependency Risk",
      value: dependencyRisk,
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase">Revenue</h1>
          <p className="text-xl font-medium mt-3 text-gray-600">
            Independent Revenue Orchestrator - Maximize artist-owned revenue share
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-4 border-4 border-black">
          {stats.map((stat, idx) => (
            <div 
              key={stat.title} 
              className={`p-6 bg-white ${idx < stats.length - 1 ? 'border-r-4 border-black' : ''} ${idx < 2 ? 'lg:border-b-0 border-b-4 border-black' : ''} md:border-b-0`}
            >
              <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                {stat.title}
              </div>
              <div className="text-4xl font-bold font-mono">
                {stat.value}
              </div>
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
                  <h3 className="text-xl font-bold mb-2 uppercase">
                    {dependencyRisk} Dependency Risk Detected
                  </h3>
                  <p className="text-gray-700 font-medium">
                    {maxPercentage}% of your revenue comes from {dependencySource}. This creates a single-point-of-failure risk.
                    Diversify your income streams to reduce platform dependency and increase long-term stability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Mix Visualization */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-2xl font-bold uppercase">Revenue Mix</CardTitle>
            <CardDescription className="text-white/90 font-medium">
              Diversification across income streams
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Visual bar chart */}
            <div className="space-y-4">
              {revenueMix.map((item) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm uppercase">{item.source}</span>
                    <span className="font-bold text-lg">${item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-8 bg-gray-200 border border-gray-200">
                    <div 
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
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
            <CardDescription className="text-white/90 font-medium">
              Projected earnings based on current revenue mix
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {forecasts.map((forecast) => (
                <div key={forecast.period} className="p-6 border-4 border-black bg-white">
                  <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                    {forecast.period}
                  </div>
                  <div className="text-3xl font-bold font-mono mb-1">{forecast.amount}</div>
                  <div className="text-sm font-bold text-gray-700">{forecast.change} growth</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Recommendations */}
        {recommendations.length > 0 && (
          <Card className="rounded-none border-4 border-black">
            <CardHeader className="bg-black text-white">
              <CardTitle className="text-2xl font-bold uppercase">Recommendations</CardTitle>
              <CardDescription className="text-white/90 font-medium">
                Actions to reduce dependency and increase AORS
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 bg-gray-50">
                  <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{idx + 1}</span>
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
            <TabsTrigger value="earnings" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">Earnings</TabsTrigger>
            <TabsTrigger value="loans" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">Micro-Loans</TabsTrigger>
            <TabsTrigger value="tips" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">Tips</TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-bold uppercase">Revenue Breakdown</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Your earnings across all revenue streams
                </CardDescription>
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
                          <p className="text-sm text-gray-600 font-medium">
                            {source.count} transactions
                          </p>
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
                    <CardDescription className="text-white/90 font-medium">
                      Your recent payouts and pending payments
                    </CardDescription>
                  </div>
                  <a href="/payouts/history">
                    <Button variant="outline" className="bg-white text-black hover:bg-gray-100 rounded-full border border-white font-bold">
                      View Full History
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <span className="text-gray-400 text-2xl font-bold">DATE</span>
                  </div>
                  <p className="font-medium">No payout history yet</p>
                  <p className="text-sm mt-2">Payouts are processed monthly when you reach $50</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Micro-Loans Tab */}
          <TabsContent value="loans" className="space-y-4">
            {/* Eligibility Card */}
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-bold uppercase">Loan Eligibility</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Get funding based on your royalty earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eligibility?.eligible ? (
                  <>
                    <div className="flex items-center gap-2 p-4 bg-gray-100 border border-gray-200">
                      <span className="text-2xl">✓</span>
                      <span className="font-bold">You're eligible for a micro-loan!</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount" className="font-bold">Loan Amount ($50 - $750)</Label>
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

            {/* Active Loans */}
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

            {/* Loan History */}
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
                <CardDescription className="text-white/90 font-medium">
                  Direct support from your fans via Kick In
                </CardDescription>
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
                        <p className="font-bold text-xl">
                          {formatCurrency(tip.amount)}
                        </p>
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
