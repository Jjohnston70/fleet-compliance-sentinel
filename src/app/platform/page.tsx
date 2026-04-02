import Link from 'next/link';
import Image from 'next/image';

// ─── Core modules ─────────────────────────────────────────────────────────────

const coreModules = [
  {
    name: 'Fleet-Compliance Sentinel',
    tag: 'LIVE',
    tagColor: 'green',
    headline: 'Your full compliance dashboard — drivers, trucks, permits, and deadlines in one place.',
    detail: `Every driver CDL expiration, medical card renewal, drug test record, and hazmat
endorsement tracked in one dashboard. Every truck VIN, inspection date, and maintenance
schedule in the same place. Every DOT permit and state license renewal on a countdown.
Daily automated email sweeps go out at 8am so you know what is coming before it is
overdue. If your DOT examiner showed up today, you would have everything they need —
in one screen, not a stack of folders.`,
    bullets: [
      'Driver CDL, medical card, MVR, and drug test tracking',
      'Vehicle and equipment inventory with inspection schedules',
      'DOT permit and state license renewals with automatic countdown alerts',
      'Daily compliance email sweep — overdue, 7-day, 14-day, 30-day windows',
      'Open action item queue with severity, owner, and due date',
      'FMCSA carrier safety lookup — pull any carrier\'s federal safety record live',
      'Bulk data import from your existing Excel spreadsheets',
      'Compliance training platform — 31 modules, auto-updates driver records on completion',
      'AI invoice extraction — automated parsing for your vendor invoices (customizable vendor list)',
    ],
  },
  {
    name: 'Pipeline Penny — AI Compliance Assistant',
    tag: 'PROFESSIONAL+',
    tagColor: 'blue',
    headline: 'Ask a compliance question. Get the regulation AND a status check on your fleet — at the same time.',
    detail: `Most AI tools give you a general answer and leave you to figure out whether your
drivers actually meet the standard. Penny does both steps at once. She is loaded with
13 sections of the federal DOT/FMCSA regulatory manual — the same rulebook your
examiner uses — and she has your fleet data open on the other screen. Ask her "are
my drivers current on medical certificates under Part 391?" and she will cite the
exact CFR section and show you which of your drivers pass, which are expiring, and
which are already out of window. No guessing. No digging. She shows her sources
every time so you can verify.`,
    bullets: [
      'Grounded in 49 CFR Parts 040-397 — the actual federal regulation text',
      'Cross-references your live driver records, CDL status, and permit data',
      'Source citations on every answer — you see exactly which CFR section applies',
      'Answers in plain English, not legal language',
      'Runs on your choice of AI engine: Claude, GPT-4o, Gemini, or local Ollama',
      'Your fleet data never trains an AI model',
    ],
  },
  {
    name: 'Compliance Training Platform',
    tag: 'NOW LIVE',
    tagColor: 'blue',
    headline: 'Train your drivers on the same regulations Penny answers from — and have it update their compliance records automatically.',
    detail: `When a driver finishes a training module, their compliance record updates automatically.
No separate login. No separate system. No PDF you have to manually file somewhere. The
training content is built directly from the federal source documents — ERG 2024, CFR,
and PHMSA requirements — so what your drivers learn matches what your examiner checks.
Starting with hazmat. Expanding to all DOT compliance topics.`,
    bullets: [
      '12 required PHMSA hazmat training modules',
      '6 NFPA Awareness modules',
      '12 NFPA Operations modules',
      'Plus supplemental DOT/CFR compliance training',
      'Completion automatically updates driver compliance records',
      'Certification tracking with expiration alerts',
      'No separate LMS login — built into your Fleet-Compliance dashboard',
    ],
  },
  {
    name: 'Telematics and Fleet Monitoring',
    tag: 'PROFESSIONAL+',
    tagColor: 'blue',
    headline: 'Connect your existing GPS and ELD provider. Keep your hardware. Get the data where you need it.',
    detail: `You already have Geotab, Samsara, or Verizon Reveal on your trucks. You should not
have to switch providers or buy new hardware to get that data into your compliance
system. Fleet-Compliance Sentinel pulls vehicle location, driver hours-of-service,
ELD status, and risk scores directly from your existing provider account. Everything
lands in your compliance dashboard alongside your driver files and permit records —
one place to check before a roadside inspection. Available on Professional and Enterprise plans.`,
    bullets: [
      'Geotab — vehicle tracking, driver behavior, HOS monitoring',
      'Samsara — real-time GPS, ELD compliance, fleet safety scoring',
      'Verizon Reveal Connect — vehicle diagnostics, route optimization, driver performance',
      'No new hardware required — uses your existing account',
      'Risk scoring dashboard shows which vehicles and drivers need attention',
      'Additional providers added on request',
    ],
  },
];

