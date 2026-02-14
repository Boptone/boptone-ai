import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * Custom 404 Error Page
 * Clean, modern design with Boptone logo and helpful navigation
 * Keeps users engaged instead of frustrated when they hit a dead end
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          {/* Boptone Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/boptone-logo.png" 
              alt="Boptone" 
              className="h-16 md:h-20 w-auto"
            />
          </div>

          {/* 404 Message */}
          <div className="mb-12">
            <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
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
                className="w-full h-auto py-6 flex flex-col items-center gap-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                <span className="text-2xl font-bold">HOME</span>
                <div className="text-xs opacity-90">Back to homepage</div>
              </Button>
            </Link>

            {/* Features */}
            <Link href="/features">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 border-4 border-black rounded-full hover:bg-gray-50"
              >
                <span className="text-2xl font-bold">EXPLORE</span>
                <div className="text-xs opacity-70">See what we offer</div>
              </Button>
            </Link>

            {/* Dashboard */}
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 border-4 border-black rounded-full hover:bg-gray-50"
              >
                <span className="text-2xl font-bold">DASHBOARD</span>
                <div className="text-xs opacity-70">View your account</div>
              </Button>
            </Link>

            {/* Support */}
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 border-4 border-black rounded-full hover:bg-gray-50"
              >
                <span className="text-2xl font-bold">HELP</span>
                <div className="text-xs opacity-70">Contact support</div>
              </Button>
            </Link>
          </div>

          {/* Additional Help Text */}
          <p className="text-sm text-gray-500">
            If you believe this is an error, please{" "}
            <Link href="/contact" className="text-black hover:text-gray-700 underline font-bold">
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
