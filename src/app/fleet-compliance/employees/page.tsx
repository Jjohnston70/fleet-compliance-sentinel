import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import { loadFleetComplianceData, formatDueLabel } from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Employees',
};

export default async function FleetComplianceEmployeesPage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const data = await loadFleetComplianceData(orgId);

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/employees" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Employees</p>
            <h1>Employee roster</h1>
          </div>
          <div className="fleet-compliance-action-row">
            <Link href="/fleet-compliance" className="btn-secondary">Back to Fleet-Compliance</Link>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          Employee records imported from the bulk upload spreadsheet. Driver compliance details are linked below.
        </p>

        <div className="fleet-compliance-stats fleet-compliance-stats-compact">
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Employees</p>
            <p className="fleet-compliance-stat-value">{data.employees.length}</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Drivers</p>
            <p className="fleet-compliance-stat-value">{data.drivers.length}</p>
          </article>
        </div>

        {/* Employee records from DB */}
        {data.employees.length > 0 && (
          <div className="fleet-compliance-list-card">
            <h3>Employees</h3>
            <div className="fleet-compliance-table-wrap">
              <table className="fleet-compliance-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Dept</th>
                    <th>Supervisor</th>
                    <th>Email</th>
                    <th>CDL</th>
                    <th>Hire Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.employees.map((emp) => (
                    <tr key={emp.employeeId}>
                      <td className="fleet-compliance-table-note">{emp.employeeId}</td>
                      <td><strong>{emp.lastName}, {emp.firstName}</strong></td>
                      <td>{emp.jobTitle}</td>
                      <td>{emp.department}</td>
                      <td className="fleet-compliance-table-note">{emp.supervisor}</td>
                      <td className="fleet-compliance-table-note">{emp.workEmail}</td>
                      <td>
                        {emp.cdlClass ? (
                          <span className="fleet-compliance-chip">Class {emp.cdlClass}</span>
                        ) : (
                          <span className="fleet-compliance-table-note">—</span>
                        )}
                      </td>
                      <td className="fleet-compliance-table-note">{emp.hireDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Driver compliance records */}
        {data.drivers.length > 0 && (
          <div className="fleet-compliance-list-card">
            <h3>Driver compliance</h3>
            <div className="fleet-compliance-table-wrap">
              <table className="fleet-compliance-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>CDL Class</th>
                    <th>License State</th>
                    <th>Medical Expiration</th>
                    <th>Clearinghouse</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.drivers.map((driver) => (
                    <tr key={driver.personId}>
                      <td><strong>{driver.driverName}</strong></td>
                      <td>{driver.cdlClass}</td>
                      <td>{driver.licenseState}</td>
                      <td>
                        {driver.medicalExpiration}
                        <div className="fleet-compliance-table-note">{formatDueLabel(driver.medicalExpiration)}</div>
                      </td>
                      <td className="fleet-compliance-table-note">{driver.clearinghouseStatus}</td>
                      <td>
                        <Link
                          href={`/fleet-compliance/compliance/drivers/${encodeURIComponent(driver.personId)}`}
                          className="fleet-compliance-inline-link"
                          style={{ fontSize: '0.8rem' }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
