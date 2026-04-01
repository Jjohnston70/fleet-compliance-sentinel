import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { listCommandCenterCatalog } from '@/lib/modules-gateway/persistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let orgId = '';
  try {
    const authContext = await requireFleetComplianceOrgWithRole(request, 'admin');
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  const rows = await listCommandCenterCatalog(orgId);
  return Response.json({ ok: true, tools: rows }, { status: 200 });
}

