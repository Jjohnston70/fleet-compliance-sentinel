# Status Page Setup

Owner: Security and Operations Team
Last Updated: 2026-03-25

## Current State

- `https://status.pipelinepunks.com` is not operational as of 2026-03-25 (DNS resolution fails).
- Production health endpoint check succeeds: `https://www.pipelinepunks.com/api/penny/health` returns HTTP `200`.

## 1. Create UptimeRobot Status Page Account

1. Go to `https://uptimerobot.com/statuspage`.
2. Sign in with the shared operations account.
3. Create a public status page for Fleet-Compliance.

## 2. Configure Custom Domain

1. In status page settings, set custom domain to `status.pipelinepunks.com`.
2. Add the CNAME record required by UptimeRobot in DNS.
3. Wait for propagation, then verify the status page resolves over HTTPS.

## 3. Add Monitors from Phase 1

Add these public components and monitors:

- `Pipeline Punks Website` -> `https://www.pipelinepunks.com`
- `Pipeline Penny Railway Health` -> `https://pipeline-punks-v2-production.up.railway.app/health`

Recommended check interval: 5 minutes.

## 4. Post an Incident Update

1. Open status page admin dashboard.
2. Select `Create Incident`.
3. Set impacted components and status (`Investigating` or `Identified`).
4. Publish update with:
   - Impact summary
   - Current mitigation
   - Next update time
5. Continue updates on fixed cadence until resolution.

## 5. Resolve an Incident

1. Verify service stability.
2. Set status to `Monitoring`.
3. After stable window, set status to `Resolved`.
4. Publish final summary (root cause, fix, prevention).
5. Link internal incident record under `SECURITY_REPORTS/incidents/`.

## 6. Operational Evidence Checklist (Required)

Capture and store under `soc2-evidence/incident-response/`:

1. Status page URL resolving at `status.pipelinepunks.com`.
2. Screenshot showing both monitors in `UP` state.
3. Screenshot of one `Investigating` incident post.
4. Screenshot of same incident moved to `Resolved`.
5. Date-stamped note of reviewer and verification time.
