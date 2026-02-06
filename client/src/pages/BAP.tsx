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
      
      {/* Hero Section - Revolutionary Asymmetric Layout */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Massive Typography */}
            <div>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold mb-8 shadow-lg">
                <Zap className="h-5 w-5" />
                The BAP Protocol
              </div>
              <h1 className="text-7xl lg:text-8xl font-black mb-8 leading-none">
                Fans Pay
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  You Directly
                </span>
                <span className="text-black">.</span>
              </h1>
              <p className="text-2xl text-gray-700 mb-12 leading-relaxed font-medium">
                No platform middleman. No 70% revenue cuts. No 90-day waits. Just wallet-to-wallet payments—instantly.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full gap-2 text-xl px-10 py-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105">
                    Start Earning <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full text-xl px-10 py-7 border-4 border-black hover:bg-black hover:text-white transition-all hover:scale-105 shadow-xl">
                  How It Works
                </Button>
              </div>
            </div>

            {/* Right: Gradient Stats Card */}
            <div className="relative">
              <Card className="rounded-3xl border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden animate-pulse">
                <CardContent className="p-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        <DollarSign className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <div className="text-5xl font-black text-green-600">10-100x</div>
                        <div className="text-lg text-gray-600 font-semibold">Higher Earnings</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <div className="text-5xl font-black text-purple-600">Instant</div>
                        <div className="text-lg text-gray-600 font-semibold">Payment Transfer</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <div className="text-5xl font-black text-blue-600">100%</div>
                        <div className="text-lg text-gray-600 font-semibold">Transparent System</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The Economic Inversion - Asymmetric Layout */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
                The Economic
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                  Inversion
                </span>
                <span className="text-black">.</span>
              </h2>
              <p className="text-2xl text-gray-700 leading-relaxed font-medium">
                Traditional platforms control the money and pay artists scraps. BAP inverts this—fans control the money and pay you directly.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Old Model - Red Theme */}
            <Card className="rounded-3xl border-4 border-red-500 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">❌</span>
                  </div>
                  <h3 className="text-3xl font-black text-red-600">Traditional Streaming</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-red-600">1</span>
                    </div>
                    <p className="text-lg text-gray-700 font-medium">Fan pays $10/month to <strong className="text-red-600">platform</strong></p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-red-600">2</span>
                    </div>
                    <p className="text-lg text-gray-700 font-medium">Platform pools all subscription revenue</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-red-600">3</span>
                    </div>
                    <p className="text-lg text-gray-700 font-medium">Platform pays artist <strong className="text-red-600">$0.003-0.005 per stream</strong></p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-red-600">4</span>
                    </div>
                    <p className="text-lg text-gray-700 font-medium">Artist waits <strong className="text-red-600">90 days</strong> for payment</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-red-600">5</span>
                    </div>
                    <p className="text-lg text-gray-700 font-medium">Artist has <strong className="text-red-600">no idea</strong> who streamed or how much</p>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border-4 border-red-200">
                  <p className="text-xl font-black text-red-600">Result: 1,000 streams = $3-5</p>
                </div>
              </CardContent>
            </Card>

            {/* New Model - Green/Blue Theme */}
            <Card className="rounded-3xl border-4 border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-blue-50 hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-green-600">BAP Streaming</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-green-600">1</span>
                    </div>
                    <p className="text-lg text-gray-800 font-bold">Fan loads <strong className="text-green-600">their BAP wallet</strong> with funds ($10, $50, $100—their choice)</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-green-600">2</span>
                    </div>
                    <p className="text-lg text-gray-800 font-bold">When fan streams a song, <strong className="text-green-600">their wallet pays you directly</strong></p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-green-600">3</span>
                    </div>
                    <p className="text-lg text-gray-800 font-bold">You receive payment <strong className="text-green-600">immediately</strong> (not 90 days later)</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-green-600">4</span>
                    </div>
                    <p className="text-lg text-gray-800 font-bold">You know <strong className="text-green-600">exactly which fan</strong> streamed and <strong className="text-green-600">exactly how much</strong> they paid</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-black text-green-600">5</span>
                    </div>
                    <p className="text-lg text-gray-800 font-bold">Boptone takes a <strong className="text-green-600">small platform fee</strong> (7% on Pro tier, 4% on Label tier)</p>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-4 border-green-300">
                  <p className="text-xl font-black text-green-600">Result: 1,000 streams = $50-250+ (10-100x more)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fan-Controlled Stream Values */}
      <section className="py-32 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-black mb-8">
              Fans Control
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                How Much They Pay
              </span>
              <span className="text-black">.</span>
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Every fan sets their own stream value. Budget listeners pay less. Superfans pay more. You earn what your music is actually worth.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            <Card className="rounded-3xl border-4 border-gray-300 shadow-xl hover:scale-105 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black text-gray-600 mb-4">$0.01</div>
                <div className="text-xl font-bold mb-3">Budget Listener</div>
                <div className="text-lg text-gray-600 font-medium">1,000 streams = $10</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black text-blue-600 mb-4">$0.05</div>
                <div className="text-xl font-bold mb-3">Average Fan</div>
                <div className="text-lg text-gray-700 font-medium">1,000 streams = $50</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black text-purple-600 mb-4">$0.25</div>
                <div className="text-xl font-bold mb-3">Superfan</div>
                <div className="text-lg text-gray-700 font-medium">1,000 streams = $250</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-4 border-orange-500 shadow-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black text-orange-600 mb-4">$1.00+</div>
                <div className="text-xl font-bold mb-3">Patron</div>
                <div className="text-lg text-gray-700 font-medium">100 streams = $100+</div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="rounded-3xl border-4 border-green-500 shadow-2xl bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black mb-6">Real Earnings Comparison</h3>
                    <div className="space-y-4 text-xl">
                      <p className="font-medium"><strong className="text-gray-900">Traditional Streaming:</strong> 10,000 streams × $0.004 = <span className="text-red-600 font-black text-2xl">$40</span></p>
                      <p className="font-medium"><strong className="text-gray-900">BAP (Average Fan):</strong> 10,000 streams × $0.05 = <span className="text-green-600 font-black text-2xl">$500</span></p>
                      <p className="font-medium"><strong className="text-gray-900">BAP (Superfan Mix):</strong> 5,000 × $0.05 + 5,000 × $0.25 = <span className="text-green-600 font-black text-2xl">$1,500</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparent Wallet System */}
      <section className="py-32 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-black mb-8">
              Transparent
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Wallet System
              </span>
              <span className="text-white">.</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
              Every transaction is visible. Every payment is instant. No black boxes, no hidden fees, no quarterly delays.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="rounded-3xl border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-900 to-blue-800 hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">Fan Wallet</h3>
                <p className="text-gray-300 mb-6 text-lg font-medium leading-relaxed">
                  Fans load their wallet once, stream unlimited music. Set your own stream value. Top up anytime.
                </p>
                <div className="text-base text-gray-300 space-y-3 font-medium">
                  <p>• Load $10, $50, $100, or custom amount</p>
                  <p>• Set stream value ($0.01 to $1.00+)</p>
                  <p>• See exactly where your money goes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-4 border-green-500 shadow-2xl bg-gradient-to-br from-green-900 to-emerald-800 hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg">
                  <ArrowDownUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">Instant Transfer</h3>
                <p className="text-gray-300 mb-6 text-lg font-medium leading-relaxed">
                  When a fan streams your song, payment transfers instantly from their wallet to yours. No delays.
                </p>
                <div className="text-base text-gray-300 space-y-3 font-medium">
                  <p>• Real-time payment processing</p>
                  <p>• No 90-day waiting period</p>
                  <p>• See earnings update live</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-900 to-purple-800 hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">Artist Wallet</h3>
                <p className="text-gray-300 mb-6 text-lg font-medium leading-relaxed">
                  Receive payments instantly. Withdraw anytime. See exactly which fans paid and how much.
                </p>
                <div className="text-base text-gray-300 space-y-3 font-medium">
                  <p>• Instant payment notifications</p>
                  <p>• Withdraw to bank anytime</p>
                  <p>• Full transaction transparency</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why BAP Changes Everything - 6 Cards Grid */}
      <section className="py-32 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-black mb-8">
              Why BAP
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                Changes Everything
              </span>
              <span className="text-black">.</span>
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              This isn't just better streaming economics. It's a completely different economic system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "10-100x Higher Earnings",
                description: "Artists earn $50-250 per 1,000 streams instead of $3-5. Real money for real work.",
                gradient: "from-green-400 to-emerald-500",
                border: "border-green-500"
              },
              {
                icon: Users,
                title: "Direct Fan Relationships",
                description: "Know exactly which fans support you most. Build real relationships, not anonymous streams.",
                gradient: "from-blue-400 to-cyan-500",
                border: "border-blue-500"
              },
              {
                icon: Zap,
                title: "Instant Payments",
                description: "Get paid the moment a fan streams your song. No waiting 90 days for quarterly payouts.",
                gradient: "from-purple-400 to-pink-500",
                border: "border-purple-500"
              },
              {
                icon: Shield,
                title: "Complete Transparency",
                description: "See every transaction. Know every payment source. No black boxes, no hidden fees.",
                gradient: "from-orange-400 to-red-500",
                border: "border-orange-500"
              },
              {
                icon: Wallet,
                title: "Fan-Controlled Economics",
                description: "Fans decide how much to pay. Budget listeners and superfans both supported. True market value.",
                gradient: "from-indigo-400 to-blue-500",
                border: "border-indigo-500"
              },
              {
                icon: DollarSign,
                title: "No Platform Extraction",
                description: "Boptone doesn't pay for streams—fans do. We just provide the infrastructure (7% platform fee).",
                gradient: "from-teal-400 to-green-500",
                border: "border-teal-500"
              }
            ].map((benefit, index) => (
              <Card className={`rounded-3xl border-4 ${benefit.border} shadow-2xl hover:scale-105 transition-transform`} key={index}>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-lg hover:scale-110 transition-transform`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-black text-2xl mb-4">{benefit.title}</h3>
                  <p className="text-gray-700 text-lg font-medium leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-black mb-4">
              Common
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Questions
              </span>
              <span className="text-black">.</span>
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-6">
              <AccordionItem value="item-1" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  Who pays for the streams—Boptone or the fans?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  <strong>Fans pay artists directly.</strong> Boptone doesn't pay for streams—we just provide the infrastructure (wallet system, streaming tech, smart contracts). When a fan streams your song, their wallet automatically pays your wallet. Boptone takes a small platform fee (7% on Pro tier, 4% on Label tier) to keep the system running.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  How do fans decide how much to pay per stream?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  Fans set their own stream value when they load their BAP wallet. They can choose $0.01 per stream (budget listener), $0.05 (average fan), $0.25 (superfan), $1.00+ (patron), or any custom amount. Once set, every stream automatically pays that amount to the artist. Fans can change their stream value anytime.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  How is this different from traditional streaming?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  <strong>Traditional Streaming:</strong> Fans pay the platform a subscription fee. The platform pools all revenue and pays artists fractions of a penny per stream (around $0.003-0.005). Artists wait 90 days for payment and have no idea who streamed their music.
                  <br /><br />
                  <strong>BAP:</strong> Fans pay artists directly, wallet to wallet. Artists earn 10-100x more per stream ($0.05-0.25+ instead of $0.003). Payments are instant. Artists know exactly which fans support them. The platform doesn't control the money—fans do.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  Do I get paid immediately or wait 90 days?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  <strong>You get paid immediately.</strong> When a fan streams your song, the payment transfers from their wallet to your wallet in real-time. You can withdraw your earnings to your bank account anytime—no waiting for quarterly payouts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  Can I see which fans are paying me?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  <strong>Yes, complete transparency.</strong> You can see exactly which fans streamed your music, how much they paid per stream, and when the payment happened. This lets you build real relationships with your top supporters—not just anonymous stream counts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  What's Boptone's role if fans are paying artists directly?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  Boptone provides the <strong>infrastructure</strong>: the wallet system, streaming technology, smart contracts, payment processing, and analytics dashboard. We're the rails that make direct fan-to-artist payments possible. We take a small platform fee (7% on Pro tier, 4% on Label tier) to maintain the system, but we don't control the money—fans and artists do.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-4 border-gray-300 rounded-3xl px-8 bg-white shadow-xl">
                <AccordionTrigger className="text-left hover:no-underline text-xl font-bold py-6">
                  Is BAP actually decentralized or just marketing?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg font-medium leading-relaxed pb-6">
                  <strong>BAP is genuinely decentralized.</strong> Payments happen wallet-to-wallet using blockchain smart contracts. Boptone doesn't hold your money, pool revenue, or control payouts. We provide the platform, but the economic transactions are peer-to-peer between fans and artists. This is the first truly decentralized streaming platform for music.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto">
          <Card className="rounded-3xl max-w-5xl mx-auto bg-white border-4 border-white shadow-2xl">
            <CardContent className="p-16 text-center">
              <h2 className="text-5xl lg:text-6xl font-black mb-8">
                Ready to Earn
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  What You're Worth
                </span>
                <span className="text-black">?</span>
              </h2>
              <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Join thousands of artists already earning 10-100x more with BAP. No hidden fees or locked-in contracts. Cancel or switch plans anytime.
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full gap-2 text-2xl px-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105">
                    Start Earning Now <ArrowRight className="h-7 w-7" />
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center gap-8 text-gray-600 font-semibold text-lg flex-wrap">
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-600" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-600" />
                  14-day Pro trial
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-600" />
                  Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
