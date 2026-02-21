import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";
import { PrivacyAdditions2026 } from "@/components/PrivacyAdditions2026";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <>
    {/* Light gray background with smooth scroll */}
    <div className="min-h-screen bg-gray-50 scroll-smooth">

      {/* White content container with max-width and padding */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 sm:p-12 md:p-16">
          {/* Centered heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-3 text-gray-900">Privacy Policy</h1>
          <p className="text-center text-base italic text-gray-600 mb-8">Last Updated: February 19, 2026</p>
          
          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <a href="#introduction" className="text-blue-600 hover:text-blue-800 hover:underline">1. Introduction</a>
              <a href="#information-we-collect" className="text-blue-600 hover:text-blue-800 hover:underline">2. Information We Collect</a>
              <a href="#how-we-use" className="text-blue-600 hover:text-blue-800 hover:underline">3. How We Use Your Information</a>
              <a href="#legal-basis" className="text-blue-600 hover:text-blue-800 hover:underline">4. Legal Basis (GDPR)</a>
              <a href="#how-we-share" className="text-blue-600 hover:text-blue-800 hover:underline">5. How We Share Information</a>
              <a href="#international-transfers" className="text-blue-600 hover:text-blue-800 hover:underline">6. International Transfers</a>
              <a href="#data-retention" className="text-blue-600 hover:text-blue-800 hover:underline">7. Data Retention</a>
              <a href="#data-security" className="text-blue-600 hover:text-blue-800 hover:underline">8. Data Security</a>
              <a href="#privacy-rights" className="text-blue-600 hover:text-blue-800 hover:underline">9. Your Privacy Rights</a>
              <a href="#childrens-privacy" className="text-blue-600 hover:text-blue-800 hover:underline">10. Children's Privacy</a>
              <a href="#cookies" className="text-blue-600 hover:text-blue-800 hover:underline">11. Cookies & Tracking</a>
              <a href="#gpc" className="text-blue-600 hover:text-blue-800 hover:underline">12. Global Privacy Control</a>
              <a href="#third-party-links" className="text-blue-600 hover:text-blue-800 hover:underline">13. Third-Party Links</a>
              <a href="#changes" className="text-blue-600 hover:text-blue-800 hover:underline">14. Policy Changes</a>
              <a href="#contact" className="text-blue-600 hover:text-blue-800 hover:underline">15. Contact Us</a>
            </div>
          </nav>

          <div className="space-y-8">
              <section id="introduction" className="mb-10 scroll-mt-8">
                <h2 className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0">1. Introduction</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Acid Bird, Inc., doing business as Boptone ("Boptone," "Company," "we," "us," or "our"), is committed to protecting your privacy and personal information. This Privacy Policy describes how we collect, use, disclose, store, and protect your information when you access or use our website, platform, mobile applications, and services (collectively, the "Service").
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Boptone is headquartered in Los Angeles, California, United States. This Privacy Policy is designed to comply with applicable privacy and data protection laws worldwide, including the European Union General Data Protection Regulation ("GDPR"), the California Consumer Privacy Act ("CCPA") as amended by the California Privacy Rights Act ("CPRA"), the UK Data Protection Act 2018, and other relevant data protection regulations.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  By accessing or using our Service, creating an account, or clicking "I Accept," you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and consent to our collection, use, and disclosure of your information as described herein. If you do not agree with this Privacy Policy, you must not access or use our Service.
                </p>
                <p>
                  This Privacy Policy should be read in conjunction with our Terms of Service, which govern your use of the Service. Capitalized terms not defined in this Privacy Policy have the meanings given in our Terms of Service.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">1.1 Data Bill of Rights (Foundational Commitment)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  This Privacy Policy is governed by the <strong>Artist Bill of Rights</strong> (Section 1 of our Terms of Service), which establishes permanent, enforceable protections for your data sovereignty. Key principles:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>You Own Your Data:</strong> All personal data, creative works, and content you provide to Boptone remain your property. We are stewards, not owners.</li>
                  <li><strong>AI Training Prohibition:</strong> Your creative works will never be used to train AI models without your separate, explicit, and revocable consent (see Section 3.1 below).</li>
                  <li><strong>Algorithm Transparency:</strong> You have the right to understand how our algorithms affect your visibility, recommendations, and revenue (see Section 5.10 below).</li>
                  <li><strong>True Portability:</strong> You can export all your data in machine-readable format and delete your account with verified deletion within 90 days (see Section 9 below).</li>
                  <li><strong>Bankruptcy Protection:</strong> Your data will be deleted (not sold) if Boptone enters bankruptcy (see Section 5.11 below).</li>
                  <li><strong>Human Review Rights:</strong> Automated decisions affecting your livelihood trigger mandatory human review (see Section 10 below).</li>
                  <li><strong>Do Not Track Support:</strong> We honor browser Do Not Track signals (see Section 11.5 below).</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  These foundational commitments are permanent and cannot be weakened through unilateral changes to this Privacy Policy. Any amendment to these protections requires 180 days' advance notice, Artist Policy Council approval, and opt-out rights. See Section 19 of our Terms of Service for the amendment process.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="information-we-collect" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">2. Information We Collect</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We collect several types of information from and about users of our Service. The specific information we collect depends on how you interact with our Service and the features you use.
                </p>
                
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">2.1 Information You Provide Directly</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We collect information that you voluntarily provide to us when you register for an account, use our Service, communicate with us, or otherwise interact with our platform. This information includes:
                </p>
                <p className="mb-2">
                  <strong>Account Registration Information:</strong> When you create an account, we collect your full name, email address, username, password (encrypted), artist or stage name, genre(s), geographic location, phone number (optional), profile photo, biography, social media links, and any other information you choose to provide in your profile.
                </p>
                <p className="mb-2">
                  <strong>User Content:</strong> We collect all content you upload, create, submit, post, publish, transmit, or make available through the Service, including music files, audio recordings, video content, artwork, images, photographs, lyrics, metadata, descriptions, comments, messages, and any other creative works or materials ("User Content").
                </p>
                <p className="mb-2">
                  <strong>Financial and Payment Information:</strong> When you subscribe to paid services, make purchases through BopShop, stream music via BopAudio, send or receive Kick-in tips, or apply for micro-loans, we collect the following financial information:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Payment Card Data:</strong> Card number, expiration date, CVV code, and cardholder name (processed and stored securely by our PCI-DSS compliant payment processor Stripe—we do not store complete card numbers on our servers)</li>
                  <li><strong>Bank Account Information:</strong> Account number, routing number, account holder name, and bank name for payout processing</li>
                  <li><strong>Billing Information:</strong> Billing address, postal code, country, and phone number</li>
                  <li><strong>Tax Identification:</strong> Social Security Number (SSN), Employer Identification Number (EIN), Tax Identification Number (TIN), VAT ID, or other government-issued tax identifiers required for tax reporting and compliance</li>
                  <li><strong>Transaction History:</strong> Purchase records, payment amounts, transaction dates, currency, payment method used, refund history, chargeback data, and payout records</li>
                  <li><strong>Revenue and Royalty Data:</strong> Streaming revenue, merchandise sales, tip income, royalty earnings from third-party platforms, and revenue forecasts</li>
                  <li><strong>Identity Verification Documents:</strong> Government-issued photo ID (passport, driver's license, national ID card), proof of address (utility bills, bank statements), and selfie photos for identity verification required by anti-money laundering (AML) and know-your-customer (KYC) regulations</li>
                  <li><strong>Credit and Financial History:</strong> Credit scores, credit reports, financial statements, income verification, and loan repayment history (collected only when you apply for micro-loans)</li>
                  <li><strong>Fraud Detection Data:</strong> Device fingerprints, IP addresses, transaction velocity patterns, geolocation data, and behavioral biometrics used to detect and prevent fraudulent transactions</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>PCI-DSS Compliance:</strong> We comply with the Payment Card Industry Data Security Standard (PCI-DSS) by using Stripe, a PCI-DSS Level 1 certified payment processor, to handle all payment card data. We do not store complete payment card numbers, CVV codes, or magnetic stripe data on our servers. All payment card data is encrypted in transit using TLS 1.2 or higher and at rest using AES-256 encryption.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Kick-in Tips Data:</strong> When you send or receive tips through Kick-in, we collect the tip amount, currency, sender name (or "Anonymous" if the sender chooses anonymity), optional message, transaction timestamp, and recipient artist ID. We track cumulative tip totals to provide tax threshold notifications to artists and enforce velocity limits to prevent money laundering.
                </p>
                <p className="mb-2">
                  <strong>Communications:</strong> When you contact us via email, support tickets, chat, or other communication channels, we collect the contents of your messages, attachments, contact information, and any other information you choose to provide.
                </p>
                <p className="mb-2">
                  <strong>Survey and Feedback Data:</strong> When you participate in surveys, provide feedback, or respond to questionnaires, we collect your responses, opinions, ratings, and any other information you provide.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Third-Party Account Credentials:</strong> When you connect third-party services to your Boptone account (such as Instagram, TikTok, or other social platforms), you authorize us to access and collect information from those accounts, including follower counts, engagement metrics, content performance data, and other information made available through those platforms' APIs.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">2.2 Information We Collect Automatically</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  When you access or use our Service, we automatically collect certain information about your device, browsing actions, and usage patterns through cookies, web beacons, log files, and similar tracking technologies. This information includes:
                </p>
                <p className="mb-2">
                  <strong>Device and Browser Information:</strong> Internet Protocol (IP) address, browser type and version, browser language, device type and model, operating system and version, screen resolution, unique device identifiers, mobile network information, and device settings.
                </p>
                <p className="mb-2">
                  <strong>Usage and Activity Data:</strong> Pages and features accessed, time and date of access, time spent on pages, links clicked, search queries entered, navigation paths, referral sources, exit pages, scroll depth, mouse movements, keystroke patterns, and interaction with Service elements.
                </p>
                <p className="mb-2">
                  <strong>Location Information:</strong> Approximate geographic location derived from your IP address, and precise geolocation data if you grant permission through your device settings. We use location data to provide localized content, analyze regional trends, match you with local opportunities, and comply with regional regulations.
                </p>
                <p className="mb-2">
                  <strong>Performance and Diagnostic Data:</strong> Error logs, crash reports, system performance metrics, API response times, feature usage statistics, loading times, and technical diagnostic information used to monitor, maintain, and improve the Service.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Cookies and Similar Technologies:</strong> We use cookies (small text files stored on your device), web beacons (transparent graphic images), local storage, session storage, and similar tracking technologies to recognize you, remember your preferences, authenticate your sessions, analyze usage patterns, and deliver targeted content. For detailed information about our use of cookies, please see Section 11 below.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">2.3 Information from Third-Party Sources</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We receive information about you from third-party sources, which we combine with information we collect directly from you. These third-party sources include:
                </p>
                <p className="mb-2">
                  <strong>Social Media Platforms:</strong> Instagram, TikTok, Twitter/X, Facebook, YouTube, and other social networks provide us with follower counts, engagement rates, post performance, audience demographics, growth trends, and content analytics when you connect these accounts.
                </p>
                <p className="mb-2">
                  <strong>Payment Processors:</strong> Stripe, PayPal, and other payment service providers share transaction data, payment status, refund information, chargeback data, and fraud detection signals.
                </p>
                <p className="mb-2">
                  <strong>Analytics and Data Providers:</strong> Google Analytics, Mixpanel, Amplitude, and similar services provide aggregated usage statistics, user behavior patterns, conversion data, and demographic insights.
                </p>
                <p className="mb-2">
                  <strong>Data Enrichment Services:</strong> We may obtain publicly available information from data brokers, social media platforms, public databases, and other sources to enhance artist profiles, verify identities, assess creditworthiness for loans, and provide more accurate recommendations.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Healthcare Providers:</strong> When you enroll in healthcare plans through our Service, healthcare partners provide enrollment status, coverage information, claims data, and wellness program participation (subject to HIPAA compliance where applicable).
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">2.4 Sensitive Personal Information</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  In certain circumstances, we may collect sensitive personal information, including financial account credentials, precise geolocation data, health information (for healthcare enrollment), government-issued identification numbers (for tax compliance and loan underwriting), and biometric data (for voice analysis in IP protection). We collect sensitive information only with your explicit consent and process it in accordance with applicable laws. You have the right to limit our use of sensitive personal information as described in Section 9 below.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">2.5 AI Chat and AI-Powered Features</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  When you use our AI-powered features, including the AI Chat service, we collect and process the following information:
                </p>
                <p className="mb-2">
                  <strong>Chat Inputs and Outputs:</strong> All messages, questions, and prompts you submit to the AI Chat, along with the AI-generated responses. This data is collected to provide the service, improve AI model accuracy, and enhance user experience.
                </p>
                <p className="mb-2">
                  <strong>Conversation Metadata:</strong> Timestamps, conversation duration, session identifiers, and interaction patterns. We use this data to monitor service performance, detect abuse, and improve the AI system.
                </p>
                <p className="mb-2">
                  <strong>User Identification (Optional):</strong> For logged-in users, we may associate AI Chat conversations with your account to provide personalized responses and maintain conversation history. For anonymous users, we collect only session-level data without linking it to a specific account.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Training and Improvement:</strong> Your AI Chat interactions may be used to train, test, and improve our AI models and services. We implement safeguards to remove personally identifiable information before using data for model training. You can opt out of having your data used for AI training by contacting us at hello@boptone.com.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Third-Party AI Providers:</strong> We use third-party AI service providers (such as OpenAI, Anthropic, or similar) to power our AI features. Your inputs and the AI's responses may be processed by these providers in accordance with their privacy policies. We select providers that maintain strong data protection standards and do not use customer data to train their general models without explicit consent.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Data Retention for AI Features:</strong> AI Chat conversations are retained for up to 90 days for service improvement and abuse prevention. After 90 days, conversations are either deleted or anonymized for long-term analysis. Logged-in users can delete their AI Chat history at any time through account settings.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="how-we-use" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">3. How We Use Your Information</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use the information we collect for various business and operational purposes. The specific purposes depend on how you interact with our Service and the features you use. Our uses of your information include:
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.1 AI Training Prohibition (Core Commitment)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  In accordance with Article III of the Artist Bill of Rights (Section 1 of our Terms of Service), your creative works will <strong>never</strong> be used to train artificial intelligence models, machine learning systems, or algorithmic tools without your separate, explicit, and revocable consent.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>What This Means:</strong> We will not incorporate your music, videos, artwork, lyrics, or other creative works into datasets used to teach AI models to generate new creative works. We will not sell, license, or provide your works to third-party AI companies (OpenAI, Google, Meta, Anthropic, etc.) for training purposes. We will not use your works to train internal AI models that generate music, videos, or other creative content.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>What We CAN Do:</strong> This prohibition does not prevent us from: (1) Analyzing your performance metrics to provide recommendations; (2) Detecting copyright infringement using audio fingerprinting; (3) Forecasting revenue using predictive analytics; (4) Optimizing marketing campaigns based on engagement data; (5) Generating social media captions or promotional copy; (6) Analyzing audio quality for mastering suggestions; (7) Detecting fraud patterns; (8) Personalizing your user experience; (9) Any other analysis that serves your interests and does not result in your work being incorporated into AI models sold or licensed to third parties.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Consent Mechanism:</strong> If we ever wish to use your works for AI training purposes, we will request your separate, explicit, written consent for each work, explain exactly how your work will be used, disclose whether the AI model will be sold or licensed, compensate you fairly (not a token payment), and allow you to withdraw consent at any time with immediate effect. See Section 9.5 of our Terms of Service for full details.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Third-Party Prohibition:</strong> We contractually prohibit our service providers, partners, and contractors from using your creative works for AI training. If a third party requests access to your work for AI training, we will notify you immediately and decline the request unless you affirmatively consent.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.2 Service Delivery and Account Management</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use your information to create and manage your account, authenticate your identity, process your subscription payments, deliver the features and functionality you request, provide customer support and respond to your inquiries, send transactional emails and notifications about your account, process your transactions and fulfill your orders, manage your subscriptions and billing, and maintain the security and integrity of your account.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.2 Platform Features and Functionality</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use your information to operate our core platform features, including distributing your music to streaming platforms and distribution partners, tracking royalties across all revenue sources, processing micro-loan applications and managing loan repayments, operating your direct-to-fan merchandise store, detecting copyright infringement and protecting your intellectual property through intelligent monitoring systems, managing tour planning and venue bookings, facilitating healthcare plan enrollment and benefits administration, providing comprehensive analytics dashboards, and enabling all other features described in our Terms of Service.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.3 Data Analysis and Platform Intelligence</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use advanced data analysis systems to analyze your data and provide intelligent features, including career optimization recommendations based on your performance metrics, trend forecasting to identify emerging opportunities, contract analysis to help you understand agreements, marketing tools to optimize your promotional campaigns, content generation for social media posts and promotional materials, infringement detection using audio fingerprinting and pattern recognition, predictive analytics for revenue forecasting and growth projections, risk assessment for micro-loan underwriting, personalized recommendations for collaborations and opportunities, and smart decision-making for certain platform features (with human oversight for significant decisions affecting your rights).
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.4 Personalization and Improvement</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use your information to personalize your experience by customizing content and recommendations based on your preferences and behavior, tailoring the user interface to your usage patterns, providing relevant opportunities and connections, analyzing usage patterns to understand how users interact with our Service, developing new features and improving existing functionality, conducting research and analytics to enhance platform performance, testing new features and optimizations, identifying and fixing bugs and technical issues, and optimizing platform speed, reliability, and user experience.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.5 Security, Fraud Prevention, and Legal Compliance</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use your information to detect, prevent, and investigate fraud, unauthorized access, and security threats, enforce our Terms of Service and other policies, verify user identities and prevent account abuse, monitor for suspicious activity and automated bot behavior, protect our rights, property, and safety and those of our users, resolve disputes and enforce our agreements, conduct internal audits and quality assurance, maintain records for legal purposes, and defend against legal claims and litigation.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.6 Marketing and Communications</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  With your consent (where required by law), we use your information to send promotional emails and newsletters about new features and services, provide updates about platform enhancements and industry news, conduct surveys and gather feedback to improve our Service, display targeted advertisements based on your interests and behavior, promote our Service through social media and other channels, analyze the effectiveness of our marketing campaigns, and create aggregated, anonymized data for marketing research. You may opt out of marketing communications at any time by following the unsubscribe instructions in our emails or adjusting your account settings.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">3.7 Business Operations</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use your information for general business operations, including financial reporting and accounting, business planning and strategy development, mergers, acquisitions, and corporate transactions, investor relations and due diligence, internal training and quality assurance, and any other purposes disclosed to you at the time of collection or with your consent.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="legal-basis" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">4. Legal Basis for Processing (GDPR)</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data only when we have a valid legal basis under the GDPR. Our legal bases for processing include:
                </p>
                <p className="mb-2">
                  <strong>Consent:</strong> You have given clear, affirmative consent for us to process your personal data for specific purposes, such as marketing communications, connecting third-party accounts, or using certain AI features. You have the right to withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.
                </p>
                <p className="mb-2">
                  <strong>Contract Performance:</strong> Processing is necessary to fulfill our contractual obligations to you under our Terms of Service, including providing the Service features you have subscribed to, processing your payments, delivering your content to distribution partners, and managing your account.
                </p>
                <p className="mb-2">
                  <strong>Legal Obligation:</strong> Processing is required to comply with applicable laws, regulations, legal processes, or enforceable governmental requests, such as tax reporting, anti-money laundering requirements, copyright law compliance, and responses to lawful requests from authorities.
                </p>
                <p className="mb-2">
                  <strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests or those of a third party, provided your fundamental rights and freedoms do not override those interests. Our legitimate interests include operating and improving our Service, ensuring security and preventing fraud, analyzing usage patterns, conducting research and development, marketing our Service, and protecting our legal rights.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Vital Interests:</strong> Processing is necessary to protect your vital interests or those of another person, such as in emergency situations or to prevent serious harm.
                </p>
                <p>
                  When we rely on legitimate interests as a legal basis, we conduct a balancing test to ensure that our interests do not override your rights and freedoms. You have the right to object to processing based on legitimate interests as described in Section 9 below.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="how-we-share" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">5. How We Share Your Information</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We share your information with third parties only in the circumstances described below. We do not sell your personal information to third parties for their direct marketing purposes without your explicit consent.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.1 Service Providers and Business Partners</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We share your information with third-party service providers who perform services on our behalf, including cloud hosting providers (AWS, Google Cloud) for data storage and infrastructure, payment processors (Stripe, PayPal) for transaction processing, email service providers (SendGrid, Mailgun) for transactional and marketing emails, analytics providers (Google Analytics, Mixpanel) for usage analysis, customer support platforms (Zendesk, Intercom) for support ticket management, content delivery networks for fast global content delivery, security and fraud prevention services, data backup and disaster recovery providers, and other vendors who assist in operating our Service. These service providers are contractually obligated to use your information only as necessary to provide services to us and are prohibited from using your information for their own purposes.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Stripe Connect Data Sharing:</strong> When you create a seller account to receive payments through BopShop, BopAudio, or Kick-in, we share your information with Stripe, Inc. via Stripe Connect to facilitate direct payment routing from customers to your connected Stripe account. The information shared with Stripe includes your name, email address, business name (if applicable), bank account information (account number, routing number), tax identification numbers (SSN, EIN, TIN, VAT ID), government-issued identification documents for identity verification, date of birth, billing address, and transaction data (payment amounts, dates, customer information). Stripe uses this information to verify your identity, comply with anti-money laundering (AML) and know-your-customer (KYC) regulations, process payments, detect fraud, and provide tax reporting. Stripe's use of your information is governed by their Privacy Policy and Connected Account Agreement. You can review Stripe's privacy practices at <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://stripe.com/privacy</a>.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.2 Distribution and Integration Partners</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  When you use our distribution features, we share your User Content and metadata with social media platforms (Instagram, TikTok, Twitter/X, Facebook, YouTube) when you connect these accounts, and other platforms and services you choose to integrate with your account. These partners have their own privacy policies governing their use of your information.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.3 Healthcare Providers</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  When you enroll in healthcare plans through our Service, we share necessary information with healthcare insurance providers, benefits administrators, wellness program providers, and medical service providers to facilitate enrollment, coverage, and claims processing. Healthcare information is protected under HIPAA (Health Insurance Portability and Accountability Act) where applicable, and we ensure that healthcare partners comply with applicable privacy laws.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.4 Financial Institutions</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  For micro-loan services, we share financial information with lending partners, credit reporting agencies for creditworthiness assessment, fraud detection services, and payment processors to facilitate loan origination, underwriting, servicing, and repayment.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.5 Legal and Regulatory Authorities</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We may disclose your information only when absolutely necessary to enforce our Terms of Service and other agreements, to protect our rights, property, and safety and those of our users and the public, to detect, prevent, or investigate fraud and security breaches, in connection with legal proceedings or disputes, and to comply with copyright law, including DMCA takedown notices and counter-notices. We prioritize protecting your privacy and will challenge any requests for your data that we believe are overbroad or unjustified.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Law Enforcement and Government Requests:</strong> We may disclose your information to law enforcement agencies, government authorities, regulatory bodies, or courts when we are legally required to do so, including:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Valid Court Orders:</strong> When we receive a valid subpoena, court order, search warrant, or other legal process issued by a court of competent jurisdiction, we will comply with the order to the extent required by law.</li>
                  <li><strong>National Security Requests:</strong> When we receive a valid National Security Letter (NSL), Foreign Intelligence Surveillance Act (FISA) order, or other national security request authorized under U.S. law, we will comply to the extent required by law. We will seek to narrow the scope of such requests and will notify affected users unless legally prohibited from doing so.</li>
                  <li><strong>Emergency Situations:</strong> When we have a good faith belief that disclosure is necessary to prevent imminent harm to life, safety, or property, we may disclose information to law enforcement or emergency services without a court order. Examples include credible threats of violence, suicide prevention, child endangerment, or active criminal activity.</li>
                  <li><strong>Tax and Financial Reporting:</strong> We are required to report certain financial information to tax authorities, including IRS Form 1099-K for payment transactions exceeding $600 annually, and to comply with anti-money laundering (AML) and know-your-customer (KYC) regulations enforced by FinCEN and other financial regulators.</li>
                  <li><strong>Copyright Enforcement:</strong> We may disclose information to copyright owners or their authorized representatives in response to valid DMCA subpoenas or court orders related to copyright infringement claims.</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Transparency and User Notification:</strong> Whenever legally permissible, we will:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li>Notify affected users before disclosing their information to law enforcement or government authorities</li>
                  <li>Provide users with a copy of the legal request (subpoena, court order, etc.) so they can seek legal counsel and challenge the request if desired</li>
                  <li>Challenge overbroad or legally deficient requests for user data</li>
                  <li>Publish a Transparency Report annually disclosing the number and types of government requests we receive</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Limitations on Disclosure:</strong> We will only disclose the minimum information necessary to comply with a legal request. We will not provide blanket access to our databases or systems. We will not voluntarily share user data with law enforcement without a valid legal process, except in emergency situations as described above.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>International Requests:</strong> For requests from non-U.S. law enforcement or government authorities, we require that the request be made through established mutual legal assistance treaty (MLAT) procedures or other internationally recognized legal processes. We will not comply with direct requests from foreign governments unless required by applicable law or treaty obligations.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.6 Business Transfers</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  If we are involved in a merger, acquisition, asset sale, bankruptcy, reorganization, or similar corporate transaction, your information may be transferred to the acquiring entity or successor organization. We will provide notice before your information is transferred and becomes subject to a different privacy policy. You will have the opportunity to delete your account before the transfer if you do not wish your information to be transferred.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.7 Public Information</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Certain information you provide may be publicly visible, including your artist profile (name, bio, photo, genre, location), User Content you choose to make public, streaming statistics and performance metrics you elect to display publicly, and any other information you explicitly choose to share publicly through the Service. Please be aware that any information you make public can be viewed, collected, and used by others and may be indexed by search engines.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.8 Aggregated and Anonymized Data</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We may share aggregated, anonymized, or de-identified data that cannot reasonably be used to identify you with third parties for research, analytics, marketing, industry reports, and other purposes. This data does not constitute personal information under applicable privacy laws.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.9 With Your Consent</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We may share your information with third parties when you provide explicit consent for specific sharing purposes, such as featuring your success story in our marketing materials or participating in co-marketing campaigns with partners.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.10 Algorithm Transparency (Core Commitment)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Your Right to Explanation:</strong> You have the right to understand how our algorithms affect your visibility, recommendations, and revenue. We commit to providing transparency into algorithmic decisions that impact your livelihood.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>What We Disclose:</strong>
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Recommendation Algorithms:</strong> We will publish plain-language explanations of how our recommendation systems work, including the factors that influence which content is shown to users (e.g., listening history, genre preferences, engagement metrics, recency).</li>
                  <li><strong>Search Ranking:</strong> We will explain how search results are ranked and what factors influence your position in search results (e.g., relevance, popularity, metadata quality, user engagement).</li>
                  <li><strong>Revenue Allocation:</strong> We will provide clear documentation of how revenue is calculated and allocated, including platform fees, payment processing fees, tax calculations, and any algorithmic adjustments.</li>
                  <li><strong>Content Moderation:</strong> We will disclose the criteria used by automated content moderation systems to flag or remove content, and provide human review rights for disputed decisions.</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Individual Explanations:</strong> Upon request, we will provide you with a personalized explanation of how algorithmic decisions have affected your account, including why specific content was or was not recommended, why your account was flagged for review, or how your revenue was calculated for a specific period.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>No Shadow Bans:</strong> We do not engage in "shadow banning" or secretly limiting your reach without notification. If your content is restricted or your account is subject to limitations, you will receive explicit notification with an explanation and appeal process.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Algorithm Audits:</strong> We commit to conducting annual independent audits of our algorithms to identify and mitigate bias, discrimination, or unfair outcomes. Audit results will be published in summary form to the Artist Policy Council.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">5.11 Bankruptcy Protection (Core Commitment)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Your Data Will Not Be Sold:</strong> In the event that Boptone, Acid Bird, Inc., or any successor entity enters bankruptcy, receivership, or similar insolvency proceedings, your personal data and User Content will be deleted, not sold as a corporate asset.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Segregated Data Architecture:</strong> We maintain a technical architecture that allows for rapid deletion of user data independently from business-critical systems. Your data is logically segregated to enable deletion without disrupting ongoing business operations or creditor claims.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Deletion Timeline:</strong> Within thirty (30) days of any bankruptcy filing, we will:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li>Notify all users via email of the bankruptcy filing and their data deletion rights</li>
                  <li>Provide a 90-day window for users to export their data via our data portability tools</li>
                  <li>Automatically delete all user personal data and User Content after the 90-day export window closes</li>
                  <li>Provide written confirmation of deletion to any user who requests it</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Bankruptcy Court Notification:</strong> We will file a motion with the bankruptcy court explicitly excluding user personal data and User Content from the bankruptcy estate and requesting court approval for deletion. We will oppose any creditor or trustee attempts to claim user data as a corporate asset.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Financial Data Exception:</strong> Transaction records, payment history, and tax-related data may be retained as required by law for accounting, tax compliance, and creditor claims, but will be anonymized to remove personally identifiable information where legally permissible.
                </p>
                <p>
                  <strong>Enforcement:</strong> This commitment is enforceable under the Artist Bill of Rights (Section 1 of our Terms of Service) and provides a private right of action for users to seek injunctive relief to prevent sale of their data in bankruptcy proceedings.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="international-transfers" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">6. International Data Transfers</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Boptone is based in the United States, and our servers and service providers are located in the United States and other countries. If you access our Service from outside the United States, your information will be transferred to, stored in, and processed in the United States and other countries where data protection laws may differ from those in your jurisdiction.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  For users in the European Economic Area (EEA), United Kingdom, and Switzerland, we comply with applicable legal requirements for international data transfers. We implement appropriate safeguards to protect your personal data, including Standard Contractual Clauses approved by the European Commission, adequacy decisions recognizing certain countries as providing adequate data protection, and other legally recognized transfer mechanisms. We also require our service providers to implement appropriate technical and organizational measures to protect your data.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  By using our Service, you acknowledge and consent to the transfer of your information to the United States and other countries for the purposes described in this Privacy Policy. If you do not consent to such transfers, you should not use our Service.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="data-retention" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">7. Data Retention</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The specific retention period depends on the type of information and the purposes for which we use it.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Account Information:</strong> We retain your account information for as long as your account is active. If you close your account, we will delete or anonymize your personal information within ninety (90) days, except as required for legal, regulatory, or legitimate business purposes.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>User Content:</strong> We retain your User Content for as long as your account is active or as needed to provide the Service. If you delete specific User Content, we will remove it from active systems within thirty (30) days, though copies may persist in backup systems for up to ninety (90) days.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Transaction Records:</strong> We retain financial transaction records, payment information, and tax-related data for at least seven (7) years to comply with tax laws, accounting requirements, and anti-money laundering regulations.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Communications:</strong> We retain customer support communications, emails, and chat logs for three (3) years for quality assurance, training, and dispute resolution purposes.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Usage Data and Logs:</strong> We retain usage data, log files, and analytics data for up to two (2) years for security, fraud prevention, and service improvement purposes.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Legal and Compliance Data:</strong> We retain information necessary to comply with legal obligations, resolve disputes, enforce our agreements, and defend against legal claims for as long as required by applicable law or until the relevant statute of limitations expires.
                </p>
                <p>
                  After the applicable retention period, we will securely delete or anonymize your information so that it can no longer be associated with you. In some cases, we may retain anonymized or aggregated data indefinitely for research, analytics, and business purposes.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="data-security" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">8. Data Security</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We implement industry-standard technical, administrative, and physical security measures designed to protect your information from unauthorized access, disclosure, alteration, and destruction. Our security measures include:
                </p>
                <p className="mb-2">
                  <strong>Encryption:</strong> We use TLS/SSL encryption for data in transit between your device and our servers. Sensitive data at rest, including passwords and payment information, is encrypted using AES-256 encryption or equivalent standards.
                </p>
                <p className="mb-2">
                  <strong>Access Controls:</strong> We implement role-based access controls, multi-factor authentication for employee access, and the principle of least privilege to ensure that only authorized personnel can access your information on a need-to-know basis.
                </p>
                <p className="mb-2">
                  <strong>Network Security:</strong> We use firewalls, intrusion detection and prevention systems, DDoS protection, and regular security monitoring to protect our infrastructure from external threats.
                </p>
                <p className="mb-2">
                  <strong>Secure Development:</strong> We follow secure coding practices, conduct regular code reviews, perform security testing and vulnerability assessments, and maintain a responsible disclosure program for security researchers.
                </p>
                <p className="mb-2">
                  <strong>Employee Training:</strong> We provide regular security awareness training to our employees and require them to sign confidentiality agreements.
                </p>
                <p className="mb-2">
                  <strong>Third-Party Audits:</strong> We engage independent security firms to conduct periodic security audits and penetration testing of our systems.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Incident Response:</strong> We maintain an incident response plan to quickly detect, respond to, and recover from security incidents.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Despite our security measures, no method of transmission over the Internet or electronic storage is one hundred percent (100%) secure. We cannot guarantee absolute security of your information. If you have reason to believe that your account credentials have been compromised or that your information has been accessed without authorization, you must immediately notify us at hello@boptone.com.
                </p>
                <p>
                  In the event of a data breach that affects your personal information, we will notify you and applicable regulatory authorities in accordance with applicable data breach notification laws, including GDPR requirements (within 72 hours of discovery) and California breach notification laws (without unreasonable delay).
                </p>
              </section>

              <section className="mb-10">
                <h2 id="privacy-rights" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">9. Your Privacy Rights</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Depending on your location and applicable laws, you may have certain rights regarding your personal information. This section describes your rights and how to exercise them.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">9.1 Rights Under GDPR (EEA, UK, Switzerland)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  If you are located in the European Economic Area, United Kingdom, or Switzerland, you have the following rights under the GDPR:
                </p>
                <p className="mb-2">
                  <strong>Right of Access:</strong> You have the right to obtain confirmation of whether we process your personal data and to request a copy of your personal data in a structured, commonly used, and machine-readable format.
                </p>
                <p className="mb-2">
                  <strong>Right to Rectification:</strong> You have the right to request correction of inaccurate or incomplete personal data we hold about you.
                </p>
                <p className="mb-2">
                  <strong>Right to Erasure ("Right to be Forgotten"):</strong> You have the right to request deletion of your personal data in certain circumstances, including when the data is no longer necessary for the purposes for which it was collected, you withdraw consent, you object to processing, or the data was unlawfully processed.
                </p>
                <p className="mb-2">
                  <strong>Right to Restriction of Processing:</strong> You have the right to request that we restrict processing of your personal data in certain circumstances, such as when you contest the accuracy of the data or object to processing.
                </p>
                <p className="mb-2">
                  <strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used, and machine-readable format and to transmit that data to another controller without hindrance.
                </p>
                <p className="mb-2">
                  <strong>Right to Object:</strong> You have the right to object to processing of your personal data based on legitimate interests or for direct marketing purposes. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests, rights, and freedoms.
                </p>
                <p className="mb-2">
                  <strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you have the right to withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority in your jurisdiction if you believe our processing of your personal data violates applicable law.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">9.2 Rights Under CCPA/CPRA (California)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA):
                </p>
                <p className="mb-2">
                  <strong>Right to Know:</strong> You have the right to request that we disclose the categories and specific pieces of personal information we have collected about you, the categories of sources from which we collected the information, the business or commercial purposes for collecting the information, and the categories of third parties with whom we share the information.
                </p>
                <p className="mb-2">
                  <strong>Right to Delete:</strong> You have the right to request deletion of your personal information, subject to certain exceptions (e.g., to complete transactions, detect security incidents, comply with legal obligations, or exercise free speech rights).
                </p>
                <p className="mb-2">
                  <strong>Right to Correct:</strong> You have the right to request correction of inaccurate personal information we maintain about you.
                </p>
                <p className="mb-2">
                  <strong>Right to Opt-Out of Sale or Sharing:</strong> You have the right to opt out of the "sale" or "sharing" of your personal information as defined by the CCPA. We do not sell personal information in the traditional sense, but certain data sharing for targeted advertising may constitute "sharing" under the CCPA. You can opt out by adjusting your cookie preferences or contacting us.
                </p>
                <p className="mb-2">
                  <strong>Right to Limit Use of Sensitive Personal Information:</strong> You have the right to limit our use and disclosure of sensitive personal information to purposes necessary to provide the Service and for other permitted purposes under the CPRA.
                </p>
                <p className="mb-2">
                  <strong>Right to Non-Discrimination:</strong> You have the right not to receive discriminatory treatment for exercising your CCPA/CPRA rights. We will not deny you goods or services, charge different prices, provide a different level of quality, or suggest that you will receive different treatment for exercising your rights.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Authorized Agent:</strong> You may designate an authorized agent to make requests on your behalf. We may require proof of authorization and verification of your identity before processing requests made by authorized agents.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">9.3 How to Exercise Your Rights</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  To exercise any of the rights described above, you can:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Account Settings:</strong> Visit your Profile Settings page to download your data (Right to Data Portability) or delete your account (Right to Erasure). These self-service tools allow you to exercise your rights immediately without contacting support.</li>
                  <li><strong>Email Request:</strong> Contact us at hello@boptone.com with the subject line "Privacy Rights Request" for other privacy rights or if you need assistance.</li>
                  <li><strong>Cookie Preferences:</strong> Manage your cookie consent settings through the cookie banner or in your Profile Settings to control analytics and marketing cookies.</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We will respond to your request within the timeframes required by applicable law (typically thirty (30) days for GDPR requests and forty-five (45) days for CCPA requests, with possible extensions).
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  To protect your privacy and security, we will verify your identity before processing your request. Verification may require you to provide your email address, account information, or other identifying details. For requests to access or delete sensitive information, we may require additional verification steps.
                </p>
                <p>
                  You may exercise these rights free of charge. However, if your requests are manifestly unfounded, excessive, or repetitive, we may charge a reasonable fee or refuse to act on the request.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="childrens-privacy" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">10. Children's Privacy</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Our Service is not directed to children under the age of thirteen (13) years, and we do not knowingly collect personal information from children under 13. If you are under 13 years old, you may not use the Service or provide any information to us. If you are between 13 and 18 years old (or the age of majority in your jurisdiction), you may only use the Service under the supervision of a parent or legal guardian who agrees to be bound by our Terms of Service and this Privacy Policy.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  If we learn that we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information as quickly as possible. If you believe we have collected information from a child under 13, please contact us immediately at hello@boptone.com.
                </p>
                <p>
                  For users in the European Union, our Service is not directed to children under 16 years old, consistent with GDPR requirements. If you are under 16 and located in the EU, you may not use the Service without parental or guardian consent.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="cookies" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">11. Cookies and Tracking Technologies</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We use cookies, web beacons, pixels, local storage, and similar tracking technologies to collect information about your browsing activities and to provide, maintain, and improve our Service. This section provides detailed information about our use of these technologies.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">11.1 What Are Cookies?</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Cookies are small text files that are placed on your device when you visit a website. Cookies allow the website to recognize your device and remember information about your visit, such as your preferences, login status, and browsing history. Web beacons (also called pixels or clear GIFs) are tiny graphics with unique identifiers that track user activity and measure website performance.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">11.2 Types of Cookies We Use</h3>
                <p className="mb-2">
                  <strong>Strictly Necessary Cookies:</strong> These cookies are essential for the Service to function properly. They enable core functionality such as user authentication, security, network management, and accessibility. You cannot opt out of these cookies without severely limiting your ability to use the Service.
                </p>
                <p className="mb-2">
                  <strong>Performance and Analytics Cookies:</strong> These cookies collect information about how you use the Service, such as which pages you visit, how long you spend on each page, and which links you click. We use this information to analyze usage patterns, improve our Service, and fix technical issues. Examples include Google Analytics and Mixpanel.
                </p>
                <p className="mb-2">
                  <strong>Functional Cookies:</strong> These cookies remember your preferences and choices (such as language, region, or theme) to provide a more personalized experience. They may also be used to provide features you have requested, such as video playback or social media integration.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Targeting and Advertising Cookies:</strong> These cookies track your browsing activity across websites to build a profile of your interests and show you relevant advertisements. They may be set by us or by third-party advertising partners. We use these cookies to measure the effectiveness of our marketing campaigns and to display targeted ads on third-party websites.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">11.3 Third-Party Cookies</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We allow certain third parties to place cookies on your device through our Service for analytics, advertising, and other purposes. These third parties include Google Analytics (analytics), Facebook Pixel (advertising), Stripe (payment processing), and other service providers. These third parties have their own privacy policies governing their use of cookies and your information.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">11.4 Managing Cookies</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Cookie Consent Banner:</strong> When you first visit Boptone, you will see a cookie consent banner that allows you to accept all cookies, accept only necessary cookies, or customize your preferences. You can manage your cookie preferences at any time through your Profile Settings page.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Granular Cookie Controls:</strong> Our cookie consent system provides granular controls for three categories of cookies:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Necessary Cookies:</strong> Always active (required for site functionality)</li>
                  <li><strong>Analytics Cookies:</strong> Optional (help us improve the Service)</li>
                  <li><strong>Marketing Cookies:</strong> Optional (enable targeted advertising)</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Browser Settings:</strong> You can also control cookies through your browser settings. Most browsers allow you to block or delete cookies, or to receive a warning before a cookie is stored. However, if you block or delete cookies, some features of the Service may not function properly.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Opt-Out of Interest-Based Advertising:</strong> You can opt out of interest-based advertising by visiting the Digital Advertising Alliance opt-out page at www.aboutads.info/choices or the Network Advertising Initiative opt-out page at www.networkadvertising.org/choices.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  For more information about cookies and how to manage them, visit www.allaboutcookies.org.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 mt-6">11.5 Do Not Track Support (Core Commitment)</h3>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>We Honor Do Not Track Signals:</strong> Unlike most platforms, Boptone respects browser Do Not Track (DNT) signals. When your browser sends a DNT signal, we will disable all non-essential tracking technologies, including analytics cookies, marketing cookies, and third-party advertising pixels.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>What DNT Means on Boptone:</strong> When DNT is enabled, we will:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Disable Analytics:</strong> We will not collect usage data via Google Analytics, Mixpanel, or similar analytics platforms. Your browsing behavior on Boptone will not be tracked or analyzed.</li>
                  <li><strong>Disable Marketing Pixels:</strong> We will not load Facebook Pixel, Google Ads conversion tracking, or other advertising technologies that track you across websites.</li>
                  <li><strong>Block Third-Party Trackers:</strong> We will prevent third-party cookies and tracking scripts from loading on Boptone pages, except those strictly necessary for payment processing or security.</li>
                  <li><strong>Maintain Functionality:</strong> Necessary cookies required for authentication, security, and core site functionality will continue to work. Your ability to use Boptone will not be impaired.</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>How to Enable DNT:</strong> You can enable Do Not Track in your browser settings:
                </p>
                <ul className="list-disc pl-7 space-y-3 mb-5 text-gray-700">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data → "Send a 'Do Not Track' request with your browsing traffic"</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → "Send websites a 'Do Not Track' signal"</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → "Ask websites not to track me"</li>
                  <li><strong>Edge:</strong> Settings → Privacy, search, and services → "Send 'Do Not Track' requests"</li>
                </ul>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>DNT Status Indicator:</strong> When DNT is active, you will see a privacy indicator in your Profile Settings confirming that tracking is disabled. You can verify that DNT is working by checking your browser's developer tools (Network tab) to confirm that analytics and marketing scripts are not loading.
                </p>
                <p>
                  <strong>Why We Support DNT:</strong> Most platforms ignore DNT signals because there is "no uniform standard." We reject this excuse. DNT is a clear expression of user intent, and respecting it is fundamental to our commitment to data sovereignty. This commitment is enforceable under the Artist Bill of Rights (Section 1 of our Terms of Service).
                </p>
              </section>

              <section className="mb-10">
                <h2 id="gpc" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">12. Global Privacy Control (GPC)</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  In addition to Do Not Track (DNT), we also honor Global Privacy Control (GPC) signals. GPC is a newer privacy standard that allows you to opt out of the sale or sharing of your personal information across all websites you visit. When your browser sends a GPC signal, we will treat it as a legally binding request to opt out of data sales and sharing under applicable privacy laws (CCPA, GDPR, etc.).
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>How to Enable GPC:</strong> GPC is supported by privacy-focused browsers like Brave, Firefox (with Privacy Badger extension), and DuckDuckGo. You can also install the Global Privacy Control browser extension from globalprivacycontrol.org.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="third-party-links" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">13. Third-Party Links and Services</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  Our Service contains links to third-party websites, applications, and services that are not owned or controlled by Boptone, including streaming platforms, social media networks, payment processors, and other integrated services. This Privacy Policy applies only to information collected by Boptone. We are not responsible for the privacy practices of third-party websites or services.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  When you click on a third-party link or connect a third-party account, you will be subject to that third party's privacy policy and terms of service. We encourage you to read the privacy policies of any third-party websites or services you visit or use.
                </p>
                <p>
                  We are not liable for any damage or loss caused by your use of or reliance on third-party websites or services, or by the collection, use, or disclosure of your information by third parties.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="changes" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">14. Changes to This Privacy Policy</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the "Effective Date" at the top of this Privacy Policy and post the revised version on our website.
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  If we make material changes that significantly affect your rights or how we use your information, we will provide additional notice by sending you an email to the address associated with your account, displaying a prominent notice on our Service, or using other reasonable means. We encourage you to review this Privacy Policy periodically to stay informed about our privacy practices.
                </p>
                <p>
                  Your continued use of the Service after the effective date of a revised Privacy Policy constitutes your acceptance of the changes. If you do not agree to the revised Privacy Policy, you must stop using the Service and close your account.
                </p>
              </section>

              <section className="mb-10">
                <h2 id="contact" className="text-3xl font-bold mb-5 text-gray-900 mt-12 first:mt-0 scroll-mt-8">15. Contact Us</h2>
                <p className="mb-2">
                  If you have any questions, concerns, or complaints about this Privacy Policy or our privacy practices, or if you wish to exercise your privacy rights, please contact us at:
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  <strong>Acid Bird, Inc.</strong><br />
                  Attn: Privacy Officer<br />
                  Email: hello@boptone.com<br />
                  Website: www.boptone.com
                </p>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  We will respond to your inquiry within a reasonable timeframe, typically within thirty (30) days for general inquiries and within the timeframes required by applicable law for privacy rights requests.
                </p>
                <p className="mb-2">
                  <strong>For EEA, UK, and Switzerland Users:</strong> If you are not satisfied with our response to your privacy inquiry or complaint, you have the right to lodge a complaint with your local data protection authority. Contact information for EU data protection authorities is available at https://edpb.europa.eu/about-edpb/board/members_en.
                </p>
                <p>
                  <strong>For California Users:</strong> California residents may contact us with privacy inquiries at hello@boptone.com or through the California Attorney General's Office at https://oag.ca.gov/contact/consumer-complaint-against-business-or-company.
                </p>
              </section>

              {/* New Sections: Shipping, SEO/GEO, AI Agent Data Collection (February 2026) */}
              <PrivacyAdditions2026 />

              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  By using Boptone, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  © 2026 Acid Bird, Inc. All rights reserved.
                </p>
              </div>
          </div>
        </div>
      </div>
      <ToneyChatbot />
    </div>
    </>
  );
}
