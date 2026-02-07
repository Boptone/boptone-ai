import { Link } from "wouter";

/**
 * Shared Footer Component
 * Dark navy background matching Bolt footer design
 * 4-column layout with large centered BOPTONE logo
 * Used across all pages for brand consistency
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Platform */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/bap-protocol" className="hover:text-white transition-colors">
                  BAP Protocol
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-white transition-colors">
                  Discover Music
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  BopShop
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: For Artists */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">For Artists</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-white transition-colors">
                  Upload Music
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/revenue" className="hover:text-white transition-colors">
                  Revenue
                </Link>
              </li>
              <li>
                <Link href="/audience" className="hover:text-white transition-colors">
                  Audience
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Centered Logo */}
        <div className="flex justify-center mb-12">
          <div 
            className="text-white font-black text-7xl md:text-8xl lg:text-9xl tracking-tight"
            style={{
              fontFamily: '"Arial Black", "Arial Bold", Gadget, sans-serif',
              letterSpacing: '-0.05em',
              fontWeight: 900
            }}
          >
            BOPTONE
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm">
              <span>© {currentYear} Boptone, Inc.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Center
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Your Privacy Choices
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
