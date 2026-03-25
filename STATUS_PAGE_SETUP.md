# Status Page Setup

Owner: Jacob
Last Updated: 2026-03-25

## 1. Create UptimeRobot Status Page Account

1. Go to `https://uptimerobot.com/statuspage`.
2. Create or sign in to the account used for operations ownership.
3. Create a new public status page for Fleet-Compliance.

## 2. Configure Custom Domain

1. In UptimeRobot status page settings, set custom domain to `status.pipelinepunks.com`.
2. In DNS provider, add the CNAME record required by UptimeRobot.
3. Wait for DNS propagation and verify SSL is active.

## 3. Add Monitors from Phase 1

Add these monitors to the status page:

- `Pipeline Punks Website` -> `https://www.pipelinepunks.com`
- `Pipeline Penny Railway Health` -> `https://pipeline-punks-v2-production.up.railway.app/health`

Recommended check interval: 5 minutes.

## 4. Post an Incident Update

1. Open the status page admin dashboard.
2. Select `Create Incident`.
3. Set impacted components and incident status (`Investigating` or `Identified`).
4. Post a short update with:
   - Impact summary
   - Current mitigation
   - Next update time
5. Continue updates on a fixed cadence until recovery.

## 5. Resolve an Incident

1. Confirm service has recovered and stayed stable.
2. Update incident status to `Monitoring`.
3. After stable window, set status to `Resolved`.
4. Publish a final summary (root cause, fix, preventive action).
5. Link the related internal incident record in `SECURITY_REPORTS/incidents/`.
