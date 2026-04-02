import type { ModuleRunRequest } from '@/lib/modules-gateway/types';
import { createHmac } from 'node:crypto';

const DEFAULT_RAILWAY_MODULE_GATEWAY_URL = 'https://pipeline-punks-v2-production.up.railway.app';

export interface RemoteGatewayTenantContext {
  orgId: string;
  userId?: string;
  requestId?: string;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveRemoteBaseUrl(): string | null {
  const configured = (
    process.env.MODULE_GATEWAY_REMOTE_URL
    || process.env.PENNY_API_URL
    || process.env.RAILWAY_SYNC_URL
    || ''
  ).trim();
  if (!configured) return null;
  return trimTrailingSlash(configured);
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
  const explicit = process.env.MODULE_GATEWAY_USE_REMOTE?.trim().toLowerCase();
  if (explicit === '1' || explicit === 'true' || explicit === 'yes' || explicit === 'on') return true;
  if (explicit === '0' || explicit === 'false' || explicit === 'no' || explicit === 'off') return false;
  if (resolveRemoteBaseUrl()) return true;
  if ((process.env.NODE_ENV || '').toLowerCase() !== 'production') return false;
  return Boolean(resolveRemoteApiKey());
}

export async function fetchRemoteModuleCatalog() {
  const res = await fetch(buildRemoteUrl('/modules/catalog'), {
    method: 'GET',
    headers: headersWithAuth(false),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.json();
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
  const body = await res.json();
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
  const body = await res.json();
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
