import Link from 'next/link';
import Image from 'next/image';

const fleetComplianceFeatures = [
  {
    icon: '01',
    title: 'Driver Compliance',
    description: 'CDL, medical cards, MVR, and drug testing are tracked with expiration alerts.',
  },
  {
    icon: '02',
    title: 'Vehicle and Asset Tracking',
    description: 'Manage fleet inventory with VINs, inspection dates, and maintenance schedules.',
  },
  {
    icon: '03',
    title: 'Permit and License Management',
    description: 'Track DOT permits, state licenses, renewals, and automated reminder dates.',
  },
  {
    icon: '04',
    title: 'FMCSA Safety Lookups',
    description: 'Pull live carrier safety data from the federal FMCSA database.',
  },
  {
    icon: '05',
    title: 'Compliance Alerts',
    description: 'Run daily automated email sweeps for overdue and upcoming deadlines.',
  },
  {
    icon: '06',
    title: 'Bulk Data Import',
    description: 'Upload fleet records from Excel across 12 validated collection types.',
  },
  {
    icon: '07',
    title: 'Fleet Telematics Monitoring',
    description: 'Monitor vehicles, drivers, and HOS/ELD status via Geotab, Samsara, and Verizon Reveal Connect - with more integrations available on request.',
  },
  {
    icon: '08',
    title: 'AI Invoice Extraction',
    description: 'Automated PDF invoice parsing for 12 fleet maintenance vendors with SOC 2 compliant audit logging.',
  },
];

const availableModules = [
  {
    name: 'Command Center',
    description: 'Unified integration hub for all modules. Tool discovery, routing, health checks, and a master registry.',
  },
  {
    name: 'Compliance Command',
    description: 'Automated compliance document generation. Single intake produces 7 compliance packages: security, privacy, government, and more.',
  },
  {
    name: 'Contract Command',
    description: 'Contract lifecycle management with party tracking, milestone management, amendments, and renewal automation.',
  },
  {
    name: 'Dispatch Command',
    description: 'Emergency dispatch operations with zone management, truck capacity tracking, driver rotation, and SLA monitoring.',
  },
  {
    name: 'Email Command',
    description: 'Email analytics and anomaly detection with statistical analysis, action item extraction, and executive digest generation.',
  },
  {
    name: 'Financial Command',
    description: 'Personal and business finance tracking with automatic categorization, tax calculations, and budget variance analysis.',
  },
  {
    name: 'GovCon Command',
    description: 'Federal government contracting operations with opportunity management, weighted bid/no-bid scoring, and pipeline dashboards.',
  },
  {
    name: 'Invoice Module',
    description: 'Portable invoice extraction for fleet maintenance PDFs. Supports 12 vendors with automatic detection and SOC 2 audit logging.',
  },
  {
    name: 'Onboard Command',
    description: 'Google Workspace provisioning and employee onboarding with automated user creation, license assignment, and rollback recovery.',
  },
  {
    name: 'Proposal Command',
    description: 'Enterprise proposal generation from 5 built-in templates with DOCX output, email delivery, and conversion metrics.',
  },
  {
    name: 'Readiness Command',
    description: 'AI readiness assessment module. Identifies and prioritizes AI/automation opportunities with weighted scoring and recommendations.',
  },
  {
    name: 'Realty Command',
    description: 'Real estate operations with lead scoring, property listing management, deal pipeline tracking, and commission forecasting.',
  },
  {
    name: 'Sales Command',
    description: 'Sales analytics and revenue forecasting with KPI calculations, trend analysis, and moving average projections.',
  },
  {
    name: 'Task Command',
    description: 'Task management with priority tracking, team assignment, workload analysis, and automatic overdue detection.',
  },
  {
    name: 'Training Command',
    description: 'Training platform backend with course management, enrollment tracking, workshop registration, and certificate generation.',
  },
  {
    name: 'Fleet Compliance Sentinel',
    description: 'Core compliance data hub housing CFR/DOT documentation, FMCSA imports, and bulk upload mapping for fleet operations.',
  },
];

const mlModules = [
  {
    name: 'ML Signal Stack',
    description: 'SARIMA time-series forecasting for 5 business metrics: sales, ops pulse, cash flow, pipeline, and team tempo.',
  },
  {
    name: 'ML Petroleum Intel',
    description: 'Energy market intelligence with 40+ years of EIA data, price forecasting, spread analysis, and market regime detection.',
  },
];

/* NotebookLM links preserved for internal reference - not exposed on landing page
const notebookLmLinks = [
  { name: 'CFR 49 DOT Regulations', url: 'https://notebooklm.google.com/notebook/daebb7db-4533-4055-9dec-fc96db40634a' },
  { name: 'Real Estate Chat', url: 'https://notebooklm.google.com/notebook/026926b8-16a7-40ea-a866-2fcc23313dac' },
  { name: 'HubSpot API Reference Guide', url: 'https://notebooklm.google.com/notebook/2cb7a8f1-e465-4d40-9f60-a82d4d8a3678' },
  { name: 'ML Signal Stack', url: 'https://notebooklm.google.com/notebook/d6920450-691e-4222-875c-cdcece5c784f' },
]; */

