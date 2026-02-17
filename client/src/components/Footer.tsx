import { Link } from "wouter";
import { LanguagePicker } from "./LanguagePicker";
import { CurrencySelector } from "./CurrencySelector";

/**
 * Shared Footer Component
 * Professional footer with 4-column layout, large centered logo, and clean bottom bar
 * Language/currency selectors positioned in bottom bar alongside copyright
 * Mobile optimized with responsive text sizes and spacing
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
                <Link href="/california-notice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  California Notice
                </Link>
              </li>
              <li>
                <Link href="/opt-out" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Opt-Out Choices
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Centered Logo */}
        <div className="flex justify-center mb-16 md:mb-20">
          <img 
            src="/boptone-logo-transparent.png" 
            alt="Boptone" 
            className="h-16 sm:h-24 md:h-32 lg:h-40 w-auto"
          />
        </div>
      </div>

      {/* Bottom Bar - Copyright + Language/Currency Pills */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Boptone, Inc. All rights reserved.
            </div>

            {/* Language & Currency Selectors - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Language:</span>
                <LanguagePicker />
              </div>
              <div className="hidden sm:block h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Currency:</span>
                <CurrencySelector />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
