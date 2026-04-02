import Link from 'next/link';
import Image from 'next/image';

const featureIcons: Record<string, React.ReactNode> = {
  'driver': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  'vehicle': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  ),
  'permit': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  ),
  'fmcsa': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
  ),
  'alerts': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  'import': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  'telematics': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  'invoice': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
};

const fleetComplianceFeatures = [
  {
    icon: 'driver',
    title: 'Driver Compliance',
    description: 'CDL, medical cards, MVR, and drug testing are tracked with expiration alerts.',
  },
  {
    icon: 'vehicle',
    title: 'Vehicle and Asset Tracking',
    description: 'Manage fleet inventory with VINs, inspection dates, and maintenance schedules.',
  },
  {
    icon: 'permit',
    title: 'Permit and License Management',
    description: 'Track DOT permits, state licenses, renewals, and automated reminder dates.',
  },
  {
    icon: 'fmcsa',
    title: 'FMCSA Safety Lookups',
    description: 'Pull live carrier safety data from the federal FMCSA database.',
  },
  {
    icon: 'alerts',
    title: 'Compliance Alerts',
    description: 'Run daily automated email sweeps for overdue and upcoming deadlines.',
  },
  {
    icon: 'import',
    title: 'Bulk Data Import',
    description: 'Upload fleet records from Excel across 12 validated collection types.',
  },
  {
    icon: 'telematics',
    title: 'Fleet Telematics Monitoring',
    description: 'Monitor vehicles, drivers, and HOS/ELD status via Geotab, Samsara, and Verizon Reveal Connect - with more integrations available on request.',
  },
  {
    icon: 'invoice',
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
    price: '$199/mo',
    cta: 'Start Free Trial',
    href: '/sign-up',
    featured: false,
    outcome: 'See your entire fleet in one place. Track every driver CDL expiration, vehicle inspection, permit renewal, and DOT deadline. Daily automated alerts sweep before deadlines hit — no spreadsheet required.',
    features: [
      'Up to 15 vehicles',
      'Up to 10 drivers',
      'Bulk Excel import',
      'FMCSA carrier lookups',
      'Telematics integration (1 provider)',
      'Email support',
    ],
  },
  {
    name: 'PROFESSIONAL',
    price: '$399/mo',
    cta: 'Start Free Trial',
    href: '/sign-up',
    featured: true,
    outcome: 'Everything in Starter, plus Pipeline Penny — your AI compliance assistant. Ask Penny what the regulation requires AND where your drivers currently stand against it. Penny pulls the cited federal CFR answer and checks it against your actual driver records — CDL status, medical card expiration, drug test history, hazmat endorsements — so you know the rule and whether your fleet is in or out of compliance right now. No guessing. No digging through spreadsheets. Penny reads the regulation and reads your data at the same time. Multi-LLM support (Claude, GPT-4o, Gemini, local Ollama).',
    pennyExplainer: true,
    features: [
      'Up to 50 vehicles',
      'Up to 25 drivers',
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
    outcome: 'Full module suite. Custom deployment options: cloud-hosted, on-premise with local AI (Ollama), or hybrid for data residency requirements. Dedicated onboarding. SLA guarantee. SOC 2 compliance documentation available on request for procurement and audit teams. Google Cloud migration in progress — enhanced scalability and FedRAMP pathway for government contracting. Enterprise deployments include your own named AI assistant on the Pipeline X engine.',
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
        <h1>The compliance platform that knows the regulations — and knows your fleet.</h1>
        <p className="hero-sub">
          Fleet-Compliance Sentinel tracks every driver, vehicle, permit, and DOT
          deadline. Pipeline Penny answers regulatory questions cited directly from
          federal CFR — not from a guess.
        </p>
        <div className="hero-actions">
          <Link href="/sign-up" className="btn-primary">
            Start Free Trial
          </Link>
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">
            Book a Demo
          </Link>
        </div>
        <div className="hero-trust">
          <div className="hero-trust-items">
            <div className="hero-trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>SOC 2 Type I Audit-Ready</span>
            </div>
            <div className="hero-trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <span>SBA-Certified VOSB/SDVOSB</span>
            </div>
            <div className="hero-trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>30-Day Free Trial</span>
            </div>
          </div>
        </div>
        <div className="hero-screenshot">
          <div className="browser-frame">
            <div className="browser-dots"><span /><span /><span /></div>
            <div className="browser-bar">pipelinepunks.com/fleet-compliance</div>
          </div>
          <div className="dashboard-mockup">
            <div className="mockup-topbar">
              <span className="mockup-brand">Fleet-Compliance Sentinel</span>
              <span className="mockup-org">Sample Fleet</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-nav-item active">Dashboard</div>
                <div className="mockup-nav-item">Assets</div>
                <div className="mockup-nav-item">Compliance</div>
                <div className="mockup-nav-item">Suspense</div>
                <div className="mockup-nav-item">Telematics</div>
                <div className="mockup-nav-item">Employees</div>
                <div className="mockup-nav-item">Invoices</div>
                <div className="mockup-nav-item">Penny AI</div>
              </div>
              <div className="mockup-content">
                <div className="mockup-stats">
                  <div className="mockup-stat"><span className="mockup-stat-val">24</span><span className="mockup-stat-lbl">Assets</span></div>
                  <div className="mockup-stat"><span className="mockup-stat-val">12</span><span className="mockup-stat-lbl">Drivers</span></div>
                  <div className="mockup-stat warning"><span className="mockup-stat-val">5</span><span className="mockup-stat-lbl">Overdue</span></div>
                  <div className="mockup-stat"><span className="mockup-stat-val">18</span><span className="mockup-stat-lbl">Permits</span></div>
                </div>
                <div className="mockup-cards">
                  <div className="mockup-card">
                    <div className="mockup-card-head">Compliance</div>
                    <div className="mockup-card-line" />
                    <div className="mockup-card-line short" />
                  </div>
                  <div className="mockup-card">
                    <div className="mockup-card-head">Suspense</div>
                    <div className="mockup-card-line" />
                    <div className="mockup-card-line short" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-rail">
        <div className="trust-rail-items">
          <span>SOC 2 Type I Observation Window Active</span>
          <span className="trust-rail-dot">&middot;</span>
          <span>OWASP LLM Top 10 Assessed</span>
          <span className="trust-rail-dot">&middot;</span>
          <span>25,000+ CFR Chunks Indexed</span>
          <span className="trust-rail-dot">&middot;</span>
          <span>SDVOSB Certified</span>
          <span className="trust-rail-dot">&middot;</span>
          <span>Colorado Springs, CO</span>
          <span className="trust-rail-dot">&middot;</span>
          <a href="https://status.pipelinepunks.com" target="_blank" rel="noopener noreferrer">status.pipelinepunks.com</a>
        </div>
      </section>

      <section className="features">
        <h2>Fleet-Compliance Features</h2>
        <div className="feature-grid">
          {fleetComplianceFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{featureIcons[feature.icon] ?? feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how">
        <h2>Your AI Compliance Assistant</h2>
        <p className="powered-by-tag">Powered by Pipeline X</p>
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
              {tier.featured && <span className="pricing-badge">Most Popular</span>}
              <p className="pricing-tier">{tier.name}</p>
              <p className="pricing-price">{tier.price}</p>
              {tier.outcome && <p className="pricing-outcome">{tier.outcome}</p>}
              {'pennyExplainer' in tier && tier.pennyExplainer && (
                <div className="penny-explainer">
                  <h4>What is Pipeline Penny?</h4>
                  <p>
                    Pipeline Penny is an AI assistant built on 13 sections of the FMCSA/DOT
                    regulatory manual (49 CFR Parts 040-397). When you ask a compliance
                    question, she searches the actual federal regulations AND cross-references
                    your live fleet data — your drivers, CDL expirations, medical cards, drug
                    test records, permits, and open action items. You get two things at once:
                    what the rule says, and whether your drivers are currently meeting it.
                    She doesn&apos;t make things up. She shows her sources.
                    Think of her as a compliance analyst who has memorized every federal
                    regulation and always has your driver files open on the desk.
                  </p>
                </div>
              )}
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
        <p className="pricing-note">First 20 clients receive a 30-day free trial. No credit card required. After Cohort 1 reaches capacity, standard 14-day trial applies.</p>
      </section>

      <section className="cta">
        <div className="cta-split">
          <div className="cta-block">
            <h2>Stop tracking compliance in spreadsheets.</h2>
            <p>Fleet-Compliance Sentinel runs on your existing data.</p>
            <Link href="/sign-up" className="btn-primary">
              Start your free trial &rarr;
            </Link>
          </div>
          <div className="cta-block">
            <h2>Running 20+ vehicles or need a custom build?</h2>
            <p>Talk directly with Jacob.</p>
            <div className="cta-contact">
              <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">
                Book a Demo
              </Link>
              <a href="tel:555-555-5555" className="cta-phone">555-555-5555</a>
              <a href="mailto:jacob@truenorthstrategyops.com" className="cta-email">jacob@truenorthstrategyops.com</a>
            </div>
          </div>
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
