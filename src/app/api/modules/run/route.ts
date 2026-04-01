import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { shouldUseRemoteModuleGateway, startRemoteModuleRun } from '@/lib/modules-gateway/remote';
import { buildValidationError, startModuleRun, startModuleRunAndWait } from '@/lib/modules-gateway/runner';
import type { ModuleRunRequest } from '@/lib/modules-gateway/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseRunRequest(body: unknown): { ok: true; data: ModuleRunRequest } | { ok: false; error: string } {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const moduleId = body.moduleId;
  const actionId = body.actionId;

  if (typeof moduleId !== 'string' || moduleId.trim().length === 0) {
    return { ok: false, error: 'moduleId is required' };
  }
  if (typeof actionId !== 'string' || actionId.trim().length === 0) {
    return { ok: false, error: 'actionId is required' };
  }

  const args = isPlainObject(body.args) ? body.args : {};
  const correlationId =
    typeof body.correlationId === 'string' && body.correlationId.trim().length > 0
      ? body.correlationId
      : undefined;
  const timeoutMs = typeof body.timeoutMs === 'number' ? body.timeoutMs : undefined;
  const dryRun = typeof body.dryRun === 'boolean' ? body.dryRun : undefined;

  return {
    ok: true,
    data: {
      moduleId: moduleId.trim(),
      actionId: actionId.trim(),
      args,
      correlationId,
      timeoutMs,
      dryRun,
    },
  };
}

export async function POST(request: Request) {
  let userId = 'system';
  try {
    const authContext = await requireFleetComplianceOrgWithRole(request, 'admin');
    userId = authContext.userId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  let jsonBody: unknown;
  try {
    jsonBody = await request.json();
  } catch {
    const error = buildValidationError('Request body must be valid JSON');
    return Response.json({ ok: false, error }, { status: 400 });
  }

  const parsed = parseRunRequest(jsonBody);
  if (!parsed.ok) {
    const error = buildValidationError(parsed.error);
    return Response.json({ ok: false, error }, { status: 400 });
  }
  
  const shouldExecuteLocally = parsed.data.moduleId === 'command-center';

  if (shouldUseRemoteModuleGateway() && !shouldExecuteLocally) {
    try {
      const { res, body } = await startRemoteModuleRun(parsed.data);
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

  const result = shouldExecuteLocally
    ? await startModuleRunAndWait(parsed.data, userId)
    : startModuleRun(parsed.data, userId);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.httpStatus });
  }

  const responseStatus = result.run.status === 'queued' ? 202 : 200;
  return Response.json({ ok: true, run: result.run }, { status: responseStatus });
}

