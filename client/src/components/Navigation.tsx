import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Menu, X, Sun, Moon, Circle, MoonStar } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/bap", label: "BAP Protocol" },
    { href: "/shop", label: "BopShop" },
    { href: "/discover", label: "Discover" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center justify-between px-6">
        {/* Logo - Flush Left */}
        <Link href="/">
          <div className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
            <span className="text-6xl font-black" style={{ fontFamily: '"Arial Black", "Arial Bold", Gadget, sans-serif', letterSpacing: '-0.05em' }}>BOPTONE</span>
          </div>
        </Link>

        {/* Desktop Navigation - Adjacent to Logo */}
        <div className="hidden md:flex items-center gap-6 ml-12">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </div>

        {/* Auth Buttons & Theme Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoonStar className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme?.("light")} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme?.("dark")} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme?.("system")} className="cursor-pointer">
                <Circle className="mr-2 h-4 w-4" />
                <span>Default</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/profile-settings">
                <Button variant="outline">Profile</Button>
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <a href={getLoginUrl()}>Log In</a>
              </Button>
              <Button asChild className="bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold px-6">
                <a href={getLoginUrl()} className="flex items-center gap-2">
                  START FREE
                  <span className="text-lg">→</span>
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile-settings">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <a href={getLoginUrl()}>Log In</a>
                  </Button>
                  <Button className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold" asChild>
                    <a href={getLoginUrl()} className="flex items-center justify-center gap-2">
                      START FREE
                      <span className="text-lg">→</span>
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
