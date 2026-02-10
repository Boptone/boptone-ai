import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Wallet, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setLocation("/onboarding");
    }
  };

  const handleSkip = () => {
    setLocation("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? "w-12 bg-blue-600"
                  : step < currentStep
                  ? "w-8 bg-blue-400"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Screen 1: Fans Pay You Directly */}
        {currentStep === 1 && (
          <div className="grid md:grid-cols-2 gap-12 items-center animate-in fade-in duration-500">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                Step 1 of 3
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tight">
                Fans Pay
                <br />
                <span className="text-blue-600">You Directly</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                No platform middleman taking 70%. Money flows straight from fans to your wallet—instantly.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold"
                  size="lg"
                >
                  Next
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="rounded-full text-gray-500 hover:text-gray-700"
                >
                  Skip
                </Button>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Fan */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-600 transform hover:scale-105 transition-transform">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                  <p className="mt-4 font-bold text-gray-800">Fan</p>
                </div>

                {/* Arrow */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
                  <ArrowRight className="w-8 h-8 text-blue-600 animate-bounce" style={{ animationDuration: "2s" }} />
                  <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
                </div>

                {/* Artist */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-600 transform hover:scale-105 transition-transform">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <p className="mt-4 font-bold text-gray-800">You</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Get Paid Instantly */}
        {currentStep === 2 && (
          <div className="grid md:grid-cols-2 gap-12 items-center animate-in fade-in duration-500">
            {/* Left: Visual */}
            <div className="relative h-96 order-2 md:order-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-green-500 transform hover:scale-105 transition-transform">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-bold text-green-600">$47.50</span>
                    <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-lg font-semibold">Just now</span>
                  </div>
                  <p className="mt-6 text-sm text-gray-500 uppercase tracking-wide font-bold">
                    Instant Payment
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                Step 2 of 3
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tight">
                Get Paid
                <br />
                <span className="text-green-600">Instantly</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Earnings hit your wallet immediately after streams. Not 90 days later.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold"
                  size="lg"
                >
                  Next
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="rounded-full text-gray-500 hover:text-gray-700"
                >
                  Skip
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Screen 3: You Control Your Earnings */}
        {currentStep === 3 && (
          <div className="grid md:grid-cols-2 gap-12 items-center animate-in fade-in duration-500">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                Step 3 of 3
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tight">
                You Control
                <br />
                <span className="text-purple-600">Your Earnings</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transparent dashboard shows real-time earnings. No hidden fees, no surprises.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg font-semibold"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="rounded-full text-gray-500 hover:text-gray-700"
                >
                  Skip
                </Button>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-600 w-full max-w-md transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Your Earnings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                      <span className="text-sm font-semibold text-gray-600 uppercase">Today</span>
                      <span className="text-2xl font-bold text-blue-600">$127.80</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                      <span className="text-sm font-semibold text-gray-600 uppercase">This Week</span>
                      <span className="text-2xl font-bold text-green-600">$892.40</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-2xl">
                      <span className="text-sm font-semibold text-gray-600 uppercase">This Month</span>
                      <span className="text-2xl font-bold text-purple-600">$3,456.20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skip link at bottom */}
        <div className="text-center mt-12">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
          >
            Skip introduction →
          </button>
        </div>
      </div>
    </div>
  );
}
