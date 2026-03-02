/**
 * DISTRO-UX1 Wizard — Step 6: Review & Submit
 * Full submission summary with all wizard choices before final submission.
 */

import { CheckCircle2, Music2, Globe, DollarSign, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DSP_CATALOG, PRICING_TIERS } from "@shared/distributionConstants";
import type { TerritorySelection } from "./StepTerritories";

interface TrackSummary {
  id: number;
  title: string;
  artistName?: string;
  qualityScore?: number;
  qualityTier?: string;
  coverArtUrl?: string;
}

interface StepReviewProps {
  tracks: TrackSummary[];
  selectedDsps: string[];
  territories: TerritorySelection;
  pricingTier: "free" | "standard" | "premium";
  releaseDate: string | null;
  preSaveEnabled: boolean;
  exclusiveWindowDays: number;
  upc?: string | null;
  artistNotes?: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

function TerritoryLabel({ territories }: { territories: TerritorySelection }) {
  if (territories.mode === "worldwide") return <span>Worldwide</span>;
  if (territories.mode === "regions") {
    const count = (territories.regions ?? []).length;
    return <span>{count} region{count !== 1 ? "s" : ""}</span>;
  }
  const count = (territories.countries ?? []).length;
  return <span>{count} countr{count !== 1 ? "ies" : "y"}</span>;
}

export function StepReview({
  tracks,
  selectedDsps,
  territories,
  pricingTier,
  releaseDate,
  preSaveEnabled,
  exclusiveWindowDays,
  upc,
  artistNotes,
  isSubmitting,
  onSubmit,
  onBack,
}: StepReviewProps) {
  const pricingInfo = PRICING_TIERS.find((t) => t.id === pricingTier);
  const dspInfo = DSP_CATALOG.filter((d) => selectedDsps.includes(d.slug));

  // Validation warnings
  const warnings: string[] = [];
  if (!tracks || tracks.length === 0) warnings.push("No tracks selected.");
  if (selectedDsps.length === 0) warnings.push("No platforms selected.");
  if (territories.mode === "regions" && (territories.regions ?? []).length === 0)
    warnings.push("No regions selected.");
  if (territories.mode === "custom" && (territories.countries ?? []).length === 0)
    warnings.push("No countries selected.");

  const hasWarnings = warnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Submit</h2>
        <p className="text-muted-foreground mt-1">
          Review your release details before submitting. Once submitted, some settings cannot be changed.
        </p>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/5 p-4 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Summary sections */}
      <div className="space-y-3">
        {/* Tracks */}
        <ReviewSection icon={<Music2 className="w-4 h-4" />} label="Tracks">
          {tracks.length === 0 ? (
            <span className="text-muted-foreground text-sm">No tracks selected</span>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-3">
                  {track.coverArtUrl ? (
                    <img src={track.coverArtUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                    {track.artistName && (
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    )}
                  </div>
                  {track.qualityTier && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-xs flex-shrink-0",
                        track.qualityTier === "platinum" && "border-cyan-500 text-cyan-500",
                        track.qualityTier === "gold" && "border-amber-500 text-amber-500",
                        track.qualityTier === "silver" && "border-slate-400 text-slate-400",
                      )}
                    >
                      {track.qualityTier}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ReviewSection>

        {/* Platforms */}
        <ReviewSection icon={<Globe className="w-4 h-4" />} label="Platforms">
          <div className="flex flex-wrap gap-2">
            {dspInfo.map((dsp) => (
              <Badge key={dsp.slug} variant="secondary" className="rounded-full text-xs">
                {dsp.name}
              </Badge>
            ))}
          </div>
        </ReviewSection>

        {/* Territories */}
        <ReviewSection icon={<Globe className="w-4 h-4" />} label="Territories">
          <TerritoryLabel territories={territories} />
        </ReviewSection>

        {/* Pricing */}
        <ReviewSection icon={<DollarSign className="w-4 h-4" />} label="Pricing">
          <div>
            <span className="font-medium text-foreground">{pricingInfo?.label}</span>
            <span className="text-muted-foreground text-xs ml-2">
              — Artist keeps {pricingInfo ? 100 - pricingInfo.boptoneSharePercent : 90}%
            </span>
          </div>
        </ReviewSection>

        {/* Schedule */}
        <ReviewSection icon={<Calendar className="w-4 h-4" />} label="Release Date">
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              {releaseDate
                ? new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : "Immediate (upon approval)"}
            </p>
            {preSaveEnabled && releaseDate && (
              <p className="text-xs text-muted-foreground">Pre-save enabled</p>
            )}
            {exclusiveWindowDays > 0 && (
              <p className="text-xs text-muted-foreground">
                {exclusiveWindowDays}-day Bop Music exclusive window
              </p>
            )}
          </div>
        </ReviewSection>

        {/* UPC */}
        {upc && (
          <ReviewSection icon={<CheckCircle2 className="w-4 h-4" />} label="UPC">
            <span className="font-mono text-sm">{upc}</span>
          </ReviewSection>
        )}

        {/* Notes */}
        {artistNotes && (
          <ReviewSection icon={<CheckCircle2 className="w-4 h-4" />} label="Notes">
            <p className="text-sm text-muted-foreground">{artistNotes}</p>
          </ReviewSection>
        )}
      </div>

      {/* Legal notice */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        By submitting, you confirm that you own or control all rights to this content and that it complies with Boptone's content policies and the terms of each selected platform.
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="rounded-full flex-1 sm:flex-none">
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || hasWarnings}
          className="rounded-full flex-1 sm:flex-none bg-primary text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Release"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Review Section ───────────────────────────────────────────────────────────

function ReviewSection({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 w-28 flex-shrink-0">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
