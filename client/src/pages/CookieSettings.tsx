import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Cookie } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CookieSettings() {
  const { isAuthenticated } = useAuth();
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch preferences from database if logged in
  const { data: dbPreferences, isLoading } = trpc.cookiePreferences.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Save preferences mutation
  const saveMutation = trpc.cookiePreferences.save.useMutation();

  // Load saved preferences on mount
  useEffect(() => {
    if (isAuthenticated && dbPreferences) {
      // Use database preferences for logged-in users
      setAnalyticsCookies(dbPreferences.analyticsCookies);
      setMarketingCookies(dbPreferences.marketingCookies);
    } else {
      // Use localStorage for guests
      const savedPreferences = localStorage.getItem("boptone_cookie_preferences");
      if (savedPreferences) {
        try {
          const prefs = JSON.parse(savedPreferences);
          setAnalyticsCookies(prefs.analytics ?? true);
          setMarketingCookies(prefs.marketing ?? true);
        } catch (error) {
          console.error("Failed to parse cookie preferences:", error);
        }
      }
    }
  }, [isAuthenticated, dbPreferences]);

  const handleAnalyticsToggle = (checked: boolean) => {
    setAnalyticsCookies(checked);
    setHasChanges(true);
  };

  const handleMarketingToggle = (checked: boolean) => {
    setMarketingCookies(checked);
    setHasChanges(true);
  };

  const handleSavePreferences = async () => {
    const preferences = {
      essential: true, // Always true
      analytics: analyticsCookies,
      marketing: marketingCookies,
      timestamp: new Date().toISOString(),
    };

    // Always save to localStorage
    localStorage.setItem("boptone_cookie_preferences", JSON.stringify(preferences));
    
    // If user is logged in, also save to database via tRPC
    if (isAuthenticated) {
      try {
        await saveMutation.mutateAsync({
          analyticsCookies,
          marketingCookies,
        });
        
        toast.success("Cookie preferences saved successfully", {
          description: "Your preferences have been synced across all your devices.",
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        });
      } catch (error) {
        toast.error("Failed to save preferences", {
          description: "Your local preferences were saved, but we couldn't sync them to your account.",
        });
      }
    } else {
      toast.success("Cookie preferences saved successfully", {
        description: "Your preferences have been updated and will take effect immediately.",
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      });
    }

    setHasChanges(false);

    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleAcceptAll = () => {
    setAnalyticsCookies(true);
    setMarketingCookies(true);
    setHasChanges(true);
  };

  const handleRejectNonEssential = () => {
    setAnalyticsCookies(false);
    setMarketingCookies(false);
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="h-8 w-8 text-[#81e6fe]" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Cookie Settings</h1>
            </div>
            <p className="text-lg text-gray-600">
              Manage your cookie preferences and control how we use cookies on Boptone. Your choices will be saved and applied across all your devices when you're logged in.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={handleAcceptAll} variant="default">
              Accept All Cookies
            </Button>
            <Button onClick={handleRejectNonEssential} variant="outline">
              Reject Non-Essential Cookies
            </Button>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {/* Essential Cookies */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Essential Cookies</CardTitle>
                    <CardDescription className="mt-2">
                      Required for the website to function properly
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Always Active</span>
                    <Switch checked={true} disabled className="opacity-50" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Essential cookies are strictly necessary for the operation of our Service and cannot be disabled. These cookies enable core functionality such as:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>User authentication and login sessions</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance optimization</li>
                  <li>Shopping cart functionality</li>
                  <li>Remembering your privacy preferences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Without essential cookies, our Service would not function properly.
                </p>
              </CardContent>
            </Card>

            {/* Analytics Cookies */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Analytics Cookies</CardTitle>
                    <CardDescription className="mt-2">
                      Help us understand how you use our website
                    </CardDescription>
                  </div>
                  <Switch
                    checked={analyticsCookies}
                    onCheckedChange={handleAnalyticsToggle}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Analytics cookies help us understand how you use our Service so we can improve performance, identify bugs, and enhance user experience. These cookies collect information about:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Pages visited and features used</li>
                  <li>Time spent on different sections</li>
                  <li>Navigation paths and user flows</li>
                  <li>Error messages and performance metrics</li>
                  <li>Device and browser information</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  We use Google Analytics, Mixpanel, and internal analytics tools. You can opt out of analytics cookies without affecting core functionality.
                </p>
                {!analyticsCookies && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Opting out of analytics cookies means we cannot measure how you use our Service, which may result in a less optimized experience over time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marketing Cookies */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Marketing Cookies</CardTitle>
                    <CardDescription className="mt-2">
                      Used for personalized advertising and retargeting
                    </CardDescription>
                  </div>
                  <Switch
                    checked={marketingCookies}
                    onCheckedChange={handleMarketingToggle}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Marketing cookies are used for personalized advertising, retargeting campaigns, social media integration, and measuring advertising effectiveness. These cookies:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Track your activity across websites to show you relevant ads</li>
                  <li>Measure the effectiveness of our marketing campaigns</li>
                  <li>Enable social media sharing and integration</li>
                  <li>Support retargeting campaigns on other platforms</li>
                  <li>Provide insights into audience demographics</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  We use advertising platforms such as Google Ads, Facebook Pixel, and Twitter Ads. You can opt out of marketing cookies without affecting core functionality.
                </p>
                {!marketingCookies && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Opting out of marketing cookies means you will still see ads, but they will be generic and not personalized to your interests. You may see the same ads repeatedly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSavePreferences}
              disabled={!hasChanges}
              size="lg"
              className="min-w-[200px]"
            >
              {hasChanges ? "Save Preferences" : "No Changes"}
            </Button>
          </div>

          {/* Additional Information */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                • Your cookie preferences are saved locally and will persist across browsing sessions
              </li>
              <li>
                • If you're logged in, your preferences will sync across all your devices
              </li>
              <li>
                • You can change your preferences at any time by returning to this page
              </li>
              <li>
                • For more details about specific cookies, visit our{" "}
                <a href="/cookie-policy" className="text-blue-600 hover:underline font-medium">
                  Cookie Policy
                </a>
              </li>
              <li>
                • For general privacy information, see our{" "}
                <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
