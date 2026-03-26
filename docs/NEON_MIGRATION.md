# Neon Paid Plan Migration Checklist

Date: 2026-03-25

## Why Upgrade Before First Client

- SLA and support: paid plans provide stronger production reliability guarantees.
- Backups and recovery: paid tiers are required for dependable backup/PITR workflows.
- Connection limits: free-tier limits can cause throttling/timeouts under concurrent client traffic.
- Compliance posture: vendor controls (availability + recoverability) are stronger on paid tiers.

Estimated baseline: **Neon Launch plan ~ $19/month**.

## Upgrade Steps (Dashboard)

1. Open Neon Console: `https://console.neon.tech/app/projects`.
2. Select production project.
3. Open Billing/Plan section.
4. Choose **Launch** plan (or higher).
5. Confirm workspace/project billing assignment.
6. Verify project now shows paid-tier entitlements.

## Verify Backups Are Enabled

1. In project, open Branch/Project settings and backup section.
2. Confirm scheduled backups are active for production branch.
3. Capture screenshot evidence of:
   - Plan tier
   - Backup status
   - Backup timestamp/retention window

## Test Point-in-Time Recovery (PITR)

1. Create a non-production test branch from production.
2. Insert a known test marker row in a disposable table/record.
3. Delete or mutate the marker row.
4. Execute restore to a timestamp before mutation.
5. Validate the marker row state is recovered.
6. Document:
   - restore timestamp
   - duration
   - pass/fail
   - screenshots/logs

## Acceptance Criteria

- Paid plan active.
- Backups confirmed enabled.
- PITR test executed and documented.
- SOC2 evidence stored under `soc2-evidence/vendor-management/` (or designated vendor-control folder).

