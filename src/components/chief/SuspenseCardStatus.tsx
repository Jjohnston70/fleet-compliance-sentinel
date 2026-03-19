'use client';

import { useState, useEffect } from 'react';

export default function SuspenseCardStatus({ suspenseItemId }: { suspenseItemId: string }) {
  const [resolved, setResolved] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`chief:suspense:resolved:${suspenseItemId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setResolved(parsed.resolved ?? false);
        setNote(parsed.note ?? '');
      }
    } catch {
      // ignore
    }
  }, [suspenseItemId]);

  if (!resolved) return null;

  return (
    <span className="chief-resolved-badge" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
      Resolved{note ? ` — ${note}` : ''}
    </span>
  );
}
