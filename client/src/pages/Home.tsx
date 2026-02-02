import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { StripeCheckout } from "@/components/StripeCheckout";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import { useDemo } from "@/contexts/DemoContext";
import { 
  Music, 
  TrendingUp, 
  Shield, 
  Heart, 
  DollarSign, 
  Sparkles,
  Check,
  ArrowRight,
  Globe,
  BarChart3,
  ShoppingBag,
  Calendar
} from "lucide-react";
import { useLocation } from "wouter";

const rotatingVerbs = ["Create", "Automate", "Own"];

export default function Home() {
  const [, setLocation] = useLocation();
  const { setDemoMode } = useDemo();
  const [verbIndex, setVerbIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setVerbIndex((prev) => (prev + 1) % rotatingVerbs.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "AI Career Advisor",
      description: "Get personalized guidance on releases, marketing, and growth strategies powered by advanced AI.",
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track revenue across all sources and access royalty-backed micro-loans to fund your career.",
    },
    {
      icon: ShoppingBag,
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital downloads, and experiences directly to your fans with built-in payments.",
    },
    {
      icon: Shield,
      title: "IP Protection",
      description: "AI-powered copyright monitoring with automated DMCA takedowns to protect your creative work.",
    },
    {
      icon: Heart,
      title: "Healthcare & Wellness",
      description: "Artist-focused health coverage including mental health, vocal care, and performance injury treatment.",
    },
    {
      icon: Calendar,
      title: "Tour Management",
      description: "Plan tours, track venues, manage budgets, and maximize revenue from live performances.",
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Distribute your music to all major streaming platforms and track performance in real-time.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights into streams, engagement, revenue, and growth across all platforms.",
    },
  ];

  const tiers = [
    {
      name: "Creator",
      price: "$0",
      period: "/forever",
      platformFee: "12%",
      earningCap: "$1,000/month",
      description: "Perfect for new artists and hobbyists",
      features: [
        "3-click upload with AI metadata",
        "Basic profile + 10 tracks",
        "Earning cap: $1,000/month",
        "12% platform fee",
        "Basic analytics",
        "Kick In tip jar",
        "Community support",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$39",
      period: "/month",
      annualPrice: "$374",
      annualSavings: "Save $94/year",
      platformFee: "7%",
      earningCap: "$10,000/month",
      description: "For serious independent artists",
      features: [
        "Everything in Creator",
        "Unlimited tracks & storage",
        "Fan Funnel marketing tools",
        "Smart links with source tracking",
        "Fan data ownership & export",
        "3% Tone Dividend bonus",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Start 14-Day Trial",
      highlighted: true,
    },
    {
      name: "Label",
      price: "$59",
      period: "/month",
      annualPrice: "$566",
      annualSavings: "Save $142/year",
      platformFee: "4%",
      earningCap: "Unlimited",
      description: "For professional artists and bands",
      features: [
        "Everything in Pro",
        "Unlimited earnings",
        "4% platform fee",
        "Team accounts (3 seats)",
        "White-label embeds",
        "API access",
        "Dedicated account manager",
        "1-hour support response",
      ],
      cta: "Start Label Plan",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      platformFee: "2.5%",
      earningCap: "Unlimited",
      description: "For labels and management companies",
      features: [
        "Everything in Label",
        "Unlimited earnings",
        "2.5% platform fee",
        "10+ team seats",
        "Custom contract terms",
        "Onboarding assistance",
        "24/7 phone support",
        "Quarterly strategy sessions",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const visionPoints = [
    { title: "Built for Scale", description: "Enterprise-grade infrastructure ready for millions of creators" },
    { title: "AI-Powered", description: "Advanced machine learning for career optimization and growth" },
    { title: "All-in-One", description: "Distribution, commerce, finance, healthcare, and IP protection unified" },
    { title: "Creator-First", description: "Designed by artists, for artists. Own your tone, own your future" },
  ];

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              The Autonomous Creator OS
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter">
            <span 
              className={`inline-block transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              {rotatingVerbs[verbIndex]}
            </span>{" "}
            <span style={{ color: '#4285F4' }}>Your Tone.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            The all-in-one platform empowering musicians and creators with AI-powered tools, financial services, and career management from discovery to breakthrough success.
          </p>
          <div className="flex items-center justify-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6" 
              style={{ backgroundColor: '#4A90E2', color: 'white' }}
              onClick={() => setLocation("/signup")}
            >
              START FREE
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              14-day Pro trial
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12">The Future of the Creator Economy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {visionPoints.map((point, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-xl font-bold text-primary">{point.title}</div>
                  <div className="text-sm text-muted-foreground">{point.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features List - Brutalist */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">FEATURES</h2>
          <div className="border-t-4 border-black mb-12"></div>
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-6 items-start border-b border-black pb-6">
                <div className="font-mono text-2xl font-bold min-w-[60px]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-lg">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">We Only Win When You Win</h2>
            <p className="text-xl text-muted-foreground">
              No upfront costs. Pay based on what you earn. Keep 90% of streaming revenue.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary text-sm font-medium mt-4">
              <Check className="h-4 w-4" />
              14-day Pro trial • No credit card required
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col h-full ${tier.highlighted ? "border-primary shadow-xl md:scale-105" : ""}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground text-lg">{tier.period}</span>}
                  </div>
                  {tier.annualPrice && (
                    <p className="text-sm text-muted-foreground mt-2">
                      or {tier.annualPrice}/year • {tier.annualSavings}
                    </p>
                  )}
                  <CardDescription className="mt-3">{tier.description}</CardDescription>
                  {tier.platformFee && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-semibold text-primary">{tier.platformFee} platform fee</p>
                      <p className="text-xs text-muted-foreground mt-1">Cap: {tier.earningCap}</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-6">
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.name === "Pro" ? (
                    <StripeCheckout 
                      tier="pro"
                      buttonText={tier.cta}
                      buttonVariant={tier.highlighted ? "default" : "outline"}
                      className="w-full"
                    />
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => setLocation("/signup")}
                    >
                      {tier.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section - Brutalist */}
      <section className="container mx-auto px-4 py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-16">ARTISTS USE BOPTONE</h2>
          <div className="space-y-12">
            {/* Queens of the Stone Age */}
            <div className="border-l-4 border-white pl-6">
              <blockquote className="text-2xl md:text-3xl font-bold mb-4">
                "Finally, a platform that respects artists."
              </blockquote>
              <div className="text-xl font-bold">— QUEENS OF THE STONE AGE</div>
              <div className="font-mono text-lg mt-2" style={{ color: '#4285F4' }}>+$47K IN FIRST QUARTER</div>
            </div>

            {/* Geese */}
            <div className="border-l-4 border-white pl-6">
              <blockquote className="text-2xl md:text-3xl font-bold mb-4">
                "We're growing faster than ever."
              </blockquote>
              <div className="text-xl font-bold">— GEESE</div>
              <div className="font-mono text-lg mt-2" style={{ color: '#4285F4' }}>+12K NEW FANS IN 90 DAYS</div>
            </div>

            {/* Public Enemy */}
            <div className="border-l-4 border-white pl-6">
              <blockquote className="text-2xl md:text-3xl font-bold mb-4">
                "This is what we've been fighting for."
              </blockquote>
              <div className="text-xl font-bold">— PUBLIC ENEMY</div>
              <div className="font-mono text-lg mt-2" style={{ color: '#4285F4' }}>100% OWNERSHIP RETAINED</div>
            </div>

            {/* Chappell Roan */}
            <div className="border-l-4 border-white pl-6">
              <blockquote className="text-2xl md:text-3xl font-bold mb-4">
                "The easiest platform I've ever used."
              </blockquote>
              <div className="text-xl font-bold">— CHAPPELL ROAN</div>
              <div className="font-mono text-lg mt-2" style={{ color: '#4285F4' }}>$23K EARNED IN 6 MONTHS</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="text-lg px-12 py-7 text-white hover:opacity-90 transition-opacity rounded-none font-bold"
            style={{ backgroundColor: '#4285F4' }}
            onClick={() => setLocation("/signup")}
          >
            START FREE TODAY
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer - Black background with white text */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-6 py-16">
          {/* BOPTONE Wordmark Logo */}
          <div className="mb-12">
            <h2 
              className="text-5xl font-black text-white"
              style={{
                fontFamily: '"Arial Black", "Arial Bold", Gadget, sans-serif',
                letterSpacing: '-0.05em',
                fontWeight: 900
              }}
            >
              BOPTONE
            </h2>
            <p className="text-gray-400 text-sm mt-2">Own Your Tone™</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/bap" className="text-gray-400 hover:text-white transition-colors">BAP Protocol</a></li>
                <li><a href="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
                <li><a href="/shop" className="text-gray-400 hover:text-white transition-colors">BopShop</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/discover" className="text-gray-400 hover:text-white transition-colors">Discover</a></li>
                <li><a href="/upload" className="text-gray-400 hover:text-white transition-colors">Upload Music</a></li>
                <li><a href="/analytics" className="text-gray-400 hover:text-white transition-colors">Analytics</a></li>
                <li><a href="/my-store" className="text-gray-400 hover:text-white transition-colors">My Store</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Boptone</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/press" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/api" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom section with copyright */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2026 Boptone. All rights reserved. Own Your Tone™</p>
            <div className="flex gap-6 text-gray-400">
              <a href="https://twitter.com/boptone" className="hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/boptone" className="hover:text-white transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com/boptone" className="hover:text-white transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    <ToneyChatbot />
    </>
  );
}
