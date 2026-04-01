# Enterprise Hardening Test Report (A8)

Date: 2026-04-01  
Scope: Workstream A Layers 1-7 integrated validation  
Reporter: Codex

## Executive Decision

- **Go** for repository state and deployment promotion.
- Connected-environment `DATABASE_URL` verification is complete, including durable table write/readback checks.

## Verification Run

1. `npm --prefix tooling/command-center run build` -> pass
2. `npm --prefix tooling/command-center run test` -> pass (33/33)
3. `npx tsc --noEmit` -> pass
4. `npm run lint` -> pass (pre-existing a11y warnings only)

## Integrated Smoke Checks

Executed via direct runner harness:

```json
{
  "rateLimit": { "firstOk": true, "secondCode": "RATE_LIMITED" },
  "sanitization": { "code": "SANITIZATION_ERROR" },
  "retryableFailure": { "ok": true, "errorCode": "RETRY_EXHAUSTED", "attemptCount": 3 },
  "nonRetryableFailure": { "ok": true, "errorCode": "VALIDATION_ERROR", "attemptCount": 1 }
}
```

Interpretation:

1. Layer 3 throttling and sanitization controls are active.
2. Layer 4 retry engine respects cap=3 for retryable errors.
3. Non-retryable validation failures stop at first attempt.

## Layer-by-Layer Outcome

1. Layer 1 Tool Registry: pass (relevance-capped registry/service paths compile/test green)
2. Layer 2 Validation: pass (coercion + structured field errors active)
3. Layer 3 Sandbox: pass (rate limit + concurrency + sanitization + timeout pathways)
4. Layer 4 Retry: pass (retryable matrix + cap=3 + escalation row wiring)
5. Layer 5 Cost Tracking: pass in code path (durable usage + budget alert persistence implemented)
6. Layer 6 Audit Logging: pass in code path (append-only invocation audit + redaction + status exposure)
7. Layer 7 Tenant Isolation: pass in code path (ACL filtering and run ownership enforcement remains active)

## Connected Environment Verification (Completed)

Follow-up run executed with `DATABASE_URL` present in the shell and synthetic verification writes/readbacks completed successfully.

Readback evidence:

```json
{
  "module_gateway_acl_rules": 1,
  "module_gateway_invocation_audit": 1,
  "module_gateway_retry_escalations": 1,
  "module_gateway_sandbox_events": 1,
  "ai_usage_cost_events": 1,
  "ai_usage_budget_alerts": 2
}
```

Interpretation:

1. ACL persistence validated (`module_gateway_acl_rules`).
2. Append-only invocation audit persistence validated (`module_gateway_invocation_audit`).
3. Retry escalation persistence validated (`module_gateway_retry_escalations`).
4. Sandbox telemetry persistence validated (`module_gateway_sandbox_events`).
5. Penny usage and budget alert persistence validated (`ai_usage_cost_events`, `ai_usage_budget_alerts`).
6. Synthetic rows were cleaned up after verification.

## Go/No-Go Rationale

No compile, lint, or unit test blockers remain, and functional smoke checks confirm core hardening behavior for throttling, sanitization, and retry policy. Connected DB persistence verification is now complete, so no remaining A8 validation risk is open.
