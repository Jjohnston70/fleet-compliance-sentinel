import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingEventEnvelope,
  OnboardingRunCreateInput,
  OnboardingRunDetail,
  OnboardingRunRecord,
  OnboardingStepStatus,
  OnboardingStepRecord,
  OnboardingTaskRecord,
} from '@/lib/onboarding/types';
import {
  createOnboardingService,
  OnboardingServiceError,
  type OnboardingAdapters,
  type OnboardingStore,
} from '@/lib/onboarding/service';

function nowIso(): string {
  return new Date().toISOString();
}

class InMemoryOnboardingStore implements OnboardingStore {
  private readonly profiles = new Map<string, OnboardingEmployeeProfile>();
  private readonly runs = new Map<string, OnboardingRunRecord>();
  private readonly stepsByRun = new Map<string, Map<string, OnboardingStepRecord>>();
  private readonly tasksByRun = new Map<string, Map<string, OnboardingTaskRecord>>();
  private readonly idempotencyIndex = new Map<string, string>();
  private readonly events: OnboardingEventEnvelope[] = [];

  getEvents(): OnboardingEventEnvelope[] {
    return [...this.events];
  }

  private sanitizeEmployee(input: OnboardingEmployeeInput): OnboardingEmployeeInput {
    return {
      ...input,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      status: input.status?.trim() || 'active',
      metadata: input.metadata || {},
    };
  }

