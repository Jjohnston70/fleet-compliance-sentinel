'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DealStage =
  | 'prospect' | 'showing' | 'offer' | 'negotiation' | 'under_contract'
  | 'inspection' | 'appraisal' | 'closing' | 'closed' | 'fell_through';

interface Deal {
  id: string;
  propertyAddress: string;
  clientName: string;
  dealType: string;
  stage: DealStage;
  offerAmount?: number;
  acceptedAmount?: number;
  commissionPct?: number;
  estimatedClose?: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  source: string;
  status: string;
  leadType: string;
  budgetMin?: number;
  budgetMax?: number;
}

interface PipelineSummary {
  totalDeals: number;
  totalLeads: number;
  totalValue: number;
  closedCount: number;
  conversionRate: number;
  avgLeadScore: number;
  stageCounts: Record<string, number>;
}

interface ScoreResult {
  leadId: string;
  score: number;
  breakdown: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_STAGES: { key: DealStage; label: string }[] = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'showing', label: 'Showing' },
  { key: 'offer', label: 'Offer' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'under_contract', label: 'Under Contract' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'closing', label: 'Closing' },
  { key: 'closed', label: 'Closed' },
  { key: 'fell_through', label: 'Fell Through' },
];

const STAGE_COLORS: Record<string, string> = {
  prospect: '#64748b',
  showing: '#3d8eb9',
  offer: '#7c3aed',
  negotiation: '#d97706',
  under_contract: '#0891b2',
  inspection: '#6366f1',
  appraisal: '#8b5cf6',
  closing: '#059669',
  closed: '#16a34a',
  fell_through: '#dc2626',
};

