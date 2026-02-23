import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { Link } from "wouter";

/**
 * Pre-login page that allows users to choose session duration
 * via "Remember this device" checkbox before redirecting to OAuth
 */
export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    const loginUrl = getLoginUrl(rememberMe);
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-black">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-black"
            />
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Welcome to {APP_TITLE}
            </h1>
            <p className="text-gray-600">
              Sign in to access your creator dashboard
            </p>
          </div>

          {/* Remember Me Option */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-semibold text-gray-900 cursor-pointer block mb-1"
                >
                  Remember this device
                </label>
                <p className="text-xs text-gray-600">
                  {rememberMe
                    ? "You'll stay signed in for 30 days on this device"
                    : "You'll stay signed in for 1 year (default)"}
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-lg font-bold bg-black text-white hover:bg-gray-800 rounded-full border-2 border-black"
          >
            Continue to Sign In
          </Button>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-black hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>🔒 Security tip:</strong> Only enable "Remember this device" on
              personal devices you trust. Avoid using this on public or shared computers.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
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
