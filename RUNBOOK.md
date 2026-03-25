# RUNBOOK

Operational runbook for Fleet-Compliance + Penny production support.

## Emergency Procedures

1. Roll back Vercel deployment (UI + CLI)
   - UI: Vercel Dashboard -> Project -> Deployments -> select previous healthy deployment -> Promote to Production.
   - CLI: `vercel rollback <deployment-url-or-id> --yes`.
   - Verify: `GET /api/penny/health` and `/api/fleet-compliance/cron-health` return expected status.

2. Restart Railway Penny service
   - Open Railway project -> Penny service -> Deployments -> Redeploy latest successful commit.
   - If service is hung, trigger restart/redeploy from service controls.
   - Verify backend endpoint: `GET $PENNY_API_URL/health`.

3. Connect to Neon Postgres console
   - Neon console -> Project -> SQL Editor.
   - Validate critical tables:
     - `fleet_compliance_records`
     - `cron_log`
     - `fleet-compliance_error_events`
     - invoice tables
   - Use read-only checks first (`SELECT COUNT(*) ...`) before any writes.

4. Check Clerk org membership
   - Clerk Dashboard -> Organizations.
   - Confirm target user is in expected org only.
   - Validate org-scoped behavior in app by switching active org and checking `/fleet-compliance/assets`.

5. Check cron health endpoint
   - Call `GET /api/fleet-compliance/cron-health` as an org admin.
   - `isHealthy` should be `true` and `hoursAgo <= 25`.
   - If stale: trigger `/api/fleet-compliance/alerts/run` with authorized credentials and inspect logs.

6. Read Vercel logs for a failed request
   - Vercel Dashboard -> Project -> Logs.
   - Filter by route and timestamp window.
   - Correlate with structured `auditLog` entries (JSON) and request errors.
   - **For logs older than 1-3 days**: Use Datadog Log Explorer (see section below).

7. Check Sentry for error details
   - Open Sentry project: `pipeline-punks-nextjs`.
   - Filter by environment (`production`) and recent regressions.
   - Confirm scrubbed payloads only (no names, emails, DOB, SSN, medical, license data).

8. What to do if Penny returns 502
   - Confirm Railway Penny health endpoint response.
   - Validate `PENNY_API_URL` and `PENNY_API_KEY` in Vercel env.
   - Review `/api/penny/query` proxy logs and Sentry events.
   - If backend provider outage: enable/confirm fallback mode and communicate degraded behavior.

## Datadog Log Drain

### Access
- Datadog site: `us5.datadoghq.com`
- Service: `pipeline-punks-nextjs`
- Source: `vercel`

### Indexes

| Index | Filter | Retention | Purpose |
|---|---|---|---|
| `audit-logs-soc2` | `source:vercel @action:*` | 15d (trial) → 365d (Pro) | SOC 2 / CCPA audit trail |
| `vercel-general-7d` | `source:vercel` | 7 days | Build, request, general logs |

### Pipeline: Vercel - pipeline-punks-nextjs Audit Logs

9 processors in order:
1. Grok Parser — parses the JSON message body
2. Remapper: `userId` → `usr.id`
3. Remapper: `orgId` → `org.id`
4. Remapper: `severity` → `status`
5. Remapper: `environment` → `env`
6. Remapper: `action` → `action` (top-level)
7. Remapper: `resourceType` → `resource.type`
8. Remapper: `resourceId` → `resource.id`
9. Status Remapper — maps status to Datadog log level (Error/Warn/Info)

### Common Datadog Queries

| Purpose | Query |
|---|---|
| All audit events | `source:vercel @action:*` |
| Errors only | `source:vercel @action:* status:error` |
| Specific user activity | `source:vercel @action:* @usr.id:<clerk_user_id>` |
| Specific org activity | `source:vercel @action:* @org.id:<clerk_org_id>` |
| Import operations | `source:vercel @action:import.*` |
| Penny queries | `source:vercel @action:penny.query` |
| Data deletes (CCPA) | `source:vercel @action:data.delete` |
| SOC 2 window (high severity) | `source:vercel @action:* status:error index:audit-logs-soc2` |

### Vercel Log Drain Configuration

- **Delivery format**: JSON
- **Sources**: Build, Edge, External, Function
- **Environments**: Production
- **Endpoint**: `https://http-intake.logs.us5.datadoghq.com/api/v2/logs` (with API key, source, service, and tags as query params)

## Escalation Contacts

- Security on-call: security@pipelinepunks.com
- Vercel support: https://vercel.com/help
- Neon support/docs: https://neon.tech/docs
- Clerk support: https://clerk.com/contact
- Railway support: https://docs.railway.com/reference/support
- Datadog support: https://docs.datadoghq.com/help/

## Sentry Alert Setup

- Integration: Slack workspace `Truenorthstrategyops`.
- Channel: `#all-truenorthstrategyops`.
- Rule: `pipeline-punks-production-errors`.
- Trigger: new issue or regression in `production`.
- Required payload hygiene: user context limited to `userId` + `orgId`; no names/emails in events.

## Common Incidents With Steps

### Penny 502

1. Confirm `GET /api/penny/health` status and Railway service status.
2. Check Vercel logs for backend status codes and timeout traces.
3. Check Sentry event frequency and release correlation.
4. Validate provider keys and Railway env (`LLM_PROVIDER`, provider API keys).
5. Redeploy Railway service if infrastructure-level failure is detected.

### Fleet-Compliance page error boundary triggered

1. Reproduce route with org admin account.
2. Verify client error event write in `fleet-compliance_error_events`.
3. Check Sentry stack trace and deployment release tag.
4. Roll back deployment if regression is production blocking.

### Cron health shows unhealthy

1. Inspect `/api/fleet-compliance/cron-health` payload (`lastRun`, `hoursAgo`, `lastResult`).
2. Trigger manual alert run as org admin.
3. Validate `FLEET_COMPLIANCE_CRON_SECRET` and invocation source for scheduled jobs.
4. Inspect `cron_log` table in Neon for missing/failed runs.

### Import fails silently

1. Verify `/api/fleet-compliance/import/parse` returns expected `totalRows` and row warnings.
2. Verify `/api/fleet-compliance/import/save` response (`batchId`, `totalInserted`, `collections`).
3. Validate import role: admin required for save/rollback.
4. Check Sentry and Vercel logs for 4xx/5xx and validation failures.
5. If needed, rollback by `batchId` and retry import.

### Audit logs not appearing in Datadog

1. Check Vercel Log Drain status: Vercel Dashboard -> Project -> Settings -> Log Drains.
2. Verify the drain shows "Active" status and last delivery timestamp.
3. In Datadog Log Explorer, search `source:vercel` (no filter) to confirm any logs are flowing.
4. If no logs: check Datadog API key validity at `us5.datadoghq.com` -> Organization Settings -> API Keys.
5. If logs flow but audit fields are missing: check Datadog Pipeline -> "Vercel - pipeline-punks-nextjs Audit Logs" for processor errors.
6. Verify the application is emitting structured JSON via `auditLog()` — check a recent Vercel function log for the JSON payload.
