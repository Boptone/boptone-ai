import { Button } from "@/components/ui/button";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import { useLocation } from "wouter";
import { Music, DollarSign, BarChart3, Users, Globe, Zap } from "lucide-react";
import { useState } from "react";

export default function BopAudio() {
  const [, setLocation] = useLocation();
  const [monthlyStreams, setMonthlyStreams] = useState(10000);

  // Revenue calculations with verified 2026 industry rates
  const baseRatePerStream = 0.004; // Industry average per stream
  
  // BopAudio: 90% to artist (no distributor fee)
  const boptoneArtistEarnings = monthlyStreams * baseRatePerStream * 0.9; // $0.0036 per stream
  
  // Spotify: 70% after distributor takes 30% cut
  const spotifyArtistEarnings = monthlyStreams * 0.004 * 0.7; // $0.0028 per stream
  
  // Apple Music: 70% after distributor takes 30% cut (Apple pays $0.01 base)
  const appleMusicArtistEarnings = monthlyStreams * 0.01 * 0.7; // $0.007 per stream

  const features = [
    {
      icon: Music,
      title: "Unlimited Uploads",
      description: "Upload unlimited tracks, albums, and singles. No storage limits, no upload fees. Your music, your way.",
      color: "cyan"
    },
    {
      icon: DollarSign,
      title: "90/10 Revenue Split",
      description: "Keep 90% of every dollar earned. No hidden fees, no middlemen. Direct payments to your account monthly.",
      color: "cyan"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track plays, listeners, and revenue in real-time. See exactly where your fans are and what they're listening to.",
      color: "cyan"
    },
    {
      icon: Users,
      title: "Direct Fan Connection",
      description: "Build direct relationships with your fans. No algorithms between you and your audience.",
      color: "cyan"
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Reach listeners worldwide instantly. Your music available everywhere, from day one.",
      color: "cyan"
    },
    {
      icon: Zap,
      title: "Instant Publishing",
      description: "Upload today, live tomorrow. No waiting weeks for approval. Your release schedule, your control.",
      color: "cyan"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - BAP Protocol with massive typography */}
      <div className="border-b-2 border-black bg-white">
        <div className="container py-24 md:py-32">
          <div className="max-w-5xl">
            <div className="inline-block px-4 py-2 bg-cyan-500 text-black font-bold text-sm rounded-full mb-8 border-2 border-black shadow-[4px_4px_0px_0px_black]">
              BOPAUDIO STREAMING PLATFORM
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-none mb-8">
              Keep 90%.
              <br />
              <span className="text-cyan-500">Own Your Tone.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-12 max-w-3xl">
              The streaming platform built for artists. Upload unlimited music, reach global audiences, and keep 90% of every dollar you earn. No middlemen, no hidden fees.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="rounded-lg text-lg px-10 py-7 bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all" 
                size="lg" 
                onClick={() => setLocation("/discover")}
              >
                Start Listening Now
              </Button>
              <Button 
                className="rounded-lg text-lg px-10 py-7 border-2 border-black hover:bg-gray-50 font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all" 
                size="lg" 
                variant="outline" 
                onClick={() => setLocation("/signup")}
              >
                Sign Up as Artist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - BAP Protocol */}
      <div className="bg-gray-50 border-b-2 border-black">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black]">
              <div className="text-5xl md:text-6xl font-bold mb-2 text-cyan-500">90%</div>
              <div className="text-lg font-bold text-gray-700">Artist Revenue Share</div>
            </div>
            <div className="text-center p-8 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black]">
              <div className="text-5xl md:text-6xl font-bold mb-2 text-cyan-500">∞</div>
              <div className="text-lg font-bold text-gray-700">Unlimited Uploads</div>
            </div>
            <div className="text-center p-8 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black]">
              <div className="text-5xl md:text-6xl font-bold mb-2 text-cyan-500">24h</div>
              <div className="text-lg font-bold text-gray-700">Go Live Fast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Calculator Section - BAP Protocol */}
      <div className="bg-white py-24 md:py-32 border-b-2 border-black">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Calculate Your
                <br />
                <span className="text-cyan-500">Real Earnings</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                See how much more you earn with BopAudio's 90/10 split compared to traditional streaming platforms.
              </p>
            </div>

            {/* Calculator Card */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black] p-8 md:p-12 mb-12">
              <div className="mb-8">
                <label className="block text-lg font-bold mb-4">Monthly Streams</label>
                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={monthlyStreams}
                  onChange={(e) => setMonthlyStreams(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              <div className="text-center mt-4">
                <span className="text-4xl font-bold text-cyan-500">
                  {monthlyStreams.toLocaleString()}
                </span>
                <span className="text-xl text-gray-600 ml-2">streams/month</span>
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">*Rates vary by country, subscription type, and platform revenue. Based on 2026 industry averages.</p>
              </div>
              </div>

              {/* Earnings Comparison */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* BopAudio */}
                <div className="bg-cyan-50 border-2 border-cyan-500 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgb(6,182,212)]">
                  <div className="text-sm font-bold text-cyan-700 mb-2">BOPAUDIO (90%)</div>
                  <div className="text-3xl font-bold text-cyan-600 mb-1">
                    ${boptoneArtistEarnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">You Keep</div>
                </div>

                {/* Spotify */}
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <div className="text-sm font-bold text-gray-700 mb-2">SPOTIFY (~70%)</div>
                  <div className="text-3xl font-bold text-gray-600 mb-1">
                    ${spotifyArtistEarnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">After Distributor</div>
                </div>

                {/* Apple Music */}
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <div className="text-sm font-bold text-gray-700 mb-2">APPLE MUSIC (~70%)</div>
                  <div className="text-3xl font-bold text-gray-600 mb-1">
                    ${appleMusicArtistEarnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">After Distributor</div>
                </div>
              </div>

              {/* Difference Highlight */}
              <div className="mt-8 p-6 bg-cyan-500 border-2 border-black rounded-lg text-center">
                <div className="text-sm font-bold text-black mb-2">YOU EARN MORE WITH BOPAUDIO</div>
                <div className="text-4xl font-bold text-black">
                  +${(boptoneArtistEarnings - Math.max(spotifyArtistEarnings, appleMusicArtistEarnings)).toFixed(2)}
                </div>
                <div className="text-sm text-black mt-2">extra per month vs competitors</div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                className="rounded-lg text-lg px-10 py-7 bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all" 
                size="lg" 
                onClick={() => setLocation("/signup")}
              >
                Start Earning 90% Today
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - BAP Protocol */}
      <div className="bg-gray-50 py-24 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Built For
              <br />
              <span className="text-cyan-500">Independent Artists</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Everything you need to distribute, monetize, and grow your music career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
                >
                  <div className="w-14 h-14 bg-cyan-500 border-2 border-black rounded-lg flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_black]">
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section - BAP Protocol */}
      <div className="bg-white py-24 md:py-32 border-t-2 border-black">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold mb-16 text-center">
              Three Simple Steps
            </h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-cyan-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_black]">
                  <span className="text-3xl font-bold text-black">1</span>
                </div>
                <div className="flex-1 bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_black]">
                  <h3 className="text-2xl font-bold mb-3">Upload Your Music</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Drag and drop your tracks, add artwork and metadata. Takes less than 5 minutes per release.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-cyan-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_black]">
                  <span className="text-3xl font-bold text-black">2</span>
                </div>
                <div className="flex-1 bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_black]">
                  <h3 className="text-2xl font-bold mb-3">Go Live in 24 Hours</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    We review and publish your music within 24 hours. Your fans can start streaming immediately.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-cyan-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_black]">
                  <span className="text-3xl font-bold text-black">3</span>
                </div>
                <div className="flex-1 bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_black]">
                  <h3 className="text-2xl font-bold mb-3">Get Paid Monthly</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Track your earnings in real-time. Receive 90% of your revenue via direct deposit every month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - BAP Protocol */}
      <div className="border-t-2 border-black bg-gray-50 py-24 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-5xl md:text-7xl font-bold leading-tight">
              Ready to Keep
              <br />
              <span className="text-cyan-500">90% of Your Earnings?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
              Join thousands of independent artists building sustainable careers on BopAudio.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button 
                className="rounded-lg text-lg px-12 py-7 bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all" 
                size="lg" 
                onClick={() => setLocation("/signup")}
              >
                Start Free Today
              </Button>
              <Button 
                className="rounded-lg text-lg px-12 py-7 border-2 border-black hover:bg-white font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all" 
                size="lg" 
                variant="outline" 
                onClick={() => setLocation("/pricing")}
              >
                View Pricing
              </Button>
            </div>
            
            {/* Trust signals - BAP Protocol style */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-10">
              <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_black]">
                <span className="text-cyan-500 font-bold text-xl">✓</span>
                <span className="font-bold text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_black]">
                <span className="text-cyan-500 font-bold text-xl">✓</span>
                <span className="font-bold text-sm">14-day Pro trial</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_black]">
                <span className="text-cyan-500 font-bold text-xl">✓</span>
                <span className="font-bold text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToneyChatbot />
    </div>
  );
}