function formatCurrency(n?: number): string {
  if (n == null) return '--';
  return '$' + n.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RealtyPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingDeal, setMovingDeal] = useState<string | null>(null);

  // Lead scoring
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);

  // Add deal form
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    clientName: '',
    propertyAddress: '',
    dealType: 'buy',
    offerAmount: '',
    commissionPct: '3',
    estimatedClose: '',
  });

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fleet-compliance/realty?action=pipeline');
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Failed to load pipeline');
        return;
      }
      setDeals(data.deals ?? []);
      setLeads(data.leads ?? []);
      setSummary(data.summary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleMoveStage = async (dealId: string, newStage: DealStage) => {
    setMovingDeal(dealId);
    try {
      const res = await fetch('/api/fleet-compliance/realty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-stage', dealId, stage: newStage }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchPipeline();
      } else {
        setError(data.error ?? 'Stage update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stage update failed');
    } finally {
      setMovingDeal(null);
    }
  };

  const handleScoreLead = async () => {
    if (!selectedLeadId) return;
    setScoring(true);
    setScoreResult(null);
    try {
      const res = await fetch(`/api/fleet-compliance/realty?action=score-lead&leadId=${encodeURIComponent(selectedLeadId)}`);
      const data = await res.json();
      if (data.ok) {
        setScoreResult({ leadId: data.leadId, score: data.score, breakdown: data.breakdown });
      } else {
        setError(data.error ?? 'Scoring failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setScoring(false);
    }
  };

  const handleAddDeal = async () => {
    try {
      const res = await fetch('/api/fleet-compliance/realty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-deal',
          ...newDeal,
          offerAmount: newDeal.offerAmount ? Number(newDeal.offerAmount) : undefined,
          commissionPct: newDeal.commissionPct ? Number(newDeal.commissionPct) : 3,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowAddDeal(false);
        setNewDeal({ clientName: '', propertyAddress: '', dealType: 'buy', offerAmount: '', commissionPct: '3', estimatedClose: '' });
        await fetchPipeline();
      } else {
        setError(data.error ?? 'Add deal failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add deal failed');
    }
  };

  // Group deals by stage for Kanban
  const dealsByStage = PIPELINE_STAGES.reduce<Record<string, Deal[]>>((acc, s) => {
    acc[s.key] = deals.filter((d) => d.stage === s.key);
    return acc;
  }, {});

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-hero">
        <p className="fleet-compliance-eyebrow">Realty Command</p>
        <h1>Real Estate Pipeline</h1>
        <p className="fleet-compliance-subcopy">
          Track leads, manage deals through stages, and calculate commissions.
        </p>
      </section>

      {error && (
        <div
          style={{
            marginTop: '1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#991b1b',
          }}
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 600 }}
          >
            x
          </button>
        </div>
      )}

      {/* Pipeline Summary Cards */}
      {summary && (
        <section className="fleet-compliance-section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Total Deals', value: String(summary.totalDeals) },
              { label: 'Pipeline Value', value: formatCurrency(summary.totalValue) },
              { label: 'Closed Deals', value: String(summary.closedCount) },
              { label: 'Total Leads', value: String(summary.totalLeads) },
              { label: 'Conversion Rate', value: `${summary.conversionRate}%` },
              { label: 'Avg Lead Score', value: String(summary.avgLeadScore) },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions Row */}
      <section className="fleet-compliance-section">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowAddDeal((p) => !p)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--teal)',
              background: 'var(--teal-dim)',
              color: 'var(--teal)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {showAddDeal ? 'Cancel' : '+ New Deal'}
          </button>
          <Link
            href="/fleet-compliance/realty/calculator"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: '#f8fafc',
              color: 'var(--navy)',
              textDecoration: 'none',
              fontSize: '0.85rem',
            }}
          >
            Commission Calculator
          </Link>
        </div>
      </section>

      {/* Add Deal Form */}
      {showAddDeal && (
        <section className="fleet-compliance-section">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--navy)' }}>New Deal</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            <input
              placeholder="Client Name"
              value={newDeal.clientName}
              onChange={(e) => setNewDeal((p) => ({ ...p, clientName: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Property Address"
              value={newDeal.propertyAddress}
              onChange={(e) => setNewDeal((p) => ({ ...p, propertyAddress: e.target.value }))}
              style={inputStyle}
            />
            <select
              value={newDeal.dealType}
              onChange={(e) => setNewDeal((p) => ({ ...p, dealType: e.target.value }))}
              style={inputStyle}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="dual">Dual</option>
            </select>
            <input
              placeholder="Offer Amount"
              type="number"
              value={newDeal.offerAmount}
              onChange={(e) => setNewDeal((p) => ({ ...p, offerAmount: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Commission %"
              type="number"
              step="0.1"
              value={newDeal.commissionPct}
              onChange={(e) => setNewDeal((p) => ({ ...p, commissionPct: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Est. Close Date"
              type="date"
              value={newDeal.estimatedClose}
              onChange={(e) => setNewDeal((p) => ({ ...p, estimatedClose: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <button
            type="button"
            onClick={handleAddDeal}
            disabled={!newDeal.clientName || !newDeal.propertyAddress}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              cursor: (!newDeal.clientName || !newDeal.propertyAddress) ? 'not-allowed' : 'pointer',
              opacity: (!newDeal.clientName || !newDeal.propertyAddress) ? 0.5 : 1,
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Add Deal
          </button>
        </section>
      )}

      {/* Lead Scoring */}
      <section className="fleet-compliance-section">
        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--navy)' }}>Lead Scoring</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedLeadId}
            onChange={(e) => { setSelectedLeadId(e.target.value); setScoreResult(null); }}
            style={{ ...inputStyle, minWidth: '280px' }}
          >
            <option value="">-- Select a lead --</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.firstName} {l.lastName} ({l.source} / {l.status})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleScoreLead}
            disabled={!selectedLeadId || scoring}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              cursor: (!selectedLeadId || scoring) ? 'not-allowed' : 'pointer',
              opacity: (!selectedLeadId || scoring) ? 0.5 : 1,
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {scoring ? 'Scoring...' : 'Score Lead'}
          </button>
        </div>
        {scoreResult && (
          <div
            style={{
              marginTop: '0.75rem',
              background: 'var(--teal-dim)',
              border: '1px solid rgba(61,142,185,0.25)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.2rem' }}>Score</p>
              <p
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  margin: 0,
                  color: scoreResult.score >= 60 ? '#059669' : scoreResult.score >= 30 ? '#d97706' : '#dc2626',
                }}
              >
                {scoreResult.score}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>Breakdown</p>
              {Object.entries(scoreResult.breakdown).map(([key, val]) => (
                <span
                  key={key}
                  style={{
                    display: 'inline-block',
                    marginRight: '0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}:</span> +{val}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Kanban Pipeline Board */}
      {loading ? (
        <section className="fleet-compliance-section">
          <p style={{ color: 'var(--text-muted)' }}>Loading pipeline...</p>
        </section>
      ) : (
        <section className="fleet-compliance-section">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--navy)' }}>Deal Pipeline</h3>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
            }}
          >
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = dealsByStage[stage.key] || [];
              return (
                <div
                  key={stage.key}
                  style={{
                    minWidth: '240px',
                    maxWidth: '280px',
                    flex: '0 0 auto',
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderBottom: `2px solid ${STAGE_COLORS[stage.key] || '#64748b'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--navy)' }}>
                      {stage.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        background: STAGE_COLORS[stage.key] || '#64748b',
                        color: '#fff',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {stageDeals.length}
                    </span>
                  </div>
                  {/* Deal Cards */}
                  <div style={{ padding: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {stageDeals.length === 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                        No deals
                      </p>
                    )}
                    {stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onMoveNext={() => {
                          const stageIdx = PIPELINE_STAGES.findIndex((s) => s.key === deal.stage);
                          if (stageIdx < PIPELINE_STAGES.length - 2) {
                            handleMoveStage(deal.id, PIPELINE_STAGES[stageIdx + 1].key);
                          }
                        }}
                        isMoving={movingDeal === deal.id}
                        canMoveNext={
                          PIPELINE_STAGES.findIndex((s) => s.key === deal.stage) < PIPELINE_STAGES.length - 2
                          && deal.stage !== 'closed'
                          && deal.stage !== 'fell_through'
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Deal Card Sub-component
// ---------------------------------------------------------------------------

function DealCard({
  deal,
  onMoveNext,
  isMoving,
  canMoveNext,
}: {
  deal: Deal;
  onMoveNext: () => void;
  isMoving: boolean;
  canMoveNext: boolean;
}) {
  const value = deal.acceptedAmount ?? deal.offerAmount;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '0.6rem',
        opacity: isMoving ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.2rem', color: 'var(--navy)' }}>
        {deal.clientName}
      </p>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 0.3rem', lineHeight: '1.3' }}>
        {deal.propertyAddress}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--teal)' }}>
          {formatCurrency(value)}
        </span>
        <span
          style={{
            fontSize: '0.6rem',
            textTransform: 'uppercase',
            fontWeight: 600,
            background: deal.dealType === 'sell' ? 'rgba(217,119,6,0.12)' : 'var(--teal-dim)',
            color: deal.dealType === 'sell' ? '#b45309' : 'var(--teal)',
            padding: '1px 5px',
            borderRadius: '3px',
          }}
        >
          {deal.dealType}
        </span>
      </div>
      {deal.estimatedClose && (
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          Est. close: {deal.estimatedClose}
        </p>
      )}
      {canMoveNext && (
        <button
          type="button"
          onClick={onMoveNext}
          disabled={isMoving}
          style={{
            marginTop: '0.4rem',
            width: '100%',
            padding: '0.3rem',
            borderRadius: '4px',
            border: '1px solid rgba(61,142,185,0.3)',
            background: 'var(--teal-dim)',
            color: 'var(--teal)',
            cursor: isMoving ? 'not-allowed' : 'pointer',
            fontSize: '0.7rem',
            fontWeight: 600,
          }}
        >
          {isMoving ? 'Moving...' : 'Advance Stage ->'}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared input style (light theme)
// ---------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: '#ffffff',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
};
