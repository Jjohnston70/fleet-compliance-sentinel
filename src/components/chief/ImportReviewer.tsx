'use client';

import { useState, useRef } from 'react';
import { IMPORT_SCHEMAS, type CollectionKey } from '@/lib/chief-import-schemas';

interface ParsedRow {
  rowIndex: number;
  data: Record<string, string>;
  issues: string[];
}

interface ParseResult {
  collection: string;
  collectionLabel: string;
  headers: string[];
  expectedHeaders: string[];
  missingHeaders: string[];
  totalRows: number;
  passCount: number;
  warnCount: number;
  rows: ParsedRow[];
}

type ReviewMap = Record<number, 'approved' | 'rejected'>;

type ViewState =
  | { state: 'idle' }
  | { state: 'parsing' }
  | { state: 'result'; result: ParseResult; review: ReviewMap }
  | { state: 'error'; message: string };

const COLLECTIONS = Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => ({
  key: key as CollectionKey,
  label: schema.label,
}));

export default function ImportReviewer() {
  const [collection, setCollection] = useState<CollectionKey>('drivers');
  const [view, setView] = useState<ViewState>({ state: 'idle' });
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setView({ state: 'parsing' });

    const formData = new FormData();
    formData.append('collection', collection);
    formData.append('file', file);

    try {
      const res = await fetch('/api/chief/import/parse', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const result = data as ParseResult;
      // Default: approve rows with no issues, reject rows with issues
      const review: ReviewMap = {};
      for (const row of result.rows) {
        review[row.rowIndex] = row.issues.length === 0 ? 'approved' : 'rejected';
      }
      setView({ state: 'result', result, review });
    } catch (err: unknown) {
      setView({ state: 'error', message: String(err) });
    }
  }

  function toggleRow(rowIndex: number) {
    if (view.state !== 'result') return;
    const current = view.review[rowIndex] ?? 'rejected';
    setView({
      ...view,
      review: { ...view.review, [rowIndex]: current === 'approved' ? 'rejected' : 'approved' },
    });
  }

  function approveAll() {
    if (view.state !== 'result') return;
    const review: ReviewMap = {};
    for (const row of view.result.rows) review[row.rowIndex] = 'approved';
    setView({ ...view, review });
  }

  function rejectAll() {
    if (view.state !== 'result') return;
    const review: ReviewMap = {};
    for (const row of view.result.rows) review[row.rowIndex] = 'rejected';
    setView({ ...view, review });
  }

  function downloadApproved() {
    if (view.state !== 'result') return;
    const approved = view.result.rows.filter((r) => view.review[r.rowIndex] === 'approved');
    const payload = {
      collection: view.result.collection,
      approvedAt: new Date().toISOString(),
      rowCount: approved.length,
      rows: approved.map((r) => r.data),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chief-import-${view.result.collection}-approved.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const approvedCount =
    view.state === 'result'
      ? Object.values(view.review).filter((v) => v === 'approved').length
      : 0;

  return (
    <div>
      {/* Upload form */}
      <div className="chief-list-card">
        <h3>Upload file</h3>
        <p className="chief-table-note" style={{ marginBottom: '1rem' }}>
          Accepts CSV or XLSX. First row must be headers. Max 2 MB.
        </p>
        <div className="chief-filter-grid" style={{ marginBottom: '1rem' }}>
          <label className="chief-field-stack">
            <span>Collection</span>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value as CollectionKey)}
            >
              {COLLECTIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="chief-field-stack">
            <span>File</span>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" />
          </label>
        </div>
        <div className="chief-action-row">
          <button
            className="btn-primary"
            disabled={view.state === 'parsing'}
            onClick={handleUpload}
          >
            {view.state === 'parsing' ? 'Parsing…' : 'Parse & Review'}
          </button>
          {view.state === 'result' && (
            <button className="btn-secondary" onClick={() => setView({ state: 'idle' })}>
              Reset
            </button>
          )}
        </div>
      </div>

      {view.state === 'error' && (
        <div className="chief-empty-state" style={{ marginTop: '1rem' }}>
          <h3>Parse failed</h3>
          <p>{view.message}</p>
        </div>
      )}

      {view.state === 'result' && (
        <>
          {/* Summary bar */}
          <div className="chief-stats chief-stats-compact" style={{ marginTop: '1.5rem' }}>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Total Rows</p>
              <p className="chief-stat-value">{view.result.totalRows}</p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Pass</p>
              <p className="chief-stat-value" style={{ color: '#16a34a' }}>{view.result.passCount}</p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Issues</p>
              <p className="chief-stat-value" style={{ color: view.result.warnCount > 0 ? '#d97706' : undefined }}>
                {view.result.warnCount}
              </p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Approved</p>
              <p className="chief-stat-value" style={{ color: '#16a34a' }}>{approvedCount}</p>
            </article>
          </div>

          {/* Missing headers warning */}
          {view.result.missingHeaders.length > 0 && (
            <div className="chief-info-banner" style={{ marginTop: '1rem' }}>
              <strong>Missing required headers:</strong>{' '}
              {view.result.missingHeaders.join(', ')}
            </div>
          )}

          {/* Row controls */}
          <div className="chief-action-row" style={{ marginTop: '1rem' }}>
            <button className="btn-primary" disabled={approvedCount === 0} onClick={downloadApproved}>
              Download Approved ({approvedCount})
            </button>
            <button className="btn-secondary" onClick={approveAll}>Approve All</button>
            <button className="btn-secondary" onClick={rejectAll}>Reject All</button>
          </div>

          {/* Row table */}
          <div className="chief-table-wrap" style={{ marginTop: '1rem' }}>
            <table className="chief-table">
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }}>#</th>
                  <th style={{ width: '6rem' }}>Status</th>
                  {view.result.expectedHeaders.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {view.result.rows.map((row) => {
                  const decision = view.review[row.rowIndex] ?? 'rejected';
                  const hasIssues = row.issues.length > 0;
                  return (
                    <tr
                      key={row.rowIndex}
                      style={{
                        background: decision === 'approved' ? '#f0fdf4' : '#fef2f2',
                        opacity: decision === 'rejected' ? 0.7 : 1,
                      }}
                    >
                      <td className="chief-table-note">{row.rowIndex}</td>
                      <td>
                        <button
                          onClick={() => toggleRow(row.rowIndex)}
                          style={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid',
                            background: 'transparent',
                            color: decision === 'approved' ? '#16a34a' : '#dc2626',
                            borderColor: decision === 'approved' ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {decision === 'approved' ? 'Approved' : 'Rejected'}
                        </button>
                      </td>
                      {view.result.expectedHeaders.map((h) => (
                        <td key={h} className={!row.data[h] ? 'chief-table-note' : undefined}>
                          {row.data[h] || '—'}
                        </td>
                      ))}
                      <td>
                        {hasIssues ? (
                          <ul style={{ margin: 0, paddingLeft: '1rem', color: '#d97706', fontSize: '0.78rem' }}>
                            {row.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                          </ul>
                        ) : (
                          <span style={{ color: '#16a34a', fontSize: '0.78rem' }}>OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
