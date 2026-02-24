import { Button } from "@/components/ui/button";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import { useLocation } from "wouter";

export default function Features() {
  const [, setLocation] = useLocation();

  const features = [
    {
      title: "Upload & Distribute Music",
      description: "Upload your music and reach fans worldwide. Keep 90% of what you earn—no middlemen, no platform fees.",
      benefits: [
        "Upload in minutes",
        "Keep 90% of revenue",
        "Reach fans globally",
        "You own everything"
      ]
    },
    {
      title: "Track Your Money",
      description: "See all your earnings in one place. Track streaming, sales, and shows with simple, clear reports.",
      benefits: [
        "All revenue in one dashboard",
        "Easy-to-read reports",
        "Monthly payouts",
        "Tax documents included"
      ]
    },
    {
      title: "Sell Your Merch",
      description: "Sell t-shirts, albums, and experiences directly to fans. We handle payments and tracking for you.",
      benefits: [
        "Sell physical & digital products",
        "Built-in payment processing",
        "Automatic inventory tracking",
        "Sell meet & greets and lessons"
      ]
    },
    {
      title: "Get Career Advice",
      description: "Toney, your AI advisor, gives you personalized tips on when to release music, how to grow, and what to do next.",
      benefits: [
        "Release timing suggestions",
        "Growth recommendations",
        "Marketing ideas",
        "Trend insights"
      ]
    },
    {
      title: "Protect Your Music",
      description: "We automatically find and remove unauthorized copies of your music from the internet. Your work stays yours.",
      benefits: [
        "Automatic copyright monitoring",
        "Instant takedown requests",
        "Monitors YouTube, SoundCloud, etc.",
        "Complete protection history"
      ]
    },
    {
      title: "See Your Stats",
      description: "Simple charts show who's listening, where they're from, and how you're growing. No confusing data.",
      benefits: [
        "Real-time listener stats",
        "Fan location maps",
        "Growth charts",
        "Social media tracking"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - Minimal with massive typography */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container py-32">
          <div className="max-w-4xl">
            <h1 className="text-7xl md:text-8xl font-bold leading-none mb-8">
              Everything
              <br />
              You Need.
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed mb-12 max-w-2xl">
              Upload music, get paid, sell merch, and grow your career—all in one simple platform.
            </p>
            <div className="flex gap-4">
              <Button 
                className="rounded-full text-lg px-10 py-7 bg-black hover:bg-gray-800 text-white" 
                size="lg" 
                onClick={() => setLocation("/signup")}
              >
                Start Free
              </Button>
              <Button 
                className="rounded-full text-lg px-10 py-7 border border-gray-200 hover:border-gray-400" 
                size="lg" 
                variant="outline" 
                onClick={() => setLocation("/bap-protocol")}
              >
                Learn About BopAudio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Xerox gradient background */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container py-16">
          <div className="grid grid-cols-3 gap-12 max-w-4xl">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">6 Tools</div>
              <div className="text-lg text-gray-600">One Platform</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">90%</div>
              <div className="text-lg text-gray-600">You Keep</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-lg text-gray-600">Simple</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - Minimal cards with xerox background */}
      <div className="bg-white py-32">
        <div className="container">
          <h2 className="text-6xl font-bold mb-20 max-w-3xl">
            Six Powerful Tools.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="border border-gray-200 bg-white p-10 hover:border-gray-400 transition-colors rounded-xl"
              >
                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">{feature.description}</p>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-black mt-2 flex-shrink-0" />
                      <p className="text-base font-medium">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section - Minimal with bold typography */}
      <div className="border-t border-gray-200 bg-white py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-20 items-start max-w-6xl">
            {/* Left: Massive headline */}
            <div>
              <h2 className="text-7xl font-bold leading-tight mb-8">
                Why
                <br />
                Boptone?
              </h2>
              <p className="text-2xl text-gray-600 leading-relaxed">
                Stop juggling multiple platforms. Everything you need in one place.
              </p>
            </div>

            {/* Right: Comparison cards */}
            <div className="space-y-8">
              {/* Without Boptone */}
              <div className="border border-gray-200 hover:border-gray-400 transition-colors bg-gray-50 p-10 rounded-xl">
                <h3 className="text-2xl font-bold mb-6">Without Boptone</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">×</span>
                    <span className="font-medium text-lg">Using 10+ different websites</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">×</span>
                    <span className="font-medium text-lg">Losing 30-50% to middlemen</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">×</span>
                    <span className="font-medium text-lg">Tracking everything manually</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">×</span>
                    <span className="font-medium text-lg">No help or guidance</span>
                  </li>
                </ul>
              </div>

              {/* With Boptone */}
              <div className="border border-gray-200 hover:border-gray-400 transition-colors bg-white p-10 rounded-xl">
                <h3 className="text-2xl font-bold mb-6">With Boptone</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">✓</span>
                    <span className="font-medium text-lg">Everything in one place</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">✓</span>
                    <span className="font-medium text-lg">Keep 90% of your money</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">✓</span>
                    <span className="font-medium text-lg">Automatic tracking</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-xl">✓</span>
                    <span className="font-medium text-lg">AI advisor helps you grow</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Bold and centered with xerox gradient */}
      <div className="border-t border-gray-200 bg-gray-50 py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-7xl font-bold leading-tight">
              Ready to Create
              <br />
              Your Tone?
            </h2>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of artists building their careers on the complete Creator OS
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button 
                className="rounded-full text-lg px-12 py-7 bg-black hover:bg-gray-800 text-white" 
                size="lg" 
                onClick={() => setLocation("/signup")}
              >
                Start Free
              </Button>
              <Button 
                className="rounded-full text-lg px-12 py-7 border border-gray-200 hover:border-gray-400" 
                size="lg" 
                variant="outline" 
                onClick={() => setLocation("/demo")}
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Trust signals - Text only, no icons */}
            <div className="flex items-center justify-center gap-10 pt-10 text-gray-600">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl">✓</span>
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl">✓</span>
                <span className="font-medium">14-day Pro trial</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl">✓</span>
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToneyChatbot />
    </div>
  );
}
