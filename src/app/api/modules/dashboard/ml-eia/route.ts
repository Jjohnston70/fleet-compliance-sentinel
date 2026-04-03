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
import type { ModuleRunRecord } from '@/lib/modules-gateway/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseRunId(request: Request): string {
  const url = new URL(request.url);
  return (url.searchParams.get('runId') || '').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMetric(value: unknown, digits = 3): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return value.toFixed(digits);
}

function buildDashboardHtml(input: {
  runId: string;
  snapshot: Record<string, unknown> | null;
  alerts: Record<string, unknown> | null;
  forecasts: Array<Record<string, unknown>>;
}): string {
  const regime = (input.snapshot?.regime || {}) as Record<string, unknown>;
  const alertsArray = Array.isArray(input.alerts?.alerts) ? (input.alerts.alerts as Array<Record<string, unknown>>) : [];
  const alertCount =
    typeof input.alerts?.alert_count === 'number'
      ? input.alerts.alert_count
      : alertsArray.length;

  const forecastRows = input.forecasts
    .map((doc) => {
      const series = Array.isArray(doc.forecast) ? doc.forecast : [];
      const lastPoint = series.length > 0 ? (series[series.length - 1] as Record<string, unknown>) : null;
      return {
        product: typeof doc.product === 'string' ? doc.product : '-',
        horizonDays: typeof doc.horizon_days === 'number' ? doc.horizon_days : null,
        lastDate: typeof lastPoint?.date === 'string' ? lastPoint.date : null,
        point: typeof lastPoint?.point === 'number' ? lastPoint.point : null,
        ci80Low: typeof lastPoint?.ci_80_low === 'number' ? lastPoint.ci_80_low : null,
        ci80High: typeof lastPoint?.ci_80_high === 'number' ? lastPoint.ci_80_high : null,
      };
    })
    .sort((a, b) => a.product.localeCompare(b.product));

  const alertRows = alertsArray.slice(0, 20).map((alert) => ({
    severity: typeof alert.severity === 'string' ? alert.severity : '-',
    product: typeof alert.product === 'string' ? alert.product : '-',
    type: typeof alert.type === 'string' ? alert.type : '-',
    message: typeof alert.message === 'string' ? alert.message : '-',
    date: typeof alert.date === 'string' ? alert.date : '-',
  }));

  const generatedAt =
    (typeof input.snapshot?.generated_at === 'string' && input.snapshot.generated_at)
    || (typeof input.alerts?.generated_at === 'string' && input.alerts.generated_at)
    || new Date().toISOString();
  const strategy = (input.snapshot?.pricing_strategy as Record<string, unknown> | undefined)?.overall_recommendation;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ML-EIA Dashboard ${escapeHtml(input.runId)}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 24px; color: #0f172a; background: #f8fafc; }
      h1, h2 { margin: 0 0 10px 0; color: #1e3a5f; }
      p, li { line-height: 1.45; }
      .meta { color: #475569; margin-bottom: 18px; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
      .card { border: 1px solid #dbe3ee; border-radius: 10px; background: white; padding: 12px; min-width: 0; }
      .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
      .value { font-size: 20px; font-weight: 700; color: #0f172a; word-break: break-word; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; background: white; border: 1px solid #dbe3ee; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
      th { background: #eff6ff; color: #1e3a5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      code { background: #e2e8f0; border-radius: 6px; padding: 2px 6px; font-size: 12px; display: inline-block; }
      .small { font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <h1>ML-EIA Operator Dashboard</h1>
    <p class="meta">Run <code>${escapeHtml(input.runId)}</code> · Generated ${escapeHtml(generatedAt)}</p>

    <div class="grid">
      <div class="card">
        <div class="label">Regime</div>
        <div class="value">${escapeHtml(String(regime.current_regime || '-'))}</div>
      </div>
      <div class="card">
        <div class="label">Days In Regime</div>
        <div class="value">${escapeHtml(String(regime.days_in_regime ?? '-'))}</div>
      </div>
      <div class="card">
        <div class="label">Pricing Strategy</div>
        <div class="value">${escapeHtml(String(strategy || '-'))}</div>
      </div>
      <div class="card">
        <div class="label">Alerts</div>
        <div class="value">${escapeHtml(String(alertCount))}</div>
      </div>
      <div class="card">
        <div class="label">Volatility 20d</div>
        <div class="value">${escapeHtml(formatMetric(regime.volatility_20d))}</div>
      </div>
      <div class="card">
        <div class="label">Transition Probability</div>
        <div class="value">${escapeHtml(formatMetric(regime.transition_probability))}</div>
      </div>
    </div>

    <h2>Forecast Snapshot</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Horizon</th>
          <th>Last Point Date</th>
          <th>Point</th>
          <th>CI80 Low</th>
          <th>CI80 High</th>
        </tr>
      </thead>
      <tbody>
        ${forecastRows.length > 0
          ? forecastRows
              .map(
                (row) => `<tr>
                  <td>${escapeHtml(row.product)}</td>
                  <td>${escapeHtml(row.horizonDays ? `${row.horizonDays}d` : '-')}</td>
                  <td>${escapeHtml(row.lastDate || '-')}</td>
                  <td>${escapeHtml(formatMetric(row.point, 4))}</td>
                  <td>${escapeHtml(formatMetric(row.ci80Low, 4))}</td>
                  <td>${escapeHtml(formatMetric(row.ci80High, 4))}</td>
                </tr>`,
              )
              .join('')
          : '<tr><td colspan="6">No forecast artifacts found.</td></tr>'}
      </tbody>
    </table>

    <h2 style="margin-top:16px;">Active Alerts</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Product</th>
          <th>Type</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${alertRows.length > 0
          ? alertRows
              .map(
                (row) => `<tr>
                  <td>${escapeHtml(row.severity)}</td>
                  <td>${escapeHtml(row.product)}</td>
                  <td>${escapeHtml(row.type)}</td>
                  <td>${escapeHtml(row.message)}</td>
                  <td>${escapeHtml(row.date)}</td>
                </tr>`,
              )
              .join('')
          : '<tr><td colspan="5">No active alerts found.</td></tr>'}
      </tbody>
    </table>

    <p class="small" style="margin-top:14px;">Source artifacts: analysis_snapshot.json, active_alerts.json, output/forecasts/*.json</p>
  </body>
</html>`;
}

async function getRunRecord(runId: string, orgId: string): Promise<ModuleRunRecord | null> {
  if (shouldUseRemoteModuleGateway()) {
    try {
      const { res, body } = await fetchRemoteModuleRun(runId, { orgId });
      if (res.ok && body && typeof body === 'object' && (body as { ok?: unknown }).ok === true) {
        const run = (body as { run?: unknown }).run as ModuleRunRecord | undefined;
        if (run && typeof run.orgId === 'string' && run.orgId.length > 0 && run.orgId === orgId) {
          return run;
        }
      }
      if (!isRecoverableRemoteGatewayStatus(res.status)) return null;
      console.warn('[module-gateway] remote ML-EIA run lookup unavailable, falling back to local run lookup', {
        runId,
        httpStatus: res.status,
      });
    } catch (error) {
      console.warn('[module-gateway] remote ML-EIA run lookup failed, falling back to local run lookup', {
        runId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return getModuleRun(runId);
}

async function readRemoteJson(
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

async function readLocalJson(runId: string, artifactPath: string): Promise<Record<string, unknown> | null> {
  const absolutePath = resolveModuleRunArtifact(runId, artifactPath);
  if (!absolutePath) return null;
  try {
    const raw = await readFile(absolutePath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function readArtifactJson(
  runId: string,
  artifactPath: string,
  orgId: string,
): Promise<Record<string, unknown> | null> {
  if (shouldUseRemoteModuleGateway()) {
    try {
      const remoteDoc = await readRemoteJson(runId, artifactPath, orgId);
      if (remoteDoc) return remoteDoc;
      console.warn('[module-gateway] remote ML-EIA artifact unavailable, falling back to local artifact lookup', {
        runId,
        artifactPath,
      });
    } catch (error) {
      console.warn('[module-gateway] remote ML-EIA artifact fetch failed, falling back to local artifact lookup', {
        runId,
        artifactPath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return readLocalJson(runId, artifactPath);
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

  const runId = parseRunId(request);
  if (!runId) {
    return Response.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'runId is required' } },
      { status: 400 },
    );
  }

  const run = await getRunRecord(runId, orgId);
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

  if (run.moduleId !== 'ML-EIA-PETROLEUM-INTEL') {
    return Response.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: `Run '${runId}' is not an ML-EIA run` } },
      { status: 400 },
    );
  }

  const artifactPaths = run.artifacts.map((artifact) => artifact.path);
  const snapshotPath = artifactPaths.find((candidate) => /analysis_snapshot\.json$/i.test(candidate));
  const alertsPath = artifactPaths.find((candidate) => /active_alerts\.json$/i.test(candidate));
  const forecastPaths = artifactPaths.filter((candidate) => /[\\/]forecasts[\\/].+\.json$/i.test(candidate));

  if (!snapshotPath && !alertsPath && forecastPaths.length === 0) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'MODULE_NOT_FOUND',
          message: 'No ML-EIA JSON artifacts were found for dashboard rendering',
        },
      },
      { status: 404 },
    );
  }

  const [snapshot, alerts, forecastDocs] = await Promise.all([
    snapshotPath ? readArtifactJson(runId, snapshotPath, orgId) : Promise.resolve(null),
    alertsPath ? readArtifactJson(runId, alertsPath, orgId) : Promise.resolve(null),
    Promise.all(forecastPaths.map((forecastPath) => readArtifactJson(runId, forecastPath, orgId))),
  ]);

  const html = buildDashboardHtml({
    runId,
    snapshot,
    alerts,
    forecasts: forecastDocs.filter((doc): doc is Record<string, unknown> => Boolean(doc)),
  });

  const fileName = `ml_eia_dashboard_${path.basename(runId)}.html`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
