import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FmcsaSnapshotCard from '@/components/chief/FmcsaSnapshotCard';
import {
  chiefOrganizationName,
  chiefModuleSummary,
  chiefResourceLinks,
  getChiefAssetStats,
  getChiefComplianceStats,
  getChiefImportStats,
  getChiefSuspenseStats,
} from '@/lib/chief-demo-data';

export const dynamic = 'force-dynamic';

const modules = [
  {
    href: '/chief/assets',
    title: 'Assets',
    description: 'Fleet units, equipment, fuel cubes, skid tanks, and storage assets.',
    status: 'Live',
  },
  {
    href: '/chief/compliance',
    title: 'Compliance',
    description: 'Permits, licenses, FMCSA, driver status, and renewal tracking.',
    status: 'Live',
  },
  {
    href: '/chief/suspense',
    title: 'Suspense',
    description: 'Due-soon and overdue items with owner-level email alerts.',
    status: 'Live',
  },
  {
    href: '/chief/fmcsa',
    title: 'FMCSA Lookup',
    description: 'Live carrier safety data by USDOT number via FMCSA Query Central API.',
    status: 'Live — key required',
  },
  {
    href: '/chief/employees',
    title: 'Employees',
    description: 'Add employees, manage CDL/medical compliance, archive or view drivers.',
    status: 'Live',
  },
  {
    href: '/chief/invoices',
    title: 'Invoices',
    description: 'Enter vendor invoices for maintenance, permits, fuel, and insurance.',
    status: 'Live',
  },
  {
    href: '/chief/alerts',
    title: 'Alerts',
    description: 'Compliance reminder emails grouped by owner. Vercel Cron at 08:00 UTC daily.',
    status: 'Engine live',
  },
  {
    href: '/chief/settings/alerts',
    title: 'Alert Settings',
    description: 'Configure org name, from address, manager email, and alert thresholds.',
    status: 'Live',
  },
  {
    href: '/chief/import',
    title: 'Import Review',
    description: 'Upload CSV/XLSX, validate rows, approve or reject per-row before committing.',
    status: 'Live',
  },
  {
    href: '/resources',
    title: 'Resources',
    description: 'Protected Google Drive manuals, certificates, and supporting files.',
    status: 'Already live',
  },
];

