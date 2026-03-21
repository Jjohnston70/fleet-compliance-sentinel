'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ChiefSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const timestamp = new Date().toISOString();

  useEffect(() => {
    console.error('[ChiefErrorBoundary]', {
      timestamp,
      page: '/chief',
      error: error.message,
      userId: null,
      orgId: null,
    });
  }, [error.message, timestamp]);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-empty-state">
          <h1>Chief page load error</h1>
          <p>{error.message || 'Unexpected error loading this page.'}</p>
          <p className="chief-table-note">Timestamp: {timestamp}</p>
          <div className="chief-action-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-primary" onClick={reset}>
              Retry
            </button>
            <Link href="https://www.truenorthstrategyops.com/contact" className="btn-secondary">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