// ─── Enterprise modules ───────────────────────────────────────────────────────

const enterpriseModules = [
  {
    name: 'Command Center',
    headline: 'One control panel. Every tool. Nothing falls through the cracks.',
    detail: `When you have multiple systems running — compliance tracking, training, invoices,
telematics — they usually do not talk to each other. Command Center is the hub that
connects all of it. Instead of logging into five different places, you have one
dashboard that shows what is running, what needs attention, and what is waiting on you.
Think of it as your operations nerve center.`,
    bullets: [] as string[],
  },
  {
    name: 'GovCon Command',
    headline: 'Find federal contracts your business actually qualifies for — and track them through the bid process.',
    detail: `Federal contracting is one of the most reliable revenue streams available to an
SDVOSB — but most small businesses never pursue it because the process is overwhelming.
GovCon Command searches active federal opportunities and scores each one: does this
contract match your size, your certifications, your past performance? You get a
scored list of real opportunities. Designed specifically for SDVOSB/VOSB businesses.`,
    bullets: [
      'Federal opportunity search filtered by NAICS code and set-aside type',
      'Weighted bid/no-bid scoring based on your certifications and capacity',
      'SDVOSB pipeline tracking from opportunity to award',
      'SAM.gov and SBA data integrated',
    ],
  },
  {
    name: 'Compliance Command',
    headline: 'One intake form. Seven compliance packages — ready to hand to an auditor or procurement team.',
    detail: `Building compliance documentation from scratch takes weeks and costs thousands in
consultant fees. Compliance Command generates the full package from a single intake
form. Answer questions about your business, your data, and your operations — and get
production-ready compliance documents back. Covers SOC 2, privacy, security, and
government contracting requirements.`,
    bullets: [
      'Privacy policy tailored to your actual data practices',
      'Security policy aligned to your infrastructure',
      'Incident response plan with your contact chain',
      'Data retention and deletion procedures',
      'Vendor risk assessment templates',
      'Employee security awareness policy',
      'Government contracting compliance documentation',
    ],
  },
  {
    name: 'Financial Command',
    headline: 'Know where your money is going without hiring an accountant.',
    detail: `Financial Command connects to your expense data and does the categorization,
variance tracking, and cash flow projection work automatically. You see where you are
over budget, where costs are trending up, and what your next 90 days look like
financially — without building spreadsheets. Tax season becomes less painful because
the categories are already sorted.`,
    bullets: [
      'Automatic expense categorization by vendor and type',
      'Budget variance tracking — see what is over and under',
      'Cash flow projection for the next 30, 60, and 90 days',
      'Tax preparation export — categories already sorted',
    ],
  },
  {
    name: 'Proposal Command',
    headline: 'Build professional proposals in under an hour — not a week.',
    detail: `Winning work starts with a professional proposal. Proposal Command has five
built-in templates covering service contracts, government bids, consulting engagements,
and project scope documents. Fill in your specifics, and it generates a formatted
Word document ready to send. Track delivery status and follow-up timing from the
same interface.`,
    bullets: [
      '5 built-in proposal templates',
      'Word document output — formatted and ready to send',
      'Delivery tracking and follow-up reminders',
      'Government bid format compliant',
    ],
  },
];

// ─── ML / Forecasting modules ─────────────────────────────────────────────────

const mlModules = [
  {
    name: 'Business Trend Reports',
    headline: 'See where your revenue, cash flow, and workload are heading — 30, 60, and 90 days out.',
    detail: `Most business owners are looking backward — last month's numbers, last quarter's revenue.
Business Trend Reports flip that around. Your sales pipeline, cash flow, daily workload,
and team output are tracked over time, and the system projects where each one is heading.
When cash flow starts trending down, you see it 30 days before it becomes a problem.
When your workload is trending above capacity, you see it before you miss a deadline.
You get a projected range — not a guarantee, but a realistic picture based on your
actual patterns — so you can adjust before things go sideways.`,
    bullets: [
      'Sales pipeline trend — how much revenue is likely to close this quarter',
      'Cash flow outlook — 90-day projection based on your actual billing patterns',
      'Workload trend — are you over or under capacity next month',
      'Early warning alerts when a number moves outside your normal range',
    ],
  },
  {
    name: 'Fuel Cost Intelligence',
    headline: 'Diesel price forecasting for fleet operators and petroleum businesses — know what fuel is going to cost before you lock in routes or rates.',
    detail: `Fuel is one of the biggest variable costs in any fleet operation and one of the
hardest to predict. This tool runs against 40+ years of federal energy market data
to give you a forward-looking picture of diesel price trends. If prices are trending
up, you want to know before you set rates or lock in a long haul. If there is a spread
between diesel and regular that signals a market shift, you see it. Built specifically
for fleet operators, fuel distributors, and petroleum businesses who are making
real money decisions based on fuel cost — not just watching the pump price.`,
    bullets: [
      '40+ years of federal energy market data',
      'Diesel price trend outlook — 30, 60, and 90 days',
      'Price spread tracking — diesel vs. regular vs. crude',
      'Market condition flag — is the market trending up, down, or holding steady',
    ],
  },
];

