import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import SuspenseItemForm from '@/components/fleet-compliance/forms/SuspenseItemForm';

export const dynamic = 'force-dynamic';

export default async function NewSuspenseItemPage() {
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
          <Link href="/fleet-compliance/suspense">Suspense</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Suspense</p>
            <h1>Add suspense item</h1>
          </div>
          <Link href="/fleet-compliance/suspense" className="btn-secondary">Cancel</Link>
        </div>
        <SuspenseItemForm />
      </section>
    </main>
  );
}

