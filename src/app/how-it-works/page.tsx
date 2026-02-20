import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works — From First Call to Go-Live',
  description:
    'Five steps from "is there a fit?" to a live system running your business. Fixed scope, fixed price, no surprises.',
};

const steps = [
  {
    num: '1',
    name: 'Identify',
    time: '15–20 minutes',
    title: 'Is there a fit?',
    desc: 'We get on the phone. No pitch, no slide deck. You tell me what\'s going on. I ask questions. At the end of 20 minutes, we both know if there\'s something worth talking about further.',
    outcome: 'You know if we\'re a match. No obligation either way.',
  },
  {
    num: '2',
    name: 'Assess',
    time: '30 minutes',
    title: 'Is the problem real?',
    desc: 'We go deeper. I learn how your operation actually runs — where information lives, what your team does every day, what falls through the cracks, what takes too long.',
    outcome: 'I know your operation. You know I\'m paying attention.',
  },
  {
    num: '3',
    name: 'Map',
    time: '90–120 minutes',
    title: 'What\'s broken and what\'s needed?',
    desc: 'This is the real work session. We map your full operation — data flows, tool connections, broken handoffs, time sinks. This is how we make sure we build the right thing, not just something.',
    outcome: 'Complete picture of your operation. Nothing assumed.',
  },
  {
    num: '4',
    name: 'Chart',
    time: '30–45 minutes',
    title: 'Here\'s the plan. Here\'s the price.',
    desc: 'I present what we found and exactly what we\'d build to fix it. Fixed scope. Fixed price. You know what you\'re getting, what it costs, and when it will be done. No open-ended projects.',
    outcome: 'A clear proposal. You say yes or no. That simple.',
  },
  {
    num: '5',
    name: 'Launch',
    time: '2–4 weeks',
    title: 'We build it. You go live.',
    desc: 'We build, test, and deploy. We train your team. We document everything. You go live with a system that works the day we hand it over.',
    outcome: 'You own everything. It runs whether you call us again or not.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              From First Call to Go-Live
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Five steps. No surprises. Fixed price before we start. Here&apos;s exactly what working with us looks like.
            </p>
          </div>

          <div className="space-y-6 mb-14">
            {steps.map((s) => (
              <div key={s.num} className="card card-hover">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-tn-teal/20 text-tn-teal font-bold text-xl rounded-full w-12 h-12 flex items-center justify-center">
                      {s.num}
                    </div>
                    <p className="text-tn-teal text-xs font-semibold mt-1 uppercase tracking-wider">{s.name}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-white font-semibold text-lg">{s.title}</h2>
                      <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded-full">{s.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{s.desc}</p>
                    <div className="flex items-start gap-2">
                      <span className="text-tn-teal text-xs font-semibold uppercase tracking-wide flex-shrink-0 mt-0.5">Outcome:</span>
                      <p className="text-gray-400 text-sm">{s.outcome}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card border-tn-teal/30 border mb-10">
            <h2 className="text-xl font-heading font-bold text-white mb-3">Our Promise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {[
                { icon: '🔒', label: 'Fixed Scope', desc: 'No scope creep. We build what we said we\'d build.' },
                { icon: '💰', label: 'Fixed Price', desc: 'You know the cost before we start. Zero surprises.' },
                { icon: '🏠', label: 'You Own It', desc: 'Everything we build is yours. Forever. No subscriptions required.' },
              ].map((p) => (
                <div key={p.label}>
                  <div className="text-2xl mb-1">{p.icon}</div>
                  <p className="text-white font-semibold text-sm">{p.label}</p>
                  <p className="text-gray-400 text-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Ready to Start with Step 1?</h2>
            <p className="text-gray-400 mb-6">It&apos;s a 15-minute phone call. That&apos;s it. No commitment beyond that.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:555-555-5555" className="btn-primary text-lg px-8">Call Jacob: 555-555-5555</a>
              <Link href="/contact" className="btn-outline text-lg px-8">Book a Free 15-Min Call</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