export default async function ChiefPage() {
  const assetStats = getChiefAssetStats();
  const complianceStats = getChiefComplianceStats();
  const suspenseStats = getChiefSuspenseStats();
  const importStats = getChiefImportStats();
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <main className="chief-shell">
        <section className="chief-hero">
          <p className="chief-eyebrow">Chief Module</p>
          <h1>Chief module requires Clerk to be configured.</h1>
          <p className="chief-subcopy">Enable the existing auth environment to access protected Chief routes.</p>
        </section>
      </main>
    );
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const quickStats = [
    { label: 'Source Systems', value: String(chiefModuleSummary.sourceSystems), note: 'CSV, workbook, CFR, FMCSA' },
    { label: 'Planned Collections', value: String(chiefModuleSummary.plannedCollections), note: 'Firestore-ready layout' },
    { label: 'Alert Tracks', value: String(chiefModuleSummary.alertTracks), note: 'Hazmat, IRP, IFTA, UCR, MC150, licenses' },
    { label: 'Penny Corpus', value: chiefModuleSummary.pennyCorpus, note: 'Chunked CFR reference set' },
  ];

  return (
    <main className="chief-shell">
      <section className="chief-hero">
        <p className="chief-eyebrow">{chiefOrganizationName}</p>
        <h1>Protected command shell for assets, compliance, suspense, and CFR-backed Penny.</h1>
        <p className="chief-subcopy">
          This route lives inside the current Pipeline Punks site, reuses Clerk, and keeps the visual system
          consistent with the existing product while the operational module is built out.
          The current view is now driven by an import snapshot generated from the workbook and mapped source files.
        </p>
        <div className="chief-action-row">
          <Link href="/chief/suspense" className="btn-primary">
            Open Suspense
          </Link>
          <Link href="/penny" className="btn-secondary">
            Open Penny
          </Link>
          <Link href="/chief/fmcsa" className="btn-secondary">
            FMCSA Lookup
          </Link>
          <Link href="/chief/employees/new" className="btn-secondary">
            Add Employee
          </Link>
          <Link href="/chief/assets/new" className="btn-secondary">
            Add Asset
          </Link>
          <Link href="/chief/invoices/new" className="btn-secondary">
            Add Invoice
          </Link>
          <Link href="/chief/alerts" className="btn-secondary">
            Alerts
          </Link>
          <Link href="/chief/import" className="btn-secondary">
            Import Review
          </Link>
          <Link href="/api/chief/bulk-template" className="btn-secondary">
            Download Bulk Template
          </Link>
          <Link href="/resources" className="btn-secondary">
            Open Resources
          </Link>
        </div>
      </section>

      <section className="chief-stats">
        {quickStats.map((item) => (
          <article key={item.label} className="chief-stat-card">
            <p className="chief-stat-label">{item.label}</p>
            <p className="chief-stat-value">{item.value}</p>
            <p className="chief-stat-note">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Operational Snapshot</p>
            <h2>Metrics</h2>
          </div>
          <p className="chief-section-copy">These numbers are now driven by the imported Chief snapshot generated from your current source files.</p>
        </div>
        <div className="chief-list-grid">
          <div className="chief-list-card">
            <h3>Assets</h3>
            <ul>
              <li>{assetStats.total} assets staged across vehicles, tanks, cubes, and equipment.</li>
              <li>{assetStats.dueSoon} assets have a due date inside the next 30 days.</li>
              <li>{assetStats.maintenanceHold} asset is currently on maintenance hold.</li>
            </ul>
          </div>
          <div className="chief-list-card">
            <h3>Compliance</h3>
            <ul>
              <li>{complianceStats.drivers} driver compliance records are wired into the data layer.</li>
              <li>{complianceStats.expiringWithin60Days} medical cards expire inside 60 days.</li>
              <li>{complianceStats.permitDeadlines} permit deadlines fall inside the next 120 days.</li>
            </ul>
          </div>
          <div className="chief-list-card">
            <h3>Suspense</h3>
            <ul>
              <li>{suspenseStats.totalOpen} open suspense items are currently staged.</li>
              <li>{suspenseStats.next7Days} items hit in the next 7 days.</li>
              <li>{suspenseStats.highSeverity} high-severity alerts are already visible in the route.</li>
            </ul>
          </div>
          <div className="chief-list-card">
            <h3>Live Links</h3>
            <ul>
              {chiefResourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>: {item.note}
                </li>
              ))}
            </ul>
          </div>
          <FmcsaSnapshotCard />
        </div>
      </section>

      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Modules</p>
            <h2>First route shells</h2>
          </div>
          <p className="chief-section-copy">These are the first protected surfaces for Chief inside the site.</p>
        </div>
        <div className="chief-module-grid">
          {modules.map((module) => (
            <Link key={module.href} href={module.href} className="chief-module-card">
              <p className="chief-module-status">{module.status}</p>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Import Health</p>
            <h2>Last import snapshot</h2>
          </div>
          <p className="chief-section-copy">Generated {importStats.generatedAt}. Run <code>py build_chief_imports.py</code> from tooling/chief-sentinel to refresh.</p>
        </div>
        <div className="chief-import-table">
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

      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Build Shape</p>
            <h2>Current architecture</h2>
          </div>
        </div>
        <div className="chief-list-grid">
          <div className="chief-list-card">
            <h3>Now</h3>
            <ul>
              <li>Next.js site on Vercel</li>
              <li>Clerk auth reused for all protected routes</li>
              <li>Railway Penny backend retained</li>
              <li>Google Drive resources retained</li>
              <li>Chief data layer wired into the site</li>
              <li>Bulk upload workbook export added</li>
            </ul>
          </div>
          <div className="chief-list-card">
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
  );
}
