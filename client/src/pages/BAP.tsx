import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Music, Users, DollarSign, Shield, Zap, Globe } from "lucide-react";
import { Link } from "wouter";

export default function BAP() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 font-bold text-xl">
              <Music className="h-6 w-6" />
              Boptone
            </button>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </button>
            </Link>
            <Link href="/features">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </button>
            </Link>
            <Link href="/pricing">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </button>
            </Link>
            <Link href="/sign-in">
              <Button variant="default">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            The Future of Music Distribution
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Boptone Audio Protocol
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A revolutionary direct-to-fan streaming protocol that puts artists first. Upload your music, reach global audiences, and keep 90% of what you earn—no middlemen, no gatekeepers.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" className="gap-2">
                Start Uploading <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary">90%</div>
              <div className="text-sm text-muted-foreground mt-1">Artist Revenue Share</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">$0</div>
              <div className="text-sm text-muted-foreground mt-1">Platform Fees</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Ownership & Control</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How BAP Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to reach millions of fans worldwide
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Upload Your Music</h3>
                <p className="text-muted-foreground">
                  Drag and drop your tracks. Our AI extracts metadata, generates artwork suggestions, and prepares your music for global distribution—all in seconds.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Fans Stream Directly</h3>
                <p className="text-muted-foreground">
                  Your music is instantly available to fans worldwide. No approval process, no waiting period. Stream counts and engagement tracked in real-time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Get Paid Fairly</h3>
                <p className="text-muted-foreground">
                  You keep 90% of streaming revenue. Transparent payment tracking, instant analytics, and monthly payouts directly to your account.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits for Artists */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Artists Choose BAP</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by artists, for artists. Every feature designed to maximize your earnings and creative control.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: DollarSign,
                title: "90% Revenue Share",
                description: "Keep what you earn. We only take 10% to cover infrastructure costs—no hidden fees, no deductions."
              },
              {
                icon: Shield,
                title: "Full Ownership & Control",
                description: "You own your music, your data, and your relationship with fans. No licensing deals, no rights transfers."
              },
              {
                icon: Zap,
                title: "Instant Distribution",
                description: "Upload and go live in minutes. No approval queues, no gatekeepers deciding if your music is 'worthy.'"
              },
              {
                icon: Globe,
                title: "Global Reach",
                description: "Your music available worldwide from day one. Fans can stream from anywhere, anytime."
              },
              {
                icon: Users,
                title: "Direct Fan Connection",
                description: "Build your audience without intermediaries. See who's listening, where they're from, and how they engage."
              },
              {
                icon: Check,
                title: "Transparent Analytics",
                description: "Real-time streaming data, earnings breakdowns, and audience insights. No black-box algorithms."
              }
            ].map((benefit, index) => (
              <Card key={index}>
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

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">BAP vs. Traditional Streaming</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See why thousands of artists are making the switch
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-destructive/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-destructive">Traditional Platforms</h3>
                  <ul className="space-y-4">
                    {[
                      "0.003¢ - 0.005¢ per stream",
                      "Platform takes 30-50% revenue",
                      "Weeks of approval delays",
                      "No direct fan relationship",
                      "Opaque algorithms control visibility",
                      "Limited artist data access",
                      "Rights and licensing complications"
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
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-primary">Boptone Audio Protocol</h3>
                  <ul className="space-y-4">
                    {[
                      "90% revenue share to artists",
                      "Only 10% platform fee",
                      "Instant live distribution",
                      "Direct artist-to-fan connection",
                      "Transparent discovery feeds",
                      "Complete analytics access",
                      "You own 100% of your rights"
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

      {/* Benefits for Fans */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Fans Love BAP</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support artists directly while discovering incredible music
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Support Artists Directly</h3>
                <p className="text-muted-foreground text-sm">
                  90% of your stream goes directly to the artist. Know your support actually helps creators thrive.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Discover New Music</h3>
                <p className="text-muted-foreground text-sm">
                  Curated feeds, trending charts, and social discovery help you find your next favorite artist.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Connect with Artists</h3>
                <p className="text-muted-foreground text-sm">
                  Follow, like, and engage directly with your favorite creators. No corporate filter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "How is BAP different from traditional streaming?",
                answer: "BAP eliminates the middleman. You upload directly to our platform, fans stream directly from you, and you keep 90% of revenue. Traditional platforms take 30-50% and pay artists fractions of a cent per stream."
              },
              {
                question: "Do I need to give up any rights to my music?",
                answer: "Absolutely not. You retain 100% ownership of your music, masters, and copyrights. BAP is a distribution protocol, not a record label or licensing deal."
              },
              {
                question: "How quickly can I start earning?",
                answer: "Immediately. Upload your music, and it's live within minutes. Every stream generates revenue that's tracked in real-time and paid out monthly."
              },
              {
                question: "Can I still distribute to other platforms?",
                answer: "Yes! BAP doesn't require exclusivity. You can use BAP alongside any other distribution method you choose."
              },
              {
                question: "How do fans discover my music on BAP?",
                answer: "Through curated feeds, trending charts, social sharing, search, and genre-based discovery. We prioritize human curation over algorithmic manipulation."
              },
              {
                question: "What file formats does BAP support?",
                answer: "We accept WAV, MP3, FLAC, and AAC files. Our system automatically converts and optimizes for streaming while preserving audio quality."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Own Your Music?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of artists who are taking control of their careers with BAP.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features"><button className="hover:text-foreground transition-colors">Features</button></Link></li>
                <li><Link href="/pricing"><button className="hover:text-foreground transition-colors">Pricing</button></Link></li>
                <li><Link href="/bap"><button className="hover:text-foreground transition-colors">BAP Protocol</button></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about"><button className="hover:text-foreground transition-colors">About</button></Link></li>
                <li><Link href="/contact"><button className="hover:text-foreground transition-colors">Contact</button></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog"><button className="hover:text-foreground transition-colors">Blog</button></Link></li>
                <li><Link href="/support"><button className="hover:text-foreground transition-colors">Support</button></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy"><button className="hover:text-foreground transition-colors">Privacy</button></Link></li>
                <li><Link href="/terms"><button className="hover:text-foreground transition-colors">Terms</button></Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            © 2025 Boptone. All rights reserved. Own Your Tone™
          </div>
        </div>
      </footer>
    </div>
  );
}
