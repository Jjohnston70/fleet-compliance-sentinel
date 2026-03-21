'use client';

import { useState, useRef } from 'react';
import { IMPORT_SCHEMAS, type CollectionKey } from '@/lib/chief-import-schemas';

interface ParsedRow {
  rowIndex: number;
  data: Record<string, string>;
  issues: string[];
}

interface SheetResult {
  collection: string;
  collectionLabel: string;
  sheetName: string;
  headers: string[];
  expectedHeaders: string[];
  missingHeaders: string[];
  totalRows: number;
  passCount: number;
  warnCount: number;
  rows: ParsedRow[];
}

interface MultiSheetResult {
  mode: 'multi-sheet';
  sheetsFound: number;
  sheetsParsed: number;
  skippedSheets: string[];
  unmatchedSheets: string[];
  totalRows: number;
  totalPass: number;
  totalWarn: number;
  sheets: SheetResult[];
}

type ReviewMap = Record<number, 'approved' | 'rejected'>;
type SheetReviewMap = Record<string, ReviewMap>;

interface SavedSummary {
  totalInserted: number;
  batchId: string;
  orgId: string;
  collections: { collection: string; inserted: number; replaced: boolean }[];
}

type ViewState =
  | { state: 'idle' }
  | { state: 'parsing' }
  | { state: 'saving' }
  | { state: 'result'; result: MultiSheetResult; reviews: SheetReviewMap; activeTab: string }
  | { state: 'saved'; summary: SavedSummary }
  | { state: 'error'; message: string };

const COLLECTIONS = Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => ({
  key: key as CollectionKey,
  label: schema.label,
}));

