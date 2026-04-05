'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type OpportunityStatus =
  | 'identified'
  | 'evaluating'
  | 'bid'
  | 'no_bid'
  | 'submitted'
  | 'awarded'
  | 'lost';

interface OpportunityDetail {
  id: string;
  title: string;
  solicitation_number: string;
  agency: string;
  sub_agency: string | null;
  posted_date: string | null;
  response_deadline: string | null;
  set_aside_type: string;
  naics_code: string;
  naics_description: string;
  estimated_value: number | null;
  place_of_performance: string | null;
  description: string;
  url: string | null;
  status: OpportunityStatus;
  source: string;
}

interface BidDecision {
  id: string;
  decision: 'bid' | 'no_bid';
  score: number;
  rationale: string;
  criteria_scores: Array<{
    criterion: string;
    score: number;
    weight: number;
    notes: string | null;
  }>;
}

interface BidDocument {
  id: string;
  document_type: string;
  status: 'draft' | 'review' | 'final' | string;
  version: number;
  created_at: string | null;
  updated_at?: string | null;
}

interface BidDocumentDetail extends BidDocument {
  content: string;
}

interface GeneratedOutputRow {
  filename: string;
  format: string;
  sizeBytes: number;
  type?: string;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  agency: string;
  status: string;
}

interface OpportunityResponse {
  ok: boolean;
  opportunity?: OpportunityDetail;
  bidDecision?: BidDecision | null;
  bidDocuments?: BidDocument[];
  contacts?: Contact[];
  intel?: {
    sourceUrl: string | null;
    sourceSummary: string | null;
    extractedAt: string;
    sourceLength: number;
  } | null;
  error?: string;
}

interface BidDecisionFormState {
  technical_fit: string;
  set_aside_match: string;
  competition_level: string;
  contract_value: string;
  timeline_feasibility: string;
  relationship: string;
  strategic_value: string;
}

const statusColors: Record<OpportunityStatus, string> = {
  identified: '#6b7280',
  evaluating: '#2563eb',
  bid: '#16a34a',
  no_bid: '#dc2626',
  submitted: '#ca8a04',
  awarded: '#0f766e',
  lost: '#ea580c',
};

const statusOptions: OpportunityStatus[] = [
  'identified',
  'evaluating',
  'bid',
  'no_bid',
  'submitted',
  'awarded',
  'lost',
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '--';
  return currencyFormatter.format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString('en-US');
}

function daysUntil(dateValue: string | null): string {
  if (!dateValue) return '--';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '--';
  const diff = parsed.getTime() - Date.now();
  return String(Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getDecisionColor(decision: 'bid' | 'no_bid'): string {
  return decision === 'bid' ? '#16a34a' : '#dc2626';
}

function toTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value);
  const millis = parsed.getTime();
  return Number.isFinite(millis) ? millis : 0;
}

