'use client';

import { useEffect } from 'react';
import type { FmcsaCarrierSummary } from '@/lib/fleet-compliance-fmcsa-client';
import { writeFmcsaSnapshot } from '@/lib/fleet-compliance-ui-state';

export default function FmcsaResultSaver({ carrier }: { carrier: FmcsaCarrierSummary }) {
  useEffect(() => {
    writeFmcsaSnapshot({
      carrier,
      savedAt: new Date().toISOString(),
    });
  }, [carrier]);

  return null;
}
