import { getSQL } from '@/lib/fleet-compliance-db';
import type { ModuleRunRecord } from '@/lib/modules-gateway/types';

export interface MlEiaAlertRecord {
  severity: string;
  product: string;
  type: string;
  message: string;
  date: string;
}

export interface MlEiaForecastSummary {
  product: string;
  lastDate: string | null;
  point: number | null;
  ci80Low: number | null;
  ci80High: number | null;
}

export interface MlEiaLatestInsight {
  runId: string;
  generatedAt: string | null;
  regime: string | null;
  strategy: string | null;
  alertCount: number;
  alerts: MlEiaAlertRecord[];
  forecasts: MlEiaForecastSummary[];
  snapshot: Record<string, unknown> | null;
}

export interface CommandCenterDiscoveredTool {
  qualifiedName: string;
  moduleId: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface CommandCenterCatalogRow {
  qualifiedName: string;
  moduleId: string;
  toolName: string;
  description: string | null;
  parameters: Record<string, unknown>;
  discoveredRunId: string | null;
  discoveredAt: string;
  updatedAt: string;
}

let ensured = false;

async function ensureModuleGatewayPersistenceTables(): Promise<void> {
  if (ensured) return;
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS module_gateway_ml_eia_insights (
      id BIGSERIAL PRIMARY KEY,
      org_id TEXT NOT NULL,
      run_id TEXT NOT NULL UNIQUE,
      generated_at TIMESTAMPTZ,
      regime TEXT,
      strategy TEXT,
      alert_count INTEGER NOT NULL DEFAULT 0,
      snapshot JSONB,
      alerts JSONB,
      forecasts JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_module_gateway_ml_eia_org_generated
    ON module_gateway_ml_eia_insights (org_id, generated_at DESC, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS module_gateway_command_center_tools (
      org_id TEXT NOT NULL,
      qualified_name TEXT NOT NULL,
      module_id TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      description TEXT,
      parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
      discovered_run_id TEXT,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (org_id, qualified_name)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_module_gateway_command_center_org_discovered
    ON module_gateway_command_center_tools (org_id, discovered_at DESC)
  `;

  ensured = true;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseIsoDate(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

export async function upsertMlEiaInsightRecord(input: {
  orgId: string;
  runId: string;
  generatedAt: string | null;
  regime: string | null;
  strategy: string | null;
  alertCount: number;
  snapshot: Record<string, unknown> | null;
  alerts: Record<string, unknown> | null;
  forecasts: MlEiaForecastSummary[];
}): Promise<void> {
  await ensureModuleGatewayPersistenceTables();
  const sql = getSQL();

  const generatedAtIso = input.generatedAt ? parseIsoDate(input.generatedAt) : '';
  const generatedAt = generatedAtIso || null;

  await sql`
    INSERT INTO module_gateway_ml_eia_insights (
      org_id,
      run_id,
      generated_at,
      regime,
      strategy,
      alert_count,
      snapshot,
      alerts,
      forecasts
    ) VALUES (
      ${input.orgId},
      ${input.runId},
      ${generatedAt},
      ${input.regime},
      ${input.strategy},
      ${input.alertCount},
      ${JSON.stringify(input.snapshot || null)}::jsonb,
      ${JSON.stringify(input.alerts || null)}::jsonb,
      ${JSON.stringify(input.forecasts || [])}::jsonb
    )
    ON CONFLICT (run_id) DO UPDATE SET
      org_id = EXCLUDED.org_id,
      generated_at = EXCLUDED.generated_at,
      regime = EXCLUDED.regime,
      strategy = EXCLUDED.strategy,
      alert_count = EXCLUDED.alert_count,
      snapshot = EXCLUDED.snapshot,
      alerts = EXCLUDED.alerts,
      forecasts = EXCLUDED.forecasts,
      updated_at = NOW()
  `;
}

export async function loadLatestMlEiaInsight(orgId: string): Promise<MlEiaLatestInsight | null> {
  await ensureModuleGatewayPersistenceTables();
  const sql = getSQL();

  const rows = await sql`
    SELECT
      run_id,
      generated_at,
      regime,
      strategy,
      alert_count,
      snapshot,
      alerts,
      forecasts
    FROM module_gateway_ml_eia_insights
    WHERE org_id = ${orgId}
    ORDER BY COALESCE(generated_at, created_at) DESC
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  const alertsDoc = asObject(row.alerts);
  const alertsArray = Array.isArray(alertsDoc?.alerts) ? alertsDoc.alerts : [];
  const alerts: MlEiaAlertRecord[] = alertsArray
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      severity: typeof entry.severity === 'string' ? entry.severity : 'medium',
      product: typeof entry.product === 'string' ? entry.product : 'unknown',
      type: typeof entry.type === 'string' ? entry.type : 'alert',
      message: typeof entry.message === 'string' ? entry.message : 'ML-EIA alert',
      date: typeof entry.date === 'string' ? entry.date : '',
    }));

  const forecastsArray = Array.isArray(row.forecasts) ? row.forecasts : [];
  const forecasts: MlEiaForecastSummary[] = forecastsArray
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      product: typeof entry.product === 'string' ? entry.product : 'unknown',
      lastDate: typeof entry.lastDate === 'string' ? entry.lastDate : null,
      point: typeof entry.point === 'number' ? entry.point : null,
      ci80Low: typeof entry.ci80Low === 'number' ? entry.ci80Low : null,
      ci80High: typeof entry.ci80High === 'number' ? entry.ci80High : null,
    }));

  return {
    runId: String(row.run_id),
    generatedAt: row.generated_at ? String(row.generated_at) : null,
    regime: typeof row.regime === 'string' ? row.regime : null,
    strategy: typeof row.strategy === 'string' ? row.strategy : null,
    alertCount: Number(row.alert_count || alerts.length || 0),
    alerts,
    forecasts,
    snapshot: asObject(row.snapshot),
  };
}

