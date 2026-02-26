'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const productScreens = [
  {
    src: '/pipelinex-screenshots/command-post-welcome.png',
    alt: 'PipelineX command post welcome screen',
    label: 'Command Post',
  },
  {
    src: '/pipelinex-screenshots/prompt-run-result.png',
    alt: 'PipelineX prompt run result screen',
    label: 'Prompt Run Result',
  },
  {
    src: '/pipelinex-screenshots/sop-succeeded.png',
    alt: 'PipelineX SOP success workflow screen',
    label: 'SOP Workflow Success',
  },
];

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState<number | null>(null);

  useEffect(() => {
    if (activeScreen === null) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveScreen(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeScreen]);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">By True North Data Strategies</div>
        <div className="hero-logo-wrap">
          <Image
            src="/Pipeline Penny logo variations.png"
            alt="Pipeline Penny logo"
            width={220}
            height={220}
            className="hero-logo"
            priority
          />
        </div>
        <h1>Pipeline Penny</h1>
        <p className="hero-sub">
          Your business knowledge — searchable, queryable, and working for you.
        </p>
        <p className="hero-desc">
          Upload your SOPs, pricing sheets, contracts, and playbooks.
          Ask questions in plain English. Get answers from your actual documents — not guesses.
        </p>
        <div className="hero-actions">
          <Link href="/sign-in" className="btn-primary">
            Sign In
          </Link>
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">
            Book a Call with Jacob
          </Link>
        </div>
      </section>

      <section className="screenshots screenshots-top">
        <h2>Product Preview</h2>
        <p>Click any view to enlarge and read details.</p>
        <div className="screenshot-grid">
          {productScreens.map((screen, index) => (
            <figure className="screenshot-card" key={screen.src}>
              <button
                className="screenshot-card-btn"
                type="button"
                onClick={() => setActiveScreen(index)}
                aria-label={`Open ${screen.label} image`}
              >
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={1520}
                  height={870}
                />
              </button>
              <figcaption>{screen.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* What It Does */}
      <section className="features">
        <h2>What Pipeline Penny Does</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">01</div>
            <h3>Reads Your Documents</h3>
            <p>
              Upload SOPs, contracts, price sheets, employee handbooks — anything your
              business runs on. Penny reads them, indexes them, and makes them searchable.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">02</div>
            <h3>Answers Your Questions</h3>
            <p>
              Ask in plain English: "What's our markup on residential jobs?" or
              "What's the onboarding process for new hires?" Penny pulls the answer
              from your actual documents.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">03</div>
            <h3>Doesn't Make Things Up</h3>
            <p>
              If Penny doesn't have the answer in your documents, she says so.
              No hallucinations. No guesses. Just what you actually put in.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">04</div>
            <h3>Your Data Stays Yours</h3>
            <p>
              Your documents are processed and stored securely. Nothing gets shared
              with other users. Nothing gets used to train AI models. Period.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="who">
        <h2>Built for Business Owners Who...</h2>
        <div className="who-grid">
          <div className="who-item">
            <span className="who-marker">&mdash;</span>
            <p>Can't take a day off without things falling apart</p>
          </div>
          <div className="who-item">
            <span className="who-marker">&mdash;</span>
            <p>Have critical knowledge trapped in one person's head</p>
          </div>
          <div className="who-item">
            <span className="who-marker">&mdash;</span>
            <p>Run on spreadsheets, text messages, and "ask Steve"</p>
          </div>
          <div className="who-item">
            <span className="who-marker">&mdash;</span>
            <p>Want AI that works for them — not another tool to learn</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h3>We Talk</h3>
              <p>15-minute call. You tell me what's broken. I tell you if Penny can fix it.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h3>We Build It</h3>
              <p>
                I load your documents, configure your knowledge base, and set up
                Penny for your business. Fixed scope. Fixed price. 2-4 weeks.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h3>You Use It</h3>
              <p>
                Log in, ask questions, get answers. Your team can use it too.
                No training required — if you can send an email, you can use Penny.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to See It?</h2>
        <p>
          Every Pipeline Penny deployment starts with a conversation.
          No pitch deck. No pressure. Just clarity.
        </p>
        <div className="cta-actions">
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-primary">
            Book a Free 15-Min Call
          </Link>
          <a href="tel:555-555-5555" className="btn-secondary">
            Call Jacob: 555-555-5555
          </a>
        </div>
        <p className="cta-note">
          Fixed scope. Fixed price. No open-ended projects. No surprise invoices.
        </p>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <p>Pipeline Penny is a product of <a href="https://www.truenorthstrategyops.com">True North Data Strategies LLC</a></p>
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

      {activeScreen !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={productScreens[activeScreen].label}
        >
          <button
            type="button"
            className="lightbox-backdrop"
            onClick={() => setActiveScreen(null)}
            aria-label="Close enlarged image"
          />
          <div className="lightbox-inner" role="document">
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveScreen(null)}
              aria-label="Close enlarged image"
            >
              Close
            </button>
            <Image
              src={productScreens[activeScreen].src}
              alt={productScreens[activeScreen].alt}
              width={3040}
              height={1740}
              className="lightbox-image"
            />
            <p className="lightbox-caption">{productScreens[activeScreen].label}</p>
          </div>
        </div>
      )}
    </main>
  );
}
