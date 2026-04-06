import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { OnboardingIntakeError, OnboardingIntakeService } from '@/lib/onboarding/intake-service';
import { hashOpaqueToken, issueSignedIntakeToken } from '@/lib/onboarding/intake-token';
import {
  createOnboardingService,
  OnboardingServiceError,
  type OnboardingAdapters,
  type OnboardingStore,
} from '@/lib/onboarding/service';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingEventEnvelope,
  OnboardingIntakeTokenRecord,
  OnboardingRunCreateInput,
  OnboardingRunDetail,
  OnboardingRunRecord,
  OnboardingStepRecord,
  OnboardingStepStatus,
  OnboardingTaskRecord,
} from '@/lib/onboarding/types';

function nowIso(): string {
  return new Date().toISOString();
}

function sampleEmployee(overrides: Partial<OnboardingEmployeeInput> = {}): OnboardingEmployeeInput {
  return {
    firstName: 'Casey',
    lastName: 'Driver',
    workEmail: 'casey.driver@example.com',
    hireDate: '2026-04-01',
    isDriver: true,
    hazmatRequired: true,
    ...overrides,
  };
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
    return [...this.runs.values()].filter((run) => run.orgId === orgId).slice(0, limit);
  }

  async getRunDetail(input: { orgId: string; runId: string }): Promise<OnboardingRunDetail | null> {
    const run = this.runs.get(input.runId);
    if (!run || run.orgId !== input.orgId) return null;
    const employeeProfile = this.profiles.get(run.employeeProfileId);
    if (!employeeProfile || employeeProfile.orgId !== input.orgId) return null;
    const stepMap = this.stepsByRun.get(run.id) || new Map();
    const steps = [...stepMap.values()].sort((a, b) => a.stepKey.localeCompare(b.stepKey));
    return { run, employeeProfile, steps };
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
    if (existing) return existing;

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

class InMemoryIntakeRepo {
  private readonly tokens = new Map<string, OnboardingIntakeTokenRecord>();
  private readonly profiles = new Map<string, OnboardingEmployeeProfile>();
  private tokenSeq = 0;

  seedToken(record: OnboardingIntakeTokenRecord): void {
    this.tokens.set(record.tokenHash, record);
  }

  createOnboardingIntakeToken = async (input: {
    orgId: string;
    employeeProfileId?: string | null;
    tokenHash: string;
    expiresAt: string;
    issuedBy: string;
    inviteAfterIntake: boolean;
    inviteOverrideAllowed: boolean;
    intakeEmail?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingIntakeTokenRecord> => {
    this.tokenSeq += 1;
    const now = nowIso();
    const record: OnboardingIntakeTokenRecord = {
      id: `tok-${this.tokenSeq}`,
      orgId: input.orgId,
      employeeProfileId: input.employeeProfileId ?? null,
      tokenHash: input.tokenHash,
      status: 'issued',
      expiresAt: input.expiresAt,
      issuedBy: input.issuedBy,
      consumedAt: null,
      inviteAfterIntake: input.inviteAfterIntake,
      inviteOverrideAllowed: input.inviteOverrideAllowed,
      intakeEmail: input.intakeEmail ?? null,
      metadata: input.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
    this.tokens.set(record.tokenHash, record);
    return record;
  };

  getOnboardingIntakeTokenByHash = async (input: {
    tokenHash: string;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    return this.tokens.get(input.tokenHash) ?? null;
  };

  claimOnboardingIntakeToken = async (input: {
    tokenHash: string;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    const existing = this.tokens.get(input.tokenHash);
    if (!existing) return null;
    if (existing.status !== 'issued') return null;
    if (new Date(existing.expiresAt).getTime() <= Date.now()) return null;

    const next: OnboardingIntakeTokenRecord = {
      ...existing,
      status: 'processing',
      updatedAt: nowIso(),
    };
    this.tokens.set(input.tokenHash, next);
    return next;
  };

  releaseOnboardingIntakeToken = async (input: {
    tokenHash: string;
    errorMessage?: string;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    const existing = this.tokens.get(input.tokenHash);
    if (!existing || existing.status !== 'processing') return null;
    if (new Date(existing.expiresAt).getTime() <= Date.now()) return null;

    const next: OnboardingIntakeTokenRecord = {
      ...existing,
      status: 'issued',
      metadata: {
        ...existing.metadata,
        lastError: input.errorMessage || '',
      },
      updatedAt: nowIso(),
    };
    this.tokens.set(input.tokenHash, next);
    return next;
  };

  consumeOnboardingIntakeToken = async (input: {
    tokenHash: string;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    const existing = this.tokens.get(input.tokenHash);
    if (!existing || existing.status !== 'processing') return null;
    if (new Date(existing.expiresAt).getTime() <= Date.now()) return null;

    const consumedAt = nowIso();
    const next: OnboardingIntakeTokenRecord = {
      ...existing,
      status: 'consumed',
      consumedAt,
      metadata: {
        ...existing.metadata,
        ...(input.metadata || {}),
      },
      updatedAt: consumedAt,
    };
    this.tokens.set(input.tokenHash, next);
    return next;
  };

  getEmployeeProfileById = async (input: {
    orgId: string;
    employeeProfileId: string;
  }): Promise<OnboardingEmployeeProfile | null> => {
    return this.profiles.get(`${input.orgId}:${input.employeeProfileId}`) ?? null;
  };
}

test('P6-T1 acceptance matrix: scenarios 1/2/5 across two orgs', async () => {
  const store = new InMemoryOnboardingStore();
  const trainingDeadlines: string[] = [];
  const trainingEmployees: string[] = [];

  const adapters: OnboardingAdapters = {
    async assignHazmatTrainingIfRequired(input) {
      trainingDeadlines.push(input.deadlineDate);
      trainingEmployees.push(input.employee.id);
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
    async seedOnboardingTask() {
      return {
        status: 'completed',
        reason: 'primary_created',
        taskId: 'task-1',
        externalTaskId: 'ext-task-1',
      };
    },
    async queueOnboardingNotification() {
      return {
        status: 'completed',
        reason: 'queued',
        queuedCount: 1,
      };
    },
  };

  const service = createOnboardingService(store, adapters);

  const nonDriver = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'admin_a' },
    employee: sampleEmployee({
      firstName: 'Alex',
      lastName: 'Operator',
      isDriver: false,
      hazmatRequired: false,
      hireDate: '2026-04-01',
    }),
  });

  assert.equal(nonDriver.run.status, 'completed');
  assert.ok(nonDriver.steps.some((step) => step.stepKey === 'training.assign' && step.status === 'skipped'));
  assert.ok(nonDriver.steps.some((step) => step.stepKey === 'tasks.seed' && step.status === 'completed'));
  assert.ok(nonDriver.steps.some((step) => step.stepKey === 'notifications.queue' && step.status === 'completed'));

  const driver = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_b', userId: 'admin_b' },
    employee: sampleEmployee({
      firstName: 'Jordan',
      lastName: 'Hazmat',
      isDriver: true,
      hazmatRequired: true,
      hireDate: '2026-04-01',
    }),
  });

  assert.equal(driver.run.status, 'completed');
  assert.ok(driver.steps.some((step) => step.stepKey === 'training.assign' && step.status === 'completed'));
  assert.ok(driver.steps.some((step) => step.stepKey === 'suspense.seed' && step.status === 'completed'));
  assert.deepEqual(trainingDeadlines, ['2026-06-30']);
  assert.deepEqual(trainingEmployees, [driver.employeeProfile.id]);
  assert.ok(
    store
      .getEvents()
      .some((event) => event.runId === driver.run.id && event.eventType === 'employee.suspense.seeded'),
  );

  await assert.rejects(
    service.getRunDetail({ orgId: 'org_a', runId: driver.run.id }),
    (error: unknown) => error instanceof OnboardingServiceError && error.status === 404,
  );

  const orgARuns = await service.listRuns({ orgId: 'org_a' });
  const orgBRuns = await service.listRuns({ orgId: 'org_b' });
  assert.equal(orgARuns.length, 1);
  assert.equal(orgBRuns.length, 1);
  assert.equal(orgARuns[0].id, nonDriver.run.id);
  assert.equal(orgBRuns[0].id, driver.run.id);
});

test('P6-T1 acceptance matrix: scenario 3 partial adapter failure + retry recovers idempotently', async () => {
  const store = new InMemoryOnboardingStore();
  let notificationAttempts = 0;

  const service = createOnboardingService(store, {
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
    async seedOnboardingTask() {
      return {
        status: 'completed',
        reason: 'primary_created',
        taskId: 'task-1',
        externalTaskId: 'ext-task-1',
      };
    },
    async queueOnboardingNotification() {
      notificationAttempts += 1;
      if (notificationAttempts === 1) {
        return {
          status: 'failed',
          reason: 'provider_error',
          retryable: true,
          message: 'transient send failure',
        };
      }
      return {
        status: 'completed',
        reason: 'queued',
        queuedCount: 1,
      };
    },
  });

  const firstRun = await service.createEmployeeAndStartRun({
    context: { orgId: 'org_a', userId: 'admin_a' },
    employee: sampleEmployee(),
  });

  const notificationBefore = firstRun.steps.find((step) => step.stepKey === 'notifications.queue');
  const trainingBefore = firstRun.steps.find((step) => step.stepKey === 'training.assign');
  assert.ok(notificationBefore);
  assert.ok(trainingBefore);
  assert.equal(notificationBefore.status, 'failed');
  assert.equal(trainingBefore.status, 'completed');

  const retried = await service.retryRun({
    context: { orgId: 'org_a', userId: 'admin_a' },
    runId: firstRun.run.id,
    stepKeys: ['notifications.queue'],
  });

  const notificationAfter = retried.steps.find((step) => step.stepKey === 'notifications.queue');
  const trainingAfter = retried.steps.find((step) => step.stepKey === 'training.assign');
  assert.ok(notificationAfter);
  assert.ok(trainingAfter);
  assert.equal(notificationAfter.status, 'completed');
  assert.equal(notificationAfter.attemptCount, notificationBefore.attemptCount + 1);
  assert.equal(trainingAfter.attemptCount, trainingBefore.attemptCount);
  assert.equal(notificationAttempts, 2);
});

test('P6-T1 acceptance matrix: scenario 4 intake issue/submit/expire/one-time enforcement', async () => {
  const repo = new InMemoryIntakeRepo();
  let now = new Date('2026-04-06T12:00:00.000Z');
  let runSeq = 0;

  const intakeService = new OnboardingIntakeService({
    now: () => now,
    repo,
    getOrgModules: async () => ['onboarding', 'training'],
    sendOnboardingInvite: async () => ({ status: 'skipped', reason: 'not_requested' }),
    recordOrgAuditEvent: async () => {},
    onboardingService: {
      async createEmployeeAndStartRun(input): Promise<OnboardingRunDetail> {
        runSeq += 1;
        const runId = `run-${runSeq}`;
        const profileId = `emp-${runSeq}`;
        const stamp = now.toISOString();
        return {
          run: {
            id: runId,
            orgId: input.context.orgId,
            employeeProfileId: profileId,
            status: 'completed',
            source: 'intake.token',
            initiatedBy: input.context.userId,
            startedAt: stamp,
            completedAt: stamp,
            errorSummary: null,
            idempotencyKey: input.idempotencyKey || null,
            metadata: {},
            createdAt: stamp,
            updatedAt: stamp,
          },
          employeeProfile: {
            id: profileId,
            orgId: input.context.orgId,
            externalEmployeeId: null,
            clerkUserId: null,
            firstName: input.employee.firstName,
            lastName: input.employee.lastName,
            workEmail: input.employee.workEmail || null,
            department: null,
            jobTitle: null,
            hireDate: input.employee.hireDate || null,
            status: 'active',
            isDriver: Boolean(input.employee.isDriver),
            hazmatRequired: Boolean(input.employee.hazmatRequired),
            hazmatEndorsement: null,
            cdlClass: null,
            cdlExpiration: null,
            medicalExpiration: null,
            metadata: {},
            createdBy: input.context.userId,
            createdAt: stamp,
            updatedAt: stamp,
          },
          steps: [],
        };
      },
      async updateEmployeeAndStartRun(): Promise<OnboardingRunDetail> {
        throw new Error('not used in this test');
      },
    },
  });

  const issued = await intakeService.issueToken({
    orgId: 'org_a',
    userId: 'admin_a',
    inviteAfterIntake: false,
  });

  const firstSubmit = await intakeService.submitWithToken({
    token: issued.token,
    employee: sampleEmployee({ firstName: 'Taylor', isDriver: false, hazmatRequired: false }),
  });
  assert.equal(firstSubmit.detail.run.status, 'completed');

  await assert.rejects(
    () =>
      intakeService.submitWithToken({
        token: issued.token,
        employee: sampleEmployee({ firstName: 'Taylor', isDriver: false, hazmatRequired: false }),
      }),
    (error: unknown) =>
      error instanceof OnboardingIntakeError
      && error.status === 409
      && error.message.includes('already used'),
  );

  const expiredToken = issueSignedIntakeToken({
    tokenId: 'expired-1',
    orgId: 'org_a',
    now: new Date('2026-04-06T00:00:00.000Z'),
    expiresAt: new Date('2026-04-06T01:00:00.000Z'),
  });
  repo.seedToken({
    id: 'tok-expired-1',
    orgId: 'org_a',
    employeeProfileId: null,
    tokenHash: hashOpaqueToken(expiredToken),
    status: 'issued',
    expiresAt: '2026-04-06T01:00:00.000Z',
    issuedBy: 'admin_a',
    consumedAt: null,
    inviteAfterIntake: false,
    inviteOverrideAllowed: true,
    intakeEmail: null,
    metadata: { tokenId: 'expired-1' },
    createdAt: '2026-04-06T00:00:00.000Z',
    updatedAt: '2026-04-06T00:00:00.000Z',
  });
  now = new Date('2026-04-06T02:00:00.000Z');

  await assert.rejects(
    () => intakeService.lookupByToken(expiredToken),
    (error: unknown) => error instanceof OnboardingIntakeError && error.status === 404,
  );
});
