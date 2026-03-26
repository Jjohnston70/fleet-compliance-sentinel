'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface FleetComplianceOnboardingRedirectProps {
  onboardingComplete: boolean;
  children: React.ReactNode;
}

export default function FleetComplianceOnboardingRedirect({
  onboardingComplete,
  children,
}: FleetComplianceOnboardingRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const onOnboardingRoute = pathname === '/fleet-compliance/onboarding';

  useEffect(() => {
    if (!onboardingComplete && !onOnboardingRoute) {
      router.replace('/fleet-compliance/onboarding');
    }
  }, [onboardingComplete, onOnboardingRoute, router]);

  if (!onboardingComplete && !onOnboardingRoute) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <p className="fleet-compliance-subcopy">Redirecting to onboarding...</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

