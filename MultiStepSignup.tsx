import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Mail, ArrowRight, ArrowLeft, Check, Upload } from "lucide-react";

type SignupStep = 1 | 2 | 3;

interface SignupData {
  // Step 1: Account
  email: string;
  verificationCode: string;
  
  // Step 2: Profile
  name: string;
  stageName: string;
  bio: string;
  profilePicture?: File;
  
  // Step 3: Preferences
  tier: "free" | "pro" | "enterprise";
  genres: string[];
  distributionPlatforms: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function MultiStepSignup() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    verificationCode: "",
    name: "",
    stageName: "",
    bio: "",
    tier: "free",
    genres: [],
    distributionPlatforms: [],
    emailNotifications: true,
    smsNotifications: false,
  });

  // tRPC mutations
  const sendEmailCode = trpc.auth.sendEmailVerification.useMutation();
  const verifyEmailCode = trpc.auth.verifyEmailCode.useMutation();
  const createProfile = trpc.artistProfile.create.useMutation();

  // Validation functions
  const validateStep1 = (): boolean => {
    if (!signupData.email) {
      toast.error("Email address is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (isVerificationSent && !signupData.verificationCode) {
      toast.error("Verification code is required");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!signupData.name) {
      toast.error("Name is required");
      return false;
    }
    if (!signupData.stageName) {
      toast.error("Artist/Stage name is required");
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (signupData.genres.length === 0) {
      toast.error("Please select at least one genre");
      return false;
    }
    return true;
  };

  // Step handlers
  const handleSendVerificationCode = async () => {
    if (!signupData.email) {
      toast.error("Email address is required");
      return;
    }
    
    setIsLoading(true);
    try {
      await sendEmailCode.mutateAsync({ email: signupData.email });
      setIsVerificationSent(true);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      
      if (!isVerificationSent) {
        await handleSendVerificationCode();
        return;
      }
      
      // Verify email code
      setIsLoading(true);
      try {
        await verifyEmailCode.mutateAsync({
          email: signupData.email,
          code: signupData.verificationCode,
        });
        setCurrentStep(2);
        toast.success("Email verified successfully!");
      } catch (error: any) {
        toast.error(error.message || "Invalid verification code");
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as SignupStep);
    }
  };

  const handleCompleteSignup = async () => {
    if (!validateStep3()) return;
    
    setIsLoading(true);
    try {
      await createProfile.mutateAsync({
        stageName: signupData.stageName,
        genre: signupData.genres[0], // Primary genre
        bio: signupData.bio,
        location: "", // Optional
      });
      
      toast.success("Welcome to Boptone! 🎉");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete signup");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignupData = (field: keyof SignupData, value: any) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre: string) => {
    setSignupData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const togglePlatform = (platform: string) => {
    setSignupData(prev => ({
      ...prev,
      distributionPlatforms: prev.distributionPlatforms.includes(platform)
        ? prev.distributionPlatforms.filter(p => p !== platform)
        : [...prev.distributionPlatforms, platform],
    }));
  };

  // Progress indicator
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                step < currentStep
                  ? "bg-black border-black text-white"
                  : step === currentStep
                  ? "bg-white border-black text-black"
                  : "bg-gray-100 border-gray-300 text-gray-400"
              }`}
            >
              {step < currentStep ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all ${
                  step < currentStep ? "bg-black" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm">
        <span className={currentStep === 1 ? "font-semibold" : "text-gray-500"}>Account</span>
        <span className={currentStep === 2 ? "font-semibold" : "text-gray-500"}>Profile</span>
        <span className={currentStep === 3 ? "font-semibold" : "text-gray-500"}>Preferences</span>
      </div>
    </div>
  );

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Join {APP_TITLE}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Create your account to get started"}
            {currentStep === 2 && "Tell us about yourself"}
            {currentStep === 3 && "Customize your experience"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressIndicator />

          {/* Step 1: Account */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="artist@example.com"
                  value={signupData.email}
                  onChange={(e) => updateSignupData("email", e.target.value)}
                  disabled={isVerificationSent}
                />
              </div>

              {isVerificationSent && (
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={signupData.verificationCode}
                    onChange={(e) => updateSignupData("verificationCode", e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Check your email for the verification code
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setLocation(getLoginUrl())}
                >
                  Already have an account? Sign in
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isVerificationSent ? "Verify & Continue" : "Send Code"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={(e) => updateSignupData("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stageName">Artist/Stage Name</Label>
                <Input
                  id="stageName"
                  type="text"
                  placeholder="DJ Awesome"
                  value={signupData.stageName}
                  onChange={(e) => updateSignupData("stageName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your music journey..."
                  value={signupData.bio}
                  onChange={(e) => updateSignupData("bio", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Your Genres</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Hip-Hop", "R&B", "Pop", "Rock", "Electronic", "Jazz", "Country", "Latin", "Indie"].map((genre) => (
                    <Button
                      key={genre}
                      variant={signupData.genres.includes(genre) ? "default" : "outline"}
                      onClick={() => toggleGenre(genre)}
                      className="justify-start"
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Choose Your Plan</Label>
                <Select
                  value={signupData.tier}
                  onValueChange={(value) => updateSignupData("tier", value as "free" | "pro" | "enterprise")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free - 15% platform fee</SelectItem>
                    <SelectItem value="pro">Pro - $49/month, 12% platform fee</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $149/month, 10% platform fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Notification Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailNotif"
                      checked={signupData.emailNotifications}
                      onCheckedChange={(checked) => updateSignupData("emailNotifications", checked)}
                    />
                    <Label htmlFor="emailNotif" className="font-normal cursor-pointer">
                      Email notifications (releases, earnings, updates)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsNotif"
                      checked={signupData.smsNotifications}
                      onCheckedChange={(checked) => updateSignupData("smsNotifications", checked)}
                    />
                    <Label htmlFor="smsNotif" className="font-normal cursor-pointer">
                      SMS notifications (urgent alerts only)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleCompleteSignup}
                  disabled={isLoading}
                  className="gap-2 bg-black text-white hover:bg-gray-800"
                >
                  <Check className="w-4 h-4" />
                  Complete Signup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
