import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * PublicLanding - World-Facing Homepage
 * 
 * This is the public marketing page that introduces Boptone to the world.
 * Goal: Visitors understand what Boptone is within 20 seconds.
 * 
 * Design System: BAP Protocol (Softened Brutalist)
 * - Black borders with 4px 4px 0 0 black shadow
 * - Rounded-lg corners
 * - Clean, bold typography
 * - No color borders (user hates them)
 * - Pill-shaped buttons
 */

export default function PublicLanding() {
  const experiences = [
    {
      title: "For Artists",
      subtitle: "Your Career Command Center",
      description: "Distribution, analytics, financial tools, and AI-powered guidance. Everything you need to build a sustainable music career in one place.",
      cta: "Explore Platform",
      link: "/artists"
    },
    {
      title: "BopAudio",
      subtitle: "Streaming. Reimagined.",
      description: "Discover music directly from artists. Pay-per-stream model that puts artists first. No subscriptions, no algorithms—just music.",
      cta: "Listen Now",
      link: "/music"
    },
    {
      title: "BopShop",
      subtitle: "Where Artists Sell Direct",
      description: "Buy authentic merchandise, digital downloads, and experiences directly from your favorite artists. No middlemen, just creators and fans.",
      cta: "Shop Now",
      link: "/shop"
    }
  ];

  const stats = [
    { number: "$2.5M+", label: "Paid to Artists" },
    { number: "50K+", label: "Tracks Distributed" },
    { number: "10K+", label: "Active Artists" },
    { number: "180+", label: "Countries" }
  ];

  const values = [
    {
      title: "Own Your Work",
      description: "Keep your masters, control your data, and build your career on your terms."
    },
    {
      title: "Direct Connection",
      description: "Artists and fans connect directly—no gatekeepers, no algorithms deciding what you hear."
    },
    {
      title: "Transparent Platform",
      description: "See exactly where your money goes. Every transaction, every stream, fully transparent."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 md:py-40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-7xl md:text-9xl font-extrabold mb-8 leading-none">
              Find Your Tone.
            </h1>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/artists">
                <Button 
                  size="lg" 
                  className="rounded-full bg-[#008B8B] text-white hover:bg-[#006666] text-xl h-16 px-10 border border-black"
                  style={{
                    boxShadow: '4px 4px 0 0 black'
                  }}
                >
                  For Artists
                </Button>
              </Link>
              <Link href="/music">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full border border-black text-black hover:bg-gray-50 text-xl h-16 px-10"
                  style={{
                    boxShadow: '4px 4px 0 0 black'
                  }}
                >
                  Listen Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full border border-black text-black hover:bg-gray-50 text-xl h-16 px-10"
                  style={{
                    boxShadow: '4px 4px 0 0 black'
                  }}
                >
                  Shop Merch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.number}</div>
                <div className="text-base md:text-lg text-gray-600 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Experiences Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Three Experiences. One Platform.
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed">
              Whether you're creating, listening, or shopping—Boptone brings it all together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {experiences.map((exp, index) => (
              <div 
                key={index}
                className="border border-black rounded-lg p-10 bg-white hover:bg-gray-50 transition-colors"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
              >
                <h3 className="text-4xl font-bold mb-3">{exp.title}</h3>
                <p className="text-xl font-semibold text-gray-600 mb-6">{exp.subtitle}</p>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {exp.description}
                </p>
                <Link href={exp.link}>
                  <Button 
                    size="lg"
                    className="w-full rounded-full bg-black text-white hover:bg-gray-800 text-lg h-14"
                  >
                    {exp.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Built for Artists. Made for Fans.
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed">
              Boptone is the ecosystem where music lives. Artists own their work, 
              fans discover authentic content, and everyone benefits from a transparent, 
              decentralized platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div 
                key={index}
                className="border border-black rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
              >
                <h4 className="text-2xl font-bold mb-4">{value.title}</h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Ready to Find Your Tone?
            </h2>
            <p className="text-2xl text-gray-700 mb-12 leading-relaxed">
              Join thousands of artists building their careers on Boptone.
            </p>
            <Link href="/artists">
              <Button 
                size="lg"
                className="rounded-full bg-[#008B8B] text-white hover:bg-[#006666] text-xl h-16 px-12 border border-black"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
