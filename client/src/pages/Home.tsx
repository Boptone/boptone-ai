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
  ChevronDown,
  Zap,
  Target
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
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

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
      color: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500"
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track revenue across all sources and access royalty-backed micro-loans to fund your career.",
      color: "from-green-500/20 to-green-600/20",
      border: "border-green-500"
    },
    {
      icon: ShoppingBag,
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital downloads, and experiences directly to your fans with built-in payments.",
      color: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500"
    },
    {
      icon: Shield,
      title: "IP Protection",
      description: "AI-powered copyright monitoring with automated DMCA takedowns to protect your creative work.",
      color: "from-orange-500/20 to-orange-600/20",
      border: "border-orange-500"
    },
    {
      icon: Heart,
      title: "Healthcare & Wellness",
      description: "Artist-focused health coverage including mental health, vocal care, and performance injury treatment.",
      color: "from-pink-500/20 to-pink-600/20",
      border: "border-pink-500"
    },
    {
      icon: Calendar,
      title: "Tour Management",
      description: "Plan tours, track venues, manage budgets, and maximize revenue from live performances.",
      color: "from-indigo-500/20 to-indigo-600/20",
      border: "border-indigo-500"
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Distribute your music to all major streaming platforms and track performance in real-time.",
      color: "from-cyan-500/20 to-cyan-600/20",
      border: "border-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights into streams, engagement, revenue, and growth across all platforms.",
      color: "from-teal-500/20 to-teal-600/20",
      border: "border-teal-500"
    },
  ];

  const tiers = [
    {
      name: "Creator",
      monthlyPrice: 0,
      annualPrice: 0,
      price: "$0",
      period: "/forever",
      platformFee: "12%",
      earningCap: "$1,000/month",
      description: "Build your foundation—collect fans, sell music, grow your audience",
      features: [
        "3-click upload with AI metadata",
        "Basic profile + 10 tracks",
        "Direct-to-fan sales (merch, downloads)",
        "Kick In tip jar",
        "Basic analytics",
        "Community support",
      ],
      cta: "Start Free",
      highlighted: false,
      gradient: "from-gray-500/10 to-gray-600/10",
      border: "border-gray-400"
    },
    {
      name: "Pro",
      monthlyPrice: 29,
      annualPrice: 279, // $29 * 12 * 0.8 = $278.40 rounded to $279
      price: "$29",
      period: "/month",
      platformFee: "7%",
      earningCap: "$10,000/month",
      description: "Scale your career—advanced tools, priority support, higher earning potential",
      features: [
        "Everything in Creator, plus:",
        "Unlimited tracks + full catalog",
        "Advanced analytics & insights",
        "Fan Funnel marketing tools",
        "Smart links with source tracking",
        "3% Tone Dividend bonus",
        "Priority support",
      ],
      cta: "Start Trial",
      highlighted: true,
      badge: "MOST POPULAR",
      gradient: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500"
    },
    {
      name: "Studio",
      monthlyPrice: 99,
      annualPrice: 950, // $99 * 12 * 0.8 = $950.40 rounded to $950
      price: "$99",
      period: "/month",
      platformFee: "4%",
      earningCap: "Unlimited",
      description: "Professional infrastructure—white-label tools, team collaboration, unlimited growth",
      features: [
        "Everything in Pro, plus:",
        "White-label embeds",
        "Team accounts (3 seats)",
        "API access",
        "Dedicated account manager",
        "1-hour support response",
      ],
      cta: "Get Started",
      highlighted: false,
      gradient: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500"
    },
    {
      name: "Label",
      monthlyPrice: 499,
      annualPrice: 4790, // $499 * 12 * 0.8 = $4790.40 rounded to $4790
      price: "$499",
      period: "/month",
      platformFee: "2.5%",
      earningCap: "Unlimited",
      description: "Enterprise-grade platform—custom terms, 24/7 support, strategic guidance",
      features: [
        "Everything in Studio, plus:",
        "10+ team seats",
        "Custom contract terms",
        "24/7 phone support",
        "Onboarding assistance",
        "Quarterly strategy sessions",
      ],
      cta: "Contact Sales",
      highlighted: false,
      gradient: "from-green-500/20 to-green-600/20",
      border: "border-green-500"
    },
  ];

  const visionPoints = [
    { title: "10M+ Artists", description: "Building the largest creator economy platform" },
    { title: "$10B+ Earned", description: "Putting money directly in artists' pockets" },
    { title: "Zero Learning Curve", description: "So simple, anyone can use it" },
    { title: "100% Transparent", description: "No hidden fees, no surprises" },
  ];

  const comparisonCategories = [
    {
      id: "core",
      name: "Core Features",
      icon: Music,
      features: [
        { name: "Upload & distribute music", tiers: [true, true, true, true] },
        { name: "Track limit", tiers: ["10 tracks", "Unlimited", "Unlimited", "Unlimited"] },
        { name: "Artist profile & bio", tiers: [true, true, true, true] },
        { name: "Direct-to-fan sales (merch, downloads)", tiers: [true, true, true, true] },
        { name: "Kick In tip jar", tiers: [true, true, true, true] },
      ]
    },
    {
      id: "analytics",
      name: "Analytics & Marketing",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Revolutionary Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              <span 
                className={`inline-block transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                {rotatingVerbs[verbIndex]}
              </span>
              <br />
              <span style={{ color: '#4285F4' }}>Your Tone</span><span style={{ color: '#000000' }}>.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              AI-powered tools, financial services, and career management—bringing fans into your orbit from discovery to breakthrough success.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform" 
                style={{ backgroundColor: '#4A90E2', color: 'white' }}
                onClick={() => setLocation("/signup")}
              >
                START FREE
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-7 rounded-full font-bold hover:scale-105 transition-transform" 
                onClick={() => setLocation("/bap-protocol")}
              >
                Learn About BAP
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white font-bold" />
                </div>
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white font-bold" />
                </div>
                <span className="font-medium">14-day Pro trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white font-bold" />
                </div>
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="relative rounded-3xl border-4 border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-8 shadow-2xl backdrop-blur-sm animate-pulse">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">10M+</div>
                    <div className="text-sm text-muted-foreground">Artists Empowered</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">$10B+</div>
                    <div className="text-sm text-muted-foreground">Earned by Creators</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">100%</div>
                    <div className="text-sm text-muted-foreground">Transparent Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold Features Grid */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-5xl md:text-6xl font-black">Everything You Need</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Eight powerful tools working together as one complete system
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className={`group rounded-3xl border-4 ${feature.border} bg-gradient-to-br ${feature.color} p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                  >
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="text-xl font-bold mb-2">{feature.title}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{feature.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Bold Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-5xl md:text-6xl font-black">Choose Your Plan</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start free, scale as you grow—no hidden fees, cancel anytime
              </p>
              
              {/* Annual/Monthly Toggle */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className={`text-lg font-semibold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    isAnnual ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle annual pricing"
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      isAnnual ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-lg font-semibold transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Annual
                  <span className="ml-2 text-sm bg-green-500 text-white px-2 py-0.5 rounded-full">Save 20%</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <div 
                  key={index}
                  className={`relative rounded-3xl border-4 ${tier.border} bg-gradient-to-br ${tier.gradient} p-8 shadow-xl hover:scale-105 transition-all duration-300 ${tier.highlighted ? 'ring-4 ring-blue-500/50' : ''}`}
                >
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {tier.badge}
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <div className="text-2xl font-black mb-2">{tier.name}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black">
                          {tier.name === "Creator" 
                            ? "$0" 
                            : isAnnual 
                              ? `$${tier.annualPrice}` 
                              : `$${tier.monthlyPrice}`
                          }
                        </span>
                        <span className="text-muted-foreground">
                          {tier.name === "Creator" 
                            ? "/forever" 
                            : isAnnual 
                              ? "/year" 
                              : "/month"
                          }
                        </span>
                      </div>
                      {isAnnual && tier.name !== "Creator" && (
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          Save ${(tier.monthlyPrice * 12) - tier.annualPrice}/year
                        </div>
                      )}
                      <div className="mt-4 space-y-1">
                        <div className="text-sm font-bold">Platform Fee: {tier.platformFee}</div>
                        <div className="text-xs text-muted-foreground">Earning Cap: {tier.earningCap}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                    <Button 
                      className="w-full rounded-full py-6 font-bold text-base hover:scale-105 transition-transform"
                      variant={tier.highlighted ? "default" : "outline"}
                      style={tier.highlighted ? { backgroundColor: '#4A90E2', color: 'white' } : {}}
                      onClick={() => setLocation("/signup")}
                    >
                      {tier.cta}
                    </Button>
                    <div className="space-y-3 pt-4 border-t">
                      {tier.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12 space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">14-day Pro trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Cancel anytime</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                No hidden fees or locked-in contracts. Cancel or switch plans anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-5xl md:text-6xl font-black">Compare All Features</h2>
              <p className="text-xl text-muted-foreground">
                See exactly what's included in each plan
              </p>
            </div>
            
            {/* Tier Headers */}
            <div className="grid grid-cols-5 gap-4 mb-8 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 rounded-2xl border-2">
              <div className="col-span-1"></div>
              {tiers.map((tier, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl font-black">{tier.name}</div>
                  <div className="text-sm text-muted-foreground">{tier.price}{tier.period}</div>
                </div>
              ))}
            </div>

            {/* Feature Categories */}
            <div className="space-y-6">
              {comparisonCategories.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.includes(category.id);
                
                return (
                  <div key={category.id} className="rounded-2xl border-2 overflow-hidden bg-card shadow-lg">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6" />
                        <span className="text-xl font-bold">{category.name}</span>
                      </div>
                      <ChevronDown className={`h-6 w-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t">
                        {category.features.map((feature, fIndex) => (
                          <div key={fIndex} className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/30 transition-colors border-b last:border-b-0">
                            <div className="col-span-1 text-sm font-medium">{feature.name}</div>
                            {feature.tiers.map((value, tIndex) => (
                              <div key={tIndex} className="text-center">
                                {typeof value === 'boolean' ? (
                                  value ? (
                                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )
                                ) : (
                                  <span className="text-sm font-medium">{value}</span>
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

            {/* Bottom CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              {tiers.map((tier, index) => (
                <Button
                  key={index}
                  className="rounded-full py-6 font-bold text-base hover:scale-105 transition-transform"
                  variant={tier.highlighted ? "default" : "outline"}
                  style={tier.highlighted ? { backgroundColor: '#4A90E2', color: 'white' } : {}}
                  onClick={() => setLocation("/signup")}
                >
                  {tier.cta}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-6xl font-black">Ready to Create Your Tone?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of artists building their careers on the complete Creator OS
            </p>
            <Button 
              size="lg" 
              className="text-lg px-12 py-7 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform" 
              style={{ backgroundColor: '#4A90E2', color: 'white' }}
              onClick={() => setLocation("/signup")}
            >
              START FREE
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      <ToneyChatbot />
    </div>
    </>
  );
}
