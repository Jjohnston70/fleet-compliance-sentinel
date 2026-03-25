import { ensureChiefTables } from '@/lib/chief-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireChiefOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureChiefTables();
    auditLog({
      action: 'admin.action',
      userId,
      orgId,
      resourceType: 'chief.import.setup',
      metadata: {
        action: 'ensureChiefTables',
      },
    });
    return Response.json({ status: 'ok', message: 'Chief tables created successfully' });
  } catch (err: unknown) {
    console.error('[chief-import-setup] failed:', err);
    auditLog({
      action: 'admin.action',
      userId,
      orgId,
      resourceType: 'chief.import.setup',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Setup failed' }, { status: 500 });
  }
}
