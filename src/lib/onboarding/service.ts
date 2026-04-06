import { randomUUID } from 'node:crypto';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingEventEnvelope,
  OnboardingMutationContext,
  OnboardingRunCreateInput,
  OnboardingRunDetail,
  OnboardingRunRecord,
  OnboardingStepRecord,
  OnboardingTaskRecord,
} from '@/lib/onboarding/types';
import {
  createEmployeeProfile,
  createRun,
  getRunDetail,
  insertOnboardingEvent,
  listRuns,
  listRunSteps,
  markRunCompleted,
  updateEmployeeProfile,
  upsertCompletedStep,
  upsertFallbackTask,
} from '@/lib/onboarding/repository';

export class OnboardingServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'OnboardingServiceError';
  }
}

export interface OnboardingStore {
  createEmployeeProfile(input: {
    orgId: string;
    createdBy: string;
    employee: OnboardingEmployeeInput;
  }): Promise<OnboardingEmployeeProfile>;
  updateEmployeeProfile(input: {
    orgId: string;
    employeeProfileId: string;
    employee: OnboardingEmployeeInput;
  }): Promise<OnboardingEmployeeProfile | null>;
  createRun(input: OnboardingRunCreateInput): Promise<OnboardingRunRecord>;
  listRuns(orgId: string, limit?: number): Promise<OnboardingRunRecord[]>;
  getRunDetail(input: { orgId: string; runId: string }): Promise<OnboardingRunDetail | null>;
  listRunSteps(runId: string): Promise<OnboardingStepRecord[]>;
  upsertCompletedStep(input: {
    runId: string;
    stepKey: string;
    output: Record<string, unknown>;
  }): Promise<OnboardingStepRecord>;
  markRunCompleted(input: {
    orgId: string;
    runId: string;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingRunRecord | null>;
  upsertFallbackTask(input: {
    orgId: string;
    runId: string;
    employeeProfileId: string;
    taskKey: string;
    title: string;
    dueDate?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingTaskRecord>;
  insertOnboardingEvent(event: OnboardingEventEnvelope): Promise<void>;
}

const DEFAULT_STEP_KEYS = ['profile.persist', 'event.audit'] as const;
const DEFAULT_FALLBACK_TASK_KEY = 'verify-profile-data';

function ensureRequiredFields(employee: OnboardingEmployeeInput): void {
  if (!employee.firstName?.trim() || !employee.lastName?.trim()) {
    throw new OnboardingServiceError(422, 'firstName and lastName are required');
  }
}

function createEvent(input: {
  eventType: string;
  orgId: string;
  runId: string | null;
  actorUserId: string;
  payload?: Record<string, unknown>;
}): OnboardingEventEnvelope {
  return {
    eventId: randomUUID(),
    eventType: input.eventType,
    orgId: input.orgId,
    runId: input.runId,
    actorUserId: input.actorUserId,
    occurredAt: new Date().toISOString(),
    payload: input.payload ?? {},
  };
}

function deriveIdempotencyKey(base: string | null | undefined): string | null {
  const trimmed = typeof base === 'string' ? base.trim() : '';
  if (trimmed) return trimmed.slice(0, 255);
  return null;
}

export class OnboardingService {
  constructor(private readonly store: OnboardingStore) {}

  private async runBaselineFlow(input: {
    run: OnboardingRunRecord;
    actorUserId: string;
    stepKeys?: readonly string[];
  }): Promise<OnboardingRunDetail> {
    const stepKeys = input.stepKeys ?? DEFAULT_STEP_KEYS;

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.started',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { source: input.run.source },
      }),
    );

    for (const stepKey of stepKeys) {
      await this.store.insertOnboardingEvent(
        createEvent({
          eventType: 'employee.onboarding.step.requested',
          orgId: input.run.orgId,
          runId: input.run.id,
          actorUserId: input.actorUserId,
          payload: { stepKey },
        }),
      );
      await this.store.upsertCompletedStep({
        runId: input.run.id,
        stepKey,
        output: {
          completedBy: input.actorUserId,
          completedAt: new Date().toISOString(),
          deterministic: true,
        },
      });
    }

    const finalized = await this.store.markRunCompleted({
      orgId: input.run.orgId,
      runId: input.run.id,
      metadata: {
        completedBy: input.actorUserId,
      },
    });

    if (!finalized) {
      throw new OnboardingServiceError(500, 'Failed to finalize onboarding run');
    }

    const detail = await this.store.getRunDetail({
      orgId: input.run.orgId,
      runId: input.run.id,
    });
    if (!detail) {
      throw new OnboardingServiceError(500, 'Run detail unavailable after completion');
    }

    await this.store.upsertFallbackTask({
      orgId: detail.run.orgId,
      runId: detail.run.id,
      employeeProfileId: detail.employeeProfile.id,
      taskKey: DEFAULT_FALLBACK_TASK_KEY,
      title: 'Verify onboarding profile data',
      dueDate: detail.employeeProfile.hireDate,
      metadata: {
        source: detail.run.source,
        generatedBy: 'onboarding-baseline',
      },
    });

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.completed',
        orgId: detail.run.orgId,
        runId: detail.run.id,
        actorUserId: input.actorUserId,
        payload: {
          stepCount: detail.steps.length,
        },
      }),
    );

    return detail;
  }

  async createEmployeeAndStartRun(input: {
    context: OnboardingMutationContext;
    employee: OnboardingEmployeeInput;
    idempotencyKey?: string | null;
  }): Promise<OnboardingRunDetail> {
    ensureRequiredFields(input.employee);

    const profile = await this.store.createEmployeeProfile({
      orgId: input.context.orgId,
      createdBy: input.context.userId,
      employee: input.employee,
    });

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.profile.created',
        orgId: input.context.orgId,
        runId: null,
        actorUserId: input.context.userId,
        payload: {
          employeeProfileId: profile.id,
          isDriver: profile.isDriver,
          hazmatRequired: profile.hazmatRequired,
        },
      }),
    );

    const run = await this.store.createRun({
      orgId: input.context.orgId,
      employeeProfileId: profile.id,
      source: 'admin.employee.create',
      initiatedBy: input.context.userId,
      idempotencyKey: deriveIdempotencyKey(input.idempotencyKey),
      metadata: {
        trigger: 'employee.create',
      },
    });

    return this.runBaselineFlow({
      run,
      actorUserId: input.context.userId,
    });
  }

  async updateEmployeeAndStartRun(input: {
    context: OnboardingMutationContext;
    employeeProfileId: string;
    employee: OnboardingEmployeeInput;
    idempotencyKey?: string | null;
  }): Promise<OnboardingRunDetail> {
    ensureRequiredFields(input.employee);
    const profile = await this.store.updateEmployeeProfile({
      orgId: input.context.orgId,
      employeeProfileId: input.employeeProfileId,
      employee: input.employee,
    });
    if (!profile) {
      throw new OnboardingServiceError(404, 'Employee profile not found');
    }

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.profile.updated',
        orgId: input.context.orgId,
        runId: null,
        actorUserId: input.context.userId,
        payload: {
          employeeProfileId: profile.id,
          isDriver: profile.isDriver,
          hazmatRequired: profile.hazmatRequired,
        },
      }),
    );

    const run = await this.store.createRun({
      orgId: input.context.orgId,
      employeeProfileId: profile.id,
      source: 'admin.employee.update',
      initiatedBy: input.context.userId,
      idempotencyKey: deriveIdempotencyKey(input.idempotencyKey),
      metadata: {
        trigger: 'employee.update',
      },
    });

    return this.runBaselineFlow({
      run,
      actorUserId: input.context.userId,
    });
  }

  async listRuns(input: {
    orgId: string;
    limit?: number;
  }): Promise<OnboardingRunRecord[]> {
    return this.store.listRuns(input.orgId, input.limit);
  }

  async getRunDetail(input: {
    orgId: string;
    runId: string;
  }): Promise<OnboardingRunDetail> {
    const detail = await this.store.getRunDetail(input);
    if (!detail) {
      throw new OnboardingServiceError(404, 'Onboarding run not found');
    }
    return detail;
  }

  async retryRun(input: {
    context: OnboardingMutationContext;
    runId: string;
    stepKeys?: string[];
  }): Promise<OnboardingRunDetail> {
    const detail = await this.store.getRunDetail({
      orgId: input.context.orgId,
      runId: input.runId,
    });
    if (!detail) {
      throw new OnboardingServiceError(404, 'Onboarding run not found');
    }

    const requestedStepSet = new Set(
      (input.stepKeys || []).map((step) => step.trim()).filter(Boolean),
    );
    const retryTargets = detail.steps
      .filter((step) => {
        if (step.status === 'completed') return false;
        if (requestedStepSet.size === 0) {
          return step.status === 'failed' || step.status === 'skipped';
        }
        return requestedStepSet.has(step.stepKey);
      })
      .map((step) => step.stepKey);

    if (retryTargets.length === 0) {
      return detail;
    }

    return this.runBaselineFlow({
      run: detail.run,
      actorUserId: input.context.userId,
      stepKeys: retryTargets,
    });
  }
}

