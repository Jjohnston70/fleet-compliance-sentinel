'use client';

import { useState, useEffect } from 'react';

const STORAGE_PREFIX = 'chief:suspense:resolved:';

interface Props {
  suspenseItemId: string;
  initialStatus: string;
}

export default function SuspenseResolveButton({ suspenseItemId, initialStatus }: Props) {
  const storageKey = `${STORAGE_PREFIX}${suspenseItemId}`;
  const [resolved, setResolved] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [draft, setDraft] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setResolved(parsed.resolved ?? false);
        setNote(parsed.note ?? '');
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  function persist(nextResolved: boolean, nextNote: string) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ resolved: nextResolved, note: nextNote, resolvedAt: new Date().toISOString() }));
    } catch {
      // ignore
    }
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
      <div className="chief-resolve-panel chief-resolve-panel--resolved">
        <div className="chief-resolve-status">
          <span className="chief-resolved-badge">Resolved this session</span>
          {note && <p className="chief-resolve-note">&ldquo;{note}&rdquo;</p>}
        </div>
        <button className="btn-secondary" onClick={handleReopen} type="button">
          Reopen
        </button>
      </div>
    );
  }

  if (showNoteInput) {
    return (
      <div className="chief-resolve-panel">
        <label className="chief-field-stack" style={{ flex: 1 }}>
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
        <div className="chief-action-row">
          <button className="btn-primary" onClick={handleConfirmResolve} type="button">
            Confirm Resolved
          </button>
          <button className="btn-secondary" onClick={() => setShowNoteInput(false)} type="button">
            Cancel
          </button>
        </div>
        <p className="chief-table-note" style={{ marginTop: '0.5rem' }}>
          Status: <strong>{initialStatus}</strong> — this override is stored in this browser session only.
        </p>
      </div>
    );
  }

  return (
    <div className="chief-resolve-panel">
      <button className="btn-primary" onClick={handleResolve} type="button">
        Mark Resolved
      </button>
      <p className="chief-table-note">
        Status: <strong>{initialStatus}</strong>
      </p>
    </div>
  );
}
