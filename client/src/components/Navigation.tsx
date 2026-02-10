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

          {/* Right Side - Auth & Theme */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoonStar className="h-4 w-4" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
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
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            
            {/* Theme Switcher */}
            <div className="pt-4 pb-4 border-t border-border">
              <div className="text-sm font-medium text-muted-foreground mb-3">Theme</div>
              <div className="space-y-2">
                <button
                  onClick={() => setTheme?.("light")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    theme === "light" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme?.("dark")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    theme === "dark" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme?.("system")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    theme === "system" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Circle className="h-4 w-4" />
                  <span>System</span>
                </button>
              </div>
            </div>
            
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
