import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { Link, useLocation } from "wouter";


export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);

  const platformLinks = [
    { href: "/features", label: "Features", description: "Explore all platform capabilities" },
    { href: "/bap", label: "BAP Protocol", description: "Open-source artist data standard" },
    { href: "/how-it-works", label: "How It Works", description: "See the platform in action" },
    { href: "/transparency", label: "Transparency", description: "Real-time platform metrics" },
  ];

  const resourceLinks = [
    { href: "/shop", label: "BopShop", description: "Merchandise and artist goods" },
    { href: "/discover", label: "Discover", description: "Find new music and artists" },
    { href: "/faq", label: "FAQ", description: "Frequently asked questions" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
      <div className="container">
        <div className="flex h-20 items-center justify-between gap-8">
          {/* Logo - Left */}
          <Link href="/">
            <div className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <img 
                src="/boptone-logo-transparent.png" 
                alt="Boptone" 
                className="h-12 md:h-14 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Platform Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setPlatformMenuOpen(true)}
              onMouseLeave={() => setPlatformMenuOpen(false)}
            >
              <button className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                Platform
                <span className="text-xs">▼</span>
              </button>
              
              {platformMenuOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-black shadow-lg"
                  onMouseEnter={() => setPlatformMenuOpen(true)}
                  onMouseLeave={() => setPlatformMenuOpen(false)}
                >
                  <div className="p-4 space-y-1">
                    {platformLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <a className="block p-3 hover:bg-gray-100 transition-colors">
                          <div className="font-medium text-black text-sm">{link.label}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{link.description}</div>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setResourcesMenuOpen(true)}
              onMouseLeave={() => setResourcesMenuOpen(false)}
            >
              <button className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                Resources
                <span className="text-xs">▼</span>
              </button>
              
              {resourcesMenuOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-black shadow-lg"
                  onMouseEnter={() => setResourcesMenuOpen(true)}
                  onMouseLeave={() => setResourcesMenuOpen(false)}
                >
                  <div className="p-4 space-y-1">
                    {resourceLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <a className="block p-3 hover:bg-gray-100 transition-colors">
                          <div className="font-medium text-black text-sm">{link.label}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{link.description}</div>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Standalone Links */}
            <Link href="/signup">
              <a className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                Pricing
              </a>
            </Link>
          </div>

          {/* Right Side - Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Ask Toney - Always visible */}
            <Button 
              variant="ghost" 
              className="text-sm font-medium hover:bg-gray-100"
              onClick={() => {
                // Trigger Toney chatbot to open
                const toneyButton = document.querySelector('[data-toney-trigger]') as HTMLButtonElement;
                if (toneyButton) toneyButton.click();
              }}
            >
              Ask Toney
            </Button>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm font-medium hover:bg-gray-100">Dashboard</Button>
                </Link>
                <Link href="/profile-settings">
                  <Button variant="outline" className="text-sm font-medium rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm font-medium hover:bg-gray-100">
                  <a href={getLoginUrl()}>Log In</a>
                </Button>
                <Button variant="outline" asChild className="text-sm font-medium px-6 rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black">
                  <a href={getLoginUrl()}>
                    Get Started
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 w-12 h-12 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <span className="text-xl font-bold">×</span>
            ) : (
              <span className="text-xl font-bold">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-white">
          <div className="container py-6 space-y-4">
            {/* Platform Section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Platform</div>
              {platformLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className="block py-2 px-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>

            {/* Resources Section */}
            <div className="space-y-2 pt-4 border-t-2 border-black">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Resources</div>
              {resourceLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className="block py-2 px-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>

            {/* Pricing */}
            <div className="pt-4 border-t-2 border-black">
              <Link href="/signup">
                <a
                  className="block py-2 px-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
              </Link>
            </div>
            
            {/* Auth Section */}
            <div className="pt-4 space-y-3 border-t-2 border-black">
              {/* Ask Toney - Always visible */}
              <Button
                variant="ghost"
                className="w-full justify-start text-base hover:bg-gray-100"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const toneyButton = document.querySelector('[data-toney-trigger]') as HTMLButtonElement;
                  if (toneyButton) toneyButton.click();
                }}
              >
                Ask Toney
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile-settings">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-base rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start text-base hover:bg-gray-100" asChild>
                    <a href={getLoginUrl()}>Log In</a>
                  </Button>
                  <Button className="w-full rounded-full bg-black hover:bg-gray-800 text-white font-semibold" asChild>
                    <a href={getLoginUrl()}>
                      Get Started
                    </a>
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
