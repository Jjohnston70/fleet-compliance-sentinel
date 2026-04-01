import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
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
  ModuleRunError,
  ModuleRunRecord,
  ModuleRunRequest,
  ModuleRunStartResult,
} from '@/lib/modules-gateway/types';

const runs = new Map<string, ModuleRunRecord>();

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

  let stdout = '';
  let stderr = '';
  let stdoutCaptureTruncated = false;
  let stderrCaptureTruncated = false;
  let timedOut = false;

  const startedAtEpoch = Date.now();

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

    if (timedOut) {
      updateRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        exitCode: null,
        stdoutPreview: stdoutPreview.preview,
        stderrPreview: stderrPreview.preview,
        stdoutTruncated: stdoutPreview.wasPreviewTruncated,
        stderrTruncated: stderrPreview.wasPreviewTruncated,
        error: {
          code: 'EXEC_TIMEOUT',
          message: `Process exceeded timeout of ${current.timeoutMs}ms`,
        },
      }));
      return;
    }

    const spawnErrorMessage = result.spawnError?.message;
    if (spawnErrorMessage) {
      updateRun(runId, (current) => ({
        ...current,
        status: 'fail',
        endedAt,
        durationMs,
        exitCode: null,
        stdoutPreview: stdoutPreview.preview,
        stderrPreview: stderrPreview.preview,
        stdoutTruncated: stdoutPreview.wasPreviewTruncated,
        stderrTruncated: stderrPreview.wasPreviewTruncated,
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
      }));
      return;
    }

    updateRun(runId, (current) => ({
      ...current,
      status: 'fail',
      endedAt,
      durationMs,
      exitCode: result.exitCode,
      stdoutPreview: stdoutPreview.preview,
      stderrPreview: stderrPreview.preview,
      stdoutTruncated: stdoutPreview.wasPreviewTruncated,
      stderrTruncated: stderrPreview.wasPreviewTruncated,
      error: {
        code: 'EXEC_FAILED',
        message: `Process exited with code ${result.exitCode ?? 'unknown'}`,
      },
    }));
  } catch (error) {
    const endedAt = nowIso();
    const durationMs = Date.now() - startedAtEpoch;
    const unknownError = error instanceof Error ? error.message : 'Unexpected runner failure';
    updateRun(runId, (current) => ({
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
