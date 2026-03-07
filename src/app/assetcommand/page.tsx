"use client";

import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";

const GUMROAD_URL = "https://pipelinepunks.gumroad.com/l/izwdk";

const features = [
  { icon: "📦", title: "Asset Tracking", desc: "Vehicles, equipment, tools, trailers — status, location, assignment, and costs in one view." },
  { icon: "🚛", title: "DOT/FMCSA Compliance", desc: "30-field driver compliance tracking. CDL, medical cards, clearinghouse, ELD, DVIR — flagged before they expire." },
  { icon: "🔧", title: "Maintenance Scheduling", desc: "Service scheduling with parts cost, labor cost, vendor tracking, and invoice numbers. Automated alerts when due." },
  { icon: "⛽", title: "Fuel Management", desc: "Consumption analysis, cost tracking, anomaly detection. Know when something looks wrong before it becomes a problem." },
  { icon: "📊", title: "4-View Dashboard", desc: "Assets, Maintenance, Compliance, and Fuel — each with KPI cards, charts, and action buttons." },
  { icon: "📧", title: "Automated Alerts", desc: "Daily digest emails, maintenance alerts, compliance warnings, fuel anomaly notifications — all configurable." },
];

const problems = [
  { q: "Which truck is available right now?", a: "Dashboard answers it instantly." },
  { q: "When is the next oil change due?", a: "Automated alerts handle it." },
  { q: "Is the driver CDL still valid?", a: "Compliance tracker flags it before it expires." },
  { q: "How much did we spend on maintenance last quarter?", a: "Cost tracking built in." },
  { q: "DOT audit coming up — where are the records?", a: "All 30 compliance fields in one sheet." },
];

const deliverables = [
  "Full Apps Script source code — 2,400+ lines, production-ready",
  "4-view interactive HTML dashboard (Assets, Maintenance, Compliance, Fuel)",
  "DOT/FMCSA driver compliance tracking — 30 fields per driver",
  "Automated email alerts for maintenance, expiring licenses, fuel anomalies",
  "CSV import with downloadable templates for bulk data entry",
  "Sidebar data entry interface — no Sheets experience required",
  "Built-in 7-section user manual accessible from the menu",
  "Automated setup wizard — answer 5 questions, system builds itself",
  "Config sheet for business name, alert email, and thresholds",
  "Async email support included",
];

const faqs = [
  { q: "Do I need to know how to code?", a: "No. The setup wizard asks 5 questions and builds the entire system. If you can use Google Sheets, you can run this." },
  { q: "What do I need to get started?", a: "A Google account. That is it. No subscriptions, no new software, no IT department." },
  { q: "How long does setup take?", a: "30 to 60 minutes with the automated wizard. Manual setup takes about 2 hours." },
  { q: "What if I get stuck?", a: "Async support via email at jacob@truenorthstrategyops.com. There is also a built-in 7-section user manual inside the menu." },
  { q: "Does it work on mobile?", a: "Google Sheets works on mobile. The HTML dashboard is optimized for desktop but accessible anywhere." },
];

const stats = [
  { n: "2,400+", label: "Lines of Code" },
  { n: "4", label: "Dashboard Views" },
  { n: "30", label: "Compliance Fields" },
  { n: "60min", label: "Setup Time" },
];

