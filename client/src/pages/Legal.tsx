import { Helmet } from "react-helmet-async";
import { FileText, Shield, Cookie, Settings } from "lucide-react";

/**
 * Legal Landing Page - Enterprise-grade legal document hub
 * 
 * SEO 2.0 Features:
 * - Structured data (JSON-LD) for legal documents
 * - Semantic HTML5 elements
 * - Comprehensive meta tags
 * - Internal linking structure
 * - Last updated dates for freshness signals
 * - Accessibility (ARIA labels, semantic markup)
 */

interface LegalDocument {
  title: string;
  description: string;
  lastUpdated: string;
  url: string;
  icon: React.ReactNode;
  category: "terms" | "privacy" | "cookies";
}

const legalDocuments: LegalDocument[] = [
  {
    title: "Terms of Service",
    description: "The terms and conditions that govern your use of the Boptone platform, including our unique Artist Bill of Rights that protects your creative sovereignty.",
    lastUpdated: "February 22, 2026",
    url: "/terms",
    icon: <FileText className="w-8 h-8" />,
    category: "terms"
  },
  {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal information. Includes our Data Bill of Rights, AI training prohibition, and enterprise-grade privacy protections.",
    lastUpdated: "February 22, 2026",
    url: "/privacy",
    icon: <Shield className="w-8 h-8" />,
    category: "privacy"
  },
  {
    title: "Cookie Settings",
    description: "Manage your cookie preferences with granular controls for Analytics and Marketing cookies. Your preferences sync across all your devices.",
    lastUpdated: "February 22, 2026",
    url: "/cookie-settings",
    icon: <Settings className="w-8 h-8" />,
    category: "cookies"
  },
  {
    title: "Cookie Policy",
    description: "Detailed information about the cookies we use, including purpose, provider, lifespan, and opt-out options for each cookie category.",
    lastUpdated: "February 22, 2026",
    url: "/cookie-policy",
    icon: <Cookie className="w-8 h-8" />,
    category: "cookies"
  }
];

export default function Legal() {
  // Structured data for SEO 2.0
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Legal Information - Boptone",
    "description": "Comprehensive legal information for Boptone, including Terms of Service, Privacy Policy, and Cookie Policy. Industry-leading protections for independent artists.",
    "url": "https://boptone.com/legal",
    "publisher": {
      "@type": "Organization",
      "name": "Boptone",
      "legalName": "Acid Bird, Inc.",
      "url": "https://boptone.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://boptone.com/logo.png"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Los Angeles",
        "addressRegion": "CA",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "privacy@boptone.com",
        "contactType": "Legal"
      }
    },
    "mainEntity": legalDocuments.map(doc => ({
      "@type": "Article",
      "headline": doc.title,
      "description": doc.description,
      "dateModified": doc.lastUpdated,
      "url": `https://boptone.com${doc.url}`,
      "author": {
        "@type": "Organization",
        "name": "Boptone"
      }
    }))
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Legal Information - Terms, Privacy & Cookie Policy | Boptone</title>
        <meta name="title" content="Legal Information - Terms, Privacy & Cookie Policy | Boptone" />
        <meta name="description" content="Comprehensive legal information for Boptone. Industry-leading Terms of Service with Artist Bill of Rights, enterprise-grade Privacy Policy, and transparent Cookie Policy." />
        <meta name="keywords" content="Boptone legal, terms of service, privacy policy, cookie policy, artist rights, creator platform legal, GDPR compliance, CCPA compliance" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://boptone.com/legal" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://boptone.com/legal" />
        <meta property="og:title" content="Legal Information - Boptone" />
        <meta property="og:description" content="Industry-leading legal protections for independent artists. Terms of Service with Artist Bill of Rights, enterprise-grade Privacy Policy, and transparent Cookie Policy." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="https://boptone.com/legal" />
        <meta property="twitter:title" content="Legal Information - Boptone" />
        <meta property="twitter:description" content="Industry-leading legal protections for independent artists. Terms of Service with Artist Bill of Rights, enterprise-grade Privacy Policy, and transparent Cookie Policy." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Light gray background with smooth scroll */}
      <div className="min-h-screen bg-gray-50 scroll-smooth">
        
        {/* White content container with max-width and padding */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
            
            {/* Header Section */}
            <header className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
                Legal Information
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Boptone is committed to transparency and protecting your rights. Review our legal documents to understand how we operate and safeguard your creative work.
              </p>
            </header>

            {/* Legal Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {legalDocuments.map((doc, index) => (
                <article 
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 text-[#81e6fe]">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {doc.title}
                      </h2>
                      <p className="text-sm text-gray-500 italic">
                        Last updated: {doc.lastUpdated}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {doc.description}
                  </p>

                  {/* Read More Link */}
                  <a
                    href={doc.url}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    aria-label={`Read ${doc.title}`}
                  >
                    Read {doc.title}
                    <svg
                      className="w-4 h-4 ml-1"
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
                  </a>
                </article>
              ))}
            </div>

            {/* Key Highlights Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Boptone's Legal Framework Leads the Industry
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Artist Bill of Rights
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Unique foundational framework that protects your creative sovereignty. You retain 100% ownership of your work, with enforceable rights that cannot be weakened.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    AI Training Prohibition
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your creative works will never be used to train AI models without your separate, explicit, and revocable consent. Industry-leading protection.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Enterprise-Grade Privacy
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    GDPR, CCPA/CPRA, and UK GDPR compliant. Includes Standard Contractual Clauses, 72-hour breach notification, and multi-stakeholder privacy protections.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Algorithm Transparency
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Unprecedented commitment to transparency about how our algorithms affect your visibility, recommendations, and revenue. Human review rights for automated decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Bankruptcy Protection
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    If Boptone enters bankruptcy, your data will be deleted—not sold. Unique protection that ensures your information never becomes an asset in liquidation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    180-Day Amendment Notice
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Industry-leading 180-day advance notice for any changes to core protections, with Artist Policy Council approval and opt-out rights.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-[#81e6fe] bg-opacity-10 border-2 border-[#81e6fe] rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About Our Legal Policies?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We're committed to transparency and clarity. If you have questions about any of our legal documents, our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="mailto:privacy@boptone.com"
                  className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Contact Legal Team
                </a>
                <Link
                  href="/legal/changelog"
                  className="inline-block bg-[#81e6fe] text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-[#6dd5ed] transition-colors"
                >
                  View Change History
                </Link>
                <a
                  href="/cookie-settings"
                  className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold border-2 border-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Manage Cookie Preferences
                </a>
              </div>
            </section>

            {/* Footer Note */}
            <footer className="mt-12 text-center text-sm text-gray-500">
              <p>
                Boptone is operated by Acid Bird, Inc., a California corporation headquartered in Los Angeles, California, United States.
              </p>
              <p className="mt-2">
                All legal documents are effective as of their respective "Last Updated" dates shown above.
              </p>
            </footer>

          </div>
        </div>
      </div>
    </>
  );
}
