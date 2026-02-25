import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { StripeCheckout } from "@/components/StripeCheckout";

import { useDemo } from "@/contexts/DemoContext";
import { useLocation } from "wouter";
import { Check, Music, DollarSign, TrendingUp, Shield, Zap, Users } from "lucide-react";

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

  const coreFeatures = [
    {
      icon: Music,
      title: "Upload & Distribute",
      description: "Get your music on Spotify, Apple Music, and 150+ platforms. Keep 100% of your rights."
    },
    {
      icon: DollarSign,
      title: "Sell Direct",
      description: "Merch, tickets, digital downloads. Your store, your prices, your profit."
    },
    {
      icon: TrendingUp,
      title: "Track Everything",
      description: "Real-time streams, sales, and revenue across all platforms in one dashboard."
    },
    {
      icon: Shield,
      title: "Protect Your Work",
      description: "Automated copyright monitoring. We catch infringement, you file takedowns with one click."
    },
    {
      icon: Zap,
      title: "Automate the Boring Stuff",
      description: "Release schedules, social posts, email campaigns. Set it once, let it run."
    },
    {
      icon: Users,
      title: "Know Your Fans",
      description: "See who's listening, where they're from, what they buy. Build your audience smarter."
    }
  ];

  const tiers = [
    {
      name: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      platformFee: "15%",
      description: "Start building your career. No credit card required.",
      features: [
        "Upload unlimited tracks",
        "Keep 85% of streaming revenue",
        "Basic analytics dashboard",
        "Fan engagement tools",
        "Email support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 41,
      platformFee: "10%",
      description: "Everything you need to run your music business.",
      features: [
        "Everything in Free",
        "Keep 90% of all revenue",
        "Third-party distribution (Spotify, Apple, etc.)",
        "BopShop storefront (sell merch & downloads)",
        "Advanced analytics & insights",
        "Automated marketing campaigns",
        "Copyright protection tools",
        "Priority support"
      ],
      cta: "Go Pro",
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 149,
      annualPrice: 124,
      platformFee: "10%",
      description: "For labels, teams, and artists scaling operations.",
      features: [
        "Everything in Pro",
        "Team accounts (10 seats)",
        "White-label embeds",
        "API access",
        "Microloans (up to $50K)",
        "Healthcare benefits access",
        "Dedicated account manager",
        "1-hour support response"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Do I keep the rights to my music?",
      answer: "Yes. 100%. Always. You own your masters, your publishing, your data. Boptone is a tool you use, not a label you sign with."
    },
    {
      question: "How do payouts work?",
      answer: "You get paid when you get paid. Streaming royalties flow through as platforms pay us. Sales revenue (merch, downloads) hits your account instantly. Withdraw anytime, no minimums."
    },
    {
      question: "Can I leave anytime?",
      answer: "Yes. Cancel your subscription, download your data, take your fans with you. No lock-in, no penalties, no questions asked."
    },
    {
      question: "What's the platform fee?",
      answer: "Free tier: 15%. Pro/Enterprise: 10%. That covers payment processing, hosting, distribution, and keeping the lights on. No hidden fees, no surprise deductions."
    },
    {
      question: "Do I need to be 'established' to use Boptone?",
      answer: "No. Whether you're uploading your first track or managing a catalog of 500 songs, Boptone works for you. Start free, scale when you're ready."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span
              className={`inline-block transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              {rotatingPhrases[verbIndex]}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            Upload your music. Sell your merch. Build your audience. Get paid.
            <br />
            <strong>All in one place. No middlemen. No bullshit.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-lg bg-[#0cc0df] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 py-6 text-lg font-bold"
              onClick={() => setLocation("/signup")}
            >
              Start Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 py-6 text-lg font-bold"
              onClick={() => {
                setDemoMode(true);
                setLocation("/dashboard");
              }}
            >
              See Demo
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Run Your Music Business
            </h2>
            <p className="text-lg text-gray-700">
              Stop juggling 10 platforms. Boptone is your command center.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 rounded-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                >
                  <Icon className="w-10 h-10 mb-4 text-black" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple Pricing. No Surprises.
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-lg ${!isAnnual ? "font-bold" : "text-gray-600"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-14 h-8 rounded-full bg-black transition-colors"
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-[#0cc0df] transition-transform ${
                    isAnnual ? "translate-x-6" : ""
                  }`}
                />
              </button>
              <span className={`text-lg ${isAnnual ? "font-bold" : "text-gray-600"}`}>
                Annual
                <span className="ml-2 text-sm bg-[#0cc0df] text-black px-2 py-1 rounded-lg">
                  Save 17%
                </span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                className={`p-8 rounded-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  tier.popular ? "relative" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0cc0df] text-black px-4 py-1 rounded-lg text-sm font-bold border-2 border-black">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-gray-600">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{tier.description}</p>
                  <p className="text-sm font-bold">
                    Platform fee: {tier.platformFee}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.name === "Enterprise" ? (
                  <Button
                    className="w-full rounded-lg bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-6 text-lg font-bold"
                    onClick={() => setLocation("/contact")}
                  >
                    {tier.cta}
                  </Button>
                ) : tier.name === "Free" ? (
                  <Button
                    className="w-full rounded-lg bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-6 text-lg font-bold"
                    onClick={() => setLocation("/signup")}
                  >
                    {tier.cta}
                  </Button>
                ) : (
                  <StripeCheckout
                    priceId={
                      isAnnual
                        ? "price_1QiQEbEhtyzQmgJv0MZFP5Iu"
                        : "price_1QiQEbEhtyzQmgJvCCJWuJOC"
                    }
                    buttonText={tier.cta}
                    buttonClassName="w-full rounded-lg bg-[#0cc0df] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-6 text-lg font-bold"
                  />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
              Questions Artists Actually Ask
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card
                  key={index}
                  className="rounded-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <button
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center"
                  >
                    <h3 className="text-lg font-bold pr-4">{faq.question}</h3>
                    <span className="text-2xl font-bold flex-shrink-0">
                      {faqOpen === index ? "−" : "+"}
                    </span>
                  </button>
                  {faqOpen === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of artists who stopped waiting for permission and started building their careers on their own terms.
            </p>
            <Button
              size="lg"
              className="rounded-lg bg-[#0cc0df] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-12 py-6 text-xl font-bold"
              onClick={() => setLocation("/signup")}
            >
              Start Free Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
