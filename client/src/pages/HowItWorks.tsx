import { useState } from "react";
import { ArrowRight, DollarSign, Zap, BarChart3, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";

/**
 * Phase 2: "How Boptone Works" Education Screens
 * 
 * 3 simple screens (30 seconds total) explaining BAP economics:
 * 1. Fans Pay You Directly
 * 2. Get Paid Instantly
 * 3. You Control Your Earnings
 * 
 * Design principles:
 * - 1 headline (8 words max)
 * - 1 explanation (15 words max)
 * - 1 simple visual/icon
 * - Progress dots
 * - Next + Skip buttons
 */

const screens = [
  {
    id: 1,
    icon: DollarSign,
    headline: "Fans Pay You Directly",
    description: "No platform middleman taking 70%. Money flows straight from fans to you.",
    visual: (
      <div className="flex items-center justify-center gap-8 my-8">
        {/* Fan */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Music className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm font-medium">Fan</p>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <ArrowRight className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-xs text-muted-foreground mt-1">Direct</p>
        </div>

        {/* Artist */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm font-medium">You</p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: Zap,
    headline: "Get Paid Instantly",
    description: "Earnings hit your wallet immediately after streams. Not 90 days later.",
    visual: (
      <div className="flex flex-col items-center gap-6 my-8">
        {/* Instant payment visual */}
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border-2 border-green-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">$47.50</p>
              <p className="text-xs text-green-600 mt-1">Just now</p>
            </div>
          </div>
          <div className="absolute -top-2 -right-2">
            <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Instant deposits, no waiting</p>
      </div>
    ),
  },
  {
    id: 3,
    icon: BarChart3,
    headline: "You Control Your Earnings",
    description: "Transparent dashboard shows real-time earnings. No hidden fees, no surprises.",
    visual: (
      <div className="flex flex-col items-center gap-4 my-8">
        {/* Dashboard preview */}
        <div className="w-full max-w-sm bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="text-2xl font-bold text-primary">$127.80</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span className="text-xl font-semibold">$892.40</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="text-xl font-semibold">$3,456.20</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Track every dollar in real-time</p>
      </div>
    ),
  },
];

export default function HowItWorks() {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Last screen - go to profile setup
      window.location.href = "/onboarding";
    }
  };

  const handleSkip = () => {
    window.location.href = "/onboarding";
  };

  const screen = screens[currentScreen];
  const Icon = screen.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="rounded-xl w-full max-w-2xl">
        <CardContent className="p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">{APP_TITLE}</h1>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {screen.headline}
          </h2>

          {/* Description */}
          <p className="text-lg text-center text-muted-foreground mb-8 max-w-md mx-auto">
            {screen.description}
          </p>

          {/* Visual */}
          <div className="mb-8">
            {screen.visual}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentScreen
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="flex-1 rounded-full"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 rounded-full"
            >
              {currentScreen < screens.length - 1 ? "Next" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Step indicator */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Step {currentScreen + 1} of {screens.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
