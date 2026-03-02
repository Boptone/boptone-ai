/**
 * DISTRO-UX1 Wizard — Step 4: Pricing Tier
 * Artists choose their streaming pricing tier.
 */

import { Check, TrendingUp, DollarSign, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRICING_TIERS } from "@shared/distributionConstants";

type PricingTier = "free" | "standard" | "premium";

interface StepPricingProps {
  pricingTier: PricingTier;
  onChange: (tier: PricingTier) => void;
  selectedDsps?: string[];
}

const TIER_ICONS: Record<PricingTier, React.ReactNode> = {
  free: <Zap className="w-6 h-6" />,
  standard: <DollarSign className="w-6 h-6" />,
  premium: <TrendingUp className="w-6 h-6" />,
};

const TIER_COLORS: Record<PricingTier, string> = {
  free: "border-muted-foreground/30 bg-muted/20",
  standard: "border-primary bg-primary/5",
  premium: "border-amber-500 bg-amber-500/5",
};

const TIER_ICON_COLORS: Record<PricingTier, string> = {
  free: "bg-muted text-muted-foreground",
  standard: "bg-primary text-primary-foreground",
  premium: "bg-amber-500 text-white",
};

export function StepPricing({ pricingTier, onChange, selectedDsps = [] }: StepPricingProps) {
  // Estimate monthly earnings for 10,000 streams
  const estimateEarnings = (tier: PricingTier) => {
    const streams = 10000;
    const rateMap: Record<PricingTier, number> = { free: 0, standard: 0.004, premium: 0.007 };
    const shareMap: Record<PricingTier, number> = { free: 0, standard: 0.10, premium: 0.15 };
    const gross = streams * rateMap[tier];
    const net = gross * (1 - shareMap[tier]);
    return net.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pricing Tier</h2>
        <p className="text-muted-foreground mt-1">
          Choose how your music is priced on streaming platforms. This affects your per-stream earnings.
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-4">
        {PRICING_TIERS.map((tier) => {
          const isSelected = pricingTier === tier.id;
          const earnings = estimateEarnings(tier.id as PricingTier);

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onChange(tier.id as PricingTier)}
              className={cn(
                "relative flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all w-full",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? TIER_COLORS[tier.id as PricingTier]
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "p-2.5 rounded-xl flex-shrink-0",
                isSelected ? TIER_ICON_COLORS[tier.id as PricingTier] : "bg-muted text-muted-foreground"
              )}>
                {TIER_ICONS[tier.id as PricingTier]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-foreground">{tier.label}</span>
                  {tier.badge && (
                    <Badge
                      className={cn(
                        "rounded-full text-xs",
                        tier.id === "premium" ? "bg-amber-500 text-white border-amber-500" : ""
                      )}
                      variant={tier.id === "premium" ? "default" : "secondary"}
                    >
                      {tier.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>

                {/* Earnings estimate */}
                <div className="mt-3 flex items-center gap-4 flex-wrap">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Est. per 10K streams: </span>
                    <span className={cn(
                      "font-bold",
                      tier.id === "free" ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {tier.id === "free" ? "$0.00" : `$${earnings}`}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Boptone share: </span>
                    <span className="font-bold text-foreground">{tier.boptoneSharePercent}%</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Artist keeps: </span>
                    <span className="font-bold text-foreground">{100 - tier.boptoneSharePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Check */}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
              )}>
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Note about subscription tier */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Note:</strong> Your Boptone subscription tier may affect the available pricing options and revenue share percentages. Upgrade your plan to unlock lower revenue share rates.
      </div>
    </div>
  );
}
