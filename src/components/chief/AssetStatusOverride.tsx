'use client';

import { useState, useEffect } from 'react';
import {
  clearAssetStatusOverride,
  readAssetStatusOverride,
  writeAssetStatusOverride,
} from '@/lib/chief-ui-state';

interface Props {
  assetId: string;
  initialStatus: string;
  statuses: string[];
}

export default function AssetStatusOverride({ assetId, initialStatus, statuses }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [overridden, setOverridden] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialStatus);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readAssetStatusOverride(assetId);
    if (stored) {
      setStatus(stored);
      setDraft(stored);
      setOverridden(true);
    }
  }, [assetId]);

  function handleSave() {
    setStatus(draft);
    setOverridden(draft !== initialStatus);
    setEditing(false);
    if (draft !== initialStatus) {
      writeAssetStatusOverride(assetId, draft);
    } else {
      clearAssetStatusOverride(assetId);
    }
  }

  function handleReset() {
    setStatus(initialStatus);
    setDraft(initialStatus);
    setOverridden(false);
    setEditing(false);
    clearAssetStatusOverride(assetId);
  }

  if (!mounted) {
    return <dd>{initialStatus}</dd>;
  }

  if (editing) {
    return (
      <dd style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ fontSize: '0.88rem', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid var(--border)' }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="chief-icon-btn" onClick={handleSave} type="button">Save</button>
        <button className="chief-icon-btn" onClick={() => setEditing(false)} type="button">Cancel</button>
      </dd>
    );
  }

  return (
    <dd style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <span className={`chief-pill chief-pill-${status.replace(/[^a-z0-9]+/g, '-').toLowerCase()}`}>
        {status}
      </span>
      {overridden && (
        <span className="chief-table-note" style={{ color: 'var(--teal)' }}>
          (overridden this session)
        </span>
      )}
      <button className="chief-icon-btn" onClick={() => setEditing(true)} type="button">
        Change
      </button>
      {overridden && (
        <button className="chief-icon-btn" onClick={handleReset} type="button">
          Reset
        </button>
      )}
    </dd>
  );
}
