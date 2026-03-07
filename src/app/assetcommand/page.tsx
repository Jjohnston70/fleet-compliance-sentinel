'use client';

import { useState } from 'react';
import Link from 'next/link';

const GUMROAD_URL = 'https://pipelinepunks.gumroad.com/l/izwdk';

const features = [
  {
    icon: '01',
    title: 'Asset Tracking',
    desc: 'Vehicles, equipment, tools, trailers - status, location, assignment, and costs in one view.',
  },
  {
    icon: '02',
    title: 'DOT/FMCSA Compliance',
    desc: '30-field driver compliance tracking. CDL, medical cards, clearinghouse, ELD, DVIR - flagged before they expire.',
  },
  {
    icon: '03',
    title: 'Maintenance Scheduling',
    desc: 'Service scheduling with parts cost, labor cost, vendor tracking, and invoice numbers. Automated alerts when due.',
  },
  {
    icon: '04',
    title: 'Fuel Management',
    desc: 'Consumption analysis, cost tracking, anomaly detection. Know when something looks wrong before it becomes a problem.',
  },
  {
    icon: '05',
    title: '4-View Dashboard',
    desc: 'Assets, maintenance, compliance, and fuel dashboards with KPI cards, charts, and action shortcuts.',
  },
  {
    icon: '06',
    title: 'Automated Alerts',
    desc: 'Daily digest emails, maintenance alerts, compliance warnings, and fuel anomaly notifications.',
  },
];

const problems = [
  { q: 'Which truck is available right now?', a: 'Dashboard answers it instantly.' },
  { q: 'When is the next oil change due?', a: 'Automated alerts handle it.' },
  { q: 'Is the driver CDL still valid?', a: 'Compliance tracker flags it before it expires.' },
  { q: 'How much did we spend on maintenance last quarter?', a: 'Cost tracking built in.' },
  { q: 'DOT audit coming up - where are the records?', a: 'All 30 compliance fields in one sheet.' },
];

const deliverables = [
  'Full Apps Script source code - 2,400+ lines, production-ready',
  '4-view interactive HTML dashboard (Assets, Maintenance, Compliance, Fuel)',
  'DOT/FMCSA driver compliance tracking - 30 fields per driver',
  'Automated email alerts for maintenance, expiring licenses, and fuel anomalies',
  'CSV import with downloadable templates for bulk data entry',
  'Sidebar data entry interface - no Sheets experience required',
  'Built-in 7-section user manual accessible from the menu',
  'Automated setup wizard - answer 5 questions, system builds itself',
  'Config sheet for business name, alert email, and thresholds',
  'Async email support included',
];

const faqs = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. The setup wizard asks 5 questions and builds the entire system. If you can use Google Sheets, you can run this.',
  },
  {
    q: 'What do I need to get started?',
    a: 'A Google account. That is it. No subscriptions, no new software, and no IT department.',
  },
  { q: 'How long does setup take?', a: '30 to 60 minutes with the automated wizard. Manual setup takes about 2 hours.' },
  {
    q: 'What if I get stuck?',
    a: 'Async support via email at jacob@truenorthstrategyops.com, plus a built-in 7-section user manual inside the menu.',
  },
  { q: 'Does it work on mobile?', a: 'Google Sheets works on mobile. The dashboard is optimized for desktop but accessible anywhere.' },
];

const stats = [
  { n: '2,400+', label: 'Lines of Code' },
  { n: '4', label: 'Dashboard Views' },
  { n: '30', label: 'Compliance Fields' },
  { n: '60min', label: 'Setup Time' },
];

export default function AssetCommandPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="asset-page">
      <section className="asset-hero" aria-labelledby="asset-hero-heading">
        <div className="asset-wrap">
          <p className="hero-badge">True North Data Strategies - Command Module</p>
          <h1 id="asset-hero-heading">AssetCommand</h1>
          <p className="hero-sub">Fleet and compliance management for Google Sheets.</p>
          <p className="hero-desc">
            No subscription. No new software. No IT department.
            <br />
            One-time purchase with implementation guidance included.
          </p>
          <div className="hero-actions">
            <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Get AssetCommand - $97
            </a>
            <a href="#asset-features" className="btn-secondary">
              See What Is Included
            </a>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>

          <dl className="asset-stats" aria-label="AssetCommand stats">
            {stats.map((stat) => (
              <div key={stat.label} className="asset-stat-card">
                <dt>{stat.label}</dt>
                <dd>{stat.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="asset-problems" aria-labelledby="asset-problems-heading">
        <div className="asset-wrap">
          <h2 id="asset-problems-heading">Stop running fleet operations in text threads and memory.</h2>
          <dl className="asset-problem-list">
            {problems.map((problem) => (
              <div key={problem.q} className="asset-problem-row">
                <dt>{problem.q}</dt>
                <dd>{problem.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="asset-features" id="asset-features" aria-labelledby="asset-features-heading">
        <div className="asset-wrap">
          <h2 id="asset-features-heading">Everything your fleet operation needs.</h2>
          <ul className="asset-feature-grid">
            {features.map((feature) => (
              <li key={feature.title} className="asset-feature-card">
                <p className="asset-feature-icon">{feature.icon}</p>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="asset-deliverables" aria-labelledby="asset-deliverables-heading">
        <div className="asset-wrap">
          <h2 id="asset-deliverables-heading">Everything included for $97.</h2>
          <ul className="asset-deliverable-list">
            {deliverables.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="asset-faq" aria-labelledby="asset-faq-heading">
        <div className="asset-wrap asset-wrap-narrow">
          <h2 id="asset-faq-heading">Common questions</h2>
          <dl>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q} className="asset-faq-item">
                  <dt>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`asset-faq-${index}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{faq.q}</span>
                      <span aria-hidden="true">{isOpen ? '-' : '+'}</span>
                    </button>
                  </dt>
                  <dd id={`asset-faq-${index}`} hidden={!isOpen}>
                    {faq.a}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section className="cta">
        <h2>Your fleet runs better when you can see it.</h2>
        <p>One-time purchase. No subscription. Setup in under an hour.</p>
        <div className="cta-actions">
          <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Buy AssetCommand - $97
          </a>
          <a href="mailto:jacob@truenorthstrategyops.com" className="btn-secondary">
            Email Jacob
          </a>
        </div>
        <p className="cta-note">30-day money back guarantee. Google account required.</p>
      </section>
    </main>
  );
}
