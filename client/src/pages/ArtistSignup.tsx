import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check } from "lucide-react";

// ─── Tier definitions ─────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "free" as const,
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Get started and explore the platform.",
    features: [
      "Artist profile",
      "Post Bops (video)",
      "Receive tips from fans",
      "Basic analytics",
      "BopShop (up to 5 products)",
    ],
    cta: "Start Free",
    highlight: false,
    stripeTier: null,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For artists serious about building their career.",
    features: [
      "Everything in Starter",
      "Music distribution (Bop Music)",
      "Unlimited BopShop products",
      "Advanced analytics + fan insights",
      "Priority support",
      "Toney AI assistant",
    ],
    cta: "Start Pro",
    highlight: true,
    stripeTier: "pro" as const,
  },
  {
    id: "enterprise" as const,
    name: "Label",
    price: "$99",
    period: "per month",
    description: "For labels and high-volume artists.",
    features: [
      "Everything in Pro",
      "Multiple artist profiles",
      "Bulk upload tools",
      "Dedicated account manager",
      "Custom revenue splits",
      "API access",
    ],
    cta: "Contact Us",
    highlight: false,
    stripeTier: "enterprise" as const,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ArtistSignup() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selected, setSelected] = useState<"free" | "pro" | "enterprise">("pro");
  const [loading, setLoading] = useState(false);

  const createCheckout = trpc.stripe.createSubscriptionCheckout.useMutation();
  const updateProfile = trpc.artistProfile.update.useMutation();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleContinue() {
    const tier = TIERS.find(t => t.id === selected);
    if (!tier) return;

    setLoading(true);
    try {
      if (tier.id === "free") {
        // Free tier: update subscription tier and go to payout
        await updateProfile.mutateAsync({ onboardingCompleted: true });
        toast.success("Welcome to Boptone.");
        navigate("/artist/payout");
        return;
      }

      if (tier.id === "enterprise") {
        // Enterprise: redirect to contact
        navigate("/contact?plan=label");
        return;
      }

      // Pro: create Stripe checkout session
      const result = await createCheckout.mutateAsync({ tier: tier.stripeTier! });
      if (result.url) {
        window.open(result.url, "_blank");
        toast.info("Redirecting to checkout. Return here after payment to complete setup.");
        // After a short delay, navigate to payout setup
        setTimeout(() => navigate("/artist/payout"), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="text-2xl font-black tracking-widest text-white uppercase mb-2">BOPTONE</div>
        <h1 className="text-3xl font-black mb-3">Choose your plan</h1>
        <p className="text-white/50 text-base max-w-sm mx-auto">
          Start free and upgrade anytime. No contracts, cancel whenever you want.
        </p>
      </div>

      {/* Tier cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {TIERS.map(tier => (
          <button
            key={tier.id}
            onClick={() => setSelected(tier.id)}
            className={`relative text-left rounded-2xl border p-6 transition-all duration-200 focus:outline-none ${
              selected === tier.id
                ? tier.highlight
                  ? "border-[#5DCCCC] bg-[#5DCCCC]/10"
                  : "border-white bg-white/10"
                : "border-white/10 bg-white/5 hover:border-white/30"
            }`}
          >
            {/* Most popular badge */}
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#5DCCCC] text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </span>
              </div>
            )}

            {/* Selection indicator */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-4 transition-all ${
              selected === tier.id
                ? "border-[#5DCCCC] bg-[#5DCCCC]"
                : "border-white/30"
            }`}>
              {selected === tier.id && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </div>

            {/* Tier info */}
            <div className="mb-1">
              <span className="text-xs font-bold tracking-widest uppercase text-white/50">{tier.name}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black">{tier.price}</span>
              {tier.period !== "forever" && (
                <span className="text-white/40 text-sm">/{tier.period}</span>
              )}
            </div>
            <p className="text-white/50 text-sm mb-5">{tier.description}</p>

            {/* Features */}
            <ul className="space-y-2">
              {tier.features.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-[#5DCCCC] mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="bg-[#5DCCCC] hover:bg-[#4BBBBB] text-black font-bold px-10 h-12 rounded-full text-base disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            TIERS.find(t => t.id === selected)?.cta || "Continue"
          )}
        </Button>
        <p className="text-white/30 text-xs">
          {selected === "free"
            ? "No credit card required"
            : "Secure checkout. Cancel anytime."}
        </p>
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate("/artist/setup")}
        className="mt-8 text-white/30 hover:text-white/60 text-xs transition-colors"
      >
        Back to profile setup
      </button>
    </div>
  );
}
