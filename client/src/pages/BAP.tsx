import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Wallet, TrendingUp, Shield, Zap, DollarSign, Users, ArrowDownUp } from "lucide-react";
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
      
      {/* Hero Section - The Revolution */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center">

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Fans Pay Artists <span className="text-primary">Directly</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            No platform middleman. No 70% revenue cuts. No quarterly payouts. Just fans streaming music and artists getting paid instantly—wallet to wallet.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="rounded-full gap-2 text-lg px-8 py-6">
                Join BAP <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-6">
              Watch How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* The Economic Inversion */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Economic Inversion</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Traditional streaming platforms control the money and pay artists scraps. BAP inverts this model—fans control the money and pay artists directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Old Model */}
            <Card className="rounded-xl border-destructive/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-destructive">Traditional Streaming</h3>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <p>Fan pays $10/month to <strong>platform</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <p>Platform pools all subscription revenue</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <p>Platform pays artist <strong>$0.003-0.005 per stream</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">4</span>
                    </div>
                    <p>Artist waits <strong>90 days</strong> for payment</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">5</span>
                    </div>
                    <p>Artist has <strong>no idea</strong> who streamed or how much each stream was worth</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                  <p className="text-sm font-semibold text-destructive">Result: 1,000 streams = $3-5</p>
                </div>
              </CardContent>
            </Card>

            {/* New Model */}
            <Card className="rounded-xl border-primary/50 bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">BAP Streaming</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <p className="font-medium">Fan loads <strong>their BAP wallet</strong> with funds ($10, $50, $100—their choice)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <p className="font-medium">When fan streams a song, <strong>their wallet pays the artist directly</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <p className="font-medium">Artist receives payment <strong>immediately</strong> (not 90 days later)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <p className="font-medium">Artist knows <strong>exactly which fan</strong> streamed and <strong>exactly how much</strong> they paid</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">5</span>
                    </div>
                    <p className="font-medium">Boptone takes a <strong>small platform fee</strong> (7% on Pro tier, 4% on Label tier)</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm font-semibold text-primary">Result: 1,000 streams = $50-250+ (10-100x Spotify)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fan-Controlled Stream Values */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Fans Control How Much They Pay</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every fan sets their own stream value. Budget listeners pay less. Superfans pay more. Artists earn what their music is actually worth.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">$0.01</div>
                <div className="text-sm font-semibold mb-3">Budget Listener</div>
                <div className="text-xs text-muted-foreground">1,000 streams = $10</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">$0.05</div>
                <div className="text-sm font-semibold mb-3">Average Fan</div>
                <div className="text-xs text-muted-foreground">1,000 streams = $50</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">$0.25</div>
                <div className="text-sm font-semibold mb-3">Superfan</div>
                <div className="text-xs text-muted-foreground">1,000 streams = $250</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">$1.00+</div>
                <div className="text-sm font-semibold mb-3">Patron</div>
                <div className="text-xs text-muted-foreground">100 streams = $100+</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Real Math: 10,000 Streams</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Spotify:</strong> 10,000 streams × $0.004 = <span className="text-destructive font-bold">$40</span></p>
                      <p><strong>BAP (Average Fan):</strong> 10,000 streams × $0.05 = <span className="text-primary font-bold">$500</span></p>
                      <p><strong>BAP (Superfan Mix):</strong> 5,000 × $0.05 + 5,000 × $0.25 = <span className="text-primary font-bold">$1,500</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparent Wallet System */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Transparent Wallet System</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every transaction is visible. Every payment is instant. No black boxes, no hidden fees, no quarterly delays.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="rounded-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Fan Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  Fans load their wallet once, stream unlimited music. Set your own stream value. Top up anytime.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Load $10, $50, $100, or custom amount</p>
                  <p>• Set stream value ($0.01 to $1.00+)</p>
                  <p>• See exactly where your money goes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-primary/50 bg-primary/5">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ArrowDownUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Transfer</h3>
                <p className="text-muted-foreground mb-4">
                  When a fan streams your song, payment transfers instantly from their wallet to yours. No delays.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Real-time payment processing</p>
                  <p>• No 90-day waiting period</p>
                  <p>• See earnings update live</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Artist Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  Receive payments instantly. Withdraw anytime. See exactly which fans paid and how much.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Instant payment notifications</p>
                  <p>• Withdraw to bank anytime</p>
                  <p>• Full transaction transparency</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why BAP Changes Everything */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why BAP Changes Everything</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              This isn't just better streaming economics. It's a completely different economic system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "10-100x Higher Earnings",
                description: "Artists earn $50-250 per 1,000 streams instead of $3-5. Real money for real work."
              },
              {
                icon: Users,
                title: "Direct Fan Relationships",
                description: "Know exactly which fans support you most. Build real relationships, not anonymous streams."
              },
              {
                icon: Zap,
                title: "Instant Payments",
                description: "Get paid the moment a fan streams your song. No waiting 90 days for quarterly payouts."
              },
              {
                icon: Shield,
                title: "Complete Transparency",
                description: "See every transaction. Know every payment source. No black boxes, no hidden fees."
              },
              {
                icon: Wallet,
                title: "Fan-Controlled Economics",
                description: "Fans decide how much to pay. Budget listeners and superfans both supported. True market value."
              },
              {
                icon: DollarSign,
                title: "No Platform Extraction",
                description: "Boptone doesn't pay for streams—fans do. We just provide the infrastructure (7% platform fee)."
              }
            ].map((benefit, index) => (
              <Card className="rounded-xl" key={index}>
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Common Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  Who pays for the streams—Boptone or the fans?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <strong>Fans pay artists directly.</strong> Boptone doesn't pay for streams—we just provide the infrastructure (wallet system, streaming tech, smart contracts). When a fan streams your song, their wallet automatically pays your wallet. Boptone takes a small platform fee (7% on Pro tier, 4% on Label tier) to keep the system running.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  How do fans decide how much to pay per stream?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Fans set their own stream value when they load their BAP wallet. They can choose $0.01 per stream (budget listener), $0.05 (average fan), $0.25 (superfan), $1.00+ (patron), or any custom amount. Once set, every stream automatically pays that amount to the artist. Fans can change their stream value anytime.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  How is this different from Spotify or Apple Music?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <strong>Spotify/Apple Music:</strong> Fans pay the platform a subscription fee. The platform pools all revenue and pays artists fractions of a penny per stream (around $0.003-0.005). Artists wait 90 days for payment and have no idea who streamed their music.
                  <br /><br />
                  <strong>BAP:</strong> Fans pay artists directly, wallet to wallet. Artists earn 10-100x more per stream ($0.05-0.25+ instead of $0.003). Payments are instant. Artists know exactly which fans support them. The platform doesn't control the money—fans do.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  Do I get paid immediately or wait 90 days like Spotify?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <strong>You get paid immediately.</strong> When a fan streams your song, the payment transfers from their wallet to your wallet in real-time. You can withdraw your earnings to your bank account anytime—no waiting for quarterly payouts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I see which fans are paying me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <strong>Yes, complete transparency.</strong> You can see exactly which fans streamed your music, how much they paid per stream, and when the payment happened. This lets you build real relationships with your top supporters—not just anonymous stream counts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  What's Boptone's role if fans are paying artists directly?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Boptone provides the <strong>infrastructure</strong>: the wallet system, streaming technology, smart contracts, payment processing, and analytics dashboard. We're the rails that make direct fan-to-artist payments possible. We take a small platform fee (7% on Pro tier, 4% on Label tier) to maintain the system, but we don't control the money—fans and artists do.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  Is BAP actually decentralized or just marketing?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <strong>BAP is genuinely decentralized.</strong> Payments happen wallet-to-wallet using blockchain smart contracts. Boptone doesn't hold your money, pool revenue, or control payouts. We provide the platform, but the economic transactions are peer-to-peer between fans and artists. This is the first truly decentralized streaming platform for music.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto">
          <Card className="rounded-xl max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Join the Revolution</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Be part of the first truly decentralized streaming platform. Get paid what your music is actually worth.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/signup">
                  <Button className="rounded-full text-lg px-8 py-6" size="lg">Start Earning with BAP</Button>
                </Link>
                <Link href="/demo">
                  <Button className="rounded-full text-lg px-8 py-6" size="lg" variant="outline">Try Demo</Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>14-day Pro trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                No hidden fees or locked-in contracts. Cancel or switch plans anytime.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
