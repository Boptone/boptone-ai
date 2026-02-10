import { Link } from "wouter";
import { Home, Search, LifeBuoy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Custom 404 Error Page
 * Clean, modern design with Boptone logo and helpful navigation
 * Keeps users engaged instead of frustrated when they hit a dead end
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          {/* Boptone Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/boptone-logo.png" 
              alt="Boptone" 
              className="h-16 md:h-20 w-auto opacity-90"
            />
          </div>

          {/* 404 Message */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Home */}
            <Link href="/">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Go Home</div>
                  <div className="text-xs opacity-90">Back to homepage</div>
                </div>
              </Button>
            </Link>

            {/* Features */}
            <Link href="/features">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2"
              >
                <Search className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Explore Features</div>
                  <div className="text-xs opacity-70">See what we offer</div>
                </div>
              </Button>
            </Link>

            {/* Dashboard */}
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2"
              >
                <ArrowLeft className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Dashboard</div>
                  <div className="text-xs opacity-70">View your account</div>
                </div>
              </Button>
            </Link>

            {/* Support */}
            <Link href="/support">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2"
              >
                <LifeBuoy className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Get Help</div>
                  <div className="text-xs opacity-70">Contact support</div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Additional Help Text */}
          <p className="text-sm text-gray-500">
            If you believe this is an error, please{" "}
            <Link href="/support" className="text-blue-600 hover:text-blue-700 underline">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="py-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Boptone, Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
