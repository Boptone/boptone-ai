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
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              The Autonomous Creator OS
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => setLocation("/signup")}>
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6" 
              onClick={() => {
                setDemoMode(true);
                setLocation("/dashboard");
              }}
            >
              Try Demo
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

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mission control for your entire artist career, all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">We Only Win When You Win</h2>
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary to-chart-3 text-white border-0">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Own Your Tone?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of artists taking control of their careers with Boptone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-6"
                  onClick={() => setLocation("/signup")}
                >
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/features" className="hover:text-foreground">Features</a></li>
                <li><a href="/pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="/bap" className="hover:text-foreground">BAP Protocol</a></li>
                <li><a href="/demo" className="hover:text-foreground">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">About</a></li>
                <li><a href="/careers" className="hover:text-foreground">Careers</a></li>
                <li><a href="/contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/blog" className="hover:text-foreground">Blog</a></li>
                <li><a href="/help" className="hover:text-foreground">Help Center</a></li>
                <li><a href="/api" className="hover:text-foreground">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="mailto:hello@boptone.com" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Boptone. All rights reserved. Own Your Tone™</p>
          </div>
        </div>
      </footer>
    </div>
    <ToneyChatbot />
    </>
  );
}
