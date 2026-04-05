'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DispatchStatus =
  | 'pending'
  | 'dispatched'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled';
type DriverStatus = 'available' | 'en_route' | 'on_site' | 'off_duty' | 'on_break';
type SLAStatus = 'healthy' | 'warning' | 'critical' | 'breached';

interface DispatchRequestDetail {
  id: string;
  clientName: string;
  clientPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zoneId: string;
  priority: 'emergency' | 'urgent' | 'standard' | 'scheduled';
  issueType: string;
  description: string;
  status: DispatchStatus;
  assignedDriverId: string | null;
  assignedTruckId: string | null;
  estimatedArrival: string | null;
  actualArrival: string | null;
  completedAt: string | null;
  slaDeadline: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface DriverRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  zoneId: string;
  status: DriverStatus;
  jobsToday: number;
  maxJobsPerDay: number;
}

interface DispatchLogRow {
  id: string;
  action: string;
  actor: string;
  timestamp: string | null;
  details: Record<string, unknown> | null;
}

interface DetailPayload {
  ok: boolean;
  request?: DispatchRequestDetail;
  slaStatus?: {
    requestId: string;
    status: SLAStatus;
    timeRemainingMinutes: number;
    percentComplete: number;
  } | null;
  assignedDriver?: DriverRow | null;
  assignedTruck?: {
    id: string;
    name: string;
    type: string;
    status: string;
    zoneId: string;
  } | null;
  availableDrivers?: DriverRow[];
  logs?: DispatchLogRow[];
  error?: string;
}

const dispatchStatusColors: Record<DispatchStatus, string> = {
  pending: '#6b7280',
  dispatched: '#2563eb',
  en_route: '#0f766e',
  on_site: '#7c3aed',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

const slaColors: Record<SLAStatus, string> = {
  healthy: '#16a34a',
  warning: '#ca8a04',
  critical: '#ea580c',
  breached: '#dc2626',
};

function formatDateTime(value: string | null): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString('en-US');
}

