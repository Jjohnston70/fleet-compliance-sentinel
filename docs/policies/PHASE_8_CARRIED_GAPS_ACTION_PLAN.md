# Phase 8 Carried Gaps Action Plan

Date: 2026-03-25
Owner: Jacob Johnston, True North Data Strategies LLC

## Open Gap 1: Status Page Not Live

- Current State: `status.pipelinepunks.com` does not resolve.
- Control Impact: CC7.3 operational evidence gap.
- Assigned To: Jacob Johnston
- Due Date: 2026-03-29
- Required Actions:
  1. Complete UptimeRobot status page creation.
  2. Configure DNS CNAME for `status.pipelinepunks.com`.
  3. Capture evidence screenshots and save under `soc2-evidence/incident-response/`.

## Open Gap 2: Secret Rotation Never Performed

- Current State: Rotation schedule exists, execution log is empty.
- Control Impact: CC6.1 / CC8.1 operational evidence gap.
- Assigned To: Jacob Johnston
- Due Date: 2026-03-29
- Required Actions:
  1. Rotate first batch of critical secrets (`CLERK_SECRET_KEY`, `DATABASE_URL`, `PENNY_API_KEY`, `FLEET_COMPLIANCE_CRON_SECRET`).
  2. Redeploy affected services and run smoke checks.
  3. Record exact rotation timestamps in `SECURITY_ROTATION.md` and `soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md`.

## Open Gap 3: XLSX Upstream Vulnerability

- Current State: Resolved in app code by removing `xlsx` dependency.
- Control Impact: Closed after dependency and audit verification.
- Assigned To: Engineering
- Completion Date: 2026-03-25
- Evidence: `npm audit` now reports no `xlsx` advisory path.
