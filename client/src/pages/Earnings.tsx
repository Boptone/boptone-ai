import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function Earnings() {
  const { user, loading: authLoading } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch earnings data
  const { data: earnings, isLoading: earningsLoading } = trpc.bap.earnings.getMy.useQuery({});
  const { data: pending, isLoading: pendingLoading } = trpc.bap.earnings.getPending.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.bap.earnings.getMyPayments.useQuery();
  const { data: stripeStatus, isLoading: stripeLoading } = trpc.bap.earnings.getStripeStatus.useQuery();

  // Mutations
  const createStripeLinkMutation = trpc.bap.earnings.createStripeLink.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast.error("Failed to create Stripe link", {
        description: error.message,
      });
      setIsConnecting(false);
    },
  });

  const requestPayoutMutation = trpc.bap.earnings.requestPayout.useMutation({
    onSuccess: (data) => {
      toast.success("Payout requested!", {
        description: `${data.amountFormatted} will be transferred to your account.`,
      });
    },
    onError: (error: any) => {
      toast.error("Payout failed", {
        description: error.message,
      });
    },
  });

  const handleConnectStripe = () => {
    setIsConnecting(true);
    createStripeLinkMutation.mutate({
      refreshUrl: window.location.href,
      returnUrl: window.location.href,
    });
  };

  const handleRequestPayout = () => {
    if (!pending?.canPayout) {
      toast.error("Cannot request payout", {
        description: `Minimum threshold is $${(pending?.minimumThreshold || 1000) / 100}. You have $${(pending?.pendingAmount || 0) / 100}.`,
      });
      return;
    }

    requestPayoutMutation.mutate();
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "processing":
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || earningsLoading || pendingLoading || stripeLoading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <ToneyChatbot />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view earnings</h1>
          <p className="text-muted-foreground mb-8">You need to be signed in to access your earnings dashboard.</p>
          <Button asChild>
            <a href="/api/oauth/login">Sign In</a>
          </Button>
        </div>
        <ToneyChatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Earnings & Payments</h1>
          <p className="text-muted-foreground">Track your BAP revenue and manage payouts</p>
        </div>

        {/* Stripe Connection Status */}
        {!stripeStatus?.payoutsEnabled && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Connect Your Bank Account
              </CardTitle>
              <CardDescription>
                You need to connect a Stripe account to receive payouts from your BAP earnings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleConnectStripe} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect Stripe Account
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl">{formatCurrency(earnings?.totalEarnings || 0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                {earnings?.streamCount || 0} streams
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Payout</CardDescription>
              <CardTitle className="text-3xl">{formatCurrency(pending?.pendingAmount || 0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                Min: {formatCurrency(pending?.minimumThreshold || 1000)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Already Paid</CardDescription>
              <CardTitle className="text-3xl">{formatCurrency(pending?.totalPaidOut || 0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                {payments?.length || 0} payments
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Payout Button */}
        {stripeStatus?.payoutsEnabled && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
              <CardDescription>
                {pending?.canPayout
                  ? `You have ${formatCurrency(pending.pendingAmount)} ready to withdraw.`
                  : `You need at least ${formatCurrency(pending?.minimumThreshold || 1000)} to request a payout. Current balance: ${formatCurrency(pending?.pendingAmount || 0)}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRequestPayout}
                disabled={!pending?.canPayout || requestPayoutMutation.isPending}
              >
                {requestPayoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Payout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All your BAP payouts and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-lg">{formatCurrency(payment.amount)}</span>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {payment.streamCount} streams
                        </span>
                      </div>
                      {payment.stripePayoutId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {payment.stripePayoutId}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start uploading music and earning from streams!
                </p>
                <Button asChild variant="outline">
                  <a href="/upload">Upload Music</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How BAP Revenue Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">90/10 Revenue Split</h4>
              <p className="text-sm text-muted-foreground">
                You keep 90% of all streaming revenue. Boptone takes only 10% to maintain the platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Per-Stream Earnings</h4>
              <p className="text-sm text-muted-foreground">
                Each stream earns $0.01. You receive $0.009 (90%) per stream.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Payout Schedule</h4>
              <p className="text-sm text-muted-foreground">
                Request payouts anytime once you reach the ${(pending?.minimumThreshold || 1000) / 100} minimum threshold. Funds typically arrive in 2-3 business days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ToneyChatbot />
    </div>
  );
}
