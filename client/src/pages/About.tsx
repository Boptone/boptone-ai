import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Zap, Heart, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      
      {/* Hero Section - Revolutionary Asymmetric Layout */}
      <section className="py-32 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Massive Typography */}
            <div>

              <h1 className="text-7xl lg:text-8xl font-bold mb-8 leading-none">
                Built for
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Artists
                </span>
                <span className="text-black">.</span>
              </h1>
              <p className="text-2xl text-gray-700 mb-12 leading-relaxed font-medium">
                You own your music. You own your career. You own your future. No middlemen, no hidden fees, no compromises.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Button size="lg" className="rounded-full gap-2 text-xl px-10 py-7 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105" onClick={() => setLocation("/signup")}>
                  Get Started <ArrowRight className="h-6 w-6" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full text-xl px-10 py-7 border-4 border-black hover:bg-black hover:text-white transition-all hover:scale-105 shadow-xl" onClick={() => setLocation("/contact")}>
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Right: Mission Card */}
            <div className="relative">
              <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden animate-pulse">
                <CardContent className="p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold">Our Mission</h2>
                  </div>
                  <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                    For too long, artists have been stuck using complicated tools that take too much of their money. We're changing that.
                  </p>
                  <p className="text-xl text-gray-700 leading-relaxed font-medium">
                    Boptone gives you everything you need to succeed—upload music, get paid fairly, sell merch, and grow your career. All in one simple platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values - 3 Color-Coded Cards */}
      <section className="py-32 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-bold mb-4">
              Our
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Values
              </span>
              <span className="text-black">.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Blue Card - Artists First */}
            <Card className="rounded-3xl border-4 border-blue-500 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Artists First</h3>
                <p className="text-gray-700 text-lg font-medium leading-relaxed">
                  Every decision we make starts with one question: Does this help artists? We build for you, not for anyone else.
                </p>
              </CardContent>
            </Card>

            {/* Green Card - Simple & Powerful */}
            <Card className="rounded-3xl border-4 border-green-500 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Simple & Powerful</h3>
                <p className="text-gray-700 text-lg font-medium leading-relaxed">
                  We use the latest technology to give you powerful tools that are easy to use. No technical knowledge required.
                </p>
              </CardContent>
            </Card>

            {/* Purple Card - 100% Transparent */}
            <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">100% Transparent</h3>
                <p className="text-gray-700 text-lg font-medium leading-relaxed">
                  No hidden fees, no confusing contracts. You own your music, your data, and your money—100%.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story - Asymmetric Layout */}
      <section className="py-32 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <h2 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Our
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Story
                </span>
                <span className="text-black">.</span>
              </h2>
              <p className="text-2xl text-gray-700 leading-relaxed font-medium">
                We built Boptone because we were frustrated with how complicated and unfair the music industry is for independent artists.
              </p>
            </div>
            <Card className="rounded-3xl border-4 border-orange-500 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-12">
                <p className="text-2xl text-gray-800 leading-relaxed font-bold">
                  We wanted to create a platform that's simple, fair, and puts artists in control.
                </p>
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl border-4 border-orange-200">
                  <p className="text-lg font-bold text-orange-600">That's why Boptone exists.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We're Building - 2 Cards */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-bold mb-8">
              What We're
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Building
              </span>
              <span className="text-black">.</span>
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed font-medium max-w-4xl mx-auto">
              A platform where every artist can succeed, no matter where they're starting from.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Indigo Card - New Artists */}
            <Card className="rounded-3xl border-4 border-indigo-500 shadow-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:scale-105 transition-transform">
              <CardContent className="p-12">
                <h3 className="text-4xl font-bold mb-6 text-indigo-600">For New Artists</h3>
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  Get help from our AI advisor, upload your music, and start earning money from day one.
                </p>
              </CardContent>
            </Card>

            {/* Purple Card - Established Artists */}
            <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105 transition-transform">
              <CardContent className="p-12">
                <h3 className="text-4xl font-bold mb-6 text-purple-600">For Established Artists</h3>
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  Advanced tools to grow your career, protect your music, and keep more of what you earn.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        <div className="container mx-auto">
          <Card className="rounded-3xl max-w-5xl mx-auto bg-white border-4 border-white shadow-2xl">
            <CardContent className="p-16 text-center">
              <h2 className="text-5xl lg:text-6xl font-bold mb-8">
                Join the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Revolution
                </span>
                <span className="text-black">.</span>
              </h2>
              <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                We're launching in 2026. Be one of the first to try Boptone and take control of your music career.
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Button size="lg" className="rounded-full gap-2 text-2xl px-12 py-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105" onClick={() => setLocation("/signup")}>
                  Get Early Access <ArrowRight className="h-7 w-7" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full text-2xl px-12 py-8 border-4 border-black hover:bg-black hover:text-white transition-all hover:scale-105 shadow-xl" onClick={() => setLocation("/contact")}>
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ToneyChatbot />
    </div>
  );
}
