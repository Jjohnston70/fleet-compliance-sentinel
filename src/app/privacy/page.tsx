import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How True North Data Strategies collects, uses, and protects Fleet-Compliance and Pipeline Penny data.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last Updated: March 25, 2026</p>
      <p className="legal-intro">
        True North Data Strategies LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy when you
        use Fleet-Compliance and Pipeline Penny services.
      </p>

      <div className="legal-card">
        <section className="legal-section">
          <h2>Information We Collect</h2>
          <p>We collect data required to deliver fleet and DOT compliance workflows, plus technical service telemetry.</p>
          <ul>
            <li>Account and organization data: names, email addresses, role and organization membership</li>
            <li>Fleet-compliance records: driver qualification records, CDL/license data, medical compliance dates, permits, fleet assets, and invoice records</li>
            <li>Operational metadata: audit logs, error logs, and API usage events</li>
            <li>Automatically collected technical data: IP address, browser/device details, and route usage</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>How We Use Information</h2>
          <ul>
            <li>Operate Fleet-Compliance and Penny features requested by authorized users</li>
            <li>Provide compliance workflows, reminders, and reporting</li>
            <li>Respond to support requests and operational incidents</li>
            <li>Maintain service security and prevent abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>AI Processing and Model Training</h2>
          <p>
            Penny queries may be processed by configured AI providers to generate responses. We do not permit customer data to be
            used to train shared foundation models. We send only the minimum context needed for the requested response.
          </p>
        </section>

        <section className="legal-section">
          <h2>Information Sharing</h2>
          <p>We do not sell personal information. We only share data when needed to operate services or comply with law.</p>
          <ul>
            <li>Trusted subprocessors under confidentiality and security obligations</li>
            <li>Legal requests or rights/safety protection</li>
            <li>Business transfer events (merger/acquisition/asset sale)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Subprocessors</h2>
          <p>Key subprocessors used by the service include Vercel, Neon, Clerk, Railway, Anthropic, Sentry, Stripe, Resend, Datadog, and Upstash.</p>
          <p>
            The current subprocessor list is maintained in <code>SUBPROCESSORS.md</code>.
          </p>
        </section>

        <section className="legal-section">
          <h2>Security and Retention</h2>
          <p>
            We apply administrative, technical, and organizational safeguards, including encrypted transport and restricted access.
            For canceled organizations, data is soft deleted at 30 days and hard deleted at 60 days under the offboarding lifecycle.
          </p>
          <p>Individual deletion requests are handled through our privacy request process and may be completed earlier when legally required.</p>
        </section>

        <section className="legal-section">
          <h2>Cookies and Analytics</h2>
          <p>
            We use essential cookies and analytics tools to operate the website and understand usage. You can control cookies in
            your browser settings.
          </p>
        </section>

        <section className="legal-section">
          <h2>Your Rights</h2>
          <p>Depending on your location, you may have rights to access, correct, delete, or export your personal data.</p>
          <p className="legal-note">
            To request privacy actions, contact{' '}
            <a className="legal-link" href="mailto:jacob@truenorthstrategyops.com">
              jacob@truenorthstrategyops.com
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>GDPR and CCPA</h2>
          <p>
            We support GDPR and CCPA requirements, including transparency, lawful processing, data subject rights, and breach
            notification procedures.
          </p>
        </section>

        <section className="legal-section">
          <h2>Third-Party Links and Children&apos;s Privacy</h2>
          <p>
            External websites are governed by their own policies. Our services are not directed to children under 18, and we do
            not knowingly collect their personal information.
          </p>
        </section>

        <section className="legal-section">
          <h2>Policy Updates and Contact</h2>
          <p>We may revise this policy over time and will update the date above when changes are posted.</p>
          <div className="legal-contact">
            <p>
              <strong>True North Data Strategies LLC</strong>
            </p>
            <p>
              Email:{' '}
              <a className="legal-link" href="mailto:jacob@truenorthstrategyops.com">
                jacob@truenorthstrategyops.com
              </a>
            </p>
            <p>Colorado Springs, CO</p>
          </div>
        </section>
      </div>
    </main>
  );
}