const pricingTiers = [
  {
    name: 'STARTER',
    price: '$149/mo',
    cta: 'Start Free Trial',
    href: '/sign-up',
    featured: false,
    features: [
      'Up to 15 vehicles',
      'Up to 10 drivers',
      'Compliance alerts and reminders',
      'Bulk Excel import',
      'FMCSA carrier lookups',
      'Telematics integration (1 provider)',
      'Email support',
    ],
  },
  {
    name: 'PROFESSIONAL',
    price: '$299/mo',
    cta: 'Start Free Trial',
    href: '/sign-up',
    featured: true,
    features: [
      'Up to 50 vehicles',
      'Up to 25 drivers',
      'Everything in Starter',
      'Pipeline Penny AI assistant (multi-LLM)',
      'AI invoice extraction (12 vendors)',
      'Telematics integration (all providers)',
      'ML forecasting dashboards',
      'Priority support',
    ],
  },
  {
    name: 'ENTERPRISE',
    price: 'Custom',
    cta: 'Contact Us',
    href: 'https://www.truenorthstrategyops.com/contact',
    featured: false,
    features: [
      'Unlimited vehicles and drivers',
      'Everything in Professional',
      'Full module suite (16+ modules)',
      'On-premise deployment option',
      'Dedicated onboarding and training',
      'Custom integrations and SLA guarantee',
    ],
  },
];

