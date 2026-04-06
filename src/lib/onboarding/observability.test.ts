import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateOutboxAlertSignals } from '@/lib/onboarding/observability';

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

test('outbox alert evaluation emits failure and retry signals when thresholds are exceeded', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
      ONBOARDING_OUTBOX_FAILURE_RATE_WARN: '0.20',
      ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL: '0.40',
      ONBOARDING_OUTBOX_RETRY_COUNT_WARN: '5',
      ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_1',
        polled: 20,
        processed: 2,
        retried: 11,
        failed: 9,
      });

      assert.equal(signals.length, 2);
      const failureSignal = signals.find((signal) => signal.key === 'onboarding.outbox.failure_rate_spike');
      const retrySignal = signals.find((signal) => signal.key === 'onboarding.outbox.retry_volume_spike');
      assert.ok(failureSignal);
      assert.ok(retrySignal);
      assert.equal(failureSignal?.severity, 'critical');
      assert.equal(retrySignal?.severity, 'critical');
    },
  );
});

test('outbox alert evaluation suppresses signals under min sample size', () => {
  withEnv(
    {
      ONBOARDING_OUTBOX_ALERT_MIN_POLLED: '10',
    },
    () => {
      const signals = evaluateOutboxAlertSignals({
        orgId: 'org_1',
        polled: 5,
        processed: 0,
        retried: 5,
        failed: 5,
      });
      assert.equal(signals.length, 0);
    },
  );
});
