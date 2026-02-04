import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import Footer from "@/components/Footer";
import { 
  Music, Brain, DollarSign, ShoppingBag, Shield, 
  BarChart3, Globe, Zap
} from "lucide-react";
import { useLocation } from "wouter";

export default function Features() {
  const [, setLocation] = useLocation();

  // Reduced from 12 to 6 CORE features for extreme simplicity
  const features = [
    {
      icon: Globe,
      title: "Upload & Distribute Music",
      description: "Upload your music and reach fans worldwide. Keep 90% of what you earn—no middlemen, no platform fees.",
      benefits: [
        "Upload in minutes",
        "Keep 90% of revenue",
        "Reach fans globally",
        "You own everything"
      ]
    },
    {
      icon: DollarSign,
      title: "Track Your Money",
      description: "See all your earnings in one place. Track streaming, sales, and shows with simple, clear reports.",
      benefits: [
        "All revenue in one dashboard",
        "Easy-to-read reports",
        "Monthly payouts",
        "Tax documents included"
      ]
    },
    {
      icon: ShoppingBag,
      title: "Sell Your Merch",
      description: "Sell t-shirts, albums, and experiences directly to fans. We handle payments and tracking for you.",
      benefits: [
        "Sell physical & digital products",
        "Built-in payment processing",
        "Automatic inventory tracking",
        "Sell meet & greets and lessons"
      ]
    },
    {
      icon: Brain,
      title: "Get Career Advice",
      description: "Toney, your AI advisor, gives you personalized tips on when to release music, how to grow, and what to do next.",
      benefits: [
        "Release timing suggestions",
        "Growth recommendations",
        "Marketing ideas",
        "Trend insights"
      ]
    },
    {
      icon: Shield,
      title: "Protect Your Music",
      description: "We automatically find and remove unauthorized copies of your music from the internet. Your work stays yours.",
      benefits: [
        "Automatic copyright monitoring",
        "Instant takedown requests",
        "Monitors YouTube, SoundCloud, etc.",
        "Complete protection history"
      ]
    },
    {
      icon: BarChart3,
      title: "See Your Stats",
      description: "Simple charts show who's listening, where they're from, and how you're growing. No confusing data.",
      benefits: [
        "Real-time listener stats",
        "Fan location maps",
        "Growth charts",
        "Social media tracking"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Everything You Need to Succeed
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Upload music, get paid, sell merch, and grow your career—all in one simple platform.
        </p>
      </div>

      {/* Features Grid - Now only 6 cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card className="rounded-xl hover:shadow-lg transition-shadow" key={index}>
                <CardContent className="p-8">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Simplified Comparison Section - reduced from 8 bullets to 4 */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Boptone?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-xl border-destructive/50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">Without Boptone</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Using 10+ different websites</li>
                  <li>• Losing 30-50% to middlemen</li>
                  <li>• Tracking everything manually</li>
                  <li>• No help or guidance</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-primary/50 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4 text-primary">With Boptone</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Everything in one place</li>
                  <li>• Keep 90% of your money</li>
                  <li>• Automatic tracking</li>
                  <li>• AI advisor helps you grow</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="rounded-xl max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start free today. Upgrade when you're ready.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="rounded-full" size="lg" onClick={() => setLocation("/signup")}>
                Start Free
              </Button>
              <Button className="rounded-full" size="lg" variant="outline" onClick={() => setLocation("/demo")}>
                Watch Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
      <ToneyChatbot />
    </div>
  );
}
