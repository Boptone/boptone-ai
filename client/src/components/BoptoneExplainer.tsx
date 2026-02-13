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
  Globe,
  ShoppingBag,
  Shield,
  Bot,
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
    icon: Sparkles,
    title: "Welcome to Boptone",
    subtitle: "Your complete operating system",
    description:
      "Everything you need to build, manage, and grow your music career—all in one place. Distribution, commerce, analytics, financial tools, and AI-powered guidance.",
    highlight: null,
  },
  {
    id: 2,
    icon: Music2,
    title: "BAP Streaming",
    subtitle: "Keep 90% of every stream",
    description:
      "Set your own price ($0.01-$0.05 per stream) and get paid directly by fans. No middlemen, no waiting. You control pricing, you keep the revenue.",
    highlight: {
      label: "Example",
      content: "1,000 streams at $0.01 each = $9.00 to you (90% share)",
    },
  },
  {
    id: 3,
    icon: Globe,
    title: "Global Distribution",
    subtitle: "Reach fans everywhere",
    description:
      "Distribute your music to third-party streaming platforms with a few clicks. Track performance across all channels in real-time from one dashboard.",
    highlight: {
      label: "Unified View",
      content: "See all your streams, revenue, and fan data in one place—no more logging into multiple platforms.",
    },
  },
  {
    id: 4,
    icon: ShoppingBag,
    title: "BopShop Commerce",
    subtitle: "Sell anything, keep everything",
    description:
      "Merch, vinyl, digital downloads, tickets—your store, your rules. Integrated checkout and fulfillment. No separate e-commerce platform needed.",
    highlight: {
      label: "Your Store",
      content: "Sell physical and digital goods directly to fans. Keep more of what you earn.",
    },
  },
  {
    id: 5,
    icon: DollarSign,
    title: "Financial Tools",
    subtitle: "Get paid your way",
    description:
      "Instant payouts, micro-loans for tours and equipment, and affordable healthcare plans designed for artists. Financial support when you need it.",
    highlight: {
      label: "Flexible Payouts",
      content: "Daily, weekly, or monthly—you choose. $20 minimum, next business day delivery.",
    },
  },
  {
    id: 6,
    icon: Shield,
    title: "IP Protection",
    subtitle: "Protect your work automatically",
    description:
      "Our system monitors the internet 24/7 for unauthorized use of your music and handles takedowns for you. Your rights, protected.",
    highlight: {
      label: "Always Watching",
      content: "Automated monitoring and DMCA takedowns—no manual work required.",
    },
  },
  {
    id: 7,
    icon: TrendingUp,
    title: "Analytics & Insights",
    subtitle: "Make smarter decisions",
    description:
      "Real-time data on streams, revenue, and fan behavior. Know what's working and where to focus your energy. Data-driven career growth.",
    highlight: {
      label: "Full Visibility",
      content: "Track every metric that matters—streams, earnings, fan locations, and more.",
    },
  },
  {
    id: 8,
    icon: Bot,
    title: "AI Career Advisor",
    subtitle: "Meet Toney, your AI advisor",
    description:
      "Get personalized recommendations for release timing, pricing strategy, and career growth—backed by human expertise. Toney learns from your data to help you succeed.",
    highlight: {
      label: "Smart Guidance",
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
