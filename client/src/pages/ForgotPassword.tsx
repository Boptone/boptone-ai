import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ResetStep = "email" | "sent" | "verify" | "success";

/**
 * Forgot Password page with BAP Protocol aesthetic
 * Matches Login page design exactly:
 * - Cyan (#81e6fe) shadow effects
 * - Pill-shaped buttons
 * - Bold typography
 * - High contrast black & white
 * - Rounded-3xl cards
 */
export default function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");

  // TODO: Implement tRPC mutations for password reset in server/routers.ts
  // const sendResetEmail = trpc.auth.sendPasswordReset.useMutation();
  // const verifyResetCode = trpc.auth.verifyPasswordReset.useMutation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    
    if (!email) {
      setEmailError("Email address is required");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await sendResetEmail.mutateAsync({ email });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setStep("sent");
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
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
      // const result = await verifyResetCode.mutateAsync({ email, code: verificationCode });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setStep("success");
      toast.success("Password reset successful!");
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await sendResetEmail.mutateAsync({ email });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Reset link sent again!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-black mb-4 leading-tight">
            {step === "email" && "Reset Password"}
            {step === "sent" && "Check Your Email"}
            {step === "verify" && "Enter Code"}
            {step === "success" && "All Set!"}
          </h1>
          <p className="text-xl text-gray-600">
            {step === "email" && "We'll send you a reset link"}
            {step === "sent" && "Password reset link sent"}
            {step === "verify" && "Enter your verification code"}
            {step === "success" && "Your password has been reset"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 mb-6">
          {/* Email Entry Form */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>
                  Remember your password?{" "}
                  <Link href="/login" className="font-bold text-black hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Email Sent Confirmation */}
          {step === "sent" && (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl">📧</span>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-black">
                    Reset link sent to:
                  </p>
                  <p className="text-base text-gray-600">{email}</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                <Button
                  variant="ghost"
                  className="text-sm font-bold text-black hover:bg-gray-100 rounded-full"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend email"}
                </Button>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
                onClick={() => setStep("verify")}
              >
                I have a verification code
              </Button>

              <div className="text-center text-sm text-gray-600">
                <button
                  onClick={() => setStep("email")}
                  className="font-bold text-black hover:underline"
                >
                  Try a different email
                </button>
              </div>
            </div>
          )}

          {/* Verification Code Entry */}
          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-base font-bold text-black">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setCodeError("");
                  }}
                  className={`h-16 rounded-full border text-center text-2xl tracking-widest ${
                    codeError ? "border-red-500" : "border-gray-300"
                  } focus:border-black`}
                  maxLength={6}
                  required
                />
                {codeError ? (
                  <p className="text-sm text-red-500 font-medium text-center">{codeError}</p>
                ) : (
                  <p className="text-sm text-gray-600 text-center">
                    Sent to {email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Reset Password"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-sm font-bold text-black hover:underline"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-3xl">✓</span>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-black">
                    Password Reset Complete
                  </p>
                  <p className="text-base text-gray-600">
                    You can now sign in with your new password
                  </p>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Continue to Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Help Note */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-black">💡 Need help?</strong> If you're having trouble
            resetting your password, contact our support team at{" "}
            <a href="mailto:support@boptone.com" className="font-bold text-black hover:underline">
              support@boptone.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
