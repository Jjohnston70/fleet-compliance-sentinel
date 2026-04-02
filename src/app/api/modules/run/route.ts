import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { shouldUseRemoteModuleGateway, startRemoteModuleRun } from '@/lib/modules-gateway/remote';
import {
  buildValidationError,
  enforceModuleRunRateLimit,
  resolveModuleRunArtifact,
  startModuleRun,
  startModuleRunAndWait,
} from '@/lib/modules-gateway/runner';
import {
  appendModuleGatewayInvocationAudit,
  buildCommandCenterAclPayload,
  evaluateCommandCenterToolAcl,
  evaluateModuleGatewayAcl,
  maybePersistModuleRunInsights,
} from '@/lib/modules-gateway/persistence';
import type { ModuleRunRecord, ModuleRunRequest } from '@/lib/modules-gateway/types';
import { readFile } from 'node:fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function readLocalArtifactJson(runId: string, artifactPath: string): Promise<Record<string, unknown> | null> {
  const absolutePath = resolveModuleRunArtifact(runId, artifactPath);
  if (!absolutePath) return null;
  try {
    const raw = await readFile(absolutePath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function persistRunInsights(orgId: string, run: ModuleRunRecord): Promise<void> {
  try {
    await maybePersistModuleRunInsights({
      orgId,
      run,
      readArtifactJson: (artifactPath: string) => readLocalArtifactJson(run.id, artifactPath),
    });
  } catch (error) {
    console.error('[module-gateway] failed to persist run insights from run endpoint', {
      orgId,
      runId: run.id,
      moduleId: run.moduleId,
      actionId: run.actionId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

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
  const requestId = request.headers.get('x-request-id')?.trim() || `req_${Date.now()}`;
  let userId = 'system';
  let orgId = '';
  try {
    const authContext = await requireFleetComplianceOrgContext(request);
    if (authContext.role !== 'admin') {
      return Response.json(
        { ok: false, error: { code: 'PERMISSION_DENIED', message: 'Forbidden' } },
        { status: 403 },
      );
    }
    userId = authContext.userId;
    orgId = authContext.orgId;
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
  if (!parsed.data.correlationId) {
    parsed.data.correlationId = requestId;
  }

  const actionDecision = await evaluateModuleGatewayAcl({
    orgId,
    userId,
    moduleId: parsed.data.moduleId,
    actionId: parsed.data.actionId,
    permission: 'execute',
  });
  if (!actionDecision.allowed) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Action '${parsed.data.actionId}' is not permitted for module '${parsed.data.moduleId}'`,
          details: ['Module/tool ACL denied this action for the current org/user context.'],
        },
      },
      { status: 403 },
    );
  }

  if (parsed.data.moduleId === 'command-center' && parsed.data.actionId === 'route.tool_call') {
    const qualifiedName = typeof parsed.data.args.qualifiedName === 'string'
      ? parsed.data.args.qualifiedName.trim()
      : '';
    if (!qualifiedName) {
      return Response.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'route.tool_call requires args.qualifiedName',
          },
        },
        { status: 400 },
      );
    }

    const toolDecision = await evaluateCommandCenterToolAcl({
      orgId,
      userId,
      qualifiedName,
      permission: 'execute',
    });
    if (!toolDecision.allowed) {
      return Response.json(
        {
          ok: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: `Tool '${qualifiedName}' is not permitted in this org/user context`,
            details: ['Module/tool ACL denied command-center route.tool_call execution.'],
          },
        },
        { status: 403 },
      );
    }
  }

  if (
    parsed.data.moduleId === 'command-center'
    && (
      parsed.data.actionId === 'discover.modules'
      || parsed.data.actionId === 'discover.tools'
      || parsed.data.actionId === 'search.tools'
      || parsed.data.actionId === 'route.tool_call'
    )
  ) {
    const permission = parsed.data.actionId === 'route.tool_call' ? 'execute' : 'view';
    const aclPayload = await buildCommandCenterAclPayload({
      orgId,
      userId,
      permission,
    });
    parsed.data.args = {
      ...parsed.data.args,
      acl: {
        allowedModuleIds: aclPayload.allowedModuleIds,
        allowedQualifiedNames: aclPayload.allowedQualifiedNames,
      },
    };
  }
  
  const shouldExecuteLocally = parsed.data.moduleId === 'command-center';

  if (shouldUseRemoteModuleGateway() && !shouldExecuteLocally) {
    const rateLimitDecision = enforceModuleRunRateLimit({
      orgId,
      userId,
      moduleId: parsed.data.moduleId,
      actionId: parsed.data.actionId,
    });
    if (!rateLimitDecision.ok) {
      return Response.json({ ok: false, error: rateLimitDecision.error }, { status: rateLimitDecision.httpStatus });
    }

    try {
      const { res, body } = await startRemoteModuleRun(parsed.data, { orgId, userId, requestId });
      const remoteRun = (body && typeof body === 'object' && 'run' in body)
        ? (body.run as Partial<ModuleRunRecord> | undefined)
        : undefined;
      const remoteStatus = remoteRun?.status;
      const normalizedStatus = (
        remoteStatus === 'queued'
        || remoteStatus === 'running'
        || remoteStatus === 'success'
        || remoteStatus === 'fail'
      ) ? remoteStatus : 'queued';

      await appendModuleGatewayInvocationAudit({
        runId: remoteRun?.id || `remote_${requestId}`,
        eventType: 'remote_dispatch',
        requestId,
        orgId,
        userId,
        moduleId: parsed.data.moduleId,
        actionId: parsed.data.actionId,
        qualifiedName: `${parsed.data.moduleId}.${parsed.data.actionId}`,
        status: normalizedStatus,
        attempt: typeof remoteRun?.attemptCount === 'number' && remoteRun.attemptCount > 0 ? remoteRun.attemptCount : 0,
        maxAttempts: typeof remoteRun?.maxAttempts === 'number' && remoteRun.maxAttempts > 0 ? remoteRun.maxAttempts : 1,
        correlationId: parsed.data.correlationId || requestId,
        timeoutMs: typeof remoteRun?.timeoutMs === 'number' ? remoteRun.timeoutMs : (parsed.data.timeoutMs || 0),
        dryRun: Boolean(parsed.data.dryRun),
        durationMs: typeof remoteRun?.durationMs === 'number' ? remoteRun.durationMs : null,
        errorCode: remoteRun?.error?.code || null,
        errorMessage: remoteRun?.error?.message || null,
        args: parsed.data.args,
        result: remoteRun?.result || null,
        details: remoteRun?.error?.details || remoteRun?.error?.fieldErrors || null,
      });
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
    ? await startModuleRunAndWait(parsed.data, userId, orgId)
    : startModuleRun(parsed.data, userId, orgId);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.httpStatus });
  }

  if (orgId && result.run.status !== 'queued') {
    await persistRunInsights(orgId, result.run);
  }

  const responseStatus = result.run.status === 'queued' ? 202 : 200;
  return Response.json({ ok: true, run: result.run }, { status: responseStatus });
}

