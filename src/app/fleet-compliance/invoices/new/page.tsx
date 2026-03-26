import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import InvoiceForm from '@/components/fleet-compliance/forms/InvoiceForm';

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage() {
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
        <InvoiceForm />
      </section>
    </main>
  );
}

