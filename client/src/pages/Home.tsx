import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Zap,
  Target
} from "lucide-react";
import { useLocation } from "wouter";

const rotatingPhrases = ["Automate Your Tone", "Create Your Tone", "Own Your Tone"];

export default function Home() {
  const [, setLocation] = useLocation();
  const { setDemoMode } = useDemo();
  const [verbIndex, setVerbIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

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
      icon: Sparkles,
      title: "Career Advisor",
      description: "Get personalized guidance on releases, marketing, and growth strategies."
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track revenue across all sources and access royalty-backed micro-loans."
    },
    {
      icon: ShoppingBag,
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital downloads, and experiences directly to fans."
    },
    {
      icon: Shield,
      title: "IP Protection",
      description: "Intelligent copyright monitoring with instant DMCA takedowns."
    },
    {
      icon: Heart,
      title: "Healthcare & Wellness",
      description: "Artist-focused health coverage including mental health and vocal care."
    },
    {
      icon: Calendar,
      title: "Tour Management",
      description: "Plan tours, track venues, manage budgets, and maximize live revenue."
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Distribute your music to all major streaming platforms in real-time."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track performance across platforms with actionable insights."
    },
    {
      icon: Target,
      title: "Marketing Tools",
      description: "Launch campaigns, track engagement, and grow your audience."
    }
  ];

  const tiers = [
    {
      name: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      platformFee: "12%",
      earningCap: "$1,000/month",
      description: "Build your foundation—collect fans, sell music, grow your audience",
      features: [
        "BAP streaming (90% artist share)",
        "Basic profile + 10 tracks",
        "1GB storage",
        "Basic analytics",
        "Tip jar (Kick In)",
        "E-commerce (3 products max)",
        "Toney AI (5 questions/month)",
        "Community support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 41,
      platformFee: "5%",
      earningCap: "$10,000/month",
      description: "Unlimited uploads, third-party distribution, and advanced tools for serious artists",
      features: [
        "Everything in Free",
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
        "3% Tone Dividend",
        "Priority support (24-hour response)"
      ],
      cta: "Start Pro",
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 149,
      annualPrice: 124,
      platformFee: "2%",
      earningCap: "Unlimited",
      description: "Premium tools for established artists, labels, and management companies",
      features: [
        "Everything in Pro",
        "Unlimited earnings (no cap)",
        "2% platform fee (lowest in industry)",
        "Team accounts (5 seats)",
        "White-label embeds",
        "API access",
        "Advanced tour management",
        "IP protection tools",
        "Microloans (up to $50K)",
        "Healthcare benefits access",
        "Dedicated account manager",
        "1-hour support response",
        "Quarterly strategy sessions",
        "10% Tone Dividend"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const stats = [
    { number: "$2.5M+", label: "Paid to Artists" },
    { number: "50K+", label: "Tracks Distributed" },
    { number: "180+", label: "Countries Reached" },
    { number: "99.9%", label: "Uptime" }
  ];

  const handleDemoClick = () => {
    setDemoMode(true);
    setLocation("/dashboard");
  };

  const currentPrice = (tier: typeof tiers[0]) => 
    isAnnual ? tier.annualPrice : tier.monthlyPrice;

  const savings = (tier: typeof tiers[0]) => 
    tier.monthlyPrice > 0 ? Math.round((tier.monthlyPrice * 12 - tier.annualPrice * 12) / (tier.monthlyPrice * 12) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="max-w-4xl">
            <h1 className="hero-headline mb-6">
              <span className={`inline-block transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                {rotatingPhrases[verbIndex]}
              </span>
            </h1>
            <p className="body-text text-xl md:text-2xl mb-8 max-w-2xl">
              The complete operating system for artists. Distribution, analytics, financial tools, and career guidance in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="btn-primary text-lg h-14 px-8"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary text-lg h-14 px-8"
                onClick={handleDemoClick}
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-spacing bg-secondary">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stat-number mb-2">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mb-16">
            <h2 className="section-headline mb-6">
              Everything you need to build a sustainable music career
            </h2>
            <p className="body-text text-xl">
              From distribution to healthcare, Boptone handles the business so you can focus on creating.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <Card key={index} className="future-card p-8 hover:shadow-md transition-shadow">
                <feature.icon className="h-12 w-12 text-primary mb-4" strokeWidth={1.5} />
                <h4 className="mb-3">{feature.title}</h4>
                <p className="body-text text-base">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-spacing bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-headline mb-6">Choose Your Plan</h2>
            <p className="body-text text-xl mb-8">
              Start free, upgrade as you grow
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-base font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
                <span className="ml-2 text-primary font-semibold">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative border-2 ${tier.popular ? 'border-primary shadow-lg scale-105' : 'border-gray-200'} p-8 flex flex-col`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{tier.name}</h3>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      ${currentPrice(tier)}
                    </span>
                    <span className="text-gray-600">
                      /{isAnnual ? 'mo' : 'month'}
                    </span>
                  </div>
                  {isAnnual && tier.monthlyPrice > 0 && (
                    <p className="text-sm text-primary font-medium mt-2">
                      Save ${tier.monthlyPrice * 12 - tier.annualPrice * 12}/year
                    </p>
                  )}
                </div>
                <p className="body-text text-sm mb-4 text-gray-600">{tier.description}</p>
                
                {/* Platform Fee Badge */}
                <div className="mb-2 inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                  <span className="text-sm font-medium text-gray-700">Platform Fee:</span>
                  <span className="text-sm font-bold text-gray-900">{tier.platformFee}</span>
                </div>
                
                {/* Earning Cap */}
                <div className="mb-6 text-sm text-gray-600">
                  Earning cap: <span className="font-semibold">{tier.earningCap}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.name === "Enterprise" ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    size="lg"
                    onClick={() => window.location.href = 'mailto:sales@boptone.com'}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.href = getLoginUrl()}
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-headline mb-6">
              Ready to take control of your music career?
            </h2>
            <p className="body-text text-xl mb-8">
              Join thousands of artists building sustainable careers with Boptone.
            </p>
            <Button 
              size="lg" 
              className="btn-primary text-lg h-14 px-8"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <ToneyChatbot />
    </div>
  );
}
