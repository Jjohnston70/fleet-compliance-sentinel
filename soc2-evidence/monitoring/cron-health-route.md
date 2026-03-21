# Cron Health Route Evidence

## Source Files
- `migrations/001_cron_log.sql`
- `src/lib/chief-db.ts`
- `src/app/api/chief/alerts/run/route.ts`
- `src/app/api/chief/cron-health/route.ts`

## Health Route Contract
- Endpoint: `GET /api/chief/cron-health`
- Admin protected via Clerk role/email bypass checks.
- Response fields:
  - `lastRun`
  - `hoursAgo`
  - `status`
  - `isHealthy`

## Health Threshold
- `isHealthy = true` when latest `chief-alert-sweep` run is within `25` hours.

## Local Verification Snapshot
- Request without auth returned `401` with JSON body:

```json
{"error":"Unauthorized"}
```

- `/resources` request returned `404` after Drive removal.
