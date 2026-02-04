import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Effective Date: January 1, 2026</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Welcome to Boptone. These Terms of Service ("Terms") govern your access to and use of the Boptone platform, website, services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p className="mb-4">
                  Boptone is owned and operated by Acid Bird, Inc. ("Company", "we", "us", or "our"), a California corporation with its principal place of business in Los Angeles, California, United States.
                </p>
                <p>
                  Please read these Terms carefully before using our Service. By creating an account, accessing any part of the Service, or clicking "I Accept," you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to all the Terms, then you may not access or use the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                <p className="mb-2">Throughout these Terms, the following definitions apply:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"Service"</strong> refers to the Boptone platform, website, mobile applications, software, products, and all services provided by Acid Bird, Inc., including but not limited to AI-powered career tools, distribution services, financial management, e-commerce, IP protection, healthcare integration, and tour management.</li>
                  <li><strong>"User," "you," or "your"</strong> refers to any individual or entity who accesses or uses the Service, including artists, creators, managers, labels, and administrators.</li>
                  <li><strong>"Content"</strong> refers to any information, text, graphics, photos, music, software, audio, video, works of authorship, intellectual property, or materials uploaded, downloaded, created, distributed, or appearing on the Service.</li>
                  <li><strong>"Platform"</strong> refers to Boptone's autonomous operating system for artists that enables creation, distribution, protection, and monetization of creative works.</li>
                  <li><strong>"Subscription"</strong> refers to paid access tiers (Free, Pro, Enterprise) that provide different levels of Service features and functionality.</li>
                  <li><strong>"User Content"</strong> refers to any Content that you upload, submit, post, publish, transmit, or make available through the Service.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
                <p className="mb-4">
                  You must be at least 13 years old to use the Service. If you are between 13 and 18 years old (or the age of majority in your jurisdiction), you may only use the Service under the supervision of a parent or legal guardian who agrees to be bound by these Terms. By using the Service, you represent and warrant that you meet these age requirements and that your use of the Service does not violate any applicable laws or regulations.
                </p>
                <p className="mb-4">
                  If you are using the Service on behalf of a company, organization, label, management company, or other entity, you represent and warrant that you have the legal authority to bind that entity to these Terms, and you agree to be bound by these Terms on behalf of such entity.
                </p>
                <p>
                  We reserve the right to refuse service, terminate accounts, or remove or edit Content in our sole discretion, including if we believe you do not meet the eligibility requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Account Registration and Security</h2>
                <p className="mb-4">
                  To access certain features of the Service, you must create an account and provide certain information about yourself, including your name, email address, artist name, genre, and other profile information. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="mb-4">
                  You are solely responsible for safeguarding your password and any credentials you use to access the Service, and for all activities or actions that occur under your account. We strongly encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols). You agree not to disclose your password to any third party and not to share your account with others.
                </p>
                <p className="mb-4">
                  You must notify us immediately at hello@boptone.com upon becoming aware of any breach of security, unauthorized use of your account, or any other security concern. We will not be liable for any loss or damage arising from your failure to comply with these security obligations.
                </p>
                <p>
                  You may not use another person's account without permission, create multiple accounts for fraudulent purposes, or create accounts using automated means or under false pretenses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Service Features and Functionality</h2>
                <p className="mb-2">Boptone provides a comprehensive platform for artists and creators that includes the following services:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Autonomous Operating System:</strong> Tools to create, distribute, protect, and monetize creative works</li>
                  <li><strong>AI and Machine Learning:</strong> Career optimization, trend forecasting, contract analysis, marketing automation, and intelligent recommendations</li>
                  <li><strong>Global Distribution:</strong> Direct artist-to-fan music distribution via Boptone Audio Protocol with transparent revenue sharing</li>
                  <li><strong>Financial Management:</strong> Royalty tracking across all platforms, revenue analytics, financial forecasting, and budget management</li>
                  <li><strong>Royalty-Backed Micro-Loans:</strong> Access to capital based on projected royalty income, with AI-powered risk assessment</li>
                  <li><strong>Direct-to-Fan E-Commerce:</strong> Merchandise store for physical and digital products, payment processing, tax compliance, and inventory management</li>
                  <li><strong>IP Protection:</strong> AI-driven copyright infringement detection, automated DMCA takedowns, and intellectual property monitoring</li>
                  <li><strong>Healthcare Integration:</strong> Access to artist-specific healthcare plans, mental health services, and wellness resources</li>
                  <li><strong>Tour Management:</strong> Tour planning, venue booking, budget management, and logistics coordination</li>
                  <li><strong>Creator Analytics:</strong> Comprehensive analytics dashboard tracking streaming, social media, revenue, and career growth metrics</li>
                </ul>
                <p className="mb-4">
                  The specific features and functionality available to you depend on your Subscription tier (Free, Pro, or Enterprise). We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We may also impose limits on certain features or restrict access to parts of the Service without notice or liability.
                </p>
                <p>
                  Certain features may require integration with third-party services (such as Instagram, Stripe, payment processors, etc.). Your use of those third-party services is subject to their respective terms of service and privacy policies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Subscription Plans and Payment Terms</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Subscription Tiers</h3>
                <p className="mb-2">Boptone offers the following subscription tiers:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Free:</strong> Basic features with limited functionality, suitable for emerging artists</li>
                  <li><strong>Pro ($29/month):</strong> Full access to all platform features, unlimited revenue tracking, AI advisor, and priority support</li>
                  <li><strong>Enterprise (Custom Pricing):</strong> White-label solutions, dedicated account management, custom integrations, and advanced reporting for labels and management companies</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Payment and Billing</h3>
                <p className="mb-4">
                  By subscribing to a paid tier, you agree to pay all applicable fees and charges. Subscription fees are billed in advance on a monthly or annual basis (as selected by you) and are non-refundable except as required by law or as expressly stated in these Terms.
                </p>
                <p className="mb-4">
                  You authorize us to charge your chosen payment method for all fees. If your payment method fails or your account is past due, we may suspend or terminate your access to paid features until payment is received. You are responsible for providing current, complete, and accurate billing information.
                </p>
                <p className="mb-4">
                  Subscription fees are subject to change. We will provide you with reasonable notice of any fee changes, and the changes will apply to your next billing cycle after the notice period.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Automatic Renewal</h3>
                <p className="mb-4">
                  Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. You may cancel your subscription at any time through your account settings or by contacting hello@boptone.com. Cancellations take effect at the end of the current billing period.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Refund Policy</h3>
                <p className="mb-4">
                  Subscription fees are generally non-refundable. However, if you are dissatisfied with the Service within the first 14 days of your initial paid subscription, you may request a full refund by contacting hello@boptone.com. Refunds are processed within 7-10 business days.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.5 Transaction Fees</h3>
                <p>
                  Boptone may charge transaction fees for certain services, including merchandise sales, distribution services, and micro-loan processing. These fees will be clearly disclosed before you complete any transaction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. User Conduct and Prohibited Activities</h2>
                <p className="mb-2">You agree not to engage in any of the following prohibited activities:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Violating any applicable laws, regulations, or third-party rights</li>
                  <li>Using the Service for any illegal purpose or to facilitate illegal activity</li>
                  <li>Uploading or distributing viruses, malware, or other malicious code</li>
                  <li>Attempting to interfere with, compromise, or breach the security of the Service</li>
                  <li>Using any robot, spider, crawler, scraper, or automated means to access the Service without our express written permission</li>
                  <li>Bypassing any measures we use to prevent or restrict access to the Service</li>
                  <li>Collecting or harvesting any personally identifiable information from other users</li>
                  <li>Impersonating another person or entity, or falsely stating or misrepresenting your affiliation with any person or entity</li>
                  <li>Interfering with or disrupting the Service or servers or networks connected to the Service</li>
                  <li>Uploading Content that infringes on intellectual property rights, privacy rights, or publicity rights of others</li>
                  <li>Uploading Content that is defamatory, obscene, pornographic, abusive, offensive, or otherwise objectionable</li>
                  <li>Engaging in any activity that could damage, disable, overburden, or impair the Service</li>
                  <li>Using the Service to send spam, unsolicited messages, or promotional materials</li>
                  <li>Attempting to gain unauthorized access to other users' accounts or data</li>
                  <li>Reverse engineering, decompiling, or disassembling any part of the Service</li>
                  <li>Removing, altering, or obscuring any copyright, trademark, or other proprietary notices</li>
                </ul>
                <p>
                  Violation of these prohibited activities may result in immediate termination of your account and legal action.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Boptone's Intellectual Property</h3>
                <p className="mb-4">
                  The Service and its original content, features, functionality, software, code, design, graphics, user interface, and all intellectual property therein are and will remain the exclusive property of Acid Bird, Inc. and its licensors. The Service is protected by copyright, trademark, patent, trade secret, and other intellectual property laws of the United States and foreign countries.
                </p>
                <p className="mb-4">
                  Our trademarks, service marks, logos, and trade dress (including "Boptone" and "Own Your Tone") may not be used in connection with any product or service without our prior written consent. All other trademarks, service marks, and logos used on the Service are the property of their respective owners.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Your Intellectual Property</h3>
                <p className="mb-4">
                  You retain all ownership rights to your User Content. We do not claim ownership of any music, videos, artwork, or other creative works you upload to the Service. Your intellectual property remains yours.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.3 License Grant to Boptone</h3>
                <p className="mb-4">
                  By uploading User Content to the Service, you grant Acid Bird, Inc. a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content solely for the purposes of:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Operating, providing, and improving the Service</li>
                  <li>Distributing your Content to streaming platforms and distribution partners as requested by you</li>
                  <li>Displaying your Content in your artist profile and public-facing pages</li>
                  <li>Analyzing your Content for AI-powered recommendations and career optimization</li>
                  <li>Detecting copyright infringement and protecting your intellectual property</li>
                  <li>Marketing and promoting the Service (with your explicit consent)</li>
                </ul>
                <p className="mb-4">
                  This license terminates when you delete your User Content or close your account, except to the extent the Content has been shared with third parties through the Service and cannot be recalled.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.4 DMCA and Copyright Infringement</h3>
                <p className="mb-4">
                  We respect the intellectual property rights of others and expect our users to do the same. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please provide our DMCA Agent with the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>A physical or electronic signature of the copyright owner or authorized representative</li>
                  <li>Identification of the copyrighted work claimed to have been infringed</li>
                  <li>Identification of the infringing material and its location on the Service</li>
                  <li>Your contact information (address, telephone number, email)</li>
                  <li>A statement that you have a good faith belief that the use is not authorized</li>
                  <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
                </ul>
                <p className="mb-2">
                  Send DMCA notices to:
                </p>
                <p className="mb-4">
                  <strong>DMCA Agent</strong><br />
                  Acid Bird, Inc.<br />
                  Email: hello@boptone.com<br />
                  Subject: DMCA Takedown Notice
                </p>
                <p>
                  We may terminate the accounts of repeat infringers in appropriate circumstances.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. User Content Responsibilities</h2>
                <p className="mb-4">
                  You are solely responsible for your User Content and the consequences of posting, publishing, or distributing it through the Service. By making User Content available, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>You own or have obtained all necessary rights, licenses, consents, and permissions to use and authorize us to use your User Content</li>
                  <li>Your User Content does not and will not infringe, violate, or misappropriate any third-party intellectual property rights, privacy rights, publicity rights, or other proprietary rights</li>
                  <li>Your User Content complies with these Terms and all applicable laws and regulations</li>
                  <li>Your User Content does not contain any viruses, malware, or harmful code</li>
                  <li>Your User Content is not defamatory, obscene, pornographic, abusive, or otherwise objectionable</li>
                  <li>Your User Content does not violate any confidentiality or non-disclosure obligations</li>
                </ul>
                <p className="mb-4">
                  We reserve the right (but have no obligation) to review, monitor, or remove User Content at our sole discretion, for any reason or no reason, including if we believe it violates these Terms or applicable law.
                </p>
                <p>
                  We do not endorse, support, represent, or guarantee the completeness, truthfulness, accuracy, or reliability of any User Content. You understand that by using the Service, you may be exposed to Content that is offensive, harmful, inaccurate, or otherwise inappropriate.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Third-Party Services and Integrations</h2>
                <p className="mb-4">
                  The Service integrates with and relies on various third-party services, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Social media platforms (Instagram, TikTok, Twitter/X, Facebook)</li>
                  <li>Payment processors (Stripe, PayPal)</li>
                  <li>Cloud storage and hosting providers</li>
                  <li>Analytics and data providers</li>
                  <li>Healthcare providers</li>
                </ul>
                <p className="mb-4">
                  Your use of these third-party services through Boptone is subject to their respective terms of service, privacy policies, and other agreements. We are not responsible for the actions, content, or policies of third-party services. You acknowledge and agree that Acid Bird, Inc. is not liable for any damage or loss caused by your use of or reliance on any third-party service.
                </p>
                <p className="mb-4">
                  When you connect third-party accounts to Boptone, you authorize us to access and retrieve information from those accounts as necessary to provide the Service. You may disconnect third-party integrations at any time through your account settings.
                </p>
                <p>
                  We may display links to third-party websites or services. These links are provided for your convenience only. We do not endorse or assume responsibility for any third-party sites or services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Privacy and Data Protection</h2>
                <p className="mb-4">
                  Your privacy is important to us. Our collection, use, and disclosure of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection, use, and disclosure of your information as outlined in our Privacy Policy.
                </p>
                <p className="mb-4">
                  We implement industry-standard security measures to protect your data, including encryption, secure data storage, and access controls. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Please review our Privacy Policy for detailed information about how we handle your data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">12.1 Termination by You</h3>
                <p className="mb-4">
                  You may terminate your account at any time by accessing your account settings and selecting the option to close your account, or by contacting us at hello@boptone.com. Upon termination, your access to paid features will continue until the end of your current billing period, after which your subscription will not renew.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">12.2 Termination by Boptone</h3>
                <p className="mb-4">
                  We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Prolonged inactivity</li>
                  <li>Requests by law enforcement or government agencies</li>
                  <li>Unexpected technical or security issues</li>
                  <li>Discontinuation or material modification of the Service</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">12.3 Effect of Termination</h3>
                <p className="mb-4">
                  Upon termination of your account:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your right to use the Service will immediately cease</li>
                  <li>We may delete your account and User Content from our servers</li>
                  <li>You will lose access to all data, analytics, and reports stored in your account</li>
                  <li>Outstanding payment obligations will become immediately due</li>
                  <li>You remain liable for all charges incurred prior to termination</li>
                </ul>
                <p className="mb-4">
                  We recommend downloading or backing up any User Content or data you wish to retain before terminating your account. We are not responsible for any loss of data upon termination.
                </p>
                <p>
                  All provisions of these Terms which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnity obligations, and limitations of liability.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Disclaimer of Warranties</h2>
                <p className="mb-4  font-semibold">
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                </p>
                <p className="mb-2  font-semibold">
                  ACID BIRD, INC., ITS SUBSIDIARIES, AFFILIATES, DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, AND LICENSORS (COLLECTIVELY, "BOPTONE PARTIES") MAKE NO WARRANTY THAT:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>THE SERVICE WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS</li>
                  <li>THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE</li>
                  <li>THE RESULTS OBTAINED FROM USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE</li>
                  <li>THE QUALITY OF ANY PRODUCTS, SERVICES, INFORMATION, OR OTHER MATERIAL OBTAINED THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS</li>
                  <li>ANY ERRORS IN THE SERVICE WILL BE CORRECTED</li>
                  <li>THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS</li>
                  <li>DATA TRANSMISSION WILL BE SECURE OR NOT INTERCEPTED</li>
                </ul>
                <p className="mb-4  font-semibold">
                  BOPTONE PARTIES DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICE, AND BOPTONE PARTIES WILL NOT BE A PARTY TO OR IN ANY WAY MONITOR ANY TRANSACTION BETWEEN YOU AND THIRD-PARTY PROVIDERS.
                </p>
                <p className="mb-4  font-semibold">
                  NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM BOPTONE OR THROUGH THE SERVICE WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.
                </p>
                <p className=" font-semibold">
                  SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU. YOU MAY ALSO HAVE OTHER LEGAL RIGHTS THAT VARY BY JURISDICTION.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Limitation of Liability</h2>
                <p className="mb-2  font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BOPTONE PARTIES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4  font-semibold">
                  <li>LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
                  <li>DAMAGES RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE</li>
                  <li>DAMAGES RESULTING FROM ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE</li>
                  <li>DAMAGES RESULTING FROM ANY CONTENT OBTAINED FROM THE SERVICE</li>
                  <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
                  <li>DAMAGES RESULTING FROM DELETION, CORRUPTION, OR FAILURE TO STORE ANY CONTENT</li>
                  <li>DAMAGES RESULTING FROM RELIANCE ON AI-GENERATED RECOMMENDATIONS OR ADVICE</li>
                  <li>DAMAGES RESULTING FROM THIRD-PARTY INTEGRATIONS OR SERVICES</li>
                </ul>
                <p className="mb-4  font-semibold">
                  WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY, STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, WHETHER OR NOT BOPTONE PARTIES HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
                </p>
                <p className="mb-4  font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL LIABILITY OF BOPTONE PARTIES FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU HAVE PAID TO BOPTONE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED DOLLARS ($100.00 USD).
                </p>
                <p className=" font-semibold">
                  SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">15. Indemnification</h2>
                <p className="mb-2">
                  You agree to defend, indemnify, and hold harmless Boptone Parties from and against any and all claims, liabilities, damages, losses, costs, expenses, and fees (including reasonable attorneys' fees and court costs) arising out of or in any way connected with:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your access to or use of the Service</li>
                  <li>Your User Content or any content you submit, post, or transmit through the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party right, including without limitation any intellectual property right, publicity right, confidentiality obligation, property right, or privacy right</li>
                  <li>Any claim that your User Content caused damage to a third party</li>
                  <li>Your violation of any applicable laws or regulations</li>
                  <li>Any activity conducted through your account, whether or not authorized by you</li>
                  <li>Your negligence or willful misconduct</li>
                </ul>
                <p className="mb-4">
                  This indemnification obligation will survive termination of these Terms and your use of the Service. We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">16. Dispute Resolution and Arbitration</h2>
                <p className="mb-4  font-semibold">
                  PLEASE READ THIS SECTION CAREFULLY AS IT AFFECTS YOUR RIGHTS AND REQUIRES BINDING ARBITRATION OF DISPUTES.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">16.1 Informal Resolution</h3>
                <p className="mb-4">
                  Before filing a claim, you agree to try to resolve the dispute informally by contacting us at hello@boptone.com. We will attempt to resolve the dispute informally by contacting you via email. If a dispute is not resolved within sixty (60) days of submission, you or Boptone may bring a formal proceeding.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">16.2 Binding Arbitration</h3>
                <p className="mb-4">
                  Any dispute, claim, or controversy arising out of or relating to these Terms or the Service that cannot be resolved informally shall be settled by binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules. The arbitration will be conducted in Los Angeles, California, unless you and Boptone agree otherwise.
                </p>
                <p className="mb-4">
                  The arbitration will be conducted by a single arbitrator. The arbitrator's decision will be final and binding, and judgment on the award may be entered in any court having jurisdiction. The arbitrator may award declaratory or injunctive relief only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by that party's individual claim.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">16.3 Class Action Waiver</h3>
                <p className="mb-4  font-semibold">
                  YOU AND BOPTONE AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. UNLESS BOTH YOU AND BOPTONE AGREE, NO ARBITRATOR OR JUDGE MAY CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS OR OTHERWISE PRESIDE OVER ANY FORM OF A REPRESENTATIVE OR CLASS PROCEEDING.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">16.4 Exceptions</h3>
                <p className="mb-4">
                  Notwithstanding the above, either party may bring a lawsuit in court solely for injunctive relief to stop unauthorized use or abuse of the Service or intellectual property infringement without first engaging in arbitration or the informal dispute resolution process.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">16.5 Governing Law</h3>
                <p className="mb-4">
                  These Terms and any action related thereto will be governed by the laws of the State of California, without regard to its conflict of laws provisions. The exclusive jurisdiction for any dispute not subject to arbitration shall be the state and federal courts located in Los Angeles County, California, and you consent to personal jurisdiction in those courts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">17. Modifications to the Service and Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice, for any reason. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
                </p>
                <p className="mb-4">
                  We may revise these Terms from time to time. The most current version will always be posted on our website with the "Effective Date" at the top. If we make material changes, we will notify you by email or through a notice on the Service prior to the changes becoming effective. By continuing to use the Service after the effective date of any changes, you agree to be bound by the revised Terms.
                </p>
                <p>
                  It is your responsibility to review these Terms periodically. If you do not agree to the modified Terms, you must stop using the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">18. General Provisions</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">18.1 Entire Agreement</h3>
                <p className="mb-4">
                  These Terms, together with our Privacy Policy and any other legal notices or agreements published by us on the Service, constitute the entire agreement between you and Acid Bird, Inc. regarding the Service and supersede all prior agreements and understandings.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.2 Waiver and Severability</h3>
                <p className="mb-4">
                  Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions will remain in effect. The invalid or unenforceable provision will be deemed modified to the extent necessary to make it valid and enforceable.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.3 Assignment</h3>
                <p className="mb-4">
                  You may not assign or transfer these Terms or your rights hereunder, in whole or in part, without our prior written consent. We may assign these Terms at any time without notice to you. Any attempted assignment in violation of this section will be null and void.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.4 Force Majeure</h3>
                <p className="mb-4">
                  We will not be liable for any delay or failure to perform resulting from causes outside our reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.5 No Third-Party Beneficiaries</h3>
                <p className="mb-4">
                  These Terms are for the benefit of, and will be enforceable by, the parties only. These Terms are not intended to confer any right or benefit on any third party.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.6 Notices</h3>
                <p className="mb-4">
                  All notices, requests, and other communications under these Terms must be in writing and will be deemed given: (a) when delivered personally; (b) when sent by confirmed email; (c) one business day after being sent by commercial overnight courier with written verification of receipt; or (d) three business days after being mailed by first-class certified mail, return receipt requested, postage prepaid.
                </p>
                <p className="mb-2">
                  Notices to Boptone should be sent to:
                </p>
                <p className="mb-4">
                  Acid Bird, Inc.<br />
                  Attn: Legal Department<br />
                  Email: hello@boptone.com
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.7 Export Controls</h3>
                <p className="mb-4">
                  The Service may be subject to U.S. export control laws and may be subject to export or import regulations in other countries. You agree not to export, re-export, or transfer, directly or indirectly, any U.S. technical data acquired from Boptone, or any products utilizing such data, in violation of the United States export laws or regulations.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.8 California Users</h3>
                <p className="mb-4">
                  If you are a California resident, you may have certain additional rights. California Civil Code Section 1789.3 requires certain businesses to respond to requests from California customers for information about their practices related to disclosing personal information to third parties for direct marketing purposes. Alternatively, such businesses may adopt a policy of not disclosing personal information to third parties for direct marketing purposes if the customer has exercised an option to opt-out of such information sharing. We have opted for the alternative option and do not disclose your personal information to third parties for their direct marketing purposes without your consent.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">18.9 International Users</h3>
                <p className="mb-4">
                  The Service is controlled and operated from the United States. We make no representations that the Service is appropriate or available for use in other locations. If you access the Service from outside the United States, you do so at your own risk and are responsible for compliance with local laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">19. Contact Information</h2>
                <p className="mb-2">
                  If you have any questions, concerns, or complaints about these Terms or the Service, please contact us at:
                </p>
                <p className="mb-4">
                  <strong>Acid Bird, Inc.</strong><br />
                  Email: hello@boptone.com<br />
                  Website: www.boptone.com
                </p>
                <p>
                  We will make every effort to resolve your concerns promptly and fairly.
                </p>
              </section>

              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  By using Boptone, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  © 2026 Acid Bird, Inc. All rights reserved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ToneyChatbot />
    </div>
  );
}
