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
  Target,
  ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";

const rotatingPhrases = ["Automate Your Tone", "Create Your Tone", "Own Your Tone"];

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto pt-12">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className="relative border-2 border-gray-200 p-8 flex flex-col hover:border-gray-300 transition-colors"
              >
                {/* Tier Name */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{tier.name}</h3>
                
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold text-gray-900 tracking-tight">
                      ${currentPrice(tier)}
                    </span>
                    <span className="text-lg text-gray-500 font-normal">
                      /{isAnnual ? 'mo' : 'month'}
                    </span>
                  </div>
                  {isAnnual && tier.monthlyPrice > 0 && (
                    <p className="text-sm text-primary font-medium">
                      Save ${tier.monthlyPrice * 12 - tier.annualPrice * 12}/year
                    </p>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-base text-gray-600 mb-6 leading-relaxed">{tier.description}</p>
                
                {/* Platform Fee Badge */}
                <div className="mb-6 pb-6 border-b border-gray-200 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md w-fit">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Platform Fee</span>
                  <span className="text-sm font-bold text-gray-900">{tier.platformFee}</span>
                </div>
                
                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-base text-gray-700 leading-relaxed">{feature}</span>
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
                    variant="outline"
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

          {/* All Plans Include */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              All plans include
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Data Ownership</h4>
                <p className="text-sm text-gray-600">
                  You own your fan data, master recordings, and publishing rights. Export anytime.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">90% Revenue Share</h4>
                <p className="text-sm text-gray-600">
                  Keep 90% of BAP streaming revenue before platform fees. No hidden costs.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">No Contracts</h4>
                <p className="text-sm text-gray-600">
                  Cancel anytime. No long-term commitments. Your music, your terms.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Pricing Questions
            </h3>
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setFaqOpen(faqOpen === 1 ? null : 1)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900">How does Boptone make money?</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${faqOpen === 1 ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === 1 && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p className="mb-3">
                      <strong className="text-gray-900">Simple: We keep 10% of everything you earn. You keep 90%.</strong>
                    </p>
                    <p className="mb-3">
                      This applies to all revenue sources—BAP streaming, third-party streaming (Spotify, Apple Music, etc.), BopShop sales, memberships, sync licensing, and live event tickets.
                    </p>
                    <p className="mb-3 bg-gray-50 p-3 rounded-lg">
                      <strong className="text-gray-900">One exception: Kick In tips.</strong> You keep <strong className="text-gray-900">100% of every tip</strong> (minus only credit card processing: 2.9% + 30¢). We don't take a cut of tips—ever.
                    </p>
                    <p className="mb-3">
                      <strong className="text-gray-900">Why 10%?</strong> Because we're your business partner, not your landlord. We succeed when you succeed. This single fee covers platform infrastructure, security, support, and continuous feature development.
                    </p>
                    <p className="bg-gray-50 p-3 rounded-lg">
                      <strong className="text-gray-900">All tiers pay the same 10%.</strong> Free, Pro, and Enterprise differ in <strong className="text-gray-900">features</strong> (storage, analytics, team seats, support), not fees. Upgrade for capabilities, not to save pennies.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ Item 2 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setFaqOpen(faqOpen === 2 ? null : 2)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900">Can I upgrade or downgrade my plan?</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${faqOpen === 2 ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === 2 && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p className="mb-3">
                      <strong className="text-gray-900">Yes, absolutely.</strong> You can change your plan anytime with zero penalties or long-term commitments.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Upgrading (Free → Pro → Enterprise):</p>
                        <p>Takes effect immediately. You'll be charged the prorated amount for the current billing period and unlock all new features instantly.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Downgrading (Enterprise → Pro → Free):</p>
                        <p>Takes effect at the end of your current billing period. You keep all features until then, and we'll prorate any refund if applicable.</p>
                      </div>
                    </div>
                    <p className="mt-3 bg-gray-50 p-3 rounded-lg">
                      <strong className="text-gray-900">Your data, music, and fan relationships stay intact</strong> regardless of plan changes. We never delete your content or lock you out.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ Item 3 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setFaqOpen(faqOpen === 3 ? null : 3)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900">How do platform fees work?</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${faqOpen === 3 ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === 3 && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p className="mb-3">
                      <strong className="text-gray-900">You keep 90 cents of every dollar.</strong> Here's the breakdown:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">BAP Streaming</p>
                        <p>$1,000 streaming revenue → <strong className="text-gray-900">You keep: $900</strong> (Boptone: $100)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Third-Party Streaming (Spotify, Apple Music, etc.)</p>
                        <p>$1,000 streaming revenue → <strong className="text-gray-900">You keep: $900</strong> (Boptone: $100)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">BopShop Sales (Vinyl, Merch, Digital Downloads)</p>
                        <p>$100 sale → <strong className="text-gray-900">You keep: $86.80</strong> (Boptone: $10, Stripe: $3.20)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Kick In Tips (Sacred Exception)</p>
                        <p>$100 tip → <strong className="text-gray-900">You keep: $96.80</strong> (Boptone: $0, Stripe: $3.20)</p>
                      </div>
                    </div>
                    <p className="bg-gray-50 p-3 rounded-lg">
                      <strong className="text-gray-900">Credit card fees (2.9% + 30¢)</strong> are passed directly to Stripe for physical transactions (sales, tips, memberships). We don't keep any of this—it's a third-party cost.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ Item 4 - New Payout Policy */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setFaqOpen(faqOpen === 4 ? null : 4)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900">When and how do I get paid?</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${faqOpen === 4 ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === 4 && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p className="mb-3">
                      <strong className="text-gray-900">You control your payout schedule</strong>—choose daily, weekly, or monthly payouts with a $20 minimum.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Standard Payouts (Free)</p>
                        <p>Funds arrive the <strong className="text-gray-900">next business day</strong> at no cost. Choose your schedule in settings: daily, weekly, or monthly.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Instant Payouts (Optional)</p>
                        <p><strong className="text-gray-900">1% fee</strong> for delivery within <strong className="text-gray-900">1 hour</strong>, available 24/7 including weekends and holidays.</p>
                      </div>
                    </div>
                    <p className="bg-gray-50 p-3 rounded-lg">
                      <strong className="text-gray-900">Your earnings are always accessible.</strong> Withdraw anytime you have $20 or more in your account. No waiting for quarterly statements or arbitrary payout dates like other platforms.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
