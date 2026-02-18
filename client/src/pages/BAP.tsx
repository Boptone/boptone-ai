import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/Footer";

export default function BAP() {
  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-none">
              Fans Pay You Directly
            </h1>
            <p className="text-2xl text-gray-700 mb-12 leading-relaxed">
              No platform middleman. No 70% revenue cuts. No 90-day waits. Just wallet-to-wallet payments—instantly.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/signup">
                <Button size="lg" className="rounded-full gap-2 text-xl px-10 py-7 bg-black text-white hover:bg-gray-900 shadow-[4px_4px_0px_0px_rgba(6,182,212,1)] hover:shadow-[6px_6px_0px_0px_rgba(6,182,212,1)] transition-all">
                  Start Earning
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <div className="text-5xl font-bold text-black mb-4">10-100x</div>
              <div className="text-lg text-gray-700">Higher Earnings</div>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <div className="text-5xl font-bold text-black mb-4">Instant</div>
              <div className="text-lg text-gray-700">Payment Transfer</div>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <div className="text-5xl font-bold text-black mb-4">100%</div>
              <div className="text-lg text-gray-700">Transparent System</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Economic Inversion */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8">
              The Economic Inversion
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed">
              Traditional platforms control the money and pay artists scraps. BopAudio inverts this—fans control the money and pay you directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Old Model */}
            <div className="border-2 border-gray-200 rounded-xl p-10 bg-white hover:border-gray-400 transition-colors">
              <h3 className="text-3xl font-bold text-black mb-8">Traditional Streaming</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-black">1</span>
                  </div>
                  <p className="text-lg text-gray-700">Fan pays $10/month to platform</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-black">2</span>
                  </div>
                  <p className="text-lg text-gray-700">Platform pools all subscription revenue</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-black">3</span>
                  </div>
                  <p className="text-lg text-gray-700">Platform pays artist $0.003-0.005 per stream</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-black">4</span>
                  </div>
                  <p className="text-lg text-gray-700">Artist waits 90 days for payment</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-black">5</span>
                  </div>
                  <p className="text-lg text-gray-700">Artist has no idea who streamed or how much</p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gray-100 rounded-xl">
                <p className="text-xl font-bold text-black">Result: 1,000 streams = $3-5</p>
              </div>
            </div>

            {/* New Model - BAP */}
            <div className="border-2 border-gray-200 rounded-xl p-10 bg-white hover:border-gray-400 transition-colors">
              <h3 className="text-3xl font-bold text-black mb-8">BopAudio Streaming</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <p className="text-lg text-black font-medium">Fan loads their BopAudio wallet with funds ($10, $50, $100—their choice)</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <p className="text-lg text-black font-medium">When fan streams a song, their wallet pays you directly</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <p className="text-lg text-black font-medium">You receive payment immediately (not 90 days later)</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <p className="text-lg text-black font-medium">You know exactly which fan streamed and exactly how much they paid</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">5</span>
                  </div>
                  <p className="text-lg text-black font-medium">Boptone takes a small platform fee (10% max)</p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-black text-white rounded-xl">
                <p className="text-xl font-bold">Result: 1,000 streams = $50-250+ (10-100x more)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fan-Controlled Stream Values */}
      <section className="py-32 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8">
              Fans Control How Much They Pay
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Every fan sets their own stream value. Budget listeners pay less. Superfans pay more. You earn what your music is actually worth.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <div className="text-5xl font-bold text-gray-600 mb-4">$0.01</div>
              <div className="text-xl font-bold mb-3">Budget Listener</div>
              <div className="text-lg text-gray-600">1,000 streams = $10</div>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <div className="text-5xl font-bold text-black mb-4">$0.05</div>
              <div className="text-xl font-bold mb-3">Average Fan</div>
              <div className="text-lg text-gray-700">1,000 streams = $50</div>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:border-gray-400 transition-colors">
              <div className="text-5xl font-bold text-black mb-4">$0.25</div>
              <div className="text-xl font-bold mb-3">Superfan</div>
              <div className="text-lg text-gray-700">1,000 streams = $250</div>
            </div>
            <div className="border-2 border-black rounded-xl p-8 text-center bg-black text-white hover:border-gray-800 transition-colors">
              <div className="text-5xl font-bold mb-4">$1.00+</div>
              <div className="text-xl font-bold mb-3">Patron</div>
              <div className="text-lg">100 streams = $100+</div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-gray-200 rounded-xl p-10 bg-white hover:border-gray-400 transition-colors">
              <h3 className="text-3xl font-bold mb-6">Real Earnings Comparison</h3>
              <div className="space-y-4 text-xl">
                <p className="font-medium">Traditional Streaming: 10,000 streams × $0.004 = <span className="text-black font-bold text-2xl">$40</span></p>
                <p className="font-medium">BopAudio (Average Fan): 10,000 streams × $0.05 = <span className="text-black font-bold text-2xl">$500</span></p>
                <p className="font-medium">BopAudio (Superfan Mix): 5,000 × $0.05 + 5,000 × $0.25 = <span className="text-black font-bold text-2xl">$1,500</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Wallet System */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8">
              Transparent Wallet System
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Every transaction is visible. Every payment is instant. No black boxes, no hidden fees, no quarterly delays.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="border-2 border-gray-200 rounded-xl p-10 bg-white hover:border-gray-400 transition-colors">
              <h3 className="text-3xl font-bold mb-4">Fan Wallet</h3>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Fans load their wallet once, stream unlimited music. Set your own stream value. Top up anytime.
              </p>
              <div className="text-base text-gray-700 space-y-3">
                <p>• Load $10, $50, $100, or custom amount</p>
                <p>• Set stream value ($0.01 to $1.00+)</p>
                <p>• See exactly where your money goes</p>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-10 bg-white hover:border-gray-400 transition-colors">
              <h3 className="text-3xl font-bold mb-4">Instant Transfer</h3>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                When a fan streams your song, payment transfers instantly from their wallet to yours. No delays.
              </p>
              <div className="text-base text-gray-700 space-y-3">
                <p>• Real-time payment processing</p>
                <p>• No 90-day waiting period</p>
                <p>• See earnings update live</p>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-10 bg-white hover:border-gray-400 transition-colors">
              <h3 className="text-3xl font-bold mb-4">Artist Wallet</h3>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Receive payments instantly. Withdraw anytime. See exactly which fans paid and how much.
              </p>
              <div className="text-base text-gray-700 space-y-3">
                <p>• Instant payment notifications</p>
                <p>• Withdraw to bank anytime</p>
                <p>• Full transaction transparency</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BopAudio Changes Everything */}
      <section className="py-32 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8">
              Why BopAudio Changes Everything
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              This isn't just better streaming economics. It's a completely different economic system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <h3 className="font-bold text-2xl mb-4">10-100x Higher Earnings</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Artists earn $50-250 per 1,000 streams instead of $3-5. Real money for real work.</p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <h3 className="font-bold text-2xl mb-4">Direct Fan Relationships</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Know exactly which fans support you most. Build real relationships, not anonymous streams.</p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <h3 className="font-bold text-2xl mb-4">Instant Payments</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Get paid the moment a fan streams your song. No waiting 90 days for quarterly payouts.</p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <h3 className="font-bold text-2xl mb-4">Complete Transparency</h3>
              <p className="text-gray-700 text-lg leading-relaxed">See every transaction. Know every payment source. No black boxes, no hidden fees.</p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <h3 className="font-bold text-2xl mb-4">Fan-Controlled Economics</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Fans decide how much to pay. Budget listeners and superfans both supported. True market value.</p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <h3 className="font-bold text-2xl mb-4">Artist Ownership</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Boptone doesn't pay for streams—fans do. We just provide the infrastructure (10% platform fee).</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold mb-4">
              Common Questions
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-2 border-gray-200 rounded-xl px-6 hover:border-gray-400 transition-colors">
                <AccordionTrigger className="text-xl font-bold text-left">
                  How does the wallet system work?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-700 leading-relaxed">
                  Fans load their BopAudio wallet with funds ($10, $50, $100, or any custom amount). They set their own stream value (e.g., $0.05 per stream). When they stream your song, that amount is instantly transferred from their wallet to yours. No platform pooling, no delays.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-2 border-gray-200 rounded-xl px-6 hover:border-gray-400 transition-colors">
                <AccordionTrigger className="text-xl font-bold text-left">
                  What if a fan's wallet runs out?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-700 leading-relaxed">
                  When a fan's wallet balance runs low, they'll receive a notification to top up. They can add funds instantly and continue streaming. There's no forced subscription—fans only pay when they want to listen.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-2 border-gray-200 rounded-xl px-6 hover:border-gray-400 transition-colors">
                <AccordionTrigger className="text-xl font-bold text-left">
                  How much does Boptone take?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-700 leading-relaxed">
                  Boptone takes a 10% platform fee on BopAudio streaming revenue. This covers infrastructure, payment processing, and platform maintenance. You keep 90% of every stream. There are no hidden fees, no revenue pooling, and no quarterly delays.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-2 border-gray-200 rounded-xl px-6 hover:border-gray-400 transition-colors">
                <AccordionTrigger className="text-xl font-bold text-left">
                  Can I see who's streaming my music?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-700 leading-relaxed">
                  Yes. You'll see exactly which fans streamed your music, how much they paid, and when. This transparency lets you build real relationships with your biggest supporters and understand your audience better.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-2 border-gray-200 rounded-xl px-6 hover:border-gray-400 transition-colors">
                <AccordionTrigger className="text-xl font-bold text-left">
                  When do I get paid?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-700 leading-relaxed">
                  Instantly. When a fan streams your song, the payment transfers to your artist wallet immediately. You can withdraw to your bank account anytime, at any amount. No 90-day waits, no minimum thresholds.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-2 border-gray-200 rounded-xl px-6 hover:border-gray-400 transition-colors">
                <AccordionTrigger className="text-xl font-bold text-left">
                  What's the catch?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-700 leading-relaxed">
                  There isn't one. This is a fundamentally different economic model. Instead of platforms pooling subscription revenue and paying artists pennies, fans pay artists directly. Boptone just provides the infrastructure. The "catch" is that you need to build a fanbase willing to pay for your music—but that's always been true.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            Join thousands of artists already earning 10-100x more
          </h2>
          <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
            No hidden fees. No locked-in contracts. Cancel anytime.
          </p>
          <Link href="/signup">
            <Button size="lg" className="rounded-full gap-2 text-xl px-10 py-7 bg-black text-white hover:bg-gray-900 shadow-[4px_4px_0px_0px_rgba(6,182,212,1)] hover:shadow-[6px_6px_0px_0px_rgba(6,182,212,1)] transition-all">
              Start Earning with BopAudio
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
