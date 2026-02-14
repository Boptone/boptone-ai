import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-6xl relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-none transition-all duration-300 ${
                step === currentStep
                  ? "w-12 bg-black"
                  : step < currentStep
                  ? "w-8 bg-gray-600"
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
              <div className="inline-block px-4 py-2 bg-gray-100 text-black rounded-none text-sm font-bold uppercase tracking-wide border-4 border-black">
                Step 1 of 3
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tight">
                Fans Pay
                <br />
                <span className="text-black">You Directly</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                No platform middleman taking 70%. Money flows straight from fans to your wallet—instantly.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold"
                  size="lg"
                >
                  Next →
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
                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-none shadow-2xl p-8 border-4 border-black">
                  <div className="w-20 h-20 bg-gray-900 rounded-none flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">$</span>
                  </div>
                  <p className="mt-4 font-bold text-gray-800">Fan</p>
                </div>

                {/* Arrow */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-32 h-1 bg-black" />
                  <span className="text-4xl text-black">→</span>
                  <div className="w-32 h-1 bg-black" />
                </div>

                {/* Artist */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-none shadow-2xl p-8 border-4 border-black">
                  <div className="w-20 h-20 bg-gray-900 rounded-none flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">YOU</span>
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
                <div className="bg-white rounded-none shadow-2xl p-12 border-4 border-black">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">$47.50</span>
                    <span className="text-2xl font-bold text-black">INSTANT</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-black rounded-none" />
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
              <div className="inline-block px-4 py-2 bg-gray-100 text-black rounded-none text-sm font-bold uppercase tracking-wide border-4 border-black">
                Step 2 of 3
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tight">
                Get Paid
                <br />
                <span className="text-black">Instantly</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Earnings hit your wallet immediately after streams. Not 90 days later.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold"
                  size="lg"
                >
                  Next →
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
              <div className="inline-block px-4 py-2 bg-gray-100 text-black rounded-none text-sm font-bold uppercase tracking-wide border-4 border-black">
                Step 3 of 3
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tight">
                You Control
                <br />
                <span className="text-black">Your Earnings</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transparent dashboard shows real-time earnings. No hidden fees, no surprises.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold"
                  size="lg"
                >
                  Get Started →
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
                <div className="bg-white rounded-none shadow-2xl p-8 border-4 border-black w-full max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl font-bold">$</span>
                    <h3 className="text-2xl font-bold text-gray-800">Your Earnings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-none border-4 border-black">
                      <span className="text-sm font-semibold text-gray-600 uppercase">Today</span>
                      <span className="text-2xl font-bold text-black">$127.80</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-none border-4 border-black">
                      <span className="text-sm font-semibold text-gray-600 uppercase">This Week</span>
                      <span className="text-2xl font-bold text-black">$892.40</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-none border-4 border-black">
                      <span className="text-sm font-semibold text-gray-600 uppercase">This Month</span>
                      <span className="text-2xl font-bold text-black">$3,456.20</span>
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
