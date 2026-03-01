import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function UpgradeSuccess() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Invalidate subscription status so the rest of the app reflects PRO immediately
  useEffect(() => {
    utils.stripe.getSubscriptionStatus.invalidate();
    utils.stripe.getSubscription.invalidate();
  }, [utils]);

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Headline */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-black" />
          <span className="text-sm font-bold uppercase tracking-widest text-gray-500">PRO Activated</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          You're on PRO.
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          Workflow Automation, AI tools, and reduced platform fees are now active on your account. Build your first automation in under two minutes.
        </p>

        {/* What's unlocked */}
        <div className="border-2 border-black rounded-2xl p-6 bg-white text-left mb-8">
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">What's now unlocked</p>
          <ul className="space-y-3">
            {[
              "Workflow Automation — visual builder + AI generation",
              "Fan engagement automations (follow, tip, purchase triggers)",
              "AI Content Generation inside workflows",
              "Webhook & third-party integrations",
              "Reduced platform fees (5% on BopShop)",
              "Full execution history & logs",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="rounded-full bg-black text-white hover:bg-gray-800 px-8 font-semibold"
            onClick={() => setLocation("/workflows")}
          >
            Build your first workflow
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-black text-black hover:bg-gray-100 px-8 font-semibold"
            onClick={() => setLocation("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          A receipt has been sent to your email. Manage your subscription in{" "}
          <button
            className="underline hover:text-gray-700"
            onClick={() => setLocation("/settings/billing")}
          >
            Settings → Billing
          </button>
          .
        </p>
      </div>
    </div>
  );
}
