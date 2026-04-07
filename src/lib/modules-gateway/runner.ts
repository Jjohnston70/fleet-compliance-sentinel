import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, type Stats } from 'node:fs';
import path from 'node:path';
import {
  getActionSandboxPolicy,
  getCatalog,
  getModuleAction,
  getModuleDefinition,
  moduleDirectoryExists,
  moduleGatewayLimits,
  validateActionArgs,
  validateActionOutput,
} from '@/lib/modules-gateway/registry';
import {
  appendModuleGatewayInvocationAudit,
  recordModuleGatewayRetryEscalation,
  recordModuleGatewaySandboxEvent,
} from '@/lib/modules-gateway/persistence';
import type {
  ModuleRunAttempt,
  ModuleActionDefinition,
  ModuleCatalogEntry,
  ModuleDefinition,
  ModuleRunArtifact,
  ModuleRunError,
  ModuleRunErrorCode,
  ModuleRunRecord,
  ModuleRunRequest,
  ModuleRunStartResult,
  ModuleValidationIssue,
} from '@/lib/modules-gateway/types';
import { MODULE_RUN_ERROR_TAXONOMY } from '@/lib/modules-gateway/types';

const runs = new Map<string, ModuleRunRecord>();
const suppressedFailureAlerts = new Set<string>();
const FAILURE_ALERT_WEBHOOK_URL = process.env.MODULE_GATEWAY_FAILURE_WEBHOOK_URL;
const PATH_ARG_KEY_PATTERN = /(path|file|dir|output|input|out)$/i;
const MAX_RETRY_ATTEMPTS = Math.min(moduleGatewayLimits.retryMaxAttempts, 3);

type ModuleRateLimitBucket = {
  windowStart: number;
  count: number;
};

const moduleRateLimitBuckets = new Map<string, ModuleRateLimitBucket>();

interface ModuleRateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
  limit: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

function clampTimeout(requestedTimeoutMs: number | undefined, actionDefaultMs: number | undefined): number {
  const base = Number.isFinite(requestedTimeoutMs) ? Number(requestedTimeoutMs) : actionDefaultMs;
  const fallback = moduleGatewayLimits.defaultTimeoutMs;
  const timeoutMs = Number.isFinite(base) ? Number(base) : fallback;
  if (timeoutMs <= 0) return fallback;
  return Math.min(timeoutMs, moduleGatewayLimits.maxTimeoutMs);
}

function isWithinRoot(rootPath: string, targetPath: string): boolean {
  const relative = path.relative(rootPath, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function isPathLikeArg(action: ModuleActionDefinition, key: string): boolean {
  if (PATH_ARG_KEY_PATTERN.test(key)) return true;
  const description = action.argsSchema?.properties?.[key]?.description;
  if (typeof description !== 'string') return false;
  const normalized = description.toLowerCase();
  return normalized.includes(' path') || normalized.includes(' directory') || normalized.includes(' file');
}

function sanitizeActionArgs(
  moduleDef: ModuleDefinition,
  action: ModuleActionDefinition,
  args: Record<string, unknown>,
): ModuleValidationIssue[] {
  if (!action.buildCommand) return [];
  const sandboxPolicy = getActionSandboxPolicy(action);
  if (!sandboxPolicy.enforcePathSanitization) return [];

  const issues: ModuleValidationIssue[] = [];
  for (const [key, value] of Object.entries(args)) {
    if (typeof value !== 'string') continue;
    if (value.length > moduleGatewayLimits.maxArgStringLength) {
      issues.push({
        path: `args.${key}`,
        code: 'coercion',
        message: `args.${key} exceeds max length of ${moduleGatewayLimits.maxArgStringLength} characters`,
        expected: `<= ${moduleGatewayLimits.maxArgStringLength} chars`,
        received: value.length,
      });
      continue;
    }
    if (value.includes('\0')) {
      issues.push({
        path: `args.${key}`,
        code: 'coercion',
        message: `args.${key} contains invalid null byte`,
      });
      continue;
    }

    if (!isPathLikeArg(action, key)) continue;

    const trimmed = value.trim();
    if (!trimmed) continue;
    if (/[\r\n]/.test(trimmed)) {
      issues.push({
        path: `args.${key}`,
        code: 'coercion',
        message: `args.${key} contains invalid newline characters`,
      });
      continue;
    }

    const normalizedInput = trimmed.replace(/\\/g, '/');
    if (normalizedInput.split('/').some((segment) => segment === '..')) {
      issues.push({
        path: `args.${key}`,
        code: 'coercion',
        message: `args.${key} contains path traversal segments`,
      });
      continue;
    }

    const absolutePath = path.isAbsolute(trimmed)
      ? path.resolve(trimmed)
      : path.resolve(moduleDef.workingDirectory, trimmed);
    if (!isWithinRoot(moduleDef.workingDirectory, absolutePath)) {
      issues.push({
        path: `args.${key}`,
        code: 'coercion',
        message: `args.${key} must resolve within module working directory`,
      });
    }
  }

  return issues;
}

function countInFlightRuns(orgId: string, moduleId: string, actionId: string): { orgCount: number; actionCount: number } {
  let orgCount = 0;
  let actionCount = 0;
  for (const run of runs.values()) {
    if (run.orgId !== orgId) continue;
    if (run.status !== 'queued' && run.status !== 'running') continue;
    orgCount += 1;
    if (run.moduleId === moduleId && run.actionId === actionId) {
      actionCount += 1;
    }
  }
  return { orgCount, actionCount };
}

function cleanExpiredRateLimitBuckets(now: number): void {
  const maxRetentionMs = moduleGatewayLimits.rateLimitWindowSeconds * 4 * 1_000;
  for (const [key, bucket] of moduleRateLimitBuckets.entries()) {
    if (now - bucket.windowStart >= maxRetentionMs) {
      moduleRateLimitBuckets.delete(key);
    }
  }
}

function checkAndConsumeRateLimit(
  orgId: string,
  moduleId: string,
  actionId: string,
  action: ModuleActionDefinition,
): ModuleRateLimitDecision {
  const policy = getActionSandboxPolicy(action);
  const limit = policy.rateLimitPerWindow;
  const windowMs = policy.rateLimitWindowSeconds * 1_000;
  const now = Date.now();
  cleanExpiredRateLimitBuckets(now);

  const key = `${orgId}:${moduleId}:${actionId}`;
  const current = moduleRateLimitBuckets.get(key);
  const isExpired = !current || now - current.windowStart >= windowMs;
  const bucket = isExpired ? { windowStart: now, count: 0 } : { ...current };

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - bucket.windowStart)) / 1_000));
    moduleRateLimitBuckets.set(key, bucket);
    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
      limit,
    };
  }

  bucket.count += 1;
  moduleRateLimitBuckets.set(key, bucket);
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(limit - bucket.count, 0),
    limit,
  };
}

