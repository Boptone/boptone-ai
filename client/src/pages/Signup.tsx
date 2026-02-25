import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
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
      id: "enterprise" as const,
      name: "Enterprise",
      price: "$149",
      period: "/month",
      platformFee: "10%",
      description: "Advanced features for teams, labels, and artists managing complex operations",
      features: [
        "Everything in Pro",
        "Keep 90% of all revenue",
        "Team accounts (10 seats)",
        "White-label embeds",
        "API access",
        "Advanced tour management",
        "IP protection tools",
        "Microloans (up to $50K)",
        "Healthcare benefits access",
        "Dedicated account manager",
        "1-hour support response",
        "Quarterly strategy sessions",
        "Early access to new features",
      ],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: "$49",
      period: "/month",
      platformFee: "10%",
      description: "Unlimited uploads, third-party distribution, and powerful tools to scale your career",
      features: [
        "Everything in Free",
        "Keep 90% of all revenue",
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
        "Team accounts (3 seats)",
        "Priority support (24-hour response)",
      ],
    },
    {
      id: "free" as const,
      name: "Free",
      price: "$0",
      period: "/forever",
      platformFee: "10%",
      description: "Build your foundation—collect fans, sell music, grow your audience",
      features: [
        "Keep 90% of all revenue",
        "Kick In tips: 100% to you",
        "BopAudio streaming platform",
        "Third-party distribution",
        "Basic profile + 10 tracks",
        "1GB storage",
        "Basic analytics",
        "E-commerce (3 products max)",
        "Toney AI (5 questions/month)",
        "Community support",
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (step === "tier") {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you're ready. All plans include BopAudio streaming with 90% artist revenue share.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier) => (
               <Card
                key={tier.id}
                className="relative border border-black p-8 flex flex-col hover:bg-gray-50 transition-colors bg-white rounded-lg"
                style={{
                  boxShadow: '4px 4px 0 0 black'
                }}
              >
                {/* Tier Name */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {tier.price === "$0" ? (
                    <div className="text-5xl font-bold">Free</div>
                  ) : (
                    <div className="text-5xl font-bold">
                      {tier.price}
                      <span className="text-2xl text-gray-600 font-normal">/mo</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-2">
                    Platform fee: {tier.platformFee} on BopAudio streams
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mb-6">
                  <Button
                    onClick={() => handleTierSelection(tier.id)}
                    className="w-full rounded-full bg-[#0cc0df] text-black hover:bg-[#0aabca] h-12 border border-black font-bold"
                    style={{
                      boxShadow: '4px 4px 0 0 black'
                    }}
                  >
                    {tier.id === "enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </div>

                {/* Features List */}
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-black font-bold mt-1">•</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* FAQ / Additional Info */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-4">
              All plans include
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-xl">
                <h4 className="font-bold text-black mb-2">Data Ownership</h4>
                <p className="text-sm text-gray-600">
                  You own your fan data, master recordings, and publishing rights. Export anytime.
                </p>
              </div>
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-xl">
                <h4 className="font-bold text-black mb-2">90% Revenue Share</h4>
                <p className="text-sm text-gray-600">
                  Keep 90% of BopAudio streaming revenue before platform fees. No hidden costs.
                </p>
              </div>
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-xl">
                <h4 className="font-bold text-black mb-2">No Contracts</h4>
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
      <Card 
        className="w-full max-w-2xl border border-black rounded-lg bg-white"
        style={{
          boxShadow: '4px 4px 0 0 black'
        }}
      >
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-black">
            Create Your Artist Profile
          </CardTitle>
          <CardDescription className="text-gray-600">
            Complete your profile to start using Boptone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <Label htmlFor="stageName" className="text-black font-medium">
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
                className="mt-2 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="genre" className="text-black font-medium">
                Primary Genre
              </Label>
              <Select
                value={profileData.genre}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, genre: value })
                }
              >
                <SelectTrigger className="mt-2 border border-gray-200 rounded-none">
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
              <Label htmlFor="bio" className="text-black font-medium">
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
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-black font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                placeholder="City, State/Country"
                className="mt-2 border border-gray-200 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-black hover:bg-gray-900 text-white shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none font-bold"
              size="lg"
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? "Creating Profile..." : "Create Profile →"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
