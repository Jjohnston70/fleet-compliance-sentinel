import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import {
  findDriver,
  formatDueLabel,
  getDriverDocuments,
  getDriverSourceQuality,
  getDriverSuspense,
  loadEmployeeHazmatTrainingRecords,
  loadFleetComplianceData,
} from '@/lib/fleet-compliance-data';
import InlineNoteEditor from '@/components/fleet-compliance/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ personId: string }>;

const REQUIRED_HAZMAT_MODULE_COUNT = 12;

type HazmatEmployeeStatus = 'Compliant' | 'At Risk' | 'Delinquent' | 'New Hire' | 'In Progress' | 'Not Tracked';

function daysUntilDate(dateText: string): number | null {
  if (!dateText) return null;
  const due = new Date(`${dateText}T12:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const diffMs = due.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function computeHazmatEmployeeStatus(records: Array<{
  moduleCategory: string;
  status: string;
  nextDueDate: string;
  trainingWindowEnd: string;
}>): HazmatEmployeeStatus {
  if (records.length === 0) return 'Not Tracked';

  const required = records.filter((row) => row.moduleCategory === 'required');
  if (required.length === 0) return 'Not Tracked';

  const hasDelinquent = required.some((row) => {
    const days = daysUntilDate(row.nextDueDate);
    return days !== null && days < 0;
  });
  if (hasDelinquent) return 'Delinquent';

  const inNewHireWindow = required.some((row) => {
    const daysToWindowEnd = daysUntilDate(row.trainingWindowEnd);
    return daysToWindowEnd !== null && daysToWindowEnd >= 0 && row.status !== 'complete';
  });
  if (inNewHireWindow) return 'New Hire';

  const atRisk = required.some((row) => {
    const days = daysUntilDate(row.nextDueDate);
    return days !== null && days >= 0 && days <= 90;
  });
  if (atRisk) return 'At Risk';

  const completeRequiredCount = required.filter((row) => row.status === 'complete').length;
  if (completeRequiredCount >= REQUIRED_HAZMAT_MODULE_COUNT) return 'Compliant';

  return 'In Progress';
}

function renderDueLabel(nextDueDate: string): string {
  if (!nextDueDate) return 'n/a';
  const days = daysUntilDate(nextDueDate);
  if (days === null) return nextDueDate;
  if (days < 0) return `${nextDueDate} (${Math.abs(days)}d overdue)`;
  if (days === 0) return `${nextDueDate} (due today)`;
  return `${nextDueDate} (${days}d out)`;
}

export default async function FleetComplianceDriverComplianceDetailPage({ params }: { params: Params }) {
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

  const { personId } = await params;
  const driver = findDriver(data.drivers, personId);
  if (!driver) {
    notFound();
  }

  const suspense = getDriverSuspense(data.suspense, driver.personId);
  const documents = getDriverDocuments();
  const quality = getDriverSourceQuality(driver);
  const hazmatEmployeeIds = Array.from(
    new Set([driver.employeeId, driver.personId].map((value) => value.trim()).filter(Boolean)),
  );
  const hazmatRecords = await loadEmployeeHazmatTrainingRecords(orgId, hazmatEmployeeIds);
  const requiredHazmatRecords = hazmatRecords.filter((row) => row.moduleCategory === 'required');
  const supplementalHazmatRecords = hazmatRecords.filter((row) => row.moduleCategory !== 'required');
  const requiredCompleteCount = new Set(
    requiredHazmatRecords
      .filter((row) => row.status === 'complete')
      .map((row) => row.moduleCode),
  ).size;
  const hazmatEmployeeStatus = computeHazmatEmployeeStatus(hazmatRecords);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/compliance">Compliance</Link>
          <span>/</span>
          <span>{driver.driverName}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">
              {driver.employeeId}
              <span className={`fleet-compliance-quality-badge fleet-compliance-quality-${quality}`}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </span>
            </p>
            <h1>{driver.driverName}</h1>
          </div>
          <Link href="/fleet-compliance/compliance" className="btn-secondary">
            Back to Compliance
          </Link>
        </div>

        <div className="fleet-compliance-kv-grid">
          <article className="fleet-compliance-kv-card">
            <h3>Qualification timing</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>License State</dt>
                <dd>{driver.licenseState}</dd>
              </div>
              <div>
                <dt>CDL Class</dt>
                <dd>{driver.cdlClass}</dd>
              </div>
              <div>
                <dt>Medical Expiration</dt>
                <dd>
                  {driver.medicalExpiration} · {formatDueLabel(driver.medicalExpiration)}
                </dd>
              </div>
              <div>
                <dt>MVR Due</dt>
                <dd>
                  {driver.nextMvrDue} · {formatDueLabel(driver.nextMvrDue)}
                </dd>
              </div>
            </dl>
          </article>

          <article className="fleet-compliance-kv-card">
            <h3>Hazmat / clearinghouse</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>TSA Expiration</dt>
                <dd>
                  {driver.tsaExpiration} · {formatDueLabel(driver.tsaExpiration)}
                </dd>
              </div>
              <div>
                <dt>Hazmat Expiration</dt>
                <dd>
                  {driver.hazmatExpiration} · {formatDueLabel(driver.hazmatExpiration)}
                </dd>
              </div>
              <div>
                <dt>Clearinghouse Status</dt>
                <dd>{driver.clearinghouseStatus}</dd>
              </div>
            </dl>
          </article>
        </div>

        <InlineNoteEditor
          storageKey={`fleet-compliance:driver:note:${driver.personId}`}
          initialNote={driver.note}
          label="Notes"
        />

        <article className="fleet-compliance-list-card">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Hazmat Training</p>
              <h3>Module compliance profile</h3>
            </div>
            <Link href="/fleet-compliance/training/reports" className="btn-secondary">
              Open Hazmat Reports
            </Link>
          </div>
          <p className="fleet-compliance-pill">
            Status: {hazmatEmployeeStatus}
          </p>
          <p className="fleet-compliance-table-note">
            Required modules complete: {requiredCompleteCount}/{REQUIRED_HAZMAT_MODULE_COUNT}
          </p>

          {hazmatRecords.length === 0 ? (
            <p>No hazmat training module records found for this employee profile yet.</p>
          ) : (
            <>
              <div className="fleet-compliance-import-table">
                <table>
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Status</th>
                      <th>Completion</th>
                      <th>Due</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requiredHazmatRecords.map((row) => (
                      <tr key={row.id}>
                        <td>{row.moduleCode} · {row.moduleTitle}</td>
                        <td>{row.status.replace(/_/g, ' ')}</td>
                        <td>{row.completionDate || 'n/a'}</td>
                        <td>{renderDueLabel(row.nextDueDate)}</td>
                        <td>
                          {row.certificateUrl ? (
                            <a
                              href={`/api/v1/training/certificates?employee_id=${encodeURIComponent(row.employeeId)}&module_code=${encodeURIComponent(row.moduleCode)}`}
                              className="fleet-compliance-inline-link"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            'Missing'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {supplementalHazmatRecords.length > 0 && (
                <div className="fleet-compliance-import-table" style={{ marginTop: '1rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Supplemental Module</th>
                        <th>Status</th>
                        <th>Completion</th>
                        <th>Due</th>
                        <th>Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplementalHazmatRecords.map((row) => (
                        <tr key={row.id}>
                          <td>{row.moduleCode} · {row.moduleTitle}</td>
                          <td>{row.status.replace(/_/g, ' ')}</td>
                          <td>{row.completionDate || 'n/a'}</td>
                          <td>{renderDueLabel(row.nextDueDate)}</td>
                          <td>
                            {row.certificateUrl ? (
                              <a
                                href={`/api/v1/training/certificates?employee_id=${encodeURIComponent(row.employeeId)}&module_code=${encodeURIComponent(row.moduleCode)}`}
                                className="fleet-compliance-inline-link"
                                target="_blank"
                                rel="noreferrer"
                              >
                                View
                              </a>
                            ) : (
                              'Missing'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </article>

        <article className="fleet-compliance-list-card">
          <h3>Documents</h3>
          <ul>
            {documents.map((doc) => (
              <li key={doc.label}>
                <Link href={doc.href} className="fleet-compliance-inline-link">
                  {doc.label}
                </Link>
                {' '}· <span className="fleet-compliance-table-note">{doc.note}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="fleet-compliance-list-card">
          <h3>Linked suspense items</h3>
          {suspense.length ? (
            <ul>
              {suspense.map((item) => (
                <li key={item.suspenseItemId}>
                  <Link href={`/fleet-compliance/suspense/${encodeURIComponent(item.suspenseItemId)}`} className="fleet-compliance-inline-link">
                    {item.title}
                  </Link>{' '}
                  · {item.dueDate}
                </li>
              ))}
            </ul>
          ) : (
            <p>No suspense items are currently tied to this driver profile.</p>
          )}
        </div>
      </section>
    </main>
  );
}