export default function HomePage() {
  return (
    <main className="landing-main">
      <section className="hero">
        <div className="hero-badge">By True North Data Strategies</div>
        <div className="hero-logo-wrap">
          <Image
            src="/PipelineX-penny.png"
            alt="Pipeline Penny logo"
            width={220}
            height={220}
            className="hero-logo"
            priority
          />
        </div>
        <h1>Fleet Compliance, Simplified.</h1>
        <p className="hero-sub">
          Track drivers, vehicles, permits, and DOT deadlines - with an AI compliance assistant that knows the regulations.
        </p>
        <p className="hero-desc">
          Fleet-Compliance Sentinel keeps every requirement visible, every deadline tracked, and every team member aligned.
          Pipeline Penny adds CFR-grounded answers so your staff can move faster without guessing.
        </p>
        <div className="hero-actions">
          <Link href="/sign-up" className="btn-primary">
            Start Free Trial
          </Link>
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">
            Book a Demo
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Fleet-Compliance Features</h2>
        <div className="feature-grid">
          {fleetComplianceFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how">
        <h2>Your AI Compliance Assistant</h2>
        <div className="steps">
          <article className="step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h3>Built on 13 FMCSA/DOT Regulation Chapters</h3>
              <p>Pipeline Penny is grounded in 13 sections of the FMCSA DOT regulatory manual (49 CFR Parts 040-397) and returns regulation-aware guidance.</p>
            </div>
          </article>
          <article className="step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h3>Answers With Your Fleet Context</h3>
              <p>Questions are answered with your actual fleet data, permit records, maintenance records, and compliance timelines.</p>
            </div>
          </article>
          <article className="step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h3>Source-Cited, No Guessing</h3>
              <p>Pipeline Penny does not make things up - responses are grounded in your data and federal source references.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="features">
        <h2>Telematics and Fleet Monitoring</h2>
        <p className="section-intro">
          Connect your existing telematics provider to Fleet-Compliance Sentinel. We pull vehicle, driver,
          HOS/ELD, GPS, and risk score data directly from your account - you keep your hardware and provider relationship.
        </p>
        <div className="telematics-providers">
          <div className="provider-card">
            <h3>Geotab</h3>
            <p>Connect your Geotab account for vehicle tracking, driver behavior analysis, and HOS monitoring.</p>
          </div>
          <div className="provider-card">
            <h3>Samsara</h3>
            <p>Connect your Samsara account for real-time GPS, ELD compliance, and fleet safety scoring.</p>
          </div>
          <div className="provider-card">
            <h3>Verizon Reveal Connect</h3>
            <p>Connect your Verizon Reveal account for vehicle diagnostics, route optimization, and driver performance.</p>
          </div>
        </div>
        <p className="section-note">
          We integrate with your existing telematics provider - no new hardware required. Need a different provider? We add integrations on request.
        </p>
      </section>

      <section className="features modules-section">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Image
            src="/tnds-command-center-logo.png"
            alt="TNDS Command Center"
            width={140}
            height={140}
          />
        </div>
        <h2>Available Modules</h2>
        <p className="section-intro">
          Fleet-Compliance Sentinel is built on a modular architecture. Each module handles a specific operational
          domain and integrates through the Command Center hub.
        </p>
        <div className="module-grid">
          {availableModules.map((mod) => (
            <article className="module-card" key={mod.name}>
              <h3>{mod.name}</h3>
              <p>{mod.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="features">
        <h2>Machine Learning and Forecasting</h2>
        <p className="section-intro">
          Go beyond compliance tracking with production-ready ML modules that turn your operational data into forecasts and actionable intelligence.
        </p>
        <div className="module-grid">
          {mlModules.map((mod) => (
            <article className="module-card" key={mod.name}>
              <h3>{mod.name}</h3>
              <p>{mod.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="features">
        <h2>Deployment Options</h2>
        <p className="section-intro">
          Pipeline Penny and Fleet-Compliance Sentinel are designed to meet your infrastructure where it is.
        </p>
        <div className="telematics-providers">
          <div className="provider-card">
            <h3>Cloud-Hosted (Default)</h3>
            <p>Deployed on Vercel and Railway with Neon PostgreSQL. SOC 2 audit-ready. Migrating to Google Cloud for enhanced scalability and compliance.</p>
          </div>
          <div className="provider-card">
            <h3>On-Premise / Local</h3>
            <p>Run Pipeline Penny locally via Electron with your choice of LLM provider: Ollama, Anthropic, OpenAI, Gemini, or ChatGPT. Your data never leaves your network.</p>
          </div>
          <div className="provider-card">
            <h3>Hybrid</h3>
            <p>Cloud compliance platform with local AI processing. Best of both worlds for organizations with strict data residency requirements.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>What Pipeline Penny Knows</h2>
        <p className="section-intro">
          Pipeline Penny is trained on curated knowledge bases covering federal regulations, business operations, and market intelligence.
          All of this knowledge is available through your Penny AI assistant when you sign up.
        </p>
        <div className="module-grid">
          <article className="module-card">
            <h3>CFR 49 DOT Regulations</h3>
            <p>13 sections of FMCSA/DOT regulatory guidance (Parts 040-397) for fleet compliance.</p>
          </article>
          <article className="module-card">
            <h3>Real Estate Operations</h3>
            <p>Lead scoring, property management, deal pipelines, and commission tracking knowledge.</p>
          </article>
          <article className="module-card">
            <h3>HubSpot API Integration</h3>
            <p>CRM operations, contact management, deal pipelines, and marketing automation.</p>
          </article>
          <article className="module-card">
            <h3>ML Forecasting Models</h3>
            <p>SARIMA time-series analysis, sales forecasting, and energy market intelligence.</p>
          </article>
        </div>
      </section>

      <section className="pricing">
        <h2>Pricing</h2>
        <div className="pricing-grid">
          {pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className={`pricing-card${tier.featured ? ' featured' : ''}`}
              aria-label={`${tier.name} plan`}
            >
              <p className="pricing-tier">{tier.name}</p>
              <p className="pricing-price">{tier.price}</p>
              <ul className="pricing-features">
                {tier.features.map((item) => (
                  <li key={`${tier.name}-${item}`}>{item}</li>
                ))}
              </ul>
              <Link href={tier.href} className={tier.featured ? 'btn-primary' : 'btn-secondary'}>
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="pricing-note">All plans include a 30-day free trial. No credit card required.</p>
      </section>

      <section className="who trust">
        <h2>SOC 2 Type I Audit-Ready</h2>
        <div className="who-grid">
          <div className="who-item">
            <span className="who-marker">-</span>
            <p>Your data is encrypted, org-isolated, and never used to train AI models.</p>
          </div>
          <div className="who-item">
            <span className="who-marker">-</span>
            <p>Veteran-owned. Built in Colorado.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to stop tracking compliance in spreadsheets?</h2>
        <p>Launch Fleet-Compliance Sentinel for your team and activate Pipeline Penny when you need AI support.</p>
        <div className="cta-actions">
          <Link href="/sign-up" className="btn-primary">
            Start your 30-day free trial
          </Link>
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">
            Book a Demo
          </Link>
          <a href="tel:555-555-5555" className="btn-secondary">
            Call 555-555-5555
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <p>
            Pipeline Penny is a product of{' '}
            <a href="https://www.truenorthstrategyops.com">True North Data Strategies LLC</a>
          </p>
          <p className="footer-certs">SBA-Certified VOSB/SDVOSB &middot; Colorado Springs, CO</p>
          <div className="footer-badges">
            <Image
              src="/Veteran-Owned Certified.png"
              alt="Veteran-Owned Certified"
              width={64}
              height={80}
            />
            <Image
              src="/Service-Disabled Veteran-Owned-Certified.png"
              alt="Service-Disabled Veteran-Owned Certified"
              width={64}
              height={80}
            />
            <a
              href="https://www.bbb.org/us/co/colorado-springs/profile/consultant/true-north-data-strategies-llc-0785-1000034167#sealclick"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="View True North Data Strategies LLC BBB Business Review"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://seal-southerncolorado.bbb.org/seals/blue-seal-200-42-bbb-1000034167.png"
                style={{ border: 0 }}
                alt="True North Data Strategies LLC BBB Business Review"
                width={240}
                height={50}
              />
            </a>
          </div>
        </div>
        <div className="footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/accessibility">Accessibility</Link>
          <Link href="https://www.truenorthstrategyops.com">truenorthstrategyops.com</Link>
        </div>
        <p className="footer-copy">&copy; 2026 True North Data Strategies LLC. All rights reserved.</p>
      </footer>
    </main>
  );
}