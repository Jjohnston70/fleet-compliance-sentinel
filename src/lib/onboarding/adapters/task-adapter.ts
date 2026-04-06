import { getOrgModules } from '@/lib/modules';
import {
  enqueueOutboxEvent,
  listUnsyncedOnboardingTasks,
  markOnboardingTaskSyncFailure,
  updateOnboardingTaskExternalId,
  upsertFallbackTask,
} from '@/lib/onboarding/repository';
import type { OnboardingEmployeeProfile, OnboardingTaskRecord } from '@/lib/onboarding/types';

export interface TaskSeedResult {
  status: 'completed' | 'skipped' | 'failed';
  reason:
    | 'primary_created'
    | 'fallback_persisted'
    | 'module_disabled'
    | 'primary_unavailable'
    | 'error';
  taskId?: string;
  externalTaskId?: string;
  queuedForRetry?: boolean;
  message?: string;
}

export interface TaskSyncResult {
  status: 'completed' | 'failed';
  reason: 'synchronized' | 'error';
  taskId: string;
  externalTaskId?: string;
  message?: string;
}

interface PrimaryTaskPayload {
  orgId: string;
  runId: string;
  taskId: string;
  taskKey: string;
  title: string;
  dueDate: string | null;
  employeeProfileId: string;
  idempotencyKey: string;
}

