import { useState, useRef } from "react";
import BoptoneExplainer from "@/components/BoptoneExplainer";
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

const GENRES = [
  "Hip-Hop", "Pop", "Rock", "Electronic", "R&B", "Jazz",
  "Country", "Latin", "Indie", "Alternative", "Soul", "Reggae"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [showExplainer, setShowExplainer] = useState(true);
  const [step, setStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      toast.success("Profile created successfully!");
      if (step === 3) {
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const uploadPhoto = trpc.artistProfile.uploadPhoto.useMutation();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Handle explainer completion
  const handleExplainerComplete = () => {
    setShowExplainer(false);
  };

  const handleExplainerSkip = () => {
    setShowExplainer(false);
  };

  // Show explainer first
  if (showExplainer) {
    return (
      <BoptoneExplainer
        mode="private"
        onComplete={handleExplainerComplete}
        onSkip={handleExplainerSkip}
      />
    );
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be smaller than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNext = async () => {
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
      // Upload photo first if provided
      let photoUrl: string | undefined;
      if (photoFile) {
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const result = await uploadPhoto.mutateAsync({
              fileName: photoFile.name,
              fileData: base64,
              mimeType: photoFile.type,
            });
            photoUrl = result.url;
            
            // Then save profile with photo URL
            updateProfile.mutate({
              stageName: formData.displayName,
              bio: formData.bio || undefined,
              genres: formData.genres,
              profilePhotoUrl: photoUrl,
              socialLinks: {
                instagram: formData.instagram || undefined,
                twitter: formData.twitter || undefined,
                youtube: formData.youtube || undefined,
              },
              onboardingCompleted: true,
            });
          };
          reader.readAsDataURL(photoFile);
        } catch (error) {
          toast.error("Failed to upload photo");
          return;
        }
      } else {
        // Save profile without photo
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
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center p-4">
      <Card className="rounded-lg border border-black w-full max-w-2xl bg-white shadow-sm hover:border-black transition-colors">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold">♪</span>
            <h1 className="text-2xl font-bold text-black">Boptone</h1>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-black text-black text-sm font-medium">
              <span className="font-bold">★</span>
              Create Your Tone
            </div>
            <CardTitle className="text-3xl text-black">Build Your Artist Profile</CardTitle>
            <CardDescription className="text-gray-600">
              Let's set up your presence on Boptone
            </CardDescription>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info + Photo */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-black rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-black flex items-center justify-center">
                  <span className="text-2xl font-bold">U</span>
                </div>
                <div>
                  <h3 className="font-semibold text-black">Tell us about yourself</h3>
                  <p className="text-sm text-gray-600">Basic profile information</p>
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profilePhoto ? (
                    <div className="relative">
                      <img
                        src={profilePhoto}
                        alt="Profile preview"
                        className="h-32 w-32 rounded-full object-cover border border-black"
                      />
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm font-bold">×</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 w-32 rounded-full border border-dashed border-black flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl font-bold text-gray-400 mb-1">+</span>
                      <span className="text-xs text-gray-600 font-medium">Add Photo</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Optional - Add a profile photo (max 5MB)
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-black font-medium">Artist Name *</Label>
                  <Input
                    id="displayName"
                    placeholder="Your stage name or band name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="rounded-lg border border-black hover:border-black transition-colors"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-black font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell fans about your music and journey..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-lg border border-black hover:border-black transition-colors"
                    rows={4}
                  />
                  <p className="text-xs text-gray-600">
                    This will appear on your public profile
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Genre Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-black rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-black flex items-center justify-center">
                  <span className="text-2xl font-bold">♪</span>
                </div>
                <div>
                  <h3 className="font-semibold text-black">Choose your genres</h3>
                  <p className="text-sm text-gray-600">Select all that apply</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={formData.genres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer justify-center py-3 text-sm rounded-lg transition-colors ${
                      formData.genres.includes(genre)
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-black border border-black hover:border-black"
                    }`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {formData.genres.includes(genre) && (
                      <span className="mr-1 font-bold">✓</span>
                    )}
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-gray-600 text-center">
                Selected: {formData.genres.length} genre{formData.genres.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Step 3: Social Links */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-black rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-black flex items-center justify-center">
                  <span className="text-2xl font-bold">↑</span>
                </div>
                <div>
                  <h3 className="font-semibold text-black">Connect your socials</h3>
                  <p className="text-sm text-gray-600">Optional - you can add these later</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2 text-black font-medium">
                    <span className="font-bold">IG</span>
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="username"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="rounded-lg border border-black hover:border-black transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2 text-black font-medium">
                    <span className="font-bold">X</span>
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="username"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="rounded-lg border border-black hover:border-black transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2 text-black font-medium">
                    <span className="font-bold">YT</span>
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    placeholder="Channel URL"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="rounded-lg border border-black hover:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg border border-black">
                <p className="text-sm text-center text-black">
                  <strong>Almost done!</strong> Your Tone is ready to launch.
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
              className="rounded-lg"
            >
              <span className="mr-2">←</span>
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={updateProfile.isPending || uploadPhoto.isPending}
              className="rounded-lg bg-black hover:bg-gray-800 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              {step === totalSteps ? (
                <>
                  {updateProfile.isPending || uploadPhoto.isPending ? "Creating..." : "Launch Your Tone"}
                  <span className="ml-2">✓</span>
                </>
              ) : (
                <>
                  Next
                  <span className="ml-2">→</span>
                </>
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setLocation("/dashboard")}
              className="rounded-lg text-gray-600"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