export async function upsertCommandCenterCatalog(input: {
  orgId: string;
  runId: string;
  tools: CommandCenterDiscoveredTool[];
}): Promise<void> {
  if (input.tools.length === 0) return;
  await ensureModuleGatewayPersistenceTables();
  const sql = getSQL();

  for (const tool of input.tools) {
    await sql`
      INSERT INTO module_gateway_command_center_tools (
        org_id,
        qualified_name,
        module_id,
        tool_name,
        description,
        parameters,
        discovered_run_id,
        discovered_at
      ) VALUES (
        ${input.orgId},
        ${tool.qualifiedName},
        ${tool.moduleId},
        ${tool.name},
        ${tool.description || null},
        ${JSON.stringify(tool.parameters || {})}::jsonb,
        ${input.runId},
        NOW()
      )
      ON CONFLICT (org_id, qualified_name) DO UPDATE SET
        module_id = EXCLUDED.module_id,
        tool_name = EXCLUDED.tool_name,
        description = EXCLUDED.description,
        parameters = EXCLUDED.parameters,
        discovered_run_id = EXCLUDED.discovered_run_id,
        discovered_at = EXCLUDED.discovered_at,
        updated_at = NOW()
    `;
  }
}

export async function listCommandCenterCatalog(orgId: string): Promise<CommandCenterCatalogRow[]> {
  await ensureModuleGatewayPersistenceTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT
      qualified_name,
      module_id,
      tool_name,
      description,
      parameters,
      discovered_run_id,
      discovered_at,
      updated_at
    FROM module_gateway_command_center_tools
    WHERE org_id = ${orgId}
    ORDER BY discovered_at DESC, qualified_name ASC
  `;

  return rows.map((row) => ({
    qualifiedName: String(row.qualified_name),
    moduleId: String(row.module_id),
    toolName: String(row.tool_name),
    description: typeof row.description === 'string' ? row.description : null,
    parameters: asObject(row.parameters) || {},
    discoveredRunId: typeof row.discovered_run_id === 'string' ? row.discovered_run_id : null,
    discoveredAt: String(row.discovered_at),
    updatedAt: String(row.updated_at),
  }));
}

function normalizeCommandCenterTools(run: ModuleRunRecord): CommandCenterDiscoveredTool[] {
  if (run.moduleId !== 'command-center') return [];
  if (run.actionId !== 'discover.tools') return [];
  if (!Array.isArray(run.result)) return [];

  return run.result
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      qualifiedName: typeof entry.qualifiedName === 'string' ? entry.qualifiedName : '',
      moduleId: typeof entry.moduleId === 'string' ? entry.moduleId : '',
      name: typeof entry.name === 'string' ? entry.name : '',
      description: typeof entry.description === 'string' ? entry.description : '',
      parameters: asObject(entry.parameters) || {},
    }))
    .filter((entry) => entry.qualifiedName.length > 0 && entry.moduleId.length > 0 && entry.name.length > 0);
}

function extractMlEiaForecasts(
  forecastDocs: Array<Record<string, unknown>>,
): MlEiaForecastSummary[] {
  return forecastDocs
    .map((doc) => {
      const series = Array.isArray(doc.forecast) ? doc.forecast : [];
      const lastPoint = series.length > 0 ? asObject(series[series.length - 1]) : null;
      return {
        product: typeof doc.product === 'string' ? doc.product : 'unknown',
        lastDate: typeof lastPoint?.date === 'string' ? lastPoint.date : null,
        point: typeof lastPoint?.point === 'number' ? lastPoint.point : null,
        ci80Low: typeof lastPoint?.ci_80_low === 'number' ? lastPoint.ci_80_low : null,
        ci80High: typeof lastPoint?.ci_80_high === 'number' ? lastPoint.ci_80_high : null,
      };
    })
    .sort((a, b) => a.product.localeCompare(b.product));
}

export async function maybePersistModuleRunInsights(input: {
  orgId: string;
  run: ModuleRunRecord;
  readArtifactJson: (artifactPath: string) => Promise<Record<string, unknown> | null>;
}): Promise<void> {
  if (input.run.status !== 'success') return;

  const commandCenterTools = normalizeCommandCenterTools(input.run);
  if (commandCenterTools.length > 0) {
    await upsertCommandCenterCatalog({
      orgId: input.orgId,
      runId: input.run.id,
      tools: commandCenterTools,
    });
    return;
  }

  if (input.run.moduleId !== 'ML-EIA-PETROLEUM-INTEL') return;

  const snapshotPath = input.run.artifacts
    .map((artifact) => artifact.path)
    .find((artifactPath) => /analysis_snapshot\.json$/i.test(artifactPath));
  const alertsPath = input.run.artifacts
    .map((artifact) => artifact.path)
    .find((artifactPath) => /active_alerts\.json$/i.test(artifactPath));
  const forecastPaths = input.run.artifacts
    .map((artifact) => artifact.path)
    .filter((artifactPath) => /(?:^|[\\/])forecasts[\\/].+\.json$/i.test(artifactPath));

  if (!snapshotPath && !alertsPath && forecastPaths.length === 0) return;

  const [snapshotDoc, alertsDoc, forecastDocs] = await Promise.all([
    snapshotPath ? input.readArtifactJson(snapshotPath) : Promise.resolve(null),
    alertsPath ? input.readArtifactJson(alertsPath) : Promise.resolve(null),
    Promise.all(forecastPaths.map((forecastPath) => input.readArtifactJson(forecastPath))),
  ]);

  const snapshot = asObject(snapshotDoc);
  const alerts = asObject(alertsDoc);
  const regime = asObject(snapshot?.regime);
  const pricingStrategy = asObject(snapshot?.pricing_strategy);

  const alertsArray = Array.isArray(alerts?.alerts) ? alerts.alerts : [];
  const alertCountFromDoc = typeof alerts?.alert_count === 'number' ? alerts.alert_count : null;
  const alertCount = alertCountFromDoc ?? alertsArray.length;
  const generatedAt = (
    (typeof snapshot?.generated_at === 'string' && snapshot.generated_at)
    || (typeof alerts?.generated_at === 'string' && alerts.generated_at)
    || null
  );

  await upsertMlEiaInsightRecord({
    orgId: input.orgId,
    runId: input.run.id,
    generatedAt,
    regime: typeof regime?.current_regime === 'string' ? regime.current_regime : null,
    strategy:
      typeof pricingStrategy?.overall_recommendation === 'string'
        ? pricingStrategy.overall_recommendation
        : null,
    alertCount: Number.isFinite(alertCount) ? Number(alertCount) : 0,
    snapshot,
    alerts,
    forecasts: extractMlEiaForecasts(
      forecastDocs.filter((doc): doc is Record<string, unknown> => Boolean(doc)),
    ),
  });
}
