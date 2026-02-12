import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";


export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/bap", label: "BAP Protocol" },
    { href: "/shop", label: "BopShop" },
    { href: "/discover", label: "Discover" },
    { href: "/signup", label: "Pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left */}
          <Link href="/">
            <div className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <img 
                src="/boptone-logo.png" 
                alt="Boptone" 
                className="h-6 md:h-7 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`text-sm font-medium transition-colors hover:text-foreground ${
                    location === link.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Right Side - Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Ask Toney - Always visible with separator */}
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm font-medium gap-2 mr-2"
              onClick={() => {
                // Trigger Toney chatbot to open
                const toneyButton = document.querySelector('[data-toney-trigger]') as HTMLButtonElement;
                if (toneyButton) toneyButton.click();
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Ask Toney
            </Button>
            
            {/* Vertical separator */}
            <div className="h-6 w-px bg-border" />
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">Dashboard</Button>
                </Link>
                <Link href="/profile-settings">
                  <Button variant="outline" size="sm" className="text-sm font-medium">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                  <a href={getLoginUrl()}>Log In</a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-sm font-medium border-2 hover:bg-accent">
                  <a href={getLoginUrl()}>
                    Get Started
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container py-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`block py-2 text-base font-medium transition-colors hover:text-foreground ${
                    location === link.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            
            <div className="pt-4 space-y-3 border-t border-border">
              {/* Ask Toney - Always visible */}
              <Button
                variant="ghost"
                className="w-full justify-start text-base gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const toneyButton = document.querySelector('[data-toney-trigger]') as HTMLButtonElement;
                  if (toneyButton) toneyButton.click();
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Ask Toney
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile-settings">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start text-base" asChild>
                    <a href={getLoginUrl()}>Log In</a>
                  </Button>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
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
