import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - Neustream</title>
        <meta name="description" content="Neustream's privacy policy - How we collect, use, and protect your information" />
        <meta name="keywords" content="privacy policy, data protection, user privacy, neustream" />
        <meta property="og:title" content="Privacy Policy - Neustream" />
        <meta property="og:description" content="Neustream's privacy policy - How we collect, use, and protect your information" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - Neustream" />
        <meta name="twitter:description" content="Neustream's privacy policy - How we collect, use, and protect your information" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>

          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We collect information you provide directly to us, such as when you create an account,
                  use our streaming services, or contact us for support.
                </p>
                <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Profile information and avatar</li>
                  <li>Authentication credentials (handled securely through OAuth providers)</li>
                  <li>Streaming configuration and preferences</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Streaming metrics and analytics</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Feature usage patterns</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our streaming services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Analyze usage patterns to optimize user experience</li>
                  <li>Ensure security and prevent fraudulent activities</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties
                  without your consent, except as described in this policy.
                </p>
                <h3 className="text-lg font-medium text-foreground">We may share information with:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service providers who assist in operating our platform</li>
                  <li>Streaming platforms and services you connect to your account</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  Security measures include encryption, secure authentication protocols, regular security
                  audits, and employee training on data protection practices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We retain your personal information for as long as necessary to provide our services
                  and fulfill the purposes outlined in this policy, unless a longer retention period is
                  required or permitted by law.
                </p>
                <p>
                  You may request deletion of your account and associated data at any time through
                  your account settings or by contacting our support team.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Object to certain data processing activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your information may be transferred to and processed in countries other than your own.
                  We ensure appropriate safeguards are in place to protect your data in accordance with
                  applicable data protection laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly
                  collect personal information from children under 13. If we become aware that we have
                  collected such information, we will take steps to delete it promptly.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any
                  material changes by posting the new policy on this page and updating the "Last updated"
                  date at the top.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li>Email: privacy@neustream.app</li>
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