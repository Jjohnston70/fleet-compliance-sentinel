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
];

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
      'Pipeline Penny AI assistant',
      'Priority support',
      'Custom alert configurations',
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
      'Dedicated onboarding',
      'Custom integrations',
      'SLA guarantee',
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
              <h3>Built for 13 CFR Knowledge</h3>
              <p>Pipeline Penny is grounded in 13 CFR parts 040-397 and returns regulation-aware guidance.</p>
            </div>
          </article>
          <article className="step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h3>Answers With Your Fleet Context</h3>
              <p>Questions are answered with your actual fleet data, permit records, and compliance timelines.</p>
            </div>
          </article>
          <article className="step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h3>Source-Cited, No Guessing</h3>
              <p>Penny does not make things up - responses are grounded in your data and federal source references.</p>
            </div>
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
        <div className="footer-badges trust-badges">
          <Image
            src="/Veteran-Owned Certified.png"
            alt="SBA Certified Veteran-Owned badge"
            width={64}
            height={80}
          />
          <Image
            src="/Service-Disabled Veteran-Owned-Certified.png"
            alt="SBA Certified Service-Disabled Veteran-Owned badge"
            width={64}
            height={80}
          />
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
