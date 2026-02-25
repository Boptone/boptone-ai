import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Single-screen signup page with BAP Protocol aesthetic
 * Design standards from /welcome page:
 * - Black borders (border-black)
 * - Brutalist shadows (4px 4px 0 0 black)
 * - Pill-shaped buttons (rounded-full)
 * - Bold typography
 * - Rounded-lg cards
 */
export default function MultiStepSignup() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [stageName, setStageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [stageNameError, setStageNameError] = useState("");

  // tRPC mutations
  const createProfile = trpc.artistProfile.create.useMutation();

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    setLocation("/dashboard");
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setStageNameError("");
    
    // Validation
    if (!email) {
      setEmailError("Email address is required");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (!stageName) {
      setStageNameError("Artist name is required");
      return;
    }

    setIsLoading(true);
    try {
      // Redirect to OAuth with email and stageName in state
      const returnUrl = window.location.origin + "/dashboard";
      const state = btoa(JSON.stringify({ 
        returnUrl,
        email,
        stageName,
        rememberMe: false 
      }));
      
      window.location.href = getLoginUrl(false, state);
    } catch (error: any) {
      toast.error(error.message || "Failed to start signup");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-black mb-4 leading-tight">
            Join Boptone
          </h1>
          <p className="text-xl text-gray-600">
            After signing up, upload music, set up your profile, and start building your audience.
          </p>
        </div>

        {/* Main Card */}
        <div 
          className="bg-white rounded-lg p-8 border border-black mb-6"
          style={{
            boxShadow: '4px 4px 0 0 black'
          }}
        >
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold text-black">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`h-12 rounded-full border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } focus:border-black`}
                required
              />
              {emailError && (
                <p className="text-sm text-red-500 font-medium">{emailError}</p>
              )}
            </div>

            {/* Artist Name */}
            <div className="space-y-2">
              <Label htmlFor="stageName" className="text-base font-bold text-black">
                Artist Name
              </Label>
              <Input
                id="stageName"
                type="text"
                placeholder="Your stage name"
                value={stageName}
                onChange={(e) => {
                  setStageName(e.target.value);
                  setStageNameError("");
                }}
                className={`h-12 rounded-full border ${
                  stageNameError ? "border-red-500" : "border-gray-300"
                } focus:border-black`}
                required
              />
              {stageNameError && (
                <p className="text-sm text-red-500 font-medium">{stageNameError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-[#0cc0df] text-black hover:bg-[#0aabca] rounded-full border border-black"
              style={{
                boxShadow: '4px 4px 0 0 black'
              }}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Continue to Sign Up"}
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-gray-600">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-black hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Terms Note */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed text-center">
            By signing up, you agree to our{" "}
            <a href="/terms" className="font-bold text-black hover:underline">
              Terms of Service
            </a>
            {" "}and{" "}
            <a href="/privacy" className="font-bold text-black hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