function persistSandboxEvent(input: {
  orgId: string;
  userId: string;
  moduleId: string;
  actionId: string;
  eventType: 'rate_limit' | 'concurrency_limit' | 'sanitization' | 'timeout';
  errorCode: string;
  message: string;
  metadata?: Record<string, unknown>;
}): void {
  void recordModuleGatewaySandboxEvent({
    orgId: input.orgId,
    userId: input.userId,
    moduleId: input.moduleId,
    actionId: input.actionId,
    eventType: input.eventType,
    errorCode: input.errorCode,
    message: input.message,
    metadata: input.metadata || null,
  });
}

function appendRunAuditEvent(
  run: ModuleRunRecord,
  eventType: 'run_submitted' | 'attempt_completed' | 'run_escalated',
  attemptOverride?: number,
): void {
  void appendModuleGatewayInvocationAudit({
    runId: run.id,
    eventType,
    requestId: run.correlationId || run.id,
    orgId: run.orgId,
    userId: run.requestedBy,
    moduleId: run.moduleId,
    actionId: run.actionId,
    qualifiedName: `${run.moduleId}.${run.actionId}`,
    status: run.status,
    attempt: typeof attemptOverride === 'number' ? attemptOverride : run.attemptCount,
    maxAttempts: run.maxAttempts,
    correlationId: run.correlationId || null,
    timeoutMs: run.timeoutMs,
    dryRun: run.dryRun,
    durationMs: run.durationMs,
    errorCode: run.error?.code || null,
    errorMessage: run.error?.message || null,
    args: run.args,
    result: run.result,
    details: run.error?.fieldErrors || run.error?.details || null,
  });
}

function isRetryableErrorCode(code: ModuleRunErrorCode | undefined): boolean {
  if (!code) return false;
  return Boolean(MODULE_RUN_ERROR_TAXONOMY[code]?.retryable);
}

function buildAttemptSnapshot(run: ModuleRunRecord, attempt: number): ModuleRunAttempt {
  return {
    attempt,
    startedAt: run.startedAt || run.createdAt,
    endedAt: run.endedAt || nowIso(),
    durationMs: typeof run.durationMs === 'number' ? run.durationMs : 0,
    status: run.status,
    errorCode: run.error?.code,
    errorMessage: run.error?.message,
  };
}

function retryBackoffMs(attempt: number): number {
  return Math.min(250 * (2 ** Math.max(attempt - 1, 0)), 2_000);
}

function appendWithLimit(current: string, chunk: string, maxChars: number): { next: string; truncated: boolean } {
  if (current.length >= maxChars) {
    return { next: current, truncated: true };
  }
  const remaining = maxChars - current.length;
  if (chunk.length > remaining) {
    return { next: current + chunk.slice(0, remaining), truncated: true };
  }
  return { next: current + chunk, truncated: false };
}

function previewOutput(raw: string, wasCaptureTruncated: boolean): { preview: string; wasPreviewTruncated: boolean } {
  if (raw.length <= moduleGatewayLimits.outputPreviewChars && !wasCaptureTruncated) {
    return { preview: raw, wasPreviewTruncated: false };
  }
  return {
    preview: raw.slice(0, moduleGatewayLimits.outputPreviewChars),
    wasPreviewTruncated: true,
  };
}

function updateRun(runId: string, updater: (run: ModuleRunRecord) => ModuleRunRecord): ModuleRunRecord | undefined {
  const existing = runs.get(runId);
  if (!existing) return undefined;
  const next = updater(existing);
  runs.set(runId, next);
  return next;
}

function updateFailedRun(runId: string, updater: (run: ModuleRunRecord) => ModuleRunRecord): void {
  const failedRun = updateRun(runId, updater);
  if (failedRun && !suppressedFailureAlerts.has(runId)) {
    void emitModuleRunFailureAlert(failedRun);
  }
}

function buildFailureAlertPayload(run: ModuleRunRecord): Record<string, unknown> {
  return {
    event: 'module_gateway_run_failed',
    runId: run.id,
    moduleId: run.moduleId,
    actionId: run.actionId,
    correlationId: run.correlationId || null,
    requestedBy: run.requestedBy,
    status: run.status,
    dryRun: run.dryRun,
    command: run.command,
    cwd: run.cwd,
    timeoutMs: run.timeoutMs,
    createdAt: run.createdAt,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    durationMs: run.durationMs,
    exitCode: run.exitCode,
    error: run.error || null,
    stderrPreview: run.stderrPreview,
    stdoutPreview: run.stdoutPreview,
  };
}

