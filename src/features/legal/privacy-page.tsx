import { LegalLayout } from './components/legal-layout'

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 6, 2026">
      <div className="space-y-8">
        <section>
          <p className="text-muted-foreground leading-relaxed">
            At KeyVoid, privacy is not just a feature—it is the foundation of
            our service. This Privacy Policy explains what information we
            collect, how we use it, and how we protect your privacy through our
            zero-knowledge architecture.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            1. Information We Collect
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            We collect minimal information necessary to provide our service:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-foreground">Account Information:</strong>{' '}
              Your email address (required for authentication and notifications)
            </li>
            <li>
              <strong className="text-foreground">Encrypted Data:</strong> Your
              vault contents, which are encrypted in your browser before
              reaching our servers
            </li>
            <li>
              <strong className="text-foreground">Technical Data:</strong> Basic
              server logs for debugging and security (IP addresses, timestamps,
              request types)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            2. What We Cannot Access
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Due to our zero-knowledge encryption architecture, we explicitly{' '}
            <strong className="text-foreground">cannot</strong> access:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>Your master password or encryption keys</li>
            <li>The contents of your vault or any stored secrets</li>
            <li>
              Metadata about your stored items (titles, descriptions, etc.)
            </li>
            <li>Your browsing history or usage patterns within the vault</li>
          </ul>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            All encryption and decryption occurs locally in your browser. The
            data we store on our servers is entirely encrypted blobs that are
            meaningless without your master password.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            3. How We Use Your Information
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            We use the limited information we collect to:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>Provide, maintain, and improve the KeyVoid service</li>
            <li>Authenticate your account and prevent unauthorized access</li>
            <li>Send important security notifications and service updates</li>
            <li>Respond to your support requests and feedback</li>
            <li>Monitor for security threats and fraudulent activity</li>
          </ul>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            We do not use your information for advertising, marketing, or any
            commercial purposes beyond providing the vault service.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            4. Data Storage & Security
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Your data is protected through multiple security layers:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-foreground">
                Client-Side Encryption:
              </strong>{' '}
              AES-256-GCM encryption performed in your browser using your master
              password
            </li>
            <li>
              <strong className="text-foreground">
                Server-Side Encryption:
              </strong>{' '}
              Additional encryption layer applied to already-encrypted data at
              rest
            </li>
            <li>
              <strong className="text-foreground">Secure Transmission:</strong>{' '}
              All data transmitted over HTTPS/TLS 1.3
            </li>
            <li>
              <strong className="text-foreground">Access Controls:</strong>{' '}
              Strict authentication and authorization mechanisms
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            5. Third-Party Services
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            We use the following third-party services:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-foreground">Hosting Provider:</strong> For
              server infrastructure (hosts encrypted data only)
            </li>
            <li>
              <strong className="text-foreground">Email Service:</strong> For
              sending authentication and notification emails
            </li>
          </ul>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            All third-party providers are contractually bound to maintain
            confidentiality and security. They never have access to your
            unencrypted data or master password.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            6. Data Retention
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your encrypted data for as long as your account is active.
            If you choose to delete your account, all associated data will be
            permanently deleted within 30 days. Server logs are retained for 90
            days for security purposes before automatic deletion.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            7. Your Rights
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            You have the right to:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>Access your personal information (email, account details)</li>
            <li>Export your encrypted vault data at any time</li>
            <li>Correct inaccuracies in your account information</li>
            <li>Delete your account and all associated data</li>
            <li>Receive notification of any data breaches</li>
          </ul>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            To exercise these rights, please contact us through the app or email
            support.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            8. No Tracking Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            KeyVoid does not use cookies for tracking, analytics, or advertising
            purposes. We do not employ any third-party analytics services (no
            Google Analytics, no tracking pixels, no telemetry). Your usage of
            the application is completely private.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            9. Compliance
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We comply with applicable data protection laws. Our zero-knowledge
            architecture inherently supports privacy regulations by design—we
            literally cannot access your personal data even if requested,
            because we do not possess the decryption keys.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            10. Changes to This Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy periodically to reflect changes in
            our practices or for legal reasons. We will notify you of any
            material changes via email. Continued use of the service after
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            11. Contact Us
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or our privacy
            practices, please contact us through our GitHub repository or email
            support.
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
