import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
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
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last Updated: June 1, 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Welcome to Boptone. These Terms of Service ("Terms") govern your access to and use of the Boptone website, services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p className="mb-4">
                  Boptone is owned and operated by Acid Bird, Inc. ("Company", "we", "us", or "our"), a company registered in California, United States.
                </p>
                <p>
                  Please read these Terms carefully before using our Service. By accessing or using any part of the Service, you agree to be bound by these Terms. If you do not agree to all the Terms, then you may not access or use the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                <p className="mb-2">Throughout these Terms, the following definitions apply:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"Service"</strong> refers to the Boptone platform, website, and any applications, software, products, and services provided by Acid Bird, Inc.</li>
                  <li><strong>"User"</strong> refers to any individual who accesses or uses the Service.</li>
                  <li><strong>"Content"</strong> refers to any information, text, graphics, photos, music, software, audio, video, works of authorship, or materials uploaded, downloaded, or appearing on the Service.</li>
                  <li><strong>"Platform"</strong> refers to the autonomous operating system for artists that Boptone is developing, which will enable creation, distribution, protection, and monetization of creative works.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
                <p className="mb-4">
                  You must be at least 13 years old to use the Service. By using the Service, you represent and warrant that you are at least 13 years old and that your use of the Service does not violate any applicable laws or regulations.
                </p>
                <p>
                  If you are using the Service on behalf of a company, organization, or other entity, you represent and warrant that you have the authority to bind that entity to these Terms, and you agree to be bound by these Terms on behalf of such entity.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Account Registration and Security</h2>
                <p className="mb-4">
                  Currently, our Service primarily collects email addresses for our waitlist. When we launch additional features, you may be required to create an account and provide certain information about yourself. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="mb-4">
                  You are responsible for safeguarding any password or credentials that you use to access the Service and for any activities or actions under your account. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account. You agree not to disclose your password to any third party.
                </p>
                <p>
                  You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Future Services</h2>
                <p className="mb-2">Boptone is developing a comprehensive platform for artists that will include the following services:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>An autonomous operating system for artists to create, distribute, protect, and monetize creative works</li>
                  <li>AI and machine learning tools for career optimization, trend forecasting, contract analysis, and marketing automation</li>
                  <li>Global music and video distribution to streaming platforms and direct-to-fan channels</li>
                  <li>Royalty tracking, financial management, and royalty-backed micro-loans</li>
                  <li>Direct-to-fan e-commerce, including physical and digital merchandise sales with payment processing and tax compliance</li>
                  <li>IP protection through AI-driven infringement detection and DMCA takedowns</li>
                  <li>Healthcare services integration</li>
                  <li>Tour planning tools</li>
                  <li>Creator analytics</li>
                </ul>
                <p>
                  These future services will be subject to these Terms as well as any additional terms and conditions that may apply to specific features, applications, or services. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. User Conduct and Prohibited Activities</h2>
                <p className="mb-2">You agree not to engage in any of the following prohibited activities:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violating any applicable laws, regulations, or third-party rights</li>
                  <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
                  <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service</li>
                  <li>Using any robot, spider, crawler, scraper, or other automated means to access the Service</li>
                  <li>Bypassing measures we may use to prevent or restrict access to the Service</li>
                  <li>Uploading or transmitting viruses, malware, or other types of malicious software</li>
                  <li>Collecting or harvesting any personally identifiable information from the Service</li>
                  <li>Impersonating another person or otherwise misrepresenting your affiliation with a person or entity</li>
                  <li>Interfering with the proper working of the Service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
                <p className="mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Acid Bird, Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Acid Bird, Inc.
                </p>
                <p>
                  When the full platform launches, we will respect the intellectual property rights of artists and creators who use our Service. The content you create, upload, or distribute through our platform will remain your property, subject to the licenses you grant to us to provide the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. User Content</h2>
                <p className="mb-4">
                  When the full platform launches, you may be able to post, upload, publish, submit, or transmit content through the Service ("User Content"). By making any User Content available through the Service, you grant to Acid Bird, Inc. a non-exclusive, transferable, sublicensable, worldwide, royalty-free license to use, copy, modify, create derivative works based upon, distribute, publicly display, and publicly perform your User Content in connection with operating and providing the Service.
                </p>
                <p className="mb-2">You are solely responsible for your User Content and the consequences of posting or publishing it. You represent and warrant that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
                  <li>Your User Content does not violate or infringe upon the rights of any third party, including intellectual property rights, privacy rights, or publicity rights</li>
                  <li>Your User Content complies with these Terms and all applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and disclose information about you in connection with your use of the Service. By using the Service, you consent to the collection, use, and disclosure of your information as outlined in our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
                </p>
                <p>
                  All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
                <p className="mb-4 uppercase font-semibold">
                  The Service is provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p className="mb-2 uppercase font-semibold">Acid Bird, Inc. makes no warranty that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Service will meet your requirements</li>
                  <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                  <li>The results that may be obtained from the use of the Service will be accurate or reliable</li>
                  <li>The quality of any products, services, information, or other material purchased or obtained by you through the Service will meet your expectations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
                <p className="mb-2 uppercase font-semibold">
                  In no event shall Acid Bird, Inc., its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your access to or use of or inability to access or use the Service</li>
                  <li>Any conduct or content of any third party on the Service</li>
                  <li>Any content obtained from the Service</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                </ul>
                <p className="uppercase font-semibold">
                  Whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
                <p className="mb-2">
                  You agree to defend, indemnify, and hold harmless Acid Bird, Inc., its directors, employees, partners, agents, suppliers, and affiliates, from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to or use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party right, including without limitation any intellectual property right, publicity, confidentiality, property, or privacy right</li>
                  <li>Any claim that your User Content caused damage to a third party</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution and Arbitration</h2>
                <p className="mb-4 uppercase font-semibold">Please read this section carefully as it affects your rights.</p>
                <p className="mb-4">
                  <strong>Agreement to Arbitrate:</strong> You and Acid Bird, Inc. agree that any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination, enforcement, interpretation, or validity thereof, or to the use of the Service (collectively, "Disputes") will be settled by binding arbitration, except that each party retains the right to seek injunctive or other equitable relief in a court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of a party's copyrights, trademarks, trade secrets, patents, or other intellectual property rights.
                </p>
                <p className="mb-4">
                  <strong>Arbitration Rules and Forum:</strong> The arbitration will be administered by the American Arbitration Association ("AAA") in accordance with the Consumer Arbitration Rules (the "AAA Rules") then in effect. The arbitration will be conducted in Los Angeles County, California, unless you and Acid Bird, Inc. agree otherwise.
                </p>
                <p className="mb-4">
                  <strong>Arbitrator's Powers:</strong> The arbitrator will have exclusive authority to resolve any Dispute, including, without limitation, any claim relating to the interpretation, scope, enforceability, or formation of this arbitration agreement, including, but not limited to, any claim that all or any part of this arbitration agreement is void or voidable.
                </p>
                <p className="mb-4 uppercase font-semibold">
                  <strong>Class Action Waiver:</strong> You and Acid Bird, Inc. agree that each may bring claims against the other only in your or its individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.
                </p>
                <p className="uppercase font-semibold">
                  <strong>Jury Trial Waiver:</strong> You and Acid Bird, Inc. hereby waive any constitutional and statutory rights to sue in court and have a trial in front of a judge or a jury.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">16. Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
                <p>
                  By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">17. Severability</h2>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">18. Entire Agreement</h2>
                <p>
                  These Terms constitute the entire agreement between you and Acid Bird, Inc. regarding our Service and supersede and replace any prior agreements we might have had between us regarding the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">19. Contact Information</h2>
                <p className="mb-2">If you have any questions about these Terms, please contact us at:</p>
                <p className="font-semibold">Acid Bird, Inc.</p>
                <p>Email: hello@boptone.com</p>
              </section>

              <div className="border-t pt-6 mt-12 text-center text-muted-foreground">
                <p>© 2025 Acid Bird, Inc. All rights reserved.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