async function emitModuleRunFailureAlert(run: ModuleRunRecord): Promise<void> {
  const payload = buildFailureAlertPayload(run);
  console.error('[module-gateway] run failed', payload);

  if (!FAILURE_ALERT_WEBHOOK_URL) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(FAILURE_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    console.error('[module-gateway] failure webhook error', {
      runId: run.id,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timeout);
  }
}

function toRepoRelativePath(absolutePath: string): string {
  const relative = path.relative(process.cwd(), absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return absolutePath;
  }
  return relative.split(path.sep).join('/');
}

function getPaperstackArtifactCandidates(run: ModuleRunRecord, stdoutRaw: string): string[] {
  const args = run.args;
  const inputPath = typeof args.inputPath === 'string' ? args.inputPath : null;
  const outputPath = typeof args.outputPath === 'string' ? args.outputPath : null;

  const extractPaths = (pattern: RegExp): string[] => {
    const matches = Array.from(stdoutRaw.matchAll(pattern));
    return matches
      .map((match) => (match[1] ? match[1].trim().replace(/^["']|["']$/g, '') : ''))
      .filter((value) => value.length > 0);
  };

  if (run.actionId === 'generate.pdf') {
    return ['Pipeline_Flyer.pdf'];
  }
  if (run.actionId === 'generate.docx') {
    return ['Pipeline_Flyer.docx'];
  }
  if (run.actionId === 'generate') {
    const format = typeof args.format === 'string' ? args.format : 'pdf';
    if (format === 'docx') return ['Pipeline_Flyer.docx'];
    return ['Pipeline_Flyer.pdf'];
  }
  if (run.actionId === 'convert' && inputPath) {
    if (outputPath) {
      return [outputPath];
    }
    const parsed = path.parse(inputPath);
    return [path.join(parsed.dir, `${parsed.name}.html`)];
  }
  if (run.actionId === 'reverse' && inputPath) {
    if (outputPath) {
      return [outputPath];
    }

    const baseName = path.parse(inputPath).name;
    const mode = typeof args.mode === 'string' ? args.mode : 'js';
    if (mode === 'python') {
      return [`${baseName}_generator.py`];
    }
    if (mode === 'pdf') {
      return [`${baseName}_pdf_generator.py`];
    }
    if (mode === 'python_pdf') {
      return [`${baseName}_generator.py`, `${baseName}_pdf_generator.py`];
    }
    return [`${baseName}_generator.js`];
  }

  return [];
}

function getMlSignalArtifactCandidates(run: ModuleRunRecord, stdoutRaw: string): string[] {
  if (run.moduleId !== 'ML-SIGNAL-STACK-TNCC') {
    return [];
  }

  const extractPaths = (pattern: RegExp): string[] => {
    const matches = Array.from(stdoutRaw.matchAll(pattern));
    return matches
      .map((match) => (match[1] ? match[1].trim().replace(/^["']|["']$/g, '') : ''))
      .filter((value) => value.length > 0);
  };

  if (run.actionId === 'report.generate') {
    return extractPaths(/\[report\]\s+Saved:\s+(.+)/g);
  }

  if (run.actionId === 'package.output' || run.actionId === 'workflow.delivery') {
    return [
      ...extractPaths(/\[package\]\s+Delivered:\s+(.+)/g),
      ...extractPaths(/\[package\]\s+HTML:\s+(.+)/g),
    ];
  }

  if (run.actionId === 'invoice.extract' || run.actionId === 'invoice.extract_batch') {
    return [
      ...extractPaths(/\[invoice\]\s+json:\s+([^\r\n]+)/gi),
      ...extractPaths(/\[invoice\]\s+xlsx:\s+([^\r\n]+)/gi),
    ];
  }

  return [];
}

function getMlEiaArtifactCandidates(run: ModuleRunRecord, stdoutRaw: string): string[] {
  if (run.moduleId !== 'ML-EIA-PETROLEUM-INTEL') {
    return [];
  }

  const extractPaths = (pattern: RegExp): string[] => {
    const matches = Array.from(stdoutRaw.matchAll(pattern));
    return matches
      .map((match) => (match[1] ? match[1].trim().replace(/^["']|["']$/g, '') : ''))
      .filter((value) => value.length > 0);
  };

  const inferred = extractPaths(/->\s+([^\r\n]+)/g);
  if (inferred.length > 0) {
    return inferred;
  }

  return [];
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

function readJsonFileSafe(filePath: string): unknown | null {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createMlEiaDashboardArtifact(run: ModuleRunRecord, candidates: string[]): string | null {
  if (run.moduleId !== 'ML-EIA-PETROLEUM-INTEL') return null;

  const absoluteCandidates = candidates.map((candidate) => resolveArtifactAbsolutePath(run, candidate));
  const forecastFiles = absoluteCandidates.filter(
    (filePath) => /[\\/]forecasts[\\/].+\.json$/i.test(filePath) && existsSync(filePath),
  );
  const alertsFile = absoluteCandidates.find((filePath) => /active_alerts\.json$/i.test(filePath) && existsSync(filePath));
  const snapshotFile = absoluteCandidates.find(
    (filePath) => /analysis_snapshot\.json$/i.test(filePath) && existsSync(filePath),
  );

  if (!snapshotFile && !alertsFile && forecastFiles.length === 0) {
    return null;
  }

  const snapshot = (snapshotFile ? readJsonFileSafe(snapshotFile) : null) as Record<string, unknown> | null;
  const alerts = (alertsFile ? readJsonFileSafe(alertsFile) : null) as Record<string, unknown> | null;
  const regime = (snapshot?.regime || {}) as Record<string, unknown>;
  const alertsArray = Array.isArray(alerts?.alerts) ? alerts?.alerts : [];
  const alertCount =
    typeof alerts?.alert_count === 'number'
      ? alerts.alert_count
      : Array.isArray(alertsArray)
        ? alertsArray.length
        : 0;

  const forecastRows = forecastFiles
    .map((filePath) => {
      const doc = readJsonFileSafe(filePath) as Record<string, unknown> | null;
      if (!doc) return null;
      const series = Array.isArray(doc.forecast) ? doc.forecast : [];
      const lastPoint = series.length > 0 ? (series[series.length - 1] as Record<string, unknown>) : null;
      return {
        product: typeof doc.product === 'string' ? doc.product : path.basename(filePath),
        horizonDays: typeof doc.horizon_days === 'number' ? doc.horizon_days : null,
        generatedAt: typeof doc.generated_at === 'string' ? doc.generated_at : null,
        lastDate: typeof lastPoint?.date === 'string' ? lastPoint.date : null,
        point: typeof lastPoint?.point === 'number' ? lastPoint.point : null,
        ci80Low: typeof lastPoint?.ci_80_low === 'number' ? lastPoint.ci_80_low : null,
        ci80High: typeof lastPoint?.ci_80_high === 'number' ? lastPoint.ci_80_high : null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => a.product.localeCompare(b.product));

  const alertRows = (alertsArray as Array<Record<string, unknown>>)
    .slice(0, 12)
    .map((alert) => ({
      severity: typeof alert.severity === 'string' ? alert.severity : '-',
      product: typeof alert.product === 'string' ? alert.product : '-',
      type: typeof alert.type === 'string' ? alert.type : '-',
      message: typeof alert.message === 'string' ? alert.message : '-',
      date: typeof alert.date === 'string' ? alert.date : '-',
    }));

  const generatedAt =
    (typeof snapshot?.generated_at === 'string' && snapshot.generated_at)
    || (typeof alerts?.generated_at === 'string' && alerts.generated_at)
    || nowIso();
  const strategy = (snapshot?.pricing_strategy as Record<string, unknown> | undefined)?.overall_recommendation;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ML-EIA Dashboard ${escapeHtml(run.id)}</title>
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
    <p class="meta">Run <code>${escapeHtml(run.id)}</code> · Generated ${escapeHtml(generatedAt)}</p>

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

  const reportsDir = path.join(run.cwd, 'output', 'reports');
  const outputName = `module_gateway_ml_eia_dashboard_${run.id}.html`;
  const outputPath = path.join(reportsDir, outputName);
  try {
    mkdirSync(reportsDir, { recursive: true });
    writeFileSync(outputPath, html, 'utf8');
    return outputPath;
  } catch {
    return null;
  }
}

function resolveArtifactAbsolutePath(run: ModuleRunRecord, candidate: string): string {
  if (path.isAbsolute(candidate)) return candidate;
  return path.resolve(run.cwd, candidate);
}

function collectRunArtifacts(run: ModuleRunRecord, stdoutRaw = ''): ModuleRunArtifact[] {
  let candidates: string[] = [];
  if (run.moduleId === 'MOD-PAPERSTACK-PP') {
    candidates = getPaperstackArtifactCandidates(run, stdoutRaw);
  } else if (run.moduleId === 'ML-SIGNAL-STACK-TNCC') {
    candidates = getMlSignalArtifactCandidates(run, stdoutRaw);
  } else if (run.moduleId === 'ML-EIA-PETROLEUM-INTEL') {
    candidates = getMlEiaArtifactCandidates(run, stdoutRaw);
  } else {
    return [];
  }

  if (candidates.length === 0) {
    return [];
  }

  if (run.moduleId === 'ML-EIA-PETROLEUM-INTEL') {
    const dashboardPath = createMlEiaDashboardArtifact(run, candidates);
    if (dashboardPath) {
      candidates = [dashboardPath, ...candidates];
    }
  }

  const artifacts: ModuleRunArtifact[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const absolutePath = resolveArtifactAbsolutePath(run, candidate);
    if (!existsSync(absolutePath)) continue;
    let stats: Stats;
    try {
      stats = statSync(absolutePath);
    } catch {
      continue;
    }
    if (!stats.isFile()) continue;

    const filePath = toRepoRelativePath(absolutePath);
    if (seen.has(filePath)) continue;
    seen.add(filePath);

    artifacts.push({
      kind: 'file',
      path: filePath,
      sizeBytes: stats.size,
      modifiedAt: new Date(stats.mtimeMs).toISOString(),
    });
  }

  return artifacts;
}

async function executeRun(runId: string): Promise<void> {
  const queuedRun = runs.get(runId);
  if (!queuedRun) return;

  updateRun(runId, (run) => ({
    ...run,
    status: 'running',
    startedAt: nowIso(),
  }));

  const run = runs.get(runId);
  if (!run) return;
  const action = getModuleAction(run.moduleId, run.actionId);
  if (!action) {
    updateFailedRun(runId, (current) => ({
      ...current,
      status: 'fail',
      endedAt: nowIso(),
      durationMs: 0,
      error: {
        code: 'ACTION_NOT_ALLOWED',
        message: `Action '${current.actionId}' is not allowlisted for module '${current.moduleId}'`,
      },
    }));
    return;
  }

  if (!action.execute && !action.buildCommand) {
    updateFailedRun(runId, (current) => ({
      ...current,
      status: 'fail',
      endedAt: nowIso(),
      durationMs: 0,
      error: {
        code: 'INTERNAL_ERROR',
        message: `No execution strategy configured for '${current.moduleId}:${current.actionId}'`,
      },
    }));
    return;
  }

  let stdout = '';
  let stderr = '';
  let stdoutCaptureTruncated = false;
  let stderrCaptureTruncated = false;
  let timedOut = false;

  const startedAtEpoch = Date.now();

  if (action.execute) {
    try {
      const bridgeResult = await action.execute(run.args);
      const endedAt = nowIso();
      const durationMs = Date.now() - startedAtEpoch;
      const stdoutPreview = previewOutput(bridgeResult.message || '', false);
      const stderrPreview = previewOutput(bridgeResult.stderr || '', false);
      const artifacts = bridgeResult.artifacts || collectRunArtifacts(
        run,
        `${bridgeResult.message || ''}\n${bridgeResult.stderr || ''}`,
      );

      if (bridgeResult.ok) {
        const outputValidation = validateActionOutput(action, bridgeResult.data);
        if (!outputValidation.valid) {
          updateFailedRun(runId, (current) => ({
            ...current,
            status: 'fail',
            endedAt,
            durationMs,
            exitCode: 1,
            stdoutPreview: stdoutPreview.preview,
            stderrPreview: stderrPreview.preview,
            stdoutTruncated: stdoutPreview.wasPreviewTruncated,
            stderrTruncated: stderrPreview.wasPreviewTruncated,
            artifacts,
            result: bridgeResult.data,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Action output validation failed',
              details: outputValidation.errors,
              fieldErrors: outputValidation.fieldErrors,
            },
          }));
          return;
        }

        updateRun(runId, (current) => ({
          ...current,
          status: 'success',
          endedAt,
          durationMs,
          exitCode: 0,
          stdoutPreview: stdoutPreview.preview,
          stderrPreview: stderrPreview.preview,
          stdoutTruncated: stdoutPreview.wasPreviewTruncated,
          stderrTruncated: stderrPreview.wasPreviewTruncated,
          artifacts,
          result: bridgeResult.data,
        }));
        return;
      }

      updateFailedRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        exitCode: 1,
        stdoutPreview: stdoutPreview.preview,
        stderrPreview: stderrPreview.preview,
        stdoutTruncated: stdoutPreview.wasPreviewTruncated,
        stderrTruncated: stderrPreview.wasPreviewTruncated,
        artifacts,
        result: bridgeResult.data,
        error: {
          code: bridgeResult.errorCode || 'EXEC_FAILED',
          message: bridgeResult.message || 'Bridge action failed',
          details: bridgeResult.details,
        },
      }));
      return;
    } catch (error) {
      const endedAt = nowIso();
      const durationMs = Date.now() - startedAtEpoch;
      const unknownError = error instanceof Error ? error.message : 'Unexpected bridge runner failure';
      updateFailedRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        exitCode: 1,
        error: {
          code: 'INTERNAL_ERROR',
          message: unknownError,
        },
      }));
      return;
    }
  }

  // Vercel Python gateway: dispatch Python modules via HTTP instead of spawn
  const vercelPythonGatewayUrl = process.env.ML_GATEWAY_URL || (process.env.VERCEL ? '/api/ml/run' : '');
  const vercelPythonGatewayKey = process.env.ML_GATEWAY_INTERNAL_KEY || '';
  const moduleDef = getModuleDefinition(run.moduleId);
  const isPythonModule = moduleDef?.runtime === 'python';

  if (isPythonModule && vercelPythonGatewayUrl && vercelPythonGatewayKey) {
    try {
      const gatewayUrl = vercelPythonGatewayUrl.startsWith('/')
        ? `${process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}${vercelPythonGatewayUrl}`
        : vercelPythonGatewayUrl;

      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ml-gateway-key': vercelPythonGatewayKey,
        },
        body: JSON.stringify({
          moduleId: run.moduleId,
          command: run.command,
          timeoutMs: run.timeoutMs,
        }),
      });

      const body = await res.json() as Record<string, unknown>;
      const endedAt = nowIso();
      const durationMs = Date.now() - startedAtEpoch;

      if (body.ok) {
        const stdoutPreview = previewOutput(String(body.stdout || ''), false);
        const stderrPreview = previewOutput(String(body.stderr || ''), false);
        const exitCode = typeof body.exitCode === 'number' ? body.exitCode : 1;

        if (exitCode === 0) {
          updateRun(runId, (current) => ({
            ...current,
            status: 'success',
            endedAt,
            durationMs,
            exitCode,
            stdoutPreview: stdoutPreview.preview,
            stderrPreview: stderrPreview.preview,
            stdoutTruncated: stdoutPreview.wasPreviewTruncated,
            stderrTruncated: stderrPreview.wasPreviewTruncated,
            artifacts: collectRunArtifacts(run, String(body.stdout || '')),
          }));
        } else {
          updateFailedRun(runId, (current) => ({
            ...current,
            status: 'fail',
            endedAt,
            durationMs,
            exitCode,
            stdoutPreview: stdoutPreview.preview,
            stderrPreview: stderrPreview.preview,
            stdoutTruncated: stdoutPreview.wasPreviewTruncated,
            stderrTruncated: stderrPreview.wasPreviewTruncated,
            error: {
              code: 'EXEC_FAILED' as ModuleRunErrorCode,
              message: `Process exited with code ${exitCode}`,
            },
          }));
        }
      } else {
        updateFailedRun(runId, (current) => ({
          ...current,
          status: 'fail',
          endedAt,
          durationMs,
          error: {
            code: (String(body.code || 'INTERNAL_ERROR')) as ModuleRunErrorCode,
            message: String(body.error || 'Python gateway error'),
          },
        }));
      }
      return;
    } catch (error) {
      const endedAt = nowIso();
      const durationMs = Date.now() - startedAtEpoch;
      updateFailedRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Python gateway call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
      return;
    }
  }

  try {
    const result = await new Promise<{ exitCode: number | null; spawnError?: Error }>((resolve) => {
      const child = spawn(run.command[0], run.command.slice(1), {
        cwd: run.cwd,
        env: process.env,
        shell: false,
        windowsHide: true,
      });

      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        child.kill();
      }, run.timeoutMs);

      child.stdout.on('data', (buffer: Buffer) => {
        const appended = appendWithLimit(stdout, buffer.toString('utf8'), moduleGatewayLimits.outputCaptureChars);
        stdout = appended.next;
        stdoutCaptureTruncated = stdoutCaptureTruncated || appended.truncated;
      });

      child.stderr.on('data', (buffer: Buffer) => {
        const appended = appendWithLimit(stderr, buffer.toString('utf8'), moduleGatewayLimits.outputCaptureChars);
        stderr = appended.next;
        stderrCaptureTruncated = stderrCaptureTruncated || appended.truncated;
      });

      child.on('error', (spawnError: Error) => {
        clearTimeout(timeoutHandle);
        resolve({ exitCode: null, spawnError });
      });

      child.on('close', (exitCode) => {
        clearTimeout(timeoutHandle);
        resolve({ exitCode });
      });
    });

    const endedAt = nowIso();
    const durationMs = Date.now() - startedAtEpoch;
    const stdoutPreview = previewOutput(stdout, stdoutCaptureTruncated);
    const stderrPreview = previewOutput(stderr, stderrCaptureTruncated);
    const artifacts = collectRunArtifacts(run, stdout);

    if (timedOut) {
      persistSandboxEvent({
        orgId: run.orgId,
        userId: run.requestedBy,
        moduleId: run.moduleId,
        actionId: run.actionId,
        eventType: 'timeout',
        errorCode: 'EXEC_TIMEOUT',
        message: `Process exceeded timeout of ${run.timeoutMs}ms`,
        metadata: {
          timeoutMs: run.timeoutMs,
          runId: run.id,
        },
      });
      updateFailedRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        exitCode: null,
        stdoutPreview: stdoutPreview.preview,
        stderrPreview: stderrPreview.preview,
        stdoutTruncated: stdoutPreview.wasPreviewTruncated,
        stderrTruncated: stderrPreview.wasPreviewTruncated,
        artifacts,
        error: {
          code: 'EXEC_TIMEOUT',
          message: `Process exceeded timeout of ${current.timeoutMs}ms`,
        },
      }));
      return;
    }

    const spawnErrorMessage = result.spawnError?.message;
    if (spawnErrorMessage) {
      updateFailedRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        exitCode: null,
        stdoutPreview: stdoutPreview.preview,
        stderrPreview: stderrPreview.preview,
        stdoutTruncated: stdoutPreview.wasPreviewTruncated,
        stderrTruncated: stderrPreview.wasPreviewTruncated,
        artifacts,
        error: {
          code: 'INTERNAL_ERROR',
          message: spawnErrorMessage,
        },
      }));
      return;
    }

    if (result.exitCode === 0) {
      updateRun(runId, (current) => ({
        ...current,
        status: 'success',
        endedAt,
        durationMs,
        exitCode: 0,
        stdoutPreview: stdoutPreview.preview,
        stderrPreview: stderrPreview.preview,
        stdoutTruncated: stdoutPreview.wasPreviewTruncated,
        stderrTruncated: stderrPreview.wasPreviewTruncated,
        artifacts,
      }));
      return;
    }

    updateFailedRun(runId, (current) => ({
      ...current,
      status: 'fail',
      endedAt,
      durationMs,
      exitCode: result.exitCode,
      stdoutPreview: stdoutPreview.preview,
      stderrPreview: stderrPreview.preview,
      stdoutTruncated: stdoutPreview.wasPreviewTruncated,
      stderrTruncated: stderrPreview.wasPreviewTruncated,
      artifacts,
      error: {
        code: 'EXEC_FAILED',
        message: `Process exited with code ${result.exitCode ?? 'unknown'}`,
      },
    }));
  } catch (error) {
    const endedAt = nowIso();
    const durationMs = Date.now() - startedAtEpoch;
    const unknownError = error instanceof Error ? error.message : 'Unexpected runner failure';
    updateFailedRun(runId, (current) => ({
      ...current,
      status: 'fail',
      endedAt,
      durationMs,
      error: {
        code: 'INTERNAL_ERROR',
        message: unknownError,
      },
    }));
  }
}

