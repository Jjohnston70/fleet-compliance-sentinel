import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { readFile } from 'node:fs/promises';
import {
  fetchRemoteModuleRun,
  isRecoverableRemoteGatewayStatus,
  shouldUseRemoteModuleGateway,
} from '@/lib/modules-gateway/remote';
import { getModuleRun, resolveModuleRunArtifact } from '@/lib/modules-gateway/runner';
import { fetchRemoteModuleArtifact } from '@/lib/modules-gateway/remote';
import { listModuleGatewayInvocationAudit, maybePersistModuleRunInsights } from '@/lib/modules-gateway/persistence';
import type { ModuleRunRecord } from '@/lib/modules-gateway/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

async function readRemoteArtifactJson(
  runId: string,
  artifactPath: string,
  orgId: string,
): Promise<Record<string, unknown> | null> {
  const { res } = await fetchRemoteModuleArtifact(runId, artifactPath, { orgId });
  if (!res.ok) return null;
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function persistRunInsights(
  orgId: string,
  run: ModuleRunRecord,
  useRemoteArtifacts: boolean,
): Promise<void> {
  try {
    await maybePersistModuleRunInsights({
      orgId,
      run,
      readArtifactJson: (artifactPath: string) =>
        useRemoteArtifacts
          ? readRemoteArtifactJson(run.id, artifactPath, orgId)
          : readLocalArtifactJson(run.id, artifactPath),
    });
  } catch (error) {
    console.error('[module-gateway] failed to persist run insights', {
      orgId,
      runId: run.id,
      moduleId: run.moduleId,
      actionId: run.actionId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function loadRunAudit(runId: string, orgId: string) {
  return listModuleGatewayInvocationAudit(runId, orgId);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let orgId = '';
  try {
    const authContext = await requireFleetComplianceOrgWithRole(request, 'admin');
    orgId = authContext.orgId;
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
      const { res, body } = await fetchRemoteModuleRun(runId, { orgId });
      if (res.ok && body && typeof body === 'object' && (body as { ok?: unknown }).ok === true) {
        const run = (body as { run?: unknown }).run as ModuleRunRecord | undefined;
        if (run && orgId) {
          if (typeof run.orgId === 'string' && run.orgId.length > 0 && run.orgId === orgId) {
            await persistRunInsights(orgId, run, true);
            const audit = await loadRunAudit(run.id, orgId);
            return Response.json({ ...body, audit }, { status: res.status });
          }
          console.warn('[module-gateway] remote run metadata invalid for current org, falling back to local status', {
            runId,
            remoteOrgId: run.orgId,
            orgId,
          });
        }
      } else if (!isRecoverableRemoteGatewayStatus(res.status)) {
        return Response.json(
          body || {
            ok: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: `Remote module gateway status lookup failed with HTTP ${res.status}`,
            },
          },
          { status: res.status },
        );
      }

      console.warn('[module-gateway] remote status unavailable, falling back to local status', {
        runId,
        httpStatus: res.status,
      });
    } catch (error: unknown) {
      console.warn('[module-gateway] remote status fetch failed, falling back to local status', {
        runId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const run = getModuleRun(runId);
  if (!run) {
    return Response.json(
      { ok: false, error: { code: 'MODULE_NOT_FOUND', message: `Run '${runId}' was not found` } },
      { status: 404 },
    );
  }

  if (run.orgId !== orgId) {
    return Response.json(
      { ok: false, error: { code: 'TENANT_ISOLATION_VIOLATION', message: 'Run belongs to another organization' } },
      { status: 403 },
    );
  }

  if (orgId) {
    await persistRunInsights(orgId, run, false);
  }
  const audit = await loadRunAudit(run.id, orgId);
  return Response.json({ ok: true, run, audit }, { status: 200 });
}
