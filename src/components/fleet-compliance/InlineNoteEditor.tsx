'use client';

import { useState, useEffect, useRef } from 'react';
import { clearInlineNote, readInlineNote, writeInlineNote } from '@/lib/fleet-compliance-ui-state';

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
  const draftTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = readInlineNote(storageKey);
    if (stored !== null) {
      setNote(stored);
      setSavedThisSession(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!editing) return;
    draftTextareaRef.current?.focus();
  }, [editing]);

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
      <article className="fleet-compliance-list-card">
        <h3>{label}</h3>
        <p>{initialNote}</p>
      </article>
    );
  }

  return (
    <article className="fleet-compliance-list-card">
      <div className="fleet-compliance-note-header">
        <h3>{label}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {savedThisSession && (
            <span className="fleet-compliance-table-note" style={{ color: 'var(--teal)' }}>Edited this session</span>
          )}
          {!editing && (
            <button className="fleet-compliance-icon-btn" onClick={handleEdit} type="button">
              Edit
            </button>
          )}
          {savedThisSession && !editing && (
            <button className="fleet-compliance-icon-btn" onClick={handleClear} type="button">
              Reset
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="fleet-compliance-note-edit">
          <textarea
            ref={draftTextareaRef}
            className="fleet-compliance-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
          />
          <div className="fleet-compliance-action-row" style={{ marginTop: '0.5rem' }}>
            <button className="btn-primary" onClick={handleSave} type="button">
              Save
            </button>
            <button className="btn-secondary" onClick={handleCancel} type="button">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p>{note || <span className="fleet-compliance-table-note">No note.</span>}</p>
      )}
    </article>
  );
}