async function executeRunWithRetry(runId: string): Promise<void> {
  const initialRun = runs.get(runId);
  if (!initialRun) return;
  suppressedFailureAlerts.add(runId);

  const maxAttempts = Math.min(
    Math.max(initialRun.maxAttempts || MAX_RETRY_ATTEMPTS, 1),
    MAX_RETRY_ATTEMPTS,
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await executeRun(runId);
    const afterAttempt = runs.get(runId);
    if (!afterAttempt) {
      suppressedFailureAlerts.delete(runId);
      return;
    }

    const attemptSnapshot = buildAttemptSnapshot(afterAttempt, attempt);
    const runWithHistory = updateRun(runId, (current) => ({
      ...current,
      attemptCount: attempt,
      maxAttempts,
      retryHistory: [...current.retryHistory, attemptSnapshot],
    })) || afterAttempt;
    appendRunAuditEvent(runWithHistory, 'attempt_completed', attempt);

    if (runWithHistory.status === 'success') {
      suppressedFailureAlerts.delete(runId);
      return;
    }

    const lastErrorCode = runWithHistory.error?.code;
    if (!isRetryableErrorCode(lastErrorCode)) {
      suppressedFailureAlerts.delete(runId);
      void emitModuleRunFailureAlert(runWithHistory);
      return;
    }

    if (attempt >= maxAttempts) {
      const escalatedAt = nowIso();
      const escalation = {
        escalatedAt,
        reason: 'retry_exhausted' as const,
        attempts: maxAttempts,
        lastErrorCode: runWithHistory.error?.code,
        lastErrorMessage: runWithHistory.error?.message,
      };

      updateFailedRun(runId, (current) => ({
        ...current,
        status: 'fail',
        escalation,
        error: {
          code: 'RETRY_EXHAUSTED',
          message: `Retry cap reached (${maxAttempts}) for '${current.moduleId}:${current.actionId}'`,
          details: [
            `lastErrorCode=${runWithHistory.error?.code || 'unknown'}`,
            `lastErrorMessage=${runWithHistory.error?.message || 'unknown'}`,
          ],
        },
      }));
      const escalatedSnapshot = runs.get(runId);
      if (escalatedSnapshot) {
        appendRunAuditEvent(escalatedSnapshot, 'run_escalated', attempt);
      }

      void recordModuleGatewayRetryEscalation({
        runId,
        orgId: runWithHistory.orgId,
        userId: runWithHistory.requestedBy,
        moduleId: runWithHistory.moduleId,
        actionId: runWithHistory.actionId,
        attempts: maxAttempts,
        lastErrorCode: runWithHistory.error?.code || null,
        lastErrorMessage: runWithHistory.error?.message || null,
        metadata: {
          retryHistory: runWithHistory.retryHistory,
        },
      });
      const escalatedRun = runs.get(runId);
      suppressedFailureAlerts.delete(runId);
      if (escalatedRun) {
        void emitModuleRunFailureAlert(escalatedRun);
      }
      return;
    }

    updateRun(runId, (current) => ({
      ...current,
      status: 'queued',
      startedAt: null,
      endedAt: null,
      durationMs: null,
      exitCode: null,
      error: undefined,
    }));

    await new Promise((resolve) => setTimeout(resolve, retryBackoffMs(attempt)));
  }
  suppressedFailureAlerts.delete(runId);
}

