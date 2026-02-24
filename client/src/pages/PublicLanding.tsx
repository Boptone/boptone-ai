import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * PublicLanding - World-Facing Homepage
 * 
 * This is the public marketing page that introduces Boptone to the world.
 * Goal: Visitors understand what Boptone is within 20 seconds.
 * 
 * Three core experiences:
 * 1. Artist Platform - Tools for artists to manage their career
 * 2. BopAudio - Decentralized music streaming
 * 3. BopShop - Direct-to-fan merchandise marketplace
 */

export default function PublicLanding() {
  const experiences = [
    {
      title: "For Artists",
      subtitle: "Your Career Command Center",
      description: "Distribution, analytics, financial tools, and AI-powered guidance. Everything you need to build a sustainable music career in one place.",
      cta: "Explore Platform",
      link: "/artists",
      borderColor: "border-teal-500",
      hoverBorder: "hover:border-teal-600",
      shadowColor: "shadow-[4px_4px_0px_#14b8a6]"
    },
    {
      title: "BopAudio",
      subtitle: "Streaming. Reimagined.",
      description: "Discover music directly from artists. Pay-per-stream model that puts artists first. No subscriptions, no algorithms—just music.",
      cta: "Listen Now",
      link: "/music",
      borderColor: "border-purple-500",
      hoverBorder: "hover:border-purple-600",
      shadowColor: "shadow-[4px_4px_0px_#a855f7]"
    },
    {
      title: "BopShop",
      subtitle: "Where Artists Sell Direct",
      description: "Buy authentic merchandise, digital downloads, and experiences directly from your favorite artists. No middlemen, just creators and fans.",
      cta: "Shop Now",
      link: "/shop",
      borderColor: "border-orange-500",
      hoverBorder: "hover:border-orange-600",
      shadowColor: "shadow-[4px_4px_0px_#f97316]"
    }
  ];

  const stats = [
    { number: "$2.5M+", label: "Paid to Artists" },
    { number: "50K+", label: "Tracks Distributed" },
    { number: "10K+", label: "Active Artists" },
    { number: "180+", label: "Countries" }
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
            <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              The platform where artists create, distribute, and sell—all in one place. 
              Built for the next generation of music.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/artists">
                <Button 
                  size="lg" 
                  className="rounded-full bg-black text-white hover:bg-gray-800 text-xl h-16 px-10"
                  style={{
                    boxShadow: '4px 4px 0px #81e6fe'
                  }}
                >
                  For Artists
                </Button>
              </Link>
              <Link href="/music">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full border-2 border-black text-black hover:bg-gray-50 text-xl h-16 px-10"
                >
                  Listen Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full border-2 border-black text-black hover:bg-gray-50 text-xl h-16 px-10"
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
                className={`border-4 ${exp.borderColor} rounded-xl p-10 bg-white ${exp.hoverBorder} transition-all hover:scale-105 ${exp.shadowColor}`}
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
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Built for Artists. Made for Fans.
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed mb-12">
              Boptone is the ecosystem where music lives. Artists own their work, 
              fans discover authentic content, and everyone benefits from a transparent, 
              decentralized platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
                <h4 className="text-2xl font-bold mb-4">Own Your Work</h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Keep your masters, control your data, and build your career on your terms.
                </p>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
                <h4 className="text-2xl font-bold mb-4">Direct Connection</h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Artists and fans connect directly—no gatekeepers, no algorithms deciding what you hear.
                </p>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
                <h4 className="text-2xl font-bold mb-4">Transparent Platform</h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  See exactly where your money goes. Every transaction, every stream, fully transparent.
                </p>
              </div>
            </div>
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
                className="rounded-full bg-black text-white hover:bg-gray-800 text-xl h-16 px-12"
                style={{
                  boxShadow: '4px 4px 0px #81e6fe'
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
