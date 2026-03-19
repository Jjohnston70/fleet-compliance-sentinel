import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import AssetForm from '@/components/chief/forms/AssetForm';

export const dynamic = 'force-dynamic';

export default async function NewAssetPage() {
  if (!isClerkEnabled()) return null;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/assets">Assets</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Assets</p>
            <h1>Add asset</h1>
          </div>
          <Link href="/chief/assets" className="btn-secondary">Cancel</Link>
        </div>
        <AssetForm />
      </section>
    </main>
  );
}
