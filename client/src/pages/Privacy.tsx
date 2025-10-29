import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Boptone</h1>
                <p className="text-xs text-muted-foreground">Own Your Tone</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last Updated: October 29, 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Acid Bird, Inc. ("Boptone," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with our platform (collectively, the "Service").
                </p>
                <p className="mb-4">
                  This Privacy Policy applies to all users of our Service, regardless of location. We are headquartered in Los Angeles, California, United States, and our Service is designed to comply with applicable privacy laws worldwide, including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), California Privacy Rights Act (CPRA), and other relevant data protection regulations.
                </p>
                <p>
                  Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide to Us</h3>
                <p className="mb-2">We collect information that you voluntarily provide to us when you:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Register for an account:</strong> Name, email address, username, password, profile information, artist name, genre, location, and other profile details</li>
                  <li><strong>Use our services:</strong> Content you upload, create, or share (music, videos, images, text), payment information, financial data for royalty tracking and micro-loans</li>
                  <li><strong>Communicate with us:</strong> Email correspondence, support tickets, feedback, survey responses</li>
                  <li><strong>Subscribe to services:</strong> Subscription tier selection, billing information, payment method details</li>
                  <li><strong>Connect third-party accounts:</strong> Streaming platform credentials, social media account data, distribution service information</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Information We Collect Automatically</h3>
                <p className="mb-2">When you access or use our Service, we automatically collect certain information, including:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Device Information:</strong> IP address, browser type and version, device type, operating system, unique device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on pages, click data, navigation paths, search queries</li>
                  <li><strong>Location Data:</strong> Approximate geographic location based on IP address or precise location if you grant permission</li>
                  <li><strong>Cookies and Tracking Technologies:</strong> Session data, preferences, authentication tokens, analytics data</li>
                  <li><strong>Performance Data:</strong> Error logs, diagnostic data, crash reports, system performance metrics</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Information from Third-Party Sources</h3>
                <p className="mb-2">We may receive information about you from third-party sources, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Streaming Platforms:</strong> Spotify, Apple Music, YouTube Music, Tidal, Amazon Music (streaming statistics, playlist placements, listener demographics)</li>
                  <li><strong>Social Media:</strong> Instagram, TikTok, Twitter/X, Facebook (follower counts, engagement metrics, content performance)</li>
                  <li><strong>Distribution Services:</strong> Release data, sales information, royalty reports</li>
                  <li><strong>Payment Processors:</strong> Stripe, PayPal (transaction data, payment status)</li>
                  <li><strong>Analytics Providers:</strong> Google Analytics, Mixpanel (aggregated usage statistics)</li>
                  <li><strong>Data Enrichment Services:</strong> Publicly available information to enhance artist profiles</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="mb-2">We use the information we collect for the following purposes:</p>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 To Provide and Maintain Our Service</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Create and manage your account</li>
                  <li>Process transactions and payments</li>
                  <li>Deliver the features and functionality you request</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send transactional emails and notifications</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 To Improve and Personalize Your Experience</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Analyze usage patterns and trends</li>
                  <li>Develop new features and services</li>
                  <li>Personalize content and recommendations</li>
                  <li>Optimize platform performance</li>
                  <li>Conduct research and analytics</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.3 AI and Machine Learning</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Career optimization and trend forecasting</li>
                  <li>Contract analysis and risk assessment</li>
                  <li>Marketing automation and content generation</li>
                  <li>Infringement detection and IP protection</li>
                  <li>Predictive analytics for revenue and growth</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.4 For Security and Legal Compliance</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Detect, prevent, and address fraud and security threats</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Comply with legal obligations and government requests</li>
                  <li>Protect our rights, property, and safety</li>
                  <li>Resolve disputes and enforce agreements</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.5 For Marketing and Communications</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send promotional emails and newsletters (with your consent)</li>
                  <li>Provide updates about new features and services</li>
                  <li>Conduct surveys and gather feedback</li>
                  <li>Display targeted advertisements (where permitted)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing (GDPR)</h2>
                <p className="mb-2">If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data based on the following legal grounds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Consent:</strong> You have given explicit consent for specific processing activities</li>
                  <li><strong>Contract Performance:</strong> Processing is necessary to fulfill our contractual obligations to you</li>
                  <li><strong>Legal Obligation:</strong> Processing is required to comply with applicable laws</li>
                  <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests, provided your rights do not override those interests</li>
                  <li><strong>Vital Interests:</strong> Processing is necessary to protect your vital interests or those of another person</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. How We Share Your Information</h2>
                <p className="mb-4">
                  We do not sell your personal information. We may share your information with third parties in the following circumstances:
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Service Providers</h3>
                <p className="mb-2">We share information with third-party vendors who perform services on our behalf:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Cloud hosting providers (AWS, Google Cloud, Azure)</li>
                  <li>Payment processors (Stripe, PayPal)</li>
                  <li>Email service providers (SendGrid, Mailgun)</li>
                  <li>Analytics providers (Google Analytics, Mixpanel)</li>
                  <li>Customer support tools (Zendesk, Intercom)</li>
                  <li>AI and machine learning services</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Business Partners</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Streaming platforms for distribution services</li>
                  <li>Healthcare providers for wellness benefits</li>
                  <li>Financial institutions for micro-lending services</li>
                  <li>Tour management and booking partners</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Legal Requirements</h3>
                <p className="mb-2">We may disclose your information if required to do so by law or in response to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Subpoenas, court orders, or legal process</li>
                  <li>Government or regulatory requests</li>
                  <li>Law enforcement investigations</li>
                  <li>Protection of our rights, property, or safety</li>
                  <li>Prevention of fraud or illegal activity</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Business Transfers</h3>
                <p className="mb-4">
                  In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such change and provide options regarding your information.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.5 With Your Consent</h3>
                <p>
                  We may share your information with third parties when you explicitly consent to such sharing.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
                <p className="mb-4">
                  Boptone is based in the United States. If you are accessing our Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States and other countries where our service providers operate.
                </p>
                <p className="mb-4">
                  These countries may have data protection laws that differ from those in your country of residence. By using our Service, you consent to the transfer of your information to the United States and other countries.
                </p>
                <p className="mb-4">
                  For users in the EEA, UK, and Switzerland, we implement appropriate safeguards for international data transfers, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Standard Contractual Clauses approved by the European Commission</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Privacy Shield Framework compliance (where applicable)</li>
                  <li>Binding Corporate Rules</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
                <p className="mb-2">Retention periods vary based on data type:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period thereafter</li>
                  <li><strong>Transaction Records:</strong> Retained for 7 years for tax and accounting purposes</li>
                  <li><strong>Content:</strong> Retained until you delete it or close your account</li>
                  <li><strong>Usage Data:</strong> Typically retained for 24-36 months</li>
                  <li><strong>Legal Hold Data:</strong> Retained as required by law or ongoing litigation</li>
                </ul>
                <p>
                  When we no longer need your information, we securely delete or anonymize it in accordance with our data retention policies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Your Privacy Rights</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">8.1 General Rights (All Users)</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
                  <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.2 California Residents (CCPA/CPRA)</h3>
                <p className="mb-2">If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Right to Know:</strong> Request disclosure of personal information collected, used, disclosed, or sold</li>
                  <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                  <li><strong>Right to Opt-Out:</strong> Opt out of the sale or sharing of personal information (we do not sell personal information)</li>
                  <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
                  <li><strong>Right to Limit:</strong> Limit the use and disclosure of sensitive personal information</li>
                  <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your privacy rights</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.3 EEA, UK, and Swiss Residents (GDPR)</h3>
                <p className="mb-2">If you are located in the EEA, UK, or Switzerland, you have additional rights under the GDPR:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Right of Access:</strong> Obtain confirmation of processing and access to your data</li>
                  <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Right to Restriction:</strong> Restrict processing of your data</li>
                  <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                  <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.4 How to Exercise Your Rights</h3>
                <p className="mb-2">To exercise any of these rights, please contact us at:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email: privacy@boptone.com</li>
                  <li>Subject line: "Privacy Rights Request"</li>
                  <li>Include: Your name, email address, and specific request</li>
                </ul>
                <p className="mt-4">
                  We will respond to your request within 30 days (45 days for CCPA requests). We may require verification of your identity before processing your request.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  We use cookies, web beacons, pixels, and similar tracking technologies to collect information about your browsing activities and preferences.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security)</li>
                  <li><strong>Performance Cookies:</strong> Collect information about how you use our Service (analytics)</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Targeting Cookies:</strong> Deliver relevant advertisements and measure campaign effectiveness</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Managing Cookies</h3>
                <p className="mb-2">You can control cookies through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Browser settings (most browsers allow you to refuse or delete cookies)</li>
                  <li>Our cookie preference center (available in your account settings)</li>
                  <li>Third-party opt-out tools (e.g., Network Advertising Initiative, Digital Advertising Alliance)</li>
                </ul>
                <p className="mt-4">
                  Note: Disabling certain cookies may limit your ability to use some features of our Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Data Security</h2>
                <p className="mb-4">
                  We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
                </p>
                <p className="mb-2">Our security measures include:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Encryption of data in transit (TLS/SSL) and at rest (AES-256)</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection and security</li>
                  <li>Incident response and breach notification procedures</li>
                  <li>Secure data centers with physical security controls</li>
                  <li>Regular backups and disaster recovery plans</li>
                </ul>
                <p className="mb-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
                <p>
                  If we become aware of a data breach that affects your personal information, we will notify you in accordance with applicable laws and regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
                <p className="mb-4">
                  Our Service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If you are under 13, please do not use our Service or provide any information to us.
                </p>
                <p className="mb-4">
                  If we learn that we have collected personal information from a child under 13 without parental consent, we will delete that information as quickly as possible. If you believe we have collected information from a child under 13, please contact us at privacy@boptone.com.
                </p>
                <p>
                  For users between 13 and 18, we recommend obtaining parental consent before using our Service, particularly for features involving financial transactions or content creation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Third-Party Links and Services</h2>
                <p className="mb-4">
                  Our Service may contain links to third-party websites, applications, or services that are not operated by us. This Privacy Policy does not apply to those third-party services.
                </p>
                <p className="mb-4">
                  We are not responsible for the privacy practices of third parties. We encourage you to review the privacy policies of any third-party services before providing them with your personal information.
                </p>
                <p>
                  When you connect third-party accounts (e.g., Spotify, Instagram) to our Service, you authorize us to access and use information from those accounts in accordance with this Privacy Policy and the third party's terms of service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Do Not Track Signals</h2>
                <p>
                  Some web browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no industry standard for how to respond to DNT signals. At this time, our Service does not respond to DNT signals. We will update this Privacy Policy if we adopt a DNT standard in the future.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Posting the updated Privacy Policy on our website</li>
                  <li>Updating the "Last Updated" date at the top of this policy</li>
                  <li>Sending you an email notification (for material changes)</li>
                  <li>Displaying a prominent notice on our Service</li>
                </ul>
                <p className="mb-4">
                  Your continued use of our Service after the effective date of the updated Privacy Policy constitutes your acceptance of the changes. If you do not agree to the updated Privacy Policy, you must stop using our Service.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <p className="font-semibold mb-2">Acid Bird, Inc.</p>
                  <p className="mb-1">Attn: Privacy Officer</p>
                  <p className="mb-1">Los Angeles, California, United States</p>
                  <p className="mb-1">Email: privacy@boptone.com</p>
                  <p className="mb-1">General Inquiries: hello@boptone.com</p>
                </div>
                <p className="mt-6 mb-4">
                  <strong>For EEA, UK, and Swiss Residents:</strong>
                </p>
                <p className="mb-4">
                  If you are located in the EEA, UK, or Switzerland and have concerns about our privacy practices, you have the right to lodge a complaint with your local data protection authority.
                </p>
                <p>
                  <strong>For California Residents:</strong>
                </p>
                <p>
                  You may contact us using the information above to exercise your CCPA/CPRA rights. We will not discriminate against you for exercising your rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">16. California Shine the Light Law</h2>
                <p>
                  California Civil Code Section 1798.83 permits California residents to request certain information regarding our disclosure of personal information to third parties for their direct marketing purposes. We do not share personal information with third parties for their direct marketing purposes without your consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">17. Nevada Privacy Rights</h2>
                <p>
                  Nevada residents have the right to opt out of the sale of certain personal information to third parties. We do not sell personal information as defined under Nevada law. If you are a Nevada resident and have questions, please contact us at privacy@boptone.com.
                </p>
              </section>

              <div className="border-t pt-6 mt-12 text-center text-muted-foreground">
                <p className="mb-4">
                  This Privacy Policy is designed to comply with global privacy regulations including GDPR, CCPA/CPRA, and other applicable laws.
                </p>
                <p>© 2025 Acid Bird, Inc. All rights reserved.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ToneyChatbot />
    </div>
  );
}