export interface TaskAdapterDependencies {
  getModules(orgId: string): Promise<string[]>;
  persistFallbackTask(input: {
    orgId: string;
    runId: string;
    employeeProfileId: string;
    taskKey: string;
    title: string;
    dueDate?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingTaskRecord>;
  updateExternalTaskId(input: { orgId: string; taskId: string; externalTaskId: string }): Promise<OnboardingTaskRecord | null>;
  recordTaskSyncFailure(input: { orgId: string; taskId: string; errorMessage: string }): Promise<void>;
  enqueueTaskSyncEvent(input: {
    orgId: string;
    runId: string;
    payload: Record<string, unknown>;
    dedupeKey: string;
  }): Promise<void>;
  callPrimaryTaskCreate(payload: PrimaryTaskPayload): Promise<{ externalTaskId: string }>;
}

async function callPrimaryTaskCreate(payload: PrimaryTaskPayload): Promise<{ externalTaskId: string }> {
  const endpoint = process.env.ONBOARDING_TASK_COMMAND_URL?.trim();
  if (!endpoint) {
    throw new Error('ONBOARDING_TASK_COMMAND_URL is not configured');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': payload.idempotencyKey,
    },
    body: JSON.stringify({
      orgId: payload.orgId,
      runId: payload.runId,
      taskId: payload.taskId,
      taskKey: payload.taskKey,
      title: payload.title,
      dueDate: payload.dueDate,
      employeeProfileId: payload.employeeProfileId,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`task command returned ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json().catch(() => ({}));
  const externalTaskId = typeof data?.externalTaskId === 'string' ? data.externalTaskId.trim() : '';
  if (!externalTaskId) {
    throw new Error('task command response missing externalTaskId');
  }

  return { externalTaskId };
}

const DEFAULT_DEPS: TaskAdapterDependencies = {
  getModules: getOrgModules,
  persistFallbackTask: upsertFallbackTask,
  updateExternalTaskId: updateOnboardingTaskExternalId,
  async recordTaskSyncFailure(input) {
    await markOnboardingTaskSyncFailure(input);
  },
  async enqueueTaskSyncEvent(input) {
    await enqueueOutboxEvent({
      orgId: input.orgId,
      runId: input.runId,
      eventType: 'onboarding.task.sync',
      payload: input.payload,
      dedupeKey: input.dedupeKey,
    });
  },
  callPrimaryTaskCreate,
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function queueTaskSync(input: {
  task: OnboardingTaskRecord;
  runId: string;
  deps: TaskAdapterDependencies;
}): Promise<void> {
  await input.deps.enqueueTaskSyncEvent({
    orgId: input.task.orgId,
    runId: input.runId,
    dedupeKey: `task-sync:${input.task.runId}:${input.task.taskKey}`,
    payload: {
      orgId: input.task.orgId,
      runId: input.task.runId,
      taskId: input.task.id,
      taskKey: input.task.taskKey,
      title: input.task.title,
      dueDate: input.task.dueDate,
      employeeProfileId: input.task.employeeProfileId,
      idempotencyKey: `onboarding:${input.task.runId}:${input.task.taskKey}`,
    },
  });
}

export async function seedOnboardingTask(input: {
  orgId: string;
  runId: string;
  employee: OnboardingEmployeeProfile;
  taskKey: string;
  title: string;
  dueDate?: string | null;
  metadata?: Record<string, unknown>;
}, deps: TaskAdapterDependencies = DEFAULT_DEPS): Promise<TaskSeedResult> {
  const modules = await deps.getModules(input.orgId);
  if (!modules.includes('tasks')) {
    return {
      status: 'skipped',
      reason: 'module_disabled',
      message: "Module 'tasks' is disabled for this organization",
    };
  }

  const task = await deps.persistFallbackTask({
    orgId: input.orgId,
    runId: input.runId,
    employeeProfileId: input.employee.id,
    taskKey: input.taskKey,
    title: input.title,
    dueDate: input.dueDate ?? null,
    metadata: input.metadata ?? {},
  });

  const primaryPayload: PrimaryTaskPayload = {
    orgId: task.orgId,
    runId: task.runId,
    taskId: task.id,
    taskKey: task.taskKey,
    title: task.title,
    dueDate: task.dueDate,
    employeeProfileId: task.employeeProfileId,
    idempotencyKey: `onboarding:${task.runId}:${task.taskKey}`,
  };

  try {
    const created = await deps.callPrimaryTaskCreate(primaryPayload);
    await deps.updateExternalTaskId({
      orgId: task.orgId,
      taskId: task.id,
      externalTaskId: created.externalTaskId,
    });
    return {
      status: 'completed',
      reason: 'primary_created',
      taskId: task.id,
      externalTaskId: created.externalTaskId,
    };
  } catch (error: unknown) {
    const message = toErrorMessage(error);
    await deps.recordTaskSyncFailure({
      orgId: task.orgId,
      taskId: task.id,
      errorMessage: message,
    });
    await queueTaskSync({
      task,
      runId: input.runId,
      deps,
    });
    return {
      status: 'completed',
      reason: message.includes('ONBOARDING_TASK_COMMAND_URL')
        ? 'primary_unavailable'
        : 'fallback_persisted',
      taskId: task.id,
      queuedForRetry: true,
      message,
    };
  }
}

export async function reconcileUnsyncedOnboardingTasks(input: {
  orgId?: string;
  limit?: number;
}): Promise<{ queued: number }> {
  const rows = await listUnsyncedOnboardingTasks({
    orgId: input.orgId,
    limit: input.limit ?? 100,
  });
  let queued = 0;
  for (const row of rows) {
    await enqueueOutboxEvent({
      orgId: row.orgId,
      runId: row.runId,
      eventType: 'onboarding.task.sync',
      dedupeKey: `task-sync:${row.runId}:${row.taskKey}`,
      payload: {
        orgId: row.orgId,
        runId: row.runId,
        taskId: row.id,
        taskKey: row.taskKey,
        title: row.title,
        dueDate: row.dueDate,
        employeeProfileId: row.employeeProfileId,
        idempotencyKey: `onboarding:${row.runId}:${row.taskKey}`,
      },
    });
    queued += 1;
  }
  return { queued };
}

export async function processTaskSyncEvent(
  payload: Record<string, unknown>,
  deps: TaskAdapterDependencies = DEFAULT_DEPS,
): Promise<TaskSyncResult> {
  const orgId = typeof payload.orgId === 'string' ? payload.orgId : '';
  const taskId = typeof payload.taskId === 'string' ? payload.taskId : '';
  const runId = typeof payload.runId === 'string' ? payload.runId : '';
  const taskKey = typeof payload.taskKey === 'string' ? payload.taskKey : '';
  const title = typeof payload.title === 'string' ? payload.title : '';
  const dueDate = typeof payload.dueDate === 'string' ? payload.dueDate : null;
  const employeeProfileId = typeof payload.employeeProfileId === 'string' ? payload.employeeProfileId : '';
  const idempotencyKey = typeof payload.idempotencyKey === 'string'
    ? payload.idempotencyKey
    : `onboarding:${runId}:${taskKey}`;

  if (!orgId || !taskId || !runId || !taskKey || !title || !employeeProfileId) {
    return {
      status: 'failed',
      reason: 'error',
      taskId: taskId || 'unknown',
      message: 'Invalid task sync payload',
    };
  }

  try {
    const result = await deps.callPrimaryTaskCreate({
      orgId,
      runId,
      taskId,
      taskKey,
      title,
      dueDate,
      employeeProfileId,
      idempotencyKey,
    });

    await deps.updateExternalTaskId({
      orgId,
      taskId,
      externalTaskId: result.externalTaskId,
    });

    return {
      status: 'completed',
      reason: 'synchronized',
      taskId,
      externalTaskId: result.externalTaskId,
    };
  } catch (error: unknown) {
    const message = toErrorMessage(error);
    await deps.recordTaskSyncFailure({
      orgId,
      taskId,
      errorMessage: message,
    });
    return {
      status: 'failed',
      reason: 'error',
      taskId,
      message,
    };
  }
}
