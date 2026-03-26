# Audit Logger Code Reference

Source file: `src/lib/audit-logger.ts`

## Key Controls Implemented

- Structured JSON log output with fixed schema.
- ISO timestamp per event.
- Explicit `action`, `userId`, `orgId`, `resourceType`, `resourceId`, `severity`, and `environment`.
- Metadata sanitization that strips known PII keys:
  - `name`
  - `driverName`
  - `email`
  - `ssn`
  - `dob`
  - `medicalCard`
  - `licenseNumber`
  - `address`

## Example Event Shape

```json
{
  "timestamp": "2026-03-21T19:04:43.777Z",
  "action": "penny.query",
  "userId": "user_abc",
  "orgId": "org_xyz",
  "resourceType": "penny.query",
  "resourceId": null,
  "metadata": {
    "provider": "anthropic",
    "kbHit": true,
    "responseMs": 842
  },
  "severity": "info",
  "environment": "production"
}
```

## Log Drain & Retention (added 2026-03-24)

Audit logs are emitted via `console.log(JSON.stringify(payload))` and captured by a Vercel Log Drain to Datadog.

### Datadog Configuration

- **Site**: `us5.datadoghq.com`
- **Service**: `pipeline-punks-nextjs`
- **Source**: `vercel`

### Pipeline: Vercel - pipeline-punks-nextjs Audit Logs

9 processors parse the structured JSON into queryable Datadog facets:

| # | Processor | Mapping |
|---|---|---|
| 1 | Grok Parser | Parses JSON message body |
| 2 | Remapper | `userId` → `usr.id` |
| 3 | Remapper | `orgId` → `org.id` |
| 4 | Remapper | `severity` → `status` |
| 5 | Remapper | `environment` → `env` |
| 6 | Remapper | `action` → `action` |
| 7 | Remapper | `resourceType` → `resource.type` |
| 8 | Remapper | `resourceId` → `resource.id` |
| 9 | Status Remapper | Maps status to Datadog log level (Error/Warn/Info) |

### Index Cost-Split Strategy

| Index | Filter | Retention | Purpose |
|---|---|---|---|
| `audit-logs-soc2` | `source:vercel @action:*` | 15d (trial) → 365d (Pro) | SOC 2 / CCPA audit trail |
| `vercel-general-7d` | `source:vercel` | 7 days | Build, request, general logs |

### Instrumented Routes (17+)

| Route | Methods | Audit Actions |
|---|---|---|
| `/api/fleet-compliance/alerts/preview` | GET | `data.read` |
| `/api/fleet-compliance/alerts/run` | POST | `cron.run` |
| `/api/fleet-compliance/alerts/trigger` | POST | `admin.action` |
| `/api/fleet-compliance/assets` | GET, POST | `data.read`, `data.write` |
| `/api/fleet-compliance/bulk-template` | GET | `data.read` |
| `/api/fleet-compliance/cron-health` | GET | `cron.run` |
| `/api/fleet-compliance/errors/client` | POST | `data.write` |
| `/api/fleet-compliance/fmcsa/lookup` | GET | `data.read` |
| `/api/fleet-compliance/import/parse` | POST | `import.upload` |
| `/api/fleet-compliance/import/rollback` | POST | `import.rollback`, `data.delete` |
| `/api/fleet-compliance/import/save` | POST | `import.approve`, `data.write`, `data.delete` |
| `/api/fleet-compliance/import/setup` | POST | `data.read` |
| `/api/fleet-compliance/[collection]/[id]/restore` | POST | `data.restore` |
| `/api/invoices/import` | POST | `import.upload` |
| `/api/invoices/setup` | POST | `data.read` |
| `/api/penny/query` | POST | `penny.query` (no query text logged) |
