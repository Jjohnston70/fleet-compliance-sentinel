import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processTaskSyncEvent,
  seedOnboardingTask,
  type TaskAdapterDependencies,
} from '@/lib/onboarding/adapters/task-adapter';
import {
  processNotificationEvent,
  queueOnboardingNotification,
  type NotificationAdapterDependencies,
} from '@/lib/onboarding/adapters/notification-adapter';
import { processOnboardingOutboxBatch, type OutboxWorkerDependencies } from '@/lib/onboarding/outbox-worker';
import type { OnboardingEmployeeProfile, OnboardingOutboxEventRecord, OnboardingTaskRecord } from '@/lib/onboarding/types';

function sampleEmployee(overrides: Partial<OnboardingEmployeeProfile> = {}): OnboardingEmployeeProfile {
  return {
    id: 'emp-profile-1',
    orgId: 'org_a',
    externalEmployeeId: 'emp-001',
    clerkUserId: null,
    firstName: 'Casey',
    lastName: 'Driver',
    workEmail: 'casey.driver@example.com',
    department: null,
    jobTitle: null,
    hireDate: '2026-01-01',
    status: 'active',
    isDriver: true,
    hazmatRequired: true,
    hazmatEndorsement: null,
    cdlClass: null,
    cdlExpiration: null,
    medicalExpiration: null,
    metadata: {},
    createdBy: 'user_admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createTaskDependencies(options?: {
  failPrimary?: boolean;
}): {
  deps: TaskAdapterDependencies;
  tasks: Map<string, OnboardingTaskRecord>;
  queued: Array<{ orgId: string; runId: string; dedupeKey: string; payload: Record<string, unknown> }>;
} {
  const tasks = new Map<string, OnboardingTaskRecord>();
  const queued: Array<{ orgId: string; runId: string; dedupeKey: string; payload: Record<string, unknown> }> = [];

  const deps: TaskAdapterDependencies = {
    async getModules() {
      return ['onboarding', 'tasks'];
    },
    async persistFallbackTask(input) {
      const task: OnboardingTaskRecord = {
        id: 'task-1',
        orgId: input.orgId,
        runId: input.runId,
        employeeProfileId: input.employeeProfileId,
        taskKey: input.taskKey,
        title: input.title,
        dueDate: input.dueDate ?? null,
        status: 'pending',
        externalTaskId: null,
        syncAttemptCount: 0,
        syncLastError: null,
        metadata: input.metadata ?? {},
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      tasks.set(task.id, task);
      return task;
    },
    async updateExternalTaskId(input) {
      const existing = tasks.get(input.taskId);
      if (!existing) return null;
      const next = { ...existing, externalTaskId: input.externalTaskId };
      tasks.set(input.taskId, next);
      return next;
    },
    async recordTaskSyncFailure(input) {
      const existing = tasks.get(input.taskId);
      if (!existing) return;
      tasks.set(input.taskId, {
        ...existing,
        syncAttemptCount: (existing.syncAttemptCount ?? 0) + 1,
        syncLastError: input.errorMessage,
      });
    },
    async enqueueTaskSyncEvent(input) {
      queued.push(input);
    },
    async callPrimaryTaskCreate() {
      if (options?.failPrimary) {
        throw new Error('task command returned 503: unavailable');
      }
      return { externalTaskId: 'ext-task-1' };
    },
  };

  return { deps, tasks, queued };
}

test('task primary path success persists external IDs', async () => {
  const { deps, tasks, queued } = createTaskDependencies();
  const result = await seedOnboardingTask(
    {
      orgId: 'org_a',
      runId: 'run_a',
      employee: sampleEmployee(),
      taskKey: 'verify-profile-data',
      title: 'Verify onboarding profile data',
    },
    deps,
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.reason, 'primary_created');
  assert.equal(result.externalTaskId, 'ext-task-1');
  assert.equal(tasks.get('task-1')?.externalTaskId, 'ext-task-1');
  assert.equal(queued.length, 0);
});

test('task fallback path works when primary fails', async () => {
  const { deps, tasks, queued } = createTaskDependencies({ failPrimary: true });
  const result = await seedOnboardingTask(
    {
      orgId: 'org_a',
      runId: 'run_a',
      employee: sampleEmployee(),
      taskKey: 'verify-profile-data',
      title: 'Verify onboarding profile data',
    },
    deps,
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.reason, 'fallback_persisted');
  assert.equal(result.queuedForRetry, true);
  assert.equal(tasks.get('task-1')?.externalTaskId, null);
  assert.equal(queued.length, 1);
});

test('reconcile path backfills external task IDs from sync payload', async () => {
  const { deps, tasks } = createTaskDependencies();
  await deps.persistFallbackTask({
    orgId: 'org_a',
    runId: 'run_a',
    employeeProfileId: 'emp-profile-1',
    taskKey: 'verify-profile-data',
    title: 'Verify onboarding profile data',
    dueDate: '2026-04-01',
    metadata: {},
  });

  const syncResult = await processTaskSyncEvent(
    {
      orgId: 'org_a',
      runId: 'run_a',
      taskId: 'task-1',
      taskKey: 'verify-profile-data',
      title: 'Verify onboarding profile data',
      dueDate: '2026-04-01',
      employeeProfileId: 'emp-profile-1',
      idempotencyKey: 'onboarding:run_a:verify-profile-data',
    },
    deps,
  );

  assert.equal(syncResult.status, 'completed');
  assert.equal(syncResult.reason, 'synchronized');
  assert.equal(tasks.get('task-1')?.externalTaskId, 'ext-task-1');
});

test('notification queue/send path works with template rendering and analytics copy', async () => {
  const queuedEvents: Array<{ payload: Record<string, unknown> }> = [];
  const sentMessages: Array<{ to: string; cc?: string[]; subject: string; html: string }> = [];

  const deps: NotificationAdapterDependencies = {
    async getModules() {
      return ['onboarding', 'email-analytics'];
    },
    async enqueue(input) {
      queuedEvents.push({ payload: input.payload });
    },
    async sendEmail(input) {
      sentMessages.push(input);
    },
  };

  const previousAnalyticsCopy = process.env.ONBOARDING_ANALYTICS_COPY_EMAIL;
  process.env.ONBOARDING_ANALYTICS_COPY_EMAIL = 'analytics@example.com';

  try {
    const queued = await queueOnboardingNotification(
      {
        orgId: 'org_a',
        runId: 'run_a',
        employee: sampleEmployee(),
        templateKey: 'employee-onboarding-completed',
      },
      deps,
    );

    assert.equal(queued.status, 'completed');
    assert.equal(queued.reason, 'queued');
    assert.equal(queuedEvents.length, 1);

    const sent = await processNotificationEvent(queuedEvents[0].payload, deps);
    assert.equal(sent.status, 'completed');
    assert.equal(sent.reason, 'sent');
    assert.equal(sentMessages.length, 1);
    assert.match(sentMessages[0].subject, /Onboarding completed/i);
    assert.match(sentMessages[0].html, /run_a/);
    assert.deepEqual(sentMessages[0].cc, ['analytics@example.com']);
  } finally {
    process.env.ONBOARDING_ANALYTICS_COPY_EMAIL = previousAnalyticsCopy;
  }
});

test('outbox retries recover transient failures without duplication', async () => {
  const event: OnboardingOutboxEventRecord = {
    id: 'outbox-1',
    orgId: 'org_a',
    runId: 'run_a',
    eventType: 'onboarding.notification.send',
    payload: {
      to: 'casey.driver@example.com',
      templateKey: 'employee-onboarding-completed',
      runId: 'run_a',
      employeeFirstName: 'Casey',
      employeeLastName: 'Driver',
      cc: [],
    },
    status: 'pending',
    attemptCount: 0,
    nextAttemptAt: '2026-01-01T00:00:00.000Z',
    lastError: null,
    dedupeKey: 'notify:run_a:employee-onboarding-completed:casey.driver@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    processedAt: null,
  };

  let sendAttempts = 0;
  const deps: OutboxWorkerDependencies = {
    async listDueOutboxEvents() {
      return event.status === 'pending' || event.status === 'retrying' ? [event] : [];
    },
    async markProcessed() {
      event.status = 'processed';
      event.processedAt = '2026-01-01T01:00:00.000Z';
    },
    async markRetry(input) {
      event.attemptCount += 1;
      event.status = input.terminal ? 'failed' : 'retrying';
      event.lastError = input.errorMessage;
      event.nextAttemptAt = input.nextAttemptAt.toISOString();
    },
    async processTaskSync() {
      return { status: 'completed' };
    },
    async processNotification() {
      sendAttempts += 1;
      if (sendAttempts === 1) {
        return {
          status: 'failed',
          reason: 'provider_error',
          retryable: true,
          message: 'transient provider error',
        };
      }
      return {
        status: 'completed',
        reason: 'sent',
        retryable: false,
      };
    },
  };

  const first = await processOnboardingOutboxBatch({ limit: 10, deps });
  assert.equal(first.polled, 1);
  assert.equal(first.retried, 1);
  assert.equal(first.processed, 0);
  assert.equal(event.status, 'retrying');

  const second = await processOnboardingOutboxBatch({ limit: 10, deps });
  assert.equal(second.polled, 1);
  assert.equal(second.processed, 1);
  assert.equal(second.retried, 0);
  assert.equal(event.status, 'processed');

  const third = await processOnboardingOutboxBatch({ limit: 10, deps });
  assert.equal(third.polled, 0);
  assert.equal(sendAttempts, 2);
});
