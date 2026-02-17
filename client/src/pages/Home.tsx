import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { StripeCheckout } from "@/components/StripeCheckout";
import { ToneyChatbot } from "@/components/ToneyChatbot";
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
        "BAP streaming platform",
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
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight">
              <span className={`inline-block transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                {rotatingPhrases[verbIndex]}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl leading-relaxed">
              The complete operating system for artists. Distribution, analytics, financial tools, and career guidance in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full bg-black text-white hover:bg-gray-800 text-lg h-14 px-8"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full border-2 border-black text-black hover:bg-gray-50 text-lg h-14 px-8"
                onClick={handleDemoClick}
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Xerox gradient background */}
      <section className="py-16 md:py-24" style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
      }}>
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

      {/* Features Section */}
      <section className="py-20 md:py-32" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)'
      }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to build a sustainable music career
            </h2>
            <p className="text-xl text-gray-700">
              From distribution to healthcare, Boptone handles the business so you can focus on creating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-base text-gray-700 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32" style={{
        background: 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)'
      }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Choose Your Plan</h2>
            <p className="text-xl text-gray-700 mb-8">
              Start free, upgrade as you grow
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-base font-medium ${!isAnnual ? 'text-black' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base font-medium ${isAnnual ? 'text-black' : 'text-gray-500'}`}>
                Annual
                <span className="ml-2 text-black font-semibold">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className="relative border-2 border-gray-200 p-8 flex flex-col hover:border-gray-400 transition-colors bg-white rounded-xl"
              >
                {/* Tier Name */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
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
                        <div className="text-sm text-gray-600 mt-2">
                          Save ${tier.monthlyPrice * 12 - tier.annualPrice * 12}/year
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-2">
                    Platform fee: {tier.platformFee} on BAP streams
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mb-6">
                  {tier.name === "Enterprise" ? (
                    <Button 
                      className="w-full rounded-full bg-black text-white hover:bg-gray-800 h-12"
                      onClick={() => setLocation("/contact")}
                    >
                      {tier.cta}
                    </Button>
                  ) : tier.name === "Free" ? (
                    <Button 
                      className="w-full rounded-full bg-black text-white hover:bg-gray-800 h-12"
                      onClick={() => window.location.href = getLoginUrl()}
                    >
                      {tier.cta}
                    </Button>
                  ) : (
                    <StripeCheckout 
                      tier={tier.name.toLowerCase() as "pro"}
                      buttonText={tier.cta}
                      className="w-full rounded-full bg-black text-white hover:bg-gray-800 h-12"
                    />
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <span className="text-black font-bold mt-1">•</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Pricing Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Pricing Information</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-2">Platform Fee Structure</h4>
                  <p className="text-gray-700">
                    Boptone takes 10% of BAP streaming revenue across all plans. You keep 90% of every stream. 
                    Tips received through "Kick In" have zero platform fees—you keep 100% (minus card processing fees).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">BopShop Commerce Fees</h4>
                  <p className="text-gray-700">
                    For merchandise and physical goods sold through BopShop, Boptone takes a small percentage 
                    of each sale. Credit card processing fees are passed through to artists at cost.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Third-Party Distribution</h4>
                  <p className="text-gray-700">
                    Revenue from third-party streaming platforms is subject to their standard payout structures. 
                    Boptone does not take additional fees on third-party revenue.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Payout Flexibility</h4>
                  <p className="text-gray-700">
                    Artists can withdraw earnings at any time, at any amount. Payouts are processed next-day 
                    by default, with options for weekly or monthly schedules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
      }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {[
                {
                  question: "How does the 90/10 revenue split work?",
                  answer: "For every stream on the Boptone Artist Protocol (BAP), you keep 90% of the revenue and Boptone takes 10%. This applies to all plans. Revenue from third-party platforms follows their standard payout structures."
                },
                {
                  question: "Can I upgrade or downgrade my plan anytime?",
                  answer: "Yes, you can change your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through Stripe. Annual plans can also be paid via invoice for Enterprise customers."
                },
                {
                  question: "How quickly can I withdraw my earnings?",
                  answer: "You can withdraw earnings at any time, at any amount. Payouts are processed next-day by default, similar to ride-sharing services. You can also choose weekly or monthly payout schedules."
                },
                {
                  question: "Do you take a cut of merchandise sales?",
                  answer: "Yes, Boptone takes a small percentage of BopShop sales (merchandise, vinyl, digital downloads). Credit card processing fees are passed through at cost. Tips received through 'Kick In' have zero platform fees."
                },
                {
                  question: "Is there a storage limit?",
                  answer: "Free plan includes 1GB of storage. Pro and Enterprise plans include unlimited storage for audio files, artwork, and other assets."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                    className="w-full text-left p-6 font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    {faq.question}
                    <span className="text-2xl">{faqOpen === index ? '−' : '+'}</span>
                  </button>
                  {faqOpen === index && (
                    <div className="px-6 pb-6 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to own your tone?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of artists building sustainable careers on Boptone.
          </p>
          <Button 
            size="lg" 
            className="rounded-full bg-white text-black hover:bg-gray-100 text-lg h-14 px-8"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      <ToneyChatbot />
    </div>
  );
}
