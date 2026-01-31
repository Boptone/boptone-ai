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
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Heart,
  Download,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";

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
      title: "Your Earnings",
      value: totalRevenue ? formatCurrency(totalRevenue) : "$0.00",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "This Month's Earnings",
      value: "$0.00", // TODO: Add monthly revenue query
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Your Active Loans",
      value: activeLoans?.length || 0,
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Your Tips",
      value: tips?.length || 0,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">YOUR MONEY</h1>
          <p className="text-xl font-bold mt-3">
            TRACK YOUR EARNINGS, MANAGE LOANS, AND VIEW FAN SUPPORT
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-4 border-4 border-black">
          {stats.map((stat, idx) => (
            <div key={stat.title} className={`p-6 bg-white ${idx < stats.length - 1 ? 'border-r-4 border-black' : ''} ${idx < 2 ? 'lg:border-b-0 border-b-4' : ''} md:border-b-0`}>
              <div className="text-xs font-black uppercase tracking-wider mb-2">
                {stat.title}
              </div>
              <div className="text-4xl font-black font-mono" style={{ color: '#4285F4' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="earnings" className="space-y-4">
          <TabsList className="rounded-none border-2 border-black bg-white">
            <TabsTrigger value="earnings" className="rounded-none font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white">EARNINGS</TabsTrigger>
            <TabsTrigger value="loans" className="rounded-none font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white">MICRO-LOANS</TabsTrigger>
            <TabsTrigger value="tips" className="rounded-none font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white">TIPS</TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-black uppercase">REVENUE BREAKDOWN</CardTitle>
                <CardDescription className="text-white/80 font-bold">
                  YOUR EARNINGS ACROSS ALL REVENUE STREAMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueBySource && revenueBySource.length > 0 ? (
                  revenueBySource.map((source: any) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{source.source}</p>
                          <p className="text-sm text-muted-foreground">
                            {source.count} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(source.total)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No earnings yet. Upload music to start earning!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-black uppercase">PAYOUT HISTORY</CardTitle>
                <CardDescription className="text-white/80 font-bold">
                  YOUR RECENT PAYOUTS AND PENDING PAYMENTS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payout history yet</p>
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
                <CardTitle className="text-2xl font-black uppercase">LOAN ELIGIBILITY</CardTitle>
                <CardDescription className="text-white/80 font-bold">
                  GET FUNDING BASED ON YOUR ROYALTY EARNINGS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eligibility?.eligible ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">You're eligible for a micro-loan!</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Loan Amount ($50 - $750)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="loanAmount"
                          type="number"
                          min="50"
                          max="750"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                        <Button 
                          onClick={handleApplyForLoan}
                          disabled={applyForLoanMutation.isPending}
                          className="rounded-none font-black"
                          style={{ backgroundColor: '#4285F4' }}
                        >
                          {applyForLoanMutation.isPending ? "APPLYING..." : "APPLY"}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        • 5% origination fee • 15% automatic repayment from royalties
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
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
                  <CardTitle className="text-2xl font-black uppercase">ACTIVE LOANS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border-2 border-black">
                      <div>
                        <p className="font-medium">{formatCurrency(parseInt(loan.approvedAmount || "0"))}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(parseInt(loan.remainingBalance || "0"))} remaining
                        </p>
                      </div>
                      <Badge variant={loan.status === "active" ? "default" : "secondary"}>
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
                <CardTitle className="text-2xl font-black uppercase">LOAN HISTORY</CardTitle>
              </CardHeader>
              <CardContent>
                {loanHistory && loanHistory.length > 0 ? (
                  <div className="space-y-2">
                    {loanHistory.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-3 border-2 border-black">
                        <div className="flex items-center gap-3">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{formatCurrency(parseInt(loan.approvedAmount || "0"))}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(loan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={loan.status === "repaid" ? "default" : "secondary"}>
                          {loan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No loan history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fan Tips</CardTitle>
                <CardDescription>
                  Direct support from your fans via Kick In
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tips && tips.length > 0 ? (
                  <div className="space-y-3">
                    {tips.map((tip: any) => (
                      <div key={tip.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Heart className="h-4 w-4 text-pink-500" />
                          <div>
                            <p className="font-medium">{tip.fanName || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tip.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-pink-600">
                          {formatCurrency(tip.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tips yet</p>
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
