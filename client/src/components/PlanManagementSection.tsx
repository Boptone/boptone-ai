import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Crown, Zap, Building2, Check, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "creator",
    name: "Creator",
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    color: "from-gray-400 to-gray-500",
    borderColor: "border-gray-500",
    features: ["Basic distribution", "1 release/month", "Standard analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    monthlyPrice: 29,
    annualPrice: 23.2, // 20% off
    color: "from-purple-400 to-pink-500",
    borderColor: "border-purple-500",
    features: ["Unlimited releases", "Advanced analytics", "Priority support", "Playlist pitching"],
  },
  {
    id: "studio",
    name: "Studio",
    icon: Building2,
    monthlyPrice: 99,
    annualPrice: 79.2, // 20% off
    color: "from-blue-400 to-cyan-500",
    borderColor: "border-blue-500",
    features: ["Everything in Pro", "Team collaboration", "White-label options", "API access"],
  },
  {
    id: "label",
    name: "Label",
    icon: Building2,
    monthlyPrice: 499,
    annualPrice: 399.2, // 20% off
    color: "from-orange-400 to-red-500",
    borderColor: "border-orange-500",
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
      <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  const currentPlan = currentSub?.plan || "creator";
  const currentCycle = currentSub?.billingCycle || "monthly";

  return (
    <>
      <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-black">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            Your Plan
          </CardTitle>
          <CardDescription className="text-lg font-medium">
            Currently on {PLANS.find((p) => p.id === currentPlan)?.name} ({currentCycle})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;
              const isUpgrade = PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan);

              return (
                <Card
                  key={plan.id}
                  className={`rounded-2xl border-4 ${plan.borderColor} shadow-xl ${
                    isCurrent ? "ring-4 ring-purple-300" : ""
                  } bg-white`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-black">{plan.name}</h3>
                      <p className="text-3xl font-black text-gray-900 mt-2">
                        ${plan.monthlyPrice}
                        <span className="text-sm font-medium text-gray-500">/mo</span>
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button disabled className="w-full rounded-full bg-gray-200 text-gray-600">
                        Current Plan
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        onClick={() => handleUpgradeClick(plan.id)}
                        className={`w-full rounded-full bg-gradient-to-r ${plan.color} hover:opacity-90 shadow-lg`}
                      >
                        Upgrade <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgradeClick(plan.id)}
                        variant="outline"
                        className="w-full rounded-full border-2"
                      >
                        Downgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade/Downgrade Confirmation Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">Confirm Plan Change</DialogTitle>
            <DialogDescription className="text-lg">
              Review your plan change details before confirming
            </DialogDescription>
          </DialogHeader>

          {preview && selectedPlan && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gray-50 border-2 border-gray-200">
                  <p className="text-sm font-bold text-gray-500 mb-2">Current Plan</p>
                  <p className="text-2xl font-black">{PLANS.find((p) => p.id === preview.currentPlan)?.name}</p>
                  <p className="text-lg font-bold text-gray-600">{preview.currentBillingCycle}</p>
                </div>

                <div className="p-6 rounded-2xl bg-purple-50 border-2 border-purple-200">
                  <p className="text-sm font-bold text-purple-600 mb-2">New Plan</p>
                  <p className="text-2xl font-black">{PLANS.find((p) => p.id === preview.newPlan)?.name}</p>
                  <p className="text-lg font-bold text-gray-600">{preview.newBillingCycle}</p>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-2xl">
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
                <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-200">
                  <p className="text-sm font-bold text-green-600 mb-1">Prorated Credit</p>
                  <p className="text-3xl font-black text-green-700">${preview.proratedCredit.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Credit for {preview.daysRemaining} days remaining on your current plan
                  </p>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-purple-50 border-2 border-purple-200">
                <p className="text-sm font-bold text-purple-600 mb-2">What happens next?</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Your plan changes immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Prorated credit applied to your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>New features available right away</span>
                  </li>
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
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {changePlanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
