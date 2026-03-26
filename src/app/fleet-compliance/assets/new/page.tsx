import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import AssetForm from '@/components/fleet-compliance/forms/AssetForm';

export const dynamic = 'force-dynamic';

export default async function NewAssetPage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/assets">Assets</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Assets</p>
            <h1>Add asset</h1>
          </div>
          <Link href="/fleet-compliance/assets" className="btn-secondary">Cancel</Link>
        </div>
        <AssetForm />
      </section>
    </main>
  );
}

