import { useState } from "react";
import { Music, Mail, Phone, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type AuthMethod = "select" | "email" | "phone" | "verify-email" | "verify-phone";

/**
 * Phase 1 - Multi-Auth Signup Flow
 * 
 * Increments 2, 3, 4: Complete authentication options
 * - Email signup with verification code
 * - Phone signup with SMS verification (Twilio-ready, needs credentials)
 * - Google OAuth (one-click)
 * - Apple OAuth (one-click)
 */
export default function AuthSignup() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("select");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // tRPC mutations for email/phone signup
  const sendEmailCode = trpc.auth.sendEmailVerification.useMutation();
  const verifyEmailCode = trpc.auth.verifyEmailCode.useMutation();
  const sendPhoneCode = trpc.auth.sendPhoneVerification.useMutation();
  const verifyPhoneCode = trpc.auth.verifyPhoneCode.useMutation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendEmailCode.mutateAsync({ email });
      setAuthMethod("verify-email");
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsLoading(true);
    try {
      await sendPhoneCode.mutateAsync({ phone });
      setAuthMethod("verify-phone");
      toast.success("Verification code sent via SMS!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmailCode.mutateAsync({ email, code: verificationCode });
      if (result.success) {
        toast.success("Email verified! Redirecting...");
        // Redirect to education flow
        window.location.href = "/how-it-works";
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyPhoneCode.mutateAsync({ phone, code: verificationCode });
      if (result.success) {
        toast.success("Phone verified! Redirecting...");
        // Redirect to education flow
        window.location.href = "/how-it-works";
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth flow
    window.location.href = "/api/oauth/google";
  };

  const handleAppleSignIn = () => {
    // Redirect to Apple OAuth flow
    window.location.href = "/api/oauth/apple";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="rounded-xl w-full max-w-md border-2 border-gray-200 shadow-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">
              {authMethod === "select" && "Create Your Account"}
              {authMethod === "email" && "Sign Up with Email"}
              {authMethod === "phone" && "Sign Up with Phone"}
              {authMethod === "verify-email" && "Verify Your Email"}
              {authMethod === "verify-phone" && "Verify Your Phone"}
            </CardTitle>
            <CardDescription>
              {authMethod === "select" && "Join the most powerful infrastructure platform for artists"}
              {authMethod === "email" && "We'll send a verification code to your inbox"}
              {authMethod === "phone" && "We'll send a verification code via SMS"}
              {authMethod === "verify-email" && "Enter the 6-digit code sent to your email"}
              {authMethod === "verify-phone" && "Enter the 6-digit code sent to your phone"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Method Selection Screen */}
          {authMethod === "select" && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={() => setAuthMethod("email")}
                  variant="outline"
                  className="w-full h-12 text-base rounded-full justify-start gap-3"
                >
                  <Mail className="h-5 w-5" />
                  Continue with Email
                </Button>

                <Button
                  onClick={() => setAuthMethod("phone")}
                  variant="outline"
                  className="w-full h-12 text-base rounded-full justify-start gap-3"
                >
                  <Phone className="h-5 w-5" />
                  Continue with Phone
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full h-12 text-base rounded-full justify-start gap-3"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  onClick={handleAppleSignIn}
                  variant="outline"
                  className="w-full h-12 text-base rounded-full justify-start gap-3"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to Boptone's Terms of Service and Privacy Policy
              </p>
            </>
          )}

          {/* Email Signup Form */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setAuthMethod("select")}
              >
                Back to options
              </Button>
            </form>
          )}

          {/* Phone Signup Form */}
          {authMethod === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-full"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setAuthMethod("select")}
              >
                Back to options
              </Button>
            </form>
          )}

          {/* Email Verification Form */}
          {authMethod === "verify-email" && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="rounded-full text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Sent to {email}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
                <Check className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setAuthMethod("email");
                  setVerificationCode("");
                }}
              >
                Resend code
              </Button>
            </form>
          )}

          {/* Phone Verification Form */}
          {authMethod === "verify-phone" && (
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="rounded-full text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Sent to {phone}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
                <Check className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setAuthMethod("phone");
                  setVerificationCode("");
                }}
              >
                Resend code
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
