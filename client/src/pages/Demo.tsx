import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function Demo() {
  const [, setLocation] = useLocation();

  const demoSections = [
    {
      title: "Dashboard Overview",
      description: "See how Boptone consolidates all your artist data into one powerful dashboard. Track revenue, streams, followers, and opportunities in real-time.",
      timestamp: "0:00 - 2:30"
    },
    {
      title: "AI Career Advisor (Toney)",
      description: "Watch Toney analyze your career data and provide personalized recommendations for release timing, marketing strategies, and growth opportunities.",
      timestamp: "2:30 - 5:00"
    },
    {
      title: "Financial Management",
      description: "Explore the revenue dashboard that tracks royalties across all platforms, forecasts future earnings, and manages micro-loan applications.",
      timestamp: "5:00 - 7:30"
    },
    {
      title: "Direct-to-Fan Commerce",
      description: "Learn how to set up your merchandise store, manage inventory, and process payments—all without leaving the platform.",
      timestamp: "7:30 - 10:00"
    },
    {
      title: "Global Distribution",
      description: "Distribute your music to 150+ streaming platforms with a few clicks. Track performance across all channels in real-time.",
      timestamp: "10:00 - 12:00"
    },
    {
      title: "IP Protection",
      description: "See how our AI monitors the internet 24/7 for unauthorized use of your work and automatically sends DMCA takedowns.",
      timestamp: "12:00 - 14:00"
    },
    {
      title: "Tour Management",
      description: "Plan tours, manage venues, track budgets, and optimize routes—all from your Boptone dashboard.",
      timestamp: "14:00 - 16:00"
    },
    {
      title: "Healthcare & Wellness",
      description: "Explore affordable healthcare plans designed specifically for artists, including mental health support and vocal care.",
      timestamp: "16:00 - 18:00"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          See Boptone in Action
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Watch our comprehensive platform walkthrough to see how Boptone transforms artist career management from discovery to breakthrough success.
        </p>
      </div>

      {/* Video Placeholder */}
      <div className="container mx-auto px-4 py-8 mb-16">
        <Card className="rounded-xl max-w-5xl mx-auto">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="bg-primary/10 backdrop-blur-sm rounded-full p-8 inline-block mb-6">
                  <Play className="h-20 w-20 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Platform Demo Video</h3>
                <p className="text-muted-foreground mb-6">18-minute comprehensive walkthrough</p>
                <p className="text-sm text-muted-foreground italic">
                  Demo video coming soon. Sign up for early access to be notified when it's available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Sections */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">What You'll Learn</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {demoSections.map((section, index) => (
            <Card className="rounded-xl hover:shadow-lg transition-shadow" key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{section.title}</h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                        {section.timestamp}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="container mx-auto px-4 py-16">
        <Card className="rounded-xl max-w-5xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Key Takeaways</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">For Emerging Artists</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• How to leverage AI for career growth</li>
                  <li>• Accessing capital through micro-loans</li>
                  <li>• Building direct fan relationships</li>
                  <li>• Protecting your intellectual property</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">For Established Creators</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Consolidating fragmented revenue streams</li>
                  <li>• Advanced analytics and forecasting</li>
                  <li>• Scaling commerce operations</li>
                  <li>• Enterprise-grade security and compliance</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">For Labels & Managers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Multi-artist roster management</li>
                  <li>• White-label platform options</li>
                  <li>• Comprehensive reporting tools</li>
                  <li>• Team collaboration features</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Platform Advantages</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• No revenue sharing (keep 100%)</li>
                  <li>• Bank-level security (SOC 2, GDPR)</li>
                  <li>• 24/7 expert support</li>
                  <li>• Continuous feature updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Demo FAQs</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can I try Boptone before committing?</h3>
                <p className="text-muted-foreground">
                  Yes! We offer a free tier for emerging artists and a 14-day free trial on our Pro tier with no credit card required. You can explore all features risk-free.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">How long does setup take?</h3>
                <p className="text-muted-foreground">
                  Most artists complete initial setup in under 15 minutes. Connecting streaming platforms and social accounts takes just a few clicks. Our AI advisor guides you through the entire process.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Do I need technical skills?</h3>
                <p className="text-muted-foreground">
                  Not at all. Boptone is designed for artists, not developers. If you can use Instagram or TikTok, you can use Boptone. Our interface is intuitive and our AI assistant (Toney) helps with any questions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can I migrate my existing data?</h3>
                <p className="text-muted-foreground">
                  Yes. Boptone automatically imports your streaming data, social media analytics, and revenue history when you connect your accounts. No manual data entry required.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">What if I need help?</h3>
                <p className="text-muted-foreground">
                  Toney (our AI assistant) is available 24/7 for instant help. Pro and Enterprise users also get priority email support and access to our team of artist success managers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="rounded-xl max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the platform that's empowering the next generation of creators. Start free, upgrade when you're ready to scale.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="rounded-full" size="lg" onClick={() => setLocation("/signup")}>
                Start Free
              </Button>
              <Button className="rounded-full" size="lg" variant="outline" onClick={() => setLocation("/contact")}>
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ToneyChatbot />
    </div>
  );
}
