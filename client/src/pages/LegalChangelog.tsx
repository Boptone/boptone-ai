import { Link } from "wouter";
import { History } from "lucide-react";

/**
 * Legal Changelog Page - Enterprise-grade legal document change history
 * 
 * Following Microsoft's best practices:
 * - Chronological organization (newest first)
 * - Plain language change descriptions
 * - Links to affected sections
 * - Month/year headers for easy navigation
 * - Transparency focus to build user trust
 */

interface ChangeEntry {
  month: string;
  year: string;
  changes: {
    document: "Terms of Service" | "Privacy Policy" | "Cookie Settings" | "Cookie Policy" | "Legal Hub";
    description: string;
    section?: string;
    sectionUrl?: string;
  }[];
}

const changeHistory: ChangeEntry[] = [
  {
    month: "February",
    year: "2026",
    changes: [
      {
        document: "Privacy Policy",
        description: "Added Standard Contractual Clauses (SCCs) disclosure for international data transfers with supplementary security measures.",
        section: "Section 6.3",
        sectionUrl: "/privacy#international-transfers"
      },
      {
        document: "Privacy Policy",
        description: "Added 72-hour data breach notification timeline with detailed response procedures and user rights (GDPR Article 33 compliance).",
        section: "Section 8.6",
        sectionUrl: "/privacy#data-security"
      },
      {
        document: "Privacy Policy",
        description: "Added Machine Learning and AI Operational Disclosure covering fraud detection, recommendations, content moderation, and user rights for automated decisions.",
        section: "Section 3.8",
        sectionUrl: "/privacy#how-we-use-data"
      },
      {
        document: "Privacy Policy",
        description: "Added Multi-Stakeholder Privacy Structure detailing data collection by user role (artists, fans, buyers, sellers, loan applicants, visitors).",
        section: "Section 2.8",
        sectionUrl: "/privacy#data-we-collect"
      },
      {
        document: "Privacy Policy",
        description: "Added Cookie Consent Management section with granular control options and opt-out procedures.",
        section: "Section 11.6",
        sectionUrl: "/privacy#cookies-tracking"
      },
      {
        document: "Privacy Policy",
        description: "Added Detailed Cookie List with comprehensive table showing cookie name, purpose, category, provider, lifespan, and opt-out options.",
        section: "Section 11.7",
        sectionUrl: "/privacy#cookies-tracking"
      },
      {
        document: "Privacy Policy",
        description: "Updated 'Last Updated' date to February 22, 2026 for consistency across all legal documents.",
        sectionUrl: "/privacy"
      },
      {
        document: "Terms of Service",
        description: "Updated 'Last Updated' date to February 22, 2026 for consistency across all legal documents.",
        sectionUrl: "/terms"
      },
      {
        document: "Cookie Settings",
        description: "Launched interactive cookie management page with real-time toggles for Analytics and Marketing cookies, localStorage persistence, and database sync for logged-in users.",
        sectionUrl: "/cookie-settings"
      },
      {
        document: "Cookie Settings",
        description: "Added privacy@boptone.com contact information for cookie-related questions and concerns.",
        sectionUrl: "/cookie-settings"
      },
      {
        document: "Cookie Policy",
        description: "Launched comprehensive cookie policy page with detailed tables for Essential, Analytics, and Marketing cookies including third-party opt-out links.",
        sectionUrl: "/cookie-policy"
      },
      {
        document: "Cookie Policy",
        description: "Added privacy@boptone.com contact information for cookie policy questions.",
        sectionUrl: "/cookie-policy"
      },
      {
        document: "Legal Hub",
        description: "Launched centralized legal landing page at /legal with all legal documents, descriptions, last updated dates, and key highlights of Boptone's industry-leading protections.",
        sectionUrl: "/legal"
      }
    ]
  }
];

export default function LegalChangelog() {
  return (
    <>
      {/* Header Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-10 h-10 text-[#81e6fe]" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Legal Document Change History
            </h1>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl">
            Track all changes to Boptone's legal documents over time. We're committed to transparency and keeping you informed about how our policies evolve to protect your rights.
          </p>
          <div className="mt-6">
            <Link href="/legal" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              ← Back to Legal Hub
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Change History Timeline */}
            {changeHistory.map((entry, entryIndex) => (
              <section key={entryIndex} className="mb-12">
                {/* Month/Year Header */}
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#81e6fe]">
                  {entry.month} {entry.year}
                </h2>

                {/* Changes List */}
                <div className="space-y-6">
                  {entry.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="pl-6 border-l-4 border-gray-200 hover:border-[#81e6fe] transition-colors">
                      <div className="flex flex-col gap-2">
                        {/* Document Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-[#81e6fe] bg-opacity-20 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                            {change.document}
                          </span>
                          {change.section && (
                            <span className="text-sm text-gray-600 font-medium">
                              {change.section}
                            </span>
                          )}
                        </div>

                        {/* Change Description */}
                        <p className="text-gray-700 leading-relaxed">
                          {change.description}
                        </p>

                        {/* Link to Section */}
                        {change.sectionUrl && (
                          <Link 
                            href={change.sectionUrl}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-sm inline-flex items-center gap-1"
                          >
                            View updated document
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Future Updates Notice */}
            <section className="bg-[#81e6fe] bg-opacity-10 border-2 border-[#81e6fe] rounded-lg p-8 mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Stay Informed About Future Changes
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We will notify you of any material changes to our legal documents through email and prominent notices on our platform. All changes will be documented on this page with clear explanations of what changed and why.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For questions about any changes to our legal documents, contact our legal team at{" "}
                <a 
                  href="mailto:privacy@boptone.com" 
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  privacy@boptone.com
                </a>
              </p>
            </section>

            {/* Quick Links */}
            <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link 
                href="/legal"
                className="bg-white border-2 border-gray-200 hover:border-[#81e6fe] rounded-lg p-6 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Hub</h3>
                <p className="text-gray-700 text-sm">View all legal documents and policies</p>
              </Link>
              <Link 
                href="/privacy"
                className="bg-white border-2 border-gray-200 hover:border-[#81e6fe] rounded-lg p-6 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Policy</h3>
                <p className="text-gray-700 text-sm">Learn how we protect your data</p>
              </Link>
              <Link 
                href="/terms"
                className="bg-white border-2 border-gray-200 hover:border-[#81e6fe] rounded-lg p-6 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Terms of Service</h3>
                <p className="text-gray-700 text-sm">Review our terms and Artist Bill of Rights</p>
              </Link>
              <Link 
                href="/cookie-settings"
                className="bg-white border-2 border-gray-200 hover:border-[#81e6fe] rounded-lg p-6 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cookie Settings</h3>
                <p className="text-gray-700 text-sm">Manage your cookie preferences</p>
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
