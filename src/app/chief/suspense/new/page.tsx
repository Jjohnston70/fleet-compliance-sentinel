import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import SuspenseItemForm from '@/components/chief/forms/SuspenseItemForm';

export const dynamic = 'force-dynamic';

export default async function NewSuspenseItemPage() {
  if (!isClerkEnabled()) return null;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/suspense">Suspense</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Suspense</p>
            <h1>Add suspense item</h1>
          </div>
          <Link href="/chief/suspense" className="btn-secondary">Cancel</Link>
        </div>
        <SuspenseItemForm />
      </section>
    </main>
  );
}
