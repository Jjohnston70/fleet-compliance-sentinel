import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import {
  fleetCompliancePermitCadence,
  filterDriverCompliance,
  filterPermitRecords,
  formatDueLabel,
  getComplianceStats,
  loadFleetComplianceData,
} from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Compliance',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function FleetComplianceCompliancePage({ searchParams }: { searchParams: SearchParams }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId, orgId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  if (!orgId) {
    redirect('/');
  }

  const data = await loadFleetComplianceData(orgId);

  const resolved = await searchParams;
  const q = firstParam(resolved.q);
  const scope = firstParam(resolved.scope) || 'all';
  const state = firstParam(resolved.state);
  const templateId = firstParam(resolved.templateId);
  const status = firstParam(resolved.status);
  const driverSort = firstParam(resolved.driverSort);
  const permitSort = firstParam(resolved.permitSort);
  const drivers = filterDriverCompliance(data.drivers, { q, state, sort: driverSort });
  const permits = filterPermitRecords(data.permits, { q, templateId, status, sort: permitSort });
  const stats = getComplianceStats(data.drivers, data.permits);

  const showDrivers = scope === 'all' || scope === 'drivers';
  const showPermits = scope === 'all' || scope === 'permits';

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/compliance" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Compliance</p>
            <h1>Driver and permit tracking</h1>
          </div>
          <div className="fleet-compliance-action-row">
            <Link href="/api/fleet-compliance/bulk-template" className="btn-secondary">
              Download Bulk Template
            </Link>
            <Link href="/fleet-compliance" className="btn-secondary">
              Back to Fleet-Compliance
            </Link>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          This route now shows the imported compliance snapshot: driver qualification timing, permit cadence, renewal
          windows, and linked detail pages for the records that will drive suspense alerts.
        </p>

        <form className="fleet-compliance-filter-bar" action="/fleet-compliance/compliance">
          <div className="fleet-compliance-filter-grid fleet-compliance-filter-grid-wide">
            <label className="fleet-compliance-field-stack">
              <span>Search</span>
              <input type="search" name="q" defaultValue={q} placeholder="Driver, permit, owner, agency" />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Scope</span>
              <select name="scope" defaultValue={scope}>
                <option value="all">Drivers and permits</option>
                <option value="drivers">Drivers only</option>
                <option value="permits">Permits only</option>
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Driver State</span>
              <select name="state" defaultValue={state || 'all'}>
                <option value="all">All states</option>
                {data.driverStates.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Permit Track</span>
              <select name="templateId" defaultValue={templateId || 'all'}>
                <option value="all">All permit tracks</option>
                {data.permitTemplates.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Permit Status</span>
              <select name="status" defaultValue={status || 'all'}>
                <option value="all">All statuses</option>
                {data.permitStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Driver Sort</span>
              <select name="driverSort" defaultValue={driverSort || 'medical_asc'}>
                <option value="medical_asc">Medical exp ↑</option>
                <option value="medical_desc">Medical exp ↓</option>
                <option value="name_asc">Name A–Z</option>
                <option value="mvr_asc">MVR due ↑</option>
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Permit Sort</span>
              <select name="permitSort" defaultValue={permitSort || 'due_asc'}>
                <option value="due_asc">Renewal due ↑</option>
                <option value="due_desc">Renewal due ↓</option>
                <option value="name_asc">Name A–Z</option>
              </select>
            </label>
          </div>
          <div className="fleet-compliance-action-row">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <Link href="/fleet-compliance/compliance" className="btn-secondary">
              Reset
            </Link>
          </div>
        </form>

        <div className="fleet-compliance-stats fleet-compliance-stats-compact">
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Driver Records</p>
            <p className="fleet-compliance-stat-value">{stats.drivers}</p>
            <p className="fleet-compliance-stat-note">Compliance profiles staged</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Medical Expiring</p>
            <p className="fleet-compliance-stat-value">{stats.expiringWithin60Days}</p>
            <p className="fleet-compliance-stat-note">Inside 60 days</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Permit Deadlines</p>
            <p className="fleet-compliance-stat-value">{stats.permitDeadlines}</p>
            <p className="fleet-compliance-stat-note">Inside 120 days</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Cadence Tracks</p>
            <p className="fleet-compliance-stat-value">{fleetCompliancePermitCadence.length}</p>
            <p className="fleet-compliance-stat-note">Seeded requirement templates</p>
          </article>
        </div>

        <div className="fleet-compliance-table-wrap">
          <table className="fleet-compliance-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Cadence</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              {fleetCompliancePermitCadence.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.cadence}</td>
                  <td>{row.routeHint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="fleet-compliance-list-grid">
          {showDrivers ? (
            <div className="fleet-compliance-list-card">
              <h3>Driver compliance</h3>
              {drivers.length ? (
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Driver</th>
                        <th>Medical</th>
                        <th>MVR</th>
                        <th>TSA / Hazmat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((row) => (
                        <tr key={row.personId}>
                          <td>
                            <Link href={`/fleet-compliance/compliance/drivers/${encodeURIComponent(row.personId)}`} className="fleet-compliance-inline-link">
                              <strong>{row.driverName}</strong>
                            </Link>
                            <div className="fleet-compliance-table-note">
                              {row.employeeId} · {row.cdlClass} · {row.licenseState}
                            </div>
                          </td>
                          <td>
                            {row.medicalExpiration}
                            <div className="fleet-compliance-table-note">{formatDueLabel(row.medicalExpiration)}</div>
                          </td>
                          <td>
                            {row.nextMvrDue}
                            <div className="fleet-compliance-table-note">{row.clearinghouseStatus}</div>
                          </td>
                          <td>
                            TSA {row.tsaExpiration}
                            <div className="fleet-compliance-table-note">Hazmat {row.hazmatExpiration}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No driver records matched the current filters.</p>
              )}
            </div>
          ) : null}

          {showPermits ? (
            <div className="fleet-compliance-list-card">
              <h3>Permit and filing records</h3>
              {permits.length ? (
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Record</th>
                        <th>Due</th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permits.map((row) => (
                        <tr key={row.recordId}>
                          <td>
                            <Link href={`/fleet-compliance/compliance/permits/${encodeURIComponent(row.recordId)}`} className="fleet-compliance-inline-link">
                              <strong>{row.name}</strong>
                            </Link>
                            <div className="fleet-compliance-table-note">{row.issuingAgency}</div>
                          </td>
                          <td>
                            {row.renewalDueDate}
                            <div className="fleet-compliance-table-note">{formatDueLabel(row.renewalDueDate)}</div>
                          </td>
                          <td>{row.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No permit records matched the current filters.</p>
              )}
            </div>
          ) : null}
        </div>
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
