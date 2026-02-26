import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Accessibility commitment and feedback channel for Pipeline Penny.',
};

export default function AccessibilityPage() {
  return (
    <main className="legal-page">
      <h1>Accessibility Statement</h1>
      <p className="legal-updated">Last Updated: January 21, 2026</p>
      <p className="legal-intro">
        True North Data Strategies LLC is committed to improving digital accessibility for all users, including people with
        disabilities.
      </p>

      <div className="legal-card">
        <section className="legal-section">
          <h2>Our Commitment</h2>
          <p>
            We work to provide an inclusive experience and continuously improve usability and accessibility across this website
            and Pipeline Penny interfaces.
          </p>
        </section>

        <section className="legal-section">
          <h2>Standards</h2>
          <p>
            Our goal is alignment with WCAG 2.1 Level AA guidance where practical, including semantic structure, keyboard
            usability, and readability standards.
          </p>
        </section>

        <section className="legal-section">
          <h2>Accessibility Features</h2>
          <ul>
            <li>Keyboard-accessible interactive elements</li>
            <li>Semantic heading and content structure</li>
            <li>Alt text for meaningful imagery</li>
            <li>Visible focus states and responsive layouts</li>
            <li>Color and contrast considerations for readability</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Known Limitations</h2>
          <p>
            Some third-party content or externally hosted documents may not be fully accessible. We evaluate improvements as
            content and tools evolve.
          </p>
        </section>

        <section className="legal-section">
          <h2>Feedback and Contact</h2>
          <p>
            If you encounter an accessibility issue, email us with the page URL and a short description. We target response
            within 2 business days.
          </p>
          <div className="legal-contact">
            <p>
              <strong>Accessibility Contact</strong>
            </p>
            <p>
              Email:{' '}
              <a className="legal-link" href="mailto:jacob@truenorthstrategyops.com">
                jacob@truenorthstrategyops.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
