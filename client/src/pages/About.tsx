import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Zap, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import Footer from "@/components/Footer";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Built for Artists, By Artists
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Boptone is a platform where you own your music, own your career, and own your future.
        </p>
      </div>

      {/* Mission - Simplified, no business jargon */}
      <div className="container mx-auto px-4 py-16">
        <Card className="rounded-xl max-w-4xl mx-auto">
          <CardContent className="p-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              For too long, artists have been stuck using complicated tools that take too much of their money. We're changing that.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Boptone gives you everything you need to succeed—upload music, get paid fairly, sell merch, and grow your career. All in one simple platform. No confusing contracts, no hidden fees, no giving up your rights.
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
              <h3 className="text-2xl font-semibold mb-3">Artists First</h3>
              <p className="text-muted-foreground">
                Every decision we make starts with one question: Does this help artists? We build for you, not for anyone else.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Simple & Powerful</h3>
              <p className="text-muted-foreground">
                We use the latest technology to give you powerful tools that are easy to use. No technical knowledge required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3">100% Transparent</h3>
              <p className="text-muted-foreground">
                No hidden fees, no confusing contracts. You own your music, your data, and your money—100%.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Story - Condensed from 4 paragraphs to 2 sentences */}
      <div className="container mx-auto px-4 py-16">
        <Card className="rounded-xl max-w-4xl mx-auto">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We built Boptone because we were frustrated with how complicated and unfair the music industry is for independent artists. We wanted to create a platform that's simple, fair, and puts artists in control.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vision - Simplified from 4 boxes to 2 key benefits */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">What We're Building</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            A platform where every artist can succeed, no matter where they're starting from.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">For New Artists</h3>
              <p className="text-muted-foreground">
                Get help from our AI advisor, upload your music, and start earning money from day one.
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">For Established Artists</h3>
              <p className="text-muted-foreground">
                Advanced tools to grow your career, protect your music, and keep more of what you earn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="rounded-xl max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Us</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're launching in 2026. Be one of the first to try Boptone.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="rounded-full" size="lg" onClick={() => setLocation("/signup")}>
                Get Early Access
              </Button>
              <Button className="rounded-full" size="lg" variant="outline" onClick={() => setLocation("/contact")}>
                Contact Us
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
