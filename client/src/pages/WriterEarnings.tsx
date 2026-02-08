import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, DollarSign, Music, TrendingUp, Download, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Writer Earnings Dashboard
 * Shows songwriter earnings, tracks, and payout history
 */

export default function WriterEarnings() {
  const { user, loading: authLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  
  // Queries
  const { data: earnings, isLoading: loadingEarnings } = trpc.writerPayments.earnings.getMy.useQuery();
  const { data: payouts, isLoading: loadingPayouts } = trpc.writerPayments.payouts.getMy.useQuery();
  
  // Mutations
  const requestPayoutMutation = trpc.writerPayments.payouts.request.useMutation({
    onSuccess: () => {
      toast.success("Payout requested! Processing typically takes 3-5 business days.");
    },
    onError: (error) => {
      toast.error("Failed to request payout", { description: error.message });
    },
  });
  
  const handleRequestPayout = () => {
    if (!pendingEarnings || pendingEarnings < 25) {
      toast.error("Minimum payout amount is $25");
      return;
    }
    
    if (confirm(`Request payout of $${pendingEarnings.toFixed(2)}?`)) {
      requestPayoutMutation.mutate();
    }
  };
  
  if (authLoading || loadingEarnings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your earnings</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }
  
  // Calculate totals
  const totalEarned = earnings?.reduce((sum, e) => sum + e.totalEarned, 0) || 0;
  const pendingEarnings = earnings?.reduce((sum, e) => sum + e.pendingPayout, 0) || 0;
  const paidOut = payouts?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) || 0;
  
  // Group earnings by track
  const earningsByTrack = earnings?.reduce((acc, earning) => {
    const trackId = earning.trackId;
    if (!acc[trackId]) {
      acc[trackId] = {
        trackId,
        totalEarned: 0,
        splitPercentage: earning.splitPercentage,
        earnings: [],
      };
    }
    acc[trackId].totalEarned += earning.totalEarned;
    acc[trackId].earnings.push(earning);
    return acc;
  }, {} as Record<number, { trackId: number; totalEarned: number; splitPercentage: string; earnings: any[] }>);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Writer Earnings</h1>
          <p className="text-muted-foreground">
            Track your songwriter split earnings and request payouts
          </p>
        </div>
        
        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Across {earnings?.length || 0} tracks
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">${pendingEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Min. $25 to request payout
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${paidOut.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {payouts?.filter(p => p.status === "completed").length || 0} payouts completed
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Request Payout Button */}
        {pendingEarnings >= 25 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold mb-1">Ready to cash out?</h3>
                <p className="text-sm text-muted-foreground">
                  You have ${pendingEarnings.toFixed(2)} available for payout
                </p>
              </div>
              <Button
                onClick={handleRequestPayout}
                disabled={requestPayoutMutation.isPending}
                size="lg"
              >
                {requestPayoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Request Payout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Earnings by Track */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Earnings by Track
            </CardTitle>
            <CardDescription>
              Your songwriter split earnings for each track you've contributed to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {earningsByTrack && Object.keys(earningsByTrack).length > 0 ? (
              <div className="space-y-4">
                {Object.values(earningsByTrack).map((track) => (
                  <div
                    key={track.trackId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">Track #{track.trackId}</p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {track.splitPercentage}% split
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {track.splitPercentage}% songwriter split
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${track.totalEarned.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No earnings yet. You'll see earnings here once tracks you've contributed to start generating revenue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payout History
            </CardTitle>
            <CardDescription>
              Your past and pending payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payouts && payouts.length > 0 ? (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">${payout.amount.toFixed(2)}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : payout.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : payout.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested {new Date(payout.createdAt).toLocaleDateString()}
                        {payout.processedAt && ` • Completed ${new Date(payout.processedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Payment Method ID: {payout.paymentMethodId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No payout history yet. Request your first payout when you reach $25 in earnings.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">How Payouts Work</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Minimum payout amount: $25</li>
              <li>• Payouts are processed within 3-5 business days</li>
              <li>• Earnings are automatically split based on your agreed percentage</li>
              <li>• You'll receive an email notification when your payout is processed</li>
              <li>• For tax purposes, you'll receive a 1099 form if you earn over $600/year</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
