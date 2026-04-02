import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import FleetComplianceOnboardingForm from '@/components/fleet-compliance/FleetComplianceOnboardingForm';
import { isClerkEnabled } from '@/lib/clerk';
import { ensureOrgProvisioned, getOrganizationContact } from '@/lib/org-provisioner';

export const dynamic = 'force-dynamic';

function readMetadataText(metadata: Record<string, unknown>, key: string): string {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

export default async function FleetComplianceOnboardingPage() {
  if (!isClerkEnabled()) {
    redirect('/');
  }

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const claimedOrgName = typeof sessionClaims?.org_name === 'string'
    ? sessionClaims.org_name
    : '';
  const org = await ensureOrgProvisioned(orgId, claimedOrgName || `Organization ${orgId}`, {
    adminUserId: userId,
  });
  const contact = await getOrganizationContact(orgId);

  if (org.onboardingComplete) {
    redirect('/fleet-compliance');
  }

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/onboarding" userId={userId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Fleet-Compliance Onboarding</p>
              <h1>Configure your organization</h1>
            </div>
          </div>
          <p className="fleet-compliance-subcopy">
            Complete these fields once to initialize your org profile and unlock the Fleet-Compliance import workflow.
          </p>

          <FleetComplianceOnboardingForm
            initialCompanyName={org.name}
            initialPrimaryContact={contact?.primaryContact || ''}
            initialPrimaryContactAddress={contact?.primaryContactAddress || ''}
            initialFleetSize={readMetadataText(org.metadata, 'fleetSize')}
            initialPrimaryDotConcern={readMetadataText(org.metadata, 'primaryDotConcern')}
          />
        </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}

