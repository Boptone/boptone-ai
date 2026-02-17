import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="border-4 border-black rounded-none">
          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Effective Date: January 1, 2026</p>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Acid Bird, Inc., doing business as Boptone ("Boptone," "Company," "we," "us," or "our"), is committed to protecting your privacy and personal information. This Privacy Policy describes how we collect, use, disclose, store, and protect your information when you access or use our website, platform, mobile applications, and services (collectively, the "Service").
                </p>
                <p className="mb-4">
                  Boptone is headquartered in Los Angeles, California, United States. This Privacy Policy is designed to comply with applicable privacy and data protection laws worldwide, including the European Union General Data Protection Regulation ("GDPR"), the California Consumer Privacy Act ("CCPA") as amended by the California Privacy Rights Act ("CPRA"), the UK Data Protection Act 2018, and other relevant data protection regulations.
                </p>
                <p className="mb-4">
                  By accessing or using our Service, creating an account, or clicking "I Accept," you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and consent to our collection, use, and disclosure of your information as described herein. If you do not agree with this Privacy Policy, you must not access or use our Service.
                </p>
                <p>
                  This Privacy Policy should be read in conjunction with our Terms of Service, which govern your use of the Service. Capitalized terms not defined in this Privacy Policy have the meanings given in our Terms of Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <p className="mb-4">
                  We collect several types of information from and about users of our Service. The specific information we collect depends on how you interact with our Service and the features you use.
                </p>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide Directly</h3>
                <p className="mb-4">
                  We collect information that you voluntarily provide to us when you register for an account, use our Service, communicate with us, or otherwise interact with our platform. This information includes:
                </p>
                <p className="mb-2">
                  <strong>Account Registration Information:</strong> When you create an account, we collect your full name, email address, username, password (encrypted), artist or stage name, genre(s), geographic location, phone number (optional), profile photo, biography, social media links, and any other information you choose to provide in your profile.
                </p>
                <p className="mb-2">
                  <strong>User Content:</strong> We collect all content you upload, create, submit, post, publish, transmit, or make available through the Service, including music files, audio recordings, video content, artwork, images, photographs, lyrics, metadata, descriptions, comments, messages, and any other creative works or materials ("User Content").
                </p>
                <p className="mb-2">
                  <strong>Financial and Payment Information:</strong> When you subscribe to paid services, make purchases, or apply for micro-loans, we collect payment card information (processed securely by our third-party payment processor Stripe), billing address, tax identification numbers, bank account information for payouts, royalty data, revenue information, financial statements, and credit history for loan underwriting.
                </p>
                <p className="mb-2">
                  <strong>Communications:</strong> When you contact us via email, support tickets, chat, or other communication channels, we collect the contents of your messages, attachments, contact information, and any other information you choose to provide.
                </p>
                <p className="mb-2">
                  <strong>Survey and Feedback Data:</strong> When you participate in surveys, provide feedback, or respond to questionnaires, we collect your responses, opinions, ratings, and any other information you provide.
                </p>
                <p className="mb-4">
                  <strong>Third-Party Account Credentials:</strong> When you connect third-party services to your Boptone account (such as Instagram, TikTok, or other social platforms), you authorize us to access and collect information from those accounts, including follower counts, engagement metrics, content performance data, and other information made available through those platforms' APIs.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Information We Collect Automatically</h3>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Cookies and Similar Technologies:</strong> We use cookies (small text files stored on your device), web beacons (transparent graphic images), local storage, session storage, and similar tracking technologies to recognize you, remember your preferences, authenticate your sessions, analyze usage patterns, and deliver targeted content. For detailed information about our use of cookies, please see Section 11 below.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Information from Third-Party Sources</h3>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Healthcare Providers:</strong> When you enroll in healthcare plans through our Service, healthcare partners provide enrollment status, coverage information, claims data, and wellness program participation (subject to HIPAA compliance where applicable).
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Sensitive Personal Information</h3>
                <p className="mb-4">
                  In certain circumstances, we may collect sensitive personal information, including financial account credentials, precise geolocation data, health information (for healthcare enrollment), government-issued identification numbers (for tax compliance and loan underwriting), and biometric data (for voice analysis in IP protection). We collect sensitive information only with your explicit consent and process it in accordance with applicable laws. You have the right to limit our use of sensitive personal information as described in Section 9 below.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.5 AI Chat and AI-Powered Features</h3>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Training and Improvement:</strong> Your AI Chat interactions may be used to train, test, and improve our AI models and services. We implement safeguards to remove personally identifiable information before using data for model training. You can opt out of having your data used for AI training by contacting us at hello@boptone.com.
                </p>
                <p className="mb-4">
                  <strong>Third-Party AI Providers:</strong> We use third-party AI service providers (such as OpenAI, Anthropic, or similar) to power our AI features. Your inputs and the AI's responses may be processed by these providers in accordance with their privacy policies. We select providers that maintain strong data protection standards and do not use customer data to train their general models without explicit consent.
                </p>
                <p className="mb-4">
                  <strong>Data Retention for AI Features:</strong> AI Chat conversations are retained for up to 90 days for service improvement and abuse prevention. After 90 days, conversations are either deleted or anonymized for long-term analysis. Logged-in users can delete their AI Chat history at any time through account settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect for various business and operational purposes. The specific purposes depend on how you interact with our Service and the features you use. Our uses of your information include:
                </p>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Service Delivery and Account Management</h3>
                <p className="mb-4">
                  We use your information to create and manage your account, authenticate your identity, process your subscription payments, deliver the features and functionality you request, provide customer support and respond to your inquiries, send transactional emails and notifications about your account, process your transactions and fulfill your orders, manage your subscriptions and billing, and maintain the security and integrity of your account.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Platform Features and Functionality</h3>
                <p className="mb-4">
                  We use your information to operate our core platform features, including distributing your music to streaming platforms and distribution partners, tracking royalties across all revenue sources, processing micro-loan applications and managing loan repayments, operating your direct-to-fan merchandise store, detecting copyright infringement and protecting your intellectual property through intelligent monitoring systems, managing tour planning and venue bookings, facilitating healthcare plan enrollment and benefits administration, providing comprehensive analytics dashboards, and enabling all other features described in our Terms of Service.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Data Analysis and Platform Intelligence</h3>
                <p className="mb-4">
                  We use advanced data analysis systems to analyze your data and provide intelligent features, including career optimization recommendations based on your performance metrics, trend forecasting to identify emerging opportunities, contract analysis to help you understand agreements, marketing tools to optimize your promotional campaigns, content generation for social media posts and promotional materials, infringement detection using audio fingerprinting and pattern recognition, predictive analytics for revenue forecasting and growth projections, risk assessment for micro-loan underwriting, personalized recommendations for collaborations and opportunities, and smart decision-making for certain platform features (with human oversight for significant decisions affecting your rights).
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Personalization and Improvement</h3>
                <p className="mb-4">
                  We use your information to personalize your experience by customizing content and recommendations based on your preferences and behavior, tailoring the user interface to your usage patterns, providing relevant opportunities and connections, analyzing usage patterns to understand how users interact with our Service, developing new features and improving existing functionality, conducting research and analytics to enhance platform performance, testing new features and optimizations, identifying and fixing bugs and technical issues, and optimizing platform speed, reliability, and user experience.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.5 Security, Fraud Prevention, and Legal Compliance</h3>
                <p className="mb-4">
                  We use your information to detect, prevent, and investigate fraud, unauthorized access, and security threats, enforce our Terms of Service and other policies, verify user identities and prevent account abuse, monitor for suspicious activity and automated bot behavior, protect our rights, property, and safety and those of our users, comply with legal obligations, court orders, and government requests, respond to lawful requests from law enforcement, resolve disputes and enforce our agreements, conduct internal audits and quality assurance, maintain records for legal and regulatory purposes, and defend against legal claims and litigation.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.6 Marketing and Communications</h3>
                <p className="mb-4">
                  With your consent (where required by law), we use your information to send promotional emails and newsletters about new features and services, provide updates about platform enhancements and industry news, conduct surveys and gather feedback to improve our Service, display targeted advertisements based on your interests and behavior, promote our Service through social media and other channels, analyze the effectiveness of our marketing campaigns, and create aggregated, anonymized data for marketing research. You may opt out of marketing communications at any time by following the unsubscribe instructions in our emails or adjusting your account settings.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.7 Business Operations</h3>
                <p className="mb-4">
                  We use your information for general business operations, including financial reporting and accounting, business planning and strategy development, mergers, acquisitions, and corporate transactions, investor relations and due diligence, internal training and quality assurance, and any other purposes disclosed to you at the time of collection or with your consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing (GDPR)</h2>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Vital Interests:</strong> Processing is necessary to protect your vital interests or those of another person, such as in emergency situations or to prevent serious harm.
                </p>
                <p>
                  When we rely on legitimate interests as a legal basis, we conduct a balancing test to ensure that our interests do not override your rights and freedoms. You have the right to object to processing based on legitimate interests as described in Section 9 below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. How We Share Your Information</h2>
                <p className="mb-4">
                  We share your information with third parties only in the circumstances described below. We do not sell your personal information to third parties for their direct marketing purposes without your explicit consent.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Service Providers and Business Partners</h3>
                <p className="mb-4">
                  We share your information with third-party service providers who perform services on our behalf, including cloud hosting providers (AWS, Google Cloud) for data storage and infrastructure, payment processors (Stripe, PayPal) for transaction processing, email service providers (SendGrid, Mailgun) for transactional and marketing emails, analytics providers (Google Analytics, Mixpanel) for usage analysis, customer support platforms (Zendesk, Intercom) for support ticket management, content delivery networks for fast global content delivery, security and fraud prevention services, data backup and disaster recovery providers, and other vendors who assist in operating our Service. These service providers are contractually obligated to use your information only as necessary to provide services to us and are prohibited from using your information for their own purposes.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Distribution and Integration Partners</h3>
                <p className="mb-4">
                  When you use our distribution features, we share your User Content and metadata with social media platforms (Instagram, TikTok, Twitter/X, Facebook, YouTube) when you connect these accounts, and other platforms and services you choose to integrate with your account. These partners have their own privacy policies governing their use of your information.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Healthcare Providers</h3>
                <p className="mb-4">
                  When you enroll in healthcare plans through our Service, we share necessary information with healthcare insurance providers, benefits administrators, wellness program providers, and medical service providers to facilitate enrollment, coverage, and claims processing. Healthcare information is protected under HIPAA (Health Insurance Portability and Accountability Act) where applicable, and we ensure that healthcare partners comply with applicable privacy laws.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Financial Institutions</h3>
                <p className="mb-4">
                  For micro-loan services, we share financial information with lending partners, credit reporting agencies for creditworthiness assessment, fraud detection services, and payment processors to facilitate loan origination, underwriting, servicing, and repayment.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.5 Legal and Regulatory Authorities</h3>
                <p className="mb-4">
                  We may disclose your information to law enforcement agencies, government officials, regulatory authorities, and courts when required by law, legal process, or government request, to enforce our Terms of Service and other agreements, to protect our rights, property, and safety and those of our users and the public, to detect, prevent, or investigate fraud, security breaches, or illegal activity, in connection with legal proceedings, investigations, or disputes, and to comply with copyright law, including DMCA takedown notices and counter-notices.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.6 Business Transfers</h3>
                <p className="mb-4">
                  If we are involved in a merger, acquisition, asset sale, bankruptcy, reorganization, or similar corporate transaction, your information may be transferred to the acquiring entity or successor organization. We will provide notice before your information is transferred and becomes subject to a different privacy policy. You will have the opportunity to delete your account before the transfer if you do not wish your information to be transferred.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.7 Public Information</h3>
                <p className="mb-4">
                  Certain information you provide may be publicly visible, including your artist profile (name, bio, photo, genre, location), User Content you choose to make public, streaming statistics and performance metrics you elect to display publicly, and any other information you explicitly choose to share publicly through the Service. Please be aware that any information you make public can be viewed, collected, and used by others and may be indexed by search engines.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.8 Aggregated and Anonymized Data</h3>
                <p className="mb-4">
                  We may share aggregated, anonymized, or de-identified data that cannot reasonably be used to identify you with third parties for research, analytics, marketing, industry reports, and other purposes. This data does not constitute personal information under applicable privacy laws.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.9 With Your Consent</h3>
                <p>
                  We may share your information with third parties when you provide explicit consent for specific sharing purposes, such as featuring your success story in our marketing materials or participating in co-marketing campaigns with partners.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
                <p className="mb-4">
                  Boptone is based in the United States, and our servers and service providers are located in the United States and other countries. If you access our Service from outside the United States, your information will be transferred to, stored in, and processed in the United States and other countries where data protection laws may differ from those in your jurisdiction.
                </p>
                <p className="mb-4">
                  For users in the European Economic Area (EEA), United Kingdom, and Switzerland, we comply with applicable legal requirements for international data transfers. We implement appropriate safeguards to protect your personal data, including Standard Contractual Clauses approved by the European Commission, adequacy decisions recognizing certain countries as providing adequate data protection, and other legally recognized transfer mechanisms. We also require our service providers to implement appropriate technical and organizational measures to protect your data.
                </p>
                <p className="mb-4">
                  By using our Service, you acknowledge and consent to the transfer of your information to the United States and other countries for the purposes described in this Privacy Policy. If you do not consent to such transfers, you should not use our Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The specific retention period depends on the type of information and the purposes for which we use it.
                </p>
                <p className="mb-4">
                  <strong>Account Information:</strong> We retain your account information for as long as your account is active. If you close your account, we will delete or anonymize your personal information within ninety (90) days, except as required for legal, regulatory, or legitimate business purposes.
                </p>
                <p className="mb-4">
                  <strong>User Content:</strong> We retain your User Content for as long as your account is active or as needed to provide the Service. If you delete specific User Content, we will remove it from active systems within thirty (30) days, though copies may persist in backup systems for up to ninety (90) days.
                </p>
                <p className="mb-4">
                  <strong>Transaction Records:</strong> We retain financial transaction records, payment information, and tax-related data for at least seven (7) years to comply with tax laws, accounting requirements, and anti-money laundering regulations.
                </p>
                <p className="mb-4">
                  <strong>Communications:</strong> We retain customer support communications, emails, and chat logs for three (3) years for quality assurance, training, and dispute resolution purposes.
                </p>
                <p className="mb-4">
                  <strong>Usage Data and Logs:</strong> We retain usage data, log files, and analytics data for up to two (2) years for security, fraud prevention, and service improvement purposes.
                </p>
                <p className="mb-4">
                  <strong>Legal and Compliance Data:</strong> We retain information necessary to comply with legal obligations, resolve disputes, enforce our agreements, and defend against legal claims for as long as required by applicable law or until the relevant statute of limitations expires.
                </p>
                <p>
                  After the applicable retention period, we will securely delete or anonymize your information so that it can no longer be associated with you. In some cases, we may retain anonymized or aggregated data indefinitely for research, analytics, and business purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Incident Response:</strong> We maintain an incident response plan to quickly detect, respond to, and recover from security incidents.
                </p>
                <p className="mb-4">
                  Despite our security measures, no method of transmission over the Internet or electronic storage is one hundred percent (100%) secure. We cannot guarantee absolute security of your information. If you have reason to believe that your account credentials have been compromised or that your information has been accessed without authorization, you must immediately notify us at hello@boptone.com.
                </p>
                <p>
                  In the event of a data breach that affects your personal information, we will notify you and applicable regulatory authorities in accordance with applicable data breach notification laws, including GDPR requirements (within 72 hours of discovery) and California breach notification laws (without unreasonable delay).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Your Privacy Rights</h2>
                <p className="mb-4">
                  Depending on your location and applicable laws, you may have certain rights regarding your personal information. This section describes your rights and how to exercise them.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Rights Under GDPR (EEA, UK, Switzerland)</h3>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority in your jurisdiction if you believe our processing of your personal data violates applicable law.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Rights Under CCPA/CPRA (California)</h3>
                <p className="mb-4">
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
                <p className="mb-4">
                  <strong>Authorized Agent:</strong> You may designate an authorized agent to make requests on your behalf. We may require proof of authorization and verification of your identity before processing requests made by authorized agents.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.3 How to Exercise Your Rights</h3>
                <p className="mb-4">
                  To exercise any of the rights described above, please contact us at hello@boptone.com with the subject line "Privacy Rights Request" or through your account settings where applicable. We will respond to your request within the timeframes required by applicable law (typically thirty (30) days for GDPR requests and forty-five (45) days for CCPA requests, with possible extensions).
                </p>
                <p className="mb-4">
                  To protect your privacy and security, we will verify your identity before processing your request. Verification may require you to provide your email address, account information, or other identifying details. For requests to access or delete sensitive information, we may require additional verification steps.
                </p>
                <p>
                  You may exercise these rights free of charge. However, if your requests are manifestly unfounded, excessive, or repetitive, we may charge a reasonable fee or refuse to act on the request.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                <p className="mb-4">
                  Our Service is not directed to children under the age of thirteen (13) years, and we do not knowingly collect personal information from children under 13. If you are under 13 years old, you may not use the Service or provide any information to us. If you are between 13 and 18 years old (or the age of majority in your jurisdiction), you may only use the Service under the supervision of a parent or legal guardian who agrees to be bound by our Terms of Service and this Privacy Policy.
                </p>
                <p className="mb-4">
                  If we learn that we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information as quickly as possible. If you believe we have collected information from a child under 13, please contact us immediately at hello@boptone.com.
                </p>
                <p>
                  For users in the European Union, our Service is not directed to children under 16 years old, consistent with GDPR requirements. If you are under 16 and located in the EU, you may not use the Service without parental or guardian consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  We use cookies, web beacons, pixels, local storage, and similar tracking technologies to collect information about your browsing activities and to provide, maintain, and improve our Service. This section provides detailed information about our use of these technologies.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.1 What Are Cookies?</h3>
                <p className="mb-4">
                  Cookies are small text files that are placed on your device when you visit a website. Cookies allow the website to recognize your device and remember information about your visit, such as your preferences, login status, and browsing history. Web beacons (also called pixels or clear GIFs) are tiny graphics with unique identifiers that track user activity and measure website performance.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.2 Types of Cookies We Use</h3>
                <p className="mb-2">
                  <strong>Strictly Necessary Cookies:</strong> These cookies are essential for the Service to function properly. They enable core functionality such as user authentication, security, network management, and accessibility. You cannot opt out of these cookies without severely limiting your ability to use the Service.
                </p>
                <p className="mb-2">
                  <strong>Performance and Analytics Cookies:</strong> These cookies collect information about how you use the Service, such as which pages you visit, how long you spend on each page, and which links you click. We use this information to analyze usage patterns, improve our Service, and fix technical issues. Examples include Google Analytics and Mixpanel.
                </p>
                <p className="mb-2">
                  <strong>Functional Cookies:</strong> These cookies remember your preferences and choices (such as language, region, or theme) to provide a more personalized experience. They may also be used to provide features you have requested, such as video playback or social media integration.
                </p>
                <p className="mb-4">
                  <strong>Targeting and Advertising Cookies:</strong> These cookies track your browsing activity across websites to build a profile of your interests and show you relevant advertisements. They may be set by us or by third-party advertising partners. We use these cookies to measure the effectiveness of our marketing campaigns and to display targeted ads on third-party websites.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.3 Third-Party Cookies</h3>
                <p className="mb-4">
                  We allow certain third parties to place cookies on your device through our Service for analytics, advertising, and other purposes. These third parties include Google Analytics (analytics), Facebook Pixel (advertising), Stripe (payment processing), and other service providers. These third parties have their own privacy policies governing their use of cookies and your information.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.4 Managing Cookies</h3>
                <p className="mb-4">
                  You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies, or to receive a warning before a cookie is stored. However, if you block or delete cookies, some features of the Service may not function properly. You can also opt out of interest-based advertising by visiting the Digital Advertising Alliance opt-out page at www.aboutads.info/choices or the Network Advertising Initiative opt-out page at www.networkadvertising.org/choices.
                </p>
                <p>
                  For more information about cookies and how to manage them, visit www.allaboutcookies.org.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Do Not Track Signals</h2>
                <p className="mb-4">
                  Some web browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want to have your online activity tracked. Because there is no uniform standard for recognizing and implementing DNT signals, we do not currently respond to DNT browser signals. However, you can manage cookies and tracking technologies through your browser settings and opt-out mechanisms as described in Section 11 above.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Third-Party Links and Services</h2>
                <p className="mb-4">
                  Our Service contains links to third-party websites, applications, and services that are not owned or controlled by Boptone, including streaming platforms, social media networks, payment processors, and other integrated services. This Privacy Policy applies only to information collected by Boptone. We are not responsible for the privacy practices of third-party websites or services.
                </p>
                <p className="mb-4">
                  When you click on a third-party link or connect a third-party account, you will be subject to that third party's privacy policy and terms of service. We encourage you to read the privacy policies of any third-party websites or services you visit or use.
                </p>
                <p>
                  We are not liable for any damage or loss caused by your use of or reliance on third-party websites or services, or by the collection, use, or disclosure of your information by third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the "Effective Date" at the top of this Privacy Policy and post the revised version on our website.
                </p>
                <p className="mb-4">
                  If we make material changes that significantly affect your rights or how we use your information, we will provide additional notice by sending you an email to the address associated with your account, displaying a prominent notice on our Service, or using other reasonable means. We encourage you to review this Privacy Policy periodically to stay informed about our privacy practices.
                </p>
                <p>
                  Your continued use of the Service after the effective date of a revised Privacy Policy constitutes your acceptance of the changes. If you do not agree to the revised Privacy Policy, you must stop using the Service and close your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
                <p className="mb-2">
                  If you have any questions, concerns, or complaints about this Privacy Policy or our privacy practices, or if you wish to exercise your privacy rights, please contact us at:
                </p>
                <p className="mb-4">
                  <strong>Acid Bird, Inc.</strong><br />
                  Attn: Privacy Officer<br />
                  Email: hello@boptone.com<br />
                  Website: www.boptone.com
                </p>
                <p className="mb-4">
                  We will respond to your inquiry within a reasonable timeframe, typically within thirty (30) days for general inquiries and within the timeframes required by applicable law for privacy rights requests.
                </p>
                <p className="mb-2">
                  <strong>For EEA, UK, and Switzerland Users:</strong> If you are not satisfied with our response to your privacy inquiry or complaint, you have the right to lodge a complaint with your local data protection authority. Contact information for EU data protection authorities is available at https://edpb.europa.eu/about-edpb/board/members_en.
                </p>
                <p>
                  <strong>For California Users:</strong> California residents may contact us with privacy inquiries at hello@boptone.com or through the California Attorney General's Office at https://oag.ca.gov/contact/consumer-complaint-against-business-or-company.
                </p>
              </section>

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
      </div>
      <ToneyChatbot />
    </div>
  );
}
