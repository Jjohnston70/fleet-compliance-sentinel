import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import ChiefErrorBoundary from '@/components/chief/ChiefErrorBoundary';
import {
  chiefPermitCadence,
  filterDriverCompliance,
  filterPermitRecords,
  formatDueLabel,
  getComplianceStats,
  loadChiefData,
} from '@/lib/chief-data';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function ChiefCompliancePage({ searchParams }: { searchParams: SearchParams }) {
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

  const data = await loadChiefData(orgId);

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
    <ChiefErrorBoundary page="/chief/compliance" userId={userId}>
      <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Compliance</p>
            <h1>Driver and permit tracking</h1>
          </div>
          <div className="chief-action-row">
            <Link href="/api/chief/bulk-template" className="btn-secondary">
              Download Bulk Template
            </Link>
            <Link href="/chief" className="btn-secondary">
              Back to Chief
            </Link>
          </div>
        </div>
        <p className="chief-subcopy">
          This route now shows the imported compliance snapshot: driver qualification timing, permit cadence, renewal
          windows, and linked detail pages for the records that will drive suspense alerts.
        </p>

        <form className="chief-filter-bar" action="/chief/compliance">
          <div className="chief-filter-grid chief-filter-grid-wide">
            <label className="chief-field-stack">
              <span>Search</span>
              <input type="search" name="q" defaultValue={q} placeholder="Driver, permit, owner, agency" />
            </label>
            <label className="chief-field-stack">
              <span>Scope</span>
              <select name="scope" defaultValue={scope}>
                <option value="all">Drivers and permits</option>
                <option value="drivers">Drivers only</option>
                <option value="permits">Permits only</option>
              </select>
            </label>
            <label className="chief-field-stack">
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
            <label className="chief-field-stack">
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
            <label className="chief-field-stack">
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
            <label className="chief-field-stack">
              <span>Driver Sort</span>
              <select name="driverSort" defaultValue={driverSort || 'medical_asc'}>
                <option value="medical_asc">Medical exp ↑</option>
                <option value="medical_desc">Medical exp ↓</option>
                <option value="name_asc">Name A–Z</option>
                <option value="mvr_asc">MVR due ↑</option>
              </select>
            </label>
            <label className="chief-field-stack">
              <span>Permit Sort</span>
              <select name="permitSort" defaultValue={permitSort || 'due_asc'}>
                <option value="due_asc">Renewal due ↑</option>
                <option value="due_desc">Renewal due ↓</option>
                <option value="name_asc">Name A–Z</option>
              </select>
            </label>
          </div>
          <div className="chief-action-row">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <Link href="/chief/compliance" className="btn-secondary">
              Reset
            </Link>
          </div>
        </form>

        <div className="chief-stats chief-stats-compact">
          <article className="chief-stat-card">
            <p className="chief-stat-label">Driver Records</p>
            <p className="chief-stat-value">{stats.drivers}</p>
            <p className="chief-stat-note">Compliance profiles staged</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Medical Expiring</p>
            <p className="chief-stat-value">{stats.expiringWithin60Days}</p>
            <p className="chief-stat-note">Inside 60 days</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Permit Deadlines</p>
            <p className="chief-stat-value">{stats.permitDeadlines}</p>
            <p className="chief-stat-note">Inside 120 days</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Cadence Tracks</p>
            <p className="chief-stat-value">{chiefPermitCadence.length}</p>
            <p className="chief-stat-note">Seeded requirement templates</p>
          </article>
        </div>

        <div className="chief-table-wrap">
          <table className="chief-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Cadence</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              {chiefPermitCadence.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.cadence}</td>
                  <td>{row.routeHint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chief-list-grid">
          {showDrivers ? (
            <div className="chief-list-card">
              <h3>Driver compliance</h3>
              {drivers.length ? (
                <div className="chief-table-wrap">
                  <table className="chief-table">
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
                            <Link href={`/chief/compliance/drivers/${encodeURIComponent(row.personId)}`} className="chief-inline-link">
                              <strong>{row.driverName}</strong>
                            </Link>
                            <div className="chief-table-note">
                              {row.employeeId} · {row.cdlClass} · {row.licenseState}
                            </div>
                          </td>
                          <td>
                            {row.medicalExpiration}
                            <div className="chief-table-note">{formatDueLabel(row.medicalExpiration)}</div>
                          </td>
                          <td>
                            {row.nextMvrDue}
                            <div className="chief-table-note">{row.clearinghouseStatus}</div>
                          </td>
                          <td>
                            TSA {row.tsaExpiration}
                            <div className="chief-table-note">Hazmat {row.hazmatExpiration}</div>
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
            <div className="chief-list-card">
              <h3>Permit and filing records</h3>
              {permits.length ? (
                <div className="chief-table-wrap">
                  <table className="chief-table">
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
                            <Link href={`/chief/compliance/permits/${encodeURIComponent(row.recordId)}`} className="chief-inline-link">
                              <strong>{row.name}</strong>
                            </Link>
                            <div className="chief-table-note">{row.issuingAgency}</div>
                          </td>
                          <td>
                            {row.renewalDueDate}
                            <div className="chief-table-note">{formatDueLabel(row.renewalDueDate)}</div>
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
    </ChiefErrorBoundary>
  );
}

