/**
 * ActivationFunnelWidget
 *
 * GROWTH-5: Post-signup artist activation funnel.
 * Renders on the dashboard for artists who haven't completed all activation steps.
 * Self-dismisses permanently once all steps are completed or skipped.
 *
 * Design principles:
 * - Future-forward: progress ring, step cards with personalized AI hints
 * - Frictionless: one-click CTA per step, skip without guilt
 * - Celebratory: milestone animation when all steps complete
 * - Non-intrusive: collapses to a slim banner once artist has seen it
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  SkipForward,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ─── Step Card ─────────────────────────────────────────────────────────────────

type Step = {
  id: number;
  stepKey: string;
  stepTitle: string;
  stepDescription: string | null;
  stepOrder: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
  personalizedHint: string | null;
  ctaLabel: string | null;
  ctaPath: string | null;
  completedAt: Date | null;
};

function StepCard({
  step,
  isActive,
  onComplete,
  onSkip,
  onNavigate,
}: {
  step: Step;
  isActive: boolean;
  onComplete: (key: string) => void;
  onSkip: (key: string) => void;
  onNavigate: (path: string) => void;
}) {
  const isCompleted = step.status === "completed";
  const isSkipped = step.status === "skipped";
  const isDone = isCompleted || isSkipped;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-xl p-3 transition-all duration-200",
        isActive && !isDone && "bg-primary/5 ring-1 ring-primary/20",
        isDone && "opacity-50",
        !isActive && !isDone && "hover:bg-muted/40"
      )}
    >
      {/* Status Icon */}
      <div className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : isSkipped ? (
          <SkipForward className="h-5 w-5 text-muted-foreground" />
        ) : isActive ? (
          <div className="relative flex h-5 w-5 items-center justify-center">
            <div className="absolute h-5 w-5 animate-ping rounded-full bg-primary/30" />
            <div className="h-3 w-3 rounded-full bg-primary" />
          </div>
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/40" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {step.stepTitle}
          </p>
          {isActive && !isDone && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-semibold text-primary border-primary/30">
              Next
            </Badge>
          )}
        </div>

        {/* Personalized hint — only show for active/pending steps */}
        {!isDone && (step.personalizedHint || step.stepDescription) && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {step.personalizedHint || step.stepDescription}
          </p>
        )}

        {/* CTAs — only show for active step */}
        {isActive && !isDone && step.ctaPath && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onNavigate(step.ctaPath!)}
            >
              {step.ctaLabel || "Get started"}
              <ArrowRight className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onSkip(step.stepKey)}
            >
              Skip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Celebration Banner ────────────────────────────────────────────────────────

function CelebrationBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 ring-1 ring-primary/20">
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">You're all set, artist.</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your Boptone is live. Every stream, tip, and sale is now tracked in real time.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 h-8 w-8 p-0 text-muted-foreground"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}

// ─── Main Widget ───────────────────────────────────────────────────────────────

export function ActivationFunnelWidget() {
  const [, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.activation.getSteps.useQuery(undefined, {
    staleTime: 30_000,
  });

  const markComplete = trpc.activation.markStepComplete.useMutation({
    onSuccess: () => utils.activation.getSteps.invalidate(),
  });

  const skipStep = trpc.activation.skipStep.useMutation({
    onSuccess: () => utils.activation.getSteps.invalidate(),
  });

  const dismissAll = trpc.activation.dismissAll.useMutation({
    onSuccess: () => utils.activation.getSteps.invalidate(),
  });

  if (isLoading) return null;
  if (!data || data.steps.length === 0) return null;

  // Hide widget if all steps are done AND celebration was dismissed
  if (data.allComplete && celebrationDismissed) return null;

  const progress = Math.round((data.completedCount / data.totalCount) * 100);

  // Find the first non-done step (the "active" step)
  const activeStep = data.steps.find(
    (s) => s.status === "pending" || s.status === "in_progress"
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    // Optimistically mark as in_progress
    if (activeStep) {
      markComplete.mutate({ stepKey: activeStep.stepKey });
    }
  };

  const handleSkip = (stepKey: string) => {
    skipStep.mutate({ stepKey });
    toast.info("Step skipped — you can always come back to this.");
  };

  const handleDismissAll = () => {
    dismissAll.mutate(undefined, {
      onSuccess: () => {
        toast.success("Activation guide dismissed. You can always find it in Settings.");
        setCelebrationDismissed(true);
      },
    });
  };

  // Show celebration if all complete
  if (data.allComplete) {
    return (
      <CelebrationBanner onDismiss={() => setCelebrationDismissed(true)} />
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
      >
        {/* Progress Ring */}
        <div className="relative shrink-0">
          <ProgressRing progress={progress} size={44} strokeWidth={3} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary">
              {data.completedCount}/{data.totalCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-sm font-semibold truncate">Get started on Boptone</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {activeStep
              ? `Next: ${activeStep.stepTitle}`
              : "Almost there — finish your last steps"}
          </p>
        </div>

        {/* Expand toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleDismissAll();
            }}
            title="Dismiss guide"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Steps list */}
      {isExpanded && (
        <div className="border-t border-border/40 px-3 py-2 space-y-0.5">
          {data.steps.map((step) => (
            <StepCard
              key={step.stepKey}
              step={step as Step}
              isActive={step.stepKey === activeStep?.stepKey}
              onComplete={(key) => markComplete.mutate({ stepKey: key })}
              onSkip={handleSkip}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivationFunnelWidget;
