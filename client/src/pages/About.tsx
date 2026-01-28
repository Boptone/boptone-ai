import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Zap, Heart, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import { Navigation } from "@/components/Navigation";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Empowering the Next Generation of Creators
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Boptone is building the autonomous operating system for artists—a platform where creators own their tone, own their career, and own their future.
        </p>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              The music industry is splitting in two. Not between big and small. Not between retail and DTC. Between companies building <strong>platforms</strong> and companies still acting like <strong>brands</strong>.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              For decades, the formula was simple: make product, run ads, fight for shelf space, repeat. That playbook doesn't work anymore. Consumers follow belief systems, not logos. Retailers want data, not catalogs. Creators want ownership, not sponsorships.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              The next category leaders won't win because of SKUs. They'll win because of <strong>ecosystems</strong>—where media, data, manufacturing, distribution, and storytelling operate as one engine. That's the new moat. That's the real consolidation play.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Boptone is that platform. We're building the operating system for the creator economy—where artists don't just distribute music, they own and operate their careers as platforms. By 2030, we envision a world where every artist has access to enterprise-grade tools, fair compensation, and complete ownership. Own Your Tone isn't just our mantra—it's our promise.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Creator-First</h3>
              <p className="text-muted-foreground">
                Every decision we make starts with one question: Does this empower creators? We build for artists, not advertisers or investors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We leverage cutting-edge AI, machine learning, and automation to give independent artists the same advantages as major labels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                No hidden fees, no confusing contracts, no black boxes. You own your data, your content, and your revenue—100%.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Story */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Boptone was born from a simple observation: the tools available to independent artists haven't kept pace with the creator economy boom. While social platforms created new opportunities for discovery, they also created new complexities—fragmented revenue streams, opaque algorithms, and an overwhelming administrative burden.
              </p>
              <p>
                Founded by Acid Bird, Inc. in Los Angeles, California, we set out to build the platform we wished existed when we were navigating the music industry ourselves. We assembled a team of technologists, artists, and industry veterans who shared a common vision: democratize access to the tools and resources that were once reserved for signed artists.
              </p>
              <p>
                Today, Boptone is developing a comprehensive autonomous operating system that handles everything from AI-powered career guidance to royalty-backed micro-loans, from global distribution to IP protection. We're not just building software—we're building the infrastructure for the 2030 creator economy.
              </p>
              <p>
                We're pre-launch, but we're already working with early beta artists to refine our platform. Every feature we build, every line of code we write, is informed by real creators solving real problems.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vision */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">The Future We're Building</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            By 2030, we envision a creator economy where artists have complete autonomy over their careers, fair compensation for their work, and access to the same enterprise-grade tools as major corporations. Boptone is the platform that makes this vision a reality.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">For Emerging Artists</h3>
              <p className="text-muted-foreground">
                AI-powered discovery, career guidance, and access to capital through royalty-backed micro-loans—giving you the resources to turn your passion into a sustainable career.
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">For Established Creators</h3>
              <p className="text-muted-foreground">
                Advanced analytics, global distribution, IP protection, and direct-to-fan commerce—everything you need to scale your career without sacrificing ownership.
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">For Labels & Managers</h3>
              <p className="text-muted-foreground">
                Multi-artist management tools, white-label platform options, and enterprise-grade analytics to manage rosters efficiently.
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">For the Industry</h3>
              <p className="text-muted-foreground">
                A transparent, efficient ecosystem that benefits everyone—from creators to fans to service providers—built on fair compensation and mutual respect.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're launching in 2026. Be among the first to experience the future of the creator economy.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/signup")}>
                Get Early Access
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/contact")}>
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                
                <span className="font-bold text-lg">Boptone</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The autonomous operating system for creators. Own Your Tone™
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground">Features</a></li>
                <li><a href="/#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="/demo" className="hover:text-foreground">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">About</a></li>
                <li><a href="/contact" className="hover:text-foreground">Contact</a></li>
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
            <p>© 2026 Boptone. All rights reserved. Own Your Tone™</p>
          </div>
        </div>
      </footer>
      <ToneyChatbot />
    </div>
  );
}