export default function AssetCommandPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-mono">

      <nav
        aria-label="Site navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0d1117]/95 border-b border-[#1e3a5f]" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#3d8eb9] text-xl font-bold tracking-widest uppercase">
            Pipeline<span className="text-white">Punks</span>
          </span>
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#3d8eb9] hover:bg-[#5aa8d4] text-white text-sm font-bold px-5 py-2 tracking-widest uppercase transition-colors"
          >
            Get AssetCommand — $97
          </a>
        </div>
      </nav>

      <section aria-labelledby="hero-heading" className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#3d8eb9 1px,transparent 1px),linear-gradient(90deg,#3d8eb9 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <p className="inline-block border border-[#3d8eb9] text-[#3d8eb9] text-xs tracking-widest uppercase px-4 py-1 mb-8">
            True North Data Strategies — Command Module
          </p>
          <h1 id="hero-heading" className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="text-[#3d8eb9]">Asset</span>Command
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-4 leading-relaxed">
            Fleet and compliance management for Google Sheets.
            <br />
            <strong className="text-white">No subscription. No new software. No IT department.</strong>
          </p>
          <p className="text-gray-500 text-sm mb-12 tracking-widest uppercase">
            2,400+ lines production Apps Script — DOT/FMCSA Compliant — 4-View Dashboard
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#3d8eb9] hover:bg-[#5aa8d4] text-white font-black text-lg px-10 py-5 tracking-widest uppercase transition-all hover:scale-105"
            >
              Deploy AssetCommand — $97
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center border border-[#1e3a5f] hover:border-[#3d8eb9] text-gray-400 hover:text-white font-bold text-sm px-10 py-5 tracking-widest uppercase transition-colors"
            >
              See What Is Inside
            </a>
          </div>
          <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e3a5f]">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#0d1117] px-6 py-5 text-center">
                <dt className="text-xs text-gray-500 tracking-widest uppercase mt-1 order-2">{s.label}</dt>
                <dd className="text-2xl font-black text-[#3d8eb9] order-1">{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="problem-heading" className="py-20 px-6 bg-[#0a0f14]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4">The Problem</p>
          <h2 id="problem-heading" className="text-3xl md:text-4xl font-black mb-12">
            Stop tracking your fleet in a group chat.
          </h2>
          <dl>
            {problems.map((p, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-px bg-[#1e3a5f] mb-px">
                <dt className="bg-[#0a0f14] px-6 py-5 flex items-start gap-4">
                  <span aria-hidden="true" className="text-red-500 mt-1 flex-shrink-0">✗</span>
                  <span className="text-gray-400 italic">{p.q}</span>
                </dt>
                <dd className="bg-[#0d1117] px-6 py-5 flex items-start gap-4">
                  <span aria-hidden="true" className="text-[#3d8eb9] mt-1 flex-shrink-0">✓</span>
                  <span className="text-white font-bold">{p.a}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="features-heading" id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4">Features</p>
          <h2 id="features-heading" className="text-3xl md:text-4xl font-black mb-12">
            Everything your fleet operation needs.
          </h2>
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e3a5f]">
            {features.map((f) => (
              <li key={f.title} className="bg-[#0d1117] p-8 hover:bg-[#0f1a24] transition-colors group">
                <p aria-hidden="true" className="text-3xl mb-4">{f.icon}</p>
                <h3 className="font-black text-lg mb-2 group-hover:text-[#3d8eb9] transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="deliverables-heading" className="py-20 px-6 bg-[#0a0f14]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4">What You Get</p>
          <h2 id="deliverables-heading" className="text-3xl md:text-4xl font-black mb-12">
            Everything included for $97.
          </h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {deliverables.map((item, i) => (
              <li key={i} className="flex items-start gap-4 border border-[#1e3a5f] px-5 py-4 hover:border-[#3d8eb9] transition-colors">
                <span aria-hidden="true" className="text-[#3d8eb9] font-black flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4">FAQ</p>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-black mb-12">Common questions.</h2>
          <dl>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-[#1e3a5f]">
                <dt>
                  <button
                    type="button"
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => toggleFaq(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleFaq(i);
                      }
                    }}
                    className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                  >
                    <span className="font-bold text-white group-hover:text-[#3d8eb9] transition-colors pr-8">
                      {faq.q}
                    </span>
                    <span aria-hidden="true" className="text-[#3d8eb9] flex-shrink-0 text-xl">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                <dd id={`faq-answer-${i}`} className={openFaq === i ? "block pb-5" : "hidden"}>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="py-24 px-6 text-center relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[#1a3a5c] opacity-20" />
        <div className="relative max-w-3xl mx-auto">
          <h2 id="cta-heading" className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Your fleet runs better when you can see it.
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            One-time purchase. No subscription. Setup in under an hour.
          </p>
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#3d8eb9] hover:bg-[#5aa8d4] text-white font-black text-xl px-12 py-6 tracking-widest uppercase transition-all hover:scale-105"
          >
            Get AssetCommand — $97
          </a>
          <p className="text-gray-600 text-xs mt-6 tracking-widest uppercase">
            30-day money back guarantee — Google account required — Async support included
          </p>
        </div>
      </section>

      <footer role="contentinfo" className="border-t border-[#1e3a5f] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 tracking-widest uppercase">
            True North Data Strategies — SDVOSB — Colorado Springs, CO
          </p>
          <p className="text-xs text-gray-600 tracking-widest uppercase">
            jacob@truenorthstrategyops.com — 555-555-5555
          </p>
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#3d8eb9] hover:text-white tracking-widest uppercase transition-colors"
          >
            Buy on Gumroad
          </a>
        </div>
      </footer>

    </div>
  );
}
