import { Link } from "wouter";

/**
 * Shared Footer Component
 * Light gray background for professional, future-forward aesthetic
 * 4-column layout with large centered BOPTONE logo
 * Mobile optimized with responsive text sizes and spacing
 * Used across all pages for brand consistency
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16 md:py-20">
        {/* 4-Column Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16 md:mb-20">
          {/* Column 1: Platform */}
          <div>
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide mb-6">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/bap-protocol" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  BAP Protocol
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Discover Music
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  BopShop
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: For Artists */}
          <div>
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide mb-6">For Artists</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Upload Music
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/revenue" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Revenue
                </Link>
              </li>
              <li>
                <Link href="/audience" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Audience
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Centered Logo - Mobile Optimized */}
        <div className="flex justify-center mb-16 md:mb-20">
          <img 
            src="/boptone-logo-transparent.png" 
            alt="Boptone" 
            className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {currentYear} Boptone, Inc. All rights reserved.</span>
            </div>

            {/* Social Media & Legal Links */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* LinkedIn Icon */}
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              {/* Legal Links */}
              <div className="flex items-center gap-6 md:gap-8 text-sm">
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Center
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Your Privacy Choices
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
