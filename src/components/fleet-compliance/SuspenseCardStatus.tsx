'use client';

import { useState, useEffect } from 'react';
import { readSuspenseResolution } from '@/lib/fleet-compliance-ui-state';

export default function SuspenseCardStatus({ suspenseItemId }: { suspenseItemId: string }) {
  const [resolved, setResolved] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const stored = readSuspenseResolution(suspenseItemId);
    if (stored) {
      setResolved(stored.resolved);
      setNote(stored.note);
    }
  }, [suspenseItemId]);

  if (!resolved) return null;

  return (
    <span className="fleet-compliance-resolved-badge" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
      Resolved{note ? ` — ${note}` : ''}
    </span>
  );
}
