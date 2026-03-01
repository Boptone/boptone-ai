import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * WorkflowUpgradeGate
 *
 * Shown to Free-tier users in place of the workflow automation feature.
 * Communicates the value proposition clearly and routes to /pricing.
 *
 * Design: consistent with Boptone's softened brutalist aesthetic —
 * bold headline, clean layout, no animations, pill buttons.
 */
export default function WorkflowUpgradeGate() {
  const [, setLocation] = useLocation();

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

  const proFeatures = [
    "Visual trigger-action workflow builder",
    "AI-powered workflow generation from plain text",
    "10+ pre-built automation templates",
    "Fan engagement automations (follow, tip, purchase)",
    "Webhook and third-party integrations",
    "AI content generation inside workflows",
    "Full execution history and logs",
  ];

  const enterpriseAdditions = [
    "Unlimited active workflows",
    "Priority execution queue",
    "Custom code nodes",
    "Dedicated workflow support",
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Lock badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <Badge
            variant="outline"
            className="text-sm font-semibold border-2 border-black px-4 py-1 rounded-full"
          >
            PRO &amp; Enterprise Feature
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4">
          Workflow Automation
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
          Build automated systems that run your music career around the clock.
          Set a trigger once — let Boptone handle the rest.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* PRO column */}
          <div className="border-2 border-black rounded-2xl p-6 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-black" />
              <span className="font-bold text-lg">PRO — $49/mo</span>
            </div>
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise column */}
          <div className="border-2 border-black rounded-2xl p-6 bg-black text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-white" />
              <span className="font-bold text-lg">Enterprise — $149/mo</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">Everything in PRO, plus:</p>
            <ul className="space-y-3">
              {enterpriseAdditions.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-white mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="rounded-full bg-black text-white hover:bg-gray-800 px-8 py-3 text-base font-semibold"
            onClick={() => createCheckout.mutate({ billingCycle: "monthly" })}
            disabled={createCheckout.isPending}
          >
            {createCheckout.isPending ? "Opening checkout…" : "Upgrade to PRO"}
            {!createCheckout.isPending && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-black text-black hover:bg-gray-100 px-8 py-3 text-base font-semibold"
            onClick={() => setLocation("/upgrade")}
          >
            See All Plans
          </Button>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Already upgraded? Your plan may take a moment to refresh — try signing out and back in.
        </p>
      </div>
    </div>
  );
}
