import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { CheckCircle2, Zap, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const PRO_FEATURES = [
  { label: "Workflow Automation", desc: "Visual trigger-action builder + AI generation" },
  { label: "Unlimited Active Workflows", desc: "No cap on automations running in parallel" },
  { label: "AI Content Generation", desc: "Generate posts, emails, and captions inside workflows" },
  { label: "Fan Engagement Automations", desc: "Auto-respond to follows, tips, and purchases" },
  { label: "Webhook & Third-Party Integrations", desc: "Connect to any external service" },
  { label: "Full Execution History", desc: "Logs, retries, and debugging tools" },
  { label: "Reduced Platform Fees", desc: "5% on BopShop sales (vs 12% on Free)" },
  { label: "Priority Support", desc: "Faster response times from the Boptone team" },
];

const FREE_FEATURES = [
  "Music uploads & distribution",
  "BopShop storefront",
  "Fan analytics",
  "Kick-in (tips)",
  "Toney AI chat",
];

export default function Upgrade() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const { data: pricing } = trpc.stripe.getPricing.useQuery();
  const { data: subStatus } = trpc.stripe.getSubscriptionStatus.useQuery();

  const createCheckout = trpc.stripe.createProCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Could not start checkout. Please try again.");
    },
  });

  const isAlreadyPro = subStatus?.tier === "pro" || subStatus?.tier === "enterprise";

  const monthlyPrice = pricing?.monthly.display ?? "$49";
  const annualPerMonth = pricing?.annual.perMonth ?? "$39";
  const annualTotal = pricing?.annual.display ?? "$468";
  const savings = pricing?.annual.savingsPercent ?? 20;

  function handleUpgrade() {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createCheckout.mutate({ billingCycle });
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setLocation("/dashboard")}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Close
        </button>
        <span className="text-sm font-semibold text-gray-700">Upgrade to PRO</span>
        <div className="w-16" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 text-sm font-semibold border-2 border-black px-4 py-1 rounded-full"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 inline" />
            PRO Plan
          </Badge>
          <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4">
            Build your music career<br />on autopilot.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Unlock Workflow Automation, AI tools, and lower platform fees — everything you need to run your career without the busywork.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              billingCycle === "monthly"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-colors flex items-center gap-2 ${
              billingCycle === "annual"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
            }`}
          >
            Annual
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
              Save {savings}%
            </span>
          </button>
        </div>

        {/* Pricing card */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* PRO card */}
          <div className="border-2 border-black rounded-2xl p-8 bg-white">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black text-gray-900">
                {billingCycle === "monthly" ? monthlyPrice : annualPerMonth}
              </span>
              <span className="text-gray-500 mb-2 text-lg">/mo</span>
            </div>
            {billingCycle === "annual" && (
              <p className="text-sm text-gray-500 mb-6">
                Billed {annualTotal}/year — {savings}% off monthly
              </p>
            )}
            {billingCycle === "monthly" && (
              <p className="text-sm text-gray-500 mb-6">Billed monthly, cancel anytime</p>
            )}

            {isAlreadyPro ? (
              <div className="w-full py-3 rounded-full bg-green-50 border-2 border-green-500 text-green-700 font-semibold text-center text-base">
                ✓ You're on PRO
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full rounded-full bg-black text-white hover:bg-gray-800 text-base font-semibold py-3"
                onClick={handleUpgrade}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? "Opening checkout…" : "Upgrade to PRO"}
                {!createCheckout.isPending && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              Secure checkout via Stripe · Cancel anytime
            </p>

            <div className="mt-6 space-y-3">
              {PRO_FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{f.label}</span>
                    <span className="text-sm text-gray-500"> — {f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free plan comparison */}
          <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black text-gray-400">$0</span>
              <span className="text-gray-400 mb-2 text-lg">/mo</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">Free forever — no credit card required</p>

            <div className="w-full py-3 rounded-full border-2 border-gray-200 text-gray-400 font-semibold text-center text-base cursor-default">
              Current plan
            </div>

            <div className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-500">{f}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <X className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-400">Workflow Automation</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-400">AI Content Generation</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-400">Reduced platform fees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test card notice */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white text-center">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Testing?</span> Use card number{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">4242 4242 4242 4242</code>{" "}
            with any future expiry and any CVC.
          </p>
        </div>
      </div>
    </div>
  );
}
