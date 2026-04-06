# Onboarding Alert Rules and Operations

Last Updated: 2026-04-06
Owners: Fleet-Compliance platform team

## Purpose

Actionable alert rules and operator procedures for onboarding system observability. This document defines conditions that trigger alerts, severity levels, dashboard requirements, escalation paths, and recovery command snippets.

## Alert Rules

### 1. Outbox Failure Rate Spike

**Alert Key:** `onboarding.outbox.failure_rate_spike`

**Trigger Condition:**
- Outbox processing failure rate exceeds configured threshold
- Warning threshold: 20% (default, configurable via `ONBOARDING_OUTBOX_FAILURE_RATE_WARN`)
- Critical threshold: 40% (default, configurable via `ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL`)
- Minimum sample size: 10 polled events (default, configurable via `ONBOARDING_OUTBOX_ALERT_MIN_POLLED`)

**Severity Levels:**
- Warning: 20% <= failure_rate < 40%
- Critical: failure_rate >= 40%

**Alert Payload:**
```json
{
  "key": "onboarding.outbox.failure_rate_spike",
  "severity": "warning|critical",
  "message": "Onboarding outbox failure rate X% exceeded [warning|critical] threshold",
  "tags": {
    "orgId": "org_id or 'all'",
    "polled": 25,
    "failed": 10,
    "failureRate": 0.4
  }
}
```

**Runbook Link:** See "Triage: Outbox Failure Rate Spike" section.

### 2. Outbox Retry Volume Spike

**Alert Key:** `onboarding.outbox.retry_volume_spike`

**Trigger Condition:**
- Outbox processing retry count exceeds configured threshold
- Warning threshold: 20 retried events (default, configurable via `ONBOARDING_OUTBOX_RETRY_COUNT_WARN`)
- Critical threshold: 50 retried events (default, configurable via `ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL`)

**Severity Levels:**
- Warning: 20 <= retried < 50
- Critical: retried >= 50

**Alert Payload:**
```json
{
  "key": "onboarding.outbox.retry_volume_spike",
  "severity": "warning|critical",
  "message": "Onboarding outbox retries X exceeded [warning|critical] threshold",
  "tags": {
    "orgId": "org_id or 'all'",
    "retried": 55
  }
}
```

**Runbook Link:** See "Triage: Outbox Retry Volume Spike" section.

## Key Metrics to Monitor

### Run-level metrics

- `onboarding.run.started`: Count of runs initiated (dimension: orgId, runId)
- `onboarding.run.completed`: Count of successful completions (dimension: orgId, runId)
- `onboarding.run.failed`: Count of terminal failures (dimension: orgId, runId, error tag)
- `onboarding.run.retry`: Count of retry attempts (dimension: orgId, runId, attempt tag)
- **Derived:** success_rate = completed / (completed + failed)

### Step-level metrics

- `onboarding.step.status`: Step outcome events (dimension: orgId, runId, stepKey, status tag)
- **Track per-step success rates by stepKey (training, tasks, notifications)**

### Intake metrics

- `onboarding.intake.token.issued`: Count of tokens generated (dimension: orgId, expiry_hours tag)
- `onboarding.intake.submitted`: Count of successful intakes (dimension: orgId, runId)
- **Alert if submitted rate < 50% of issued (token expiry or user abandonment)**

### Outbox metrics

- `onboarding.outbox.batch.polled`: Events retrieved in batch (dimension: orgId)
- `onboarding.outbox.batch.processed`: Events successfully sent (dimension: orgId)
- `onboarding.outbox.batch.retried`: Events queued for retry (dimension: orgId)
- `onboarding.outbox.batch.failed`: Events exhausted retries (dimension: orgId)
- **Derived:** outbox_health = processed / polled

## Dashboard Panels

### Panel 1: Outbox Processing Health

**Query Pattern:**
```
sum(onboarding.outbox.batch.processed) by (orgId) /
sum(onboarding.outbox.batch.polled) by (orgId)
```

**Display:**
- Graph: Outbox success rate over past 24 hours, broken by org
- Threshold lines: 95% (green), 80% (yellow), 50% (red)
- Alert trigger overlay showing failure_rate_spike signals

