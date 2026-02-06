import { Button } from "@/components/ui/button";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import Footer from "@/components/Footer";
import { 
  Music, Brain, DollarSign, ShoppingBag, Shield, 
  BarChart3, Globe, Zap, ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

export default function Features() {
  const [, setLocation] = useLocation();

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
      ],
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500",
      iconBg: "bg-blue-500/20"
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
      ],
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500",
      iconBg: "bg-green-500/20"
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
      ],
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500",
      iconBg: "bg-purple-500/20"
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
      ],
      gradient: "from-orange-500/20 to-red-500/20",
      border: "border-orange-500",
      iconBg: "bg-orange-500/20"
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
      ],
      gradient: "from-indigo-500/20 to-blue-500/20",
      border: "border-indigo-500",
      iconBg: "bg-indigo-500/20"
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
      ],
      gradient: "from-teal-500/20 to-cyan-500/20",
      border: "border-teal-500",
      iconBg: "bg-teal-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      
      {/* Hero Section - Asymmetric with massive typography */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <div className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30">
                <span className="text-sm font-semibold">The Complete Creator OS</span>
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-black leading-tight">
              Everything
              <br />
              <span style={{ color: '#4285F4' }}>You Need</span><span className="text-black">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Upload music, get paid, sell merch, and grow your career—all in one simple platform.
            </p>
            <div className="flex gap-4">
              <Button 
                className="rounded-full text-lg px-8 py-6" 
                size="lg" 
                onClick={() => setLocation("/signup")}
              >
                START FREE <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                className="rounded-full text-lg px-8 py-6" 
                size="lg" 
                variant="outline" 
                onClick={() => setLocation("/bap-protocol")}
              >
                Learn About BAP
              </Button>
            </div>
          </div>

          {/* Right: Visual Stats Card */}
          <div className="relative">
            <div className="rounded-3xl border-4 border-blue-500 bg-gradient-to-br from-blue-100/50 to-purple-100/50 p-12 shadow-2xl animate-pulse">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Music className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-black">6 Tools</div>
                    <div className="text-muted-foreground font-medium">One Platform</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <DollarSign className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-black">90%</div>
                    <div className="text-muted-foreground font-medium">You Keep</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-black">100%</div>
                    <div className="text-muted-foreground font-medium">Simple</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - Bold color-coded cards */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-center mb-16">
            Six Powerful Tools<span className="text-black">.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`rounded-3xl border-4 ${feature.border} bg-gradient-to-br ${feature.gradient} p-8 shadow-xl hover:scale-105 transition-transform duration-300`}
                >
                  <div className={`h-16 w-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-foreground mt-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Section - Asymmetric with massive typography */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Massive headline */}
            <div>
              <h2 className="text-6xl md:text-7xl font-black leading-tight mb-8">
                Why
                <br />
                <span style={{ color: '#4285F4' }}>Boptone</span><span className="text-black">?</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Stop juggling multiple platforms. Everything you need in one place.
              </p>
            </div>

            {/* Right: Comparison cards */}
            <div className="space-y-6">
              {/* Without Boptone */}
              <div className="rounded-3xl border-4 border-red-500 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-8 shadow-xl">
                <h3 className="text-2xl font-black mb-6 text-red-600">Without Boptone</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span className="font-medium">Using 10+ different websites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span className="font-medium">Losing 30-50% to middlemen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span className="font-medium">Tracking everything manually</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span className="font-medium">No help or guidance</span>
                  </li>
                </ul>
              </div>

              {/* With Boptone */}
              <div className="rounded-3xl border-4 border-green-500 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 shadow-xl">
                <h3 className="text-2xl font-black mb-6 text-green-600">With Boptone</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="font-medium">Everything in one place</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="font-medium">Keep 90% of your money</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="font-medium">Automatic tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="font-medium">AI advisor helps you grow</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Bold and centered */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-6xl md:text-7xl font-black">
            Ready to Create
            <br />
            <span style={{ color: '#4285F4' }}>Your Tone</span><span className="text-black">?</span>
          </h2>
          <p className="text-2xl text-muted-foreground">
            Join thousands of artists building their careers on the complete Creator OS
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              className="rounded-full text-lg px-10 py-7" 
              size="lg" 
              onClick={() => setLocation("/signup")}
            >
              START FREE <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button 
              className="rounded-full text-lg px-10 py-7" 
              size="lg" 
              variant="outline" 
              onClick={() => setLocation("/demo")}
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Trust signals */}
          <div className="flex items-center justify-center gap-8 pt-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="font-medium">14-day Pro trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ToneyChatbot />
    </div>
  );
}
