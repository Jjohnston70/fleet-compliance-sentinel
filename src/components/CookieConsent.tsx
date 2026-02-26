'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'pipeline_penny_cookie_consent_v1';

type ConsentChoice = 'accepted_all' | 'necessary_only';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = window.localStorage.getItem(CONSENT_KEY);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  function saveConsent(choice: ConsentChoice) {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        choice,
        acceptedAt: new Date().toISOString(),
      })
    );
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <aside className="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie and policy consent">
      <p>
        We use required cookies to run this site and optional analytics to improve it. By continuing, you accept our{' '}
        <Link href="/privacy">Privacy Policy</Link>, <Link href="/terms">Terms</Link>, and{' '}
        <Link href="/accessibility">Accessibility Statement</Link>.
      </p>
      <div className="consent-actions">
        <button type="button" className="btn-primary" onClick={() => saveConsent('accepted_all')}>
          Accept All
        </button>
        <button type="button" className="btn-secondary" onClick={() => saveConsent('necessary_only')}>
          Necessary Only
        </button>
      </div>
    </aside>
  );
}
