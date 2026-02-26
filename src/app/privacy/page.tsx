import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How True North Data Strategies collects, uses, and protects personal information for Pipeline Penny.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last Updated: January 21, 2026</p>
      <p className="legal-intro">
        True North Data Strategies LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy when you
        use this website and Pipeline Penny services.
      </p>

      <div className="legal-card">
        <section className="legal-section">
          <h2>Information We Collect</h2>
          <p>We collect personal information you provide directly and technical usage information collected automatically.</p>
          <ul>
            <li>Directly provided: name, email, phone, company details, and submitted business documents</li>
            <li>Automatically collected: IP address, browser/device details, page usage, and referral data</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>How We Use Information</h2>
          <ul>
            <li>Provide and improve Pipeline Penny services</li>
            <li>Respond to support and sales inquiries</li>
            <li>Maintain service security and prevent abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Information Sharing</h2>
          <p>We do not sell personal information. We only share data when needed to operate services or comply with law.</p>
          <ul>
            <li>Trusted service providers under confidentiality obligations</li>
            <li>Legal requests or rights/safety protection</li>
            <li>Business transfer events (merger/acquisition/asset sale)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Security and Retention</h2>
          <p>
            We apply administrative, technical, and organizational safeguards, including encrypted transport and restricted access.
            Data is retained only as long as required for legitimate business and legal purposes.
          </p>
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
            We support GDPR and CCPA principles, including transparency, lawful processing, and user rights management.
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
