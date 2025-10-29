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

export default function Home() {
  const [, setLocation] = useLocation();
  const { setDemoMode } = useDemo();

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
      name: "Free",
      price: "$0",
      description: "Perfect for emerging artists",
      features: [
        "Basic artist profile",
        "Revenue tracking (up to $1K/month)",
        "AI career advisor (10 questions/month)",
        "Analytics dashboard",
        "Community support",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing independent artists",
      features: [
        "Everything in Free",
        "Unlimited revenue tracking",
        "Unlimited AI advisor access",
        "Direct-to-fan store",
        "IP protection monitoring",
        "Healthcare enrollment",
        "Tour management",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For labels and management companies",
      features: [
        "Everything in Pro",
        "Multi-artist management",
        "White-label platform",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced reporting",
        "API access",
        "SLA guarantee",
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
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Boptone</h1>
                <p className="text-xs text-muted-foreground">Own Your Tone</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Features
              </Button>
              <Button variant="outline" asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
              <Button onClick={() => setLocation("/signup")}>
                Get Started
              </Button>
            </div>
            <div className="md:hidden">
              <Button onClick={() => setLocation("/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
            Own Your Tone.
            <br />
            <span className="text-primary">Own Your Career.</span>
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
            <h2 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready to scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
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
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
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
      <section className="container mx-auto px-4 py-20">
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
