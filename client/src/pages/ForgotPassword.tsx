import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ResetStep = "email" | "sent" | "verify" | "success";

/**
 * Forgot Password Flow
 * 
 * Step 1: Enter email address
 * Step 2: Email sent confirmation
 * Step 3: Enter verification code (optional, can be handled via email link)
 * Step 4: Success message
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
      // Simulate success for demo purposes
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      {/* Top-right Back to Sign In link */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <span className="text-sm text-gray-600">Remember your password?</span>
        <a href={getLoginUrl()} className="text-sm font-medium text-black hover:text-gray-600 transition-colors">
          Sign in
        </a>
      </div>

      <Card className="rounded-none w-full max-w-lg border-4 border-black shadow-none bg-white">
        <CardHeader className="space-y-6 pt-12">
          {/* Progress Indicator */}
          {(step === "sent" || step === "verify" || step === "success") && (
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 flex-1 rounded-none bg-black" />
              <div className={`h-1 flex-1 rounded-none ${
                step === "verify" || step === "success" ? "bg-black" : "bg-gray-200"
              }`} />
              <div className={`h-1 flex-1 rounded-none ${
                step === "success" ? "bg-black" : "bg-gray-200"
              }`} />
            </div>
          )}
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-black">
              {step === "email" && "Reset your password"}
              {step === "sent" && "Check your email"}
              {step === "verify" && "Enter verification code"}
              {step === "success" && "Password reset complete"}
            </h1>
            <p className="text-gray-600">
              {step === "email" && "Enter your email address and we'll send you a link to reset your password."}
              {step === "sent" && "We've sent a password reset link to your email address."}
              {step === "verify" && "Enter the 6-digit code we sent to your email."}
              {step === "success" && "Your password has been successfully reset."}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Entry Form */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className={`rounded-full border-2 ${
                    emailError ? "border-black" : "border-gray-300"
                  }`}
                  required
                />
                {emailError && (
                  <p className="text-sm text-black font-medium">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full font-bold bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                <span className="ml-2">→</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Back to sign in
              </Button>
            </form>
          )}

          {/* Email Sent Confirmation */}
          {step === "sent" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-none border-2 border-gray-200 p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-xl font-bold">@</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-black font-bold">
                    Reset link sent to:
                  </p>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                <Button
                  variant="ghost"
                  className="text-sm font-medium rounded-full"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend email"}
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-full font-bold border-2 border-gray-200 bg-white hover:bg-gray-100 text-black"
                onClick={() => setStep("verify")}
              >
                I have a verification code
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => setStep("email")}
              >
                Try a different email
              </Button>
            </div>
          )}

          {/* Verification Code Entry */}
          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-black">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setCodeError("");
                  }}
                  className={`rounded-full border-2 text-center text-2xl tracking-widest ${
                    codeError ? "border-black" : "border-gray-300"
                  }`}
                  maxLength={6}
                  required
                />
                {codeError ? (
                  <p className="text-sm text-black font-medium text-center">{codeError}</p>
                ) : (
                  <p className="text-xs text-gray-600 text-center">
                    Sent to {email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full font-bold bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Reset Password"}
                <span className="ml-2">✓</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full"
                onClick={handleResendEmail}
                disabled={isLoading}
              >
                Resend code
              </Button>
            </form>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-none border-2 border-gray-200 p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-black font-bold">
                    Your password has been reset
                  </p>
                  <p className="text-sm text-gray-600">
                    You can now sign in with your new password
                  </p>
                </div>
              </div>

              <Button
                className="w-full rounded-full font-bold bg-black hover:bg-gray-800 text-white"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Continue to Sign In
                <span className="ml-2">→</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