export default function DispatchDetailPage() {
  const params = useParams();
  const requestId = String(params.id ?? '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [busyAction, setBusyAction] = useState('');

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fleet-compliance/dispatch/${requestId}`);
      const data = (await response.json().catch(() => ({}))) as DetailPayload;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load dispatch request');
      }
      setDetail(data);
      setSelectedDriverId('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispatch request');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    void loadDetail();
  }, [requestId, loadDetail]);

  const sortedLogs = useMemo(() => {
    if (!detail?.logs) return [];
    return [...detail.logs].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [detail?.logs]);

  async function runAction(action: string, payload: Record<string, unknown> = {}) {
    setBusyAction(action);
    setError('');

    try {
      const response = await fetch(`/api/fleet-compliance/dispatch/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as DetailPayload;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || `Failed action: ${action}`);
      }
      setDetail(data);
      setSelectedDriverId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dispatch update failed');
    } finally {
      setBusyAction('');
    }
  }

  if (loading) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <p style={{ color: 'var(--text-secondary)' }}>Loading dispatch request...</p>
        </section>
      </main>
    );
  }

  const request = detail?.request;
  if (!request) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <p style={{ color: 'var(--text-secondary)' }}>Dispatch request not found.</p>
          <div style={{ marginTop: '0.9rem' }}>
            <Link href="/fleet-compliance/dispatch" className="btn-secondary">
              Back to Dispatch
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const canAssign = request.status !== 'completed' && request.status !== 'cancelled';
  const isAssigned = Boolean(request.assignedDriverId);
  const sla = detail?.slaStatus ?? null;
  const slaColor = sla ? slaColors[sla.status] : '#6b7280';
  const progressValue = sla ? Math.max(0, Math.min(100, sla.percentComplete)) : 0;

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/dispatch">Dispatch</Link>
          <span>/</span>
          <span>{request.id}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Dispatch Request</p>
            <h1>{request.clientName}</h1>
            <p className="fleet-compliance-subcopy">
              {request.issueType.replace('_', ' ')} · {request.address}, {request.city}, {request.state} {request.zip}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                borderRadius: '6px',
                padding: '0.25rem 0.7rem',
                background: `${dispatchStatusColors[request.status]}1A`,
                color: dispatchStatusColors[request.status],
                fontWeight: 700,
                textTransform: 'capitalize',
              }}
            >
              {request.status.replace('_', ' ')}
            </span>
            <Link href="/fleet-compliance/dispatch" className="btn-secondary">
              Back
            </Link>
          </div>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Priority</p>
            <p className="fleet-compliance-stat-value" style={{ textTransform: 'capitalize' }}>
              {request.priority}
            </p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Assigned Driver</p>
            <p className="fleet-compliance-stat-value" style={{ fontSize: '1.1rem' }}>
              {detail?.assignedDriver?.name || 'Unassigned'}
            </p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Created</p>
            <p className="fleet-compliance-stat-value" style={{ fontSize: '1rem' }}>
              {formatDateTime(request.createdAt)}
            </p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">SLA Deadline</p>
            <p className="fleet-compliance-stat-value" style={{ fontSize: '1rem' }}>
              {formatDateTime(request.slaDeadline)}
            </p>
          </article>
        </div>

        <div className="fleet-compliance-list-card" style={{ marginTop: '1.2rem' }}>
          <h3>SLA Status</h3>
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: slaColor, textTransform: 'capitalize' }}>
                {sla?.status || 'unknown'}
              </span>
              <span className="fleet-compliance-table-note">
                {sla ? `${sla.timeRemainingMinutes} min remaining` : '--'}
              </span>
            </div>
            <div
              style={{
                height: '12px',
                borderRadius: '999px',
                background: '#e2e8f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressValue}%`,
                  height: '100%',
                  background: slaColor,
                }}
              />
            </div>
          </div>
        </div>

        <div className="fleet-compliance-action-row" style={{ marginTop: '1rem' }}>
          <select
            value={selectedDriverId}
            onChange={(event) => setSelectedDriverId(event.target.value)}
            disabled={!canAssign || busyAction !== ''}
          >
            <option value="">Select driver...</option>
            {(detail?.availableDrivers || []).map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.jobsToday}/{driver.maxJobsPerDay})
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            type="button"
            disabled={!canAssign || !selectedDriverId || busyAction !== ''}
            onClick={() => void runAction(isAssigned ? 'reassign' : 'assign', { driverId: selectedDriverId })}
          >
            {busyAction === 'assign' || busyAction === 'reassign'
              ? 'Saving...'
              : isAssigned
                ? 'Reassign Driver'
                : 'Assign Driver'}
          </button>
          <button
            className="btn-secondary"
            type="button"
            disabled={!canAssign || busyAction !== ''}
            onClick={() => void runAction('mark_en_route')}
          >
            {busyAction === 'mark_en_route' ? 'Updating...' : 'Mark En Route'}
          </button>
          <button
            className="btn-secondary"
            type="button"
            disabled={!canAssign || busyAction !== ''}
            onClick={() => void runAction('mark_on_site')}
          >
            {busyAction === 'mark_on_site' ? 'Updating...' : 'Mark On Site'}
          </button>
          <button
            className="btn-secondary"
            type="button"
            disabled={!canAssign || busyAction !== ''}
            onClick={() => void runAction('complete')}
          >
            {busyAction === 'complete' ? 'Completing...' : 'Complete'}
          </button>
          <button
            className="btn-secondary"
            type="button"
            disabled={!canAssign || busyAction !== ''}
            onClick={() => void runAction('cancel', { reason: 'Cancelled by dispatcher' })}
          >
            {busyAction === 'cancel' ? 'Cancelling...' : 'Cancel'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1.2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            marginTop: '1.4rem',
          }}
        >
          <div className="fleet-compliance-list-card">
            <h3>Assignment Details</h3>
            {detail?.assignedDriver ? (
              <div style={{ marginTop: '0.6rem', display: 'grid', gap: '0.35rem' }}>
                <div><strong>Driver:</strong> {detail.assignedDriver.name}</div>
                <div><strong>Phone:</strong> {detail.assignedDriver.phone}</div>
                <div><strong>Status:</strong> {detail.assignedDriver.status}</div>
                <div><strong>Jobs Today:</strong> {detail.assignedDriver.jobsToday}/{detail.assignedDriver.maxJobsPerDay}</div>
              </div>
            ) : (
              <p className="fleet-compliance-table-note" style={{ marginTop: '0.6rem' }}>
                No driver assigned.
              </p>
            )}

            {detail?.assignedTruck && (
              <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.35rem' }}>
                <div><strong>Truck:</strong> {detail.assignedTruck.name}</div>
                <div><strong>Type:</strong> {detail.assignedTruck.type}</div>
                <div><strong>Status:</strong> {detail.assignedTruck.status}</div>
              </div>
            )}
          </div>

          <div className="fleet-compliance-list-card">
            <h3>Status Timeline</h3>
            <ul style={{ listStyle: 'none', margin: '0.6rem 0 0', padding: 0 }}>
              {sortedLogs.length === 0 ? (
                <li className="fleet-compliance-table-note">No timeline events yet.</li>
              ) : (
                sortedLogs.map((log) => (
                  <li
                    key={log.id}
                    style={{
                      padding: '0.55rem 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--navy)', textTransform: 'capitalize' }}>
                      {log.action.replace('_', ' ')}
                    </div>
                    <div className="fleet-compliance-table-note">
                      {formatDateTime(log.timestamp)} · {log.actor}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
