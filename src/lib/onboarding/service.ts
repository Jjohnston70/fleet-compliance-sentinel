import { randomUUID } from 'node:crypto';
import { assignHazmatTrainingIfRequired, type TrainingAssignmentResult } from '@/lib/onboarding/adapters/training-adapter';
import { seedSuspenseFromTraining, type SuspenseSeedResult } from '@/lib/onboarding/adapters/suspense-seed-adapter';
import { queueOnboardingNotification, type NotificationQueueResult } from '@/lib/onboarding/adapters/notification-adapter';
import { seedOnboardingTask, type TaskSeedResult } from '@/lib/onboarding/adapters/task-adapter';
import { evaluateOnboardingRules } from '@/lib/onboarding/rules-engine';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingEventEnvelope,
  OnboardingMutationContext,
  OnboardingRunCreateInput,
  OnboardingRunDetail,
  OnboardingRunRecord,
  OnboardingStepStatus,
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
  upsertStep,
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
  upsertStep(input: {
    runId: string;
    stepKey: string;
    status: OnboardingStepStatus;
    output: Record<string, unknown>;
    errorMessage?: string | null;
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

export interface OnboardingAdapters {
  assignHazmatTrainingIfRequired(input: {
    orgId: string;
    initiatedBy: string;
    employee: OnboardingEmployeeProfile;
    deadlineDate: string;
  }): Promise<TrainingAssignmentResult>;
  seedSuspenseFromTraining(input: {
    orgId: string;
    employee: OnboardingEmployeeProfile;
  }): Promise<SuspenseSeedResult>;
  seedOnboardingTask(input: {
    orgId: string;
    runId: string;
    employee: OnboardingEmployeeProfile;
    taskKey: string;
    title: string;
    dueDate?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<TaskSeedResult>;
  queueOnboardingNotification(input: {
    orgId: string;
    runId: string;
    employee: OnboardingEmployeeProfile;
    templateKey: 'employee-onboarding-completed' | 'employee-onboarding-started';
  }): Promise<NotificationQueueResult>;
}

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

const DEFAULT_ADAPTERS: OnboardingAdapters = {
  assignHazmatTrainingIfRequired,
  seedSuspenseFromTraining,
  seedOnboardingTask,
  queueOnboardingNotification,
};

export class OnboardingService {
  constructor(
    private readonly store: OnboardingStore,
    private readonly adapters: OnboardingAdapters = DEFAULT_ADAPTERS,
  ) {}

  private async persistStep(input: {
    runId: string;
    stepKey: string;
    status: OnboardingStepStatus;
    output: Record<string, unknown>;
    errorMessage?: string | null;
  }): Promise<OnboardingStepRecord> {
    return this.store.upsertStep({
      runId: input.runId,
      stepKey: input.stepKey,
      status: input.status,
      output: input.output,
      errorMessage: input.errorMessage ?? null,
    });
  }

  private async runDeterministicFlow(input: {
    run: OnboardingRunRecord;
    employeeProfile: OnboardingEmployeeProfile;
    actorUserId: string;
  }): Promise<OnboardingRunDetail> {
    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.started',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { source: input.run.source },
      }),
    );

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'profile.persist' },
      }),
    );
    await this.persistStep({
      runId: input.run.id,
      stepKey: 'profile.persist',
      status: 'completed',
      output: {
        completedBy: input.actorUserId,
        completedAt: new Date().toISOString(),
        deterministic: true,
      },
    });

    const decisions = evaluateOnboardingRules(input.employeeProfile);
    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'rules.evaluate' },
      }),
    );
    await this.persistStep({
      runId: input.run.id,
      stepKey: 'rules.evaluate',
      status: 'completed',
      output: {
        completedBy: input.actorUserId,
        deterministic: true,
        decisions,
      },
    });

    let trainingResult: TrainingAssignmentResult = {
      status: 'skipped',
      reason: 'not_required',
      message: 'training rule not executed',
    };

    if (decisions.training.shouldAssignTraining && decisions.training.deadlineDate) {
      trainingResult = await this.adapters.assignHazmatTrainingIfRequired({
        orgId: input.run.orgId,
        initiatedBy: input.actorUserId,
        employee: input.employeeProfile,
        deadlineDate: decisions.training.deadlineDate,
      });

      if (trainingResult.status === 'completed') {
        await this.store.insertOnboardingEvent(
          createEvent({
            eventType: 'employee.training.assignment.completed',
            orgId: input.run.orgId,
            runId: input.run.id,
            actorUserId: input.actorUserId,
            payload: { ...trainingResult },
          }),
        );
      } else {
        await this.store.insertOnboardingEvent(
          createEvent({
            eventType: 'employee.training.assignment.requested',
            orgId: input.run.orgId,
            runId: input.run.id,
            actorUserId: input.actorUserId,
            payload: { ...trainingResult },
          }),
        );
      }
    }

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'training.assign' },
      }),
    );

    await this.persistStep({
      runId: input.run.id,
      stepKey: 'training.assign',
      status:
        trainingResult.status === 'completed'
          ? 'completed'
          : trainingResult.status === 'failed'
            ? 'failed'
            : 'skipped',
      output: {
        completedBy: input.actorUserId,
        deterministic: true,
        result: trainingResult,
      },
      errorMessage: trainingResult.status === 'failed' ? trainingResult.message || 'training assignment failed' : null,
    });

    const suspenseResult: SuspenseSeedResult = decisions.suspense.shouldSeed
      ? await this.adapters.seedSuspenseFromTraining({
        orgId: input.run.orgId,
        employee: input.employeeProfile,
      })
      : { status: 'skipped', reason: 'training_not_assigned' };

    if (suspenseResult.status === 'completed') {
      await this.store.insertOnboardingEvent(
        createEvent({
          eventType: 'employee.suspense.seeded',
          orgId: input.run.orgId,
          runId: input.run.id,
          actorUserId: input.actorUserId,
          payload: { ...suspenseResult },
        }),
      );
    }

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'suspense.seed' },
      }),
    );
    await this.persistStep({
      runId: input.run.id,
      stepKey: 'suspense.seed',
      status:
        suspenseResult.status === 'completed'
          ? 'completed'
          : suspenseResult.status === 'failed'
            ? 'failed'
            : 'skipped',
      output: {
        completedBy: input.actorUserId,
        deterministic: true,
        result: suspenseResult,
      },
      errorMessage: suspenseResult.status === 'failed' ? suspenseResult.message || 'suspense seeding failed' : null,
    });

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'event.audit' },
      }),
    );
    await this.persistStep({
      runId: input.run.id,
      stepKey: 'event.audit',
      status: 'completed',
      output: {
        completedBy: input.actorUserId,
        deterministic: true,
      },
    });

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'tasks.seed' },
      }),
    );
    const taskSeedResult = await this.adapters.seedOnboardingTask({
      orgId: input.run.orgId,
      runId: input.run.id,
      employee: input.employeeProfile,
      taskKey: DEFAULT_FALLBACK_TASK_KEY,
      title: 'Verify onboarding profile data',
      dueDate: input.employeeProfile.hireDate,
      metadata: {
        source: input.run.source,
        generatedBy: 'onboarding-baseline',
      },
    });
    await this.persistStep({
      runId: input.run.id,
      stepKey: 'tasks.seed',
      status:
        taskSeedResult.status === 'failed'
          ? 'failed'
          : taskSeedResult.status === 'skipped'
            ? 'skipped'
            : 'completed',
      output: {
        completedBy: input.actorUserId,
        deterministic: true,
        result: taskSeedResult,
      },
      errorMessage: taskSeedResult.status === 'failed'
        ? taskSeedResult.message || 'task seeding failed'
        : null,
    });
    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.tasks.seeded',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: {
          status: taskSeedResult.status,
          reason: taskSeedResult.reason,
          queuedForRetry: Boolean(taskSeedResult.queuedForRetry),
          hasExternalTaskId: Boolean(taskSeedResult.externalTaskId),
        },
      }),
    );

    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.onboarding.step.requested',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: { stepKey: 'notifications.queue' },
      }),
    );
    const notificationResult = await this.adapters.queueOnboardingNotification({
      orgId: input.run.orgId,
      runId: input.run.id,
      employee: input.employeeProfile,
      templateKey: 'employee-onboarding-completed',
    });
    await this.persistStep({
      runId: input.run.id,
      stepKey: 'notifications.queue',
      status:
        notificationResult.status === 'failed'
          ? 'failed'
          : notificationResult.status === 'skipped'
            ? 'skipped'
            : 'completed',
      output: {
        completedBy: input.actorUserId,
        deterministic: true,
        result: notificationResult,
      },
      errorMessage: notificationResult.status === 'failed'
        ? notificationResult.message || 'notification queueing failed'
        : null,
    });
    await this.store.insertOnboardingEvent(
      createEvent({
        eventType: 'employee.notifications.queued',
        orgId: input.run.orgId,
        runId: input.run.id,
        actorUserId: input.actorUserId,
        payload: {
          status: notificationResult.status,
          reason: notificationResult.reason,
          queuedCount: notificationResult.queuedCount ?? 0,
        },
      }),
    );

    const finalized = await this.store.markRunCompleted({
      orgId: input.run.orgId,
      runId: input.run.id,
      metadata: {
        completedBy: input.actorUserId,
        rules: decisions,
        taskSeedResult,
        notificationResult,
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

    return this.runDeterministicFlow({
      run,
      employeeProfile: profile,
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

    return this.runDeterministicFlow({
      run,
      employeeProfile: profile,
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

    const requestedStepSet = new Set((input.stepKeys || []).map((step) => step.trim()).filter(Boolean));
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

    return this.runDeterministicFlow({
      run: detail.run,
      employeeProfile: detail.employeeProfile,
      actorUserId: input.context.userId,
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

  async upsertStep(input: {
    runId: string;
    stepKey: string;
    status: OnboardingStepStatus;
    output: Record<string, unknown>;
    errorMessage?: string | null;
  }): Promise<OnboardingStepRecord> {
    return upsertStep(input);
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

export function createOnboardingService(
  store?: OnboardingStore,
  adapters?: OnboardingAdapters,
): OnboardingService {
  return new OnboardingService(store ?? new PostgresOnboardingStore(), adapters ?? DEFAULT_ADAPTERS);
}
