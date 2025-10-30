import { useAuth } from "@/_core/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, CreditCard, PiggyBank, ArrowLeft, Loader2, Plus, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Financials() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  
  const { data: totalRevenue } = trpc.revenue.getTotal.useQuery({}, {
    enabled: !isDemoMode
  });
  const { data: revenueRecords, refetch: refetchRevenue } = trpc.revenue.getAll.useQuery({}, {
    enabled: !isDemoMode
  });
  const { data: loans, refetch: refetchLoans } = trpc.loans.getAll.useQuery({}, {
    enabled: !isDemoMode
  });
  
  const applyForLoan = trpc.loans.applyForLoan.useMutation({
    onSuccess: () => {
      toast.success("Loan application submitted successfully!");
      setIsLoanDialogOpen(false);
      refetchLoans();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply for loan");
    },
  });

  const [loanApplication, setLoanApplication] = useState({
    amount: "",
    repaymentTermMonths: "12",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  const handleApplyForLoan = () => {
    const amountInCents = Math.round(parseFloat(loanApplication.amount) * 100);
    const term = parseInt(loanApplication.repaymentTermMonths);

    applyForLoan.mutate({
      amount: amountInCents,
      repaymentTermMonths: term,
    });
  };

  const revenueBySource = revenueRecords?.reduce((acc, record) => {
    const source = record.source;
    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source] += record.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const stats = [
    {
      title: "Total Revenue",
      value: `$${((totalRevenue || 0) / 100).toLocaleString()}`,
      change: "+12.5% from last month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Streaming Income",
      value: `$${((revenueBySource.streaming || 0) / 100).toLocaleString()}`,
      change: "This month",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Merch Sales",
      value: `$${((revenueBySource.merchandise || 0) / 100).toLocaleString()}`,
      change: "This month",
      icon: PiggyBank,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Loans",
      value: loans?.filter((l) => l.status === "active").length || 0,
      change: `$${((loans?.filter((l) => l.status === "active").reduce((sum, l) => sum + (l.remainingBalance || 0), 0) || 0) / 100).toLocaleString()} remaining`,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const revenueSourceLabels: Record<string, string> = {
    streaming: "Streaming",
    merchandise: "Merchandise",
    shows: "Live Shows",
    licensing: "Licensing",
    brand_deals: "Brand Deals",
    youtube_ads: "YouTube Ads",
    patreon: "Patreon",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Financial Dashboard</h1>
                <p className="text-sm text-muted-foreground">Track revenue and manage financing</p>
              </div>
            </div>
            <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Micro-Loan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Royalty-Backed Micro-Loan</DialogTitle>
                  <DialogDescription>
                    Access capital using your future royalties as collateral
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium">How it works:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>AI-powered risk assessment</li>
                          <li>5% fixed interest rate</li>
                          <li>Repayment from future royalties</li>
                          <li>No credit check required</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="100"
                      value={loanApplication.amount}
                      onChange={(e) => setLoanApplication({ ...loanApplication, amount: e.target.value })}
                      placeholder="5000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 50% of your annual revenue
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Repayment Term</Label>
                    <Select
                      value={loanApplication.repaymentTermMonths}
                      onValueChange={(value) => setLoanApplication({ ...loanApplication, repaymentTermMonths: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {loanApplication.amount && (
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Loan Amount:</span>
                        <span className="font-medium">${parseFloat(loanApplication.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Interest (5%):</span>
                        <span className="font-medium">${(parseFloat(loanApplication.amount) * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Total Repayment:</span>
                        <span className="font-bold">${(parseFloat(loanApplication.amount) * 1.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <span className="font-medium">
                          ${((parseFloat(loanApplication.amount) * 1.05) / parseInt(loanApplication.repaymentTermMonths)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLoanDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApplyForLoan}
                    disabled={!loanApplication.amount || applyForLoan.isPending}
                  >
                    {applyForLoan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Submit Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>Your income streams this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueBySource).map(([source, amount]) => {
                  const percentage = totalRevenue ? (amount / totalRevenue) * 100 : 0;
                  return (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{revenueSourceLabels[source] || source}</span>
                        <span className="text-muted-foreground">
                          ${(amount / 100).toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(revenueBySource).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No revenue data yet. Start tracking your income!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Loans */}
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>Your royalty-backed financing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loans && loans.filter((l) => l.status === "active").length > 0 ? (
                  loans
                    .filter((l) => l.status === "active")
                    .map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              ${(loan.amount / 100).toLocaleString()} Loan
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {loan.interestRate}% interest • {loan.repaymentTermMonths} months
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-medium">
                              ${((loan.remainingBalance || 0) / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <span className="font-medium">
                              ${((loan.monthlyPayment || 0) / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-chart-3 transition-all"
                              style={{
                                width: `${((loan.amount - (loan.remainingBalance || 0)) / loan.amount) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(((loan.amount - (loan.remainingBalance || 0)) / loan.amount) * 100).toFixed(1)}% repaid
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No active loans</p>
                    <Button variant="outline" size="sm" onClick={() => setIsLoanDialogOpen(true)}>
                      Apply for Financing
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest revenue entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueRecords && revenueRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {revenueSourceLabels[record.source] || record.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +${(record.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!revenueRecords || revenueRecords.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
