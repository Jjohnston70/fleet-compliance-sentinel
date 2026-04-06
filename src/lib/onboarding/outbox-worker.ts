import {
  listDueOutboxEvents,
  markOutboxEventProcessed,
  markOutboxEventRetry,
} from '@/lib/onboarding/repository';
import { processNotificationEvent } from '@/lib/onboarding/adapters/notification-adapter';
import { processTaskSyncEvent } from '@/lib/onboarding/adapters/task-adapter';
import type { OnboardingOutboxEventRecord } from '@/lib/onboarding/types';
import {
  emitOnboardingMetric,
  emitOutboxAlertSignals,
  evaluateOutboxAlertSignals,
  type OnboardingAlertSignal,
} from '@/lib/onboarding/observability';

const MAX_RETRY_ATTEMPTS = 5;

type OutboxErrorCode =
  | 'VALIDATION_ERROR'
  | 'MISSING_CONFIG'
  | 'UPSTREAM_TEMPORARY'
  | 'UNKNOWN_ERROR';

const OUTBOX_ERROR_TAXONOMY: Record<OutboxErrorCode, { retryable: boolean }> = {
  VALIDATION_ERROR: { retryable: false },
  MISSING_CONFIG: { retryable: false },
  UPSTREAM_TEMPORARY: { retryable: true },
  UNKNOWN_ERROR: { retryable: true },
};

function classifyOutboxError(input: {
  eventType: string;
  reason?: string;
  message?: string;
  retryableHint?: boolean;
}): OutboxErrorCode {
  if (input.retryableHint === false) {
    if (input.reason === 'invalid_payload') return 'VALIDATION_ERROR';
    if (input.reason === 'missing_config') return 'MISSING_CONFIG';
    return 'UNKNOWN_ERROR';
  }
  if (input.reason === 'invalid_payload') return 'VALIDATION_ERROR';
  if (input.reason === 'missing_config') return 'MISSING_CONFIG';
  if (input.reason === 'provider_error' || input.reason === 'error') return 'UPSTREAM_TEMPORARY';
  if (input.message?.includes('task command returned')) return 'UPSTREAM_TEMPORARY';
  return 'UNKNOWN_ERROR';
}

function retryBackoffMinutes(attemptCount: number): number {
  const minutes = Math.pow(2, Math.max(0, attemptCount));
  return Math.min(60, Math.max(1, minutes));
}

export interface OnboardingOutboxProcessSummary {
  polled: number;
  processed: number;
  retried: number;
  failed: number;
  skipped: number;
  alertSignals: OnboardingAlertSignal[];
}

export interface OutboxWorkerDependencies {
  listDueOutboxEvents(input?: {
    orgId?: string;
    eventTypes?: string[];
    limit?: number;
  }): Promise<OnboardingOutboxEventRecord[]>;
  markProcessed(input: { eventId: string }): Promise<void>;
  markRetry(input: {
    eventId: string;
    nextAttemptAt: Date;
    terminal: boolean;
    errorMessage: string;
  }): Promise<void>;
  processTaskSync(payload: Record<string, unknown>): Promise<{
    status: 'completed' | 'failed';
    reason?: string;
    message?: string;
  }>;
  processNotification(payload: Record<string, unknown>): Promise<{
    status: 'completed' | 'failed';
    reason?: string;
    retryable?: boolean;
    message?: string;
  }>;
}

const DEFAULT_DEPS: OutboxWorkerDependencies = {
  listDueOutboxEvents,
  async markProcessed(input) {
    await markOutboxEventProcessed(input);
  },
  async markRetry(input) {
    await markOutboxEventRetry(input);
  },
  processTaskSync: processTaskSyncEvent,
  processNotification: processNotificationEvent,
};

