import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Check, Music, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Signup() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"tier" | "profile">("tier");
  const [selectedTier, setSelectedTier] = useState<"free" | "pro" | "enterprise">("free");
  
  const createProfile = trpc.artistProfile.create.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const [profileData, setProfileData] = useState({
    stageName: "",
    genre: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // User is authenticated, show profile creation
      setStep("profile");
    }
  }, [authLoading, isAuthenticated, user]);

  const tiers = [
    {
      id: "free" as const,
      name: "Free",
      price: "$0",
      period: "/forever",
      platformFee: "12%",
      earningCap: "$1,000/month",
      description: "Build your foundation—collect fans, sell music, grow your audience",
      features: [
        "BAP streaming (90% artist share)",
        "Basic profile + 10 tracks",
        "1GB storage",
        "Basic analytics",
        "Tip jar (Kick In)",
        "E-commerce (3 products max)",
        "Toney AI (5 questions/month)",
        "Community support",
      ],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: "$49",
      period: "/month",
      platformFee: "5%",
      earningCap: "$10,000/month",
      description: "Unlimited uploads, third-party distribution, and powerful tools to scale your career",
      features: [
        "Everything in Free",
        "Unlimited tracks & storage",
        "Third-party distribution (Spotify, Apple Music, Tidal, etc.)",
        "Advanced analytics & fan data",
        "Smart links with source tracking",
        "Fan data ownership & export",
        "Unlimited e-commerce products",
        "Printful integration (print-on-demand)",
        "Toney AI unlimited",
        "Image generation (50/month)",
        "Songwriter splits & automated payouts",
        "3% Tone Dividend (annual cashback)",
        "Priority support (24-hour response)",
      ],
      popular: true,
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      price: "$149",
      period: "/month",
      platformFee: "2%",
      earningCap: "Unlimited",
      description: "Advanced features for teams, labels, and artists managing complex operations",
      features: [
        "Everything in Pro",
        "Unlimited earnings (no cap)",
        "2% platform fee (lowest in industry)",
        "Team accounts (5 seats)",
        "White-label embeds",
        "API access",
        "Advanced tour management",
        "IP protection tools",
        "Microloans (up to $50K)",
        "Healthcare benefits access",
        "Dedicated account manager",
        "1-hour support response",
        "Quarterly strategy sessions",
        "10% Tone Dividend (annual cashback)",
      ],
    },
  ];

  const handleTierSelection = (tier: "free" | "pro" | "enterprise") => {
    setSelectedTier(tier);
    if (tier === "enterprise") {
      // Redirect to contact sales
      window.location.href = "mailto:sales@boptone.com?subject=Enterprise Inquiry";
      return;
    }
    // Redirect to OAuth login
    window.location.href = getLoginUrl();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile.mutate({
      stageName: profileData.stageName,
      genres: profileData.genre ? [profileData.genre] : [],
      bio: profileData.bio,
      location: profileData.location,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "tier") {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you're ready. All plans include BAP streaming with 90% artist revenue share.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative border-2 ${
                  tier.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-gray-200"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {tier.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {tier.price}
                    </span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-4 text-base text-gray-600">
                    {tier.description}
                  </CardDescription>
                  
                  {/* Platform Fee Badge */}
                  <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Platform Fee:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {tier.platformFee}
                    </span>
                  </div>
                  
                  {/* Earning Cap */}
                  <div className="mt-2 text-sm text-gray-600">
                    Earning cap: <span className="font-semibold">{tier.earningCap}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    onClick={() => handleTierSelection(tier.id)}
                    className="w-full mb-6"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.id === "enterprise" ? "Contact Sales" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ / Additional Info */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              All plans include
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Data Ownership</h4>
                <p className="text-sm text-gray-600">
                  You own your fan data, master recordings, and publishing rights. Export anytime.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">90% Revenue Share</h4>
                <p className="text-sm text-gray-600">
                  Keep 90% of BAP streaming revenue before platform fees. No hidden costs.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">No Contracts</h4>
                <p className="text-sm text-gray-600">
                  Cancel anytime. No long-term commitments. Your music, your terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Creation Step
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Create Your Artist Profile
          </CardTitle>
          <CardDescription className="text-gray-600">
            Complete your profile to start using Boptone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <Label htmlFor="stageName" className="text-gray-900 font-medium">
                Stage Name *
              </Label>
              <Input
                id="stageName"
                value={profileData.stageName}
                onChange={(e) =>
                  setProfileData({ ...profileData, stageName: e.target.value })
                }
                placeholder="Your artist name"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="genre" className="text-gray-900 font-medium">
                Primary Genre
              </Label>
              <Select
                value={profileData.genre}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, genre: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hip-hop">Hip Hop</SelectItem>
                  <SelectItem value="r&b">R&B</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="indie">Indie</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-900 font-medium">
                Bio
              </Label>
              <textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                placeholder="Tell fans about yourself..."
                rows={4}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-gray-900 font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                placeholder="City, State/Country"
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Create Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
