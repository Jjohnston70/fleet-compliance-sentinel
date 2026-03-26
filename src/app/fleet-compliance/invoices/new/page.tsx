import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import {
  FleetComplianceAuthError,
  requireFleetComplianceOrg,
} from '@/lib/fleet-compliance-auth';
import { loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import InvoiceUploadAndForm from '@/components/fleet-compliance/forms/InvoiceUploadAndForm';

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage() {
  if (!isClerkEnabled()) return null;
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(new Request('http://localhost/fleet-compliance/invoices/new')));
  } catch (error: unknown) {
    if (error instanceof FleetComplianceAuthError) {
      if (error.status === 401) redirect('/sign-in');
      if (error.status === 403) redirect('/');
    }
    throw error;
  }

  const data = await loadFleetComplianceData(orgId);
  const dedupedAssets = new Map<string, { assetId: string; label: string }>();
  for (const asset of data.assets) {
    if (!asset.assetId) continue;
    const row = asset as unknown as { unitNumber?: unknown; assetName?: unknown };
    const label =
      (typeof row.unitNumber === 'string' && row.unitNumber.trim()) ||
      (typeof row.assetName === 'string' && row.assetName.trim()) ||
      asset.name ||
      asset.assetId;
    if (!dedupedAssets.has(asset.assetId)) {
      dedupedAssets.set(asset.assetId, {
        assetId: asset.assetId,
        label,
      });
    }
  }
  const orgAssets = Array.from(dedupedAssets.values()).sort((a, b) => a.assetId.localeCompare(b.assetId));

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/invoices">Invoices</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Invoices</p>
            <h1>Add invoice</h1>
          </div>
          <Link href="/fleet-compliance/invoices" className="btn-secondary">Cancel</Link>
        </div>
        <InvoiceUploadAndForm orgAssets={orgAssets} />
      </section>
    </main>
  );
}
