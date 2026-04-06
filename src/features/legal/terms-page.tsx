import { LegalLayout } from './components/legal-layout'

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 6, 2026">
      <div className="space-y-8">
        <section>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to KeyVoid. By accessing or using our service, you agree to
            be bound by these Terms of Service. Please read them carefully
            before using the application.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            1. Service Description
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            KeyVoid is an end-to-end encrypted vault service designed to store
            your passwords, documents, and secrets securely. We employ
            zero-knowledge architecture, meaning we cannot access or decrypt
            your stored data under any circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            2. User Accounts
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            To use KeyVoid, you must create an account with a valid email
            address and a strong master password. You are solely responsible
            for:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>Maintaining the confidentiality of your master password</li>
            <li>All activities that occur under your account</li>
            <li>
              Ensuring your account information is accurate and up-to-date
            </li>
            <li>Regular backup of your encrypted data</li>
          </ul>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            <strong className="text-foreground">Important:</strong> Due to our
            zero-knowledge encryption model, if you lose your master password,
            we cannot recover your data. There is no &quot;password reset&quot;
            for your vault contents.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            3. Acceptable Use
          </h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            You agree not to use KeyVoid for any unlawful purpose or in any way
            that could damage, disable, overburden, or impair our service.
            Prohibited activities include:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
            <li>Storing or sharing illegal content</li>
            <li>
              Attempting to gain unauthorized access to other users accounts
            </li>
            <li>
              Using automated systems to access the service without permission
            </li>
            <li>Distributing malware or engaging in phishing activities</li>
            <li>Violating any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            4. Data Ownership
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You retain full ownership of all data you store in KeyVoid. We claim
            no rights to your content. Due to our encryption model, we cannot
            view, modify, or distribute your data. You are responsible for
            ensuring you have the right to store any data you upload.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            5. Security
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including
            AES-256-GCM encryption, secure HTTPS connections, and regular
            security audits. However, you acknowledge that no system is
            completely secure, and you use the service at your own risk. You are
            responsible for maintaining the security of your devices and master
            password.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            6. Service Availability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We strive to maintain 99.9% uptime, but we do not guarantee
            uninterrupted access to the service. We reserve the right to suspend
            service for maintenance, updates, or circumstances beyond our
            control. We will provide advance notice when possible.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            7. Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, KeyVoid and its operators
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, including without limitation,
            loss of profits, data, use, goodwill, or other intangible losses
            resulting from your access to or use of (or inability to access or
            use) the service.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            8. Termination
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You may terminate your account at any time by deleting your data and
            closing your account. We reserve the right to suspend or terminate
            accounts that violate these terms or engage in fraudulent or illegal
            activities. Upon termination, your encrypted data will be
            permanently deleted from our servers.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            9. Changes to Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these Terms of Service from time to time. We will
            notify you of any material changes via email or through the service.
            Your continued use of KeyVoid after such changes constitutes your
            acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            10. Contact
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms of Service, please
            contact us through our GitHub repository or email support.
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