### Panel 2: Outbox Failure Rate and Retry Volume

**Query Pattern:**
```
A: sum(onboarding.outbox.batch.failed) by (orgId) /
   sum(onboarding.outbox.batch.polled) by (orgId)

B: sum(onboarding.outbox.batch.retried) by (orgId)
```

**Display:**
- Left axis: Failure rate % (0-100)
- Right axis: Retry count (0-unlimited)
- Line A (blue): Failure rate by org
- Line B (orange): Retry volume by org
- Shaded region: Critical threshold (40% and 50 count)

### Panel 3: Run Success Rate by Organization

**Query Pattern:**
```
sum(onboarding.run.completed) by (orgId) /
(sum(onboarding.run.completed) by (orgId) + sum(onboarding.run.failed) by (orgId))
```

**Display:**
- Card per org showing success rate percentage
- Red background if < 90%
- Green background if >= 95%

### Panel 4: Step Completion Rates

**Query Pattern:**
```
sum(onboarding.step.status{status="completed"}) by (stepKey) /
sum(onboarding.step.status) by (stepKey)
```

**Display:**
- Horizontal bar chart: each step (training, tasks, notifications)
- Threshold: 85% minimum acceptable
- Alert if any step < 85% for 10 minutes

### Panel 5: Intake Token Funnel

**Query Pattern:**
```
A: sum(onboarding.intake.token.issued)
B: sum(onboarding.intake.submitted)
```

**Display:**
- Funnel chart showing issued -> submitted conversion
- Alert if conversion rate < 50% for 1 hour

## Threshold Configuration

All thresholds are configurable via environment variables. Defaults are conservative to avoid alert fatigue.

| Variable | Default | Impact | Guidance |
|----------|---------|--------|----------|
| `ONBOARDING_OUTBOX_ALERT_MIN_POLLED` | 10 | Minimum events in batch to trigger alerts | Increase for low-volume orgs to reduce noise |
| `ONBOARDING_OUTBOX_FAILURE_RATE_WARN` | 0.20 (20%) | Warning threshold for failure rate | Tune based on acceptable transient error rate |
| `ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL` | 0.40 (40%) | Critical threshold for failure rate | Set to worst acceptable baseline |
| `ONBOARDING_OUTBOX_RETRY_COUNT_WARN` | 20 events | Warning threshold for retries | Adjust for expected event volume |
| `ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL` | 50 events | Critical threshold for retries | Set above sustained normal retry load |

## Escalation Matrix

### Severity: Warning

**Condition:** One or both alerts fire at warning severity.

