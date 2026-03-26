import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import FmcsaSnapshotCard from '@/components/fleet-compliance/FmcsaSnapshotCard';
import {
  loadFleetComplianceData,
  getFleetComplianceModuleSummary,
  fleetComplianceResourceLinks,
  getAssetStats,
  getComplianceStats,
  getImportStats,
  getSuspenseStats,
} from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';

const modules = [
  {
    href: '/fleet-compliance/assets',
    title: 'Assets',
    description: 'Fleet units, equipment, fuel cubes, skid tanks, and storage assets.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/compliance',
    title: 'Compliance',
    description: 'Permits, licenses, FMCSA, driver status, and renewal tracking.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/suspense',
    title: 'Suspense',
    description: 'Due-soon and overdue items with owner-level email alerts.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/fmcsa',
    title: 'FMCSA Lookup',
    description: 'Live carrier safety data by USDOT number via FMCSA Query Central API.',
    status: 'Live — key required',
  },
  {
    href: '/fleet-compliance/employees',
    title: 'Employees',
    description: 'Add employees, manage CDL/medical compliance, archive or view drivers.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/invoices',
    title: 'Invoices',
    description: 'Enter vendor invoices for maintenance, permits, fuel, and insurance.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/spend',
    title: 'Spend Dashboard',
    description: 'Track monthly spend across maintenance, permits, fuel, insurance, and other categories.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/alerts',
    title: 'Alerts',
    description: 'Compliance reminder emails grouped by owner. Vercel Cron at 08:00 UTC daily.',
    status: 'Engine live',
  },
  {
    href: '/fleet-compliance/settings/alerts',
    title: 'Alert Settings',
    description: 'Configure org name, from address, manager email, and alert thresholds.',
    status: 'Live',
  },
  {
    href: '/fleet-compliance/import',
    title: 'Import Review',
    description: 'Upload CSV/XLSX, validate rows, approve or reject per-row before committing.',
    status: 'Live',
  },
];

