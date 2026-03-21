'use client';

import { useState, useEffect } from 'react';
import { clearInlineNote, readInlineNote, writeInlineNote } from '@/lib/chief-ui-state';

interface Props {
  storageKey: string;
  initialNote: string;
  label?: string;
}

export default function InlineNoteEditor({ storageKey, initialNote, label = 'Note' }: Props) {
  const [note, setNote] = useState(initialNote);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNote);
  const [savedThisSession, setSavedThisSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readInlineNote(storageKey);
    if (stored !== null) {
      setNote(stored);
      setSavedThisSession(true);
    }
  }, [storageKey]);

  function handleEdit() {
    setDraft(note);
    setEditing(true);
  }

  function handleSave() {
    setNote(draft);
    setSavedThisSession(true);
    setEditing(false);
    writeInlineNote(storageKey, draft);
  }

  function handleCancel() {
    setDraft(note);
    setEditing(false);
  }

  function handleClear() {
    setNote(initialNote);
    setSavedThisSession(false);
    setEditing(false);
    clearInlineNote(storageKey);
  }

  if (!mounted) {
    return (
      <article className="chief-list-card">
        <h3>{label}</h3>
        <p>{initialNote}</p>
      </article>
    );
  }

  return (
    <article className="chief-list-card">
      <div className="chief-note-header">
        <h3>{label}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {savedThisSession && (
            <span className="chief-table-note" style={{ color: 'var(--teal)' }}>Edited this session</span>
          )}
          {!editing && (
            <button className="chief-icon-btn" onClick={handleEdit} type="button">
              Edit
            </button>
          )}
          {savedThisSession && !editing && (
            <button className="chief-icon-btn" onClick={handleClear} type="button">
              Reset
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="chief-note-edit">
          <textarea
            className="chief-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="chief-action-row" style={{ marginTop: '0.5rem' }}>
            <button className="btn-primary" onClick={handleSave} type="button">
              Save
            </button>
            <button className="btn-secondary" onClick={handleCancel} type="button">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p>{note || <span className="chief-table-note">No note.</span>}</p>
      )}
    </article>
  );
}