// ─── Deployment options ───────────────────────────────────────────────────────

const deploymentOptions = [
  {
    name: 'Cloud-Hosted (Default)',
    headline: 'Up and running in a day. No servers to manage.',
    detail: `The default setup. Your fleet data lives in a SOC 2 audit-ready cloud environment.
You log in from any browser — desktop, tablet, or phone — and everything is there.
Backups are automatic. Updates happen without you lifting a finger. This is the right
choice for most fleet operations.`,
  },
  {
    name: 'On-Premise / Local',
    headline: 'Your data stays on your network. Full stop.',
    detail: `Some organizations — government contractors, regulated industries, businesses
with strict IT policies — need their data to stay inside their own network. On-Premise
runs Fleet-Compliance Sentinel and Pipeline Penny locally, with your choice of AI
engine: fully local (no internet required), or any of the major providers. Nothing
leaves your building.`,
  },
  {
    name: 'Hybrid',
    headline: 'Compliance data in the cloud. AI processing stays local.',
    detail: `Hybrid gives you the best of both: the accessibility of cloud-hosted compliance
tracking combined with local AI processing for organizations that need to keep
sensitive queries inside their network. Common for government contractors and
businesses with data residency requirements.`,
  },
];

// ─── Shared card style ────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'rgba(15, 36, 57, 0.62)',
  border: '1px solid rgba(148, 163, 184, 0.36)',
  borderRadius: '10px',
  padding: '2rem',
};

