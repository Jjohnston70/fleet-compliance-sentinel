'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { listRecords, type LocalSuspenseItem } from '@/lib/fleet-compliance-local-store';
import SuspenseItemForm from '@/components/fleet-compliance/forms/SuspenseItemForm';

export default function EditSuspenseItemPage() {
  const { suspenseItemId } = useParams<{ suspenseItemId: string }>();
  const [record, setRecord] = useState<LocalSuspenseItem | null | undefined>(undefined);

  useEffect(() => {
    const all = listRecords<LocalSuspenseItem>('fleet-compliance:store:suspense');
    const found = all.find((r) => r.id === suspenseItemId) ?? null;
    setRecord(found);
  }, [suspenseItemId]);

  if (record === undefined) return null;

  if (!record) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-empty-state">
            <h3>Record not found</h3>
            <p>This item was not found in local storage. Only locally created suspense items can be edited here.</p>
            <Link href="/fleet-compliance/suspense" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Back to Suspense
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/suspense">Suspense</Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Suspense</p>
            <h1>Edit suspense item</h1>
          </div>
          <Link href="/fleet-compliance/suspense" className="btn-secondary">Cancel</Link>
        </div>
        <SuspenseItemForm initial={record} />
      </section>
    </main>
  );
}
