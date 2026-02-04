import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Twitter, Youtube, Music, ShoppingBag, Calendar, Mail } from "lucide-react";
import { ToneyChatbot } from "@/components/ToneyChatbot";

/**
 * Demo Artist Profile Page
 * Showcases customization options with a sample artist
 */
export default function DemoArtistProfile() {
  // Sample artist data with custom theme
  const artist = {
    stageName: "Luna Rivers",
    bio: "Independent artist blending R&B, soul, and electronic music. Based in Los Angeles, creating music that moves the heart and body.",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop",
    instagramUrl: "https://instagram.com/lunarivers",
    twitterUrl: "https://twitter.com/lunarivers",
    youtubeUrl: "https://youtube.com/lunarivers",
    spotifyArtistId: "3TVXtAsR1Inumwj472S9r4", // Drake as example
    themeColor: "#9333ea", // Purple
    accentColor: "#ec4899", // Pink
    fontFamily: "Inter",
    layoutStyle: "grid" as const,
  };

  const products = [
    {
      id: 1,
      name: "Midnight Dreams Vinyl",
      price: 2999,
      imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Tour Hoodie",
      price: 4999,
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Digital Album + Stems",
      price: 1499,
      imageUrl: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop",
    },
  ];

  const tourDates = [
    { date: "Nov 15, 2025", venue: "The Roxy Theatre", city: "Los Angeles, CA" },
    { date: "Nov 22, 2025", venue: "The Fillmore", city: "San Francisco, CA" },
    { date: "Dec 1, 2025", venue: "Brooklyn Steel", city: "Brooklyn, NY" },
  ];

  return (
    <>
      <div className="min-h-screen bg-background" style={{ fontFamily: artist.fontFamily }}>
        {/* Cover Image */}
        <div 
          className="h-64 md:h-96 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `url(${artist.coverImageUrl})`,
            backgroundColor: artist.themeColor 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Profile Header */}
        <div className="container max-w-6xl -mt-20 relative z-10 px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
            <img
              src={artist.profileImageUrl}
              alt={artist.stageName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background object-cover shadow-xl"
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: artist.themeColor }}>
                {artist.stageName}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {artist.bio}
              </p>
              
              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                {artist.instagramUrl && (
                  <a href={artist.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full" variant="outline" size="icon" style={{ borderColor: artist.accentColor }}>
                      <Instagram className="h-5 w-5" style={{ color: artist.accentColor }} />
                    </Button>
                  </a>
                )}
                {artist.twitterUrl && (
                  <a href={artist.twitterUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full" variant="outline" size="icon" style={{ borderColor: artist.accentColor }}>
                      <Twitter className="h-5 w-5" style={{ color: artist.accentColor }} />
                    </Button>
                  </a>
                )}
                {artist.youtubeUrl && (
                  <a href={artist.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full" variant="outline" size="icon" style={{ borderColor: artist.accentColor }}>
                      <Youtube className="h-5 w-5" style={{ color: artist.accentColor }} />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className={`grid gap-8 mb-12 ${
            artist.layoutStyle === "grid" 
              ? "md:grid-cols-2" 
              : artist.layoutStyle === "minimal"
              ? "max-w-3xl mx-auto"
              : ""
          }`}>
            {/* Featured Music */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: artist.themeColor }}>
                  <Music className="h-6 w-6" />
                  Featured Music
                </h2>
                {artist.spotifyArtistId && (
                  <iframe
                    src={`https://open.spotify.com/embed/artist/${artist.spotifyArtistId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="380"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-lg"
                  />
                )}
              </CardContent>
            </Card>

            {/* Merchandise */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: artist.themeColor }}>
                  <ShoppingBag className="h-6 w-6" />
                  Merchandise
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-sm font-bold" style={{ color: artist.accentColor }}>
                        ${(product.price / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <Button className="rounded-full w-full mt-4" style={{ backgroundColor: artist.themeColor }}>
                  View All Products
                </Button>
              </CardContent>
            </Card>

            {/* Tour Dates */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: artist.themeColor }}>
                  <Calendar className="h-6 w-6" />
                  Upcoming Shows
                </h2>
                <div className="space-y-4">
                  {tourDates.map((show, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{show.venue}</p>
                        <p className="text-sm text-muted-foreground">{show.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: artist.accentColor }}>
                          {show.date}
                        </p>
                        <Button size="sm" variant="outline" className="rounded-full mt-1">
                          Tickets
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: artist.themeColor }}>
                  <Mail className="h-6 w-6" />
                  Get in Touch
                </h2>
                <p className="text-muted-foreground mb-4">
                  Interested in booking or collaboration? Send me a message.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background resize-none"
                  />
                  <Button className="rounded-full w-full" style={{ backgroundColor: artist.themeColor }}>
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Info Banner */}
          <Card className="rounded-xl mb-8 border-2" style={{ borderColor: artist.accentColor }}>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2" style={{ color: artist.themeColor }}>
                🎨 Profile Customization Demo
              </h3>
              <p className="text-muted-foreground mb-4">
                This is a sample artist profile showing customization options. Artists can personalize:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Theme Color:</strong> <span style={{ color: artist.themeColor }}>{artist.themeColor}</span></p>
                  <p><strong>Accent Color:</strong> <span style={{ color: artist.accentColor }}>{artist.accentColor}</span></p>
                </div>
                <div>
                  <p><strong>Font:</strong> {artist.fontFamily}</p>
                  <p><strong>Layout:</strong> {artist.layoutStyle}</p>
                </div>
              </div>
              <Button className="rounded-full mt-4" 
                variant="outline"
                onClick={() => window.location.href = "/profile-settings"}
              >
                Customize Your Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ToneyChatbot />
    </>
  );
}
