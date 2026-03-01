import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  CheckCircle2,
  Zap,
  ArrowRight,
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BillingSettings() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: sub, isLoading } = trpc.stripe.getSubscriptionStatus.useQuery();

  const createCheckout = trpc.stripe.createProCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message || "Could not start checkout."),
  });

  const openPortal = trpc.stripe.createBillingPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
    },
    onError: (err) => toast.error(err.message || "Could not open billing portal."),
  });

  const reactivate = trpc.stripe.reactivateSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription reactivated.");
      utils.stripe.getSubscriptionStatus.invalidate();
    },
    onError: (err) => toast.error(err.message || "Could not reactivate subscription."),
  });

  const isPro = sub?.tier === "pro" || sub?.tier === "enterprise";
  const isCanceling = isPro && sub?.cancelAtPeriodEnd;

  return (
    <div className="min-h-screen bg-[#f8f8f6] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back nav */}
        <button
          onClick={() => setLocation("/profile-settings")}
          className="text-sm text-gray-500 hover:text-gray-900 mb-8 flex items-center gap-1"
        >
          ← Settings
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Billing</h1>
        <p className="text-gray-500 mb-10">Manage your Boptone subscription and payment method.</p>

        {isLoading ? (
          <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white text-center text-gray-400">
            Loading…
          </div>
        ) : isPro ? (
          /* ── PRO subscriber view ── */
          <div className="space-y-6">
            {/* Status card */}
            <div className="border-2 border-black rounded-2xl p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-black" />
                  <span className="font-bold text-lg">PRO Plan</span>
                </div>
                {isCanceling ? (
                  <Badge variant="outline" className="border-orange-400 text-orange-600 rounded-full">
                    Cancels at period end
                  </Badge>
                ) : (
                  <Badge className="bg-black text-white rounded-full">Active</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {sub?.billingCycle === "annual" ? "Annual billing" : "Monthly billing"}
                  </span>
                </div>
                {sub?.currentPeriodEnd && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {isCanceling ? "Ends" : "Renews"} {formatDate(sub.currentPeriodEnd)}
                    </span>
                  </div>
                )}
              </div>

              {isCanceling && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-orange-700">
                    Your PRO access will end on {formatDate(sub?.currentPeriodEnd)}. Reactivate to keep your workflows running.
                  </p>
                </div>
              )}
            </div>

            {/* What's included */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Included in your plan</p>
              <ul className="space-y-2">
                {[
                  "Workflow Automation",
                  "AI Content Generation",
                  "Fan Engagement Automations",
                  "Webhook Integrations",
                  "Reduced Platform Fees (5%)",
                  "Full Execution History",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="rounded-full bg-black text-white hover:bg-gray-800 px-6 font-semibold"
                onClick={() => openPortal.mutate()}
                disabled={openPortal.isPending}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {openPortal.isPending ? "Opening portal…" : "Manage Payment Method"}
              </Button>
              {isCanceling && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-black text-black hover:bg-gray-100 px-6 font-semibold"
                  onClick={() => reactivate.mutate()}
                  disabled={reactivate.isPending}
                >
                  {reactivate.isPending ? "Reactivating…" : "Reactivate Subscription"}
                </Button>
              )}
              {!isCanceling && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-gray-300 text-gray-500 hover:bg-gray-50 px-6 font-semibold"
                  onClick={() => openPortal.mutate()}
                  disabled={openPortal.isPending}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Billing is managed securely through Stripe. Boptone does not store your card details.
            </p>
          </div>
        ) : (
          /* ── Free tier view ── */
          <div className="space-y-6">
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg text-gray-500">Free Plan</span>
                <Badge variant="outline" className="rounded-full text-gray-500 border-gray-300">
                  Current plan
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                You have access to music uploads, BopShop, fan analytics, Kick-in tips, and Toney AI.
              </p>
            </div>

            <div className="border-2 border-black rounded-2xl p-6 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-black" />
                <span className="font-bold text-lg">Upgrade to PRO — $49/mo</span>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Unlock Workflow Automation, AI tools, and reduced platform fees.
              </p>
              <Button
                size="lg"
                className="rounded-full bg-black text-white hover:bg-gray-800 px-8 font-semibold"
                onClick={() => createCheckout.mutate({ billingCycle: "monthly" })}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? "Opening checkout…" : "Upgrade to PRO"}
                {!createCheckout.isPending && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
              <p className="text-xs text-gray-400 mt-3">
                Or{" "}
                <button
                  className="underline hover:text-gray-700"
                  onClick={() => setLocation("/upgrade")}
                >
                  see all plans including annual billing
                </button>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
