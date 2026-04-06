# Onboarding Operator Runbook

Last Updated: 2026-04-06  
Owners: Fleet-Compliance platform team

## Purpose

Operational runbook for Fleet-Compliance onboarding orchestration, including employee intake token flow, delayed invite policy, module gates, and outbox monitoring.

## Scope

This runbook covers:

1. Admin onboarding APIs.
2. Client intake token flow.
3. Delayed invite behavior.
4. Outbox processing and retry behavior.
5. Observability metrics and alert signals.

## Required Module Gates

End-to-end module/role checks now apply across surfaces:

1. UI sidebar visibility is org-module + role aware.
2. `/fleet-compliance/employees/new` requires:
   - org role `admin`
   - module `onboarding` enabled
3. Onboarding admin APIs require `requireOnboardingAdminContext`:
   - employees create/update
   - run list/detail/retry
   - intake token issuance
   - outbox processing
   - invite override
4. Adapter-level module checks:
   - TrainingAdapter requires `training`
   - TaskAdapter requires `tasks`
   - NotificationAdapter always queues direct send; analytics CC only when `email-analytics` is enabled
5. Intake token submit path enforces onboarding module before creating/updating runs.

## Intake + Invite Flow

### 1) Issue intake token

Endpoint: `POST /api/fleet-compliance/onboarding/intake-tokens`  
Role: admin  
Result: signed one-time token + intake URL

Default policy:

1. `invite_after_intake=true`
2. `invite_override_allowed=true`
3. token expiry defaults to 72 hours

### 2) Client completes intake

Endpoint(s):

1. `GET /api/fleet-compliance/onboarding/intake/{token}`
2. `POST /api/fleet-compliance/onboarding/intake/{token}`

Guarantees:

1. signed token validation
2. expiry enforcement
3. one-time token consumption
4. strict token/org binding
5. deterministic onboarding run execution

### 3) Delayed invite behavior

When `invite_after_intake=true`, invite attempts occur after successful token submission and run creation.

Admin override endpoint:

`POST /api/fleet-compliance/onboarding/employees/{employeeProfileId}/invite`

Use override for:

1. manual resend
2. policy exceptions
3. non-standard redirect URLs

## Outbox Operations

Endpoint: `POST /api/fleet-compliance/onboarding/outbox/process`

Processing behavior:

1. reconcile unsynced fallback tasks
2. process due outbox events
3. org-scoped event polling (`org_id` filtered)
4. bounded retry (`MAX_RETRY_ATTEMPTS=5`)

Response fields:

1. `reconciled.queued`
2. `processed.polled`
3. `processed.processed`
4. `processed.retried`
5. `processed.failed`
6. `processed.alertSignals[]`

## Observability Signals

Structured metric stream source: `onboarding.metrics`

Current metric names:

1. `onboarding.run.started`
2. `onboarding.run.completed`
3. `onboarding.run.failed`
4. `onboarding.run.retry`
5. `onboarding.step.status`
6. `onboarding.intake.token.issued`
7. `onboarding.intake.submitted`
8. `onboarding.outbox.batch.polled`
9. `onboarding.outbox.batch.processed`
10. `onboarding.outbox.batch.retried`
11. `onboarding.outbox.batch.failed`

Alert signal stream source: `onboarding.alerts`

Current alert keys:

1. `onboarding.outbox.failure_rate_spike`
2. `onboarding.outbox.retry_volume_spike`

Threshold env vars:

1. `ONBOARDING_OUTBOX_ALERT_MIN_POLLED` (default `10`)
2. `ONBOARDING_OUTBOX_FAILURE_RATE_WARN` (default `0.20`)
3. `ONBOARDING_OUTBOX_FAILURE_RATE_CRITICAL` (default `0.40`)
4. `ONBOARDING_OUTBOX_RETRY_COUNT_WARN` (default `20`)
5. `ONBOARDING_OUTBOX_RETRY_COUNT_CRITICAL` (default `50`)

## Triage Playbook

### Outbox failure-rate spike

1. Run outbox process for affected org.
2. Inspect `processed.alertSignals` for severity.
3. Check outbox `last_error` patterns (missing config vs provider errors).
4. If `missing_config`, remediate env/secrets first.
5. If provider/network transient, keep retries active and monitor decay.

### Retry-volume spike

1. Identify dominant event type (`onboarding.task.sync` vs `onboarding.notification.send`).
2. Validate primary downstream health:
   - task command endpoint
   - Resend API health/auth
3. Confirm dedupe keys are stable for replay safety.

## Compliance Notes

1. State transitions remain deterministic.
2. Audit logs avoid PII payload expansion.
3. Token-based intake never bypasses org binding and one-time consume checks.
