import { Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <>
    {/* Light gray background with smooth scroll - matches TOS/Privacy pages */}
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* White content container with max-width and padding - matches TOS/Privacy pages */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 sm:p-12 md:p-16">
          {/* Centered heading - matches TOS/Privacy pages */}
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-3 text-gray-900">Cookie Policy</h1>
          <p className="text-center text-base italic text-gray-600 mb-8">Last Updated: February 22, 2026</p>
          
          <p className="mb-5 text-gray-700 leading-relaxed">
            This Cookie Policy provides a comprehensive list of all cookies used on the Boptone platform. We maintain this list to ensure full transparency about how we collect and use information through cookies and similar tracking technologies.
          </p>

          {/* Quick Links */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Quick Links</h2>
            <ul className="space-y-2 text-gray-700">
              <li>
                • Manage your cookie preferences at{" "}
                <a href="/cookie-settings" className="text-blue-600 hover:underline font-medium">
                  Cookie Settings
                </a>
              </li>
              <li>
                • Read our full{" "}
                <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                  Privacy Policy
                </a>
              </li>
              <li>
                • Learn about{" "}
                <a href="/privacy#cookies" className="text-blue-600 hover:underline font-medium">
                  Cookies & Tracking Technologies
                </a>
              </li>
            </ul>
          </div>

          {/* Essential Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Essential Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Essential cookies are strictly necessary for the website to function and cannot be disabled. These cookies do not store any personally identifiable information.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Purpose</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Provider</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Lifespan</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Opt-out</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">boptone_session</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Maintains user authentication state and session security</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Boptone</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Session (expires when browser closes)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Not available</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">csrf_token</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Prevents cross-site request forgery attacks</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Boptone</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Session</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Not available</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">boptone_cookie_preferences</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Stores your cookie consent preferences</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Boptone</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Not available</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">load_balancer</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Routes requests to appropriate server for optimal performance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Boptone</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Session</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Not available</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">cart_session</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Maintains shopping cart state in BopShop</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Boptone</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">7 days</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Not available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Analytics Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Analytics cookies help us understand how visitors use our website. You can opt out of these cookies in your{" "}
              <a href="/cookie-settings" className="text-blue-600 hover:underline font-medium">
                Cookie Settings
              </a>
              .
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Purpose</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Provider</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Lifespan</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Opt-out</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">_ga</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Distinguishes unique users and tracks website usage</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Google Analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">2 years</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">_ga_*</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Stores and counts pageviews for Google Analytics 4</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Google Analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">2 years</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">_gid</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Distinguishes users for short-term analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Google Analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">24 hours</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">_gat</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Throttles request rate to Google Analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Google Analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 minute</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">mp_*</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Tracks user behavior and feature usage (Mixpanel)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Mixpanel</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">boptone_analytics</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Internal analytics for feature usage and performance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Boptone</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">90 days</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Third-Party Opt-Out:</strong> You can also opt out of Google Analytics by installing the{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>
            </div>
          </section>

          {/* Marketing Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Marketing Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Marketing cookies track your browsing activity to show you personalized ads. You can opt out of these cookies in your{" "}
              <a href="/cookie-settings" className="text-blue-600 hover:underline font-medium">
                Cookie Settings
              </a>
              .
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Purpose</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Provider</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Lifespan</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Opt-out</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">_fbp</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Tracks visits across websites for Facebook advertising</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Facebook Pixel</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">3 months</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">fr</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Delivers and measures effectiveness of Facebook ads</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Facebook</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">3 months</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">IDE</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Tracks ad impressions and interactions for Google Ads</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Google Ads</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">test_cookie</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Tests whether browser accepts cookies for advertising</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Google Ads</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">15 minutes</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">personalization_id</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Tracks user activity for Twitter advertising</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Twitter Ads</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">2 years</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <a href="/cookie-settings" className="text-blue-600 hover:underline">Cookie Settings</a>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">__stripe_mid</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Fraud prevention and analytics for Stripe payments</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Stripe</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Required for payments</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Industry Opt-Out Tools:</strong> You can opt out of interest-based advertising from multiple advertising networks through these industry tools:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Network Advertising Initiative (NAI) Opt-Out
                  </a>
                </li>
                <li>
                  <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Digital Advertising Alliance (DAA) Opt-Out
                  </a>
                </li>
                <li>
                  <a href="https://youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    European Interactive Digital Advertising Alliance (EDAA) Opt-Out
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Additional Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cookie Lifespan Explained</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Session cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
                  <li><strong>Persistent cookies:</strong> Remain on your device for a specified period (shown in the Lifespan column)</li>
                  <li><strong>First-party cookies:</strong> Set by Boptone directly</li>
                  <li><strong>Third-party cookies:</strong> Set by external services we use (Google, Facebook, Stripe, etc.)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser Cookie Controls</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete cookies after each browsing session</li>
                  <li>Receive a warning before a cookie is stored</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  However, blocking essential cookies will prevent you from using certain features of our Service. For more information about managing cookies in your browser, visit{" "}
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    www.allaboutcookies.org
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Do Not Track & Global Privacy Control</h3>
                <p className="text-gray-700 leading-relaxed">
                  Boptone honors Do Not Track (DNT) browser signals and Global Privacy Control (GPC) signals. When these signals are enabled, we will not use analytics or marketing cookies, and we will not share your data with third-party advertising networks. Learn more in our{" "}
                  <a href="/privacy#cookies" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Updates to This Cookie Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  We update this cookie list regularly as we add or remove cookies. The "Last Updated" date at the top of this page indicates when the policy was last revised. We recommend checking this page periodically for any changes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about our use of cookies, please contact us at{" "}
                  <a href="mailto:privacy@boptone.com" className="text-blue-600 hover:underline">
                    privacy@boptone.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="p-6 bg-[#81e6fe] bg-opacity-10 border border-[#81e6fe] rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Manage Your Cookie Preferences</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have full control over which cookies we use. Visit our Cookie Settings page to customize your preferences.
            </p>
            <a
              href="/cookie-settings"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Cookie Settings
            </a>
          </div>

          {/* Contact Information */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              Questions about this Cookie Policy or our cookie practices? Contact us at{" "}
              <a href="mailto:privacy@boptone.com" className="text-blue-600 hover:underline font-medium">
                privacy@boptone.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
