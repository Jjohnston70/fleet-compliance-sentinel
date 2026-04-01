import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import ModuleGatewayPanel from '@/components/fleet-compliance/ModuleGatewayPanel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Module Tools',
};

function normalizeRole(value: unknown): 'admin' | 'member' {
  if (typeof value !== 'string') return 'member';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 'member';
  const parts = trimmed.split(':').filter(Boolean);
  const canonical = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  return canonical === 'admin' ? 'admin' : 'member';
}

function resolveOrgRole(sessionClaims: any): 'admin' | 'member' {
  const candidates = [
    sessionClaims?.org_role,
    sessionClaims?.orgRole,
    sessionClaims?.o?.rol,
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);
    if (role === 'admin') return role;
  }
  return 'member';
}

export default async function FleetComplianceToolsPage() {
  if (!isClerkEnabled()) return null;

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const role = resolveOrgRole(sessionClaims);
  const isAdmin = role === 'admin';

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/tools" userId={userId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-hero">
          <p className="fleet-compliance-eyebrow">Module Gateway</p>
          <h1>Operator tools panel</h1>
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <span>Module Tools</span>
          </div>
          <p className="fleet-compliance-subcopy">
            Trigger module gateway runs, watch job status, and inspect output previews for integrated module actions.
          </p>
        </section>

        {isAdmin ? (
          <ModuleGatewayPanel />
        ) : (
          <section className="fleet-compliance-section">
            <div className="fleet-compliance-empty-state" style={{ marginTop: 0 }}>
              <h3>Admin role required</h3>
              <p>
                Module gateway run controls are restricted to organization admins. Your session can still view
                Fleet-Compliance operational pages.
              </p>
            </div>
          </section>
        )}
      </main>
    </FleetComplianceErrorBoundary>
  );
}
