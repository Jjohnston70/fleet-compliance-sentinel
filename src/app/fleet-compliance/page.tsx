import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import FmcsaSnapshotCard from '@/components/fleet-compliance/FmcsaSnapshotCard';
import {
  loadFleetComplianceData,
  fleetComplianceResourceLinks,
  getAssetStats,
  getComplianceStats,
  getImportStats,
  getSuspenseStats,
} from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Dashboard',
};

const modules = [
  {
    href: '/fleet-compliance/telematics',
    title: 'Telematics',
    description: 'Live vehicle and driver risk scores from Verizon Connect Reveal. GPS activity, ELD status, and compliance flags.',
    status: 'Live',
  },
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
    status: 'Live — manual + PDF parse',
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
  const assetStats = getAssetStats(data.assets);
  const complianceStats = getComplianceStats(data.drivers, data.permits);
  const suspenseStats = getSuspenseStats(data.suspense);
  const importStats = await getImportStats(orgId);

  const quickStats = [
    { label: 'Tracked Assets', value: String(data.assets.length), note: 'Vehicles, equipment, tanks, and trailers', status: '' },
    { label: 'Driver Records', value: String(data.drivers.length), note: 'CDL and compliance profiles', status: '' },
    { label: 'Open Suspense', value: String(suspenseStats.totalOpen), note: `${suspenseStats.overdue} currently overdue`, status: suspenseStats.overdue > 5 ? 'stat-danger' : suspenseStats.overdue > 0 ? 'stat-warning' : '' },
    { label: 'Permit Records', value: String(data.permits.length), note: 'Renewals and filing cadence', status: '' },
  ];

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-hero">
        <p className="fleet-compliance-eyebrow">Fleet-Compliance Operations</p>
        <h1>Operational command center for assets, compliance, suspense, and telematics risk.</h1>
        <p className="fleet-compliance-subcopy">
          Review your fleet posture at a glance, then drill into module-specific pages for records, remediation, and alerts.
        </p>
      </section>

      <section className="fleet-compliance-stats">
        {quickStats.map((item) => (
          <article key={item.label} className={`fleet-compliance-stat-card ${item.status}`.trim()}>
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
          <p className="fleet-compliance-section-copy">Current compliance and activity totals from your connected Fleet-Compliance data sources.</p>
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
                  <Link href={item.href}>{item.label?.trim() || item.href}</Link>
                  {item.note ? `: ${item.note}` : null}
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
            <h2>Operational modules</h2>
          </div>
          <p className="fleet-compliance-section-copy">Each module is protected with Clerk auth and tied to your active organization context.</p>
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
            <p className="fleet-compliance-eyebrow">Data Coverage</p>
            <h2>Collection counts</h2>
          </div>
          <p className="fleet-compliance-section-copy">
            Snapshot refreshed {importStats.generatedAt || 'N/A'}.
            Source collections feed dashboard metrics, module pages, and alert previews.
          </p>
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
      </main>
    </FleetComplianceErrorBoundary>
  );
}
