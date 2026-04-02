'use client';

import Link from 'next/link';
import { useState } from 'react';

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CommissionCalculatorPage() {
  const [salePrice, setSalePrice] = useState('');
  const [commissionPct, setCommissionPct] = useState('3');
  const [splitPct, setSplitPct] = useState('70');

  // Client-side calculation (mirrors API logic, no fetch needed for instant UX)
  const salePriceNum = Number(salePrice) || 0;
  const commissionPctNum = Number(commissionPct) || 0;
  const splitPctNum = Number(splitPct) || 70;

  const total = Number((salePriceNum * (commissionPctNum / 100)).toFixed(2));
  const agent = Number((total * (splitPctNum / 100)).toFixed(2));
  const brokerage = Number((total - agent).toFixed(2));
  const hasResult = salePriceNum > 0 && commissionPctNum > 0;

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-hero">
        <p className="fleet-compliance-eyebrow">Realty Command</p>
        <h1>Commission Calculator</h1>
        <p className="fleet-compliance-subcopy">
          Input sale price, commission rate, and agent/brokerage split to see the breakdown.
        </p>
      </section>

      <section className="fleet-compliance-section" style={{ maxWidth: '600px' }}>
        <Link
          href="/fleet-compliance/realty"
          style={{ fontSize: '0.8rem', color: 'var(--teal)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}
        >
          &larr; Back to Pipeline
        </Link>

        {/* Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="sale-price" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Sale Price ($)
            </label>
            <input
              id="sale-price"
              type="number"
              placeholder="e.g. 425000"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="commission-pct" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Commission Rate (%)
            </label>
            <input
              id="commission-pct"
              type="number"
              step="0.1"
              placeholder="e.g. 3"
              value={commissionPct}
              onChange={(e) => setCommissionPct(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="split-pct" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Agent / Brokerage Split (% to agent)
            </label>
            <input
              id="split-pct"
              type="number"
              step="1"
              placeholder="e.g. 70"
              value={splitPct}
              onChange={(e) => setSplitPct(e.target.value)}
              style={inputStyle}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              Agent gets {splitPctNum}% / Brokerage gets {100 - splitPctNum}%
            </p>
          </div>
        </div>

        {/* Results */}
        {hasResult && (
          <div
            style={{
              marginTop: '1.5rem',
              background: 'var(--teal-dim)',
              border: '1px solid rgba(61,142,185,0.25)',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
              Commission Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>
                  Total Commission
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
                  {formatCurrency(total)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>
                  Agent ({splitPctNum}%)
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', margin: 0 }}>
                  {formatCurrency(agent)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>
                  Brokerage ({100 - splitPctNum}%)
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', margin: 0 }}>
                  {formatCurrency(brokerage)}
                </p>
              </div>
            </div>

            {/* Quick reference bar */}
            <div
              style={{
                marginTop: '1rem',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div style={{ width: `${splitPctNum}%`, background: '#059669', transition: 'width 0.3s' }} />
              <div style={{ width: `${100 - splitPctNum}%`, background: '#d97706', transition: 'width 0.3s' }} />
            </div>

            {/* Summary line */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.75rem 0 0', textAlign: 'center' }}>
              {formatCurrency(salePriceNum)} sale &times; {commissionPctNum}% = {formatCurrency(total)} total commission
            </p>
          </div>
        )}

        {/* Quick Presets */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick presets:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: '$250K / 3%', price: '250000', pct: '3' },
              { label: '$400K / 3%', price: '400000', pct: '3' },
              { label: '$500K / 2.5%', price: '500000', pct: '2.5' },
              { label: '$750K / 2.5%', price: '750000', pct: '2.5' },
              { label: '$1M / 2%', price: '1000000', pct: '2' },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSalePrice(preset.price);
                  setCommissionPct(preset.pct);
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: '#f8fafc',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: '#ffffff',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
};
