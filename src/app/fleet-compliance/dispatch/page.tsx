'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type DispatchStatus =
  | 'pending'
  | 'dispatched'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled';
type DriverStatus = 'available' | 'en_route' | 'on_site' | 'off_duty' | 'on_break';

interface DispatchRequestRow {
  id: string;
  clientName: string;
  clientPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zoneId: string;
  priority: 'emergency' | 'urgent' | 'standard' | 'scheduled';
  issueType: 'no_heat' | 'no_ac' | 'leak' | 'electrical' | 'maintenance' | 'inspection';
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
  active: boolean;
}

interface ZoneRow {
  id: string;
  name: string;
  avgResponseTimeMinutes: number;
}

interface MetricsPayload {
  ok: boolean;
  dashboard?: {
    activeRequests: {
      pending: number;
      dispatched: number;
      en_route: number;
      on_site: number;
    };
    driverUtilization: {
      available: number;
      en_route: number;
      on_site: number;
      off_duty: number;
    };
    zoneHeatmap: Array<{
      zoneId: string;
      zoneName: string;
      activeRequestCount: number;
      avgResponseTimeMinutes: number;
    }>;
    completedToday: number;
    cancelledToday: number;
  };
  slaSummary?: {
    healthy: number;
    warning: number;
    critical: number;
    breached: number;
  };
}

const priorityColors: Record<DispatchRequestRow['priority'], string> = {
  emergency: '#dc2626',
  urgent: '#ea580c',
  standard: '#2563eb',
  scheduled: '#0f766e',
};

const statusColors: Record<DispatchStatus, string> = {
  pending: '#6b7280',
  dispatched: '#2563eb',
  en_route: '#0f766e',
  on_site: '#7c3aed',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

const driverStatusColors: Record<DriverStatus, string> = {
  available: '#16a34a',
  en_route: '#0f766e',
  on_site: '#7c3aed',
  off_duty: '#6b7280',
  on_break: '#ca8a04',
};

function formatDateTime(value: string | null): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString('en-US');
}

function formatCountdown(deadlineIso: string | null, nowMs: number): { label: string; color: string } {
  if (!deadlineIso) return { label: '--', color: '#6b7280' };
  const deadline = new Date(deadlineIso);
  if (Number.isNaN(deadline.getTime())) return { label: '--', color: '#6b7280' };

  const diffMs = deadline.getTime() - nowMs;
  if (diffMs <= 0) return { label: 'BREACHED', color: '#dc2626' };

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const label = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;

  if (minutes <= 10) return { label, color: '#dc2626' };
  if (minutes <= 30) return { label, color: '#ea580c' };
  if (minutes <= 90) return { label, color: '#ca8a04' };
  return { label, color: '#16a34a' };
}

function getNextDriverStatus(status: DriverStatus): DriverStatus {
  if (status === 'off_duty') return 'available';
  return 'off_duty';
}

