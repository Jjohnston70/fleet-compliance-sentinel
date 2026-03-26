import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import {
  ensureFleetComplianceErrorEventsTable,
  insertFleetComplianceErrorEvent,
} from '@/lib/fleet-compliance-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ClientErrorPayload = {
  page?: unknown;
  message?: unknown;
  stack?: unknown;
  timestamp?: unknown;
  url?: unknown;
};

function clampText(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export async function POST(request: Request) {
  let orgId: string;
  let userId: string;
  try {
    ({ orgId, userId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ClientErrorPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const message = clampText(body.message, 2000);
  if (!message) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  const page = clampText(body.page, 512);
  const stack = clampText(body.stack, 4000);
  const url = clampText(body.url, 1000);
  const userAgent = clampText(request.headers.get('user-agent') ?? null, 512);

  try {
    await ensureFleetComplianceErrorEventsTable();
    await insertFleetComplianceErrorEvent({
      orgId,
      userId,
      page,
      message,
      stack,
      userAgent,
      url,
    });
    auditLog({
      action: 'data.write',
      userId,
      orgId,
      resourceType: 'fleet-compliance.error-event',
      metadata: {
        collection: 'fleet_compliance_error_events',
        inserted: 1,
      },
    });
    return Response.json({ status: 'ok' });
  } catch (error: unknown) {
    console.error('[fleet-compliance-errors-client] failed:', error);
    auditLog({
      action: 'data.write',
      userId,
      orgId,
      resourceType: 'fleet-compliance.error-event',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Failed to record error' }, { status: 500 });
  }
}
