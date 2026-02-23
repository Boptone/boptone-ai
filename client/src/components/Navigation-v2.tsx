import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, getLoginUrl } from "@/const";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { User, MessageCircle, Menu, X } from "lucide-react";
import { SearchAIOverlay } from "@/components/SearchAIOverlay";

/**
 * Enterprise-Grade Navigation Component
 * 
 * Design Principles:
 * - Crystal clear hierarchy: Logo → Primary Nav → AI Chat → Auth/Profile
 * - Optimal spacing: Perfect breathing room for logo and all elements
 * - Professional polish: Subtle interactions, perfect alignment
 * - Mobile-first responsive: Flawless across all devices
 * - Accessibility: WCAG 2.1 AA compliant
 */
export function Navigation() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  
  // Fetch artist profile to get avatar
  const { data: artistProfile } = trpc.artistProfile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo - Left (Perfect Breathing Room) */}
          <Link href="/">
            <a className="flex-shrink-0 transition-opacity hover:opacity-80" aria-label="Boptone Home">
              <img 
                src="/boptone-logo-transparent.png" 
                alt="Boptone" 
                className="h-16 w-auto"
              />
            </a>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {/* Platform */}
            <Link href="/features">
              <a className="text-base font-medium text-gray-700 hover:text-black transition-colors">
                Platform
              </a>
            </Link>

            {/* Resources */}
            <Link href="/how-it-works">
              <a className="text-base font-medium text-gray-700 hover:text-black transition-colors">
                Resources
              </a>
            </Link>

            {/* Pricing */}
            <Link href="/signup">
              <a className="text-base font-medium text-gray-700 hover:text-black transition-colors">
                Pricing
              </a>
            </Link>
          </div>

          {/* Desktop Right Side - AI Chat + Auth */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {/* AI Chat Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOverlayOpen(true)}
              className="rounded-full w-11 h-11 hover:bg-gray-100 transition-colors"
              aria-label="AI Chat"
            >
              <MessageCircle className="w-5 h-5 text-gray-700" />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors px-4"
                  >
                    Dashboard
                  </Button>
                </Link>

                {/* Profile with Avatar */}
                <Link href="/profile-settings">
                  <Button 
                    variant="outline" 
                    className="rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black font-medium text-base px-5 py-2 h-11 flex items-center gap-2 transition-colors"
                  >
                    {artistProfile?.avatarUrl ? (
                      <img 
                        src={artistProfile.avatarUrl} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* Log In */}
                <Button 
                  variant="ghost" 
                  asChild 
                  className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors px-4"
                >
                  <a href={getLoginUrl()}>Log In</a>
                </Button>

                {/* Get Started */}
                <Button 
                  variant="outline" 
                  asChild 
                  className="rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black font-medium text-base px-6 py-2 h-11 transition-colors"
                >
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Right Side - AI Chat + Hamburger */}
          <div className="lg:hidden flex items-center gap-3">
            {/* AI Chat Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOverlayOpen(true)}
              className="rounded-full w-11 h-11 hover:bg-gray-100 transition-colors"
              aria-label="AI Chat"
            >
              <MessageCircle className="w-5 h-5 text-gray-700" />
            </Button>

            {/* Hamburger Menu Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full border-2 border-black bg-white hover:bg-gray-100 w-12 h-12 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search/AI Overlay */}
      <SearchAIOverlay 
        isOpen={searchOverlayOpen} 
        onClose={() => setSearchOverlayOpen(false)} 
      />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-white">
          <div className="mx-auto max-w-7xl px-6 py-6 space-y-1">
            {/* Navigation Links */}
            <Link href="/features">
              <a
                className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                Platform
              </a>
            </Link>

            <Link href="/how-it-works">
              <a
                className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                Resources
              </a>
            </Link>

            <Link href="/signup">
              <a
                className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                Pricing
              </a>
            </Link>

            {/* Auth Section */}
            <div className="pt-4 space-y-2 border-t-2 border-black mt-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-medium py-3 px-4 hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/profile-settings">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-base font-medium rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black py-3 px-4 flex items-center gap-2 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {artistProfile?.avatarUrl ? (
                        <img 
                          src={artistProfile.avatarUrl} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-base font-medium py-3 px-4 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <a href={getLoginUrl()}>Log In</a>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start text-base font-medium rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black py-3 px-4 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <a href={getLoginUrl()}>Get Started</a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
