import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

type VerifyStep = "pending" | "verify" | "success" | "error";

/**
 * Email Verification Flow with BAP Protocol aesthetic
 * 
 * Design elements:
 * - Cyan (#81e6fe) shadow effects on buttons
 * - Pill-shaped buttons (rounded-full)
 * - Bold typography
 * - High contrast black & white
 */
export default function VerifyEmail() {
  const [step, setStep] = useState<VerifyStep>("pending");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();

  // TODO: Implement tRPC mutations for email verification in server/routers.ts
  // const verifyEmail = trpc.auth.verifyEmail.useMutation();
  // const resendVerification = trpc.auth.resendVerification.useMutation();

  useEffect(() => {
    // Get email from URL params if available
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const codeParam = params.get("code");
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // If code is in URL, auto-verify
    if (codeParam) {
      setVerificationCode(codeParam);
      handleAutoVerify(codeParam);
    } else {
      setStep("verify");
    }
  }, []);

  const handleAutoVerify = async (code: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await verifyEmail.mutateAsync({ code });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setStep("success");
      toast.success("Email verified successfully!");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    } catch (error: any) {
      setStep("error");
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    
    if (!verificationCode) {
      setCodeError("Verification code is required");
      return;
    }
    
    if (verificationCode.length !== 6) {
      setCodeError("Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await verifyEmail.mutateAsync({ code: verificationCode });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setStep("success");
      toast.success("Email verified successfully!");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    } catch (error: any) {
      setCodeError("Invalid verification code. Please try again.");
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await resendVerification.mutateAsync({ email });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Verification code sent again!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          {/* Pending State (Auto-verifying) */}
          {step === "pending" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h1 className="text-3xl font-black text-black mb-2">
                  Verifying...
                </h1>
                <p className="text-gray-600">
                  Please wait while we verify your email address
                </p>
              </div>
            </div>
          )}

          {/* Verify State (Manual code entry) */}
          {step === "verify" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-black mb-2">
                  Verify Your Email
                </h1>
                <p className="text-gray-600">
                  Enter the 6-digit code we sent to
                </p>
                {email && (
                  <p className="text-sm font-bold text-black mt-2">
                    {email}
                  </p>
                )}
              </div>

              <form onSubmit={handleManualVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-black font-bold">
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, ""));
                      setCodeError("");
                    }}
                    className={`text-center text-2xl tracking-widest font-bold border rounded-2xl ${
                      codeError ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={6}
                    required
                  />
                  {codeError && (
                    <p className="text-sm text-red-600 font-medium text-center">
                      {codeError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  className="text-sm font-bold text-black hover:underline"
                  onClick={handleResend}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend code"}
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-black mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-600">
                  Your email has been successfully verified
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === "error" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-black mb-2">
                  Verification Failed
                </h1>
                <p className="text-gray-600">
                  The verification link is invalid or has expired
                </p>
              </div>
              <Button
                onClick={handleResend}
                className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Request New Code"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm font-bold text-black hover:underline"
                onClick={() => setLocation("/login")}
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help?{" "}
            <a href="mailto:hello@boptone.com" className="underline hover:text-gray-700">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
