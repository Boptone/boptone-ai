import { LanguagePicker } from "./LanguagePicker";
import { CurrencySelector } from "./CurrencySelector";

/**
 * Ultra-Minimal Footer Component
 * Single clean bar with copyright and language/currency selectors
 * Professional, uncluttered design matching modern SaaS standards
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright - Left */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} Boptone, Inc. All rights reserved.
          </div>

          {/* Language & Currency Selectors - Right */}
          <div className="flex items-center gap-3">
            <LanguagePicker />
            <div className="h-6 w-px bg-border" />
            <CurrencySelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