function toDocumentLabel(value: string): string {
  return value
    .split('_')
    .map((part) => (part.length ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(' ');
}

function selectLatestBidDocuments(documents: BidDocument[]): BidDocument[] {
  const byType = new Map<string, BidDocument>();

  for (const document of documents) {
    const type = String(document?.document_type ?? '').trim();
    if (!type) continue;

    const existing = byType.get(type);
    if (!existing) {
      byType.set(type, document);
      continue;
    }

    const candidateTs = Math.max(
      toTimestamp(document?.updated_at),
      toTimestamp(document?.created_at),
    );
    const existingTs = Math.max(
      toTimestamp(existing?.updated_at),
      toTimestamp(existing?.created_at),
    );

    if (candidateTs >= existingTs) {
      byType.set(type, document);
    }
  }

  return Array.from(byType.values()).sort((a, b) => {
    const aTs = Math.max(toTimestamp(a?.updated_at), toTimestamp(a?.created_at));
    const bTs = Math.max(toTimestamp(b?.updated_at), toTimestamp(b?.created_at));
    return bTs - aTs;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

function fileNameFromDisposition(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const match = /filename="([^"]+)"/i.exec(headerValue);
  if (!match?.[1]) return null;
  return match[1];
}

function defaultBidForm(contractValue: number | null): BidDecisionFormState {
  return {
    technical_fit: '70',
    set_aside_match: '70',
    competition_level: '60',
    contract_value: String(contractValue ?? 100000),
    timeline_feasibility: '70',
    relationship: '50',
    strategic_value: '70',
  };
}

export default function GovConOpportunityDetailPage() {
  const params = useParams();
  const opportunityId = String(params.id ?? '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<OpportunityResponse | null>(null);
  const [statusDraft, setStatusDraft] = useState<OpportunityStatus>('identified');
  const [savingStatus, setSavingStatus] = useState(false);
  const [runningBidDecision, setRunningBidDecision] = useState(false);
  const [runningAutoBidDecision, setRunningAutoBidDecision] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState<BidDecisionFormState>(defaultBidForm(null));
  const [generatingBidDocs, setGeneratingBidDocs] = useState(false);
  const [pullingIntel, setPullingIntel] = useState(false);
  const [intelMessage, setIntelMessage] = useState('');
  const [runningIntake, setRunningIntake] = useState(false);
  const [intakeMessage, setIntakeMessage] = useState('');
  const [bidGenerationMessage, setBidGenerationMessage] = useState('');
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutputRow[]>([]);
  const [reviewingDocument, setReviewingDocument] = useState<BidDocumentDetail | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'draft' | 'review' | 'final'>('draft');
  const [loadingReviewDocument, setLoadingReviewDocument] = useState(false);
  const [savingReviewDocument, setSavingReviewDocument] = useState(false);
  const [downloadingAsset, setDownloadingAsset] = useState('');
  const [downloadingPackage, setDownloadingPackage] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/fleet-compliance/govcon/${opportunityId}`, { cache: 'no-store' });
      const data = (await response.json().catch(() => ({}))) as OpportunityResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load opportunity detail');
      }
      setPayload(data);
      const currentStatus = data?.opportunity?.status || 'identified';
      setStatusDraft(currentStatus);
      setBidForm(defaultBidForm(data?.opportunity?.estimated_value ?? null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunity detail');
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    if (!opportunityId) return;
    void loadDetail();
  }, [opportunityId, loadDetail]);

  const opportunity = payload?.opportunity;
  const bidDecision = payload?.bidDecision;
  const bidDocuments = useMemo(
    () => (Array.isArray(payload?.bidDocuments) ? payload.bidDocuments : []),
    [payload?.bidDocuments],
  );
  const latestBidDocuments = useMemo(() => selectLatestBidDocuments(bidDocuments), [bidDocuments]);
  const contacts = useMemo(
    () => (Array.isArray(payload?.contacts) ? payload.contacts : []),
    [payload?.contacts],
  );
  const intel = payload?.intel || null;

  const countdownLabel = useMemo(() => {
    const days = daysUntil(opportunity?.response_deadline ?? null);
    if (days === '--') return '--';
    const asNumber = Number(days);
    if (!Number.isFinite(asNumber)) return '--';
    return `${days} day${asNumber === 1 ? '' : 's'}`;
  }, [opportunity?.response_deadline]);

  useEffect(() => {
    if (!reviewingDocument) return;
    const stillExists = latestBidDocuments.some((entry) => entry.id === reviewingDocument.id);
    if (!stillExists) {
      setReviewingDocument(null);
      setReviewContent('');
      setReviewStatus('draft');
    }
  }, [latestBidDocuments, reviewingDocument]);

  async function handleUpdateStatus() {
    if (!opportunity) return;

    setSavingStatus(true);
    setError('');

    try {
      const response = await fetch(`/api/fleet-compliance/govcon/${opportunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusDraft }),
      });
      const data = (await response.json().catch(() => ({}))) as OpportunityResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update status');
      }
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleRunBidDecision() {
    if (!opportunity) return;

    setRunningBidDecision(true);
    setError('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon/bid-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          technical_fit: Number(bidForm.technical_fit),
          set_aside_match: Number(bidForm.set_aside_match),
          competition_level: Number(bidForm.competition_level),
          contract_value: Number(bidForm.contract_value),
          timeline_feasibility: Number(bidForm.timeline_feasibility),
          relationship: Number(bidForm.relationship),
          strategic_value: Number(bidForm.strategic_value),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to run bid decision');
      }

      setShowBidForm(false);
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run bid decision');
    } finally {
      setRunningBidDecision(false);
    }
  }

  async function handleRunAutoBidDecision() {
    if (!opportunity) return;

    setRunningAutoBidDecision(true);
    setError('');
    setIntelMessage('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon/bid-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          mode: 'auto',
          use_documentation: true,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok: boolean;
        error?: string;
        autoInput?: Record<string, unknown> | null;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to run documentation-based scoring');
      }

      if (data.autoInput && typeof data.autoInput === 'object') {
        const autoInput = data.autoInput as Record<string, unknown>;
        setBidForm({
          technical_fit: String(autoInput.technical_fit ?? ''),
          set_aside_match: String(autoInput.set_aside_match ?? ''),
          competition_level: String(autoInput.competition_level ?? ''),
          contract_value: String(autoInput.contract_value ?? ''),
          timeline_feasibility: String(autoInput.timeline_feasibility ?? ''),
          relationship: String(autoInput.relationship ?? ''),
          strategic_value: String(autoInput.strategic_value ?? ''),
        });
      }

      setIntelMessage('Documentation-based scoring completed using extracted solicitation text.');
      setShowBidForm(false);
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run documentation-based scoring');
    } finally {
      setRunningAutoBidDecision(false);
    }
  }

  async function handlePullSolicitationIntel(forceRefresh = false) {
    if (!opportunity) return;

    setPullingIntel(true);
    setError('');
    setIntelMessage('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          force_refresh: forceRefresh,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok: boolean;
        error?: string;
        intel?: {
          sourceLength?: number;
          extractedAt?: string;
        };
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to pull solicitation intelligence');
      }

      const length = Number(data?.intel?.sourceLength ?? 0);
      setIntelMessage(
        `Solicitation documentation extracted (${Math.max(1, Math.round(length / 1024))} KB text).`,
      );
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull solicitation intelligence');
    } finally {
      setPullingIntel(false);
    }
  }

  async function handleGenerateBidPackage() {
    if (!opportunity) return;

    setGeneratingBidDocs(true);
    setError('');
    setBidGenerationMessage('');
    setGeneratedOutputs([]);

    try {
      const response = await fetch('/api/fleet-compliance/govcon/bid-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunity.id, use_documentation: true }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok: boolean;
        error?: string;
        summary?: { total: number; generated: number };
        documents?: Array<{
          type: string;
          outputs?: Array<{
            filename: string;
            format: string;
            sizeBytes: number;
          }>;
        }>;
        document?: {
          outputs?: Array<{
            filename: string;
            format: string;
            sizeBytes: number;
          }>;
        };
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to generate bid documents');
      }

      const outputsFromPackage = Array.isArray(data.documents)
        ? data.documents.flatMap((entry) =>
          (Array.isArray(entry.outputs) ? entry.outputs : []).map((output) => ({
            ...output,
            type: entry.type,
          })))
        : [];
      const outputsFromSingle = Array.isArray(data.document?.outputs) ? data.document.outputs : [];
      const outputs = [...outputsFromPackage, ...outputsFromSingle];

      if (outputs.length > 0) {
        setGeneratedOutputs(outputs);
      }

      if (data.summary) {
        setBidGenerationMessage(
          `Generated ${data.summary.generated} of ${data.summary.total} bid documents for ${opportunity.solicitation_number}.`,
        );
      } else if (outputs.length > 0) {
        setBidGenerationMessage(`Generated ${outputs.length} output files for ${opportunity.solicitation_number}.`);
      } else {
        setBidGenerationMessage('Bid generation completed, but no output files were reported.');
      }

      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate bid documents');
    } finally {
      setGeneratingBidDocs(false);
    }
  }

  async function handleOpenBidDocument(documentId: string) {
    setLoadingReviewDocument(true);
    setError('');

    try {
      const response = await fetch(`/api/fleet-compliance/govcon/bid-documents/${documentId}`, {
        cache: 'no-store',
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok: boolean;
        error?: string;
        document?: BidDocumentDetail;
      };

      if (!response.ok || !data.ok || !data.document) {
        throw new Error(data.error || 'Failed to load bid document');
      }

      setReviewingDocument(data.document);
      setReviewContent(data.document.content || '');
      const parsedStatus = data.document.status;
      if (parsedStatus === 'draft' || parsedStatus === 'review' || parsedStatus === 'final') {
        setReviewStatus(parsedStatus);
      } else {
        setReviewStatus('draft');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bid document');
    } finally {
      setLoadingReviewDocument(false);
    }
  }

  async function handleSaveBidDocumentReview() {
    if (!reviewingDocument) return;

    setSavingReviewDocument(true);
    setError('');

    try {
      const response = await fetch(`/api/fleet-compliance/govcon/bid-documents/${reviewingDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: reviewContent,
          status: reviewStatus,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok: boolean;
        error?: string;
        document?: BidDocumentDetail;
      };
      if (!response.ok || !data.ok || !data.document) {
        throw new Error(data.error || 'Failed to save bid document');
      }

      setReviewingDocument(data.document);
      setBidGenerationMessage('Bid document saved. Download DOCX/PDF for client-side review before submission.');
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bid document');
    } finally {
      setSavingReviewDocument(false);
    }
  }

  async function handleDownloadBidDocument(documentId: string, format: 'docx' | 'pdf' | 'markdown') {
    setDownloadingAsset(`${documentId}:${format}`);
    setError('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon/bid-documents/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
          format,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Failed to download document');
      }

      const blob = await response.blob();
      const fileName = fileNameFromDisposition(response.headers.get('content-disposition'))
        || `bid-document.${format === 'markdown' ? 'md' : format}`;
      downloadBlob(blob, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
    } finally {
      setDownloadingAsset('');
    }
  }

  async function handleDownloadBidPackageZip() {
    if (!opportunity) return;

    setDownloadingPackage(true);
    setError('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon/bid-documents/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          formats: ['docx', 'pdf', 'markdown'],
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Failed to download bid package');
      }

      const blob = await response.blob();
      const fileName = fileNameFromDisposition(response.headers.get('content-disposition'))
        || `${opportunity.solicitation_number}_bid_package.zip`;
      downloadBlob(blob, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download bid package');
    } finally {
      setDownloadingPackage(false);
    }
  }

  async function handleRunIntake() {
    setRunningIntake(true);
    setError('');
    setIntakeMessage('');

    try {
      const companyResponse = await fetch('/api/fleet-compliance/govcon/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: 'True North Data Strategies LLC',
          federal_contracts: true,
          frameworks_required: ['cmmc', 'nist-800-171'],
          handles_cui: true,
        }),
      });
      const companyData = (await companyResponse.json().catch(() => ({}))) as {
        ok: boolean;
        company?: { id: string };
        error?: string;
      };

      if (!companyResponse.ok || !companyData.ok || !companyData.company?.id) {
        throw new Error(companyData.error || 'Failed to initialize company profile');
      }

      const intakeResponse = await fetch('/api/fleet-compliance/govcon/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyData.company.id }),
      });
      const intakeData = (await intakeResponse.json().catch(() => ({}))) as {
        ok: boolean;
        result?: { recommended_skills?: unknown[] };
        error?: string;
      };

      if (!intakeResponse.ok || !intakeData.ok) {
        throw new Error(intakeData.error || 'Failed to run intake wizard');
      }

      const recommendationCount = Array.isArray(intakeData?.result?.recommended_skills)
        ? intakeData.result.recommended_skills.length
        : 0;
      setIntakeMessage(`Intake completed with ${recommendationCount} recommended skill domains.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run intake');
    } finally {
      setRunningIntake(false);
    }
  }

  if (loading) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <p style={{ color: 'var(--text-secondary)' }}>Loading opportunity detail...</p>
        </section>
      </main>
    );
  }

  if (!opportunity) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <p style={{ color: 'var(--text-secondary)' }}>Opportunity not found.</p>
          <div style={{ marginTop: '0.8rem' }}>
            <Link href="/fleet-compliance/govcon" className="btn-secondary">
              Back to GovCon
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/govcon">GovCon</Link>
          <span>/</span>
          <span>{opportunity.solicitation_number}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Opportunity Detail</p>
            <h1>{opportunity.title}</h1>
            <p className="fleet-compliance-subcopy">
              {opportunity.agency} · {opportunity.solicitation_number}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <span
              style={{
                display: 'inline-block',
                borderRadius: '6px',
                padding: '0.25rem 0.7rem',
                background: `${statusColors[opportunity.status]}1A`,
                color: statusColors[opportunity.status],
                fontWeight: 700,
                textTransform: 'capitalize',
              }}
            >
              {opportunity.status.replace('_', ' ')}
            </span>
            <Link href="/fleet-compliance/govcon" className="btn-secondary">
              Back
            </Link>
          </div>
        </div>

        {error ? (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        {intakeMessage ? (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            {intakeMessage}
          </div>
        ) : null}

        {bidGenerationMessage ? (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            {bidGenerationMessage}
          </div>
        ) : null}

        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          }}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="fleet-compliance-stats" style={{ marginTop: 0 }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Estimated Value</p>
                <p className="fleet-compliance-stat-value">{formatCurrency(opportunity.estimated_value)}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Days Until Deadline</p>
                <p className="fleet-compliance-stat-value">{countdownLabel}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Set-Aside</p>
                <p className="fleet-compliance-stat-value">{opportunity.set_aside_type}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Source</p>
                <p className="fleet-compliance-stat-value">{opportunity.source}</p>
              </article>
            </div>

            <article className="fleet-compliance-list-card">
              <h3>Bid Decision</h3>
              {bidDecision ? (
                <>
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {bidDecision.score}
                    </span>
                    <span
                      style={{
                        borderRadius: '5px',
                        padding: '0.2rem 0.6rem',
                        background: `${getDecisionColor(bidDecision.decision)}1A`,
                        color: getDecisionColor(bidDecision.decision),
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {bidDecision.decision.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="fleet-compliance-table-wrap">
                    <table className="fleet-compliance-table">
                      <thead>
                        <tr>
                          <th>Criterion</th>
                          <th>Score</th>
                          <th>Weight</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bidDecision.criteria_scores.map((criterion, index) => (
                          <tr key={`${criterion.criterion}-${index}`}>
                            <td>{criterion.criterion}</td>
                            <td>{criterion.score}</td>
                            <td>{criterion.weight.toFixed(2)}</td>
                            <td>{criterion.notes || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
                    {bidDecision.rationale}
                  </p>
                </>
              ) : (
                <>
                  <p className="fleet-compliance-table-note" style={{ marginTop: '0.7rem' }}>
                    No bid decision yet. Run the weighted bid/no-bid evaluation.
                  </p>
                  <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginTop: '0.7rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowBidForm((current) => !current)}
                    >
                      {showBidForm ? 'Hide Bid Decision Form' : 'Run Manual Bid Decision'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void handleRunAutoBidDecision()}
                      disabled={runningAutoBidDecision}
                    >
                      {runningAutoBidDecision ? 'Auto Scoring...' : 'Auto-Score from Docs'}
                    </button>
                  </div>
                </>
              )}

              {showBidForm ? (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  {[
                    ['technical_fit', 'Technical Fit'],
                    ['set_aside_match', 'Set-Aside Match'],
                    ['competition_level', 'Competition Level'],
                    ['contract_value', 'Contract Value'],
                    ['timeline_feasibility', 'Timeline Feasibility'],
                    ['relationship', 'Relationship'],
                    ['strategic_value', 'Strategic Value'],
                  ].map(([key, label]) => (
                    <label key={key} className="fleet-compliance-field-stack">
                      <span>{label}</span>
                      <input
                        type="number"
                        min={0}
                        max={key === 'contract_value' ? undefined : 100}
                        value={bidForm[key as keyof BidDecisionFormState]}
                        onChange={(event) =>
                          setBidForm((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.7rem' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={runningBidDecision}
                      onClick={() => void handleRunBidDecision()}
                    >
                      {runningBidDecision ? 'Running...' : 'Submit Bid Decision'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={runningBidDecision}
                      onClick={() => setShowBidForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
              {intelMessage ? (
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.75rem', color: 'var(--text-primary)' }}>
                  {intelMessage}
                </p>
              ) : null}
            </article>

            <article className="fleet-compliance-list-card">
              <div className="fleet-compliance-section-head" style={{ alignItems: 'center' }}>
                <h3>Bid Documents</h3>
                <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void handleGenerateBidPackage()}
                    disabled={generatingBidDocs}
                  >
                    {generatingBidDocs ? 'Generating...' : 'Generate Bid Package'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void handleDownloadBidPackageZip()}
                    disabled={downloadingPackage}
                  >
                    {downloadingPackage ? 'Packaging...' : 'Download ZIP Package'}
                  </button>
                </div>
              </div>

              {latestBidDocuments.length === 0 ? (
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.6rem' }}>
                  No bid documents generated yet.
                </p>
              ) : (
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Version</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestBidDocuments.map((document) => (
                        <tr key={document.id}>
                          <td>{toDocumentLabel(document.document_type)}</td>
                          <td>{document.status}</td>
                          <td>v{document.version}</td>
                          <td>{formatDateTime(document.created_at)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => void handleOpenBidDocument(document.id)}
                                disabled={loadingReviewDocument}
                              >
                                {loadingReviewDocument && reviewingDocument?.id === document.id ? 'Loading...' : 'Review/Edit'}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => void handleDownloadBidDocument(document.id, 'docx')}
                                disabled={downloadingAsset === `${document.id}:docx`}
                              >
                                {downloadingAsset === `${document.id}:docx` ? '...' : 'DOCX'}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => void handleDownloadBidDocument(document.id, 'pdf')}
                                disabled={downloadingAsset === `${document.id}:pdf`}
                              >
                                {downloadingAsset === `${document.id}:pdf` ? '...' : 'PDF'}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => void handleDownloadBidDocument(document.id, 'markdown')}
                                disabled={downloadingAsset === `${document.id}:markdown`}
                              >
                                {downloadingAsset === `${document.id}:markdown` ? '...' : 'MD'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reviewingDocument && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="fleet-compliance-section-head" style={{ marginBottom: '0.55rem' }}>
                    <h3 style={{ margin: 0 }}>Review / Edit: {toDocumentLabel(reviewingDocument.document_type)}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <label className="fleet-compliance-field-stack" style={{ minWidth: 150 }}>
                        <span>Status</span>
                        <select
                          value={reviewStatus}
                          onChange={(event) => setReviewStatus(event.target.value as 'draft' | 'review' | 'final')}
                        >
                          <option value="draft">draft</option>
                          <option value="review">review</option>
                          <option value="final">final</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <label className="fleet-compliance-field-stack">
                    <span>Editable Source (Markdown)</span>
                    <textarea
                      rows={14}
                      value={reviewContent}
                      onChange={(event) => setReviewContent(event.target.value)}
                    />
                  </label>
                  <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={savingReviewDocument}
                      onClick={() => void handleSaveBidDocumentReview()}
                    >
                      {savingReviewDocument ? 'Saving...' : 'Save Revision'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void handleDownloadBidDocument(reviewingDocument.id, 'docx')}
                      disabled={downloadingAsset === `${reviewingDocument.id}:docx`}
                    >
                      {downloadingAsset === `${reviewingDocument.id}:docx` ? 'Downloading...' : 'Download DOCX'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void handleDownloadBidDocument(reviewingDocument.id, 'pdf')}
                      disabled={downloadingAsset === `${reviewingDocument.id}:pdf`}
                    >
                      {downloadingAsset === `${reviewingDocument.id}:pdf` ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void handleDownloadBidPackageZip()}
                      disabled={downloadingPackage}
                    >
                      {downloadingPackage ? 'Packaging...' : 'Download Full ZIP'}
                    </button>
                  </div>
                  <p className="fleet-compliance-table-note" style={{ marginTop: '0.55rem' }}>
                    Word edits are done by downloading DOCX, editing locally, then including the revised files in the ZIP for portal submission.
                  </p>
                </div>
              )}

              {generatedOutputs.length > 0 && (
                <div className="fleet-compliance-table-wrap" style={{ marginTop: '0.9rem' }}>
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Output File</th>
                        <th>Format</th>
                        <th>Size (KB)</th>
                        <th>Document Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedOutputs.map((output, index) => (
                        <tr key={`${output.filename}-${index}`}>
                          <td>{output.filename}</td>
                          <td>{output.format}</td>
                          <td>{Math.max(1, Math.round(output.sizeBytes / 1024))}</td>
                          <td>{output.type || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="fleet-compliance-list-card">
              <h3>Description</h3>
              <p style={{ marginTop: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {opportunity.description}
              </p>
            </article>

            {intel ? (
              <article className="fleet-compliance-list-card">
                <h3>Solicitation Intelligence</h3>
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.55rem' }}>
                  Extracted: {formatDateTime(intel.extractedAt)} | Source text: {Math.max(1, Math.round(intel.sourceLength / 1024))} KB
                </p>
                {intel.sourceSummary ? (
                  <p style={{ marginTop: '0.55rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {intel.sourceSummary}
                  </p>
                ) : (
                  <p className="fleet-compliance-table-note" style={{ marginTop: '0.55rem' }}>
                    No summary available for the extracted source text yet.
                  </p>
                )}
              </article>
            ) : null}
          </div>

          <aside style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
            <article className="fleet-compliance-list-card">
              <h3>Bid Workflow</h3>
              <ol style={{ margin: '0.7rem 0 0 1rem', padding: 0, display: 'grid', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <li>Review opportunity details, deadline, and set-aside fit.</li>
                <li>Run Bid Decision scoring to produce bid/no-bid rationale.</li>
                <li>Generate bid package outputs (DOCX/PDF/Markdown).</li>
                <li>Edit source content, then download DOCX/PDF or full ZIP package.</li>
                <li>Set status to <strong>bid</strong>, then move to <strong>submitted</strong> after final review.</li>
                <li>Track final outcome as <strong>awarded</strong> or <strong>lost</strong>.</li>
              </ol>
            </article>

            <article className="fleet-compliance-list-card">
              <h3>Submittal Path</h3>
              <ol style={{ margin: '0.7rem 0 0 1rem', padding: 0, display: 'grid', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <li>Click <strong>Generate Bid Package</strong> to build all documents.</li>
                <li>Open each document in <strong>Review/Edit</strong> and save revisions.</li>
                <li>Download DOCX for client-side Word edits or export ZIP package.</li>
                <li>Submit the package through the target portal (SAM, PIEE, agency portal, etc.).</li>
                <li>In this app, update opportunity status to <strong>submitted</strong>.</li>
              </ol>
              <p className="fleet-compliance-table-note" style={{ marginTop: '0.65rem' }}>
                Automated portal submittal is not wired yet; submission is currently a manual external step.
              </p>
            </article>

            <article className="fleet-compliance-list-card">
              <h3>Actions</h3>
              <label className="fleet-compliance-field-stack" style={{ marginTop: '0.6rem' }}>
                <span>Edit Status</span>
                <select
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value as OpportunityStatus)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ marginTop: '0.7rem', display: 'grid', gap: '0.55rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={savingStatus}
                  onClick={() => void handleUpdateStatus()}
                >
                  {savingStatus ? 'Saving...' : 'Save Status'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={generatingBidDocs}
                  onClick={() => void handleGenerateBidPackage()}
                >
                  {generatingBidDocs ? 'Generating...' : 'Generate Bid Package'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={downloadingPackage}
                  onClick={() => void handleDownloadBidPackageZip()}
                >
                  {downloadingPackage ? 'Packaging...' : 'Download ZIP Package'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={runningIntake}
                  onClick={() => void handleRunIntake()}
                >
                  {runningIntake ? 'Running Intake...' : 'Run Intake'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={pullingIntel}
                  onClick={() => void handlePullSolicitationIntel(true)}
                >
                  {pullingIntel ? 'Extracting Docs...' : 'Pull Solicitation Docs'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={runningAutoBidDecision}
                  onClick={() => void handleRunAutoBidDecision()}
                >
                  {runningAutoBidDecision ? 'Auto Scoring...' : 'Auto-Score from Docs'}
                </button>
              </div>
            </article>

            <article className="fleet-compliance-list-card">
              <h3>Opportunity Info</h3>
              <div style={{ marginTop: '0.65rem', display: 'grid', gap: '0.45rem' }}>
                <div><strong>Posted:</strong> {formatDateTime(opportunity.posted_date)}</div>
                <div><strong>Deadline:</strong> {formatDateTime(opportunity.response_deadline)}</div>
                <div><strong>Countdown:</strong> {countdownLabel}</div>
                <div><strong>NAICS:</strong> {opportunity.naics_code}</div>
                <div className="fleet-compliance-table-note">{opportunity.naics_description}</div>
                <div><strong>Place:</strong> {opportunity.place_of_performance || '--'}</div>
                {opportunity.url ? (
                  <a
                    href={opportunity.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Open SAM.gov Listing
                  </a>
                ) : null}
                {intel?.sourceUrl ? (
                  <a
                    href={intel.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Open Extracted Source URL
                  </a>
                ) : null}
              </div>
            </article>

            <article className="fleet-compliance-list-card">
              <h3>Related Contacts</h3>
              {contacts.length === 0 ? (
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.6rem' }}>
                  No outreach contacts linked to this agency yet.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', margin: '0.6rem 0 0', padding: 0 }}>
                  {contacts.map((contact) => (
                    <li
                      key={contact.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        padding: '0.5rem 0',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{contact.name}</div>
                      <div className="fleet-compliance-table-note">{contact.title}</div>
                      <div className="fleet-compliance-table-note">{contact.email}</div>
                      <div className="fleet-compliance-table-note">Status: {contact.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
