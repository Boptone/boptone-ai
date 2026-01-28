import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import {
  Music,
  User,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

const GENRES = [
  "Hip-Hop", "Pop", "Rock", "Electronic", "R&B", "Jazz",
  "Country", "Latin", "Indie", "Alternative", "Soul", "Reggae"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    genres: [] as string[],
    instagram: "",
    twitter: "",
    youtube: "",
  });

  const updateProfile = trpc.artistProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      if (step === 3) {
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && !formData.displayName) {
      toast.error("Please enter your artist name");
      return;
    }
    if (step === 2 && formData.genres.length === 0) {
      toast.error("Please select at least one genre");
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save profile
      updateProfile.mutate({
        stageName: formData.displayName,
        bio: formData.bio || undefined,
        genres: formData.genres,
        socialLinks: {
          instagram: formData.instagram || undefined,
          twitter: formData.twitter || undefined,
          youtube: formData.youtube || undefined,
        },
        onboardingCompleted: true,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Boptone</h1>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Welcome to Boptone
            </div>
            <CardTitle className="text-3xl">Set Up Your Artist Profile</CardTitle>
            <CardDescription>
              Let's get you started in just a few steps
            </CardDescription>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Tell us about yourself</h3>
                  <p className="text-sm text-muted-foreground">Basic profile information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Artist Name *</Label>
                  <Input
                    id="displayName"
                    placeholder="Your stage name or band name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell fans about your music and journey..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear on your public profile
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Genre Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Choose your genres</h3>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={formData.genres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-3 text-sm hover:bg-primary/10 transition-colors"
                    onClick={() => toggleGenre(genre)}
                  >
                    {formData.genres.includes(genre) && (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Selected: {formData.genres.length} genre{formData.genres.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Step 3: Social Links */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect your socials</h3>
                  <p className="text-sm text-muted-foreground">Optional - you can add these later</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="username"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="username"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    placeholder="Channel URL"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-center">
                  <strong>Next step:</strong> Upload your first track and start building your audience on BAP!
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={updateProfile.isPending}
            >
              {step === totalSteps ? (
                <>
                  {updateProfile.isPending ? "Saving..." : "Complete Setup"}
                  <Check className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="link"
              className="text-muted-foreground"
              onClick={() => setLocation("/dashboard")}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
