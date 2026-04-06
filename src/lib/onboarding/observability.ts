export type OnboardingMetricValue = string | number | boolean;

export interface OnboardingMetricEvent {
  name: string;
  value: number;
  orgId?: string;
  runId?: string;
  stepKey?: string;
  tags?: Record<string, OnboardingMetricValue>;
}

export interface OnboardingAlertSignal {
  key: string;
  severity: 'warning' | 'critical';
  message: string;
  tags: Record<string, OnboardingMetricValue>;
}

function normalizeTags(tags?: Record<string, OnboardingMetricValue>): Record<string, OnboardingMetricValue> {
  if (!tags) return {};
  const normalized: Record<string, OnboardingMetricValue> = {};
  for (const [key, value] of Object.entries(tags)) {
    const trimmed = key.trim();
    if (!trimmed) continue;
    normalized[trimmed] = value;
  }
  return normalized;
}

export function emitOnboardingMetric(event: OnboardingMetricEvent): void {
  const payload = {
    timestamp: new Date().toISOString(),
    source: 'onboarding.metrics',
    name: event.name,
    value: event.value,
    orgId: event.orgId ?? null,
    runId: event.runId ?? null,
    stepKey: event.stepKey ?? null,
    tags: normalizeTags(event.tags),
  };
  console.log(JSON.stringify(payload));
}

function readThreshold(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

export function evaluateOutboxAlertSignals(input: {
  orgId?: string;
  polled: number;
  processed: number;
  retried: number;
  failed: number;
}): OnboardingAlertSignal[] {
  const failureRateWarnThreshold = readThreshold('ONBOARDING_OUTBOX_FAILURE_RATE_WARN', 0.2);
  const failureRateCriticalThreshold = readThreshold('ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL', 0.4);
  const retryVolumeWarnThreshold = readThreshold('ONBOARDING_OUTBOX_RETRY_COUNT_WARN', 20);
  const retryVolumeCriticalThreshold = readThreshold('ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL', 50);
  const minSample = readThreshold('ONBOARDING_OUTBOX_ALERT_MIN_POLLED', 10);

  const signals: OnboardingAlertSignal[] = [];
  if (input.polled < minSample) {
    return signals;
  }

  const failureRate = input.failed / input.polled;
  if (failureRate >= failureRateCriticalThreshold) {
    signals.push({
      key: 'onboarding.outbox.failure_rate_spike',
      severity: 'critical',
      message: `Onboarding outbox failure rate ${Math.round(failureRate * 100)}% exceeded critical threshold`,
      tags: {
        orgId: input.orgId || 'all',
        polled: input.polled,
        failed: input.failed,
        failureRate: Number(failureRate.toFixed(4)),
      },
    });
  } else if (failureRate >= failureRateWarnThreshold) {
    signals.push({
      key: 'onboarding.outbox.failure_rate_spike',
      severity: 'warning',
      message: `Onboarding outbox failure rate ${Math.round(failureRate * 100)}% exceeded warning threshold`,
      tags: {
        orgId: input.orgId || 'all',
        polled: input.polled,
        failed: input.failed,
        failureRate: Number(failureRate.toFixed(4)),
      },
    });
  }

  if (input.retried >= retryVolumeCriticalThreshold) {
    signals.push({
      key: 'onboarding.outbox.retry_volume_spike',
      severity: 'critical',
      message: `Onboarding outbox retries ${input.retried} exceeded critical threshold`,
      tags: {
        orgId: input.orgId || 'all',
        retried: input.retried,
      },
    });
  } else if (input.retried >= retryVolumeWarnThreshold) {
    signals.push({
      key: 'onboarding.outbox.retry_volume_spike',
      severity: 'warning',
      message: `Onboarding outbox retries ${input.retried} exceeded warning threshold`,
      tags: {
        orgId: input.orgId || 'all',
        retried: input.retried,
      },
    });
  }

  return signals;
}

export function emitOutboxAlertSignals(signals: OnboardingAlertSignal[]): void {
  for (const signal of signals) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'onboarding.alerts',
        ...signal,
      }),
    );
  }
}
