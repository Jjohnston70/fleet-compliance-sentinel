import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal — Privacy Policy, Terms of Service, Accessibility',
  description: 'Privacy policy, terms of service, and accessibility statement for True North Data Strategies LLC.',
  alternates: {
    canonical: '/legal',
  },
  openGraph: {
    title: 'Legal — Privacy Policy, Terms of Service, Accessibility | True North Data Strategies',
    description: 'Privacy policy, terms of service, and accessibility statement for True North Data Strategies LLC.',
    url: '/legal',
    siteName: 'True North Data Strategies',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'True North Data Strategies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal — Privacy Policy, Terms of Service, Accessibility | True North Data Strategies',
    description: 'Privacy policy, terms of service, and accessibility statement for True North Data Strategies LLC.',
    images: ['/og-default.png'],
  },
};

export default function LegalPage() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-heading font-bold text-white mb-4">Legal</h1>
        <p className="text-gray-400 mb-10 text-sm">True North Data Strategies LLC · Colorado Springs, CO · UEI: WKJXXACV8U43</p>

        <div className="flex gap-4 mb-10 flex-wrap">
          <a href="#privacy" className="text-tn-teal hover:underline text-sm">Privacy Policy</a>
          <a href="#terms" className="text-tn-teal hover:underline text-sm">Terms of Service</a>
          <a href="#accessibility" className="text-tn-teal hover:underline text-sm">Accessibility</a>
        </div>

        <div id="privacy" className="card mb-8 scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Privacy Policy</h2>
          <p className="text-gray-300 text-sm mb-3">Effective: January 1, 2026</p>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>True North Data Strategies LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) respects your privacy. This policy describes what information we collect and how we use it.</p>
            <h3 className="text-white font-semibold">What we collect</h3>
            <p>When you fill out our contact form or book a call, we collect your name, phone number, email address, and any information you voluntarily provide. We also collect standard server logs (IP address, browser type, pages visited) for security purposes.</p>
            <h3 className="text-white font-semibold">How we use it</h3>
            <p>We use your contact information to respond to your inquiry and schedule calls. We do not sell your information to third parties. We do not use it for advertising. We store contact form submissions in a Google Sheet accessible only to authorized personnel.</p>
            <h3 className="text-white font-semibold">Cookies</h3>
            <p>This site uses minimal cookies — only what is technically necessary to serve the site. We do not use advertising cookies or cross-site tracking.</p>
            <h3 className="text-white font-semibold">Your rights</h3>
            <p>You may request deletion of your contact information at any time by emailing jacob@truenorthstrategyops.com or calling (555) 555-5555.</p>
            <h3 className="text-white font-semibold">Contact</h3>
            <p>jacob@truenorthstrategyops.com · (555) 555-5555 · Colorado Springs, CO</p>
          </div>
        </div>

        <div id="terms" className="card mb-8 scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Terms of Service</h2>
          <p className="text-gray-300 text-sm mb-3">Effective: January 1, 2026</p>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>By using this website or engaging True North Data Strategies LLC for services, you agree to the following terms.</p>
            <h3 className="text-white font-semibold">Services</h3>
            <p>We provide business automation consulting, software development, and operational systems to small and medium businesses. All engagements are governed by a separate written agreement (Statement of Work) with fixed scope and fixed price.</p>
            <h3 className="text-white font-semibold">Ownership</h3>
            <p>Upon full payment, clients own all deliverables built specifically for them. We retain the right to reuse general techniques, frameworks, and non-proprietary code patterns.</p>
            <h3 className="text-white font-semibold">No warranty on website content</h3>
            <p>This website is provided for informational purposes. We make no warranty that the information is complete or error-free. Pricing and availability are subject to change.</p>
            <h3 className="text-white font-semibold">Limitation of liability</h3>
            <p>True North Data Strategies LLC is not liable for any indirect, incidental, or consequential damages arising from use of this website or our services beyond the fees paid for those services.</p>
            <h3 className="text-white font-semibold">Governing law</h3>
            <p>These terms are governed by the laws of the State of Colorado, without regard to conflict of law provisions.</p>
          </div>
        </div>

        <div id="accessibility" className="card scroll-mt-24">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Accessibility Statement</h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>True North Data Strategies LLC is committed to ensuring digital accessibility for people with disabilities. We aim to meet WCAG 2.1 Level AA guidelines.</p>
            <h3 className="text-white font-semibold">Our efforts include</h3>
            <p>Keyboard navigation support, sufficient color contrast ratios, ARIA labels on interactive elements, skip navigation links, and respecting user motion and contrast preferences.</p>
            <h3 className="text-white font-semibold">Known limitations</h3>
            <p>We are a small business and may have gaps. We are actively working to identify and resolve them.</p>
            <h3 className="text-white font-semibold">Report an issue</h3>
            <p>If you encounter an accessibility barrier, please contact us: jacob@truenorthstrategyops.com or (555) 555-5555. We will respond within 2 business days.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
