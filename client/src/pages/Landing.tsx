import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

const rotatingWords = ["Create", "Automate", "Own"];

/**
 * Landing Page for Boptone Platform
 * 
 * Target Audience: ARTISTS (not fans/shoppers)
 * Purpose: Position Boptone as the necessary alternative - the platform artists have been waiting for
 * 
 * Design: BAP Protocol (black borders, brutalist shadows, rounded-lg, cyan buttons)
 * Messaging: Hard-hitting value proposition (ownership, transparency, consolidation)
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
        setVerbIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "One Login. Your Entire Business.",
      description: "Distribution, analytics, commerce, payments, and fan management in a single platform."
    },
    {
      title: "You Keep 90%. We Keep 10%.",
      description: "No hidden fees. No surprise charges. Transparent revenue split on everything you earn."
    },
    {
      title: "Your Data. Your Fans. Your Revenue.",
      description: "You own your audience data. Export it anytime. No platform lock-in."
    },
    {
      title: "Global Distribution",
      description: "Deliver your music to every major streaming platform. Real-time tracking across all services."
    },
    {
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital downloads, and experiences. Keep 90% of every sale."
    },
    {
      title: "Financial Tools",
      description: "Track revenue across all sources. Access royalty-backed micro-loans when you need capital."
    },
    {
      title: "IP Protection",
      description: "Automated copyright monitoring with instant takedown capabilities to protect your work."
    },
    {
      title: "Healthcare Access",
      description: "Artist-focused health coverage including mental health support and vocal care."
    },
    {
      title: "Tour Management",
      description: "Plan tours, track venues, manage budgets, and maximize revenue from live performances."
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
      highlight: false
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
      highlight: true
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
      highlight: false
    }
  ];

  const stats = [
    { number: "$2.5M+", label: "Paid to Artists" },
    { number: "50K+", label: "Tracks Distributed" },
    { number: "180+", label: "Countries Reached" },
    { number: "99.9%", label: "Uptime" }
  ];

  const currentPrice = (tier: typeof tiers[0]) => 
    isAnnual ? tier.annualPrice : tier.monthlyPrice;

  const savings = (tier: typeof tiers[0]) => 
    tier.monthlyPrice > 0 ? Math.round((tier.monthlyPrice * 12 - tier.annualPrice * 12) / (tier.monthlyPrice * 12) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold mb-6 leading-[0.9]">
              <span className={`inline-block transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                {rotatingWords[verbIndex]}
              </span>
              <br />
              <span>Your Tone.</span>
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Boptone
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              The Autonomous Operating System for Artists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full bg-[#0cc0df] hover:bg-[#0aa0bf] text-black text-lg font-bold h-14 px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-black mb-2 text-black">
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

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed">
              Built for artists who want control over their business without juggling multiple platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-lg text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-gray-50">
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
                <span className="ml-2 text-[#0cc0df] font-bold">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <div 
                key={index} 
                className={`bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  tier.highlight ? 'ring-4 ring-[#0cc0df]' : ''
                }`}
              >
                {tier.highlight && (
                  <div className="bg-[#0cc0df] text-black text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-3xl font-black mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-black">${currentPrice(tier)}</span>
                  {tier.monthlyPrice > 0 && (
                    <span className="text-gray-600 text-lg">/{isAnnual ? 'mo' : 'month'}</span>
                  )}
                  {isAnnual && savings(tier) > 0 && (
                    <div className="text-sm text-[#0cc0df] font-bold mt-1">
                      Save {savings(tier)}% annually
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-6">{tier.description}</p>
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-1">Platform Fee</div>
                  <div className="text-2xl font-bold">{tier.platformFee}</div>
                </div>
                <Button 
                  className={`w-full rounded-full font-bold h-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    tier.highlight 
                      ? 'bg-[#0cc0df] hover:bg-[#0aa0bf] text-black' 
                      : 'bg-white hover:bg-gray-50 text-black'
                  }`}
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  {tier.cta}
                </Button>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#0cc0df] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-black mb-12 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                question: "What makes Boptone different?",
                answer: "Boptone consolidates your entire music business into one platform. Instead of managing separate accounts for distribution, commerce, analytics, and payments, you have one login. You own your data, you keep 90% of your revenue, and there are no hidden fees."
              },
              {
                question: "Can I really keep 90% of my revenue?",
                answer: "Yes. Boptone takes a flat 10% platform fee on all revenue you generate through the platform (streaming, sales, tips, merchandise). No surprise charges, no hidden fees. If you earn $1000, you keep $900."
              },
              {
                question: "Do I own my fan data?",
                answer: "Absolutely. You own your audience data and can export it anytime. No platform lock-in. Your fans are yours, not ours."
              },
              {
                question: "How does distribution work?",
                answer: "Upload your music once, and we deliver it to all major streaming platforms (Spotify, Apple Music, Amazon Music, Deezer, and more). Track performance across all services in real-time from your dashboard."
              },
              {
                question: "What if I already use other platforms?",
                answer: "You can migrate to Boptone at your own pace. Many artists start by using Boptone for commerce or analytics while keeping existing distribution, then consolidate everything once they're comfortable."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full text-left p-6 flex justify-between items-center"
                >
                  <span className="text-xl font-bold">{faq.question}</span>
                  <svg 
                    className={`w-6 h-6 transform transition-transform ${faqOpen === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === index && (
                  <div className="px-6 pb-6 text-gray-700 text-lg leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to take control?</h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of artists building sustainable careers on their own terms.
          </p>
          <Button 
            size="lg" 
            className="rounded-full bg-[#0cc0df] hover:bg-[#0aa0bf] text-black text-lg font-bold h-14 px-8 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
}