export async function processOnboardingOutboxBatch(input?: {
  orgId?: string;
  limit?: number;
  deps?: OutboxWorkerDependencies;
}): Promise<OnboardingOutboxProcessSummary> {
  const deps = input?.deps ?? DEFAULT_DEPS;
  const limit = Math.max(1, Math.min(input?.limit ?? 50, 500));
  const events = await deps.listDueOutboxEvents({
    orgId: input?.orgId,
    eventTypes: ['onboarding.task.sync', 'onboarding.notification.send'],
    limit,
  });

  const summary: OnboardingOutboxProcessSummary = {
    polled: events.length,
    processed: 0,
    retried: 0,
    failed: 0,
    skipped: 0,
    alertSignals: [],
  };

  for (const event of events) {
    if (event.eventType !== 'onboarding.task.sync' && event.eventType !== 'onboarding.notification.send') {
      summary.skipped += 1;
      continue;
    }

    try {
      if (event.eventType === 'onboarding.task.sync') {
        const result = await deps.processTaskSync(event.payload);
        if (result.status === 'completed') {
          await deps.markProcessed({ eventId: event.id });
          summary.processed += 1;
          continue;
        }

        const code = classifyOutboxError({
          eventType: event.eventType,
          reason: result.reason,
          message: result.message,
          retryableHint: false,
        });
        const retryable = OUTBOX_ERROR_TAXONOMY[code].retryable;
        const terminal = !retryable || event.attemptCount + 1 >= MAX_RETRY_ATTEMPTS;
        const nextAttemptAt = new Date(Date.now() + retryBackoffMinutes(event.attemptCount + 1) * 60_000);
        await deps.markRetry({
          eventId: event.id,
          nextAttemptAt,
          terminal,
          errorMessage: result.message || code,
        });
        if (terminal) summary.failed += 1;
        else summary.retried += 1;
        continue;
      }

      const result = await deps.processNotification(event.payload);
      if (result.status === 'completed') {
        await deps.markProcessed({ eventId: event.id });
        summary.processed += 1;
        continue;
      }

      const code = classifyOutboxError({
        eventType: event.eventType,
        reason: result.reason,
        message: result.message,
        retryableHint: result.retryable,
      });
      const retryable = OUTBOX_ERROR_TAXONOMY[code].retryable && result.retryable;
      const terminal = !retryable || event.attemptCount + 1 >= MAX_RETRY_ATTEMPTS;
      const nextAttemptAt = new Date(Date.now() + retryBackoffMinutes(event.attemptCount + 1) * 60_000);
      await deps.markRetry({
        eventId: event.id,
        nextAttemptAt,
        terminal,
        errorMessage: result.message || code,
      });
      if (terminal) summary.failed += 1;
      else summary.retried += 1;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const nextAttemptAt = new Date(Date.now() + retryBackoffMinutes(event.attemptCount + 1) * 60_000);
      const terminal = event.attemptCount + 1 >= MAX_RETRY_ATTEMPTS;
      await deps.markRetry({
        eventId: event.id,
        nextAttemptAt,
        terminal,
        errorMessage: message,
      });
      if (terminal) summary.failed += 1;
      else summary.retried += 1;
    }
  }

  emitOnboardingMetric({
    name: 'onboarding.outbox.batch.polled',
    value: summary.polled,
    orgId: input?.orgId,
  });
  emitOnboardingMetric({
    name: 'onboarding.outbox.batch.processed',
    value: summary.processed,
    orgId: input?.orgId,
  });
  emitOnboardingMetric({
    name: 'onboarding.outbox.batch.retried',
    value: summary.retried,
    orgId: input?.orgId,
  });
  emitOnboardingMetric({
    name: 'onboarding.outbox.batch.failed',
    value: summary.failed,
    orgId: input?.orgId,
  });

  summary.alertSignals = evaluateOutboxAlertSignals({
    orgId: input?.orgId,
    polled: summary.polled,
    processed: summary.processed,
    retried: summary.retried,
    failed: summary.failed,
  });
  emitOutboxAlertSignals(summary.alertSignals);

  return summary;
}
