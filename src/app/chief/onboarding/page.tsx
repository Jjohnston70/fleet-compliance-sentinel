import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ChiefErrorBoundary from '@/components/chief/ChiefErrorBoundary';
import ChiefOnboardingForm from '@/components/chief/ChiefOnboardingForm';
import { isClerkEnabled } from '@/lib/clerk';
import { ensureOrgProvisioned, getOrganizationContact } from '@/lib/org-provisioner';

export const dynamic = 'force-dynamic';

function readMetadataText(metadata: Record<string, unknown>, key: string): string {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

export default async function ChiefOnboardingPage() {
  if (!isClerkEnabled()) {
    redirect('/');
  }

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const claimedOrgName = typeof sessionClaims?.org_name === 'string'
    ? sessionClaims.org_name
    : '';
  const org = await ensureOrgProvisioned(orgId, claimedOrgName || `Organization ${orgId}`);
  const contact = await getOrganizationContact(orgId);

  if (org.onboardingComplete) {
    redirect('/chief');
  }

  return (
    <ChiefErrorBoundary page="/chief/onboarding" userId={userId}>
      <main className="chief-shell">
        <section className="chief-section">
          <div className="chief-section-head">
            <div>
              <p className="chief-eyebrow">Chief Onboarding</p>
              <h1>Configure your organization</h1>
            </div>
          </div>
          <p className="chief-subcopy">
            Complete these fields once to initialize your org profile and unlock the Chief import workflow.
          </p>

          <ChiefOnboardingForm
            initialCompanyName={org.name}
            initialPrimaryContact={contact?.primaryContact || ''}
            initialFleetSize={readMetadataText(org.metadata, 'fleetSize')}
            initialPrimaryDotConcern={readMetadataText(org.metadata, 'primaryDotConcern')}
          />
        </section>
      </main>
    </ChiefErrorBoundary>
  );
}
