import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * GDPR-Compliant Cookie Consent Banner
 * 
 * Implements EU GDPR requirements for cookie consent:
 * - Granular consent categories (necessary, analytics, marketing)
 * - Opt-in required for non-essential cookies
 * - Easy access to manage preferences
 * - Consent stored in localStorage
 */

interface CookiePreferences {
  necessary: boolean; // Always true (required for site functionality)
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already given consent
    const savedPreferences = localStorage.getItem("cookie-consent");
    if (!savedPreferences) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply consent preferences
    applyConsentPreferences(prefs);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences(DEFAULT_PREFERENCES);
  };

  const applyConsentPreferences = (prefs: CookiePreferences) => {
    // Block/unblock analytics cookies
    if (prefs.analytics) {
      // Enable analytics (e.g., Google Analytics, Plausible)
      console.log("[Cookie Consent] Analytics enabled");
      
      // Initialize analytics scripts dynamically
      if (typeof window !== 'undefined' && !document.querySelector('script[data-analytics="true"]')) {
        // Example: Google Analytics
        // const script = document.createElement('script');
        // script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        // script.async = true;
        // script.setAttribute('data-analytics', 'true');
        // document.head.appendChild(script);
        
        // Example: Plausible Analytics
        // const plausible = document.createElement('script');
        // plausible.src = 'https://plausible.io/js/script.js';
        // plausible.setAttribute('data-domain', 'boptone.com');
        // plausible.setAttribute('data-analytics', 'true');
        // plausible.defer = true;
        // document.head.appendChild(plausible);
      }
    } else {
      // Disable analytics
      console.log("[Cookie Consent] Analytics disabled");
      
      // Remove analytics scripts
      const analyticsScripts = document.querySelectorAll('script[data-analytics="true"]');
      analyticsScripts.forEach(script => script.remove());
      
      // Remove analytics cookies
      const analyticsCookies = ['_ga', '_gid', '_gat', '_gat_gtag'];
      analyticsCookies.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }

    // Block/unblock marketing cookies
    if (prefs.marketing) {
      // Enable marketing pixels (e.g., Facebook Pixel, Google Ads)
      console.log("[Cookie Consent] Marketing enabled");
      
      // Initialize marketing scripts dynamically
      if (typeof window !== 'undefined' && !document.querySelector('script[data-marketing="true"]')) {
        // Example: Facebook Pixel
        // const fbPixel = document.createElement('script');
        // fbPixel.innerHTML = `
        //   !function(f,b,e,v,n,t,s)
        //   {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        //   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        //   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        //   n.queue=[];t=b.createElement(e);t.async=!0;
        //   t.src=v;s=b.getElementsByTagName(e)[0];
        //   s.parentNode.insertBefore(t,s)}(window, document,'script',
        //   'https://connect.facebook.net/en_US/fbevents.js');
        //   fbq('init', 'YOUR_PIXEL_ID');
        //   fbq('track', 'PageView');
        // `;
        // fbPixel.setAttribute('data-marketing', 'true');
        // document.head.appendChild(fbPixel);
      }
    } else {
      // Disable marketing
      console.log("[Cookie Consent] Marketing disabled");
      
      // Remove marketing scripts
      const marketingScripts = document.querySelectorAll('script[data-marketing="true"]');
      marketingScripts.forEach(script => script.remove());
      
      // Remove marketing cookies
      const marketingCookies = ['_fbp', '_fbc', 'fr'];
      marketingCookies.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
    
    // Respect Do Not Track (DNT) and Global Privacy Control (GPC) signals
    if (typeof navigator !== 'undefined') {
      const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
      const gpc = (navigator as any).globalPrivacyControl;
      
      if (dnt === '1' || gpc === true) {
        console.log('[Cookie Consent] DNT/GPC signal detected - blocking non-essential cookies');
        // Override preferences to respect user's browser-level privacy settings
        const restrictedPrefs = {
          necessary: true,
          analytics: false,
          marketing: false,
        };
        localStorage.setItem('cookie-consent', JSON.stringify(restrictedPrefs));
      }
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t">
        <Card className="max-w-4xl mx-auto p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">🍪 We Value Your Privacy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{" "}
                <a href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptAll} size="sm">
                  Accept All
                </Button>
                <Button onClick={acceptNecessary} variant="outline" size="sm">
                  Necessary Only
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Preferences
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={acceptNecessary}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie settings. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-semibold">Necessary Cookies</Label>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  These cookies are essential for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <Label className="text-base font-semibold mb-2 block">Analytics Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously. This helps us improve our website and user experience.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold mb-2 block">Marketing Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are used to track visitors across websites. They are used to display ads that 
                  are relevant and engaging for individual users, thereby making them more valuable for publishers 
                  and third-party advertisers.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => savePreferences(preferences)}>
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
