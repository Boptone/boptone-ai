import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - Minimal with massive typography */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container py-32">
          <div className="max-w-4xl">
            <h1 className="text-7xl lg:text-8xl font-bold mb-10 leading-none">
              Built for
              <br />
              Artists.
            </h1>
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
              You own your music. You own your career. You own your future. No middlemen, no hidden fees, no compromises.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="rounded-full text-lg px-10 py-7 bg-black hover:bg-gray-800 text-white" onClick={() => setLocation("/signup")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-10 py-7 border-2 border-gray-300 hover:border-black hover:bg-gray-50" onClick={() => setLocation("/contact")}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Xerox gradient */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="container py-32">
          <div className="max-w-4xl">
            <h2 className="text-5xl font-bold mb-8">Our Mission</h2>
            <p className="text-2xl text-gray-600 leading-relaxed mb-6">
              For too long, artists have been stuck using complicated tools that take too much of their money. We're changing that.
            </p>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Boptone gives you everything you need to succeed—upload music, get paid fairly, sell merch, and grow your career. All in one simple platform.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values - Minimal cards */}
      <section className="bg-white py-32">
        <div className="container">
          <div className="mb-20">
            <h2 className="text-6xl font-bold mb-4">
              Our Values.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
            {/* Artists First */}
            <div className="border-2 border-gray-200 bg-white p-10 rounded-xl">
              <h3 className="text-3xl font-bold mb-6">Artists First</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every decision we make starts with one question: Does this help artists? We build for you, not for anyone else.
              </p>
            </div>

            {/* Simple & Powerful */}
            <div className="border-2 border-gray-200 bg-white p-10 rounded-xl">
              <h3 className="text-3xl font-bold mb-6">Simple & Powerful</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We use the latest technology to give you powerful tools that are easy to use. No technical knowledge required.
              </p>
            </div>

            {/* 100% Transparent */}
            <div className="border-2 border-gray-200 bg-white p-10 rounded-xl">
              <h3 className="text-3xl font-bold mb-6">100% Transparent</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                No hidden fees, no confusing contracts. You own your music, your data, and your money—100%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story - Minimal layout with xerox gradient */}
      <section className="border-t border-gray-200 bg-gray-50 py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-start max-w-6xl">
            <div>
              <h2 className="text-6xl font-bold mb-8 leading-tight">
                Our Story.
              </h2>
              <p className="text-2xl text-gray-600 leading-relaxed">
                We built Boptone because we were frustrated with how complicated and unfair the music industry is for independent artists.
              </p>
            </div>
            <div className="border-2 border-gray-200 bg-white p-12 rounded-xl">
              <p className="text-2xl text-gray-900 leading-relaxed font-bold mb-8">
                We wanted to create a platform that's simple, fair, and puts artists in control.
              </p>
              <div className="border-l-4 border-black pl-6">
                <p className="text-lg font-bold">That's why Boptone exists.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Building - Minimal cards */}
      <section className="border-t border-gray-200 bg-white py-32">
        <div className="container">
          <div className="mb-20">
            <h2 className="text-6xl font-bold mb-8">
              What We're Building.
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed max-w-3xl">
              A platform where every artist can succeed, no matter where they're starting from.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            {/* New Artists */}
            <div className="border-2 border-gray-200 bg-white p-12 rounded-xl">
              <h3 className="text-4xl font-bold mb-6">For New Artists</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Get help from our AI advisor, upload your music, and start earning money from day one.
              </p>
            </div>

            {/* Established Artists */}
            <div className="border-2 border-black bg-white p-12 rounded-xl">
              <h3 className="text-4xl font-bold mb-6">For Established Artists</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Advanced tools to grow your career, protect your music, and keep more of what you earn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal with xerox gradient */}
      <section className="border-t border-gray-200 bg-gray-50 py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl font-bold mb-8">
              Join the Revolution.
            </h2>
            <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              We're launching in 2026. Be one of the first to try Boptone and take control of your music career.
            </p>
            <div className="flex items-center justify-center gap-6">
              <Button size="lg" className="rounded-full text-lg px-12 py-7 bg-black hover:bg-gray-800 text-white" onClick={() => setLocation("/signup")}>
                Get Early Access
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-12 py-7 border-2 border-gray-300 hover:border-black hover:bg-gray-50" onClick={() => setLocation("/contact")}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ToneyChatbot />
    </div>
  );
}