**Recipient:** On-call SRE (Slack #onboarding-alerts)

**SLO:** Acknowledge within 15 minutes

**Action:**
- Check dashboard panels 1-2 for trend (isolated spike vs sustained degradation)
- If transient (spike < 30 min), monitor and close if recovery occurs
- If sustained > 30 min, escalate to critical

### Severity: Critical

**Condition:** One or both alerts fire at critical severity.

**Recipient:** Primary SRE + Escalation Lead (page both)

**SLO:** Acknowledge within 5 minutes, root cause identified within 30 minutes

**Action:**
- Immediately check dashboard panels 1-2
- Run outbox process diagnostics (see recovery command snippets)
- If issue isolated to single org, focus on that org's configuration
- If systemic (multiple orgs), focus on platform-level issues (provider auth, network, downstream dependency)

## Recovery Procedures

### Triage: Outbox Failure Rate Spike

**Root Cause Indicators:**

1. **Missing Configuration**
   - Alert often accompanied by `last_error: "missing_config"`
   - Check: env vars for downstream endpoints (task command, email API key, etc.)
   - Fix: Supply missing config, restart processor

2. **Provider Error (Transient)**
   - `last_error: "provider_error"` with HTTP 429 or 503
   - Check: downstream service status (task command, Resend, etc.)
   - Action: Retries automatically backoff; monitor recovery
   - If > 30 min: escalate to external provider team

3. **Adapter/Validation Error**
   - `last_error: "adapter_error"` indicating malformed event
   - Check: event schema (task sync format, notification recipient format)
   - Action: Fix upstream event generation, reprocess outbox

**Command Snippet: Reprocess Outbox for Single Organization**

```bash
curl -X POST \
  https://api.fleet-compliance.local/api/fleet-compliance/onboarding/outbox/process \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orgId": "org_XXXXXXX",
    "force": false
  }'
```

Response includes:
- `reconciled.queued`: Fallback tasks synced
- `processed.polled`: Total events processed
- `processed.processed`: Successfully sent
- `processed.retried`: Queued for retry
- `processed.failed`: Exhausted retries
- `processed.alertSignals[]`: Any triggered alerts

**Action After Reprocess:**
- Check if failure rate dropped
- If still high, check `last_error` in response for pattern
- If error is transient/external, monitor next batch
- If error is config, fix and run again

### Triage: Outbox Retry Volume Spike

**Root Cause Indicators:**

1. **Intermittent Provider Errors**
   - Retries accumulate when downstream service briefly unavailable
   - Check: provider status pages (task command, Resend)
   - Action: Retries auto-decay; monitor for recovery

2. **Exhausted Retry Attempts**
   - Events with `attempt >= MAX_RETRY_ATTEMPTS (5)` move to failed queue
   - Check: final error in event record (schema, invalid email, etc.)
   - Action: Fix root cause, manually requeue if valid

3. **Event Deduplication Issue**
   - Multiple retries of same event (dedupe key unstable)
   - Check: event dedupe keys are deterministic and stable
   - Action: Inspect outbox event records for duplicates

**Command Snippet: Inspect Outbox Event Details**

```bash
curl -X GET \
  'https://api.fleet-compliance.local/api/fleet-compliance/onboarding/outbox/events?orgId=org_XXXXXXX&status=retrying&limit=20' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Returns event records with:
- `event_id`, `event_type`, `created_at`
- `attempt_count`, `last_error`, `next_retry_at`
- `dedupe_key` (for deduplication troubleshooting)

**Command Snippet: Manually Retry Single Event**

```bash
curl -X POST \
  https://api.fleet-compliance.local/api/fleet-compliance/onboarding/outbox/events/:eventId/retry \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resetAttemptCount": false,
    "targetOrgId": "org_XXXXXXX"
  }'
```

If retry succeeds, alert recovers. If fails repeatedly, event will be moved to failed queue.

### Intake Token Expiry Issues

**Symptom:** Intake submission rate drops below 50%.

**Root Cause:** Tokens expiring before users submit intake.

**Check:**
```bash
curl -X GET \
  'https://api.fleet-compliance.local/api/fleet-compliance/onboarding/intake-tokens?orgId=org_XXXXXXX&status=expired&limit=10' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Fix:** Issue new intake tokens with extended expiry.

```bash
curl -X POST \
  https://api.fleet-compliance.local/api/fleet-compliance/onboarding/intake-tokens \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orgId": "org_XXXXXXX",
    "expiryHours": 120,
    "inviteAfterIntake": true
  }'
```

### Module Gate / Permission Issues

**Symptom:** Run failures with error tag `missing_module` or `unauthorized`.

**Check:** Verify org has onboarding module enabled and user has admin role.

**Command Snippet: Verify Module Status**

```bash
curl -X GET \
  'https://api.fleet-compliance.local/api/fleet-compliance/orgs/org_XXXXXXX/modules' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Confirm `onboarding` appears in `enabledModules` array.

## Operational Safeguards

1. **Minimum Sample Size:** Alerts suppress when event volume < min_polled threshold (default: 10). This prevents false positives from noise in low-volume orgs.

2. **Deterministic Retry:** Events are deduplicated and retried deterministically. Manual retries are safe (idempotent).

3. **Org Isolation:** All metrics and alerts are org-scoped. Spike in one org does not trigger platform-wide alert.

4. **State Consistency:** Outbox processing is transactional. Failed batches leave no partial state.

## Related Documents

- Onboarding Operator Runbook: `docs/integration/ONBOARDING_OPERATOR_RUNBOOK.md`
- Onboarding Phase 6 Plan: `docs/integration/ONBOARDING_PHASE6_RELEASE_GATE_PLAN.md`
- Onboarding Orchestration Spec: `docs/integration/ONBOARDING_ORCHESTRATION_IMPLEMENTATION_SPEC.md`
