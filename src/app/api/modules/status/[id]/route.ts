import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { fetchRemoteModuleRun, shouldUseRemoteModuleGateway } from '@/lib/modules-gateway/remote';
import { getModuleRun } from '@/lib/modules-gateway/runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireFleetComplianceOrgWithRole(request, 'admin');
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id: runId } = await context.params;
  if (!runId) {
    return Response.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Run id is required' } },
      { status: 400 },
    );
  }

  if (shouldUseRemoteModuleGateway()) {
    try {
      const { res, body } = await fetchRemoteModuleRun(runId);
      return Response.json(body, { status: res.status });
    } catch (error: unknown) {
      return Response.json(
        {
          ok: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Remote module gateway unavailable',
          },
        },
        { status: 502 },
      );
    }
  }

  const run = getModuleRun(runId);
  if (!run) {
    return Response.json(
      { ok: false, error: { code: 'MODULE_NOT_FOUND', message: `Run '${runId}' was not found` } },
      { status: 404 },
    );
  }

  return Response.json({ ok: true, run }, { status: 200 });
}
