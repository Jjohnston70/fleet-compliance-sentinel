'use client';

import { useState, useEffect } from 'react';
import {
  readSuspenseResolution,
  writeSuspenseResolution,
} from '@/lib/fleet-compliance-ui-state';

interface Props {
  suspenseItemId: string;
  initialStatus: string;
}

export default function SuspenseResolveButton({ suspenseItemId, initialStatus }: Props) {
  const [resolved, setResolved] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [draft, setDraft] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readSuspenseResolution(suspenseItemId);
    if (stored) {
      setResolved(stored.resolved);
      setNote(stored.note);
    }
  }, [suspenseItemId]);

  function persist(nextResolved: boolean, nextNote: string) {
    writeSuspenseResolution(suspenseItemId, {
      resolved: nextResolved,
      note: nextNote,
      resolvedAt: new Date().toISOString(),
    });
  }

  function handleResolve() {
    setShowNoteInput(true);
    setDraft('');
  }

  function handleConfirmResolve() {
    setResolved(true);
    setNote(draft);
    setShowNoteInput(false);
    persist(true, draft);
  }

  function handleReopen() {
    setResolved(false);
    setNote('');
    persist(false, '');
  }

  if (!mounted) return null;

  if (resolved) {
    return (
      <div className="fleet-compliance-resolve-panel fleet-compliance-resolve-panel--resolved">
        <div className="fleet-compliance-resolve-status">
          <span className="fleet-compliance-resolved-badge">Resolved this session</span>
          {note && <p className="fleet-compliance-resolve-note">&ldquo;{note}&rdquo;</p>}
        </div>
        <button className="btn-secondary" onClick={handleReopen} type="button">
          Reopen
        </button>
      </div>
    );
  }

  if (showNoteInput) {
    return (
      <div className="fleet-compliance-resolve-panel">
        <label className="fleet-compliance-field-stack" style={{ flex: 1 }}>
          <span>Resolution note (optional)</span>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Renewed and filed 2026-03-18"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmResolve()}
          />
        </label>
        <div className="fleet-compliance-action-row">
          <button className="btn-primary" onClick={handleConfirmResolve} type="button">
            Confirm Resolved
          </button>
          <button className="btn-secondary" onClick={() => setShowNoteInput(false)} type="button">
            Cancel
          </button>
        </div>
        <p className="fleet-compliance-table-note" style={{ marginTop: '0.5rem' }}>
          Status: <strong>{initialStatus}</strong> — this override is temporary and clears on page refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="fleet-compliance-resolve-panel">
      <button className="btn-primary" onClick={handleResolve} type="button">
        Mark Resolved
      </button>
      <p className="fleet-compliance-table-note">
        Status: <strong>{initialStatus}</strong>
      </p>
    </div>
  );
}
