import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
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
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <div className="hidden md:flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
                </Link>
                <Link href="/profile-settings">
                  <Button variant="outline" className="text-sm font-medium">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm font-medium">
                  <a href={getLoginUrl()}>Log In</a>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 rounded-lg">
                  <a href={getLoginUrl()}>
                    Get Started
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
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
        <div className="md:hidden border-t border-border bg-background">
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
