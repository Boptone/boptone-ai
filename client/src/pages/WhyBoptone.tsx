import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Database, DollarSign, Shield, Zap, Users, TrendingUp } from "lucide-react";

export default function WhyBoptone() {
  const [, setLocation] = useLocation();

  const coreValues = [
    {
      icon: Database,
      title: "100% Data Ownership",
      description: "Every email, phone number, and fan insight belongs to you. Export it anytime. Take it anywhere. Your data is your moat."
    },
    {
      icon: DollarSign,
      title: "85-95% Revenue Share",
      description: "Keep what you earn. Free tier: 85%. Pro/Enterprise: 90-95%. No hidden fees. No surprise deductions. Just transparent payouts."
    },
    {
      icon: Shield,
      title: "Master & Publishing Ownership",
      description: "You own your recordings. You own your publishing. You own your rights. Forever. We're a tool you use, not a label you sign with."
    },
    {
      icon: Zap,
      title: "Autonomous AI Agent",
      description: "Toney handles the busywork. Release schedules, social posts, email campaigns, copyright monitoring. Set it once, let it run."
    },
    {
      icon: Users,
      title: "Direct Fan Relationships",
      description: "Build your audience on your terms. Email lists, Discord communities, phone numbers. No platform can take your fans away."
    },
    {
      icon: TrendingUp,
      title: "Integrated Ecosystem",
      description: "Streaming, merch, tickets, analytics, marketing. All in one place. Your command center. Your mothership."
    }
  ];

  const testimonials = [
    {
      quote: "For the first time, I actually own my fan data. I can export every email and take it with me if I ever leave. That's power.",
      author: "Independent Artist",
      role: "Pro Tier Member"
    },
    {
      quote: "Boptone isn't just a platform. It's my entire music business infrastructure. Everything I need in one place.",
      author: "Electronic Producer",
      role: "Enterprise Tier Member"
    },
    {
      quote: "The transparency is refreshing. I see exactly where my money goes. No black box. No surprises.",
      author: "Singer-Songwriter",
      role: "Pro Tier Member"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Autonomous Operating System for Artists
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            Boptone is not a streaming service. Boptone is not a distribution platform. Boptone is not a merch store.
            <br />
            <strong>Boptone is your command center.</strong>
          </p>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Upload music. Sell merch. Build your audience. Track everything. Get paid fairly.
            <br />
            All in one place. All under your control.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/signup")}
          >
            Start Free
          </Button>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built on Ownership
            </h2>
            <p className="text-lg text-gray-700">
              Boptone is built on a simple belief: artists should own their data, their masters, their publishing, and their future.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="p-6 rounded-2xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                >
                  <Icon className="w-10 h-10 mb-4 text-black" />
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Music Business 2.0 Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              Music Business 2.0
            </h2>
            <div className="space-y-6 text-lg text-gray-700">
              <p>
                The music industry is broken. Artists are expected to sacrifice ownership for survival. 
                Streaming services pay fractions of pennies. Distribution platforms take cuts without adding value. 
                Data is locked away. Fans are held hostage.
              </p>
              <p>
                <strong>Boptone is the alternative.</strong>
              </p>
              <p>
                We believe artists should own their data. Every email, phone number, and fan insight belongs to you. 
                Export it anytime. Take it anywhere. Build your audience on your terms.
              </p>
              <p>
                We believe artists should keep what they earn. 85-95% revenue share. No hidden fees. No surprise deductions. 
                Just transparent payouts that respect your work.
              </p>
              <p>
                We believe artists should own their masters and publishing. Forever. We're a tool you use, not a label you sign with. 
                Your rights stay with you.
              </p>
              <p>
                <strong>This is Music Business 2.0.</strong> A new model built on ownership, transparency, and respect for artists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Artists Who Own Their Future
            </h2>
            <p className="text-lg text-gray-700">
              Hear from artists building their careers on Boptone.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 rounded-2xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Own Your Data. Own Your Career. Own Your Future.
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Join thousands of artists building their careers on their terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/signup")}
              >
                Start Free
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/pricing")}
              >
                See Pricing
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
