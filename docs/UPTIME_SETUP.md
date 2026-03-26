# UPTIME_SETUP.md

## UptimeRobot Setup (Manual)

Create two HTTP(s) monitors for production availability checks.

## Monitor 1 — Website
- Friendly name: `Pipeline Punks Website`
- Monitor type: `HTTP(s)`
- URL: `https://www.pipelinepunks.com`
- Check interval: `5 minutes`
- Alert contacts: `jacob@truenorthstrategyops.com`

## Monitor 2 — Penny Backend Health
- Friendly name: `Pipeline Penny Railway Health`
- Monitor type: `HTTP(s)`
- URL: `https://pipeline-punks-v2-production.up.railway.app/health`
- Check interval: `5 minutes`
- Alert contacts: `jacob@truenorthstrategyops.com`

## Alerting Recommendations
- Trigger alert on 2 consecutive failures.
- Send recovery notification when monitor returns to UP state.
- Keep alerts enabled for email at minimum.

## Validation
- Confirm both monitors show `UP` after creation.
- Save screenshots of monitor configuration and active status for SOC2 evidence.
