import { getSQL } from '@/lib/fleet-compliance-db';
import { getCatalog } from '@/lib/modules-gateway/registry';
import type {
  ModuleCatalogEntry,
  ModuleGatewayAclDecision,
  ModuleGatewayAclPermission,
  ModuleGatewayAclRule,
  ModuleGatewayAclScopeType,
  ModuleRunRecord,
} from '@/lib/modules-gateway/types';

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
const COMMAND_CENTER_CATALOG_CACHE_TTL_MS = 30_000;
const MODULE_GATEWAY_ACL_CACHE_TTL_MS = 30_000;
const ORG_WIDE_ACL_USER_ID = '*';
const commandCenterCatalogCache = new Map<string, { expiresAt: number; rows: CommandCenterCatalogRow[] }>();
const moduleGatewayAclCache = new Map<string, { expiresAt: number; rules: ModuleGatewayAclRule[] }>();

export interface ModuleGatewayAclRuleInput {
  orgId: string;
  userId?: string | null;
  scopeType: ModuleGatewayAclScopeType;
  scopeKey: string;
  canView?: boolean;
  canExecute?: boolean;
}

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

  await sql`
    CREATE TABLE IF NOT EXISTS module_gateway_acl_rules (
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '*',
      scope_type TEXT NOT NULL,
      scope_key TEXT NOT NULL,
      can_view BOOLEAN NOT NULL DEFAULT TRUE,
      can_execute BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (org_id, user_id, scope_type, scope_key),
      CHECK (scope_type IN ('module', 'action', 'tool'))
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_module_gateway_acl_rules_org_user
    ON module_gateway_acl_rules (org_id, user_id, scope_type, scope_key)
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

function normalizeAclUserId(userId: string | null | undefined): string {
  if (typeof userId !== 'string' || userId.trim().length === 0) return ORG_WIDE_ACL_USER_ID;
  return userId.trim();
}

function normalizeAclScopeKey(scopeKey: string): string {
  return scopeKey.trim();
}

function aclCacheKey(orgId: string, userId: string): string {
  return `${orgId}::${userId}`;
}

function invalidateAclCache(orgId: string): void {
  for (const key of moduleGatewayAclCache.keys()) {
    if (key.startsWith(`${orgId}::`)) {
      moduleGatewayAclCache.delete(key);
    }
  }
}

async function ensureOrgAclSeed(orgId: string): Promise<void> {
  await ensureModuleGatewayPersistenceTables();
  const sql = getSQL();

  const existingRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM module_gateway_acl_rules
    WHERE org_id = ${orgId}
  `;
  const existingCount = Number(existingRows[0]?.count || 0);
  if (existingCount > 0) return;

  const catalog = getCatalog();
  for (const moduleEntry of catalog) {
    await sql`
      INSERT INTO module_gateway_acl_rules (
        org_id,
        user_id,
        scope_type,
        scope_key,
        can_view,
        can_execute
      ) VALUES (
        ${orgId},
        ${ORG_WIDE_ACL_USER_ID},
        'module',
        ${moduleEntry.moduleId},
        TRUE,
        TRUE
      )
      ON CONFLICT (org_id, user_id, scope_type, scope_key) DO NOTHING
    `;

    for (const action of moduleEntry.actions) {
      await sql`
        INSERT INTO module_gateway_acl_rules (
          org_id,
          user_id,
          scope_type,
          scope_key,
          can_view,
          can_execute
        ) VALUES (
          ${orgId},
          ${ORG_WIDE_ACL_USER_ID},
          'action',
          ${`${moduleEntry.moduleId}:${action.actionId}`},
          TRUE,
          TRUE
        )
        ON CONFLICT (org_id, user_id, scope_type, scope_key) DO NOTHING
      `;
    }
  }

  invalidateAclCache(orgId);
}

function normalizeAclRuleRows(rows: Array<Record<string, unknown>>): ModuleGatewayAclRule[] {
  return rows
    .map((row) => ({
      orgId: String(row.org_id || ''),
      userId: String(row.user_id || ORG_WIDE_ACL_USER_ID),
      scopeType: String(row.scope_type || 'module') as ModuleGatewayAclScopeType,
      scopeKey: String(row.scope_key || ''),
      canView: Boolean(row.can_view),
      canExecute: Boolean(row.can_execute),
      updatedAt: String(row.updated_at || ''),
    }))
    .filter((rule) => rule.orgId.length > 0 && rule.scopeKey.length > 0);
}

