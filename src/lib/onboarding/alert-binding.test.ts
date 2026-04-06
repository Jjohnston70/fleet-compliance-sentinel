import assert from 'node:assert/strict';
import test from 'node:test';
import { 
  emitOnboardingMetric,
  emitOutboxAlertSignals,
  evaluateOutboxAlertSignals,
  OnboardingMetricEvent,
  OnboardingAlertSignal,
} from '@/lib/onboarding/observability';

function withEnv(values: Record<string, string>, fn: () => void): void {
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (typeof value === 'undefined') {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('metric emitter functions are callable and accept valid event payloads', () => {
  const metrics: OnboardingMetricEvent[] = [
    {
      name: 'onboarding.run.started',
      value: 1,
      orgId: 'org_1',
      runId: 'run_1',
    },
    {
      name: 'onboarding.run.completed',
      value: 1,
      orgId: 'org_1',
      runId: 'run_1',
      tags: { duration_ms: 5000 },
    },
    {
      name: 'onboarding.run.failed',
      value: 1,
      orgId: 'org_1',
      runId: 'run_1',
      tags: { error: 'adapter_error' },
    },
    {
      name: 'onboarding.run.retry',
      value: 1,
      orgId: 'org_1',
      runId: 'run_1',
      tags: { attempt: 2 },
    },
    {
      name: 'onboarding.step.status',
      value: 1,
      orgId: 'org_1',
      runId: 'run_1',
      stepKey: 'training',
      tags: { status: 'completed' },
    },
    {
      name: 'onboarding.intake.token.issued',
      value: 1,
      orgId: 'org_1',
      tags: { expiry_hours: 72 },
    },
    {
      name: 'onboarding.intake.submitted',
      value: 1,
      orgId: 'org_1',
      runId: 'run_1',
    },
    {
      name: 'onboarding.outbox.batch.polled',
      value: 25,
      orgId: 'org_1',
    },
    {
      name: 'onboarding.outbox.batch.processed',
      value: 20,
      orgId: 'org_1',
    },
    {
      name: 'onboarding.outbox.batch.retried',
      value: 3,
      orgId: 'org_1',
    },
    {
      name: 'onboarding.outbox.batch.failed',
      value: 2,
      orgId: 'org_1',
    },
  ];

  for (const metric of metrics) {
    assert.doesNotThrow(() => {
      emitOnboardingMetric(metric);
    }, `should emit metric: ${metric.name}`);
  }
});

test('failure rate spike alert fires at critical threshold', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL: '0.40',
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_critical',
        polled: 100,
        processed: 50,
        retried: 10,
        failed: 45,
      });

      const failureSignal = signals.find((s) => s.key === 'onboarding.outbox.failure_rate_spike');
      assert.ok(failureSignal);
      assert.equal(failureSignal.severity, 'critical');
      assert.ok(failureSignal.tags.failureRate >= 0.40);
    },
  );
});

test('failure rate spike alert fires at warning threshold', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_FAILURE_RATE_WARN: '0.20',
      ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL: '0.40',
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_warn',
        polled: 100,
        processed: 75,
        retried: 5,
        failed: 25,
      });

      const failureSignal = signals.find((s) => s.key === 'onboarding.outbox.failure_rate_spike');
      assert.ok(failureSignal);
      assert.equal(failureSignal.severity, 'warning');
      assert.ok(failureSignal.tags.failureRate >= 0.20);
      assert.ok(failureSignal.tags.failureRate < 0.40);
    },
  );
});

test('retry volume spike alert fires at critical threshold', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL: '50',
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_retry_critical',
        polled: 100,
        processed: 40,
        retried: 55,
        failed: 5,
      });

      const retrySignal = signals.find((s) => s.key === 'onboarding.outbox.retry_volume_spike');
      assert.ok(retrySignal);
      assert.equal(retrySignal.severity, 'critical');
      assert.equal(retrySignal.tags.retried, 55);
    },
  );
});

test('retry volume spike alert fires at warning threshold', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_RETRY_COUNT_WARN: '20',
      ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL: '50',
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_retry_warn',
        polled: 100,
        processed: 70,
        retried: 25,
        failed: 5,
      });

      const retrySignal = signals.find((s) => s.key === 'onboarding.outbox.retry_volume_spike');
      assert.ok(retrySignal);
      assert.equal(retrySignal.severity, 'warning');
      assert.equal(retrySignal.tags.retried, 25);
    },
  );
});

test('both alerts fire when both thresholds exceeded', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL: '0.30',
      ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL: '30',
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_both',
        polled: 100,
        processed: 50,
        retried: 35,
        failed: 40,
      });

      assert.equal(signals.length, 2);
      const keys = signals.map((s) => s.key).sort();
      assert.deepEqual(keys, [
        'onboarding.outbox.failure_rate_spike',
        'onboarding.outbox.retry_volume_spike',
      ]);
      assert(signals.every((s) => s.severity === 'critical'));
    },
  );
});

test('alert signals are emittable without error', () => {
  const signals: OnboardingAlertSignal[] = [
    {
      key: 'onboarding.outbox.failure_rate_spike',
      severity: 'critical',
      message: 'Test failure rate spike',
      tags: { orgId: 'org_1', failureRate: 0.45 },
    },
    {
      key: 'onboarding.outbox.retry_volume_spike',
      severity: 'warning',
      message: 'Test retry volume spike',
      tags: { orgId: 'org_1', retried: 25 },
    },
  ];

  assert.doesNotThrow(() => {
    emitOutboxAlertSignals(signals);
  }, 'should emit alert signals without throwing');
});

test('alert keys are documented and discoverable', () => {
  const expectedAlertKeys = [
    'onboarding.outbox.failure_rate_spike',
    'onboarding.outbox.retry_volume_spike',
  ];

  withEnv(
    {
      ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL: '0.40',
      ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL: '50',
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_test',
        polled: 100,
        processed: 50,
        retried: 55,
        failed: 45,
      });

      const signalKeys = signals.map((s) => s.key);
      for (const key of expectedAlertKeys) {
        assert.ok(
          signalKeys.includes(key),
          `expected alert key '${key}' to be generated in high-failure scenario`,
        );
      }
    },
  );
});
