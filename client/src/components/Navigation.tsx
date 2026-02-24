import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  User, 
  MessageCircle, 
  Menu, 
  X,
  Music,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  BookOpen,
  HelpCircle,
  FileText,
  DollarSign,
  Zap
} from "lucide-react";
import { SearchAIOverlay } from "@/components/SearchAIOverlay";

/**
 * Enterprise-Grade Navigation Component with Mega Menus
 * 
 * Design Principles:
 * - Crystal clear hierarchy: Logo → Primary Nav → AI Chat → Auth/Profile
 * - Hover mega menus with icons and descriptions
 * - Optimal spacing: Perfect breathing room for logo and all elements
 * - Professional polish: Smooth animations, perfect alignment
 * - Mobile-first responsive: Flawless across all devices
 * - Accessibility: WCAG 2.1 AA compliant
 */
export function Navigation() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  
  // Fetch artist profile to get avatar
  const { data: artistProfile } = trpc.artistProfile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Mega menu content
  const platformItems = [
    {
      icon: Music,
      title: "BopAudio",
      description: "Your own streaming platform with 90/10 revenue split",
      href: "/features"
    },
    {
      icon: ShoppingBag,
      title: "BopShop",
      description: "Sell merchandise and digital products directly to fans",
      href: "/shop"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track performance across all platforms in real-time",
      href: "/insights"
    },
    {
      icon: TrendingUp,
      title: "Distribution",
      description: "Distribute music to all major streaming platforms",
      href: "/features"
    }
  ];

  const resourcesItems = [
    {
      icon: BookOpen,
      title: "How It Works",
      description: "Learn how Boptone helps you grow your music career",
      href: "/how-it-works"
    },
    {
      icon: FileText,
      title: "Blog",
      description: "Tips, guides, and industry insights for artists",
      href: "/blog"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Get answers to your questions and technical support",
      href: "/help"
    }
  ];

  const pricingItems = [
    {
      icon: Zap,
      title: "Free Plan",
      description: "Start building your audience with our free tier",
      href: "/signup#free"
    },
    {
      icon: TrendingUp,
      title: "Pro Plan",
      description: "Unlock unlimited uploads and advanced features",
      href: "/signup#pro"
    },
    {
      icon: DollarSign,
      title: "Enterprise",
      description: "Custom solutions for teams and labels",
      href: "/signup#enterprise"
    }
  ];

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
            {/* Platform with Mega Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('platform')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button 
                className="text-base font-medium text-gray-700 hover:text-black transition-colors"
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'platform' ? null : 'platform')}
              >
                Platform
              </button>
              
              {activeMegaMenu === 'platform' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2">
                  <div className="w-[500px] bg-white border border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 transition-opacity duration-200">
                  <div className="grid grid-cols-1 gap-4">
                    {platformItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors group">
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <item.icon className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resources with Mega Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('resources')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button 
                className="text-base font-medium text-gray-700 hover:text-black transition-colors"
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'resources' ? null : 'resources')}
              >
                Resources
              </button>
              
              {activeMegaMenu === 'resources' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2">
                  <div className="w-[450px] bg-white border border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 transition-opacity duration-200">
                  <div className="grid grid-cols-1 gap-4">
                    {resourcesItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors group">
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <item.icon className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing with Mega Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('pricing')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button 
                className="text-base font-medium text-gray-700 hover:text-black transition-colors"
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'pricing' ? null : 'pricing')}
              >
                Pricing
              </button>
              
              {activeMegaMenu === 'pricing' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2">
                  <div className="w-[450px] bg-white border border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 transition-opacity duration-200">
                  <div className="grid grid-cols-1 gap-4">
                    {pricingItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors group">
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <item.icon className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>
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
                    className="rounded-full border border-black bg-white hover:bg-gray-100 text-black font-medium text-base px-5 py-2 h-11 flex items-center gap-2 transition-colors"
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
                  className="rounded-full border border-black bg-white hover:bg-gray-100 text-black font-medium text-base px-6 py-2 h-11 transition-colors"
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
              className="rounded-full border border-black bg-white hover:bg-gray-100 w-12 h-12 transition-colors"
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
                      className="w-full justify-start text-base font-medium rounded-full border border-black bg-white hover:bg-gray-100 text-black py-3 px-4 flex items-center gap-2 transition-colors"
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
                    className="w-full justify-start text-base font-medium rounded-full border border-black bg-white hover:bg-gray-100 text-black py-3 px-4 transition-colors"
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
