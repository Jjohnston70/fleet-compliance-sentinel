import type { ModuleRunRequest } from '@/lib/modules-gateway/types';

const DEFAULT_RAILWAY_MODULE_GATEWAY_URL = 'https://pipeline-punks-v2-production.up.railway.app';

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

function headersWithAuth(contentType = false): HeadersInit {
  const headers: Record<string, string> = {};
  const key = resolveRemoteApiKey();
  if (key) {
    headers['X-Penny-Api-Key'] = key;
  }
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
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

export async function startRemoteModuleRun(input: ModuleRunRequest) {
  const res = await fetch(buildRemoteUrl('/modules/run'), {
    method: 'POST',
    headers: headersWithAuth(true),
    body: JSON.stringify(input),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.json();
  return { res, body };
}

export async function fetchRemoteModuleRun(runId: string) {
  const encoded = encodeURIComponent(runId);
  const res = await fetch(buildRemoteUrl(`/modules/status/${encoded}`), {
    method: 'GET',
    headers: headersWithAuth(false),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.json();
  return { res, body };
}
