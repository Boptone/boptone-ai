import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

const rotatingPhrases = ["Automate Your Tone.", "Create Your Tone.", "Own Your Tone."];

/**
 * Landing Page for Boptone Platform
 * 
 * Target Audience: ARTISTS (not fans/shoppers)
 * Purpose: Convert artists to sign up for Free/Pro/Enterprise plans
 * 
 * Design: Revolutionary aesthetic with thick borders, gradients, hover effects
 * Messaging: Artist-focused value proposition (distribution, analytics, financial tools)
 */
export default function Landing() {
  const [verbIndex, setVerbIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setVerbIndex((prev) => (prev + 1) % rotatingPhrases.length);
        setIsAnimating(false);
      }, 3000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Career Advisor",
      description: "Get personalized guidance on releases, marketing, and growth strategies.",
      color: "teal"
    },
    {
      title: "Financial Management",
      description: "Track revenue across all sources and access royalty-backed micro-loans.",
      color: "green"
    },
    {
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital downloads, and experiences directly to fans.",
      color: "orange"
    },
    {
      title: "IP Protection",
      description: "Intelligent copyright monitoring with instant DMCA takedowns.",
      color: "purple"
    },
    {
      title: "Healthcare & Wellness",
      description: "Artist-focused health coverage including mental health and vocal care.",
      color: "blue"
    },
    {
      title: "Tour Management",
      description: "Plan tours, track venues, manage budgets, and maximize live revenue.",
      color: "indigo"
    },
    {
      title: "Global Distribution",
      description: "Distribute your music to all major streaming platforms in real-time.",
      color: "teal"
    },
    {
      title: "Analytics & Insights",
      description: "Track performance across platforms with actionable insights.",
      color: "purple"
    },
    {
      title: "Marketing Tools",
      description: "Launch campaigns, track engagement, and grow your audience.",
      color: "orange"
    }
  ];

  const tiers = [
    {
      name: "Enterprise",
      monthlyPrice: 149,
      annualPrice: 124,
      platformFee: "10%",
      description: "Advanced features for teams, labels, and artists managing complex operations",
      features: [
        "Everything in Pro",
        "Keep 90% of all revenue",
        "Team accounts (10 seats)",
        "White-label embeds",
        "API access",
        "Advanced tour management",
        "IP protection tools",
        "Microloans (up to $50K)",
        "Healthcare benefits access",
        "Dedicated account manager",
        "1-hour support response",
        "Quarterly strategy sessions",
        "Early access to new features"
      ],
      cta: "Contact Sales",
      borderColor: "border-purple-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 41,
      platformFee: "10%",
      description: "Unlimited uploads, third-party distribution, and powerful tools to scale your career",
      features: [
        "Everything in Free",
        "Keep 90% of all revenue",
        "Unlimited tracks & storage",
        "Third-party distribution",
        "Advanced analytics & fan data",
        "Smart links with source tracking",
        "Fan data ownership & export",
        "Unlimited e-commerce products",
        "Printful integration",
        "Toney AI unlimited",
        "Image generation (50/month)",
        "Songwriter splits & payouts",
        "Team accounts (3 seats)",
        "Priority support (24-hour response)"
      ],
      cta: "Start Pro",
      borderColor: "border-teal-500",
      bgGradient: "from-teal-50 to-cyan-50"
    },
    {
      name: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      platformFee: "10%",
      description: "Build your foundation—collect fans, sell music, grow your audience",
      features: [
        "Keep 90% of all revenue",
        "Kick In tips: 100% to you",
        "BopAudio streaming platform",
        "Third-party distribution",
        "Basic profile + 10 tracks",
        "1GB storage",
        "Basic analytics",
        "E-commerce (3 products max)",
        "Toney AI (5 questions/month)",
        "Community support"
      ],
      cta: "Get Started",
      borderColor: "border-green-500",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  const stats = [
    { number: "$2.5M+", label: "Paid to Artists", color: "from-green-600 to-emerald-600" },
    { number: "50K+", label: "Tracks Distributed", color: "from-blue-600 to-indigo-600" },
    { number: "180+", label: "Countries Reached", color: "from-purple-600 to-pink-600" },
    { number: "99.9%", label: "Uptime", color: "from-orange-600 to-red-600" }
  ];

  const currentPrice = (tier: typeof tiers[0]) => 
    isAnnual ? tier.annualPrice : tier.monthlyPrice;

  const savings = (tier: typeof tiers[0]) => 
    tier.monthlyPrice > 0 ? Math.round((tier.monthlyPrice * 12 - tier.annualPrice * 12) / (tier.monthlyPrice * 12) * 100) : 0;

  const colorMap: Record<string, string> = {
    teal: "border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50",
    green: "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50",
    orange: "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50",
    purple: "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50",
    blue: "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50",
    indigo: "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Rotating Phrases for Artists */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight">
              <span className={`inline-block min-w-[280px] md:min-w-[650px] transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                {rotatingPhrases[verbIndex]}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl leading-relaxed">
              Boptone is the all-in-one platform built for artists at every stage.
              Distribution, analytics, and financial tools—designed to help you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-lg h-14 px-8 border-4 border-teal-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Revolutionary Design */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Color-Coded Cards */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Everything you need to build a{" "}
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                sustainable music career
              </span>
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed">
              From distribution to healthcare, Boptone handles the business so you can focus on creating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`border-4 rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colorMap[feature.color]}`}
              >
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-lg text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Revolutionary Design */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-6">Choose Your Plan</h2>
            <p className="text-2xl text-gray-700 mb-8">
              Start free, upgrade as you grow
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-base font-medium ${!isAnnual ? 'text-black' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base font-medium ${isAnnual ? 'text-black' : 'text-gray-500'}`}>
                Annual
                <span className="ml-2 text-teal-600 font-bold">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <div 
                key={index} 
                className={`relative border-4 ${tier.borderColor} rounded-3xl p-10 flex flex-col bg-gradient-to-br ${tier.bgGradient} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                {/* Tier Name */}
                <div className="mb-4">
                  <h3 className="text-3xl font-black">{tier.name}</h3>
                  <p className="text-lg text-gray-600 mt-2">{tier.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {tier.monthlyPrice === 0 ? (
                    <div className="text-5xl font-black">Free</div>
                  ) : (
                    <div>
                      <div className="text-5xl font-black">
                        ${currentPrice(tier)}
                        <span className="text-2xl text-gray-600 font-normal">/mo</span>
                      </div>
                      {isAnnual && savings(tier) > 0 && (
                        <div className="text-sm text-teal-600 font-bold mt-1">
                          Save ${tier.monthlyPrice * 12 - tier.annualPrice * 12}/year
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-base text-gray-600 mt-2">
                    {tier.platformFee} platform fee on sales
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold text-lg">✓</span>
                      <span className="text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  className="w-full rounded-full h-14 text-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-4 border-teal-500 transition-all duration-300 hover:scale-105 hover:shadow-xl font-black"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Bold Gradient */}
      <section className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Ready to Build Your Career?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of artists building sustainable careers on Boptone. 
            Start free, scale as you grow.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-teal-600 hover:bg-gray-100 text-xl px-12 py-8 h-auto rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl border-4 border-white font-black"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="/music" className="text-gray-400 hover:text-white transition-colors">Music</a></li>
                <li><a href="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/api" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="/press" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2026 Boptone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
