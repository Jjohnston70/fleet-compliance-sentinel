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
  address: string;
  city: string;
  state: string;
  zip: string;
  zoneId: string;
  priority: 'emergency' | 'urgent' | 'standard' | 'scheduled';
  issueType: string;
  status: DispatchStatus;
  assignedDriverId: string | null;
  estimatedArrival: string | null;
  slaDeadline: string | null;
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

const priorityColors: Record<DispatchRequestRow['priority'], string> = {
  emergency: '#dc2626',
  urgent: '#ea580c',
  standard: '#2563eb',
  scheduled: '#0f766e',
};

function formatAddress(request: DispatchRequestRow): string {
  return [request.address, request.city, request.state, request.zip]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

function formatDateTime(value: string | null): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString('en-US');
}

export default function DispatchAssignmentBoardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<DispatchRequestRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [dragRequestId, setDragRequestId] = useState('');
  const [mapFocusRequestId, setMapFocusRequestId] = useState('');
  const [workingRequestId, setWorkingRequestId] = useState('');

  async function loadData() {
    setError('');
    try {
      const response = await fetch('/api/fleet-compliance/dispatch', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load dispatch board');
      }
      const nextRequests = Array.isArray(data.requests) ? data.requests : [];
      setRequests(nextRequests);
      setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
      setZones(Array.isArray(data.zones) ? data.zones : []);
      if (!mapFocusRequestId) {
        const firstPending = nextRequests.find((entry: DispatchRequestRow) => entry.status === 'pending');
        if (firstPending) setMapFocusRequestId(firstPending.id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load assignment board');
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

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pending'),
    [requests],
  );
  const dispatchedRequests = useMemo(
    () => requests.filter((request) => request.status === 'dispatched'),
    [requests],
  );
  const availableDrivers = useMemo(
    () => drivers.filter((driver) => driver.active && driver.status === 'available'),
    [drivers],
  );

  const requestsByDriver = useMemo(() => {
    const map = new Map<string, DispatchRequestRow[]>();
    for (const request of requests) {
      if (!request.assignedDriverId) continue;
      const current = map.get(request.assignedDriverId) || [];
      current.push(request);
      map.set(request.assignedDriverId, current);
    }
    return map;
  }, [requests]);

  const mapQuery = useMemo(() => {
    const focusRequest = pendingRequests.find((entry) => entry.id === mapFocusRequestId);
    if (focusRequest) return formatAddress(focusRequest);

    const allPendingAddresses = pendingRequests.map((entry) => formatAddress(entry));
    if (allPendingAddresses.length > 0) return allPendingAddresses.slice(0, 10).join(' | ');
    return 'Colorado Springs, CO';
  }, [mapFocusRequestId, pendingRequests]);

  async function assignRequestToDriver(requestId: string, driverId: string) {
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
        throw new Error(data.error || 'Failed to assign request');
      }
      await loadData();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'Failed to assign request');
    } finally {
      setWorkingRequestId('');
      setDragRequestId('');
    }
  }

  async function approveRoute(requestId: string) {
    setWorkingRequestId(requestId);
    setError('');
    try {
      const response = await fetch(`/api/fleet-compliance/dispatch/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_en_route' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to approve route');
      }
      await loadData();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve route');
    } finally {
      setWorkingRequestId('');
    }
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/dispatch">Dispatch</Link>
          <span>/</span>
          <span>Assignments</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Dispatch Board</p>
            <h1>Awaiting Assignments</h1>
            <p className="fleet-compliance-subcopy">
              Drag a pending request onto an available driver, then approve route dispatch.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link href="/fleet-compliance/dispatch" className="btn-secondary">Back to Overview</Link>
            <Link href="/fleet-compliance/dispatch/new" className="btn-primary">New Request</Link>
          </div>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading assignment board...</p>
        ) : (
          <>
            <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Awaiting Assignment</p>
                <p className="fleet-compliance-stat-value">{pendingRequests.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Available Drivers</p>
                <p className="fleet-compliance-stat-value">{availableDrivers.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Awaiting Route Approval</p>
                <p className="fleet-compliance-stat-value">{dispatchedRequests.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Total Open Requests</p>
                <p className="fleet-compliance-stat-value">
                  {requests.filter((request) => request.status !== 'completed' && request.status !== 'cancelled').length}
                </p>
              </article>
            </div>

            <div className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>Assignment Map</h3>
              <div className="fleet-compliance-table-note" style={{ marginTop: '0.4rem' }}>
                Focus on pending deliveries that still need a driver assignment.
              </div>
              <div className="dispatch-map-frame dispatch-map-frame-xl" style={{ marginTop: '0.75rem' }}>
                <iframe
                  title="Pending dispatch map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="dispatch-assignment-grid" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-list-card">
                <h3>Awaiting Requests</h3>
                <div style={{ display: 'grid', gap: '0.7rem', marginTop: '0.7rem' }}>
                  {pendingRequests.length === 0 ? (
                    <p className="fleet-compliance-table-note">No pending requests waiting for assignment.</p>
                  ) : (
                    pendingRequests.map((request) => (
                      <button
                        key={request.id}
                        type="button"
                        className="dispatch-request-card"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData('text/plain', request.id);
                          setDragRequestId(request.id);
                        }}
                        onDragEnd={() => setDragRequestId('')}
                        onClick={() => setMapFocusRequestId(request.id)}
                        style={{
                          borderColor: mapFocusRequestId === request.id ? 'var(--teal)' : 'var(--border)',
                          opacity: workingRequestId === request.id ? 0.55 : 1,
                        }}
                        disabled={workingRequestId === request.id}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{request.clientName}</span>
                          <span
                            style={{
                              borderRadius: '999px',
                              padding: '0.1rem 0.5rem',
                              background: `${priorityColors[request.priority]}1A`,
                              color: priorityColors[request.priority],
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {request.priority}
                          </span>
                        </div>
                        <div className="fleet-compliance-table-note">{request.issueType.replace('_', ' ')}</div>
                        <div className="fleet-compliance-table-note">{formatAddress(request)}</div>
                        <div className="fleet-compliance-table-note">
                          Zone: {zoneNameById.get(request.zoneId) || request.zoneId} · SLA: {formatDateTime(request.slaDeadline)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </article>

              <article className="fleet-compliance-list-card">
                <h3>Available Drivers</h3>
                <div style={{ display: 'grid', gap: '0.65rem', marginTop: '0.7rem' }}>
                  {drivers.map((driver) => {
                    const assigned = requestsByDriver.get(driver.id) || [];
                    const canDrop = driver.active && driver.status === 'available';
                    return (
                      <div
                        key={driver.id}
                        className={`dispatch-drop-zone ${canDrop ? '' : 'dispatch-drop-zone-disabled'}`}
                        onDragOver={(event) => {
                          if (!canDrop) return;
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          if (!canDrop) return;
                          event.preventDefault();
                          const requestId = event.dataTransfer.getData('text/plain');
                          if (!requestId) return;
                          void assignRequestToDriver(requestId, driver.id);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.55rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{driver.name}</div>
                            <div className="fleet-compliance-table-note">
                              {zoneNameById.get(driver.zoneId) || driver.zoneId} · {driver.jobsToday}/{driver.maxJobsPerDay} jobs
                            </div>
                          </div>
                          <span style={{ fontSize: '0.78rem', textTransform: 'capitalize', fontWeight: 700 }}>
                            {driver.status.replace('_', ' ')}
                          </span>
                        </div>
                        {canDrop ? (
                          <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                            Drop request here to assign.
                          </div>
                        ) : (
                          <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                            Driver unavailable for assignment.
                          </div>
                        )}
                        {assigned.length > 0 && (
                          <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                            Current open requests: {assigned.filter((entry) => entry.status !== 'completed' && entry.status !== 'cancelled').length}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {dragRequestId && (
                  <div className="fleet-compliance-table-note" style={{ marginTop: '0.65rem' }}>
                    Dragging request {dragRequestId.slice(0, 8)}...
                  </div>
                )}
              </article>
            </div>

            <article className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>Route Approval Queue</h3>
              <div className="fleet-compliance-table-wrap">
                <table className="fleet-compliance-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Assigned Driver</th>
                      <th>ETA</th>
                      <th>SLA</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatchedRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ color: 'var(--text-muted)' }}>No requests waiting for route approval.</td>
                      </tr>
                    ) : (
                      dispatchedRequests.map((request) => {
                        const driver = drivers.find((entry) => entry.id === request.assignedDriverId);
                        return (
                          <tr key={request.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{request.clientName}</div>
                              <div className="fleet-compliance-table-note">{formatAddress(request)}</div>
                            </td>
                            <td>{driver?.name || 'Unknown driver'}</td>
                            <td>{formatDateTime(request.estimatedArrival)}</td>
                            <td>{formatDateTime(request.slaDeadline)}</td>
                            <td>
                              <button
                                className="btn-secondary"
                                type="button"
                                disabled={workingRequestId === request.id}
                                onClick={() => void approveRoute(request.id)}
                              >
                                {workingRequestId === request.id ? 'Approving...' : 'Approve Route'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </>
        )}
      </section>
    </main>
  );
}
