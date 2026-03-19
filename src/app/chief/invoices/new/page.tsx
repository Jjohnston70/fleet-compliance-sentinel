import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import InvoiceForm from '@/components/chief/forms/InvoiceForm';

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage() {
  if (!isClerkEnabled()) return null;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/invoices">Invoices</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Invoices</p>
            <h1>Add invoice</h1>
          </div>
          <Link href="/chief/invoices" className="btn-secondary">Cancel</Link>
        </div>
        <InvoiceForm />
      </section>
    </main>
  );
}
