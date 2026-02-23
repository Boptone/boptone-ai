import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Music,
  MapPin,
  Instagram,
  Twitter,
  Youtube,
  ExternalLink,
  Calendar,
  ShoppingBag,
  Mail,
  Loader2,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import { useBOPixel } from "@/hooks/useBOPixel";
import { ArtistMiniPlayer } from "@/components/ArtistMiniPlayer";

export default function ArtistProfile() {
  const { trackArtistView } = useBOPixel();
  const [, params] = useRoute("/@:username");
  const username = params?.username;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = (platform: string) => {
    const profileUrl = `${window.location.origin}/@${username}`;
    const text = `Check out ${profile?.stageName || username} on Boptone`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        setCopiedLink(true);
        toast.success("Profile link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2000);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const { data: profile, isLoading } = trpc.artistProfile.getByUsername.useQuery(
    { username: username || "" },
    { enabled: !!username }
  );
  
  // Track artist profile view (invisible to artist)
  useEffect(() => {
    if (profile) {
      trackArtistView(profile.id, profile.stageName || profile.username);
    }
  }, [profile, trackArtistView]);

  // Products and tours will be added in future iterations
  const products: any[] = [];
  const tours: any[] = [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="rounded-xl max-w-md">
          <CardContent className="p-8 text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The artist profile you're looking for doesn't exist.
            </p>
            <Button className="rounded-full" onClick={() => (window.location.href = "/")}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Apply custom theme colors from profile
  const themeColor = profile.themeColor || "#0066ff";
  const accentColor = profile.accentColor || "#00d4aa";
  const fontFamily = profile.fontFamily || "Inter";

  const upcomingTours = tours?.filter(
    (tour: any) => new Date(tour.startDate) > new Date()
  );

  // Generate SEO metadata
  const seoData = useMemo(() => ({
    title: `${profile.stageName} | Boptone`,
    description: profile.bio || `Listen to ${profile.stageName} on Boptone. ${profile.genre ? `${profile.genre} artist` : 'Independent artist'} ${profile.location ? `from ${profile.location}` : ''}.`,
    image: profile.avatarUrl || undefined,
    url: `${window.location.origin}/@${username}`,
    type: 'profile' as const,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      name: profile.stageName,
      description: profile.bio || undefined,
      image: profile.avatarUrl || undefined,
      genre: profile.genre || undefined,
      url: `${window.location.origin}/@${username}`,
      sameAs: [
        profile.instagramUrl,
        profile.twitterUrl,
        profile.youtubeUrl,
        profile.websiteUrl
      ].filter(Boolean)
    }
  }), [profile, username]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Artists', href: '/discover' },
    { label: profile.stageName }
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      style={{ fontFamily }}
    >
      <SEOHead {...seoData} />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {/* Hero Section */}
      <div
        className="relative h-64 md:h-80"
        style={{
          background: `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}40 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="rounded-xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl || undefined}
                      alt={profile.stageName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-background shadow-lg"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      <Music className="h-16 w-16" style={{ color: themeColor }} />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{profile.stageName}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.genres?.map((genre: string) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.bio && (
                    <p className="text-muted-foreground mb-6">{profile.bio}</p>
                  )}

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-3">
                    {profile.socialLinks?.instagram && (
                      <Button className="rounded-full" variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://instagram.com/${profile.socialLinks!.instagram}`,
                            "_blank"
                          )
                        }
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    )}
                    {profile.socialLinks?.twitter && (
                      <Button className="rounded-full" variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://twitter.com/${profile.socialLinks!.twitter}`,
                            "_blank"
                          )
                        }
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                    )}
                    {profile.socialLinks?.youtube && (
                      <Button className="rounded-full" variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(profile.socialLinks!.youtube!, "_blank")
                        }
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        YouTube
                      </Button>
                    )}
                    {profile.socialLinks?.website && (
                      <Button className="rounded-full" variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.socialLinks!.website!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="rounded-full" variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Profile
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleShare('twitter')}>
                          <Twitter className="h-4 w-4 mr-2" />
                          Share on Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('facebook')}>
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Share on Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('copy')}>
                          {copiedLink ? (
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Copy Profile Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BopAudio Mini-Player */}
          <div className="mb-8">
            <ArtistMiniPlayer artistId={profile.id} themeColor={themeColor} />
          </div>

          {/* Merchandise Section */}
          {products && products.length > 0 && (
            <Card className="rounded-xl mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" style={{ color: themeColor }} />
                  Merchandise
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 6).map((product: any) => (
                    <Card className="rounded-xl overflow-hidden hover:shadow-lg transition-shadow" key={product.id}>
                      <div className="aspect-square bg-muted relative">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1">{product.name}</h3>
                        <p className="text-2xl font-bold" style={{ color: themeColor }}>
                          ${product.price}
                        </p>
                        <Button variant="bap" className="rounded-full w-full mt-4" style={{ backgroundColor: themeColor }}>
                          Buy Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tour Dates Section */}
          {upcomingTours && upcomingTours.length > 0 && (
            <Card className="rounded-xl mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6" style={{ color: themeColor }} />
                  Upcoming Shows
                </h2>
                <div className="space-y-4">
                  {upcomingTours.slice(0, 5).map((tour: any) => (
                    <div
                      key={tour.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-lg">{tour.name}</h3>
                        <p className="text-muted-foreground">
                          {new Date(tour.startDate).toLocaleDateString()} -{" "}
                          {new Date(tour.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="bap" className="rounded-full" style={{ borderColor: themeColor, color: themeColor }}>
                        Get Tickets
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Section */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="h-6 w-6" style={{ color: themeColor }} />
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-6">
                Interested in booking, collaborations, or just want to say hi? Drop a message!
              </p>
              <Button variant="bap" className="rounded-full" size="lg" style={{ backgroundColor: themeColor }}>
                <Mail className="h-5 w-5 mr-2" />
                Contact {profile.stageName}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Powered by Boptone Footer */}
      <div className="border-t bg-card/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="/"
              className="font-semibold hover:underline"
              style={{ color: themeColor }}
            >
              Boptone
            </a>{" "}
            · Own Your Tone
          </p>
        </div>
      </div>

      <ToneyChatbot />
    </div>
  );
}