function buildAclRuleLookup(rules: ModuleGatewayAclRule[]): Map<string, ModuleGatewayAclRule> {
  const lookup = new Map<string, ModuleGatewayAclRule>();
  for (const rule of rules) {
    lookup.set(`${rule.userId}|${rule.scopeType}|${rule.scopeKey}`, rule);
  }
  return lookup;
}

function getPermissionFromRule(
  rule: ModuleGatewayAclRule,
  permission: ModuleGatewayAclPermission,
): boolean {
  return permission === 'view' ? rule.canView : rule.canExecute;
}

export async function upsertModuleGatewayAclRules(input: {
  orgId: string;
  rules: ModuleGatewayAclRuleInput[];
  replaceOrgRules?: boolean;
}): Promise<void> {
  await ensureModuleGatewayPersistenceTables();
  const sql = getSQL();

  if (input.replaceOrgRules) {
    await sql`
      DELETE FROM module_gateway_acl_rules
      WHERE org_id = ${input.orgId}
    `;
  }

  for (const rule of input.rules) {
    const scopeKey = normalizeAclScopeKey(rule.scopeKey || '');
    if (!scopeKey) continue;

    await sql`
      INSERT INTO module_gateway_acl_rules (
        org_id,
        user_id,
        scope_type,
        scope_key,
        can_view,
        can_execute
      ) VALUES (
        ${input.orgId},
        ${normalizeAclUserId(rule.userId)},
        ${rule.scopeType},
        ${scopeKey},
        ${rule.canView !== false},
        ${rule.canExecute !== false}
      )
      ON CONFLICT (org_id, user_id, scope_type, scope_key) DO UPDATE SET
        can_view = EXCLUDED.can_view,
        can_execute = EXCLUDED.can_execute,
        updated_at = NOW()
    `;
  }

  invalidateAclCache(input.orgId);
}

export async function listModuleGatewayAclRules(
  orgId: string,
  userId: string,
): Promise<ModuleGatewayAclRule[]> {
  const normalizedUserId = normalizeAclUserId(userId);
  const cacheKey = aclCacheKey(orgId, normalizedUserId);
  const now = Date.now();
  const cached = moduleGatewayAclCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.rules;
  }

  await ensureOrgAclSeed(orgId);
  const sql = getSQL();
  const rows = await sql`
    SELECT
      org_id,
      user_id,
      scope_type,
      scope_key,
      can_view,
      can_execute,
      updated_at
    FROM module_gateway_acl_rules
    WHERE org_id = ${orgId}
      AND (user_id = ${normalizedUserId} OR user_id = ${ORG_WIDE_ACL_USER_ID})
    ORDER BY CASE WHEN user_id = ${normalizedUserId} THEN 0 ELSE 1 END, updated_at DESC
  `;

  const normalized = normalizeAclRuleRows(rows as Array<Record<string, unknown>>);
  moduleGatewayAclCache.set(cacheKey, {
    expiresAt: now + MODULE_GATEWAY_ACL_CACHE_TTL_MS,
    rules: normalized,
  });

  return normalized;
}

export async function evaluateModuleGatewayAcl(input: {
  orgId: string;
  userId: string;
  moduleId: string;
  actionId?: string;
  qualifiedName?: string;
  permission: ModuleGatewayAclPermission;
}): Promise<ModuleGatewayAclDecision> {
  const rules = await listModuleGatewayAclRules(input.orgId, input.userId);
  const lookup = buildAclRuleLookup(rules);
  const principals = [normalizeAclUserId(input.userId), ORG_WIDE_ACL_USER_ID];
  const scopeCandidates: Array<{ scopeType: ModuleGatewayAclScopeType; scopeKey: string }> = [];

  if (input.qualifiedName && input.qualifiedName.trim().length > 0) {
    scopeCandidates.push({ scopeType: 'tool', scopeKey: input.qualifiedName.trim() });
  }
  if (input.actionId && input.actionId.trim().length > 0) {
    scopeCandidates.push({ scopeType: 'action', scopeKey: `${input.moduleId}:${input.actionId.trim()}` });
  }
  scopeCandidates.push({ scopeType: 'module', scopeKey: input.moduleId });

  for (const principal of principals) {
    for (const scope of scopeCandidates) {
      const rule = lookup.get(`${principal}|${scope.scopeType}|${scope.scopeKey}`);
      if (!rule) continue;
      return {
        allowed: getPermissionFromRule(rule, input.permission),
        permission: input.permission,
        scopeType: scope.scopeType,
        scopeKey: scope.scopeKey,
        principal,
      };
    }
  }

  return {
    allowed: false,
    permission: input.permission,
  };
}

