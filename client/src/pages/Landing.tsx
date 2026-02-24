import { Link } from "wouter";
import { Music, ShoppingBag, BarChart3, Upload, DollarSign, TrendingUp, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Revolutionary Landing Page for Boptone Platform
 * 
 * Design Philosophy: Mind-blowing first impression for ALL visitors (artists, fans, competitors)
 * - Asymmetric grid layouts (not boring centered content)
 * - Massive 7xl/8xl typography with gradient text
 * - Thick 4px color-coded borders
 * - Gradient backgrounds on all interactive elements
 * - Hover scale effects for visual feedback
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Revolutionary Hero Section - Asymmetric Layout */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8">
            {/* Placeholder for Hero Headline - TBD */}
            <div className="border-4 border-dashed border-gray-300 rounded-3xl p-8 bg-gray-50">
              <p className="text-2xl text-gray-500 text-center">
                [Hero Headline - TBD]
              </p>
              <p className="text-sm text-gray-400 text-center mt-2">
                Placeholder for mind-blowing headline that speaks to artists, fans, and the world
              </p>
            </div>

            {/* Primary CTAs - Bold with Gradients */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-lg px-8 py-6 h-auto rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-teal-500"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  For Artists
                </Button>
              </Link>
              <Link href="/music">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-indigo-500"
                >
                  <Music className="mr-2 h-5 w-5" />
                  Listen Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg px-8 py-6 h-auto rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-orange-500"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Merch
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Social Proof Accent Card */}
          <div className="border-4 border-purple-500 rounded-3xl p-8 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-center">Platform Stats</h3>
            <div className="space-y-6">
              <div className="border-4 border-blue-500 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-lg font-bold text-gray-700">Artists</div>
              </div>
              <div className="border-4 border-green-500 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-5xl font-black mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">1M+</div>
                <div className="text-lg font-bold text-gray-700">Streams</div>
              </div>
              <div className="border-4 border-orange-500 rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">$5M+</div>
                <div className="text-lg font-bold text-gray-700">Paid to Artists</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Color-Coded Cards */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-center mb-16">
            How{" "}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Boptone
            </span>{" "}
            Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1: Artists Upload - Teal */}
            <div className="border-4 border-teal-500 rounded-3xl p-8 bg-gradient-to-br from-teal-50 to-cyan-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-black text-teal-600 mb-4 text-center">1</div>
              <h3 className="text-2xl font-bold mb-4 text-center">Artists Upload</h3>
              <p className="text-gray-700 text-center">
                Upload your music, artwork, and merch to your artist dashboard. 
                Set your prices, manage your catalog, and control your brand.
              </p>
            </div>

            {/* Step 2: Fans Discover - Indigo */}
            <div className="border-4 border-indigo-500 rounded-3xl p-8 bg-gradient-to-br from-indigo-50 to-purple-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-black text-indigo-600 mb-4 text-center">2</div>
              <h3 className="text-2xl font-bold mb-4 text-center">Fans Discover</h3>
              <p className="text-gray-700 text-center">
                Your music instantly appears on Boptone Music for millions of fans to discover, 
                stream, and add to playlists. No gatekeepers, no delays.
              </p>
            </div>

            {/* Step 3: You Earn - Green */}
            <div className="border-4 border-green-500 rounded-3xl p-8 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-black text-green-600 mb-4 text-center">3</div>
              <h3 className="text-2xl font-bold mb-4 text-center">You Earn</h3>
              <p className="text-gray-700 text-center">
                Get paid for every stream and every merch sale. Track your earnings in real-time. 
                Withdraw anytime. Keep 100% ownership of your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Experiences Section - Asymmetric Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-center mb-4">
            Three Experiences,{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Whether you're creating, listening, or shopping - Boptone delivers a world-class experience.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dashboard - Teal */}
            <Link href="/dashboard">
              <div className="border-4 border-teal-500 rounded-3xl p-8 bg-gradient-to-br from-teal-50 to-cyan-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Artist Dashboard
                </h3>
                <p className="text-gray-700 mb-6">
                  Your control center. Upload music, manage merch, track analytics, 
                  view earnings, and grow your fanbase.
                </p>
                <div className="flex items-center text-teal-600 font-bold text-lg">
                  Go to Dashboard 
                  <TrendingUp className="ml-2 h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Music - Indigo/Purple */}
            <Link href="/music">
              <div className="border-4 border-indigo-500 rounded-3xl p-8 bg-gradient-to-br from-indigo-50 to-purple-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Boptone Music
                </h3>
                <p className="text-gray-700 mb-6">
                  Discover new artists, stream unlimited music, create playlists, 
                  and follow your favorite creators.
                </p>
                <div className="flex items-center text-indigo-600 font-bold text-lg">
                  Start Listening 
                  <Zap className="ml-2 h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Shop - Orange */}
            <Link href="/shop">
              <div className="border-4 border-orange-500 rounded-3xl p-8 bg-gradient-to-br from-orange-50 to-red-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  BopShop
                </h3>
                <p className="text-gray-700 mb-6">
                  Shop exclusive artist merch, vinyl records, apparel, and limited editions. 
                  Support your favorite artists directly.
                </p>
                <div className="flex items-center text-orange-600 font-bold text-lg">
                  Browse Shop 
                  <Shield className="ml-2 h-5 w-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Artist CTA Section - Bold Gradient Background */}
      <section className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Ready to Take Control?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of artists building their empire on Boptone. 
            No middlemen, no gatekeepers, just you and your fans.
          </p>
          <Link href="/dashboard">
            <Button 
              size="lg" 
              className="bg-white text-teal-600 hover:bg-gray-100 text-xl px-12 py-8 h-auto rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl border-4 border-white font-black"
            >
              <TrendingUp className="mr-3 h-6 w-6" />
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Artist Dashboard</Link></li>
                <li><Link href="/music" className="text-gray-400 hover:text-white transition-colors">Boptone Music</Link></li>
                <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">BopShop</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="text-gray-400 hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2026 Boptone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
