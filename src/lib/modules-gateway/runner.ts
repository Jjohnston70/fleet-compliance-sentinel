import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, statSync, type Stats } from 'node:fs';
import path from 'node:path';
import {
  getCatalog,
  getModuleAction,
  getModuleDefinition,
  moduleDirectoryExists,
  moduleGatewayLimits,
  validateActionArgs,
} from '@/lib/modules-gateway/registry';
import type {
  ModuleCatalogEntry,
  ModuleRunArtifact,
  ModuleRunError,
  ModuleRunRecord,
  ModuleRunRequest,
  ModuleRunStartResult,
} from '@/lib/modules-gateway/types';

const runs = new Map<string, ModuleRunRecord>();
const FAILURE_ALERT_WEBHOOK_URL = process.env.MODULE_GATEWAY_FAILURE_WEBHOOK_URL;

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
  if (failedRun) {
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

function getPaperstackArtifactCandidates(run: ModuleRunRecord): string[] {
  const args = run.args;
  const inputPath = typeof args.inputPath === 'string' ? args.inputPath : null;
  const outputPath = typeof args.outputPath === 'string' ? args.outputPath : null;

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

  return [];
}

function resolveArtifactAbsolutePath(run: ModuleRunRecord, candidate: string): string {
  if (path.isAbsolute(candidate)) return candidate;
  return path.resolve(run.cwd, candidate);
}

function collectRunArtifacts(run: ModuleRunRecord, stdoutRaw = ''): ModuleRunArtifact[] {
  let candidates: string[] = [];
  if (run.moduleId === 'MOD-PAPERSTACK-PP') {
    candidates = getPaperstackArtifactCandidates(run);
  } else if (run.moduleId === 'ML-SIGNAL-STACK-TNCC') {
    candidates = getMlSignalArtifactCandidates(run, stdoutRaw);
  } else {
    return [];
  }

  if (candidates.length === 0) {
    return [];
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
          code: 'EXEC_FAILED',
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

export function startModuleRun(input: ModuleRunRequest, requestedBy: string): ModuleRunStartResult {
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

  if (!moduleDirectoryExists(moduleDef)) {
    return {
      ok: false,
      httpStatus: 404,
      error: {
        code: 'MODULE_NOT_FOUND',
        message: `Module working directory not found for '${input.moduleId}'`,
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

  const validation = validateActionArgs(action, input.args);
  if (!validation.valid) {
    return {
      ok: false,
      httpStatus: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Action args validation failed',
        details: validation.errors,
      },
    };
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
  const dryRun = Boolean(input.dryRun);
  const dryRunMessage = dryRun ? `Dry run validated command: ${command.join(' ')}` : '';

  const runRecord: ModuleRunRecord = {
    id: runId,
    moduleId: input.moduleId,
    actionId: input.actionId,
    status: dryRun ? 'success' : 'queued',
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
    exitCode: dryRun ? 0 : null,
    stdoutPreview: dryRunMessage,
    stderrPreview: '',
    stdoutTruncated: false,
    stderrTruncated: false,
    artifacts: [],
  };

  runs.set(runId, runRecord);

  if (!dryRun) {
    setTimeout(() => {
      void executeRun(runId);
    }, 0);
  }

  return {
    ok: true,
    run: runRecord,
  };
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

export function buildValidationError(message: string, details?: string[]): ModuleRunError {
  return {
    code: 'VALIDATION_ERROR',
    message,
    details,
  };
}