async function waitForRunCompletion(runId: string, timeoutMs: number): Promise<ModuleRunRecord | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() <= deadline) {
    const run = runs.get(runId);
    if (!run) return null;
    if (run.status === 'success') {
      return run;
    }
    if (run.status === 'fail') {
      const retryPending = isRetryableErrorCode(run.error?.code)
        && run.attemptCount < run.maxAttempts
        && !run.escalation;
      if (!retryPending) {
        return run;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return runs.get(runId) || null;
}

export function enforceModuleRunRateLimit(input: {
  orgId: string;
  userId: string;
  moduleId: string;
  actionId: string;
}): { ok: true } | { ok: false; httpStatus: number; error: ModuleRunError } {
  const action = getModuleAction(input.moduleId, input.actionId);
  if (!action) {
    return { ok: true };
  }

  const rateLimit = checkAndConsumeRateLimit(input.orgId, input.moduleId, input.actionId, action);
  if (rateLimit.allowed) {
    return { ok: true };
  }

  const message = `Rate limit exceeded for '${input.moduleId}:${input.actionId}'`;
  persistSandboxEvent({
    orgId: input.orgId,
    userId: input.userId,
    moduleId: input.moduleId,
    actionId: input.actionId,
    eventType: 'rate_limit',
    errorCode: 'RATE_LIMITED',
    message,
    metadata: {
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      limit: rateLimit.limit,
    },
  });

  return {
    ok: false,
    httpStatus: 429,
    error: {
      code: 'RATE_LIMITED',
      message,
      details: [
        `retryAfterSeconds=${rateLimit.retryAfterSeconds}`,
        `limit=${rateLimit.limit}`,
      ],
    },
  };
}

export function startModuleRun(
  input: ModuleRunRequest,
  requestedBy: string,
  orgId: string,
): ModuleRunStartResult {
  const moduleDef = getModuleDefinition(input.moduleId);
  if (!moduleDef) {
    return {
      ok: false,
      httpStatus: 404,
      error: {
        code: 'MODULE_NOT_FOUND',
        message: `Module '${input.moduleId}' is not registered`,
      },
    };
  }

  const action = getModuleAction(input.moduleId, input.actionId);
  if (!action) {
    return {
      ok: false,
      httpStatus: 400,
      error: {
        code: 'ACTION_NOT_ALLOWED',
        message: `Action '${input.actionId}' is not allowlisted for module '${input.moduleId}'`,
      },
    };
  }

  // Bridge/in-process actions do not require a module working directory on disk.
  if (action.buildCommand && !moduleDirectoryExists(moduleDef)) {
    return {
      ok: false,
      httpStatus: 404,
      error: {
        code: 'MODULE_NOT_FOUND',
        message: `Module working directory not found for '${input.moduleId}'`,
      },
    };
  }

  const validation = validateActionArgs(action, input.args);
  if (!validation.valid) {
    return {
      ok: false,
      httpStatus: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Action args validation failed',
        details: validation.errors,
        fieldErrors: validation.fieldErrors,
      },
    };
  }

  const sanitizationIssues = sanitizeActionArgs(moduleDef, action, validation.normalizedArgs);
  if (sanitizationIssues.length > 0) {
    const details = sanitizationIssues.map((issue) => issue.message);
    persistSandboxEvent({
      orgId,
      userId: requestedBy,
      moduleId: input.moduleId,
      actionId: input.actionId,
      eventType: 'sanitization',
      errorCode: 'SANITIZATION_ERROR',
      message: details.join('; '),
      metadata: {
        issues: sanitizationIssues,
      },
    });
    return {
      ok: false,
      httpStatus: 400,
      error: {
        code: 'SANITIZATION_ERROR',
        message: 'Action args failed sanitization checks',
        details,
        fieldErrors: sanitizationIssues,
      },
    };
  }

  const dryRun = Boolean(input.dryRun);
  if (!dryRun) {
    const rateLimit = checkAndConsumeRateLimit(orgId, input.moduleId, input.actionId, action);
    if (!rateLimit.allowed) {
      const message = `Rate limit exceeded for '${input.moduleId}:${input.actionId}'`;
      persistSandboxEvent({
        orgId,
        userId: requestedBy,
        moduleId: input.moduleId,
        actionId: input.actionId,
        eventType: 'rate_limit',
        errorCode: 'RATE_LIMITED',
        message,
        metadata: {
          retryAfterSeconds: rateLimit.retryAfterSeconds,
          limit: rateLimit.limit,
        },
      });
      return {
        ok: false,
        httpStatus: 429,
        error: {
          code: 'RATE_LIMITED',
          message,
          details: [
            `retryAfterSeconds=${rateLimit.retryAfterSeconds}`,
            `limit=${rateLimit.limit}`,
          ],
        },
      };
    }

    const inFlight = countInFlightRuns(orgId, input.moduleId, input.actionId);
    if (inFlight.orgCount >= moduleGatewayLimits.maxConcurrentRunsPerOrg) {
      const message = `Concurrent run limit reached for org '${orgId}'`;
      persistSandboxEvent({
        orgId,
        userId: requestedBy,
        moduleId: input.moduleId,
        actionId: input.actionId,
        eventType: 'concurrency_limit',
        errorCode: 'RATE_LIMITED',
        message,
        metadata: {
          currentInFlight: inFlight.orgCount,
          maxConcurrentRunsPerOrg: moduleGatewayLimits.maxConcurrentRunsPerOrg,
        },
      });
      return {
        ok: false,
        httpStatus: 429,
        error: {
          code: 'RATE_LIMITED',
          message,
          details: [
            `maxConcurrentRunsPerOrg=${moduleGatewayLimits.maxConcurrentRunsPerOrg}`,
          ],
        },
      };
    }

    const actionSandboxPolicy = getActionSandboxPolicy(action);
    if (inFlight.actionCount >= actionSandboxPolicy.maxConcurrentRuns) {
      const message = `Concurrent run limit reached for action '${input.moduleId}:${input.actionId}'`;
      persistSandboxEvent({
        orgId,
        userId: requestedBy,
        moduleId: input.moduleId,
        actionId: input.actionId,
        eventType: 'concurrency_limit',
        errorCode: 'RATE_LIMITED',
        message,
        metadata: {
          currentInFlight: inFlight.actionCount,
          maxConcurrentRuns: actionSandboxPolicy.maxConcurrentRuns,
        },
      });
      return {
        ok: false,
        httpStatus: 429,
        error: {
          code: 'RATE_LIMITED',
          message,
          details: [`maxConcurrentRuns=${actionSandboxPolicy.maxConcurrentRuns}`],
        },
      };
    }
  }

  let command: string[];
  if (action.buildCommand) {
    try {
      const resolved = action.buildCommand(validation.normalizedArgs);
      command = [resolved.executable, ...resolved.args];
    } catch (error) {
      return {
        ok: false,
        httpStatus: 400,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unable to resolve command arguments',
        },
      };
    }
  } else if (action.execute) {
    command = [...action.commandPreview];
  } else {
    return {
      ok: false,
      httpStatus: 500,
      error: {
        code: 'INTERNAL_ERROR',
        message: `No execution strategy configured for '${input.moduleId}:${input.actionId}'`,
      },
    };
  }

  const timeoutMs = clampTimeout(input.timeoutMs, action.defaultTimeoutMs);
  const createdAt = nowIso();
  const runId = `run_${randomUUID()}`;
  const coercionSummary = validation.coercions.length > 0
    ? `\nCoercions: ${validation.coercions.map((entry) => entry.path).join(', ')}`
    : '';
  const dryRunMessage = dryRun ? `Dry run validated command: ${command.join(' ')}${coercionSummary}` : '';

  const runRecord: ModuleRunRecord = {
    id: runId,
    moduleId: input.moduleId,
    actionId: input.actionId,
    status: dryRun ? 'success' : 'queued',
    orgId,
    args: validation.normalizedArgs,
    requestedBy,
    correlationId: input.correlationId,
    timeoutMs,
    dryRun,
    command,
    cwd: moduleDef.workingDirectory,
    createdAt,
    startedAt: dryRun ? createdAt : null,
    endedAt: dryRun ? createdAt : null,
    durationMs: dryRun ? 0 : null,
    attemptCount: dryRun ? 1 : 0,
    maxAttempts: dryRun ? 1 : MAX_RETRY_ATTEMPTS,
    retryHistory: dryRun
      ? [{
        attempt: 1,
        startedAt: createdAt,
        endedAt: createdAt,
        durationMs: 0,
        status: 'success',
      }]
      : [],
    exitCode: dryRun ? 0 : null,
    stdoutPreview: dryRunMessage,
    stderrPreview: '',
    stdoutTruncated: false,
    stderrTruncated: false,
    artifacts: [],
    escalation: null,
  };

  runs.set(runId, runRecord);
  appendRunAuditEvent(runRecord, 'run_submitted', runRecord.attemptCount);

  if (!dryRun) {
    setTimeout(() => {
      void executeRunWithRetry(runId);
    }, 0);
  }

  return {
    ok: true,
    run: runRecord,
  };
}