class PostgresOnboardingStore implements OnboardingStore {
  async createEmployeeProfile(input: {
    orgId: string;
    createdBy: string;
    employee: OnboardingEmployeeInput;
  }): Promise<OnboardingEmployeeProfile> {
    return createEmployeeProfile(input);
  }

  async updateEmployeeProfile(input: {
    orgId: string;
    employeeProfileId: string;
    employee: OnboardingEmployeeInput;
  }): Promise<OnboardingEmployeeProfile | null> {
    return updateEmployeeProfile(input);
  }

  async createRun(input: OnboardingRunCreateInput): Promise<OnboardingRunRecord> {
    return createRun(input);
  }

  async listRuns(orgId: string, limit?: number): Promise<OnboardingRunRecord[]> {
    return listRuns(orgId, limit);
  }

  async getRunDetail(input: { orgId: string; runId: string }): Promise<OnboardingRunDetail | null> {
    return getRunDetail(input);
  }

  async listRunSteps(runId: string): Promise<OnboardingStepRecord[]> {
    return listRunSteps(runId);
  }

  async upsertCompletedStep(input: {
    runId: string;
    stepKey: string;
    output: Record<string, unknown>;
  }): Promise<OnboardingStepRecord> {
    return upsertCompletedStep(input);
  }

  async markRunCompleted(input: {
    orgId: string;
    runId: string;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingRunRecord | null> {
    return markRunCompleted(input);
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
    return upsertFallbackTask(input);
  }

  async insertOnboardingEvent(event: OnboardingEventEnvelope): Promise<void> {
    await insertOnboardingEvent(event);
  }
}

export function createOnboardingService(store?: OnboardingStore): OnboardingService {
  return new OnboardingService(store ?? new PostgresOnboardingStore());
}
