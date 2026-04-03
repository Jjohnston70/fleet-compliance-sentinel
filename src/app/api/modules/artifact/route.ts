import path from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  fetchRemoteModuleArtifact,
  fetchRemoteModuleRun,
  isRecoverableRemoteGatewayStatus,
  shouldUseRemoteModuleGateway,
} from '@/lib/modules-gateway/remote';
import { getModuleRun, resolveModuleRunArtifact } from '@/lib/modules-gateway/runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mediaTypeForArtifactPath(artifactPath: string): string {
  const ext = path.extname(artifactPath).toLowerCase();
  if (ext === '.zip') return 'application/zip';
  if (ext === '.html' || ext === '.htm') return 'text/html; charset=utf-8';
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.txt' || ext === '.log') return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
}

function dispositionForArtifactPath(artifactPath: string): 'inline' | 'attachment' {
  const ext = path.extname(artifactPath).toLowerCase();
  if (ext === '.html' || ext === '.htm' || ext === '.json' || ext === '.txt' || ext === '.log') {
    return 'inline';
  }
  return 'attachment';
}

function parseQuery(request: Request): { runId: string; artifactPath: string } | null {
  const url = new URL(request.url);
  const runId = (url.searchParams.get('runId') || '').trim();
  const artifactPath = (url.searchParams.get('path') || '').trim();
  if (!runId || !artifactPath) return null;
  return { runId, artifactPath };
}

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

  const parsed = parseQuery(request);
  if (!parsed) {
    return Response.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'runId and path are required' } },
      { status: 400 },
    );
  }

  const fileName = path.basename(parsed.artifactPath);
  const fallbackContentType = mediaTypeForArtifactPath(parsed.artifactPath);
  const disposition = dispositionForArtifactPath(parsed.artifactPath);

  if (shouldUseRemoteModuleGateway()) {
    try {
      const runResponse = await fetchRemoteModuleRun(parsed.runId, { orgId });
      if (runResponse.res.ok && runResponse.body && typeof runResponse.body === 'object' && (runResponse.body as { ok?: unknown }).ok === true) {
        const remoteRun = (runResponse.body as { run?: unknown }).run as { orgId?: string } | undefined;
        if (remoteRun && typeof remoteRun.orgId === 'string' && remoteRun.orgId.length > 0 && remoteRun.orgId === orgId) {
          const { res } = await fetchRemoteModuleArtifact(parsed.runId, parsed.artifactPath, { orgId });
          if (res.ok) {
            const data = await res.arrayBuffer();
            return new Response(data, {
              status: 200,
              headers: {
                'Content-Type': res.headers.get('content-type') || fallbackContentType,
                'Content-Disposition': `${disposition}; filename="${fileName}"`,
                'Cache-Control': 'no-store',
              },
            });
          }

          if (!isRecoverableRemoteGatewayStatus(res.status)) {
            let body: unknown = null;
            try {
              body = await res.json();
            } catch {
              body = null;
            }
            return Response.json(
              body || { ok: false, error: { code: 'MODULE_NOT_FOUND', message: 'Artifact was not found' } },
              { status: res.status },
            );
          }

          console.warn('[module-gateway] remote artifact unavailable, falling back to local artifact lookup', {
            runId: parsed.runId,
            artifactPath: parsed.artifactPath,
            httpStatus: res.status,
          });
        } else {
          console.warn('[module-gateway] remote artifact run metadata invalid for current org, falling back to local artifact lookup', {
            runId: parsed.runId,
            orgId,
            remoteOrgId: remoteRun?.orgId || null,
          });
        }
      } else if (!isRecoverableRemoteGatewayStatus(runResponse.res.status)) {
        return Response.json(
          runResponse.body || { ok: false, error: { code: 'MODULE_NOT_FOUND', message: 'Run was not found' } },
          { status: runResponse.res.status },
        );
      }

      console.warn('[module-gateway] remote artifact run lookup unavailable, falling back to local artifact lookup', {
        runId: parsed.runId,
        httpStatus: runResponse.res.status,
      });
    } catch (error: unknown) {
      console.warn('[module-gateway] remote artifact lookup failed, falling back to local artifact lookup', {
        runId: parsed.runId,
        artifactPath: parsed.artifactPath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const run = getModuleRun(parsed.runId);
  if (run && run.orgId !== orgId) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'TENANT_ISOLATION_VIOLATION',
          message: `Artifact '${parsed.artifactPath}' is not accessible for this organization`,
        },
      },
      { status: 403 },
    );
  }
  const absolutePath = resolveModuleRunArtifact(parsed.runId, parsed.artifactPath);
  if (!absolutePath) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'MODULE_NOT_FOUND',
          message: `Artifact '${parsed.artifactPath}' was not found for run '${parsed.runId}'`,
        },
      },
      { status: 404 },
    );
  }

  const buffer = await readFile(absolutePath);
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': fallbackContentType,
      'Content-Disposition': `${disposition}; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