export default function ImportReviewer({ orgId }: { orgId?: string }) {
  const [mode, setMode] = useState<'multi' | 'single'>('multi');
  const [collection, setCollection] = useState<CollectionKey>('drivers');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [view, setView] = useState<ViewState>({ state: 'idle' });
  const [rollbackState, setRollbackState] = useState<
    { state: 'idle' }
    | { state: 'running' }
    | { state: 'done'; rolledBack: number; batchId: string }
    | { state: 'error'; message: string }
  >({ state: 'idle' });
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setView({ state: 'parsing' });

    const formData = new FormData();
    formData.append('file', file);
    if (mode === 'single') {
      formData.append('collection', collection);
    }

    try {
      const res = await fetch('/api/chief/import/parse', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      let multiResult: MultiSheetResult;

      if (data.mode === 'multi-sheet') {
        multiResult = data as MultiSheetResult;
      } else {
        // Single-sheet response — wrap into multi-sheet shape
        const sheet = data as SheetResult;
        multiResult = {
          mode: 'multi-sheet',
          sheetsFound: 1,
          sheetsParsed: 1,
          skippedSheets: [],
          unmatchedSheets: [],
          totalRows: sheet.totalRows,
          totalPass: sheet.passCount,
          totalWarn: sheet.warnCount,
          sheets: [sheet],
        };
      }

      // Build default reviews: approve clean rows, reject rows with issues
      const reviews: SheetReviewMap = {};
      for (const sheet of multiResult.sheets) {
        const review: ReviewMap = {};
        for (const row of sheet.rows) {
          review[row.rowIndex] = row.issues.length === 0 ? 'approved' : 'rejected';
        }
        reviews[sheet.collection] = review;
      }

      const activeTab = multiResult.sheets[0]?.collection ?? '';
      setRollbackState({ state: 'idle' });
      setView({ state: 'result', result: multiResult, reviews, activeTab });
    } catch (err: unknown) {
      setView({ state: 'error', message: String(err) });
    }
  }

  function toggleRow(collectionKey: string, rowIndex: number) {
    if (view.state !== 'result') return;
    const sheetReview = view.reviews[collectionKey] ?? {};
    const current = sheetReview[rowIndex] ?? 'rejected';
    setView({
      ...view,
      reviews: {
        ...view.reviews,
        [collectionKey]: {
          ...sheetReview,
          [rowIndex]: current === 'approved' ? 'rejected' : 'approved',
        },
      },
    });
  }

  function approveAllSheet(collectionKey: string) {
    if (view.state !== 'result') return;
    const sheet = view.result.sheets.find((s) => s.collection === collectionKey);
    if (!sheet) return;
    const review: ReviewMap = {};
    for (const row of sheet.rows) review[row.rowIndex] = 'approved';
    setView({ ...view, reviews: { ...view.reviews, [collectionKey]: review } });
  }

  function rejectAllSheet(collectionKey: string) {
    if (view.state !== 'result') return;
    const sheet = view.result.sheets.find((s) => s.collection === collectionKey);
    if (!sheet) return;
    const review: ReviewMap = {};
    for (const row of sheet.rows) review[row.rowIndex] = 'rejected';
    setView({ ...view, reviews: { ...view.reviews, [collectionKey]: review } });
  }

  function getSheetApprovedCount(collectionKey: string): number {
    if (view.state !== 'result') return 0;
    const review = view.reviews[collectionKey] ?? {};
    return Object.values(review).filter((v) => v === 'approved').length;
  }

  function getTotalApprovedCount(): number {
    if (view.state !== 'result') return 0;
    return view.result.sheets.reduce((sum, s) => sum + getSheetApprovedCount(s.collection), 0);
  }

  async function saveToDatabase() {
    if (view.state !== 'result') return;

    const collections = view.result.sheets
      .map((sheet) => {
        const review = view.reviews[sheet.collection] ?? {};
        const approvedRows = sheet.rows
          .filter((r) => review[r.rowIndex] === 'approved')
          .map((r) => r.data);
        return { collection: sheet.collection, rows: approvedRows, replace: replaceExisting };
      })
      .filter((c) => c.rows.length > 0);

    if (collections.length === 0) return;

    setView({ ...view, state: 'saving' } as ViewState);

    try {
      const res = await fetch('/api/chief/import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && Array.isArray(data.fieldErrors)) {
          const details = data.fieldErrors
            .slice(0, 12)
            .map((entry: { collection: string; rowIndex: number; errors: string[] }) =>
              `${entry.collection} row ${entry.rowIndex}: ${entry.errors.join('; ')}`
            );
          const suffix = data.fieldErrors.length > 12
            ? `\n...and ${data.fieldErrors.length - 12} more validation issue(s).`
            : '';
          throw new Error(`Validation failed:\n${details.join('\n')}${suffix}`);
        }
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setRollbackState({ state: 'idle' });
      setView({
        state: 'saved',
        summary: {
          totalInserted: data.totalInserted,
          orgId: data.orgId ?? orgId ?? 'unknown',
          batchId: data.batch_id ?? data.batchId,
          collections: data.collections,
        },
      });
    } catch (err: unknown) {
      setView({ state: 'error', message: `Save failed: ${String(err)}` });
    }
  }

  async function rollbackImport(batchId: string) {
    setRollbackState({ state: 'running' });
    try {
      const res = await fetch('/api/chief/import/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRollbackState({
        state: 'done',
        rolledBack: data.rolledBack,
        batchId: data.batchId,
      });
    } catch (err: unknown) {
      setRollbackState({ state: 'error', message: String(err) });
    }
  }

  function downloadApproved() {
    if (view.state !== 'result') return;
    const allApproved: Record<string, Record<string, string>[]> = {};
    for (const sheet of view.result.sheets) {
      const review = view.reviews[sheet.collection] ?? {};
      const rows = sheet.rows
        .filter((r) => review[r.rowIndex] === 'approved')
        .map((r) => r.data);
      if (rows.length > 0) allApproved[sheet.collection] = rows;
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      collections: allApproved,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chief-import-approved.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalApproved = getTotalApprovedCount();

  return (
    <div>
      {/* Upload form */}
      <div className="chief-list-card">
        <h3>Upload file</h3>
        <p className="chief-table-note" style={{ marginBottom: '1rem' }}>
          Upload the bulk XLSX template with all sheets, or a single CSV/XLSX for one collection. Max 5 MB.
        </p>
        <p className="chief-table-note" style={{ marginBottom: '0.75rem' }}>
          Active Clerk org: <code>{orgId ?? 'unknown'}</code>
        </p>
        <div className="chief-filter-grid" style={{ marginBottom: '1rem' }}>
          <label className="chief-field-stack">
            <span>Mode</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as 'multi' | 'single')}>
              <option value="multi">All Sheets (recommended)</option>
              <option value="single">Single Collection</option>
            </select>
          </label>
          {mode === 'single' && (
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
          )}
          <label className="chief-field-stack">
            <span>File</span>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" />
          </label>
        </div>
        <label className="chief-table-note" style={{ display: 'block', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            style={{ marginRight: '0.4rem' }}
          />
          Replace existing rows in this org for imported collections (soft delete existing rows before insert)
        </label>
        <div className="chief-action-row">
          <button
            className="btn-primary"
            disabled={view.state === 'parsing' || view.state === 'saving'}
            onClick={handleUpload}
          >
            {view.state === 'parsing' ? 'Parsing…' : 'Parse & Review'}
          </button>
          {(view.state === 'result' || view.state === 'saved') && (
            <button
              className="btn-secondary"
              onClick={() => {
                setRollbackState({ state: 'idle' });
                setView({ state: 'idle' });
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {view.state === 'error' && (
        <div className="chief-empty-state" style={{ marginTop: '1rem' }}>
          <h3>Error</h3>
          <p>{view.message}</p>
          <button className="btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setView({ state: 'idle' })}>
            Try Again
          </button>
        </div>
      )}

      {view.state === 'saved' && (
        <div className="chief-list-card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #16a34a' }}>
          <h3 style={{ color: '#16a34a' }}>Saved to Database</h3>
          <p style={{ marginBottom: '0.75rem' }}>
            {view.summary.totalInserted} total rows saved across {view.summary.collections.length} collection(s).
          </p>
          <p className="chief-table-note" style={{ marginBottom: '0.75rem' }}>
            Import batch ID: <code>{view.summary.batchId}</code>
          </p>
          <p className="chief-table-note" style={{ marginBottom: '0.75rem' }}>
            Saved for org: <code>{view.summary.orgId}</code>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            {view.summary.collections.map((c) => (
              <li key={c.collection}>
                <strong>{IMPORT_SCHEMAS[c.collection as CollectionKey]?.label ?? c.collection}</strong>: {c.inserted} rows
                {c.replaced ? ' (replaced prior rows)' : ' (appended)'}
              </li>
            ))}
          </ul>
          <div className="chief-action-row" style={{ marginTop: '1rem' }}>
            <button
              className="btn-secondary"
              disabled={rollbackState.state === 'running'}
              onClick={() => rollbackImport(view.summary.batchId)}
            >
              {rollbackState.state === 'running' ? 'Rolling back…' : 'Rollback this import'}
            </button>
          </div>
          {rollbackState.state === 'done' && rollbackState.batchId === view.summary.batchId && (
            <p style={{ marginTop: '0.75rem', color: '#16a34a', fontSize: '0.875rem' }}>
              Rolled back {rollbackState.rolledBack} record(s) for batch <code>{rollbackState.batchId}</code>.
            </p>
          )}
          {rollbackState.state === 'error' && (
            <p style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {rollbackState.message}
            </p>
          )}
        </div>
      )}

      {view.state === 'result' && (
        <>
          {/* Global summary */}
          <div className="chief-stats chief-stats-compact" style={{ marginTop: '1.5rem' }}>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Sheets Parsed</p>
              <p className="chief-stat-value">{view.result.sheetsParsed}</p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Total Rows</p>
              <p className="chief-stat-value">{view.result.totalRows}</p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Pass</p>
              <p className="chief-stat-value" style={{ color: '#16a34a' }}>{view.result.totalPass}</p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Issues</p>
              <p className="chief-stat-value" style={{ color: view.result.totalWarn > 0 ? '#d97706' : undefined }}>
                {view.result.totalWarn}
              </p>
            </article>
            <article className="chief-stat-card">
              <p className="chief-stat-label">Approved</p>
              <p className="chief-stat-value" style={{ color: '#16a34a' }}>{totalApproved}</p>
            </article>
          </div>

          {/* Unmatched sheets warning */}
          {view.result.unmatchedSheets.length > 0 && (
            <div className="chief-info-banner" style={{ marginTop: '1rem' }}>
              <strong>Unrecognized sheets (skipped):</strong>{' '}
              {view.result.unmatchedSheets.join(', ')}
            </div>
          )}

          {/* Save / Download actions */}
          <div className="chief-action-row" style={{ marginTop: '1rem' }}>
            <button
              className="btn-primary"
              disabled={totalApproved === 0 || view.state !== 'result'}
              onClick={saveToDatabase}
            >
              Save to Database ({totalApproved} rows)
            </button>
            <button
              className="btn-secondary"
              disabled={totalApproved === 0}
              onClick={downloadApproved}
            >
              Download JSON
            </button>
          </div>

          {/* Sheet tabs */}
          <div style={{ display: 'flex', gap: '0', marginTop: '1.5rem', borderBottom: '2px solid #e5e7eb', overflowX: 'auto' }}>
            {view.result.sheets.map((sheet) => {
              const isActive = view.activeTab === sheet.collection;
              const approved = getSheetApprovedCount(sheet.collection);
              return (
                <button
                  key={sheet.collection}
                  onClick={() => setView({ ...view, activeTab: sheet.collection })}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    color: isActive ? '#1d4ed8' : '#374151',
                    marginBottom: '-2px',
                  }}
                >
                  {sheet.collectionLabel}
                  <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.7 }}>
                    {approved}/{sheet.totalRows}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active sheet content */}
          {view.result.sheets
            .filter((s) => s.collection === view.activeTab)
            .map((sheet) => {
              const sheetApproved = getSheetApprovedCount(sheet.collection);
              return (
                <div key={sheet.collection}>
                  {/* Sheet-level missing headers */}
                  {sheet.missingHeaders.length > 0 && (
                    <div className="chief-info-banner" style={{ marginTop: '0.75rem' }}>
                      <strong>Missing required headers:</strong>{' '}
                      {sheet.missingHeaders.join(', ')}
                    </div>
                  )}

                  {/* Sheet-level controls */}
                  <div className="chief-action-row" style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {sheetApproved} of {sheet.totalRows} approved
                    </span>
                    <button className="btn-secondary" onClick={() => approveAllSheet(sheet.collection)}>
                      Approve All
                    </button>
                    <button className="btn-secondary" onClick={() => rejectAllSheet(sheet.collection)}>
                      Reject All
                    </button>
                  </div>

                  {sheet.totalRows === 0 ? (
                    <div className="chief-empty-state" style={{ marginTop: '0.75rem' }}>
                      <p>This sheet has no data rows.</p>
                    </div>
                  ) : (
                    <div className="chief-table-wrap" style={{ marginTop: '0.75rem' }}>
                      <table className="chief-table">
                        <thead>
                          <tr>
                            <th style={{ width: '2.5rem' }}>#</th>
                            <th style={{ width: '6rem' }}>Status</th>
                            {sheet.expectedHeaders.map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                            <th>Issues</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sheet.rows.map((row) => {
                            const review = view.reviews[sheet.collection] ?? {};
                            const decision = review[row.rowIndex] ?? 'rejected';
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
                                    onClick={() => toggleRow(sheet.collection, row.rowIndex)}
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
                                {sheet.expectedHeaders.map((h) => (
                                  <td key={h} className={!row.data[h] ? 'chief-table-note' : undefined}>
                                    {row.data[h] || '\u2014'}
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
                  )}
                </div>
              );
            })}
        </>
      )}

      {view.state === 'saving' && (
        <div className="chief-empty-state" style={{ marginTop: '1.5rem' }}>
          <h3>Saving to database…</h3>
          <p>Writing approved rows. This may take a moment.</p>
        </div>
      )}
    </div>
  );
}