export async function startModuleRunAndWait(
  input: ModuleRunRequest,
  requestedBy: string,
  orgId: string,
): Promise<ModuleRunStartResult> {
  const started = startModuleRun(input, requestedBy, orgId);
  if (!started.ok) return started;

  if (started.run.status === 'queued' || started.run.status === 'running') {
    const waitBudgetMs = Math.min(started.run.timeoutMs + 2_000, 25_000);
    const completed = await waitForRunCompletion(started.run.id, waitBudgetMs);
    if (completed) {
      return { ok: true, run: completed };
    }
  }

  const finalRun = runs.get(started.run.id);
  if (!finalRun) return started;
  return { ok: true, run: finalRun };
}

export function getModuleRun(runId: string): ModuleRunRecord | null {
  return runs.get(runId) || null;
}

export function resolveModuleRunArtifact(runId: string, artifactPath: string): string | null {
  const run = runs.get(runId);
  if (!run) return null;
  const artifact = run.artifacts.find((entry) => entry.path === artifactPath);
  if (!artifact) return null;

  const absolutePath = resolveArtifactAbsolutePath(run, artifact.path);
  if (!existsSync(absolutePath)) return null;

  let stats: Stats;
  try {
    stats = statSync(absolutePath);
  } catch {
    return null;
  }

  if (!stats.isFile()) return null;
  return absolutePath;
}

export function listModuleCatalog(): ModuleCatalogEntry[] {
  return getCatalog();
}

export function buildValidationError(
  message: string,
  details?: string[],
  fieldErrors?: ModuleValidationIssue[],
): ModuleRunError {
  return {
    code: 'VALIDATION_ERROR',
    message,
    details,
    fieldErrors,
  };
}
