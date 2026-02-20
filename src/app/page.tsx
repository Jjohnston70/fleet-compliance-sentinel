import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'True North Data Strategies | Your Business, Organized',
  description:
    'PipelineX connects your tools, your documents, and your data into one system you can actually talk to. Veteran-owned. Colorado Springs.',
};

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden py-20 md:py-28 px-4">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-tn-teal/10 border border-tn-teal/30 rounded-full px-4 py-1.5 mb-6 text-sm text-tn-teal font-medium">
            SBA-Certified VOSB &amp; SDVOSB &nbsp;·&nbsp; Veteran-Owned &nbsp;·&nbsp; Colorado Springs
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            Your business runs on spreadsheets, text messages, and somebody&apos;s memory.
            <span className="text-tn-teal block mt-2">We fix that.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            PipelineX connects your tools, your documents, and your data into one system
            you can actually talk to — in plain English. No tech background required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:555-555-5555" className="btn-primary text-lg px-8">
              Call Jacob: 555-555-5555
            </a>
            <Link href="/contact" className="btn-outline text-lg px-8">
              Book a Free 15-Min Call
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">No pitch. No pressure. We talk, and I&apos;ll tell you if I can help.</p>
        </div>
      </section>

      {/* DOES THIS SOUND LIKE YOU */}
      <section className="py-16 px-4 section-gradient">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4 text-center">
            Does This Sound Like Your Business?
          </h2>
          <p className="text-gray-400 text-center mb-10">If you said yes to any of these, keep reading.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "I can't tell if my team finished a job today without calling them.",
              "I don't actually know how much money I made last month until my bookkeeper tells me.",
              "If I take a week off, something falls apart.",
              "My most important information lives in someone's head, a text thread, or a spreadsheet nobody else understands.",
              "I've paid for software that nobody uses because it was too complicated.",
              "I'm the only one who knows how to do half the things in this business.",
            ].map((item, i) => (
              <div key={i} className="card flex items-start gap-3">
                <span className="text-tn-teal text-xl mt-0.5 flex-shrink-0">✓</span>
                <p className="text-gray-200">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-tn-teal font-semibold mt-8 text-lg">
            That&apos;s exactly the problem PipelineX was built to solve.
          </p>
        </div>
      </section>

      {/* WHAT IS PIPELINEX */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              What Is PipelineX?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Think of it like hiring a really organized assistant who read every document in your business,
              connected to every tool you use, and is available 24/7 to answer questions and get things done.
              Except it&apos;s software. And it doesn&apos;t call in sick.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: '🗂️',
                title: 'Your Documents, Searchable',
                desc: 'Upload your SOPs, price sheets, contracts, and playbooks. PipelineX reads them and lets you ask questions in plain English.',
              },
              {
                icon: '🔗',
                title: 'Your Tools, Connected',
                desc: 'Works with HubSpot, your CRM, Google Sheets, email, and more. No ripping out what you already use.',
              },
              {
                icon: '💬',
                title: 'Ask It Like a Person',
                desc: '"What\'s the status of the Johnson proposal?" "What does our refund policy say?" Real answers, instantly.',
              },
            ].map((card) => (
              <div key={card.title} className="card card-hover text-center">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-tn-teal font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-300 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/pipelinex" className="btn-primary text-lg px-8">
              See Everything PipelineX Does →
            </Link>
          </div>
        </div>
      </section>

      {/* AI IS A TOOL, NOT A REPLACEMENT */}
      <section className="py-16 px-4 section-gradient">
        <div className="container mx-auto max-w-4xl">
          <div className="card border-tn-teal/30 border-2">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
              A Word About AI — Because You&apos;ve Probably Heard a Lot of Hype
            </h2>
            <p className="text-gray-300 mb-4">
              AI is a tool. Like a really good calculator, or a really organized filing cabinet that can answer questions.
              It doesn&apos;t replace your people. It doesn&apos;t make decisions for you. It doesn&apos;t run your business.
            </p>
            <p className="text-gray-300 mb-4">
              What it does: it takes the information that already exists in your business — your documents, your data,
              your processes — and makes it accessible in a way that saves your team hours every week.
            </p>
            <p className="text-tn-teal font-semibold">
              Your people still do the work. PipelineX just makes sure they&apos;re not wasting time looking for information,
              re-entering data, or asking you the same questions over and over.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS PREVIEW */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-10 text-center">Here&apos;s How We Get You There</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'We talk. (15–20 minutes)', desc: 'No pitch. I ask you what\'s broken. You tell me. We figure out if there\'s a fit.' },
              { step: '2', title: 'We dig in. (30 minutes)', desc: 'I learn how your operation actually works — where stuff lives, what gets dropped, what takes too long.' },
              { step: '3', title: 'We map it. (90–120 minutes)', desc: 'Full picture of your operation. Where data lives, where it breaks, what\'s costing you time and money.' },
              { step: '4', title: 'We show you the plan. (30–45 minutes)', desc: 'Here\'s what we found. Here\'s what we\'d build. Here\'s the fixed price. No surprises.' },
              { step: '5', title: 'We build it.', desc: 'You go live. You see what\'s happening in your business for the first time. You start taking Fridays off.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 card">
                <div className="bg-tn-teal/20 text-tn-teal font-bold text-lg rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/how-it-works" className="text-tn-teal hover:underline">
              See the full process →
            </Link>
          </div>
        </div>
      </section>

      {/* WHY JACOB */}
      <section className="py-16 px-4 section-gradient">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-shrink-0">
              <Image
                src="/headshot.png"
                alt="Jacob Johnston, Founder of True North Data Strategies"
                width={200}
                height={200}
                className="rounded-full border-2 border-tn-teal/30 w-44 h-44 object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                Built by a Veteran Who Got Tired of Watching Businesses Drown in Spreadsheets
              </h2>
              <p className="text-gray-300 mb-3">
                I spent 20 years in the Army — Airborne Infantry, multiple combat deployments, Bronze Star.
                After I got out, I went to work in operations at a fuel distribution company.
                Same problem everywhere I looked: talented people buried in manual work, owners who couldn&apos;t
                see what was actually happening, and expensive software that nobody used.
              </p>
              <p className="text-gray-300 mb-4">
                At 53, I taught myself to code. Not to become a software engineer — to fix the problem.
                I&apos;ve built 50+ systems running real businesses. Fixed scope, fixed price. You own what we build.
              </p>
              <Link href="/about" className="text-tn-teal hover:underline text-sm">
                Read the full story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center cta-card rounded-2xl p-10">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Stop Guessing and Start Seeing?
          </h2>
          <p className="text-gray-300 mb-6">
            Let&apos;s spend 15 minutes on the phone. You tell me what&apos;s going on, and I&apos;ll tell you if I can help.
            No obligation. No sales deck.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:555-555-5555" className="btn-primary text-lg px-8">
              Call Jacob: 555-555-5555
            </a>
            <Link href="/contact" className="btn-outline text-lg px-8">
              Book a Free 15-Min Call
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
