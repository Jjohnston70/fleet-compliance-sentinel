# Module Gateway Operations Runbook (Phase 8)

Date: 2026-03-31  
Audience: Fleet-Compliance operators and on-call maintainers

## Purpose

Operate integrated module runs from Fleet-Compliance with consistent execution controls, status visibility, and failure escalation.

## Primary Operator Surface

1. Browser UI: `/fleet-compliance/tools` (admin only)
2. API endpoints:
   - `POST /api/modules/run`
   - `GET /api/modules/status/:id`
   - `GET /api/modules/catalog`

## Roles and Access

1. Run endpoints are protected by Fleet-Compliance org-admin role checks.
2. Member-role sessions may view operational pages but cannot execute runs.
3. Penny and non-module routes are unaffected by module gateway permissions.

## Standard Operating Procedure

1. Open `/fleet-compliance/tools`.
2. Select module and action.
3. Confirm args JSON matches action schema.
4. Start with `Dry Run` for payload/command validation.
5. Switch to `Live Run` once dry-run validation passes.
6. Track run status until terminal state (`success` or `fail`).
7. Review output previews, result payload, and artifacts (if any).

## Runtime Controls

1. Allowlist-only action execution (`moduleId + actionId`).
2. Timeout clamp enforced by gateway max (`900000 ms`).
3. Output capture limits and preview truncation applied for API safety.
4. Command-arg sanitization enforces per-module root constraints for file/path-like args.
5. Per-org/per-action throttling enforces request window limits with deterministic `RATE_LIMITED` failures.
6. Concurrent run guardrails enforce both org-level and action-level in-flight limits.

## Failure Logging and Alerts

1. Every failed run writes structured server log entry:
   - Prefix: `[module-gateway] run failed`
2. Optional webhook alert:
   - Set `MODULE_GATEWAY_FAILURE_WEBHOOK_URL`
   - Gateway POSTs JSON payload for each failed run.
3. Webhook timeout is 5s; webhook failure does not change run status.
4. Sandbox control failures are persisted in `module_gateway_sandbox_events` with:
   - `event_type` (`rate_limit`, `concurrency_limit`, `sanitization`, `timeout`)
   - `org_id`, `user_id`, `module_id`, `action_id`
   - `error_code`, `message`, and JSON metadata

## Failure Triage Sequence

1. Identify run in `/fleet-compliance/tools` history.
2. Capture:
   - `run.id`, `moduleId`, `actionId`, `correlationId`
   - `error.code`, `error.message`
   - `stderrPreview`
3. Check common causes:
   - Missing module dependencies
   - Missing env vars/secrets
   - Invalid enum/path args
   - Rate limits or in-flight concurrency limits reached
   - Timeout threshold too low
4. Re-run with:
   - Corrected args
   - Backoff based on throttle retry window
   - Increased `timeoutMs` (if safe)
   - `dryRun` for validation before live retry

## Throttling and Concurrency Defaults

1. `MODULE_GATEWAY_RATE_LIMIT_PER_WINDOW` default: `20`
2. `MODULE_GATEWAY_RATE_LIMIT_WINDOW_SECONDS` default: `60`
3. `MODULE_GATEWAY_MAX_CONCURRENT_PER_ACTION` default: `2`
4. `MODULE_GATEWAY_MAX_CONCURRENT_PER_ORG` default: `6`
5. `MODULE_GATEWAY_MAX_ARG_STRING_LENGTH` default: `4096`

## Penny Cost Governance

1. Every successful Penny query with token usage metadata writes a durable row in `ai_usage_cost_events`.
2. Attribution keys persisted per request:
   - `request_id`, `org_id`, `user_id`
   - `feature` (`penny.query`)
   - `provider`, `model`
   - `prompt_tokens`, `completion_tokens`, `total_tokens`, `estimated_cost_usd`
3. Monthly budget thresholds:
   - `AI_BUDGET_WARNING_USD` default: `50`
   - `AI_BUDGET_CRITICAL_USD` default: `150`
4. First threshold crossing per org/month emits durable alert rows in `ai_usage_budget_alerts` (`warning`/`critical`) and structured audit logs via `budget.alert`.

## Command-center Bridge Notes

1. Bridge actions execute in-process, not as spawned shell commands.
2. Runtime requires built dist file:
   - `tooling/command-center/dist/src/tools.js`
3. If bridge runtime is missing, action fails with explicit error in status output.

## Operational Guardrails

1. Do not pass arbitrary shell fragments in args.
2. Keep `correlationId` unique for external callers.
3. Prefer narrow actions before broad all-source/all-product actions.
4. For scheduled automation, use dry-run smoke checks after deploys.

## Escalation

Escalate to engineering when:

1. Any module action fails repeatedly with same error after dependency/env checks.
2. Catalog endpoint does not return all integrated module IDs.
3. UI cannot poll status for active runs.
4. Failure alerts are not emitted while failure logs are present.
