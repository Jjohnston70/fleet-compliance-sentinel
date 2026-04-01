# Enterprise Function Calling Hardening

Date frozen: 2026-04-01  
Scope: Workstream A (Layers 1-7) for April 2-25 sprint  
Status: A0 complete (contract lock)

## Objective

Lock non-negotiable orchestration contracts before implementation so Layer 1-7 work stays additive and does not break existing module routes or Penny behavior.

## Compatibility Guardrails

The following public routes remain stable through this hardening sprint:

- `POST /api/modules/run`
- `GET /api/modules/status/:id`
- `GET /api/modules/catalog`
- `GET /api/modules/artifact?runId=<id>&path=<artifact_path>`

Any new fields introduced by Layer 1-7 must be additive and optional for existing clients.

## Canonical Call Envelope

Canonical envelope shape for orchestration events and durable audit records:

```json
{
  "requestId": "req_01JYF9W2P0V9Q6R7K8M4N5Z1A2",
  "orgId": "org_2hM8w",
  "userId": "user_2SLDq",
  "qualifiedName": "command-center.route.tool_call",
  "args": {
    "qualifiedName": "asset-command.list_assets",
    "parameters": {
      "page": 1,
      "pageSize": 25
    }
  },
  "attempt": 1,
  "status": "running",
  "errorCode": null
}
```

Field definitions:

- `requestId`: global id for a single orchestration request lifecycle.
- `orgId`: tenant boundary key used for ACL, logging, and isolation.
- `userId`: initiating actor.
- `qualifiedName`: normalized operation target (`moduleId.actionId` or routed tool name).
- `args`: normalized validated arguments.
- `attempt`: 1-based retry attempt counter.
- `status`: lifecycle status (`queued|running|success|fail`).
- `errorCode`: populated only on failure paths.

## Error Taxonomy (Frozen)

| Code | Class | Retryable | Default HTTP |
| --- | --- | --- | --- |
| `VALIDATION_ERROR` | `validation` | no | `400` |
| `PERMISSION_DENIED` | `authorization` | no | `403` |
| `MODULE_NOT_FOUND` | `validation` | no | `404` |
| `ACTION_NOT_ALLOWED` | `validation` | no | `400` |
| `TENANT_ISOLATION_VIOLATION` | `isolation` | no | `403` |
| `MISSING_ENV` | `system` | no | `500` |
| `SANITIZATION_ERROR` | `sandbox` | no | `400` |
| `RATE_LIMITED` | `throttle` | yes | `429` |
| `RETRY_EXHAUSTED` | `retry` | no | `503` |
| `BUDGET_EXCEEDED` | `budget` | no | `429` |
| `EXEC_TIMEOUT` | `execution` | yes | `504` |
| `EXEC_FAILED` | `execution` | yes | `502` |
| `INTERNAL_ERROR` | `system` | yes | `500` |

Retry policy lock for Layer 4:

- Only retry errors explicitly marked `retryable=true`.
- Hard cap: `3` total attempts.
- On final failure after retries: emit `RETRY_EXHAUSTED`.

## Layer Boundaries (Frozen)

Layer boundaries define ownership and prevent overlapping behavior changes.

### Layer 1: Tool Registry (Context-Aware Selection)

- Owns tool discovery, relevance scoring, and exposure caps.
- Does not execute tools.

### Layer 2: Schema Validation

- Owns bidirectional validation/coercion and correction errors.
- Does not authorize or execute.

### Layer 3: Execution Sandbox

- Owns permission checks, sanitization, deterministic command construction, timeout/rate controls.
- Does not run retry policy or budgeting.

### Layer 4: Retry Manager

- Owns retry decisions using taxonomy retryability + cap 3.
- Does not mutate source business logic.

### Layer 5: Cost Tracking

- Owns token/runtime attribution and budget threshold signaling.
- Must not block contract-compatible success paths unless budget policy explicitly denies execution.

### Layer 6: Audit Logging

- Owns durable append-only call records using canonical envelope.
- No mutation/deletion of prior call records.

Layer 6 implementation notes (A7):

- Durable table: `module_gateway_invocation_audit`
- Append-only event types: `run_submitted`, `attempt_completed`, `run_escalated`, `remote_dispatch`
- Required correlation fields per row:
  - `run_id`, `request_id`, `org_id`, `user_id`
  - `module_id`, `action_id`, `qualified_name`
  - `attempt`, `max_attempts`, `status`, `error_code`
- Payload controls:
  - `args_redacted`, `result_redacted`, and `details_redacted` persisted as redacted JSONB
  - Redaction is key-based and recursive for common sensitive keys (PII/contact identifiers)

### Layer 7: Tenant Isolation

- Owns per-org/per-user visibility and execution ACL enforcement.
- Deny-by-default on both catalog exposure and execution.

## Out of Scope for A0

- No runtime behavior change to current endpoints.
- No refactor of Penny query path.
- No migration or schema rollout beyond additive type/doc contract lock.
