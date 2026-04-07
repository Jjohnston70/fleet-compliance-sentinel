# UPTIME_SETUP.md

## UptimeRobot Setup (Current Production Baseline)

Plan: **Solo**  
Status page: **https://status.pipelinepunks.com**

## Monitor 1 — Website
- Friendly name: `Pipeline Punks Website`
- Monitor type: `HTTP(s)`
- URL: `https://www.pipelinepunks.com`
- Check interval: `1 minute`

## Monitor 2 — Penny API Health
- Friendly name: `Pipeline Penny API Health`
- Monitor type: `HTTP(s)`
- URL: `https://www.pipelinepunks.com/api/penny/health`
- Check interval: `1 minute`

## Monitor 3 — Railway Backend Health
- Friendly name: `Pipeline Penny Railway Health`
- Monitor type: `HTTP(s)` using `GET`
- URL: `https://pipeline-punks-v2-production.up.railway.app/health`
- Check interval: `1 minute`

## Status Page Configuration
- Name: `Pipeline Punks Status`
- Custom domain: `status.pipelinepunks.com`
- DNS record: `status` CNAME `stats.uptimerobot.com`
- SSL/TLS: auto-provisioned by UptimeRobot

## Validation
- Confirm all three monitors show `UP`.
- Confirm status page renders over HTTPS at `https://status.pipelinepunks.com`.
- Save screenshots for SOC2 evidence (`soc2-evidence/monitoring/UPTIMEROBOT_STATUS_PAGE.md`).
