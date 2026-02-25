import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { StripeCheckout } from "@/components/StripeCheckout";

import { useDemo } from "@/contexts/DemoContext";
import { useLocation } from "wouter";

const rotatingPhrases = ["Automate Your Tone.", "Create Your Tone.", "Own Your Tone."];

export default function Home() {
  const [, setLocation] = useLocation();
  const { setDemoMode } = useDemo();
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
      description: "Get personalized guidance on releases, marketing, and growth strategies."
    },
    {
      title: "Financial Management",
      description: "Track revenue across all sources and access royalty-backed micro-loans."
    },
    {
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital downloads, and experiences directly to fans."
    },
    {
      title: "IP Protection",
      description: "Intelligent copyright monitoring with instant DMCA takedowns."
    },
    {
      title: "Healthcare & Wellness",
      description: "Artist-focused health coverage including mental health and vocal care."
    },
    {
      title: "Tour Management",
      description: "Plan tours, track venues, manage budgets, and maximize live revenue."
    },
    {
      title: "Global Distribution",
      description: "Distribute your music to all major streaming platforms in real-time."
    },
    {
      title: "Analytics & Insights",
      description: "Track performance across platforms with actionable insights."
    },
    {
      title: "Marketing Tools",
      description: "Launch campaigns, track engagement, and grow your audience."
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
      cta: "Contact Sales"
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
      cta: "Start Pro"
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
      cta: "Get Started"
    }
  ];

  const stats = [
    { number: "$2.5M+", label: "Paid to Artists" },
    { number: "50K+", label: "Tracks Distributed" },
    { number: "180+", label: "Countries Reached" },
    { number: "99.9%", label: "Uptime" }
  ];

  const handleDemoClick = () => {
    setLocation("/explainer");
  };

  const currentPrice = (tier: typeof tiers[0]) => 
    isAnnual ? tier.annualPrice : tier.monthlyPrice;

  const savings = (tier: typeof tiers[0]) => 
    tier.monthlyPrice > 0 ? Math.round((tier.monthlyPrice * 12 - tier.annualPrice * 12) / (tier.monthlyPrice * 12) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - ROTATING PHRASES INTACT */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight">
              <span className={`inline-block min-w-[280px] md:min-w-[650px] transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                {rotatingPhrases[verbIndex]}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl leading-relaxed">
              Boptone is the all-in-one platform built for independent artists at every stage.
              Distribution, analytics, and financial tools—designed to help you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full bg-[#0cc0df] text-black hover:bg-[#0aabca] text-lg h-14 px-8 border border-black transition-colors"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - BAP Protocol Design */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - BAP Protocol Design */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything you need to build a sustainable music career
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed">
              From distribution to healthcare, Boptone handles the business so you can focus on creating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="border border-black rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
              >
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-lg text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - BAP Protocol Design */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Choose Your Plan</h2>
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
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-[#0cc0df] focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base font-medium ${isAnnual ? 'text-black' : 'text-gray-500'}`}>
                Annual
                <span className="ml-2 text-[#0cc0df] font-semibold">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <div 
                key={index} 
                className="relative border border-black p-10 flex flex-col hover:bg-white transition-colors bg-white rounded-lg"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
              >
                {/* Tier Name */}
                <div className="mb-4">
                  <h3 className="text-3xl font-bold">{tier.name}</h3>
                  <p className="text-lg text-gray-600 mt-2">{tier.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {tier.monthlyPrice === 0 ? (
                    <div className="text-5xl font-bold">Free</div>
                  ) : (
                    <div>
                      <div className="text-5xl font-bold">
                        ${currentPrice(tier)}
                        <span className="text-2xl text-gray-600 font-normal">/mo</span>
                      </div>
                      {isAnnual && savings(tier) > 0 && (
                        <div className="text-sm text-[#0cc0df] font-semibold mt-1">
                          Save ${tier.monthlyPrice * 12 - tier.annualPrice * 12}/year
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-base text-gray-600 mt-2">
                    {tier.platformFee} platform fee on sales
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-base">
                      <span className="text-[#0cc0df] font-bold mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="w-full rounded-full bg-[#0cc0df] text-black hover:bg-[#0aabca] border border-black transition-colors"
                  style={{
                    boxShadow: '4px 4px 0 0 black'
                  }}
                  onClick={() => {
                    if (tier.name === "Enterprise") {
                      window.location.href = "/contact";
                    } else {
                      window.location.href = getLoginUrl();
                    }
                  }}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - BAP Protocol Design */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to automate your tone?
            </h2>
            <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
              Join thousands of artists building sustainable careers on Boptone.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-[#0cc0df] text-black hover:bg-[#0aabca] text-lg h-14 px-8 border border-black transition-colors"
              style={{
                boxShadow: '4px 4px 0 0 black'
              }}
              onClick={() => window.location.href = getLoginUrl()}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
