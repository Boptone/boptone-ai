import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

/**
 * Writer Earnings Dashboard
 * Shows songwriter earnings, tracks, and payout history
 */

export default function WriterEarnings() {
  useRequireArtist(); // Enforce artist authentication
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
          <div className="text-2xl font-bold">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="border-4 border-black bg-white rounded-none p-8">
          <h2 className="text-2xl font-bold mb-2">SIGN IN REQUIRED</h2>
          <p className="text-gray-600">Please sign in to view your earnings</p>
        </div>
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">WRITER EARNINGS</h1>
          <p className="text-lg text-gray-600">
            Track your songwriter split earnings and request payouts
          </p>
        </div>
        
        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-4 border-black bg-white rounded-none p-6">
            <div className="text-xs font-bold tracking-wider mb-3 text-gray-600">TOTAL EARNED</div>
            <div className="text-4xl font-bold mb-2">${totalEarned.toFixed(2)}</div>
            <p className="text-sm text-gray-600">
              Across {earnings?.length || 0} tracks
            </p>
          </div>
          
          <div className="border-4 border-black bg-white rounded-none p-6">
            <div className="text-xs font-bold tracking-wider mb-3 text-gray-600">PENDING PAYOUT</div>
            <div className="text-4xl font-bold mb-2">${pendingEarnings.toFixed(2)}</div>
            <p className="text-sm text-gray-600">
              Min. $25 to request payout
            </p>
          </div>
          
          <div className="border-4 border-black bg-white rounded-none p-6">
            <div className="text-xs font-bold tracking-wider mb-3 text-gray-600">PAID OUT</div>
            <div className="text-4xl font-bold mb-2">${paidOut.toFixed(2)}</div>
            <p className="text-sm text-gray-600">
              {payouts?.filter(p => p.status === "completed").length || 0} payouts completed
            </p>
          </div>
        </div>
        
        {/* Request Payout Button */}
        {pendingEarnings >= 25 && (
          <div className="border-4 border-black bg-gray-50 rounded-none p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">READY TO CASH OUT?</h3>
              <p className="text-sm text-gray-600">
                You have ${pendingEarnings.toFixed(2)} available for payout
              </p>
            </div>
            <Button
              onClick={handleRequestPayout}
              disabled={requestPayoutMutation.isPending}
              className="rounded-full bg-black text-white hover:bg-gray-800 font-bold px-6"
            >
              {requestPayoutMutation.isPending ? "PROCESSING..." : "REQUEST PAYOUT"}
            </Button>
          </div>
        )}
        
        {/* Earnings by Track */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-6">
            <h2 className="text-2xl font-bold mb-2">EARNINGS BY TRACK</h2>
            <p className="text-sm text-gray-600">
              Your songwriter split earnings for each track you've contributed to
            </p>
          </div>
          <div className="p-6">
            {earningsByTrack && Object.keys(earningsByTrack).length > 0 ? (
              <div className="space-y-4">
                {Object.values(earningsByTrack).map((track) => (
                  <div
                    key={track.trackId}
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-none"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-lg">TRACK #{track.trackId}</p>
                        <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-bold">
                          {track.splitPercentage}% SPLIT
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {track.splitPercentage}% songwriter split
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">${track.totalEarned.toFixed(2)}</p>
                      <p className="text-xs text-gray-600 mt-1">Total earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-none">
                <p className="text-gray-700">
                  No earnings yet. You'll see earnings here once tracks you've contributed to start generating revenue.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Payout History */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-6">
            <h2 className="text-2xl font-bold mb-2">PAYOUT HISTORY</h2>
            <p className="text-sm text-gray-600">
              Your past and pending payouts
            </p>
          </div>
          <div className="p-6">
            {payouts && payouts.length > 0 ? (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-none"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-xl">${payout.amount.toFixed(2)}</p>
                        <span className="text-xs px-3 py-1 rounded-full font-bold border border-gray-200 bg-white">
                          {payout.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Requested {new Date(payout.createdAt).toLocaleDateString()}
                        {payout.processedAt && ` • Completed ${new Date(payout.processedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-mono">
                        ID: {payout.paymentMethodId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-none">
                <p className="text-gray-700">
                  No payout history yet. Request your first payout when you reach $25 in earnings.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Help Section */}
        <div className="border-4 border-black bg-gray-50 rounded-none p-6">
          <h3 className="font-bold text-lg mb-4">HOW PAYOUTS WORK</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Minimum payout amount: $25</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Payouts are processed within 3-5 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Earnings are automatically split based on your agreed percentage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>You'll receive an email notification when your payout is processed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>For tax purposes, you'll receive a 1099 form if you earn over $600/year</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
