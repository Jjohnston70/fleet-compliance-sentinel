'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

const NEXT_DAY_PLAN_STORAGE_KEY = 'dispatch-next-day-plan-v1';

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

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isNextDayCandidate(request: DispatchRequestRow, now: Date): boolean {
  if (request.status !== 'pending') return false;
  if (request.priority === 'scheduled') return true;

  const sla = parseDate(request.slaDeadline);
  if (!sla) return false;

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return sla.getTime() > endOfToday.getTime();
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
  const [plannerAssignments, setPlannerAssignments] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
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
      setMapFocusRequestId((current) => {
        if (current) return current;
        const firstPending = nextRequests.find((entry: DispatchRequestRow) => entry.status === 'pending');
        return firstPending ? firstPending.id : current;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load assignment board');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const timer = window.setInterval(() => {
      void loadData();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [loadData]);

  useEffect(() => {
    const raw = window.localStorage.getItem(NEXT_DAY_PLAN_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setPlannerAssignments(parsed as Record<string, string>);
      }
    } catch {
      // Ignore malformed local storage payload.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(NEXT_DAY_PLAN_STORAGE_KEY, JSON.stringify(plannerAssignments));
  }, [plannerAssignments]);

  const zoneNameById = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.name])),
    [zones],
  );

  const now = useMemo(() => new Date(), []);

  const nextDayPlanningRequests = useMemo(
    () => requests.filter((request) => isNextDayCandidate(request, now)),
    [requests, now],
  );

  const nextDayRequestIds = useMemo(
    () => new Set(nextDayPlanningRequests.map((request) => request.id)),
    [nextDayPlanningRequests],
  );

  useEffect(() => {
    setPlannerAssignments((current) => {
      const filtered = Object.fromEntries(
        Object.entries(current).filter(([requestId]) => nextDayRequestIds.has(requestId)),
      );
      return Object.keys(filtered).length === Object.keys(current).length ? current : filtered;
    });
  }, [nextDayRequestIds]);

  const sameDayAwaitingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pending' && !nextDayRequestIds.has(request.id)),
    [requests, nextDayRequestIds],
  );

  const dispatchedRequests = useMemo(
    () => requests.filter((request) => request.status === 'dispatched'),
    [requests],
  );

  const inProgressToday = useMemo(
    () => requests.filter((request) => request.status === 'en_route' || request.status === 'on_site'),
    [requests],
  );

  const assignableDrivers = useMemo(
    () => drivers.filter((driver) => driver.active && driver.jobsToday < driver.maxJobsPerDay),
    [drivers],
  );

  const planningDriverPool = useMemo(
    () => drivers.filter((driver) => driver.active),
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
    const sameDayMapRequests = [
      ...sameDayAwaitingRequests,
      ...dispatchedRequests,
      ...inProgressToday,
    ];

    const focusRequest = sameDayMapRequests.find((entry) => entry.id === mapFocusRequestId);
    if (focusRequest) return formatAddress(focusRequest);

    const allPendingAddresses = sameDayMapRequests.map((entry) => formatAddress(entry));
    if (allPendingAddresses.length > 0) return allPendingAddresses.slice(0, 12).join(' | ');
    return 'Colorado Springs, CO';
  }, [mapFocusRequestId, sameDayAwaitingRequests, dispatchedRequests, inProgressToday]);

  const plannerSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const driverId of Object.values(plannerAssignments)) {
      if (!driverId) continue;
      counts.set(driverId, (counts.get(driverId) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([driverId, count]) => ({
        driverId,
        count,
        driverName: drivers.find((driver) => driver.id === driverId)?.name || 'Unknown driver',
      }))
      .sort((a, b) => b.count - a.count);
  }, [plannerAssignments, drivers]);

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

  function autoBuildNextDayPlan() {
    const snapshot = new Map<string, number>();
    for (const driver of planningDriverPool) {
      snapshot.set(driver.id, driver.jobsToday);
    }

    const next: Record<string, string> = {};

    for (const request of nextDayPlanningRequests) {
      const zoneCandidates = planningDriverPool
        .filter((driver) => driver.zoneId === request.zoneId)
        .sort((a, b) => (snapshot.get(a.id) || 0) - (snapshot.get(b.id) || 0));
      const pool = zoneCandidates.length > 0
        ? zoneCandidates
        : [...planningDriverPool].sort((a, b) => (snapshot.get(a.id) || 0) - (snapshot.get(b.id) || 0));

      const selected = pool[0];
      if (!selected) continue;
      next[request.id] = selected.id;
      snapshot.set(selected.id, (snapshot.get(selected.id) || 0) + 1);
    }

    setPlannerAssignments(next);
  }

  function clearNextDayPlan() {
    setPlannerAssignments({});
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
            <h1>Emergency Assignment + Next-Day Planning</h1>
            <p className="fleet-compliance-subcopy">
              Use this board for same-day emergency add-ons and keep tomorrow&apos;s scheduled route draft in one place.
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
                <p className="fleet-compliance-stat-label">Same-Day Awaiting Assignment</p>
                <p className="fleet-compliance-stat-value">{sameDayAwaitingRequests.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Awaiting Route Approval</p>
                <p className="fleet-compliance-stat-value">{dispatchedRequests.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">In Progress Today</p>
                <p className="fleet-compliance-stat-value">{inProgressToday.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Next-Day Planning Queue</p>
                <p className="fleet-compliance-stat-value">{nextDayPlanningRequests.length}</p>
              </article>
            </div>

            <div className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>Same-Day Operations Map</h3>
              <div className="fleet-compliance-table-note" style={{ marginTop: '0.4rem' }}>
                Same-day pending, route approval, and active en-route/on-site deliveries.
              </div>
              <div className="dispatch-map-frame dispatch-map-frame-xl" style={{ marginTop: '0.75rem' }}>
                <iframe
                  title="Dispatch operations map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="dispatch-assignment-grid" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-list-card">
                <h3>Same-Day Awaiting Requests</h3>
                <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                  Multiple requests can stay here together until assigned.
                </div>
                <div style={{ display: 'grid', gap: '0.7rem', marginTop: '0.7rem' }}>
                  {sameDayAwaitingRequests.length === 0 ? (
                    <p className="fleet-compliance-table-note">No same-day requests waiting for assignment.</p>
                  ) : (
                    sameDayAwaitingRequests.map((request) => (
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
                <h3>Assignable Drivers (Including Active Routes)</h3>
                <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                  Emergency add-ons can be dropped on drivers already en route.
                </div>
                <div style={{ display: 'grid', gap: '0.65rem', marginTop: '0.7rem' }}>
                  {assignableDrivers.map((driver) => {
                    const assigned = requestsByDriver.get(driver.id) || [];
                    const remainingCapacity = Math.max(0, driver.maxJobsPerDay - driver.jobsToday);
                    const canDrop = remainingCapacity > 0;
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
                            Drop request here to assign. Remaining capacity: {remainingCapacity}
                          </div>
                        ) : (
                          <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                            Driver is at max daily capacity.
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

            <article className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>In Progress Today</h3>
              <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                Approved routes remain visible here until completed.
              </div>
              <div className="fleet-compliance-table-wrap" style={{ marginTop: '0.65rem' }}>
                <table className="fleet-compliance-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Status</th>
                      <th>Driver</th>
                      <th>ETA</th>
                      <th>Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inProgressToday.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ color: 'var(--text-muted)' }}>No routes currently in progress.</td>
                      </tr>
                    ) : (
                      inProgressToday.map((request) => {
                        const driver = drivers.find((entry) => entry.id === request.assignedDriverId);
                        return (
                          <tr key={request.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{request.clientName}</div>
                              <div className="fleet-compliance-table-note">{formatAddress(request)}</div>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{request.status.replace('_', ' ')}</td>
                            <td>{driver?.name || 'Unknown driver'}</td>
                            <td>{formatDateTime(request.estimatedArrival)}</td>
                            <td>
                              <Link className="btn-secondary" href={`/fleet-compliance/dispatch/${request.id}`}>
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>Next-Day Route Planning</h3>
              <div className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                Scheduled requests are separated here so dispatch can draft tomorrow&apos;s routes without triggering same-day dispatch.
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <button className="btn-secondary" type="button" onClick={autoBuildNextDayPlan}>
                  Auto Build Draft Plan
                </button>
                <button className="btn-secondary" type="button" onClick={clearNextDayPlan}>
                  Clear Draft
                </button>
              </div>

              <div className="fleet-compliance-table-wrap" style={{ marginTop: '0.75rem' }}>
                <table className="fleet-compliance-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Zone</th>
                      <th>SLA</th>
                      <th>Planned Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nextDayPlanningRequests.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ color: 'var(--text-muted)' }}>No next-day requests to plan yet.</td>
                      </tr>
                    ) : (
                      nextDayPlanningRequests.map((request) => {
                        const zoneDrivers = planningDriverPool.filter((driver) => driver.zoneId === request.zoneId);
                        const options = zoneDrivers.length > 0 ? zoneDrivers : planningDriverPool;
                        return (
                          <tr key={request.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{request.clientName}</div>
                              <div className="fleet-compliance-table-note">{formatAddress(request)}</div>
                            </td>
                            <td>{zoneNameById.get(request.zoneId) || request.zoneId}</td>
                            <td>{formatDateTime(request.slaDeadline)}</td>
                            <td>
                              <select
                                value={plannerAssignments[request.id] || ''}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setPlannerAssignments((current) => {
                                    if (!value) {
                                      const next = { ...current };
                                      delete next[request.id];
                                      return next;
                                    }
                                    return { ...current, [request.id]: value };
                                  });
                                }}
                              >
                                <option value="">Unassigned draft</option>
                                {options.map((driver) => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.jobsToday}/{driver.maxJobsPerDay})
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.45rem' }}>
                {plannerSummary.length === 0 ? (
                  <div className="fleet-compliance-table-note">No next-day route draft assignments yet.</div>
                ) : (
                  plannerSummary.map((entry) => (
                    <div key={entry.driverId} className="fleet-compliance-table-note">
                      <strong>{entry.driverName}</strong>: {entry.count} planned stop{entry.count === 1 ? '' : 's'}
                    </div>
                  ))
                )}
              </div>
            </article>
          </>
        )}
      </section>
    </main>
  );
}
