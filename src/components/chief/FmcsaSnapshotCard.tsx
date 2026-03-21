'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { readFmcsaSnapshot } from '@/lib/chief-ui-state';

export default function FmcsaSnapshotCard() {
  const [snapshot, setSnapshot] = useState<ReturnType<typeof readFmcsaSnapshot>>(null);

  useEffect(() => {
    setSnapshot(readFmcsaSnapshot());
  }, []);

  if (!snapshot) {
    return (
      <div className="chief-list-card">
        <h3>FMCSA — Last Carrier Lookup</h3>
        <p className="chief-table-note">
          No lookup yet this session.{' '}
          <Link href="/chief/fmcsa" className="chief-inline-link">
            Run a lookup
          </Link>{' '}
          to see carrier status here.
        </p>
      </div>
    );
  }

  const { carrier, savedAt } = snapshot;
  const statusColor = carrier.outOfService
    ? '#dc2626'
    : carrier.allowedToOperate
    ? '#16a34a'
    : '#d97706';

  const ratingLabel =
    carrier.safetyRatingFullLabel && carrier.safetyRatingFullLabel !== 'Not Rated'
      ? carrier.safetyRatingFullLabel
      : 'Not Rated';

  return (
    <div className="chief-list-card">
      <div className="chief-note-header">
        <h3>FMCSA — Last Carrier Lookup</h3>
        <Link href="/chief/fmcsa" className="chief-icon-btn" style={{ textDecoration: 'none' }}>
          Refresh
        </Link>
      </div>
      <dl className="chief-kv-list" style={{ marginTop: '0.5rem' }}>
        <div>
          <dt>Carrier</dt>
          <dd><strong>{carrier.legalName || `DOT ${carrier.dotNumber}`}</strong></dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd style={{ color: statusColor, fontWeight: 700 }}>
            {carrier.outOfService ? 'Out of Service' : carrier.allowedToOperate ? 'Authorized to Operate' : 'Not Authorized'}
          </dd>
        </div>
        <div>
          <dt>Safety Rating</dt>
          <dd>{ratingLabel}</dd>
        </div>
        <div>
          <dt>DOT</dt>
          <dd>{carrier.dotNumber}</dd>
        </div>
        <div>
          <dt>Looked Up</dt>
          <dd className="chief-table-note">{new Date(savedAt).toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}
