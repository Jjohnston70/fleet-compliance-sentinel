import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of the Pipeline Penny website and related services.',
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <h1>Terms of Service</h1>
      <p className="legal-updated">Last Updated: January 21, 2026</p>
      <p className="legal-intro">
        These Terms of Service (&quot;Terms&quot;) govern your use of the Pipeline Penny website and services operated by True North
        Data Strategies LLC.
      </p>

      <div className="legal-card">
        <section className="legal-section">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using our services, you agree to these Terms. If you do not agree, do not use the services.
          </p>
        </section>

        <section className="legal-section">
          <h2>Services Provided</h2>
          <ul>
            <li>AI-powered business knowledge search and answer workflows</li>
            <li>Document ingestion and operational support tooling</li>
            <li>Advisory and implementation services as defined in individual agreements</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>User Responsibilities</h2>
          <ul>
            <li>Provide accurate information and maintain account security</li>
            <li>Use services lawfully and without unauthorized system access attempts</li>
            <li>Respect applicable regulations and intellectual property rights</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Intellectual Property</h2>
          <p>
            Platform and site content remain the property of True North Data Strategies LLC or its licensors. Client-owned
            deliverables are governed by signed service agreements.
          </p>
        </section>

        <section className="legal-section">
          <h2>Payment Terms</h2>
          <p>Commercial terms, billing schedules, and scope are defined in project statements and service agreements.</p>
        </section>

        <section className="legal-section">
          <h2>Disclaimers</h2>
          <p>
            Services are provided &quot;as is&quot; and &quot;as available.&quot; We disclaim implied warranties to the fullest extent allowed by
            law.
          </p>
        </section>

        <section className="legal-section">
          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we are not liable for indirect or consequential damages. Aggregate liability
            is limited to amounts paid for services in the 12 months before a claim, unless otherwise required by law.
          </p>
        </section>

        <section className="legal-section">
          <h2>Confidentiality and Termination</h2>
          <p>
            We protect confidential information shared during engagements. We may suspend or terminate access for violations of
            these Terms or misuse of the services.
          </p>
        </section>

        <section className="legal-section">
          <h2>Governing Law</h2>
          <p>These Terms are governed by Colorado law, with venue in Colorado Springs, Colorado, United States.</p>
        </section>

        <section className="legal-section">
          <h2>Updates and Contact</h2>
          <p>We may update these Terms periodically. Continued use after changes means acceptance of updated Terms.</p>
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
