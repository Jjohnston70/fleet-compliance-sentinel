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
}

interface DriverRow {
  id: string;
  name: string;
  zoneId: string;
  status: DriverStatus;
  jobsToday: number;
  maxJobsPerDay: number;
  active: boolean;
}

interface ZoneRow {
  id: string;
  name: string;
}

interface MetricsPayload {
  ok: boolean;
  error?: string;
  dashboard?: {
    activeRequests: {
      pending: number;
      dispatched: number;
      en_route: number;
      on_site: number;
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

function isSameLocalDay(value: string | null, now: Date): boolean {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return (
    parsed.getFullYear() === now.getFullYear()
    && parsed.getMonth() === now.getMonth()
    && parsed.getDate() === now.getDate()
  );
}

function isNextDayCandidate(request: DispatchRequestRow, now: Date): boolean {
  if (request.status !== 'pending') return false;
  if (request.priority === 'scheduled') return true;
  if (!request.slaDeadline) return false;

  const sla = new Date(request.slaDeadline);
  if (Number.isNaN(sla.getTime())) return false;

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return sla.getTime() > endOfToday.getTime();
}

function formatAddress(request: DispatchRequestRow): string {
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

  async function loadData() {
    setError('');
    try {
      const [dispatchRes, metricsRes] = await Promise.all([
        fetch('/api/fleet-compliance/dispatch', { cache: 'no-store' }),
        fetch('/api/fleet-compliance/dispatch/metrics', { cache: 'no-store' }),
      ]);

      const dispatchData = await dispatchRes.json().catch(() => ({}));
      const metricsData = (await metricsRes.json().catch(() => ({}))) as MetricsPayload;

      if (!dispatchRes.ok || !dispatchData.ok) {
        throw new Error(dispatchData.error || 'Failed to load dispatch data');
      }
      if (!metricsRes.ok || !metricsData.ok) {
        throw new Error(metricsData.error || 'Failed to load dispatch metrics');
      }

      setRequests(Array.isArray(dispatchData.requests) ? dispatchData.requests : []);
      setDrivers(Array.isArray(dispatchData.drivers) ? dispatchData.drivers : []);
      setZones(Array.isArray(dispatchData.zones) ? dispatchData.zones : []);
      setMetrics(metricsData.dashboard ?? null);
      setSlaSummary(metricsData.slaSummary ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dispatch dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const timer = window.setInterval(() => {
      void loadData();
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const zoneNameById = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.name])),
    [zones],
  );

  const now = useMemo(() => new Date(), []);

  const activeRequests = useMemo(
    () => requests.filter((request) => request.status !== 'completed' && request.status !== 'cancelled'),
    [requests],
  );

  const todayDeliveries = useMemo(
    () => requests.filter((request) =>
      request.status !== 'cancelled'
      && (
        isSameLocalDay(request.createdAt, now)
        || isSameLocalDay(request.completedAt, now)
        || request.status === 'pending'
        || request.status === 'dispatched'
        || request.status === 'en_route'
        || request.status === 'on_site'
      )),
    [requests, now],
  );

  const pendingAssignments = useMemo(
    () => activeRequests.filter((request) => request.status === 'pending'),
    [activeRequests],
  );

  const awaitingRouteApproval = useMemo(
    () => activeRequests.filter((request) => request.status === 'dispatched'),
    [activeRequests],
  );

  const inProgressToday = useMemo(
    () => activeRequests.filter((request) => request.status === 'en_route' || request.status === 'on_site'),
    [activeRequests],
  );

  const nextDayPlanningQueue = useMemo(
    () => requests.filter((request) => isNextDayCandidate(request, now)),
    [requests, now],
  );

  const availableDrivers = useMemo(
    () => drivers.filter((driver) => driver.active && driver.status === 'available'),
    [drivers],
  );

  const deliveryMapQuery = useMemo(() => {
    const addresses = todayDeliveries.map((request) => formatAddress(request)).filter(Boolean);
    if (addresses.length === 0) return 'Colorado Springs, CO';
    return addresses.slice(0, 8).join(' | ');
  }, [todayDeliveries]);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Operations</p>
            <h1>Dispatch Daily Overview</h1>
            <p className="fleet-compliance-subcopy">
              Daily operations across emergency assignment, active routes, and next-day planning.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link href="/fleet-compliance/dispatch/assignments" className="btn-primary">
              Open Assignment Board
            </Link>
            <Link href="/fleet-compliance/dispatch/new" className="btn-secondary">
              New Dispatch Request
            </Link>
          </div>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading dispatch overview...</p>
        ) : (
          <>
            <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Today&apos;s Deliveries</p>
                <p className="fleet-compliance-stat-value">{todayDeliveries.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Pending Assignment</p>
                <p className="fleet-compliance-stat-value">{pendingAssignments.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Awaiting Route Approval</p>
                <p className="fleet-compliance-stat-value">{awaitingRouteApproval.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">In Progress</p>
                <p className="fleet-compliance-stat-value">{inProgressToday.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Next-Day Planning Queue</p>
                <p className="fleet-compliance-stat-value">{nextDayPlanningQueue.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Available Drivers</p>
                <p className="fleet-compliance-stat-value">{availableDrivers.length}</p>
              </article>
            </div>

            <div className="dispatch-overview-layout" style={{ marginTop: '1.2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <article className="fleet-compliance-list-card">
                  <h3>Today&apos;s Delivery Map</h3>
                  <div className="fleet-compliance-table-note" style={{ marginTop: '0.4rem' }}>
                    Showing up to 8 delivery stops for {now.toLocaleDateString('en-US')}.
                  </div>
                  <div className="dispatch-map-frame dispatch-map-frame-tall" style={{ marginTop: '0.75rem' }}>
                    <iframe
                      title="Dispatch daily delivery map"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(deliveryMapQuery)}&output=embed`}
                      style={{ width: '100%', height: '100%', border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </article>

                <article className="fleet-compliance-list-card dispatch-active-requests-card">
                  <h3>Active Requests</h3>
                  <div className="fleet-compliance-table-wrap">
                    <table className="fleet-compliance-table">
                      <thead>
                        <tr>
                          <th>Client / Address</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Zone</th>
                          <th>SLA Deadline</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ color: 'var(--text-muted)' }}>No active requests.</td>
                          </tr>
                        ) : (
                          activeRequests.map((request) => (
                            <tr key={request.id}>
                              <td>
                                <div style={{ fontWeight: 700 }}>{request.clientName}</div>
                                <div className="fleet-compliance-table-note">{formatAddress(request)}</div>
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
                              <td style={{ textTransform: 'capitalize' }}>{request.priority}</td>
                              <td>{zoneNameById.get(request.zoneId) || request.zoneId}</td>
                              <td>{formatDateTime(request.slaDeadline)}</td>
                              <td>
                                <Link
                                  href={`/fleet-compliance/dispatch/${request.id}`}
                                  style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 700 }}
                                >
                                  Open
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>

              <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
                <article className="fleet-compliance-list-card dispatch-driver-status-compact">
                  <h3>Driver Status</h3>
                  <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.55rem' }}>
                    {drivers.slice(0, 8).map((driver) => (
                      <div key={driver.id} className="dispatch-driver-status-row">
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{driver.name}</div>
                          <div className="fleet-compliance-table-note">
                            {zoneNameById.get(driver.zoneId) || driver.zoneId} · {driver.jobsToday}/{driver.maxJobsPerDay}
                          </div>
                        </div>
                        <span
                          style={{
                            borderRadius: '999px',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.76rem',
                            textTransform: 'capitalize',
                            fontWeight: 700,
                            background: `${driverStatusColors[driver.status]}1A`,
                            color: driverStatusColors[driver.status],
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {driver.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    {drivers.length > 8 && (
                      <div className="fleet-compliance-table-note">+{drivers.length - 8} more drivers on the assignment board.</div>
                    )}
                  </div>
                </article>

                <article className="fleet-compliance-list-card">
                  <h3>SLA Watch</h3>
                  <div style={{ marginTop: '0.65rem', display: 'grid', gap: '0.45rem' }}>
                    <div><strong>Healthy:</strong> {slaSummary?.healthy ?? 0}</div>
                    <div><strong>Warning:</strong> {slaSummary?.warning ?? 0}</div>
                    <div><strong>Critical:</strong> {slaSummary?.critical ?? 0}</div>
                    <div><strong>Breached:</strong> {slaSummary?.breached ?? 0}</div>
                  </div>
                  <Link href="/fleet-compliance/dispatch/assignments" className="btn-secondary" style={{ marginTop: '0.75rem' }}>
                    Resolve Pending Work
                  </Link>
                </article>

                <article className="fleet-compliance-list-card">
                  <h3>Zone Heatmap</h3>
                  <div style={{ marginTop: '0.6rem', display: 'grid', gap: '0.55rem' }}>
                    {(metrics?.zoneHeatmap || []).map((zone) => (
                      <div key={zone.zoneId} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{zone.zoneName}</div>
                        <div className="fleet-compliance-table-note">Active: {zone.activeRequestCount}</div>
                        <div className="fleet-compliance-table-note">Avg response: {zone.avgResponseTimeMinutes} min</div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
