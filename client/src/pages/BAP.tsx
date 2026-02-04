import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Users, DollarSign, Shield, Zap, Globe, Upload } from "lucide-react";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BAP() {
  return (
    <div className="min-h-screen">
      

      {/* Hero Section - Simplified language */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Upload Music, Get Paid
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Share Your Music with the World
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Upload your music and reach fans everywhere. Keep 90% of what you earn—no middlemen taking your money.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" className="rounded-full gap-2">
                Start Uploading <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button className="rounded-full" size="lg" variant="outline">
              Learn More
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary">90%</div>
              <div className="text-sm text-muted-foreground mt-1">You Keep</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">$0</div>
              <div className="text-sm text-muted-foreground mt-1">Platform Fees</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">You Own Everything</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Upload Your Music</h3>
                <p className="text-muted-foreground">
                  Drag and drop your songs. We handle the rest—artwork, metadata, everything.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Fans Listen</h3>
                <p className="text-muted-foreground">
                  Your music goes live instantly. Fans worldwide can stream it right away.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. You Get Paid</h3>
                <p className="text-muted-foreground">
                  Keep 90% of every dollar. Get paid monthly, directly to your account.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits - Simplified to 4 key points */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Artists Choose Boptone</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, fair, and built for you
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: DollarSign,
                title: "Keep 90% of Your Money",
                description: "We only take 10% to keep the lights on. No hidden fees, no surprises."
              },
              {
                icon: Shield,
                title: "You Own Everything",
                description: "Your music, your rights, your fans. We don't take anything from you."
              },
              {
                icon: Zap,
                title: "Go Live Instantly",
                description: "Upload and your music is live in minutes. No waiting, no approval process."
              },
              {
                icon: Globe,
                title: "Reach Fans Worldwide",
                description: "Your music is available everywhere, from day one."
              }
            ].map((benefit, index) => (
              <Card className="rounded-xl" key={index}>
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison - Reduced from 7 to 4 bullets */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Boptone vs. Other Platforms</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See the difference
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-xl border-destructive/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-destructive">Other Platforms</h3>
                  <ul className="space-y-4">
                    {[
                      "Keep only 50-70% of your money",
                      "Wait weeks for approval",
                      "No direct connection to fans",
                      "Confusing payment reports"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-destructive text-xs">✕</span>
                        </div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-primary/50 bg-primary/5">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-primary">Boptone</h3>
                  <ul className="space-y-4">
                    {[
                      "Keep 90% of your money",
                      "Go live instantly",
                      "Connect directly with fans",
                      "Simple, clear reports"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Reduced from 6 to 3 questions */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Common Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  How is Boptone different from other platforms?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You keep 90% of your money (most platforms only give you 50-70%). Your music goes live instantly (no waiting weeks). And you connect directly with your fans.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Do I give up any rights to my music?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. You own 100% of your music, your rights, and your relationship with fans. We're just a platform to help you share your music.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  How quickly do I get paid?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Every stream earns money immediately. We pay you monthly, directly to your bank account.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto">
          <Card className="rounded-xl max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Upload your first song today. It's free to start.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/sign-in">
                  <Button className="rounded-full" size="lg">Start Free</Button>
                </Link>
                <Link href="/demo">
                  <Button className="rounded-full" size="lg" variant="outline">Try Demo</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
