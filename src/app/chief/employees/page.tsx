import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { loadChiefData, formatDueLabel } from '@/lib/chief-data';

export const dynamic = 'force-dynamic';

export default async function ChiefEmployeesPage() {
  if (!isClerkEnabled()) return null;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const data = await loadChiefData();

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Employees</p>
            <h1>Employee roster</h1>
          </div>
          <div className="chief-action-row">
            <Link href="/chief" className="btn-secondary">Back to Chief</Link>
          </div>
        </div>
        <p className="chief-subcopy">
          Employee records imported from the bulk upload spreadsheet. Driver compliance details are linked below.
        </p>

        <div className="chief-stats chief-stats-compact">
          <article className="chief-stat-card">
            <p className="chief-stat-label">Employees</p>
            <p className="chief-stat-value">{data.employees.length}</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Drivers</p>
            <p className="chief-stat-value">{data.drivers.length}</p>
          </article>
        </div>

        {/* Employee records from DB */}
        {data.employees.length > 0 && (
          <div className="chief-list-card">
            <h3>Employees</h3>
            <div className="chief-table-wrap">
              <table className="chief-table">
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
                      <td className="chief-table-note">{emp.employeeId}</td>
                      <td><strong>{emp.lastName}, {emp.firstName}</strong></td>
                      <td>{emp.jobTitle}</td>
                      <td>{emp.department}</td>
                      <td className="chief-table-note">{emp.supervisor}</td>
                      <td className="chief-table-note">{emp.workEmail}</td>
                      <td>
                        {emp.cdlClass ? (
                          <span className="chief-chip">Class {emp.cdlClass}</span>
                        ) : (
                          <span className="chief-table-note">—</span>
                        )}
                      </td>
                      <td className="chief-table-note">{emp.hireDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Driver compliance records */}
        {data.drivers.length > 0 && (
          <div className="chief-list-card">
            <h3>Driver compliance</h3>
            <div className="chief-table-wrap">
              <table className="chief-table">
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
                        <div className="chief-table-note">{formatDueLabel(driver.medicalExpiration)}</div>
                      </td>
                      <td className="chief-table-note">{driver.clearinghouseStatus}</td>
                      <td>
                        <Link
                          href={`/chief/compliance/drivers/${encodeURIComponent(driver.personId)}`}
                          className="chief-inline-link"
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
  );
}
