import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import LocalRecordsPanel from '@/components/chief/LocalRecordsPanel';
import { loadChiefData } from '@/lib/chief-data';

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
            <Link href="/chief/employees/new" className="btn-primary">+ Add Employee</Link>
            <Link href="/chief" className="btn-secondary">Back to Chief</Link>
          </div>
        </div>
        <p className="chief-subcopy">
          Local records are saved in your browser and can be exported as JSON for Firestore import.
          Driver records are read-only and come from the imported source snapshot.
        </p>

        {/* Local records from browser */}
        <LocalRecordsPanel
          storeKey="chief:store:employees"
          title="Local employees"
          addHref="/chief/employees/new"
          editHref={(id) => `/chief/employees/${id}/edit`}
          archiveField="status"
          archiveValue="archived"
          statusField="status"
          columns={[
            { key: 'employeeId', label: 'ID' },
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'jobTitle', label: 'Title' },
            { key: 'department', label: 'Dept' },
            { key: 'workEmail', label: 'Email' },
            { key: 'status', label: 'Status' },
          ]}
        />

        {/* Driver compliance records */}
        <div className="chief-list-card">
          <h3>Driver records</h3>
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
                    <td className="chief-table-note">{driver.medicalExpiration}</td>
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
      </section>
    </main>
  );
}
