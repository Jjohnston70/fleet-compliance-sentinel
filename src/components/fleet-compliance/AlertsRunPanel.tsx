'use client';

import { useState } from 'react';
import type { FleetComplianceAlertRunSummary } from '@/lib/fleet-compliance-alert-engine';

type RunState =
  | { state: 'idle' }
  | { state: 'running' }
  | { state: 'done'; summary: FleetComplianceAlertRunSummary }
  | { state: 'error'; message: string };

export default function AlertsRunPanel({ resendConfigured }: { resendConfigured: boolean }) {
  const [run, setRun] = useState<RunState>({ state: 'idle' });

  async function trigger(dryRun: boolean) {
    setRun({ state: 'running' });
    try {
      const res = await fetch('/api/fleet-compliance/alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRun({ state: 'done', summary: data as FleetComplianceAlertRunSummary });
    } catch (err: unknown) {
      setRun({ state: 'error', message: String(err) });
    }
  }

  return (
    <div className="fleet-compliance-list-card" style={{ marginTop: '1.5rem' }}>
      <h3>Run Alert Sweep</h3>
      <p className="fleet-compliance-table-note" style={{ marginBottom: '1rem' }}>
        Dry run evaluates all open suspense items and shows what emails would be sent without
        actually sending anything. Live run requires the email delivery provider to be configured.
      </p>
      <div className="fleet-compliance-action-row">
        <button
          className="btn-primary"
          disabled={run.state === 'running'}
          onClick={() => trigger(true)}
        >
          {run.state === 'running' ? 'Running…' : 'Dry Run'}
        </button>
        {resendConfigured && (
          <button
            className="btn-secondary"
            disabled={run.state === 'running'}
            onClick={() => trigger(false)}
          >
            Send Emails
          </button>
        )}
      </div>

      {run.state === 'done' && (
        <div style={{ marginTop: '1.25rem' }}>
          <p className="fleet-compliance-eyebrow" style={{ marginBottom: '0.5rem' }}>
            {run.summary.dryRun ? 'Dry run complete' : 'Sweep complete'}
          </p>
          <dl className="fleet-compliance-kv-list">
            <div><dt>Items evaluated</dt><dd>{run.summary.itemsEvaluated}</dd></div>
            <div><dt>Items queued</dt><dd>{run.summary.itemsQueued}</dd></div>
            <div>
              <dt>Emails sent</dt>
              <dd>{run.summary.dryRun ? <span className="fleet-compliance-table-note">dry run — none sent</span> : run.summary.emailsSent}</dd>
            </div>
            {run.summary.emailsFailed > 0 && (
              <div><dt>Failed</dt><dd style={{ color: '#dc2626' }}>{run.summary.emailsFailed}</dd></div>
            )}
            <div><dt>Overdue</dt><dd>{run.summary.byWindow.overdue}</dd></div>
            <div><dt>Due today</dt><dd>{run.summary.byWindow['due-today']}</dd></div>
            <div><dt>Due 7d</dt><dd>{run.summary.byWindow['7d']}</dd></div>
            <div><dt>Due 14d</dt><dd>{run.summary.byWindow['14d']}</dd></div>
            <div><dt>Due 30d</dt><dd>{run.summary.byWindow['30d']}</dd></div>
            <div><dt>Run at</dt><dd className="fleet-compliance-table-note">{new Date(run.summary.runAt).toLocaleString()}</dd></div>
          </dl>
          {run.summary.errors.length > 0 && (
            <ul style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.85rem' }}>
              {run.summary.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {run.state === 'error' && (
        <div className="fleet-compliance-empty-state" style={{ marginTop: '1rem' }}>
          <p style={{ color: '#dc2626' }}>{run.message}</p>
        </div>
      )}
    </div>
  );
}
