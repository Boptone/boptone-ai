import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import Footer from "@/components/Footer";
import { 
  Music, Brain, DollarSign, ShoppingBag, Shield, 
  Calendar, Heart, BarChart3, Globe, Zap,
  TrendingUp, Users, FileText, Bell, Lock
} from "lucide-react";
import { useLocation } from "wouter";

export default function Features() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Brain,
      title: "AI Career Advisor",
      description: "Get personalized career guidance powered by advanced machine learning. Toney, your AI advisor, analyzes your data and provides actionable recommendations for releases, marketing, and growth strategies.",
      benefits: [
        "Real-time career optimization",
        "Release timing recommendations",
        "Content strategy suggestions",
        "Trend forecasting and analysis"
      ]
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track revenue across all sources in one dashboard. Monitor royalties from streaming, sales, shows, and licensing with real-time analytics and forecasting.",
      benefits: [
        "Unified revenue tracking",
        "Royalty analytics and reporting",
        "Financial forecasting tools",
        "Tax-ready documentation"
      ]
    },
    {
      icon: TrendingUp,
      title: "Royalty-Backed Micro-Loans",
      description: "Access capital based on your future royalties. Our AI-powered risk assessment provides fair, transparent lending with flexible repayment terms.",
      benefits: [
        "5% fixed interest rate",
        "AI-powered risk assessment",
        "Flexible 6-24 month terms",
        "No traditional credit check"
      ]
    },
    {
      icon: ShoppingBag,
      title: "Direct-to-Fan Commerce",
      description: "Sell merchandise, digital products, and experiences directly to your fans. Built-in payment processing, inventory management, and fulfillment tracking.",
      benefits: [
        "Physical & digital products",
        "Automated inventory tracking",
        "Integrated payment processing",
        "Experience sales (meet & greets, lessons)"
      ]
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "As the artist, you distribute your music directly to your fans around the globe through Boptone's Audio Protocol. No middlemen, no platform fees—just you and your audience.",
      benefits: [
        "Direct artist-to-fan streaming",
        "90% revenue share to artists",
        "Instant global reach",
        "Full ownership & control"
      ]
    },
    {
      icon: Shield,
      title: "IP Protection",
      description: "AI-powered copyright monitoring detects unauthorized use of your work across the internet. Automated DMCA takedowns protect your intellectual property 24/7.",
      benefits: [
        "99.9% accurate detection",
        "Automated DMCA takedowns",
        "Platform monitoring (YouTube, SoundCloud, etc.)",
        "Complete audit trail"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights into your audience, engagement, and revenue. Track streaming metrics, social media growth, and fan demographics across all platforms.",
      benefits: [
        "Real-time streaming data",
        "Social media analytics",
        "Audience demographics",
        "Growth trend analysis"
      ]
    },
    {
      icon: Calendar,
      title: "Tour Management",
      description: "Plan tours, manage venues, and track show revenue. Budget planning, route optimization, and profit margin calculations all in one place.",
      benefits: [
        "Tour planning and scheduling",
        "Venue tracking",
        "Budget management",
        "Revenue vs. projections"
      ]
    },
    {
      icon: Heart,
      title: "Healthcare & Wellness",
      description: "Access affordable healthcare plans designed for artists. Mental health support, vocal care, performance injury treatment, and 24/7 medical concierge.",
      benefits: [
        "Three-tier healthcare plans",
        "Mental health therapy",
        "Vocal cord specialists",
        "24/7 concierge service"
      ]
    },
    {
      icon: Users,
      title: "Opportunity Matching",
      description: "AI-powered matching connects you with playlist curators, collaborators, venues, and brand partnerships based on your style and career stage.",
      benefits: [
        "Playlist placement opportunities",
        "Collaboration matching",
        "Venue booking leads",
        "Brand partnership discovery"
      ]
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed with intelligent alerts for chart movements, viral content, revenue milestones, and career opportunities—never miss a breakthrough moment.",
      benefits: [
        "Real-time milestone alerts",
        "Chart position updates",
        "Viral content detection",
        "Opportunity notifications"
      ]
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and GDPR-ready data protection. Your content, data, and revenue are secured with industry-leading standards.",
      benefits: [
        "AES-256 encryption",
        "SOC 2 compliant",
        "GDPR & CCPA ready",
        "Regular security audits"
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
          Mission control for your entire artist career. From AI-powered guidance to global distribution, financial management to IP protection—all in one platform.
        </p>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
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

      {/* Integration Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-5xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Seamless Integrations</h2>
              <p className="text-lg text-muted-foreground">
                Boptone connects with the platforms you already use, bringing all your data into one unified dashboard.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-3">Social Media</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Instagram</li>
                  <li>• TikTok</li>
                  <li>• Twitter/X</li>
                  <li>• Facebook</li>
                  <li>• YouTube</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Business Tools</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Stripe (payments)</li>
                  <li>• Email marketing</li>
                  <li>• Analytics platforms</li>
                  <li>• Accounting software</li>
                  <li>• CRM systems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Boptone?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">Without Boptone</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Juggling 10+ different platforms</li>
                  <li>• Losing 30-50% to middlemen</li>
                  <li>• Manual data entry and tracking</li>
                  <li>• Fragmented revenue streams</li>
                  <li>• No career guidance or optimization</li>
                  <li>• Limited access to capital</li>
                  <li>• Reactive copyright protection</li>
                  <li>• No healthcare or benefits</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4 text-primary">With Boptone</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• One unified platform for everything</li>
                  <li>• Keep 100% of your revenue</li>
                  <li>• Automated tracking and analytics</li>
                  <li>• Consolidated revenue dashboard</li>
                  <li>• AI-powered career optimization</li>
                  <li>• Royalty-backed micro-loans</li>
                  <li>• Proactive AI copyright monitoring</li>
                  <li>• Affordable healthcare plans</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Own Your Tone?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the platform that's redefining the creator economy. Start free, upgrade when you're ready.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/signup")}>
                Start Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/demo")}>
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
