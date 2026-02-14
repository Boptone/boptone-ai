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

  const stats = [
    {
      title: "Total Earnings",
      value: totalRevenue ? formatCurrency(totalRevenue) : "$0.00",
    },
    {
      title: "This Month",
      value: "$0.00", // TODO: Add monthly revenue query
    },
    {
      title: "Active Loans",
      value: activeLoans?.length || 0,
    },
    {
      title: "Fan Tips",
      value: tips?.length || 0,
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase">Revenue</h1>
          <p className="text-xl font-medium mt-3 text-gray-600">
            Track earnings, manage loans, and view fan support
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
              <div className="text-4xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

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
                    <div key={source.source} className="flex items-center justify-between p-4 border-2 border-gray-300">
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
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
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
                    <Button variant="outline" className="bg-white text-black hover:bg-gray-100 rounded-none border-2 border-white font-bold">
                      View Full History
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
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
                    <div className="flex items-center gap-2 p-4 bg-gray-100 border-2 border-black">
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
                          className="rounded-none border-2 border-black"
                        />
                        <Button 
                          className="rounded-none bg-black hover:bg-gray-800 font-bold uppercase" 
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
                  <div className="flex items-center gap-2 p-4 bg-gray-100 border-2 border-black">
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
                    <div key={loan.id} className="flex items-center justify-between p-4 border-2 border-black">
                      <div>
                        <p className="font-bold text-xl">{formatCurrency(parseInt(loan.approvedAmount || "0"))}</p>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatCurrency(parseInt(loan.remainingBalance || "0"))} remaining
                        </p>
                      </div>
                      <Badge 
                        variant={loan.status === "active" ? "default" : "secondary"}
                        className="rounded-none border-2 border-black bg-black text-white font-bold uppercase"
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
                      <div key={loan.id} className="flex items-center justify-between p-3 border-2 border-black">
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
                          className="rounded-none border-2 border-black bg-black text-white font-bold uppercase"
                        >
                          {loan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
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
                      <div key={tip.id} className="flex items-center justify-between p-3 border-2 border-black">
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
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
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
