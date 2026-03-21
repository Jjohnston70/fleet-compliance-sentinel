import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import EmployeeForm from '@/components/chief/forms/EmployeeForm';

export const dynamic = 'force-dynamic';

export default async function NewEmployeePage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/employees">Employees</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Employees</p>
            <h1>Add employee</h1>
          </div>
          <Link href="/chief/employees" className="btn-secondary">Cancel</Link>
        </div>
        <EmployeeForm />
      </section>
    </main>
  );
}

