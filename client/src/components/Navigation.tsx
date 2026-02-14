import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { Link, useLocation } from "wouter";


export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/bap", label: "BAP" },
    { href: "/shop", label: "BopShop" },
    { href: "/discover", label: "Discover" },
    { href: "/signup", label: "Pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
      <div className="container">
        <div className="flex h-20 items-center justify-between gap-8">
          {/* Logo - Left */}
          <Link href="/">
            <div className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <img 
                src="/boptone-logo.png" 
                alt="Boptone" 
                className="h-12 md:h-14 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`text-sm font-medium transition-colors hover:text-black ${
                    location === link.href
                      ? "text-black"
                      : "text-gray-600"
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Right Side - Auth */}
          <div className="hidden md:flex items-center gap-4">
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
            className="md:hidden p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 w-12 h-12 flex items-center justify-center"
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
        <div className="md:hidden border-t-2 border-black bg-white">
          <div className="container py-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`block py-2 text-base font-medium transition-colors hover:text-black ${
                    location === link.href
                      ? "text-black"
                      : "text-gray-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            
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
