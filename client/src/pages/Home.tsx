import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Music, 
  Globe, 
  Heart,
  Zap,
  ArrowRight,
  Check
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Career Advisor",
      description: "Get personalized guidance on releases, content strategy, and career decisions from your AI advisor powered by Manus 1T token pool.",
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Distribute your music to Spotify, Apple Music, YouTube, and all major platforms with automated metadata and royalty tracking.",
    },
    {
      icon: DollarSign,
      title: "Royalty-Backed Micro-Loans",
      description: "Access capital using your future royalties as collateral. AI-powered risk assessment for instant approvals.",
    },
    {
      icon: Shield,
      title: "IP Protection",
      description: "AI-driven infringement detection across the web. Automated DMCA takedowns to protect your creative work.",
    },
    {
      icon: Music,
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital products, and experiences directly to fans. Shopify-level e-commerce built for creators.",
    },
    {
      icon: Heart,
      title: "Healthcare Integration",
      description: "Access affordable healthcare plans designed for independent creators. Manage wellness alongside your career.",
    },
  ];

  const benefits = [
    "Complete career management from discovery to breakthrough",
    "Real-time analytics across all platforms",
    "Automated opportunity matching (playlists, venues, collaborations)",
    "Tour planning and revenue optimization",
    "Financial management and tax compliance",
    "Priority scoring and career phase tracking",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/boptone-logo.png" alt="Boptone" className="h-8" />
              <span className="text-xl font-bold">Boptone</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <a href="#features">Features</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#how-it-works">How It Works</a>
              </Button>
              <Button asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            Powered by 1 Trillion AI Tokens
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            The Autonomous{" "}
            <span className="text-gradient-primary">Creator OS</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Create, distribute, protect, and monetize your creative works with AI-powered career optimization. 
            The all-in-one platform for the 2030+ creator economy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href={getLoginUrl()}>
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              No upfront costs
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Keep 100% rights
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              AI-powered growth
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 bg-muted/30 -mx-4 px-4 md:-mx-0 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Boptone combines the bulk power of Costco, the artist-first ethos of Bandcamp, 
              and the commerce infrastructure of Shopify.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Your Career Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From discovery to breakthrough success, Boptone guides you through every phase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { phase: "Discovery", description: "AI identifies your potential and priority score" },
              { phase: "Development", description: "Build your audience and refine your craft" },
              { phase: "Launch", description: "Strategic releases and distribution" },
              { phase: "Scale", description: "Tours, partnerships, and breakthrough success" },
            ].map((step, index) => (
              <div key={step.phase} className="relative">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step.phase}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20 bg-muted/30 -mx-4 px-4 md:-mx-0 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why Creators Choose Boptone
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 p-4 rounded-lg bg-card border"
              >
                <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-chart-3/10 to-chart-4/10 border">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Own Your Tone?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the platform that's empowering the 2030+ creator economy. 
            Start building your autonomous career today.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <a href={getLoginUrl()}>
              Launch Your Career
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/boptone-logo.png" alt="Boptone" className="h-6" />
              <span className="text-sm text-muted-foreground">
                © 2025 Boptone. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
