import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Common Questions About PipelineX and Business Automation',
  description:
    'Honest answers to the questions small business owners ask before working with True North Data Strategies. No jargon.',
};

const faqs = [
  {
    q: "I'm not tech-savvy at all. Is this going to be over my head?",
    a: "No. If you can send an email, you can use PipelineX. We set everything up for you. We train you and your team. And we write documentation that explains how things work in plain English — not tech speak. Our job is to make it simple, not to impress you with complexity.",
  },
  {
    q: "What does AI actually do here? Is it going to replace my people?",
    a: "No. Think of AI the same way you think of a calculator — it processes information fast so you don't have to do it manually. PipelineX uses AI to search your documents, pull data, and generate drafts. Your people still make the decisions, do the work, and talk to customers. AI just means they spend less time digging for information.",
  },
  {
    q: "Do I need HubSpot to use PipelineX?",
    a: "No. PipelineX works with or without HubSpot. If you already have HubSpot, we integrate with it. If you use a different CRM, we connect to that. If you don't have a CRM at all, we can help you set one up as part of the engagement.",
  },
  {
    q: "How much does this cost?",
    a: "Every deployment is scoped individually based on what you actually need. We don't publish a price list because one-size pricing leads to bloated projects or under-built systems. What I can tell you: we price by fixed scope, not by the hour. You know the cost before we start. There are no surprise invoices.",
  },
  {
    q: "How long does it take to build?",
    a: "Most deployments are complete in 2–4 weeks. It depends on how many integrations you need and how much content we're loading into the knowledge base. We'll give you a firm timeline before we start.",
  },
  {
    q: "What if my team won't use it?",
    a: "That's the real question most software companies dodge. Our answer: we build it simple enough that they will. We involve your team in the setup, we train everyone hands-on, and we document everything so there's no excuse not to use it. If adoption is still a problem after go-live, we're one call away.",
  },
  {
    q: "Is my business data safe?",
    a: "Yes. PipelineX runs on Ollama by default — that's a local AI model that never sends your data to any outside server. If you choose to connect to OpenAI, Claude, or Gemini, you control what gets shared. We treat all client data as if it's regulated regardless of industry.",
  },
  {
    q: "What happens after it's built? Do I have to pay a monthly fee forever?",
    a: "No. You own what we build. There are no required ongoing fees. Some clients want monthly check-ins and tune-ups — we offer that selectively. But the base system is yours. It keeps running whether you pay us anything after go-live or not.",
  },
  {
    q: "Can I just call you?",
    a: "Yes. (555) 555-5555. I answer my own phone.",
  },
];

export default function FAQPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-300 text-lg">
              Honest answers. No jargon. If you don&apos;t see your question here, just call.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="card group cursor-pointer">
                <summary className="font-semibold text-white text-lg leading-snug cursor-pointer list-none flex items-start justify-between gap-4">
                  <span>{faq.q}</span>
                  <span className="text-tn-teal flex-shrink-0 mt-0.5 text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <a href="tel:555-555-5555" className="btn-primary text-lg px-8">
              Call Jacob: (555) 555-5555
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
