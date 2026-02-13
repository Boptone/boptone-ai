import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Music2,
  DollarSign,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { getLoginUrl } from "@/const";

interface BoptoneExplainerProps {
  mode: "public" | "private";
  onComplete?: () => void;
  onSkip?: () => void;
}

const EXPLAINER_STEPS = [
  {
    id: 1,
    icon: Music2,
    title: "Welcome to Boptone",
    subtitle: "The complete operating system for artists",
    description:
      "Everything you need to distribute, monetize, and grow your music career—all in one platform. No juggling multiple tools. No confusing dashboards. Just you, your music, and your fans.",
    highlight: null,
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Own Your Music",
    subtitle: "Keep 90% of every stream",
    description:
      "Traditional streaming pays artists $0.003-$0.005 per stream. With Boptone, you keep 90% of every dollar your fans pay. Real revenue. Real sustainability.",
    highlight: {
      label: "Example",
      content: "1,000 streams at $0.01 each = $9.00 to you (vs $3-$5 elsewhere)",
    },
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Set Your Price",
    subtitle: "You decide what fans pay per stream",
    description:
      "Choose between $0.01 and $0.05 per stream. Test different prices. Find what works for your audience. You're in control—not an algorithm.",
    highlight: {
      label: "Your Choice",
      content: "Lower price = more streams. Higher price = more per stream. You decide the strategy.",
    },
  },
  {
    id: 4,
    icon: Zap,
    title: "Get Paid Instantly",
    subtitle: "No waiting for quarterly payouts",
    description:
      "Track every stream in real-time. See exactly who's listening, when, and where. Withdraw your earnings whenever you're ready. No minimums. No delays.",
    highlight: {
      label: "Full Transparency",
      content: "Every stream is tracked. Every dollar is accounted for. You see it all.",
    },
  },
  {
    id: 5,
    icon: Sparkles,
    title: "AI-Powered Growth",
    subtitle: "Toney helps you optimize everything",
    description:
      "Get personalized recommendations on pricing strategy, release timing, marketing tactics, and career decisions. Toney learns from your data and the platform's collective intelligence to help you grow faster.",
    highlight: {
      label: "Smart Insights",
      content: "\"Try raising your price to $0.02—similar artists see 15% more revenue\"",
    },
  },
];

export default function BoptoneExplainer({
  mode,
  onComplete,
  onSkip,
}: BoptoneExplainerProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const progress = (currentStep / EXPLAINER_STEPS.length) * 100;
  const step = EXPLAINER_STEPS[currentStep - 1];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < EXPLAINER_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step
      if (mode === "public") {
        // Redirect to signup
        window.location.href = getLoginUrl();
      } else {
        // Private mode: call onComplete to continue onboarding
        onComplete?.();
      }
    }
  };

  const handleSkip = () => {
    if (mode === "private") {
      onSkip?.();
    }
  };

  const isLastStep = currentStep === EXPLAINER_STEPS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Skip button (private mode only) */}
        {mode === "private" && onSkip && (
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
              <X className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep} of {EXPLAINER_STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main content card */}
        <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-xl animate-in fade-in duration-500">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-300">
              <Icon className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 animate-in slide-in-from-bottom-4 duration-500">
            {step.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-center text-muted-foreground mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            {step.subtitle}
          </p>

          {/* Description */}
          <p className="text-lg text-center text-foreground/80 mb-8 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-200">
            {step.description}
          </p>

          {/* Highlight box (if exists) */}
          {step.highlight && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-300">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-primary mb-1">
                    {step.highlight.label}
                  </p>
                  <p className="text-foreground/70">{step.highlight.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-400">
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 rounded-full"
              >
                Back
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNext}
              className={`rounded-full ${currentStep === 1 ? "w-full" : "flex-1"}`}
            >
              {isLastStep
                ? mode === "public"
                  ? "Get Started Free"
                  : "Let's Build Your Profile"
                : "Next"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {EXPLAINER_STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.id === currentStep
                    ? "w-8 bg-primary"
                    : s.id < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "public"
            ? "Join thousands of artists building sustainable careers on Boptone"
            : "This will only take a minute"}
        </p>
      </div>
    </div>
  );
}
