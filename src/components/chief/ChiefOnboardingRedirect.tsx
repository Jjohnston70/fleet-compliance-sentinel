'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface ChiefOnboardingRedirectProps {
  onboardingComplete: boolean;
  children: React.ReactNode;
}

export default function ChiefOnboardingRedirect({
  onboardingComplete,
  children,
}: ChiefOnboardingRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const onOnboardingRoute = pathname === '/chief/onboarding';

  useEffect(() => {
    if (!onboardingComplete && !onOnboardingRoute) {
      router.replace('/chief/onboarding');
    }
  }, [onboardingComplete, onOnboardingRoute, router]);

  if (!onboardingComplete && !onOnboardingRoute) {
    return (
      <main className="chief-shell">
        <section className="chief-section">
          <p className="chief-subcopy">Redirecting to onboarding...</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

