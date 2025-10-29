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
      description: "Perfect for emerging artists",
      features: [
        "Basic artist profile",
        "Revenue tracking (up to $1K/month)",
        "AI career advisor (10 questions/month)",
        "Analytics dashboard",
        "Community support",
      ],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: "$29/mo",
      description: "For growing independent artists",
      features: [
        "Everything in Free",
        "Unlimited revenue tracking",
        "Unlimited AI advisor",
        "Direct-to-fan store",
        "IP protection",
        "Healthcare enrollment",
        "Tour management",
        "Priority support",
      ],
      popular: true,
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      price: "Custom",
      description: "For labels & management",
      features: [
        "Everything in Pro",
        "Multi-artist management",
        "White-label platform",
        "Custom integrations",
        "Dedicated account manager",
        "API access",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Boptone</h1>
                <p className="text-xs text-muted-foreground">Own Your Tone</p>
              </div>
            </div>
            <Button variant="ghost" asChild>
              <a href={getLoginUrl()}>Already have an account?</a>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {step === "tier" ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl md:text-5xl font-bold">Choose Your Plan</h1>
              <p className="text-xl text-muted-foreground">
                Start free, upgrade anytime. No credit card required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`relative ${tier.popular ? "border-primary shadow-xl scale-105" : ""}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">{tier.price}</span>
                    </div>
                    <CardDescription className="mt-2">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3 min-h-[280px]">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => handleTierSelection(tier.id)}
                    >
                      {tier.id === "enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12 space-y-4">
              <p className="text-sm text-muted-foreground">
                All plans include 14-day Pro trial • Cancel anytime • No credit card required
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
                <CardDescription>
                  Tell us about yourself to get started with Boptone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="stageName">Stage Name *</Label>
                    <Input
                      id="stageName"
                      placeholder="Your artist name"
                      value={profileData.stageName}
                      onChange={(e) => setProfileData({ ...profileData, stageName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Primary Genre *</Label>
                    <Select
                      value={profileData.genre}
                      onValueChange={(value) => setProfileData({ ...profileData, genre: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                        <SelectItem value="r&b">R&B</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="indie">Indie</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Tell us about your music and career..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Selected Plan: {selectedTier === "free" ? "Free" : "Pro (14-day trial)"}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTier === "free" 
                        ? "You can upgrade to Pro anytime from your dashboard."
                        : "Your 14-day Pro trial starts today. No credit card required."}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={createProfile.isPending}
                  >
                    {createProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
