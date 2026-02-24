import { Link } from "wouter";
import { Music, ShoppingBag, BarChart3, Upload, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";

/**
 * Unified Landing Page for Boptone Platform
 * 
 * Purpose: Serve as the central hub that directs users to three core experiences:
 * - /dashboard (Artist Control Center)
 * - /music (Streaming Platform)
 * - /shop (Merch Marketplace)
 * 
 * Design Philosophy: World-class, enterprise-grade UX that rivals Amazon, Spotify, and Etsy combined.
 * Clean, brutalist aesthetic with clear CTAs and powerful messaging.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={APP_LOGO} alt="Boptone" className="h-16 md:h-24" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            The All-in-One Platform for Artists
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Upload your music. Reach millions of fans. Sell your merch. Keep 100% ownership.
            Everything you need to build your empire, in one place.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-[#008B8B] hover:bg-[#006666] text-white text-lg px-8 py-6 h-auto"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                For Artists
              </Button>
            </Link>
            <Link href="/music">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-black text-black hover:bg-black hover:text-white text-lg px-8 py-6 h-auto"
              >
                <Music className="mr-2 h-5 w-5" />
                Listen Now
              </Button>
            </Link>
            <Link href="/shop">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-black text-black hover:bg-black hover:text-white text-lg px-8 py-6 h-auto"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Merch
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">10K+</div>
              <div className="text-gray-600">Artists</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">1M+</div>
              <div className="text-gray-600">Streams</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">$5M+</div>
              <div className="text-gray-600">Paid to Artists</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            How Boptone Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1: Artists Upload */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#008B8B] rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Artists Upload</h3>
              <p className="text-gray-600">
                Upload your music, artwork, and merch to your artist dashboard. 
                Set your prices, manage your catalog, and control your brand.
              </p>
            </div>

            {/* Step 2: Fans Discover */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#008B8B] rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Fans Discover</h3>
              <p className="text-gray-600">
                Your music instantly appears on Boptone Music for millions of fans to discover, 
                stream, and add to playlists. No gatekeepers, no delays.
              </p>
            </div>

            {/* Step 3: You Earn */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#008B8B] rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. You Earn</h3>
              <p className="text-gray-600">
                Get paid for every stream and every merch sale. Track your earnings in real-time. 
                Withdraw anytime. Keep 100% ownership of your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Experiences Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Three Experiences, One Platform
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dashboard */}
            <Link href="/dashboard">
              <div className="border-2 border-black p-8 hover:bg-gray-50 transition-colors cursor-pointer h-full">
                <BarChart3 className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Artist Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Your control center. Upload music, manage merch, track analytics, 
                  view earnings, and grow your fanbase.
                </p>
                <div className="text-[#008B8B] font-bold">Go to Dashboard →</div>
              </div>
            </Link>

            {/* Music */}
            <Link href="/music">
              <div className="border-2 border-black p-8 hover:bg-gray-50 transition-colors cursor-pointer h-full">
                <Music className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Boptone Music</h3>
                <p className="text-gray-600 mb-6">
                  Discover new artists, stream unlimited music, create playlists, 
                  and follow your favorite creators.
                </p>
                <div className="text-[#008B8B] font-bold">Start Listening →</div>
              </div>
            </Link>

            {/* Shop */}
            <Link href="/shop">
              <div className="border-2 border-black p-8 hover:bg-gray-50 transition-colors cursor-pointer h-full">
                <ShoppingBag className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">BopShop</h3>
                <p className="text-gray-600 mb-6">
                  Shop exclusive artist merch, vinyl records, apparel, and limited editions. 
                  Support your favorite artists directly.
                </p>
                <div className="text-[#008B8B] font-bold">Browse Shop →</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Artist CTA Section */}
      <section className="bg-[#008B8B] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Take Control of Your Music Career?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of artists who are building their empire on Boptone. 
            No middlemen, no gatekeepers, just you and your fans.
          </p>
          <Link href="/dashboard">
            <Button 
              size="lg" 
              className="bg-white text-[#008B8B] hover:bg-gray-100 text-lg px-8 py-6 h-auto"
            >
              <Users className="mr-2 h-5 w-5" />
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
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Artist Dashboard</Link></li>
                <li><Link href="/music" className="text-gray-400 hover:text-white">Boptone Music</Link></li>
                <li><Link href="/shop" className="text-gray-400 hover:text-white">BopShop</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link href="/press" className="text-gray-400 hover:text-white">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookies</Link></li>
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
