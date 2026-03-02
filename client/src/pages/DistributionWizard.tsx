/**
 * DISTRO-UX1: Distribution Wizard
 *
 * Multi-step release submission flow.
 * Steps: Track Selection → DSP Selection → Territories → Pricing → Schedule → Review
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft, X, CheckCircle2, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { StepDspSelection } from "@/components/Wizard/StepDspSelection";
import { StepTerritories, type TerritorySelection } from "@/components/Wizard/StepTerritories";
import { StepPricing } from "@/components/Wizard/StepPricing";
import { StepSchedule } from "@/components/Wizard/StepSchedule";
import { StepReview } from "@/components/Wizard/StepReview";

// ─── Wizard State ─────────────────────────────────────────────────────────────

interface WizardState {
  submissionId: number | null;
  // Step 1 — Track selection (passed via query param or pre-selected)
  trackIds: number[];
  // Step 2 — DSPs
  selectedDsps: string[];
  // Step 3 — Territories
  territories: TerritorySelection;
  // Step 4 — Pricing
  pricingTier: "free" | "standard" | "premium";
  // Step 5 — Schedule
  releaseDate: string | null;
  preSaveEnabled: boolean;
  exclusiveWindowDays: number;
  // Misc
  upc: string | null;
  artistNotes: string | null;
}

const INITIAL_STATE: WizardState = {
  submissionId: null,
  trackIds: [],
  selectedDsps: ["boptone"],
  territories: { mode: "worldwide" },
  pricingTier: "standard",
  releaseDate: null,
  preSaveEnabled: false,
  exclusiveWindowDays: 0,
  upc: null,
  artistNotes: null,
};

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: "dsps", label: "Platforms", shortLabel: "Platforms" },
  { id: "territories", label: "Territories", shortLabel: "Territories" },
  { id: "pricing", label: "Pricing", shortLabel: "Pricing" },
  { id: "schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "review", label: "Review", shortLabel: "Review" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DistributionWizard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Parse track IDs from query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get("tracks");
    if (trackParam) {
      const ids = trackParam.split(",").map(Number).filter(Boolean);
      if (ids.length > 0) {
        setState((s) => ({ ...s, trackIds: ids }));
      }
    }
  }, []);

  // Fetch track details for review step
  const { data: myTracks } = trpc.bap.tracks.getMy.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const selectedTrackDetails = (myTracks ?? [])
    .filter((t: any) => state.trackIds.includes(t.id))
    .map((t: any) => ({
      id: t.id,
      title: t.title,
      artistName: t.artistName,
      qualityScore: t.qualityScore,
      qualityTier: t.qualityTier,
      coverArtUrl: t.coverArtUrl,
    }));

  // tRPC mutations
  const getOrCreateDraft = trpc.distribution.getOrCreateDraft.useMutation();
  const updateStep = trpc.distribution.updateStep.useMutation();
  const submitMutation = trpc.distribution.submit.useMutation();

  // Initialize draft on mount
  useEffect(() => {
    if (!isAuthenticated || authLoading || state.submissionId) return;
    if (state.trackIds.length === 0) return;

    getOrCreateDraft.mutate(
      { trackIds: state.trackIds },
      {
        onSuccess: (data) => {
          setState((s) => ({ ...s, submissionId: data.submissionId }));
        },
        onError: (err) => {
          toast.error("Could not initialize distribution draft: " + err.message);
        },
      }
    );
  }, [isAuthenticated, authLoading, state.trackIds.length]);

  // ─── Step validation ────────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    const step = STEPS[currentStep];
    switch (step.id) {
      case "dsps":
        return state.selectedDsps.length > 0;
      case "territories":
        if (state.territories.mode === "regions")
          return (state.territories.regions ?? []).length > 0;
        if (state.territories.mode === "custom")
          return (state.territories.countries ?? []).length > 0;
        return true;
      case "pricing":
        return true;
      case "schedule":
        return true;
      case "review":
        return state.trackIds.length > 0 && state.selectedDsps.length > 0;
      default:
        return true;
    }
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goNext = async () => {
    if (!canProceed()) return;

    // Auto-save current step data
    if (state.submissionId) {
      try {
        await updateStep.mutateAsync({
          submissionId: state.submissionId,
          selectedDsps: state.selectedDsps,
          territories: state.territories,
          pricingTier: state.pricingTier,
          releaseDate: state.releaseDate,
          preSaveEnabled: state.preSaveEnabled,
          exclusiveWindowDays: state.exclusiveWindowDays,
          upc: state.upc,
          artistNotes: state.artistNotes,
        });
      } catch (err: any) {
        toast.error("Auto-save failed: " + err.message);
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!state.submissionId) {
      toast.error("No submission ID found. Please restart the wizard.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Final save
      await updateStep.mutateAsync({
        submissionId: state.submissionId,
        selectedDsps: state.selectedDsps,
        territories: state.territories,
        pricingTier: state.pricingTier,
        releaseDate: state.releaseDate,
        preSaveEnabled: state.preSaveEnabled,
        exclusiveWindowDays: state.exclusiveWindowDays,
        upc: state.upc,
        artistNotes: state.artistNotes,
      });

      await submitMutation.mutateAsync({ submissionId: state.submissionId });
      setIsComplete(true);
    } catch (err: any) {
      toast.error("Submission failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success screen ──────────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Release Submitted!</h1>
            <p className="text-muted-foreground mt-2">
              Your release is being processed. We'll notify you when it goes live on each platform.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/distribution")}
              className="rounded-full w-full"
            >
              View Distribution Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/my-music")}
              className="rounded-full w-full"
            >
              Back to My Music
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stepInfo = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-music")}
            className="rounded-full flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Distribute Music</p>
            <p className="text-sm font-semibold text-foreground">{stepInfo.label}</p>
          </div>
          {/* Step counter */}
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step pills */}
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all",
                i < currentStep
                  ? "bg-primary/10 text-primary"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep && <CheckCircle2 className="w-3 h-3" />}
              {step.shortLabel}
            </div>
          ))}
        </div>
      </div>

      {/* No tracks warning */}
      {state.trackIds.length === 0 && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/5 p-4 flex items-center gap-3">
            <Music2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">No tracks selected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Go to My Music and select tracks to distribute, then click "Distribute".
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/my-music")}
              className="rounded-full ml-auto flex-shrink-0"
            >
              My Music
            </Button>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {stepInfo.id === "dsps" && (
          <StepDspSelection
            selectedDsps={state.selectedDsps}
            onChange={(dsps) => setState((s) => ({ ...s, selectedDsps: dsps }))}
            pricingTier={state.pricingTier}
          />
        )}

        {stepInfo.id === "territories" && (
          <StepTerritories
            territories={state.territories}
            onChange={(territories) => setState((s) => ({ ...s, territories }))}
          />
        )}

        {stepInfo.id === "pricing" && (
          <StepPricing
            pricingTier={state.pricingTier}
            onChange={(tier) => setState((s) => ({ ...s, pricingTier: tier }))}
            selectedDsps={state.selectedDsps}
          />
        )}

        {stepInfo.id === "schedule" && (
          <StepSchedule
            releaseDate={state.releaseDate}
            preSaveEnabled={state.preSaveEnabled}
            exclusiveWindowDays={state.exclusiveWindowDays}
            selectedDsps={state.selectedDsps}
            onChange={(data) => setState((s) => ({ ...s, ...data }))}
          />
        )}

        {stepInfo.id === "review" && (
          <StepReview
            tracks={selectedTrackDetails}
            selectedDsps={state.selectedDsps}
            territories={state.territories}
            pricingTier={state.pricingTier}
            releaseDate={state.releaseDate}
            preSaveEnabled={state.preSaveEnabled}
            exclusiveWindowDays={state.exclusiveWindowDays}
            upc={state.upc}
            artistNotes={state.artistNotes}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
        )}

        {/* Navigation (not shown on review step — it has its own buttons) */}
        {stepInfo.id !== "review" && (
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={goBack}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={goNext}
              disabled={!canProceed() || updateStep.isPending}
              className="rounded-full ml-auto"
            >
              {updateStep.isPending ? "Saving..." : "Continue"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
