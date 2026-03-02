/**
 * DISTRO-UX1 Wizard — Step 2: DSP Selection
 * Artists choose which platforms to distribute to.
 * Bop Music is always included and cannot be deselected.
 */

import { useState } from "react";
import { Check, Info, Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DSP_CATALOG } from "@shared/distributionConstants";

type DspSlug = string;

interface StepDspSelectionProps {
  selectedDsps: DspSlug[];
  onChange: (dsps: DspSlug[]) => void;
  pricingTier?: "free" | "standard" | "premium";
}

// DSP logos using platform brand colors as colored circles (no external images needed)
const DSP_ICONS: Record<string, { bg: string; letter: string }> = {
  boptone:      { bg: "#00BFFF", letter: "B" },
  spotify:      { bg: "#1DB954", letter: "S" },
  apple_music:  { bg: "#FC3C44", letter: "A" },
  tidal:        { bg: "#000000", letter: "T" },
  amazon_music: { bg: "#FF9900", letter: "A" },
  youtube_music:{ bg: "#FF0000", letter: "Y" },
  deezer:       { bg: "#A238FF", letter: "D" },
  pandora:      { bg: "#3668FF", letter: "P" },
};

export function StepDspSelection({ selectedDsps, onChange, pricingTier = "standard" }: StepDspSelectionProps) {
  const toggleDsp = (slug: DspSlug) => {
    if (slug === "boptone") return; // Always included
    if (selectedDsps.includes(slug)) {
      onChange(selectedDsps.filter((d) => d !== slug));
    } else {
      onChange([...selectedDsps, slug]);
    }
  };

  const selectAll = () => {
    onChange(DSP_CATALOG.map((d) => d.slug));
  };

  const selectBoptoneOnly = () => {
    onChange(["boptone"]);
  };

  const selectedCount = selectedDsps.length;
  const totalCount = DSP_CATALOG.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choose Your Platforms</h2>
        <p className="text-muted-foreground mt-1">
          Select where your music will be distributed. Bop Music is always included at no extra cost.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={selectAll} className="rounded-full text-xs">
          Select All ({totalCount})
        </Button>
        <Button variant="outline" size="sm" onClick={selectBoptoneOnly} className="rounded-full text-xs">
          Bop Music Only
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          {selectedCount} of {totalCount} selected
        </span>
      </div>

      {/* DSP Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DSP_CATALOG.map((dsp) => {
          const isSelected = selectedDsps.includes(dsp.slug);
          const isAlwaysOn = dsp.alwaysIncluded;
          const icon = DSP_ICONS[dsp.slug] ?? { bg: "#888", letter: dsp.name[0] };

          return (
            <button
              key={dsp.slug}
              type="button"
              onClick={() => toggleDsp(dsp.slug)}
              disabled={isAlwaysOn}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/30",
                isAlwaysOn && "cursor-default"
              )}
            >
              {/* Platform icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: icon.bg }}
              >
                {icon.letter}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{dsp.name}</span>
                  {isAlwaysOn && (
                    <Badge variant="secondary" className="text-xs rounded-full px-2">Always Included</Badge>
                  )}
                  {dsp.supportsPreSave && !isAlwaysOn && (
                    <Badge variant="outline" className="text-xs rounded-full px-2">Pre-Save</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{dsp.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{dsp.revenueShareNote}</p>
                {dsp.minLeadTimeDays > 0 && (
                  <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {dsp.minLeadTimeDays}-day lead time required
                  </p>
                )}
              </div>

              {/* Check indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Revenue info callout */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3">
        <Music2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Revenue Share</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Boptone takes {pricingTier === "premium" ? "15%" : pricingTier === "free" ? "0%" : "10%"} of streaming revenue from third-party platforms based on your current plan.
            You keep 100% of revenue on Bop Music.
          </p>
        </div>
      </div>
    </div>
  );
}
