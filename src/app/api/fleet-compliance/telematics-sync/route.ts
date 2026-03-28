import { timingSafeEqual } from 'crypto';
import { ensureCronLogTable, insertCronLogEntry } from '@/lib/fleet-compliance-db';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const DEFAULT_RAILWAY_SYNC_URL = 'https://pipeline-punks-v2-production.up.railway.app';

interface TelematicsSyncBackendResponse {
  status?: string;
  records_written?: number;
  vehicles?: number;
  drivers?: number;
  gps_events?: number;
  flags?: string[];
  stdout_tail?: string;
  error?: string;
}

function isTimingSafeTokenMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function parseBackendPayload(payload: TelematicsSyncBackendResponse) {
  const flags = Array.isArray(payload.flags)
    ? payload.flags.filter((value): value is string => typeof value === 'string')
    : [];

  return {
    recordsWritten: Number(payload.records_written ?? 0),
    vehicles: Number(payload.vehicles ?? 0),
    drivers: Number(payload.drivers ?? 0),
    gpsEvents: Number(payload.gps_events ?? 0),
    flags,
    status: payload.status ?? 'success',
  };
}

export async function GET(request: Request) {
  const jobName = 'telematics-sync';
  const authHeader = request.headers.get('authorization') ?? '';
  const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
  const acceptedCronSecrets = [process.env.TELEMATICS_CRON_SECRET, process.env.CRON_SECRET]
    .filter((value): value is string => Boolean(value && value.trim().length > 0));
  const isCronInvocation = provided.length > 0
    && acceptedCronSecrets.some((secret) => isTimingSafeTokenMatch(provided, secret));

  if (!isCronInvocation) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureCronLogTable();
  } catch (error: unknown) {
    console.error('[telematics-sync] failed to ensure cron log table:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  try {
    const pennyApiKey = process.env.PENNY_API_KEY;
    if (!pennyApiKey) {
      throw new Error('PENNY_API_KEY is not set');
    }

    const railwayBaseUrl = (process.env.RAILWAY_SYNC_URL || DEFAULT_RAILWAY_SYNC_URL).replace(/\/+$/, '');
    const response = await fetch(`${railwayBaseUrl}/telematics/sync`, {
      method: 'POST',
      headers: {
        'X-Penny-Api-Key': pennyApiKey,
      },
      signal: AbortSignal.timeout(240_000),
      cache: 'no-store',
    });

    let payload: TelematicsSyncBackendResponse = {};
    try {
      payload = (await response.json()) as TelematicsSyncBackendResponse;
    } catch {
      payload = {};
    }

    const parsed = parseBackendPayload(payload);

    if (!response.ok || parsed.status === 'error') {
      throw new Error(payload.error || `Railway sync failed with HTTP ${response.status}`);
    }

    await insertCronLogEntry({
      jobName,
      orgId: null,
      status: 'success',
      message: `Synced ${parsed.vehicles} vehicles, ${parsed.drivers} drivers, ${parsed.gpsEvents} GPS events.`,
      recordsProcessed: parsed.recordsWritten,
    });

    auditLog({
      action: 'cron.run',
      userId: 'system',
      orgId: 'system',
      resourceType: 'fleet-compliance.telematics.sync',
      metadata: {
        invocation: 'cron',
        recordsWritten: parsed.recordsWritten,
        vehicles: parsed.vehicles,
        drivers: parsed.drivers,
        gpsEvents: parsed.gpsEvents,
        flagsCount: parsed.flags.length,
      },
      severity: 'info',
    });

    return Response.json({
      status: 'success',
      recordsWritten: parsed.recordsWritten,
      vehicles: parsed.vehicles,
      drivers: parsed.drivers,
      gpsEvents: parsed.gpsEvents,
      flags: parsed.flags,
      ranAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('[telematics-sync] cron invocation failed:', error);

    auditLog({
      action: 'cron.failed',
      userId: 'system',
      orgId: 'system',
      resourceType: 'fleet-compliance.telematics.sync',
      severity: 'error',
      metadata: {
        invocation: 'cron',
      },
    });

    try {
      await insertCronLogEntry({
        jobName,
        orgId: null,
        status: 'error',
        message: 'Telematics sync failed',
        recordsProcessed: 0,
      });
    } catch (logError: unknown) {
      console.error('[telematics-sync] failed to write cron_log entry:', logError);
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
