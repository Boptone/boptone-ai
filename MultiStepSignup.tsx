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
import { Mail, Phone, ArrowRight, ArrowLeft, Check, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type SignupStep = 1 | 2 | 3;
type AuthMethod = "select" | "email" | "phone";

interface SignupData {
  // Step 1: Account
  authMethod: AuthMethod;
  email: string;
  phone: string;
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
  const [authMethod, setAuthMethod] = useState<AuthMethod>("select");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [signupData, setSignupData] = useState<SignupData>({
    authMethod: "select",
    email: "",
    phone: "",
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
  const sendPhoneCode = trpc.auth.sendPhoneVerification.useMutation();
  const verifyPhoneCode = trpc.auth.verifyPhoneCode.useMutation();
  const createProfile = trpc.artistProfile.create.useMutation();

  // Validation functions
  const validateStep1 = (): boolean => {
    if (authMethod === "email") {
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
    } else if (authMethod === "phone") {
      if (!signupData.phone) {
        toast.error("Phone number is required");
        return false;
      }
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(signupData.phone.replace(/[\s()-]/g, ""))) {
        toast.error("Please enter a valid phone number with country code");
        return false;
      }
      if (isVerificationSent && !signupData.verificationCode) {
        toast.error("Verification code is required");
        return false;
      }
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
    setIsLoading(true);
    try {
      if (authMethod === "email") {
        if (!signupData.email) {
          toast.error("Email address is required");
          return;
        }
        await sendEmailCode.mutateAsync({ email: signupData.email });
        toast.success("Verification code sent to your email!");
      } else if (authMethod === "phone") {
        if (!signupData.phone) {
          toast.error("Phone number is required");
          return;
        }
        await sendPhoneCode.mutateAsync({ phone: signupData.phone });
        toast.success("Verification code sent to your phone!");
      }
      setIsVerificationSent(true);
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
      
      // Verify code
      setIsLoading(true);
      try {
        if (authMethod === "email") {
          await verifyEmailCode.mutateAsync({
            email: signupData.email,
            code: signupData.verificationCode,
          });
          toast.success("Email verified successfully!");
        } else if (authMethod === "phone") {
          await verifyPhoneCode.mutateAsync({
            phone: signupData.phone,
            code: signupData.verificationCode,
          });
          toast.success("Phone verified successfully!");
        }
        setCurrentStep(2);
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
              {/* Auth Method Selection */}
              {authMethod === "select" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3 text-base"
                      onClick={() => setAuthMethod("email")}
                    >
                      <Mail className="w-5 h-5" />
                      Continue with Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3 text-base"
                      onClick={() => setAuthMethod("phone")}
                    >
                      <Phone className="w-5 h-5" />
                      Continue with Phone
                    </Button>
                  </div>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                      or
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3 text-base"
                      onClick={() => window.location.href = getLoginUrl() + "?provider=google"}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3 text-base"
                      onClick={() => window.location.href = getLoginUrl() + "?provider=apple"}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      Continue with Apple
                    </Button>
                  </div>

                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setLocation(getLoginUrl())}
                    >
                      Already have an account? Sign in
                    </Button>
                  </div>
                </div>
              )}

              {/* Email Verification Flow */}
              {authMethod === "email" && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => { setAuthMethod("select"); setIsVerificationSent(false); }}
                    className="gap-2 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to options
                  </Button>
                  
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

                  <div className="flex justify-end pt-4">
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

              {/* Phone Verification Flow */}
              {authMethod === "phone" && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => { setAuthMethod("select"); setIsVerificationSent(false); }}
                    className="gap-2 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to options
                  </Button>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={signupData.phone}
                      onChange={(e) => updateSignupData("phone", e.target.value)}
                      disabled={isVerificationSent}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Include country code (e.g., +1 for US)
                    </p>
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
                        Check your phone for the SMS code
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
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