function extractModuleIdFromQualifiedName(qualifiedName: string): string {
  const trimmed = qualifiedName.trim();
  if (!trimmed) return '';
  const dotIndex = trimmed.indexOf('.');
  if (dotIndex <= 0) return '';
  return trimmed.slice(0, dotIndex);
}

export async function evaluateCommandCenterToolAcl(input: {
  orgId: string;
  userId: string;
  qualifiedName: string;
  permission: ModuleGatewayAclPermission;
}): Promise<ModuleGatewayAclDecision> {
  const moduleId = extractModuleIdFromQualifiedName(input.qualifiedName);
  if (!moduleId) {
    return {
      allowed: false,
      permission: input.permission,
    };
  }

  return evaluateModuleGatewayAcl({
    orgId: input.orgId,
    userId: input.userId,
    moduleId,
    qualifiedName: input.qualifiedName,
    permission: input.permission,
  });
}

export async function filterModuleCatalogByAcl(input: {
  orgId: string;
  userId: string;
  catalog: ModuleCatalogEntry[];
}): Promise<ModuleCatalogEntry[]> {
  const filtered: ModuleCatalogEntry[] = [];

  for (const moduleEntry of input.catalog) {
    const allowedActions: ModuleCatalogEntry['actions'] = [];
    for (const action of moduleEntry.actions) {
      const decision = await evaluateModuleGatewayAcl({
        orgId: input.orgId,
        userId: input.userId,
        moduleId: moduleEntry.moduleId,
        actionId: action.actionId,
        permission: 'execute',
      });
      if (decision.allowed) {
        allowedActions.push(action);
      }
    }

    if (allowedActions.length > 0) {
      filtered.push({
        ...moduleEntry,
        actions: allowedActions,
      });
    }
  }

  return filtered;
}

export async function buildCommandCenterAclPayload(input: {
  orgId: string;
  userId: string;
  permission: ModuleGatewayAclPermission;
}): Promise<{ allowedModuleIds: string[]; allowedQualifiedNames: string[] }> {
  const catalog = getCatalog();
  const moduleIds = new Set<string>();
  for (const moduleEntry of catalog) {
    if (moduleEntry.moduleId === 'command-center') continue;
    const moduleDecision = await evaluateModuleGatewayAcl({
      orgId: input.orgId,
      userId: input.userId,
      moduleId: moduleEntry.moduleId,
      permission: input.permission,
    });
    if (moduleDecision.allowed) {
      moduleIds.add(moduleEntry.moduleId);
    }
  }

  const rows = await listCommandCenterCatalog(input.orgId);
  const qualifiedNames = new Set<string>();
  for (const row of rows) {
    const decision = await evaluateCommandCenterToolAcl({
      orgId: input.orgId,
      userId: input.userId,
      qualifiedName: row.qualifiedName,
      permission: input.permission,
    });
    if (decision.allowed) {
      qualifiedNames.add(row.qualifiedName);
    }
  }

  return {
    allowedModuleIds: Array.from(moduleIds).sort((a, b) => a.localeCompare(b)),
    allowedQualifiedNames: Array.from(qualifiedNames).sort((a, b) => a.localeCompare(b)),
  };
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

  commandCenterCatalogCache.delete(input.orgId);
}

export async function listCommandCenterCatalog(orgId: string): Promise<CommandCenterCatalogRow[]> {
  const now = Date.now();
  const cached = commandCenterCatalogCache.get(orgId);
  if (cached && cached.expiresAt > now) {
    return cached.rows;
  }

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

  const normalized = rows.map((row) => ({
    qualifiedName: String(row.qualified_name),
    moduleId: String(row.module_id),
    toolName: String(row.tool_name),
    description: typeof row.description === 'string' ? row.description : null,
    parameters: asObject(row.parameters) || {},
    discoveredRunId: typeof row.discovered_run_id === 'string' ? row.discovered_run_id : null,
    discoveredAt: String(row.discovered_at),
    updatedAt: String(row.updated_at),
  }));

  commandCenterCatalogCache.set(orgId, {
    expiresAt: now + COMMAND_CENTER_CATALOG_CACHE_TTL_MS,
    rows: normalized,
  });

  return normalized;
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