  async createEmployeeProfile(input: {
    orgId: string;
    createdBy: string;
    employee: OnboardingEmployeeInput;
  }): Promise<OnboardingEmployeeProfile> {
    const employee = this.sanitizeEmployee(input.employee);
    const id = randomUUID();
    const timestamp = nowIso();
    const profile: OnboardingEmployeeProfile = {
      id,
      orgId: input.orgId,
      externalEmployeeId: employee.externalEmployeeId || null,
      clerkUserId: employee.clerkUserId || null,
      firstName: employee.firstName,
      lastName: employee.lastName,
      workEmail: employee.workEmail || null,
      department: employee.department || null,
      jobTitle: employee.jobTitle || null,
      hireDate: employee.hireDate || null,
      status: employee.status || 'active',
      isDriver: Boolean(employee.isDriver),
      hazmatRequired: Boolean(employee.hazmatRequired),
      hazmatEndorsement: employee.hazmatEndorsement || null,
      cdlClass: employee.cdlClass || null,
      cdlExpiration: employee.cdlExpiration || null,
      medicalExpiration: employee.medicalExpiration || null,
      metadata: employee.metadata || {},
      createdBy: input.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateEmployeeProfile(input: {
    orgId: string;
    employeeProfileId: string;
    employee: OnboardingEmployeeInput;
  }): Promise<OnboardingEmployeeProfile | null> {
    const existing = this.profiles.get(input.employeeProfileId);
    if (!existing || existing.orgId !== input.orgId) return null;
    const employee = this.sanitizeEmployee(input.employee);
    const updated: OnboardingEmployeeProfile = {
      ...existing,
      externalEmployeeId: employee.externalEmployeeId || null,
      clerkUserId: employee.clerkUserId || null,
      firstName: employee.firstName,
      lastName: employee.lastName,
      workEmail: employee.workEmail || null,
      department: employee.department || null,
      jobTitle: employee.jobTitle || null,
      hireDate: employee.hireDate || null,
      status: employee.status || 'active',
      isDriver: Boolean(employee.isDriver),
      hazmatRequired: Boolean(employee.hazmatRequired),
      hazmatEndorsement: employee.hazmatEndorsement || null,
      cdlClass: employee.cdlClass || null,
      cdlExpiration: employee.cdlExpiration || null,
      medicalExpiration: employee.medicalExpiration || null,
      metadata: employee.metadata || {},
      updatedAt: nowIso(),
    };
    this.profiles.set(input.employeeProfileId, updated);
    return updated;
  }

  async createRun(input: OnboardingRunCreateInput): Promise<OnboardingRunRecord> {
    if (input.idempotencyKey) {
      const key = `${input.orgId}:${input.employeeProfileId}:${input.source}:${input.idempotencyKey}`;
      const existingRunId = this.idempotencyIndex.get(key);
      if (existingRunId) {
        const existing = this.runs.get(existingRunId);
        if (existing) return existing;
      }
      const run = this.buildRun(input);
      this.runs.set(run.id, run);
      this.idempotencyIndex.set(key, run.id);
      return run;
    }

    const run = this.buildRun(input);
    this.runs.set(run.id, run);
    return run;
  }

  private buildRun(input: OnboardingRunCreateInput): OnboardingRunRecord {
    const timestamp = nowIso();
    return {
      id: randomUUID(),
      orgId: input.orgId,
      employeeProfileId: input.employeeProfileId,
      status: 'running',
      source: input.source,
      initiatedBy: input.initiatedBy,
      startedAt: timestamp,
      completedAt: null,
      errorSummary: null,
      idempotencyKey: input.idempotencyKey || null,
      metadata: input.metadata || {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  async listRuns(orgId: string, limit = 100): Promise<OnboardingRunRecord[]> {
    return [...this.runs.values()]
      .filter((run) => run.orgId === orgId)
      .slice(0, limit);
  }

  async getRunDetail(input: { orgId: string; runId: string }): Promise<OnboardingRunDetail | null> {
    const run = this.runs.get(input.runId);
    if (!run || run.orgId !== input.orgId) return null;
    const employeeProfile = this.profiles.get(run.employeeProfileId);
    if (!employeeProfile || employeeProfile.orgId !== input.orgId) return null;
    const stepMap = this.stepsByRun.get(run.id) || new Map();
    const steps = [...stepMap.values()].sort((a, b) => a.stepKey.localeCompare(b.stepKey));
    return {
      run,
      employeeProfile,
      steps,
    };
  }

  async listRunSteps(runId: string): Promise<OnboardingStepRecord[]> {
    const stepMap = this.stepsByRun.get(runId) || new Map();
    return [...stepMap.values()];
  }

  async upsertStep(input: {
    runId: string;
    stepKey: string;
    status: OnboardingStepStatus;
    output: Record<string, unknown>;
    errorMessage?: string | null;
  }): Promise<OnboardingStepRecord> {
    const runSteps = this.stepsByRun.get(input.runId) || new Map<string, OnboardingStepRecord>();
    this.stepsByRun.set(input.runId, runSteps);
    const existing = runSteps.get(input.stepKey);
    if (existing && existing.status === 'completed') {
      return existing;
    }

    const timestamp = nowIso();
    const next: OnboardingStepRecord = {
      id: existing?.id || randomUUID(),
      runId: input.runId,
      stepKey: input.stepKey,
      status: input.status,
      attemptCount: existing ? existing.attemptCount + 1 : 1,
      startedAt: existing?.startedAt || timestamp,
      completedAt: input.status === 'queued' || input.status === 'running' ? null : timestamp,
      errorMessage: input.errorMessage || null,
      output: existing?.status === 'completed' ? existing.output : input.output,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    runSteps.set(input.stepKey, next);
    return next;
  }

  async markRunCompleted(input: {
    orgId: string;
    runId: string;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingRunRecord | null> {
    const run = this.runs.get(input.runId);
    if (!run || run.orgId !== input.orgId) return null;
    const next: OnboardingRunRecord = {
      ...run,
      status: 'completed',
      completedAt: nowIso(),
      metadata: {
        ...run.metadata,
        ...(input.metadata || {}),
      },
      updatedAt: nowIso(),
    };
    this.runs.set(input.runId, next);
    return next;
  }

  async upsertFallbackTask(input: {
    orgId: string;
    runId: string;
    employeeProfileId: string;
    taskKey: string;
    title: string;
    dueDate?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingTaskRecord> {
    const runTasks = this.tasksByRun.get(input.runId) || new Map<string, OnboardingTaskRecord>();
    this.tasksByRun.set(input.runId, runTasks);
    const existing = runTasks.get(input.taskKey);
    if (existing) {
      return existing;
    }
    const timestamp = nowIso();
    const task: OnboardingTaskRecord = {
      id: randomUUID(),
      orgId: input.orgId,
      runId: input.runId,
      employeeProfileId: input.employeeProfileId,
      taskKey: input.taskKey,
      title: input.title,
      dueDate: input.dueDate || null,
      status: 'pending',
      externalTaskId: null,
      metadata: input.metadata || {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    runTasks.set(input.taskKey, task);
    return task;
  }

  async insertOnboardingEvent(event: OnboardingEventEnvelope): Promise<void> {
    this.events.push(event);
  }
}

function sampleEmployeeInput(overrides: Partial<OnboardingEmployeeInput> = {}): OnboardingEmployeeInput {
  return {
    firstName: 'Jane',
    lastName: 'Driver',
    workEmail: 'jane@example.com',
    isDriver: true,
    hazmatRequired: true,
    hireDate: '2026-04-01',
    ...overrides,
  };
}

function defaultAdapters(): OnboardingAdapters {
  return {
    async assignHazmatTrainingIfRequired(input) {
      return {
        status: 'completed',
        reason: 'assigned',
        assignmentId: `asg-${input.employee.id}`,
        planId: 'plan-hazmat',
        planName: 'PHMSA Hazmat Required Training',
        moduleCount: 12,
        employeeIdentifier: input.employee.id,
        deadlineDate: input.deadlineDate,
      };
    },
    async seedSuspenseFromTraining() {
      return {
        status: 'completed',
        reason: 'seeded',
        linkedAssignmentCount: 1,
      };
    },
  };
}

test('create/update starts onboarding runs and writes deterministic steps', async () => {
  const store = new InMemoryOnboardingStore();
  const service = createOnboardingService(store, defaultAdapters());
  const context = { orgId: 'org_a', userId: 'user_admin' };

  const created = await service.createEmployeeAndStartRun({
    context,
    employee: sampleEmployeeInput(),
    idempotencyKey: 'create-emp-1',
  });

  assert.equal(created.run.status, 'completed');
  assert.ok(created.steps.length >= 5);
  assert.ok(created.steps.some((step) => step.stepKey === 'rules.evaluate'));
  assert.ok(created.steps.some((step) => step.stepKey === 'training.assign' && step.status === 'completed'));
  assert.ok(created.steps.some((step) => step.stepKey === 'suspense.seed' && step.status === 'completed'));

  const updated = await service.updateEmployeeAndStartRun({
    context,
    employeeProfileId: created.employeeProfile.id,
    employee: sampleEmployeeInput({ jobTitle: 'Lead Driver' }),
    idempotencyKey: 'update-emp-1',
  });

  assert.equal(updated.run.status, 'completed');
  assert.equal(updated.employeeProfile.jobTitle, 'Lead Driver');
  assert.ok(updated.steps.length >= 5);
});

test('cross-org access is rejected by org-scoped service calls', async () => {
  const store = new InMemoryOnboardingStore();
  const service = createOnboardingService(store, defaultAdapters());

  const created = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'user_admin' },
    employee: sampleEmployeeInput(),
    idempotencyKey: 'cross-org-create',
  });

  await assert.rejects(
    service.getRunDetail({ orgId: 'org_b', runId: created.run.id }),
    (error: unknown) => error instanceof OnboardingServiceError && error.status === 404,
  );

  await assert.rejects(
    service.updateEmployeeAndStartRun({
      context: { orgId: 'org_b', userId: 'user_admin_b' },
      employeeProfileId: created.employeeProfile.id,
      employee: sampleEmployeeInput({ firstName: 'Tamper' }),
      idempotencyKey: 'cross-org-update',
    }),
    (error: unknown) => error instanceof OnboardingServiceError && error.status === 404,
  );
});

test('retry does not duplicate successful steps and run creation is idempotent by key', async () => {
  const store = new InMemoryOnboardingStore();
  const service = createOnboardingService(store, defaultAdapters());
  const context = { orgId: 'org_a', userId: 'user_admin' };

  const created = await service.createEmployeeAndStartRun({
    context,
    employee: sampleEmployeeInput(),
    idempotencyKey: 'seed-idempotent',
  });

  const updatedA = await service.updateEmployeeAndStartRun({
    context,
    employeeProfileId: created.employeeProfile.id,
    employee: sampleEmployeeInput({ jobTitle: 'Trainer' }),
    idempotencyKey: 'idem-update-1',
  });
  const updatedB = await service.updateEmployeeAndStartRun({
    context,
    employeeProfileId: created.employeeProfile.id,
    employee: sampleEmployeeInput({ jobTitle: 'Trainer' }),
    idempotencyKey: 'idem-update-1',
  });

  assert.equal(updatedA.run.id, updatedB.run.id);

  const beforeRetry = await service.getRunDetail({
    orgId: context.orgId,
    runId: created.run.id,
  });
  assert.equal(beforeRetry.steps.every((step) => step.status === 'completed'), true);

  const afterRetry = await service.retryRun({
    context,
    runId: created.run.id,
  });

  assert.equal(afterRetry.steps.length, beforeRetry.steps.length);
  assert.deepEqual(
    afterRetry.steps.map((step) => [step.stepKey, step.attemptCount]),
    beforeRetry.steps.map((step) => [step.stepKey, step.attemptCount]),
  );
  assert.ok(store.getEvents().some((event) => event.eventType === 'employee.onboarding.completed'));
});

test('driver + hazmat profile gets 90-day deadline assignment request', async () => {
  const store = new InMemoryOnboardingStore();
  let capturedDeadline = '';
  const service = createOnboardingService(store, {
    ...defaultAdapters(),
    async assignHazmatTrainingIfRequired(input) {
      capturedDeadline = input.deadlineDate;
      return {
        status: 'completed',
        reason: 'assigned',
        assignmentId: 'asg-1',
        planId: 'plan-hazmat',
        planName: 'PHMSA Hazmat Required Training',
        moduleCount: 12,
        employeeIdentifier: input.employee.id,
        deadlineDate: input.deadlineDate,
      };
    },
  });

  const created = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'user_admin' },
    employee: sampleEmployeeInput({ hireDate: '2026-04-01' }),
  });

  assert.equal(capturedDeadline, '2026-06-30');
  assert.ok(created.steps.some((step) => step.stepKey === 'training.assign' && step.status === 'completed'));
});

test('non-driver skips training assignment step deterministically', async () => {
  const store = new InMemoryOnboardingStore();
  let adapterCalled = false;
  const service = createOnboardingService(store, {
    ...defaultAdapters(),
    async assignHazmatTrainingIfRequired() {
      adapterCalled = true;
      return {
        status: 'completed',
        reason: 'assigned',
      };
    },
  });

  const created = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'user_admin' },
    employee: sampleEmployeeInput({ isDriver: false }),
  });

  assert.equal(adapterCalled, false);
  assert.ok(created.steps.some((step) => step.stepKey === 'training.assign' && step.status === 'skipped'));
});

test('training-disabled path records graceful skip and audit event', async () => {
  const store = new InMemoryOnboardingStore();
  const service = createOnboardingService(store, {
    ...defaultAdapters(),
    async assignHazmatTrainingIfRequired() {
      return {
        status: 'skipped',
        reason: 'module_disabled',
        message: "Module 'training' disabled",
      };
    },
  });

  const created = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'user_admin' },
    employee: sampleEmployeeInput(),
  });

  assert.ok(created.steps.some((step) => step.stepKey === 'training.assign' && step.status === 'skipped'));
  assert.ok(store.getEvents().some((event) => event.eventType === 'employee.training.assignment.requested'));
});

test('suspense seeding emits seeded event when training deadline source exists', async () => {
  const store = new InMemoryOnboardingStore();
  const service = createOnboardingService(store, {
    ...defaultAdapters(),
    async seedSuspenseFromTraining() {
      return {
        status: 'completed',
        reason: 'seeded',
        linkedAssignmentCount: 2,
      };
    },
  });

  await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'user_admin' },
    employee: sampleEmployeeInput(),
  });

  assert.ok(store.getEvents().some((event) => event.eventType === 'employee.suspense.seeded'));
});
