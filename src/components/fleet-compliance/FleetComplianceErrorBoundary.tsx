'use client';

import Link from 'next/link';
import React from 'react';

type FleetComplianceErrorBoundaryProps = {
  page: string;
  userId?: string | null;
  orgId?: string | null;
  children: React.ReactNode;
};

type FleetComplianceErrorBoundaryState = {
  hasError: boolean;
  message: string;
  timestamp: string;
};

export default class FleetComplianceErrorBoundary extends React.Component<FleetComplianceErrorBoundaryProps, FleetComplianceErrorBoundaryState> {
  constructor(props: FleetComplianceErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      timestamp: '',
    };
  }

  static getDerivedStateFromError(error: unknown): FleetComplianceErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected error loading this page.',
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const payload = {
      timestamp: new Date().toISOString(),
      page: this.props.page,
      message: errorMessage,
      stack: errorStack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId: this.props.userId ?? null,
      orgId: this.props.orgId ?? null,
    };

    console.error('[FleetComplianceErrorBoundary]', payload);
    void fetch('/api/fleet-compliance/errors/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // ignore network errors
    });
  }

  private retry = () => {
    this.setState({ hasError: false, message: '', timestamp: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-empty-state">
            <h1>Fleet-Compliance page load error</h1>
            <p>{this.state.message || 'Unexpected error loading this page.'}</p>
            <p className="fleet-compliance-table-note">Timestamp: {this.state.timestamp}</p>
            <div className="fleet-compliance-action-row" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn-primary" onClick={this.retry}>
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
}
