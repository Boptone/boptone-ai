/**
 * Shared Footer Component
 * Black background with white text, BOPTONE branding
 * Used across all public-facing pages for brand consistency
 */

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-6 py-16">
        {/* BOPTONE Wordmark Logo */}
        <div className="mb-12">
          <h2 
            className="text-5xl font-black text-white"
            style={{
              fontFamily: '"Arial Black", "Arial Bold", Gadget, sans-serif',
              letterSpacing: '-0.05em',
              fontWeight: 900
            }}
          >
            BOPTONE
          </h2>
          <p className="text-gray-400 text-sm mt-2">Own Your Tone™</p>
          <p className="text-gray-500 text-xs mt-1">Music • Culture • News • Whatever</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/bap" className="text-gray-400 hover:text-white transition-colors">BAP Protocol</a></li>
              <li><a href="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
              <li><a href="/shop" className="text-gray-400 hover:text-white transition-colors">BopShop</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/discover" className="text-gray-400 hover:text-white transition-colors">Discover</a></li>
              <li><a href="/upload" className="text-gray-400 hover:text-white transition-colors">Upload Music</a></li>
              <li><a href="/analytics" className="text-gray-400 hover:text-white transition-colors">Analytics</a></li>
              <li><a href="/my-store" className="text-gray-400 hover:text-white transition-colors">My Store</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Boptone</a></li>
              <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="/press" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="/api" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2026 Boptone. All rights reserved. Own Your Tone™</p>
          <div className="flex gap-6 text-gray-400">
            <a href="https://twitter.com/boptone" className="hover:text-white transition-colors" aria-label="Twitter">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/boptone" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://facebook.com/boptone" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
