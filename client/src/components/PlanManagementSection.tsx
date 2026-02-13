import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PLANS = [
  {
    id: "creator",
    name: "Creator",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["Basic distribution", "1 release/month", "Standard analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 23.2, // 20% off
    features: ["Unlimited releases", "Advanced analytics", "Priority support", "Playlist pitching"],
  },
  {
    id: "studio",
    name: "Studio",
    monthlyPrice: 99,
    annualPrice: 79.2, // 20% off
    features: ["Everything in Pro", "Team collaboration", "White-label options", "API access"],
  },
  {
    id: "label",
    name: "Label",
    monthlyPrice: 499,
    annualPrice: 399.2, // 20% off
    features: ["Everything in Studio", "Unlimited artists", "Custom integrations", "Dedicated account manager"],
  },
];

export function PlanManagementSection() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<"monthly" | "annual">("monthly");

  const { data: currentSub, isLoading } = trpc.subscriptions.getCurrent.useQuery();
  const { data: preview } = trpc.subscriptions.previewChange.useQuery(
    {
      newPlan: (selectedPlan as any) || "pro",
      newBillingCycle: selectedCycle,
    },
    {
      enabled: !!selectedPlan,
    }
  );

  const changePlanMutation = trpc.subscriptions.changePlan.useMutation({
    onSuccess: () => {
      toast.success("Plan updated successfully!");
      setShowUpgradeModal(false);
      setSelectedPlan(null);
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    },
  });

  const handleUpgradeClick = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const handleConfirmChange = () => {
    if (!selectedPlan) return;
    changePlanMutation.mutate({
      newPlan: selectedPlan as any,
      newBillingCycle: selectedCycle,
    });
  };

  if (isLoading) {
    return (
      <div className="border-2 border-gray-200 bg-white p-12">
        <div className="flex items-center justify-center py-12">
          <div className="text-xl font-medium text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const currentPlan = currentSub?.plan || "creator";
  const currentCycle = currentSub?.billingCycle || "monthly";

  return (
    <>
      <div className="border-2 border-gray-200 bg-white p-12">
        <h2 className="text-4xl font-bold mb-3">Your Plan</h2>
        <p className="text-lg text-gray-600 mb-10">
          Currently on {PLANS.find((p) => p.id === currentPlan)?.name} ({currentCycle})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isUpgrade = PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan);

            return (
              <div
                key={plan.id}
                className={`border-2 ${isCurrent ? "border-black" : "border-gray-200"} bg-white p-8`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold text-gray-900 mb-6">
                  ${plan.monthlyPrice}
                  <span className="text-base font-normal text-gray-500">/mo</span>
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button disabled className="w-full rounded-full bg-gray-200 text-gray-600 h-12">
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    onClick={() => handleUpgradeClick(plan.id)}
                    className="w-full rounded-full bg-black hover:bg-gray-800 text-white h-12"
                  >
                    Upgrade
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgradeClick(plan.id)}
                    variant="outline"
                    className="w-full rounded-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white h-12"
                  >
                    Downgrade
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade/Downgrade Confirmation Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Confirm Plan Change</DialogTitle>
            <DialogDescription className="text-lg">
              Review your plan change details before confirming
            </DialogDescription>
          </DialogHeader>

          {preview && selectedPlan && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 border-2 border-gray-200 bg-white">
                  <p className="text-sm font-bold text-gray-500 mb-2">Current Plan</p>
                  <p className="text-2xl font-bold">{PLANS.find((p) => p.id === preview.currentPlan)?.name}</p>
                  <p className="text-lg font-semibold text-gray-600">{preview.currentBillingCycle}</p>
                </div>

                <div className="p-6 border-2 border-black bg-white">
                  <p className="text-sm font-bold text-gray-900 mb-2">New Plan</p>
                  <p className="text-2xl font-bold">{PLANS.find((p) => p.id === preview.newPlan)?.name}</p>
                  <p className="text-lg font-semibold text-gray-600">{preview.newBillingCycle}</p>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4 p-4 bg-gray-50">
                <Button
                  variant={selectedCycle === "monthly" ? "default" : "outline"}
                  onClick={() => setSelectedCycle("monthly")}
                  className="rounded-full"
                >
                  Monthly
                </Button>
                <Button
                  variant={selectedCycle === "annual" ? "default" : "outline"}
                  onClick={() => setSelectedCycle("annual")}
                  className="rounded-full"
                >
                  Annual (Save 20%)
                </Button>
              </div>

              {preview.proratedCredit > 0 && (
                <div className="p-6 border-2 border-gray-200 bg-white">
                  <p className="text-sm font-bold text-gray-600 mb-1">Prorated Credit</p>
                  <p className="text-3xl font-bold text-gray-900">${preview.proratedCredit.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Credit for {preview.daysRemaining} days remaining on your current plan
                  </p>
                </div>
              )}

              <div className="p-6 border-2 border-gray-200 bg-white">
                <p className="text-sm font-bold text-gray-900 mb-2">What happens next?</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Your plan changes immediately</li>
                  <li>• Prorated credit applied to your account</li>
                  <li>• New features available right away</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={changePlanMutation.isPending}
              className="rounded-full bg-black hover:bg-gray-800 text-white"
            >
              {changePlanMutation.isPending ? "Processing..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
