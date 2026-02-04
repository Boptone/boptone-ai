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
                <div key={tier.id} className="relative">
                  {/* Square-Style Card */}
                  <div className="bg-white dark:bg-card border border-border rounded-2xl p-8 h-full flex flex-col shadow-sm">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-card-foreground">{tier.name}</h3>
                        {tier.popular && (
                          <span className="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs font-bold tracking-wide">
                            BEST VALUE
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed min-h-[60px]">{tier.description}</p>
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-border mb-6"></div>
                    
                    {/* Huge Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-bold text-card-foreground">
                          {tier.price}
                        </span>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <Button 
                      className="w-full mb-8"
                      variant={tier.id === "free" ? "outline" : "default"}
                      style={tier.id === "free" ? {
                        borderColor: '#4A90E2',
                        color: '#4A90E2',
                        padding: '14px 24px',
                        borderRadius: '999px',
                        fontWeight: 600,
                        fontSize: '15px'
                      } : {
                        backgroundColor: '#4A90E2',
                        color: 'white',
                        padding: '14px 24px',
                        borderRadius: '999px',
                        fontWeight: 600,
                        fontSize: '15px'
                      }}
                      onClick={() => handleTierSelection(tier.id)}
                    >
                      {tier.id === "enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    {/* What you get Section */}
                    <div className="flex-1">
                      <h4 className="text-sm font-bold mb-3 text-card-foreground">What you get</h4>
                      <div className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2.5">
                            <Check className="h-4 w-4 text-card-foreground flex-shrink-0" />
                            <span className="text-sm text-card-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
                <CardTitle className="text-3xl">Claim Your Profile</CardTitle>
                <CardDescription>
                  Tell us about yourself to claim your profile with Boptone
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
