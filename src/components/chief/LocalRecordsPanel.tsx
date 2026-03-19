'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { listRecords, deleteRecord, updateRecord, type StoreKey } from '@/lib/chief-local-store';

interface Column {
  key: string;
  label: string;
}

interface Props {
  storeKey: StoreKey;
  title: string;
  columns: Column[];
  addHref: string;
  editHref?: (id: string) => string;
  /** Field used as a status field — renders colored text */
  statusField?: string;
  /** For employees / assets: show archive/retire button instead of delete */
  archiveField?: string;
  archiveValue?: string;
}

export default function LocalRecordsPanel({
  storeKey,
  title,
  columns,
  addHref,
  editHref,
  statusField,
  archiveField,
  archiveValue = 'archived',
}: Props) {
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRecords(listRecords(storeKey) as Record<string, string>[]);
    setMounted(true);
  }, [storeKey]);

  function handleDelete(id: string) {
    if (!confirm('Remove this local record?')) return;
    deleteRecord(storeKey, id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function handleArchive(id: string) {
    updateRecord(storeKey, id, { [archiveField!]: archiveValue } as Record<string, string>);
    setRecords(listRecords(storeKey) as Record<string, string>[]);
  }

  function downloadAll() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chief-${storeKey.split(':').pop()}-local.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function statusColor(val: string) {
    if (['active', 'paid', 'open', 'clear'].includes(val)) return '#16a34a';
    if (['archived', 'retired', 'inactive', 'overdue'].includes(val)) return '#dc2626';
    if (['maintenance-hold', 'pending', 'expiring-soon'].includes(val)) return '#d97706';
    return undefined;
  }

  if (!mounted) return null;

  return (
    <div className="chief-list-card" style={{ marginBottom: '1.5rem' }}>
      <div className="chief-note-header">
        <h3>
          {title}
          <span className="chief-local-badge">local — not synced</span>
        </h3>
        <div className="chief-action-row" style={{ gap: '0.5rem' }}>
          {records.length > 0 && (
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={downloadAll}>
              Export JSON
            </button>
          )}
          <Link href={addHref} className="btn-primary" style={{ fontSize: '0.85rem', padding: '5px 14px' }}>
            + Add New
          </Link>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="chief-table-note" style={{ marginTop: '0.75rem' }}>
          No local records yet.{' '}
          <Link href={addHref} className="chief-inline-link">Add one</Link> to get started.
        </p>
      ) : (
        <div className="chief-table-wrap" style={{ marginTop: '0.875rem' }}>
          <table className="chief-table">
            <thead>
              <tr>
                {columns.map((col) => <th key={col.key}>{col.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={
                        col.key === statusField
                          ? { color: statusColor(row[col.key]), fontWeight: 600 }
                          : undefined
                      }
                    >
                      {row[col.key] || <span className="chief-table-note">—</span>}
                    </td>
                  ))}
                  <td>
                    <div className="chief-action-row" style={{ gap: '0.4rem' }}>
                      {editHref && (
                        <Link
                          href={editHref(row.id)}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        >
                          Edit
                        </Link>
                      )}
                      {archiveField && row[archiveField] !== archiveValue && (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '2px 8px', color: '#d97706', borderColor: '#d97706' }}
                          onClick={() => handleArchive(row.id)}
                        >
                          {archiveValue === 'archived' ? 'Archive' : 'Retire'}
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '2px 8px', color: '#dc2626', borderColor: '#dc2626' }}
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
