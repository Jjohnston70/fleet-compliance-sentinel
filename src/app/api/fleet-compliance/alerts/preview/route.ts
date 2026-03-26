import { previewFleetComplianceAlerts } from '@/lib/fleet-compliance-alert-engine';
import { loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns a preview of what the alert sweep would send without actually sending anything.
// Protected by Clerk auth.
export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await loadFleetComplianceData(orgId);
  const preview = previewFleetComplianceAlerts(data.suspense);
  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'fleet-compliance.alerts.preview',
    metadata: {
      collection: 'suspense_items',
      recordCount: data.suspense.length,
      queuedCount: preview.alertItems.length,
    },
  });
  return Response.json({
    ...preview,
    dryRun: true,
    emailProviderConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}
