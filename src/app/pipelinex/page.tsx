import type { Metadata } from 'next';
import Link from 'next/link';
import PipelineXDemo from '@/components/PipelineXDemo';
import PipelineXVisualTabs from '@/components/PipelineXVisualTabs';

export const metadata: Metadata = {
  title: 'PipelineX — Your Business Knowledge Hub',
  description:
    'PipelineX connects your documents, data, and tools into one system you can talk to. Ask questions in plain English, generate proposals, send follow-ups — all from one place.',
};

const includedFeatures = [
  { icon: '🗂️', title: 'Knowledge Base', desc: 'Upload your SOPs, contracts, price sheets, and playbooks. PipelineX reads them and makes them searchable.' },
  { icon: '🔗', title: 'HubSpot Integration', desc: 'Connect your HubSpot CRM (or your existing CRM). Contacts, deals, and activity flow in automatically.' },
  { icon: '📄', title: 'Proposal Generator', desc: 'Turn a client conversation into a formatted proposal in minutes — not hours.' },
  { icon: '📧', title: 'Email Templates', desc: 'Pre-built follow-up and outreach emails that match your voice. Edit before you send. Always.' },
  { icon: '🤖', title: 'Your Choice of AI', desc: 'Runs on Ollama (local, private) out of the box. Connect to OpenAI, Claude, or Gemini if you prefer.' },
  { icon: '💬', title: 'Plain English Queries', desc: 'Ask it anything about your business. It only answers from your actual documents — no made-up answers.' },
];

const addOnModules = [
  'Financial dashboard — see revenue, expenses, and margins at a glance',
  'Fleet &amp; asset tracking — know where your equipment is and when it was last serviced',
  'Client onboarding automation — new clients trigger a workflow, not a to-do list',
  'SMS alerts — get a text when something needs your attention',
  'Google Workspace integration — Docs, Sheets, Gmail, Calendar all connected',
  'Government contracting module — tracks compliance, deadlines, and deliverables',
  'Custom prompts and skills — trained on your specific business processes',
];

export default function PipelineXPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-tn-teal/10 border border-tn-teal/30 rounded-full px-4 py-1.5 mb-6 text-sm text-tn-teal font-medium">
            Your Operations Hub — Built for Small Business
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            PipelineX
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            One place to store your business knowledge, connect your tools,
            generate proposals, and ask questions — in plain English.
          </p>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            No tech background required. If you can send an email, you can use PipelineX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:555-555-5555" className="btn-primary text-lg px-8">Call Jacob: 555-555-5555</a>
            <Link href="/contact" className="btn-outline text-lg px-8">Book a Free Call</Link>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-16 px-4 section-gradient">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-3 text-center">What Comes With PipelineX</h2>
          <p className="text-gray-400 text-center mb-10">Every deployment includes these six core capabilities. No extra cost.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedFeatures.map((f) => (
              <div key={f.title} className="card card-hover">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-tn-teal font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-3 text-center">See It In Action</h2>
          <p className="text-gray-400 text-center mb-8">
            Click a prompt below to see a real response from PipelineX. These are actual outputs — not marketing copy.
          </p>
          <PipelineXDemo />
        </div>
      </section>

      {/* PRODUCT VIEWS */}
      <section className="py-16 px-4 section-gradient">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-3 text-center">PipelineX Product Views</h2>
          <p className="text-gray-400 text-center mb-8">
            A quick look at the tabbed workspace style from the PipelineX template.
          </p>
          <PipelineXVisualTabs />
        </div>
      </section>

      {/* ADD-ON MODULES */}
      <section className="py-16 px-4 section-gradient">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-3 text-center">Add-On Modules</h2>
          <p className="text-gray-400 text-center mb-8">
            Once PipelineX is live, you can add capabilities as your needs grow.
            Each module is scoped and priced separately — you only pay for what you actually need.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addOnModules.map((mod, i) => (
              <div key={i} className="card flex items-start gap-3">
                <span className="text-tn-teal flex-shrink-0 mt-0.5">+</span>
                <p className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: mod }} />
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Not sure what you need? That&apos;s what the first call is for. We figure it out together.
          </p>
        </div>
      </section>

      {/* AI EXPLAINER */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card border-tn-teal/30 border">
            <h2 className="text-2xl font-heading font-bold text-white mb-4">How the AI Part Works — In Plain English</h2>
            <p className="text-gray-300 mb-3">
              PipelineX uses AI the same way a calculator uses math. It&apos;s a tool that processes information fast.
              You give it your documents and data. It learns them. When you ask a question, it looks through
              what you gave it and returns an answer — not a guess.
            </p>
            <p className="text-gray-300 mb-3">
              If it doesn&apos;t have the information (like in the demo screenshot above), it tells you that.
              It doesn&apos;t make things up. That&apos;s by design.
            </p>
            <p className="text-gray-300 mb-3">
              Your data stays private. Runs locally on Ollama by default. If you connect to OpenAI, Claude,
              or Gemini, that&apos;s your choice — and you control what gets sent where.
            </p>
            <p className="text-tn-teal font-semibold">
              Bottom line: AI does the searching. Your people still do the deciding.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center cta-card rounded-2xl p-10">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-6">
            Every PipelineX deployment starts with a conversation. We scope it together, price it upfront, and build it.
            Fixed scope. Fixed price. You own everything when we&apos;re done.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:555-555-5555" className="btn-primary text-lg px-8">Call Jacob: 555-555-5555</a>
            <Link href="/contact" className="btn-outline text-lg px-8">Book a Free 15-Min Call</Link>
          </div>
        </div>
      </section>
    </>
  );
}