export default async function FleetCompliancePage() {
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <FleetComplianceErrorBoundary page="/fleet-compliance">
        <main className="fleet-compliance-shell">
          <section className="fleet-compliance-hero">
            <p className="fleet-compliance-eyebrow">Fleet-Compliance Module</p>
            <h1>Fleet-Compliance module requires Clerk to be configured.</h1>
            <p className="fleet-compliance-subcopy">Enable the existing auth environment to access protected Fleet-Compliance routes.</p>
          </section>
        </main>
      </FleetComplianceErrorBoundary>
    );
  }

  const { userId, orgId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  if (!orgId) {
    redirect('/');
  }

  const data = await loadFleetComplianceData(orgId);
  const fleetComplianceModuleSummary = getFleetComplianceModuleSummary(data);
  const assetStats = getAssetStats(data.assets);
  const complianceStats = getComplianceStats(data.drivers, data.permits);
  const suspenseStats = getSuspenseStats(data.suspense);
  const importStats = await getImportStats(orgId);

  const quickStats = [
    { label: 'Source Systems', value: String(fleetComplianceModuleSummary.sourceSystems), note: 'CSV, workbook, CFR, FMCSA' },
    { label: 'Planned Collections', value: String(fleetComplianceModuleSummary.plannedCollections), note: 'Firestore-ready layout' },
    { label: 'Alert Tracks', value: String(fleetComplianceModuleSummary.alertTracks), note: 'Hazmat, IRP, IFTA, UCR, MC150, licenses' },
    { label: 'Penny Corpus', value: fleetComplianceModuleSummary.pennyCorpus, note: 'Chunked CFR reference set' },
  ];

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-hero">
        <p className="fleet-compliance-eyebrow">Fleet-Compliance Operations</p>
        <h1>Protected command shell for assets, compliance, suspense, and CFR-backed Penny.</h1>
        <p className="fleet-compliance-subcopy">
          This route lives inside the current Pipeline Punks site, reuses Clerk, and keeps the visual system
          consistent with the existing product while the operational module is built out.
          The current view is now driven by an import snapshot generated from the workbook and mapped source files.
        </p>
        <div className="fleet-compliance-action-row">
          <Link href="/fleet-compliance/suspense" className="btn-primary">
            Open Suspense
          </Link>
          <Link href="/penny" className="btn-secondary">
            Open Penny
          </Link>
          <Link href="/fleet-compliance/fmcsa" className="btn-secondary">
            FMCSA Lookup
          </Link>
          <Link href="/fleet-compliance/employees/new" className="btn-secondary">
            Add Employee
          </Link>
          <Link href="/fleet-compliance/assets/new" className="btn-secondary">
            Add Asset
          </Link>
          <Link href="/fleet-compliance/invoices/new" className="btn-secondary">
            Add Invoice
          </Link>
          <Link href="/fleet-compliance/spend" className="btn-secondary">
            Spend Dashboard
          </Link>
          <Link href="/fleet-compliance/alerts" className="btn-secondary">
            Alerts
          </Link>
          <Link href="/fleet-compliance/import" className="btn-secondary">
            Import Review
          </Link>
          <Link href="/api/fleet-compliance/bulk-template" className="btn-secondary">
            Download Bulk Template
          </Link>
        </div>
      </section>

      <section className="fleet-compliance-stats">
        {quickStats.map((item) => (
          <article key={item.label} className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">{item.label}</p>
            <p className="fleet-compliance-stat-value">{item.value}</p>
            <p className="fleet-compliance-stat-note">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Operational Snapshot</p>
            <h2>Metrics</h2>
          </div>
          <p className="fleet-compliance-section-copy">These numbers are now driven by the imported Fleet-Compliance snapshot generated from your current source files.</p>
        </div>
        <div className="fleet-compliance-list-grid">
          <div className="fleet-compliance-list-card">
            <h3>Assets</h3>
            <ul>
              <li>{assetStats.total} assets staged across vehicles, tanks, cubes, and equipment.</li>
              <li>{assetStats.dueSoon} assets have a due date inside the next 30 days.</li>
              <li>{assetStats.maintenanceHold} asset is currently on maintenance hold.</li>
            </ul>
          </div>
          <div className="fleet-compliance-list-card">
            <h3>Compliance</h3>
            <ul>
              <li>{complianceStats.drivers} driver compliance records are wired into the data layer.</li>
              <li>{complianceStats.expiringWithin60Days} medical cards expire inside 60 days.</li>
              <li>{complianceStats.permitDeadlines} permit deadlines fall inside the next 120 days.</li>
            </ul>
          </div>
          <div className="fleet-compliance-list-card">
            <h3>Suspense</h3>
            <ul>
              <li>{suspenseStats.totalOpen} open suspense items are currently staged.</li>
              <li>{suspenseStats.next7Days} items hit in the next 7 days.</li>
              <li>{suspenseStats.highSeverity} high-severity alerts are already visible in the route.</li>
            </ul>
          </div>
          <div className="fleet-compliance-list-card">
            <h3>Live Links</h3>
            <ul>
              {fleetComplianceResourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>: {item.note}
                </li>
              ))}
            </ul>
          </div>
          <FmcsaSnapshotCard />
        </div>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Modules</p>
            <h2>First route shells</h2>
          </div>
          <p className="fleet-compliance-section-copy">These are the first protected surfaces for Fleet-Compliance inside the site.</p>
        </div>
        <div className="fleet-compliance-module-grid">
          {modules.map((module) => (
            <Link key={module.href} href={module.href} className="fleet-compliance-module-card">
              <p className="fleet-compliance-module-status">{module.status}</p>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Import Health</p>
            <h2>Last import snapshot</h2>
          </div>
          <p className="fleet-compliance-section-copy">Generated {importStats.generatedAt}. Run <code>py build_fleet_compliance_imports.py</code> from tooling/fleet-compliance-sentinel to refresh.</p>
        </div>
        <div className="fleet-compliance-import-table">
          <table>
            <thead>
              <tr>
                <th>Collection</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {importStats.collections.map((col) => (
                <tr key={col.name}>
                  <td>{col.name}</td>
                  <td>{col.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Build Shape</p>
            <h2>Current architecture</h2>
          </div>
        </div>
        <div className="fleet-compliance-list-grid">
          <div className="fleet-compliance-list-card">
            <h3>Now</h3>
            <ul>
              <li>Next.js site on Vercel</li>
              <li>Clerk auth reused for all protected routes</li>
              <li>Railway Penny backend retained</li>
              <li>Fleet-Compliance data layer wired into the site</li>
              <li>Bulk upload workbook export added</li>
            </ul>
          </div>
          <div className="fleet-compliance-list-card">
            <h3>Next</h3>
            <ul>
              <li>Validation-driven import review loop</li>
              <li>Suspense email reminders</li>
              <li>Firestore write path and Storage upload flow</li>
              <li>FMCSA lookup refactor</li>
            </ul>
          </div>
        </div>
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
