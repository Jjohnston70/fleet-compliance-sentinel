'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function FleetComplianceTelematicsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const timestamp = new Date().toISOString();

  useEffect(() => {
    console.error('[FleetComplianceErrorBoundary]', {
      timestamp,
      page: '/fleet-compliance/telematics',
      error: error.message,
      userId: null,
      orgId: null,
    });
  }, [error.message, timestamp]);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-empty-state">
          <h1>Fleet-Compliance page load error</h1>
          <p>
            Telematics data could not be loaded. The sync may be running or the Railway backend may be starting up.
            Try refreshing in 30 seconds.
          </p>
          <p className="fleet-compliance-table-note">Timestamp: {timestamp}</p>
          <div className="fleet-compliance-action-row" style={{ marginTop: '1rem' }}>
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
