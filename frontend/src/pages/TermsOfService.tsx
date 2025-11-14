import { Helmet } from "react-helmet-async";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service - Neustream</title>
        <meta
          name="description"
          content="Neustream's terms of service - Rules and guidelines for using our streaming platform"
        />
        <meta
          name="keywords"
          content="terms of service, terms and conditions, legal agreement, neustream"
        />
        <meta property="og:title" content="Terms of Service - Neustream" />
        <meta
          property="og:description"
          content="Neustream's terms of service - Rules and guidelines for using our streaming platform"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service - Neustream" />
        <meta
          name="twitter:description"
          content="Neustream's terms of service - Rules and guidelines for using our streaming platform"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-normal text-center mb-8">
            Terms of Service
          </h1>

          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By accessing and using Neustream's service ("the Service"),
                  you accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to abide by the above,
                  please do not use this service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Neustream's service is a multistreaming platform that allows
                  users to broadcast live video content simultaneously to
                  multiple streaming platforms. The service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Multi-platform streaming capabilities</li>
                  <li>Stream management and analytics</li>
                  <li>Chat integration and moderation tools</li>
                  <li>Account and subscription management</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground">
                  Account Creation
                </h3>
                <p>
                  To use our service, you must create an account and provide
                  accurate, complete, and current information. You are
                  responsible for safeguarding your account credentials.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Account Responsibilities
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain the confidentiality of your password</li>
                  <li>Provide accurate and complete information</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground">
                  Prohibited Content
                </h3>
                <p>You may not use our service to stream content that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violates any applicable laws or regulations</li>
                  <li>Contains explicit sexual content or pornography</li>
                  <li>Promotes violence, hate speech, or discrimination</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains defamatory, libelous, or harmful content</li>
                  <li>Includes malware, viruses, or harmful code</li>
                  <li>Spams or engages in fraudulent activities</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">
                  Streaming Guidelines
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Respect community guidelines of all connected platforms
                  </li>
                  <li>Do not stream copyrighted content without permission</li>
                  <li>
                    Maintain appropriate content for your intended audience
                  </li>
                  <li>Follow all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Intellectual Property
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground">
                  Your Content
                </h3>
                <p>
                  You retain ownership of all content you create and stream
                  through our service. By using our service, you grant us a
                  limited, non-exclusive license to use, reproduce, and
                  distribute your content solely for the purpose of providing
                  our service.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Our Content
                </h3>
                <p>
                  Neustream's service, including its software, design, and
                  content, is protected by intellectual property laws. You may
                  not copy, modify, distribute, or create derivative works
                  without our explicit permission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Subscription and Payment
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground">
                  Subscription Plans
                </h3>
                <p>
                  We offer various subscription plans with different features
                  and usage limits. Subscription fees are charged in advance on
                  a recurring basis.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Payment Terms
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    All fees are non-refundable unless otherwise specified
                  </li>
                  <li>
                    We reserve the right to change pricing with 30 days notice
                  </li>
                  <li>Failed payments may result in service interruption</li>
                  <li>You may cancel your subscription at any time</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Service Availability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We strive to maintain high service availability but cannot
                  guarantee uninterrupted service. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Perform maintenance and updates</li>
                  <li>Temporarily suspend service for technical reasons</li>
                  <li>Modify or discontinue features with reasonable notice</li>
                  <li>Limit usage to ensure fair access for all users</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Privacy and Data
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your privacy is important to us. Our collection and use of
                  personal information is governed by our Privacy Policy, which
                  forms part of these terms.
                </p>
                <p>
                  By using our service, you consent to the collection and use of
                  information as described in our Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground">
                  Termination by You
                </h3>
                <p>
                  You may terminate your account at any time through your
                  account settings or by contacting our support team.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Termination by Us
                </h3>
                <p>
                  We reserve the right to suspend or terminate your account
                  immediately if you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate these terms of service</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Compromise the security or integrity of our service</li>
                  <li>Fail to pay applicable fees</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimers</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our service is provided "as is" without warranties of any
                  kind, either express or implied. We disclaim all warranties,
                  including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Merchantability and fitness for a particular purpose</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>Accuracy or reliability of streamed content</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                11. Limitation of Liability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To the maximum extent permitted by law, Neustream shall not be
                  liable for any indirect, incidental, special, or consequential
                  damages arising from your use of our service.
                </p>
                <p>
                  Our total liability for any claims relating to the service
                  shall not exceed the amount you paid for the service in the
                  six months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These terms shall be governed by and construed in accordance
                  with the laws of the jurisdiction where Neustream operates,
                  without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                13. Changes to Terms
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We reserve the right to modify these terms at any time.
                  Changes will be effective upon posting to our website. Your
                  continued use of the service constitutes acceptance of any
                  modified terms.
                </p>
                <p>
                  For material changes, we will provide reasonable notice, such
                  as email notification or prominent website announcement.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                14. Contact Information
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about these Terms of Service, please
                  contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li>Email: farseen@neustream.app</li>
                  <li>Website: https://neustream.app</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