function toMapQuery(request: DispatchRequestRow | null): string {
  if (!request) return 'Colorado Springs, CO';
  return [request.address, request.city, request.state, request.zip]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

export default function DispatchDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<DispatchRequestRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [metrics, setMetrics] = useState<MetricsPayload['dashboard'] | null>(null);
  const [slaSummary, setSlaSummary] = useState<MetricsPayload['slaSummary'] | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [workingRequestId, setWorkingRequestId] = useState('');
  const [workingDriverId, setWorkingDriverId] = useState('');
  const [nowMs, setNowMs] = useState(Date.now());

  async function loadData() {
    setError('');
    try {
      const [dispatchRes, metricsRes] = await Promise.all([
        fetch('/api/fleet-compliance/dispatch'),
        fetch('/api/fleet-compliance/dispatch/metrics'),
      ]);

      const dispatchData = await dispatchRes.json().catch(() => ({}));
      const metricsData = (await metricsRes.json().catch(() => ({}))) as MetricsPayload;

      if (!dispatchRes.ok) {
        throw new Error(dispatchData.error || 'Failed to load dispatch data');
      }
      if (!metricsRes.ok || !metricsData.ok) {
        throw new Error((metricsData as any).error || 'Failed to load dispatch metrics');
      }

      setRequests(Array.isArray(dispatchData.requests) ? dispatchData.requests : []);
      setDrivers(Array.isArray(dispatchData.drivers) ? dispatchData.drivers : []);
      setZones(Array.isArray(dispatchData.zones) ? dispatchData.zones : []);
      setMetrics(metricsData.dashboard ?? null);
      setSlaSummary(metricsData.slaSummary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispatch dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const pollTimer = window.setInterval(() => {
      void loadData();
    }, 15000);
    const clockTimer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(pollTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const activeRequests = useMemo(
    () => requests.filter((request) => request.status !== 'completed' && request.status !== 'cancelled'),
    [requests],
  );

  const driverById = useMemo(
    () => new Map(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );

  const zoneNameById = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.name])),
    [zones],
  );

  const mapQuery = useMemo(() => {
    const priorityRequest = [...activeRequests].sort((a, b) => {
      const priorityOrder: Record<DispatchRequestRow['priority'], number> = {
        emergency: 0,
        urgent: 1,
        standard: 2,
        scheduled: 3,
      };
      const byPriority = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (byPriority !== 0) return byPriority;
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aCreated - bCreated;
    })[0] ?? null;
    return toMapQuery(priorityRequest);
  }, [activeRequests]);

  async function handleAssignDriver(requestId: string) {
    const driverId = assignments[requestId];
    if (!driverId) return;

    setWorkingRequestId(requestId);
    setError('');
    try {
      const response = await fetch(`/api/fleet-compliance/dispatch/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', driverId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to assign driver');
      }
      setAssignments((current) => ({ ...current, [requestId]: '' }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed');
    } finally {
      setWorkingRequestId('');
    }
  }

  async function handleToggleDriverStatus(driver: DriverRow) {
    const nextStatus = getNextDriverStatus(driver.status);
    setWorkingDriverId(driver.id);
    setError('');
    try {
      const response = await fetch('/api/fleet-compliance/dispatch/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          status: nextStatus,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update driver status');
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Driver update failed');
    } finally {
      setWorkingDriverId('');
    }
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Operations</p>
            <h1>Dispatch Dashboard</h1>
            <p className="fleet-compliance-subcopy">
              Monitor active requests, SLA risk, and driver availability across all zones.
            </p>
          </div>
          <Link href="/fleet-compliance/dispatch/new" className="btn-primary">
            New Dispatch Request
          </Link>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading dispatch dashboard...</p>
        ) : (
          <>
            <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Pending</p>
                <p className="fleet-compliance-stat-value">{metrics?.activeRequests.pending ?? 0}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Dispatched</p>
                <p className="fleet-compliance-stat-value">{metrics?.activeRequests.dispatched ?? 0}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">En Route</p>
                <p className="fleet-compliance-stat-value">{metrics?.activeRequests.en_route ?? 0}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">On Site</p>
                <p className="fleet-compliance-stat-value">{metrics?.activeRequests.on_site ?? 0}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">SLA Critical/Breached</p>
                <p className="fleet-compliance-stat-value">
                  {(slaSummary?.critical ?? 0) + (slaSummary?.breached ?? 0)}
                </p>
              </article>
            </div>

            <div className="dispatch-dashboard-grid" style={{ marginTop: '1.25rem' }}>
              <div className="fleet-compliance-list-card dispatch-active-requests-card">
                <h3>Active Requests</h3>
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Client / Issue</th>
                        <th>Zone</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>SLA</th>
                        <th>Driver</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ color: 'var(--text-muted)' }}>
                            No active requests.
                          </td>
                        </tr>
                      ) : (
                        activeRequests.map((request) => {
                          const currentDriver = request.assignedDriverId
                            ? driverById.get(request.assignedDriverId)
                            : null;
                          const countdown = formatCountdown(request.slaDeadline, nowMs);
                          const availableDrivers = drivers.filter(
                            (driver) =>
                              driver.active
                              && driver.status === 'available'
                              && driver.zoneId === request.zoneId,
                          );

                          return (
                            <tr key={request.id}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{request.clientName}</div>
                                <div className="fleet-compliance-table-note">
                                  {request.issueType.replace('_', ' ')} · {request.address}
                                </div>
                              </td>
                              <td>{zoneNameById.get(request.zoneId) || request.zoneId}</td>
                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    borderRadius: '4px',
                                    padding: '0.2rem 0.5rem',
                                    background: `${priorityColors[request.priority]}1A`,
                                    color: priorityColors[request.priority],
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {request.priority}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    borderRadius: '4px',
                                    padding: '0.2rem 0.5rem',
                                    background: `${statusColors[request.status]}1A`,
                                    color: statusColors[request.status],
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {request.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: countdown.color }}>
                                  {countdown.label}
                                </span>
                                <div className="fleet-compliance-table-note">
                                  Due: {formatDateTime(request.slaDeadline)}
                                </div>
                              </td>
                              <td>
                                {currentDriver ? (
                                  <div>
                                    <Link
                                      href={`/fleet-compliance/dispatch/${request.id}`}
                                      style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}
                                    >
                                      {currentDriver.name}
                                    </Link>
                                    <div className="fleet-compliance-table-note">{currentDriver.status}</div>
                                  </div>
                                ) : (
                                  <div className="fleet-compliance-table-note">Unassigned</div>
                                )}
                              </td>
                              <td>
                                {request.status === 'pending' ? (
                                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                                    <select
                                      value={assignments[request.id] || ''}
                                      onChange={(event) =>
                                        setAssignments((current) => ({
                                          ...current,
                                          [request.id]: event.target.value,
                                        }))
                                      }
                                    >
                                      <option value="">Assign driver...</option>
                                      {availableDrivers.map((driver) => (
                                        <option key={driver.id} value={driver.id}>
                                          {driver.name} ({driver.jobsToday}/{driver.maxJobsPerDay})
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      className="btn-secondary"
                                      type="button"
                                      disabled={!assignments[request.id] || workingRequestId === request.id}
                                      onClick={() => void handleAssignDriver(request.id)}
                                    >
                                      {workingRequestId === request.id ? 'Assigning...' : 'Assign'}
                                    </button>
                                  </div>
                                ) : (
                                  <Link
                                    href={`/fleet-compliance/dispatch/${request.id}`}
                                    style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}
                                  >
                                    Open
                                  </Link>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="fleet-compliance-list-card">
                  <h3>Live Dispatch Map</h3>
                  <div className="fleet-compliance-table-note" style={{ marginTop: '0.45rem' }}>
                    Focused on the highest-priority active request.
                  </div>
                  <div
                    style={{
                      marginTop: '0.7rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '240px',
                      background: '#e2e8f0',
                    }}
                  >
                    <iframe
                      title="Dispatch map"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                      style={{ width: '100%', height: '100%', border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

                <div className="fleet-compliance-list-card">
                  <h3>Driver Availability</h3>
                  <div style={{ display: 'grid', gap: '0.6rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.15rem' }}>
                    {drivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="dispatch-driver-card"
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '0.52rem',
                          background: '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{driver.name}</div>
                            <div className="fleet-compliance-table-note">
                              {zoneNameById.get(driver.zoneId) || driver.zoneId}
                            </div>
                          </div>
                          <span
                            style={{
                              display: 'inline-block',
                              borderRadius: '4px',
                              padding: '0.2rem 0.45rem',
                              background: `${driverStatusColors[driver.status]}1A`,
                              color: driverStatusColors[driver.status],
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              height: 'fit-content',
                            }}
                          >
                            {driver.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="fleet-compliance-table-note" style={{ marginTop: '0.2rem' }}>
                          Jobs: {driver.jobsToday}/{driver.maxJobsPerDay}
                        </div>
                        <button
                          className="btn-secondary"
                          type="button"
                          style={{ marginTop: '0.3rem', padding: '0.5rem 0.8rem' }}
                          onClick={() => void handleToggleDriverStatus(driver)}
                          disabled={workingDriverId === driver.id || driver.status === 'en_route' || driver.status === 'on_site'}
                        >
                          {workingDriverId === driver.id
                            ? 'Updating...'
                            : driver.status === 'off_duty'
                              ? 'Set Available'
                              : 'Set Off Duty'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="fleet-compliance-list-card">
                  <h3>Zone Status</h3>
                  <div style={{ display: 'grid', gap: '0.55rem' }}>
                    {(metrics?.zoneHeatmap || []).map((zone) => (
                      <div
                        key={zone.zoneId}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          background: '#f8fafc',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{zone.zoneName}</div>
                        <div className="fleet-compliance-table-note">
                          Active requests: {zone.activeRequestCount}
                        </div>
                        <div className="fleet-compliance-table-note">
                          Avg response: {zone.avgResponseTimeMinutes} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
