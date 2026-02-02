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
  Calendar,
  ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";

const rotatingVerbs = ["Create", "Automate", "Own"];

export default function Home() {
  const [, setLocation] = useLocation();
  const { setDemoMode } = useDemo();
  const [verbIndex, setVerbIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

  const featureCategories = [
    {
      id: "distribution",
      name: "Distribution & Upload",
      icon: Music,
      features: [
        { name: "3-click upload with AI metadata", tiers: [true, true, true, true] },
        { name: "Basic profile + 10 tracks", tiers: [true, false, false, false] },
        { name: "Unlimited tracks & storage", tiers: [false, true, true, true] },
        { name: "Global distribution to all platforms", tiers: [true, true, true, true] },
        { name: "Instant release scheduling", tiers: [true, true, true, true] },
      ]
    },
    {
      id: "marketing",
      name: "Marketing & Growth",
      icon: TrendingUp,
      features: [
        { name: "Basic analytics", tiers: [true, false, false, false] },
        { name: "Advanced analytics & insights", tiers: [false, true, true, true] },
        { name: "Fan Funnel marketing tools", tiers: [false, true, true, true] },
        { name: "Smart links with source tracking", tiers: [false, true, true, true] },
        { name: "Fan data ownership & export", tiers: [false, true, true, true] },
        { name: "White-label embeds", tiers: [false, false, true, true] },
      ]
    },
    {
      id: "financial",
      name: "Financial Services",
      icon: DollarSign,
      features: [
        { name: "12% platform fee (Cap: $1,000/month)", tiers: [true, false, false, false] },
        { name: "7% platform fee (Cap: $10,000/month)", tiers: [false, true, false, false] },
        { name: "4% platform fee (Unlimited earnings)", tiers: [false, false, true, false] },
        { name: "2.5% platform fee (Unlimited earnings)", tiers: [false, false, false, true] },
        { name: "3% Tone Dividend bonus", tiers: [false, true, true, true] },
        { name: "Kick In tip jar", tiers: [true, true, true, true] },
      ]
    },
    {
      id: "support",
      name: "Support & Collaboration",
      icon: Heart,
      features: [
        { name: "Community support", tiers: [true, false, false, false] },
        { name: "Priority support", tiers: [false, true, false, false] },
        { name: "1-hour support response", tiers: [false, false, true, false] },
        { name: "24/7 phone support", tiers: [false, false, false, true] },
        { name: "Team accounts (3 seats)", tiers: [false, false, true, false] },
        { name: "10+ team seats", tiers: [false, false, false, true] },
      ]
    },
    {
      id: "advanced",
      name: "Advanced Features",
      icon: Sparkles,
      features: [
        { name: "API access", tiers: [false, false, true, true] },
        { name: "Dedicated account manager", tiers: [false, false, true, true] },
        { name: "Custom contract terms", tiers: [false, false, false, true] },
        { name: "Onboarding assistance", tiers: [false, false, false, true] },
        { name: "Quarterly strategy sessions", tiers: [false, false, false, true] },
      ]
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24 md:pt-20 md:pb-40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
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
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{ backgroundColor: isAnnual ? '#4A90E2' : '#d1d5db' }}
                role="switch"
                aria-checked={isAnnual}
              >
                <span
                  className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                  style={{ transform: isAnnual ? 'translateX(32px)' : 'translateX(4px)' }}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
                <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: '#4A90E2', color: 'white' }}>
                  Save up to 20%
                </span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {tiers.map((tier, index) => (
              <div key={index} className="relative">
                {/* Most Popular Badge */}
                {tier.highlighted && (
                  <div className="text-center mb-2">
                    <span className="inline-block bg-black text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {/* Card */}
                <div className="bg-card border border-border rounded-lg p-8 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  {/* Tier Name */}
                  <h3 className="text-3xl font-bold mb-2 text-card-foreground">{tier.name}</h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>
                  
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {isAnnual && tier.annualPrice ? tier.annualPrice : tier.price}
                      </span>
                      <span className="text-muted-foreground">
                        {isAnnual && tier.annualPrice ? '/year' : tier.period}
                      </span>
                    </div>
                    {isAnnual && tier.annualPrice && tier.annualSavings && (
                      <p className="text-sm font-semibold mt-1" style={{ color: '#4A90E2' }}>
                        {tier.annualSavings}
                      </p>
                    )}
                    {!isAnnual && tier.annualPrice && (
                      <p className="text-sm text-muted-foreground mt-1">
                        or {tier.annualPrice}/year • {tier.annualSavings}
                      </p>
                    )}
                  </div>
                  
                  {/* CTA Button */}
                  {tier.name === "Pro" ? (
                    <StripeCheckout 
                      tier="pro"
                      buttonText={tier.cta}
                      buttonVariant="default"
                      className="w-full mb-8"
                      style={{ backgroundColor: '#4A90E2', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600 }}
                    />
                  ) : (
                    <Button 
                      className="w-full mb-8" 
                      style={{ backgroundColor: '#4A90E2', color: 'white', padding: '24px', borderRadius: '8px', fontWeight: 600 }}
                      onClick={() => setLocation("/signup")}
                    >
                      {tier.cta}
                    </Button>
                  )}
                  
                  {/* Platform Fee Badge */}
                  {tier.platformFee && (
                    <div className="mb-6 pb-6 border-b border-border">
                      <p className="text-lg font-bold mb-1 text-card-foreground">{tier.platformFee} platform fee</p>
                      <p className="text-sm text-muted-foreground">Cap: {tier.earningCap}</p>
                    </div>
                  )}
                  
                  {/* Features List */}
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-card-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-20 bg-white dark:bg-background rounded-lg border border-gray-200 dark:border-border overflow-x-auto">
            <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-4 p-6 border-b border-gray-200 bg-gray-50">
              <div className="text-lg font-bold">Features</div>
              <div className="text-center">
                <div className="text-lg font-bold">Creator</div>
                <Button 
                  className="mt-2 w-full" 
                  style={{ backgroundColor: '#4A90E2', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}
                  onClick={() => setLocation("/signup")}
                >
                  Start Free
                </Button>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">Pro</div>
                <StripeCheckout 
                  tier="pro"
                  buttonText="Start Trial"
                  buttonVariant="default"
                  className="mt-2 w-full"
                  style={{ backgroundColor: '#4A90E2', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">Label</div>
                <Button 
                  className="mt-2 w-full" 
                  style={{ backgroundColor: '#4A90E2', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}
                  onClick={() => setLocation("/signup")}
                >
                  Get Started
                </Button>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">Enterprise</div>
                <Button 
                  className="mt-2 w-full" 
                  style={{ backgroundColor: '#4A90E2', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}
                  onClick={() => setLocation("/contact")}
                >
                  Contact Sales
                </Button>
              </div>
            </div>

            {/* Feature Categories */}
            {featureCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);
              
              return (
                <div key={category.id} className="border-b border-border last:border-b-0">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-foreground" />
                      <span className="text-lg font-semibold text-foreground">{category.name}</span>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-foreground transition-transform ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Feature Rows */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {category.features.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className="grid grid-cols-5 gap-4 p-4 border-t border-gray-200 items-center"
                        >
                          <div className="text-sm text-gray-700">{feature.name}</div>
                          {feature.tiers.map((included, tierIdx) => (
                            <div key={tierIdx} className="flex justify-center">
                              {included ? (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6" />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
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
