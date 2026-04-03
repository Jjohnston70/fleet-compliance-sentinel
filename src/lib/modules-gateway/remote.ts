import type { ModuleRunRequest } from '@/lib/modules-gateway/types';
import { createHmac } from 'node:crypto';

const DEFAULT_RAILWAY_MODULE_GATEWAY_URL = 'https://pipeline-punks-v2-production.up.railway.app';
const TRUTHY_ENV_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSY_ENV_VALUES = new Set(['0', 'false', 'no', 'off']);

export interface RemoteGatewayTenantContext {
  orgId: string;
  userId?: string;
  requestId?: string;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function parseExplicitRemoteMode(): boolean | null {
  const explicit = process.env.MODULE_GATEWAY_USE_REMOTE?.trim().toLowerCase();
  if (!explicit) return null;
  if (TRUTHY_ENV_VALUES.has(explicit)) return true;
  if (FALSY_ENV_VALUES.has(explicit)) return false;
  return null;
}

function resolveRemoteBaseUrl(): string | null {
  const configured = (
    process.env.MODULE_GATEWAY_REMOTE_URL
    || ''
  ).trim();
  if (configured) return trimTrailingSlash(configured);

  const explicit = parseExplicitRemoteMode();
  if (explicit === true) {
    return DEFAULT_RAILWAY_MODULE_GATEWAY_URL;
  }
  return null;
}

function resolveRemoteApiKey(): string | null {
  const configured = (
    process.env.MODULE_GATEWAY_REMOTE_API_KEY
    || process.env.PENNY_API_KEY
    || ''
  ).trim();
  return configured || null;
}

function buildTenantHeaders(context?: RemoteGatewayTenantContext): Record<string, string> {
  if (!context || !context.orgId) return {};
  const headers: Record<string, string> = {
    'X-Fleet-Org-Id': context.orgId,
  };
  if (context.userId) headers['X-Fleet-User-Id'] = context.userId;
  if (context.requestId) headers['X-Fleet-Request-Id'] = context.requestId;

  const signingSecret = (process.env.MODULE_GATEWAY_REMOTE_SIGNING_SECRET || '').trim();
  if (!signingSecret) return headers;

  const timestamp = String(Math.floor(Date.now() / 1000));
  const payload = `${context.orgId}:${context.userId || ''}:${timestamp}:${context.requestId || ''}`;
  const signature = createHmac('sha256', signingSecret).update(payload).digest('hex');
  headers['X-Fleet-Timestamp'] = timestamp;
  headers['X-Fleet-Signature'] = signature;
  return headers;
}

function headersWithAuth(contentType = false, tenantContext?: RemoteGatewayTenantContext): HeadersInit {
  const headers: Record<string, string> = {};
  const key = resolveRemoteApiKey();
  if (key) {
    headers['X-Penny-Api-Key'] = key;
  }
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  return {
    ...headers,
    ...buildTenantHeaders(tenantContext),
  };
}

function buildRemoteUrl(pathname: string): string {
  const base = resolveRemoteBaseUrl() || DEFAULT_RAILWAY_MODULE_GATEWAY_URL;
  return `${trimTrailingSlash(base)}${pathname}`;
}

export function shouldUseRemoteModuleGateway(): boolean {
  const explicit = parseExplicitRemoteMode();
  if (explicit !== null) return explicit;
  if (resolveRemoteBaseUrl()) return true;
  return false;
}

export function isRecoverableRemoteGatewayStatus(status: number): boolean {
  return status === 401
    || status === 403
    || status === 404
    || status === 408
    || status === 429
    || status === 500
    || status === 502
    || status === 503
    || status === 504;
}

async function readJsonSafe(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRemoteModuleCatalog() {
  const res = await fetch(buildRemoteUrl('/modules/catalog'), {
    method: 'GET',
    headers: headersWithAuth(false),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  const body = await readJsonSafe(res);
  return { res, body };
}

export async function startRemoteModuleRun(input: ModuleRunRequest, tenantContext?: RemoteGatewayTenantContext) {
  const payload: ModuleRunRequest & {
    context?: {
      orgId: string;
      userId?: string;
      requestId?: string;
    };
  } = {
    ...input,
  };
  if (tenantContext?.orgId) {
    payload.context = {
      orgId: tenantContext.orgId,
      userId: tenantContext.userId,
      requestId: tenantContext.requestId,
    };
  }

  const res = await fetch(buildRemoteUrl('/modules/run'), {
    method: 'POST',
    headers: headersWithAuth(true, tenantContext),
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  const body = await readJsonSafe(res);
  return { res, body };
}

export async function fetchRemoteModuleRun(runId: string, tenantContext?: RemoteGatewayTenantContext) {
  const encoded = encodeURIComponent(runId);
  const res = await fetch(buildRemoteUrl(`/modules/status/${encoded}`), {
    method: 'GET',
    headers: headersWithAuth(false, tenantContext),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  const body = await readJsonSafe(res);
  return { res, body };
}

export async function fetchRemoteModuleArtifact(
  runId: string,
  artifactPath: string,
  tenantContext?: RemoteGatewayTenantContext,
) {
  const encodedRunId = encodeURIComponent(runId);
  const encodedPath = encodeURIComponent(artifactPath);
  const res = await fetch(buildRemoteUrl(`/modules/artifact/${encodedRunId}?path=${encodedPath}`), {
    method: 'GET',
    headers: headersWithAuth(false, tenantContext),
    cache: 'no-store',
    signal: AbortSignal.timeout(60_000),
  });
  return { res };
}
