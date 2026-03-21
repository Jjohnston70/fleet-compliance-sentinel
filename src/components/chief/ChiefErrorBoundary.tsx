'use client';

import Link from 'next/link';
import React from 'react';

type ChiefErrorBoundaryProps = {
  page: string;
  userId?: string | null;
  orgId?: string | null;
  children: React.ReactNode;
};

type ChiefErrorBoundaryState = {
  hasError: boolean;
  message: string;
  timestamp: string;
};

export default class ChiefErrorBoundary extends React.Component<ChiefErrorBoundaryProps, ChiefErrorBoundaryState> {
  constructor(props: ChiefErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      timestamp: '',
    };
  }

  static getDerivedStateFromError(error: unknown): ChiefErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected error loading this page.',
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: unknown) {
    const payload = {
      timestamp: new Date().toISOString(),
      page: this.props.page,
      error: error instanceof Error ? error.message : String(error),
      userId: this.props.userId ?? null,
      orgId: this.props.orgId ?? null,
    };

    console.error('[ChiefErrorBoundary]', payload);
  }

  private retry = () => {
    this.setState({ hasError: false, message: '', timestamp: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="chief-shell">
        <section className="chief-section">
          <div className="chief-empty-state">
            <h1>Chief page load error</h1>
            <p>{this.state.message || 'Unexpected error loading this page.'}</p>
            <p className="chief-table-note">Timestamp: {this.state.timestamp}</p>
            <div className="chief-action-row" style={{ marginTop: '1rem' }}>
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
