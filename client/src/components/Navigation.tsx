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
  Zap,
  Video,
  CreditCard,
  Settings,
  LogOut
} from "lucide-react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setProfileDropdownOpen(false);
      setLocation("/");
      window.location.reload();
    },
  });
  
  // Fetch artist profile to get avatar
  const { data: artistProfile } = trpc.artistProfile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch cart count for badge
  const { data: cartCountData = 0 } = trpc.cart.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const cartCount = typeof cartCountData === 'number' ? cartCountData : 0;

  // Fetch wishlist count for badge
  const { data: wishlistCountData = 0 } = trpc.wishlist.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const wishlistCount = typeof wishlistCountData === 'number' ? wishlistCountData : 0;

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Mega menu content
  const platformItems = [
    {
      icon: Music,
      title: "BopMusic",
      description: "Stream, distribute, and earn from your music",
      href: "/features"
    },
    {
      icon: Video,
      title: "Bops",
      description: "Post 15-30 second videos and get tipped instantly",
      href: "/bops"
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
      description: "Track performance across all your content in real-time",
      href: "/insights"
    }
  ];

  const resourcesItems = [
    {
      icon: Zap,
      title: "Why Boptone",
      description: "The Autonomous Operating System for Artists",
      href: "/why-boptone"
    },
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
                src="/boptone_main_logo_black.png" 
                alt="Boptone" 
                className="h-12 w-auto"
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

          {/* Desktop Right Side - AI Chat + Bops + Cart + Auth */}
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

            {/* Bops Quick Access Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-11 h-11 hover:bg-gray-100 transition-colors"
              asChild
              aria-label="Bops"
            >
              <Link href="/bops">
                <Video className="w-5 h-5 text-gray-700" />
              </Link>
            </Button>

            {/* Wishlist & Cart Icons with Badges */}
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  asChild
                  aria-label="Wishlist"
                >
                  <Link href="/wishlist">
                    <Zap className="w-5 h-5 text-gray-700" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#0cc0df] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  asChild
                  aria-label="Shopping Cart"
                >
                  <Link href="/cart">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#0cc0df] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </>
            )}

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

                {/* Profile Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="rounded-full border border-black bg-white hover:bg-gray-100 text-black font-medium text-base px-5 py-2 h-11 flex items-center gap-2 transition-colors"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
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

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 z-50">
                      <div className="w-52 bg-white border border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2">
                        <Link href="/profile-settings">
                          <a
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4 text-gray-500" />
                            Profile Settings
                          </a>
                        </Link>
                        <Link href="/settings/billing">
                          <a
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            Billing
                          </a>
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="w-4 h-4 text-gray-500" />
                          {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Mobile Right Side - AI Chat + Cart + Hamburger */}
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

            {/* Wishlist & Cart Icons with Badges */}
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  asChild
                  aria-label="Wishlist"
                >
                  <Link href="/wishlist">
                    <Zap className="w-5 h-5 text-gray-700" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#0cc0df] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  asChild
                  aria-label="Shopping Cart"
                >
                  <Link href="/cart">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#0cc0df] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </>
            )}

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

            <Link href="/bops">
              <a
                className="flex items-center gap-3 py-3 px-4 text-base font-bold text-black bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                onClick={closeMobileMenu}
              >
                <Video className="w-5 h-5 text-black" />
                Bops — Short Videos
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
                      Profile Settings
                    </Button>
                  </Link>

                  <Link href="/settings/billing">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-medium py-3 px-4 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      onClick={closeMobileMenu}
                    >
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      Billing
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
