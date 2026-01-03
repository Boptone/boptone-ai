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
      title: "Total Earnings",
      value: totalRevenue ? formatCurrency(totalRevenue) : "$0.00",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "This Month",
      value: "$0.00", // TODO: Add monthly revenue query
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Loans",
      value: activeLoans?.length || 0,
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Tips Received",
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money</h1>
          <p className="text-muted-foreground">
            Track your earnings, manage loans, and view fan support
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="earnings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="loans">Micro-Loans</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Your earnings across all revenue streams
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

            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Your recent payouts and pending payments
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
            <Card>
              <CardHeader>
                <CardTitle>Loan Eligibility</CardTitle>
                <CardDescription>
                  Get funding based on your royalty earnings
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
                        >
                          {applyForLoanMutation.isPending ? "Applying..." : "Apply"}
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
              <Card>
                <CardHeader>
                  <CardTitle>Active Loans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
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
            <Card>
              <CardHeader>
                <CardTitle>Loan History</CardTitle>
              </CardHeader>
              <CardContent>
                {loanHistory && loanHistory.length > 0 ? (
                  <div className="space-y-2">
                    {loanHistory.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-3 border rounded">
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
