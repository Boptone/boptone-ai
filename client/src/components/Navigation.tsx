import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Music, 
  BarChart3, 
  ShoppingBag, 
  Shield, 
  Heart, 
  Plane,
  BookOpen,
  HelpCircle,
  FileText,
  Lock,
  UserX,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { SearchAIOverlay } from "@/components/SearchAIOverlay";
import { SearchBar } from "@/components/SearchBar";

export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  const platformItems = [
    { 
      icon: Music, 
      href: "/features", 
      label: "Distribution", 
      description: "Distribute music to all major streaming platforms" 
    },
    { 
      icon: TrendingUp, 
      href: "/insights", 
      label: "Artist Insights", 
      description: "Real-time traffic, conversions, and revenue analytics" 
    },
    { 
      icon: BarChart3, 
      href: "/bap", 
      label: "Analytics & Insights", 
      description: "Track performance with actionable data" 
    },
    { 
      icon: ShoppingBag, 
      href: "/how-it-works", 
      label: "Direct-to-Fan Commerce", 
      description: "Sell merchandise and digital downloads" 
    },
    { 
      icon: Shield, 
      href: "/transparency", 
      label: "IP Protection", 
      description: "Copyright monitoring and DMCA takedowns" 
    },
    { 
      icon: Heart, 
      href: "/features", 
      label: "Healthcare & Wellness", 
      description: "Artist-focused health coverage" 
    },
    { 
      icon: Plane, 
      href: "/features", 
      label: "Tour Management", 
      description: "Plan tours and maximize live revenue" 
    },
  ];

  const resourceItems = [
    { 
      icon: BookOpen, 
      href: "/shop", 
      label: "BopShop", 
      description: "Merchandise and artist goods" 
    },
    { 
      icon: Music, 
      href: "/discover", 
      label: "Discover Music", 
      description: "Find new artists and tracks" 
    },
    { 
      icon: HelpCircle, 
      href: "/faq", 
      label: "FAQ", 
      description: "Frequently asked questions" 
    },
    { 
      icon: FileText, 
      href: "/terms", 
      label: "Terms of Service", 
      description: "Platform terms and conditions" 
    },
    { 
      icon: Lock, 
      href: "/privacy", 
      label: "Privacy Policy", 
      description: "How we protect your data" 
    },
    { 
      icon: FileText, 
      href: "/california-notice", 
      label: "California Notice", 
      description: "CCPA privacy rights" 
    },
    { 
      icon: UserX, 
      href: "/opt-out", 
      label: "Opt-Out Choices", 
      description: "Manage privacy preferences" 
    },
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
          <div className="hidden lg:flex items-center gap-6">
            {/* Search Bar */}
            <SearchBar />
            {/* Platform Mega Menu */}
            <div className="relative group">
              <button 
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1"
              >
                Platform
                <span className="text-xs">▼</span>
              </button>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {platformItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href}>
                          <a className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group/item">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover/item:bg-gray-200 transition-colors">
                              <Icon className="w-5 h-5 text-gray-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm mb-1">{item.label}</div>
                              <div className="text-xs text-gray-600 leading-relaxed">{item.description}</div>
                            </div>
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Mega Menu */}
            <div className="relative group">
              <button 
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1"
              >
                Resources
                <span className="text-xs">▼</span>
              </button>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {resourceItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href}>
                          <a className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group/item">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover/item:bg-gray-200 transition-colors">
                              <Icon className="w-5 h-5 text-gray-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm mb-1">{item.label}</div>
                              <div className="text-xs text-gray-600 leading-relaxed">{item.description}</div>
                            </div>
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Standalone Links */}
            <Link href="/signup">
              <a className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                Pricing
              </a>
            </Link>
          </div>

          {/* Right Side - Search + Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOverlayOpen(true)}
              className="rounded-full w-10 h-10 hover:bg-gray-100"
              aria-label="AI Chat"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            {/* Ask Toney - Login required */}
            {isAuthenticated && (
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
            )}
            
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

      {/* Search/AI Overlay */}
      <SearchAIOverlay 
        isOpen={searchOverlayOpen} 
        onClose={() => setSearchOverlayOpen(false)} 
      />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-white">
          <div className="container py-6 space-y-4">
            {/* Platform Section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Platform</div>
              {platformItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className="block py-2 px-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>

            {/* Resources Section */}
            <div className="space-y-2 pt-4 border-t-2 border-black">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Resources</div>
              {resourceItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className="block py-2 px-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
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
            
            {/* AI Chat Section */}
            <div className="pt-4 border-t-2 border-black">
              <Button
                variant="ghost"
                className="w-full justify-start text-base hover:bg-gray-100"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOverlayOpen(true);
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                AI Chat
              </Button>
            </div>
            
            {/* Auth Section */}
            <div className="pt-4 space-y-3 border-t-2 border-black">
              {/* Ask Toney - Login required */}
              {isAuthenticated && (
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
              )}
              
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
