import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import EmployeeForm from '@/components/fleet-compliance/forms/EmployeeForm';

export const dynamic = 'force-dynamic';

export default async function NewEmployeePage() {
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
          <Link href="/fleet-compliance/employees">Employees</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Employees</p>
            <h1>Add employee</h1>
          </div>
          <Link href="/fleet-compliance/employees" className="btn-secondary">Cancel</Link>
        </div>
        <EmployeeForm />
      </section>
    </main>
  );
}