const tagStyle = (color: string): React.CSSProperties => ({
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  padding: '0.2rem 0.6rem',
  borderRadius: '4px',
  background: color === 'green' ? 'rgba(34,197,94,0.18)' : 'rgba(61,142,185,0.22)',
  color: color === 'green' ? '#4ade80' : '#5ba8d1',
  border: `1px solid ${color === 'green' ? 'rgba(34,197,94,0.3)' : 'rgba(61,142,185,0.3)'}`,
});

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1.25rem' }}>
      {items.map((b) => (
        <li key={b} style={{ color: 'rgba(226,232,240,0.85)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.92rem' }}>
          <span style={{ color: '#3d8eb9', marginTop: '0.25rem', flexShrink: 0 }}>&#10003;</span>
          {b}
        </li>
      ))}
    </ul>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  return (
    <main className="landing-main">

      {/* Hero */}
      <section className="hero" style={{ paddingBottom: '3rem' }}>
        <div className="hero-badge">By True North Data Strategies</div>
        <h1 style={{ fontSize: '2.3rem', maxWidth: '760px', margin: '1.5rem auto 1rem' }}>
          Everything the platform does — explained in plain language.
        </h1>
        <p className="hero-sub" style={{ maxWidth: '620px', margin: '0 auto 2rem' }}>
          Fleet-Compliance Sentinel is built for fleet managers and business owners, not
          software teams. This page covers every tool available — what it does, who it
          is for, and why it matters when a DOT examiner walks through your door.
        </p>
        <div className="hero-actions">
          <Link href="/sign-up" className="btn-primary">Start Free Trial</Link>
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">Talk to Jacob</Link>
        </div>
      </section>

      {/* Core Platform */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ color: '#f8fafc', textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Core Platform</h2>
        <p className="section-intro" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          These tools are live today. Fleet-Compliance Sentinel, the Training Platform,
          and AI Invoice Extraction are included in every tier starting with Starter.
          Pipeline Penny AI and Telematics integration are included in Professional and above.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {coreModules.map((mod) => (
            <article key={mod.name} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={tagStyle(mod.tagColor)}>{mod.tag}</span>
                <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 700 }}>{mod.name}</h3>
              </div>
              <p style={{ color: '#5ba8d1', fontWeight: 600, marginBottom: '0.9rem' }}>{mod.headline}</p>
              <p style={{ color: 'rgba(226,232,240,0.9)', lineHeight: '1.75' }}>{mod.detail}</p>
              <BulletList items={mod.bullets} />
            </article>
          ))}
        </div>
      </section>

      {/* Enterprise Modules */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ color: '#f8fafc', textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Enterprise and Operations Modules</h2>
        <p className="section-intro" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Available in the Enterprise tier and custom deployments. Every module runs inside
          the same platform — no separate logins, no separate systems. One place. All your operations.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {enterpriseModules.map((mod) => (
            <article key={mod.name} style={cardStyle}>
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{mod.name}</h3>
              <p style={{ color: '#5ba8d1', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.95rem' }}>{mod.headline}</p>
              <p style={{ color: 'rgba(226,232,240,0.9)', lineHeight: '1.75' }}>{mod.detail}</p>
              <BulletList items={mod.bullets} />
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ color: '#f8fafc', textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Business Forecasting and Fuel Intelligence</h2>
        <p className="section-intro" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Stop reacting to what already happened. These tools use your business data
          to show you where revenue, cash flow, and fuel costs are heading — so you
          can make decisions ahead of the curve, not after the damage is done.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {mlModules.map((mod) => (
            <article key={mod.name} style={cardStyle}>
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{mod.name}</h3>
              <p style={{ color: '#5ba8d1', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.95rem' }}>{mod.headline}</p>
              <p style={{ color: 'rgba(226,232,240,0.9)', lineHeight: '1.75' }}>{mod.detail}</p>
              <BulletList items={mod.bullets} />
            </article>
          ))}
        </div>
      </section>

      {/* Deployment Options */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ color: '#f8fafc', textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>How It Gets Deployed</h2>
        <p className="section-intro" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Most fleet operators use the cloud-hosted version and are running same day. If
          your organization has stricter data requirements, there are options that keep
          everything on your own network.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {deploymentOptions.map((opt) => (
            <article key={opt.name} style={{ ...cardStyle, padding: '1.75rem' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{opt.name}</h3>
              <p style={{ color: '#5ba8d1', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{opt.headline}</p>
              <p style={{ color: 'rgba(226,232,240,0.85)', lineHeight: '1.65', fontSize: '0.9rem' }}>{opt.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Security strip */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem', borderTop: '1px solid rgba(148,163,184,0.2)' }}>
        <h2 style={{ color: '#f8fafc', textAlign: 'center', marginBottom: '0.75rem', fontSize: '1.6rem' }}>
          Built to Pass an Audit — Yours or Ours
        </h2>
        <p className="section-intro" style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2rem' }}>
          Fleet-Compliance Sentinel is the only DOT/FMCSA compliance platform built by an
          SDVOSB pursuing SOC 2 Type I certification. Every record is logged. Every change
          is tracked. Every data deletion is automated and documented. If you need to hand
          records to a DOT auditor, a government contracting officer, or an insurance carrier —
          the paperwork is already done.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {[
            'SOC 2 Type I Audit-Ready',
            'SBA-Certified SDVOSB/VOSB',
            'Each fleet account is fully isolated — no data crossover between operators',
            'Every record change is logged with a timestamp and user',
            'Your data is automatically deleted on cancellation — documented schedule',
            'Your data never trains an AI model',
            'AI security independently assessed',
          ].map((item) => (
            <span key={item} style={{
              background: 'rgba(61,142,185,0.12)',
              border: '1px solid rgba(61,142,185,0.25)',
              borderRadius: '6px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
              color: 'rgba(226,232,240,0.9)',
            }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta" style={{ padding: '4rem 1.5rem' }}>
        <div className="cta-split">
          <div className="cta-block">
            <h2>Ready to see it in your fleet?</h2>
            <p>Start with 14 days free. No credit card required.</p>
            <Link href="/sign-up" className="btn-primary">Start your free trial &rarr;</Link>
          </div>
          <div className="cta-block">
            <h2>Questions before you sign up?</h2>
            <p>Talk directly with Jacob — the guy who built it.</p>
            <div className="cta-contact">
              <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">Book a Demo</Link>
              <a href="tel:555-555-5555" className="cta-phone">555-555-5555</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <p>
            Pipeline Penny is a product of{' '}
            <a href="https://www.truenorthstrategyops.com">True North Data Strategies LLC</a>
          </p>
          <p className="footer-certs">SBA-Certified VOSB/SDVOSB &middot; Colorado Springs, CO</p>
          <div className="footer-badges">
            <Image src="/Veteran-Owned Certified.png" alt="Veteran-Owned Certified" width={64} height={80} />
            <Image src="/Service-Disabled Veteran-Owned-Certified.png" alt="Service-Disabled Veteran-Owned Certified" width={64} height={80} />
          </div>
        </div>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="https://www.truenorthstrategyops.com">truenorthstrategyops.com</Link>
        </div>
        <p className="footer-copy">&copy; 2026 True North Data Strategies LLC. All rights reserved.</p>
      </footer>

    </main>
  );
}
