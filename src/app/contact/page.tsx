import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — Talk to Jacob',
  description:
    'Call Jacob at 555-555-5555 or book a free 15-minute call. No pitch. Just an honest conversation about what\'s going on in your business.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact — Talk to Jacob | True North Data Strategies',
    description:
      'Call Jacob at 555-555-5555 or book a free 15-minute call. No pitch. Just an honest conversation about what\'s going on in your business.',
    url: '/contact',
    siteName: 'True North Data Strategies',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'True North Data Strategies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact — Talk to Jacob | True North Data Strategies',
    description:
      'Call Jacob at 555-555-5555 or book a free 15-minute call. No pitch. Just an honest conversation about what\'s going on in your business.',
    images: ['/og-default.png'],
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Call Jacob. Get Clear on What&apos;s Broken.
            </h1>
            <p className="text-xl text-gray-300 max-w-xl mx-auto">
              Tell me what&apos;s going on in your business, and I&apos;ll tell you if I can help.
              No pitch. No pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Phone - Primary */}
            <div className="card border-tn-teal/40 border-2 text-center">
              <div className="text-4xl mb-3">📞</div>
              <h2 className="text-xl font-semibold text-white mb-1">Call or Text</h2>
              <p className="text-gray-400 text-sm mb-4">Mon–Fri, 9am–5pm MST. I answer my own phone.</p>
              <a href="tel:555-555-5555" className="btn-primary w-full justify-center text-lg">
                (555) 555-5555
              </a>
            </div>

            {/* Book */}
            <div className="card text-center">
              <div className="text-4xl mb-3">📅</div>
              <h2 className="text-xl font-semibold text-white mb-1">Book a Call</h2>
              <p className="text-gray-400 text-sm mb-4">Pick a time that works. 15-min intro or 45-min deep dive.</p>
              <div className="space-y-3">
                <a
                  href="https://calendar.app.google/2RpoQoNZjBQZAens6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full justify-center"
                >
                  15-Min Intro Call
                </a>
                <a
                  href="https://calendar.app.google/ebjteKmafGppTJ1P7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full justify-center"
                >
                  45-Min Deep Dive
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-2">Send a Message</h2>
            <p className="text-gray-400 text-sm mb-6">I&apos;ll reply same day on weekdays. Email is secondary — calling is faster.</p>
            <ContactForm />
          </div>

          {/* What happens next */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">What Happens Next</h2>
            <div className="space-y-4">
              {[
                { n: '1', t: 'I respond fast', d: 'Usually same day on weekdays. I read every message myself.' },
                { n: '2', t: 'Quick conversation', d: '15 minutes. I ask about your operation. You tell me what\'s broken.' },
                { n: '3', t: 'Clear proposal', d: 'If there\'s a fit, I send you a fixed price and timeline. No guesswork.' },
                { n: '4', t: 'We build it', d: 'You go live. You own everything. No ongoing fees unless you want support.' },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <div className="bg-tn-teal/20 text-tn-teal font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm">
                    {s.n}
                  </div>
                  <div>
                    <p className="text-white font-medium">{s.t}</p>
                    <p className="text-gray-400 text-sm">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
