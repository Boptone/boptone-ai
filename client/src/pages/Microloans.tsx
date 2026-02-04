import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  FileText,
  Wallet,
  ArrowRight,
  Info,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const LOAN_PURPOSES = [
  { value: "emergency", label: "Emergency Fund", description: "Unexpected expenses, bills, or urgent needs" },
  { value: "production", label: "Production Costs", description: "Studio time, mixing, mastering, or session musicians" },
  { value: "marketing", label: "Marketing Campaign", description: "Ads, PR, playlist pitching, or content creation" },
  { value: "equipment", label: "Equipment", description: "Instruments, gear, software, or hardware" },
  { value: "other", label: "Other", description: "Other career-related expenses" }
];

export default function Microloans() {
  const { user, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState<number>(250);
  const [purpose, setPurpose] = useState<string>("");
  const [purposeDescription, setPurposeDescription] = useState("");
  const [activeTab, setActiveTab] = useState("apply");

  // Queries
  const eligibilityQuery = trpc.microloans.checkEligibility.useQuery(undefined, {
    enabled: isAuthenticated
  });
  const activeLoanQuery = trpc.microloans.getActiveLoan.useQuery(undefined, {
    enabled: isAuthenticated
  });
  const loansQuery = trpc.microloans.getMyLoans.useQuery(undefined, {
    enabled: isAuthenticated
  });
  const statsQuery = trpc.microloans.getStats.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Mutations
  const applyMutation = trpc.microloans.submitApplication.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Loan application submitted!", {
          description: `Your loan of $${amount.toFixed(2)} is being processed. Total to repay: $${data.totalOwed.toFixed(2)}`
        });
        eligibilityQuery.refetch();
        activeLoanQuery.refetch();
        loansQuery.refetch();
        statsQuery.refetch();
        setActiveTab("active");
      }
    },
    onError: (error) => {
      toast.error("Application failed", {
        description: error.message
      });
    }
  });

  const handleApply = () => {
    if (!purpose) {
      toast.error("Please select a purpose for your loan");
      return;
    }
    if (amount < 50 || amount > 750) {
      toast.error("Loan amount must be between $50 and $750");
      return;
    }
    applyMutation.mutate({
      amount,
      purpose: purpose as "emergency" | "production" | "marketing" | "equipment" | "other",
      purposeDescription: purposeDescription || undefined
    });
  };

  const eligibility = eligibilityQuery.data as {
    eligible: boolean;
    maxAmount?: number;
    monthlyEarningsAvg?: number;
    accountAgeMonths?: number;
    riskScore?: number;
    hasActiveLoan?: boolean;
    reasons?: string[];
  } | null;
  const activeLoan = activeLoanQuery.data;
  const loans = loansQuery.data || [];
  const stats = statsQuery.data;

  const calculateOriginationFee = (amt: number) => amt * 0.05;
  const calculateTotalOwed = (amt: number) => amt + calculateOriginationFee(amt);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><TrendingUp className="w-3 h-3 mr-1" /> Active</Badge>;
      case "repaid":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><CheckCircle className="w-3 h-3 mr-1" /> Repaid</Badge>;
      case "defaulted":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Defaulted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artist Micro-Loans</h1>
          <p className="text-muted-foreground mt-1">
            Quick funding up to $750, repaid automatically from your royalties
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalBorrowed?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRepaid?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeLoans || 0}</div>
              <p className="text-xs text-muted-foreground">Current</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedLoans || 0}</div>
              <p className="text-xs text-muted-foreground">Fully repaid</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
            <TabsTrigger value="active">Active Loan</TabsTrigger>
            <TabsTrigger value="history">Loan History</TabsTrigger>
          </TabsList>

          {/* Apply Tab */}
          <TabsContent value="apply" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Application Form */}
              <Card>
                <CardHeader>
                  <CardTitle>New Loan Application</CardTitle>
                  <CardDescription>
                    Request up to $750 with a 5% origination fee
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activeLoan ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Active Loan</AlertTitle>
                      <AlertDescription>
                        You have an active loan of ${activeLoan.approvedAmount}. 
                        Please repay it before applying for a new one.
                      </AlertDescription>
                    </Alert>
                  ) : !eligibility?.eligible ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Not Eligible</AlertTitle>
                      <AlertDescription>
                        {eligibility?.reasons?.join(". ") || "You're not currently eligible for a loan."}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Loan Amount</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="amount"
                            type="number"
                            min={50}
                            max={Math.min(750, eligibility?.maxAmount || 750)}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">
                            Max: ${Math.min(750, eligibility?.maxAmount || 750)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={Math.min(750, eligibility?.maxAmount || 750)}
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Select value={purpose} onValueChange={setPurpose}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            {LOAN_PURPOSES.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                <div>
                                  <div className="font-medium">{p.label}</div>
                                  <div className="text-xs text-muted-foreground">{p.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Additional Details (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Tell us more about how you'll use this loan..."
                          value={purposeDescription}
                          onChange={(e) => setPurposeDescription(e.target.value)}
                        />
                      </div>

                      <Separator />

                      {/* Loan Summary */}
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold">Loan Summary</h4>
                        <div className="flex justify-between text-sm">
                          <span>Loan Amount</span>
                          <span>${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Origination Fee (5%)</span>
                          <span>${calculateOriginationFee(amount).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total to Repay</span>
                          <span>${calculateTotalOwed(amount).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          15% of your earnings will be automatically deducted until repaid
                        </p>
                      </div>

                      <Button className="rounded-full w-full" onClick={handleApply}
                        disabled={applyMutation.isPending || !purpose}
                      >
                        {applyMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How Micro-Loans Work</CardTitle>
                  <CardDescription>
                    Simple, transparent funding for artists
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Apply Instantly</h4>
                        <p className="text-sm text-muted-foreground">
                          Request up to $750 based on your earnings history. 
                          No credit checks, no paperwork.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Get Approved</h4>
                        <p className="text-sm text-muted-foreground">
                          Approval is based on your Boptone earnings. 
                          5% origination fee, no hidden charges.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Automatic Repayment</h4>
                        <p className="text-sm text-muted-foreground">
                          15% of your BAP streams, Kick In tips, and backer payments 
                          go toward repayment automatically.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Build Credit</h4>
                        <p className="text-sm text-muted-foreground">
                          Successful repayment increases your future loan limit 
                          and unlocks better terms.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Eligibility Requirements</AlertTitle>
                    <AlertDescription className="text-sm">
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Active artist profile on Boptone</li>
                        <li>At least $50 in lifetime earnings</li>
                        <li>No currently active loans</li>
                        <li>Account in good standing</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Loan Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeLoan ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Loan</CardTitle>
                      <CardDescription>
                        Applied on {new Date(activeLoan.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(activeLoan.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                      <p className="text-2xl font-bold">${activeLoan.approvedAmount}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Repaid</p>
                      <p className="text-2xl font-bold text-green-600">${activeLoan.totalRepaid}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${(parseFloat(activeLoan.totalOwed || "0") - parseFloat(activeLoan.totalRepaid || "0")).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Repayment Progress</span>
                      <span>
                        {((parseFloat(activeLoan.totalRepaid || "0") / parseFloat(activeLoan.totalOwed || "1")) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(parseFloat(activeLoan.totalRepaid || "0") / parseFloat(activeLoan.totalOwed || "1")) * 100} 
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Purpose</p>
                      <p className="text-sm text-muted-foreground capitalize">{activeLoan.purpose}</p>
                      {activeLoan.purposeDescription && (
                        <p className="text-sm text-muted-foreground">{activeLoan.purposeDescription}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Repayment Rate</p>
                      <p className="text-sm text-muted-foreground">15% of earnings</p>
                    </div>
                  </div>

                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertTitle>Automatic Repayment Active</AlertTitle>
                    <AlertDescription>
                      15% of your BAP streams, Kick In tips, and backer payments 
                      are automatically applied to this loan.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Active Loan</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You don't have any active loans. Apply for one to get started!
                  </p>
                  <Button className="rounded-full mt-4" onClick={() => setActiveTab("apply")}>
                    Apply for a Loan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loan History</CardTitle>
                <CardDescription>
                  All your past and current loans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Loan History</h3>
                    <p className="text-muted-foreground text-center mt-2">
                      You haven't taken any loans yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan) => (
                      <div 
                        key={loan.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${loan.approvedAmount}</span>
                            {getStatusBadge(loan.status)}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {loan.purpose} • {new Date(loan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            Repaid: <span className="font-medium">${loan.totalRepaid}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            of ${loan.totalOwed}
                          </p>
                        </div>
                      </div>
                    ))}
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
