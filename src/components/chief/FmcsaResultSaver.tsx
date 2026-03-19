'use client';

import { useEffect } from 'react';
import type { FmcsaCarrierSummary } from '@/lib/chief-fmcsa-client';

const STORAGE_KEY = 'chief:fmcsa:last';

export default function FmcsaResultSaver({ carrier }: { carrier: FmcsaCarrierSummary }) {
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ carrier, savedAt: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  }, [carrier]);

  return null;
}
