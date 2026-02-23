import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { Link } from "wouter";

/**
 * Pre-login page that allows users to choose session duration
 * via "Remember this device" checkbox before redirecting to OAuth
 * 
 * Design follows BAP Protocol aesthetic:
 * - Cyan (#81e6fe) shadow effects
 * - Pill-shaped buttons
 * - Bold typography
 * - High contrast black & white
 */
export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    const loginUrl = getLoginUrl(rememberMe);
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <img
            src={APP_LOGO}
            alt={APP_TITLE}
            className="w-24 h-24 mx-auto mb-6 border-4 border-black"
          />
          <h1 className="text-5xl font-black text-black mb-4 leading-tight">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-600">
            Sign in to access your creator dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 mb-6">
          {/* Remember Me Option */}
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="mt-1 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <div className="flex-1">
                <label
                  htmlFor="rememberMe"
                  className="text-base font-bold text-black cursor-pointer block mb-2"
                >
                  Remember this device
                </label>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {rememberMe
                    ? "You'll stay signed in for 30 days on this device"
                    : "You'll stay signed in for 1 year (default)"}
                </p>
              </div>
            </div>
          </div>

          {/* Login Button - BAP Protocol style with cyan shadow */}
          <Button
            onClick={handleLogin}
            className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 rounded-full shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all border-none"
          >
            Continue to Sign In
          </Button>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold text-black hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-black">🔒 Security tip:</strong> Only enable "Remember this device" on
            personal devices you trust. Avoid using this on public or shared computers.
          </p>
        </div>

        {/* Legal Links */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
