"use client";
import { useState, useEffect } from "react";
const GUMROAD_URL = "https://pipelinepunks.gumroad.com/l/izwdk";
const features = [
  { icon: "📦", title: "Asset Tracking", desc: "Vehicles, equipment, tools, trailers — status, location, assignment, and costs in one view." },
  { icon: "🚛", title: "DOT/FMCSA Compliance", desc: "30-field driver compliance tracking. CDL, medical cards, clearinghouse, ELD, DVIR — flagged before they expire." },
  { icon: "🔧", title: "Maintenance Scheduling", desc: "Service scheduling with parts cost, labor cost, vendor tracking, and invoice numbers. Automated alerts when due." },
  { icon: "⛽", title: "Fuel Management", desc: "Consumption analysis, cost tracking, anomaly detection." },
  { icon: "📊", title: "4-View Dashboard", desc: "Assets, Maintenance, Compliance, and Fuel — each with KPI cards, charts, and action buttons." },
  { icon: "📧", title: "Automated Alerts", desc: "Daily digest emails, maintenance alerts, compliance warnings, fuel anomaly notifications." },
];
const problems = [
  { q: "Which truck is available right now?", a: "Dashboard answers it instantly." },
  { q: "When is the next oil change due?", a: "Automated alerts handle it." },
  { q: "Is the driver CDL still valid?", a: "Compliance tracker flags it before it expires." },
  { q: "How much did we spend on maintenance last quarter?", a: "Cost tracking built in." },
  { q: "DOT audit coming up — where are the records?", a: "All 30 compliance fields in one sheet." },
];
const faqs = [
  { q: "Do I need to know how to code?", a: "No. The setup wizard asks 5 questions and builds the entire system." },
  { q: "What do I need to get started?", a: "A Google account. That is it. No subscriptions, no new software." },
  { q: "How long does setup take?", a: "30-60 minutes with the automated wizard." },
  { q: "What if I get stuck?", a: "Async support via email — jacob@truenorthstrategyops.com." },
];
export default function AssetCommandPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-mono">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0d1117]/95 border-b border-[#1e3a5f]" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#3d8eb9] text-xl font-bold tracking-widest uppercase">Pipeline<span className="text-white">Punks</span></span>
          <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="bg-[#3d8eb9] hover:bg-[#5aa8d4] text-white text-sm font-bold px-5 py-2 tracking-widest uppercase transition-colors">Get AssetCommand — $97</a>
        </div>
      </nav>
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"linear-gradient(#3d8eb9 1px,transparent 1px),linear-gradient(90deg,#3d8eb9 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-block border border-[#3d8eb9] text-[#3d8eb9] text-xs tracking-widest uppercase px-4 py-1 mb-8">True North Data Strategies — Command Module</div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6"><span className="text-[#3d8eb9]">Asset</span>Command</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-4 leading-relaxed">Fleet and compliance management for Google Sheets.<br/><span className="text-white font-bold">No subscription. No new software. No IT department.</span></p>
          <p className="text-gray-500 text-sm mb-12 tracking-widest uppercase">2,400+ lines production Apps Script · DOT/FMCSA Compliant · 4-View Dashboard</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#3d8eb9] hover:bg-[#5aa8d4] text-white font-black text-lg px-10 py-5 tracking-widest uppercase transition-all hover:scale-105">Deploy AssetCommand — $97</a>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e3a5f]">
            {[{n:"2,400+",label:"Lines of Code"},{n:"4",label:"Dashboard Views"},{n:"30",label:"Compliance Fields"},{n:"60min",label:"Setup Time"}].map(s=>(
              <div key={s.label} className="bg-[#0d1117] px-6 py-5 text-center">
                <div className="text-2xl font-black text-[#3d8eb9]">{s.n}</div>
                <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-[#0a0f14]">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4><span>{"// The Problem"}</span></div>
          <h2 className="text-3xl font-black mb-12">Stop tracking your fleet in a group chat.</h2>
          <div className="space-y-px">
            {problems.map((p,i)=>(
              <div key={i} className="grid md:grid-cols-2 gap-px bg-[#1e3a5f]">
                <div className="bg-[#0a0f14] px-6 py-5 flex items-start gap-4"><span className="text-red-500 mt-1">✗</span><span className="text-gray-400 italic">{p.q}</span></div>
                <div className="bg-[#0d1117] px-6 py-5 flex items-start gap-4"><span className="text-[#3d8eb9] mt-1">✓</span><span className="text-white font-bold">{p.a}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4">// Features</div>
          <h2 className="text-3xl font-black mb-12">Everything your fleet needs.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e3a5f]">
            {features.map(f=>(
              <div key={f.title} className="bg-[#0d1117] p-8 hover:bg-[#0f1a24] transition-colors group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-black text-lg mb-2 group-hover:text-[#3d8eb9] transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-[#0a0f14]">
        <div className="max-w-3xl mx-auto">
          <div className="text-xs text-[#3d8eb9] tracking-widest uppercase mb-4><span>{"// FAQ"}</span></div>
          <h2 className="text-3xl font-black mb-12">Common questions.</h2>
          <div className="space-y-px">
            {faqs.map((faq,i)=>(
              <div key={i} className="border-b border-[#1e3a5f]">
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between py-5 text-left group">
                  <span className="font-bold text-white group-hover:text-[#3d8eb9] transition-colors pr-8">{faq.q}</span>
                  <span className="text-[#3d8eb9] flex-shrink-0 text-xl">{openFaq===i?"−":"+"}</span>
                </button>
                {openFaq===i&&<p className="text-gray-400 text-sm pb-5 leading-relaxed">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-6">Your fleet runs better when you can see it.</h2>
        <p className="text-gray-400 mb-10 text-lg">One-time purchase. No subscription. Setup in under an hour.</p>
        <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#3d8eb9] hover:bg-[#5aa8d4] text-white font-black text-xl px-12 py-6 tracking-widest uppercase transition-all hover:scale-105">Get AssetCommand — $97</a>
        <p className="text-gray-600 text-xs mt-6 tracking-widest uppercase">30-day money back guarantee · Google account required</p>
      </section>
      <footer className="border-t border-[#1e3a5f] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-600 tracking-widest uppercase">True North Data Strategies · SDVOSB · Colorado Springs, CO</div>
          <div className="text-xs text-gray-600 tracking-widest uppercase">jacob@truenorthstrategyops.com · 555-555-5555</div>
          <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3d8eb9] hover:text-white tracking-widest uppercase transition-colors">Buy on Gumroad →</a>
        </div>
      </footer>
    </div>
  );
}

