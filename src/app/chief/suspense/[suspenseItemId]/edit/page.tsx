'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { listRecords, type LocalSuspenseItem } from '@/lib/chief-local-store';
import SuspenseItemForm from '@/components/chief/forms/SuspenseItemForm';

export default function EditSuspenseItemPage() {
  const { suspenseItemId } = useParams<{ suspenseItemId: string }>();
  const [record, setRecord] = useState<LocalSuspenseItem | null | undefined>(undefined);

  useEffect(() => {
    const all = listRecords<LocalSuspenseItem>('chief:store:suspense');
    const found = all.find((r) => r.id === suspenseItemId) ?? null;
    setRecord(found);
  }, [suspenseItemId]);

  if (record === undefined) return null;

  if (!record) {
    return (
      <main className="chief-shell">
        <section className="chief-section">
          <div className="chief-empty-state">
            <h3>Record not found</h3>
            <p>This item was not found in local storage. Only locally created suspense items can be edited here.</p>
            <Link href="/chief/suspense" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Back to Suspense
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/suspense">Suspense</Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Suspense</p>
            <h1>Edit suspense item</h1>
          </div>
          <Link href="/chief/suspense" className="btn-secondary">Cancel</Link>
        </div>
        <SuspenseItemForm initial={record} />
      </section>
    </main>
  );
}
