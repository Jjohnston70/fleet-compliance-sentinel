'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewDQResponse {
  fileId: string;
  intakeToken: string;
  intakeUrl: string;
}

export default function NewDQFilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    driverName: '',
    driverId: '',
    cdlHolder: false,
    hireDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<NewDQResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.driverName.trim()) {
      setError('Driver Name is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/fleet-compliance/dq/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create DQ file');
      }

      const data: NewDQResponse = await res.json();
      setCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyIntakeLink = () => {
    if (created?.intakeUrl) {
      navigator.clipboard.writeText(created.intakeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (created) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <Link href="/fleet-compliance/dq">DQ Files</Link>
            <span>/</span>
            <span>New</span>
          </div>
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Success</p>
              <h1>DQ File Created</h1>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              The DQ file has been created. Share this intake link with the driver to collect their information.
            </p>

            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                background: '#f8fafc',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Intake Link
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <code
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    overflowX: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {created.intakeUrl}
                </code>
                <button
                  onClick={copyIntakeLink}
                  style={{
                    padding: '0.65rem 1rem',
                    background: copied ? '#10b981' : 'var(--teal)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="fleet-compliance-action-row">
              <Link
                href={`/fleet-compliance/dq/${created.fileId}`}
                className="btn-primary"
              >
                View DQ File
              </Link>
              <Link
                href="/fleet-compliance/dq"
                className="btn-secondary"
              >
                Back to List
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/dq">DQ Files</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">DQ Files</p>
            <h1>Create DQ File</h1>
          </div>
          <Link href="/fleet-compliance/dq" className="btn-secondary">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
          <fieldset className="fleet-compliance-fieldset">
            <legend>Driver Information</legend>
            <div className="fleet-compliance-form-grid">
              <label className="fleet-compliance-field-stack">
                <span>Driver Name *</span>
                <input
                  type="text"
                  required
                  placeholder="John Smith"
                  value={form.driverName}
                  onChange={(e) => handleChange('driverName', e.target.value)}
                />
              </label>
              <label className="fleet-compliance-field-stack">
                <span>Driver ID</span>
                <input
                  type="text"
                  placeholder="DRV-12345"
                  value={form.driverId}
                  onChange={(e) => handleChange('driverId', e.target.value)}
                />
              </label>
              <label className="fleet-compliance-field-stack">
                <span>Hire Date</span>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                />
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.cdlHolder}
                  onChange={(e) => handleChange('cdlHolder', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  CDL Holder
                </span>
              </label>
            </div>
          </fieldset>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating...' : 'Create DQ File'}
            </button>
            <Link href="/fleet-compliance/dq" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
