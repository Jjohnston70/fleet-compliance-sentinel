# UptimeRobot Status Page Evidence

SOC2 A1.1 System Availability | Updated 2026-03-27

## Account and Plan

- UptimeRobot account: `jacob@truenorthstrategyops.com`
- Plan: **Solo** ($108/year)
- Active monitors: 3

## Public Status Page

- Status page name: `Pipeline Punks Status`
- Public URL: `https://status.pipelinepunks.com`
- Custom domain DNS: `status.pipelinepunks.com CNAME stats.uptimerobot.com`
- TLS/HTTPS: Provisioned and live

## Monitor Configuration

1. Pipeline Punks Website
   - Type: HTTP(s)
   - URL: `https://www.pipelinepunks.com`
   - Check interval: 1 minute
   - Visibility: public status page

2. Penny API Health
   - Type: HTTP(s)
   - URL: `https://www.pipelinepunks.com/api/penny/health`
   - Check interval: 1 minute
   - Visibility: public status page

3. Railway Backend Health
   - Type: HTTP(s) GET
   - URL: `https://pipeline-punks-v2-production.up.railway.app/health`
   - Check interval: 1 minute
   - Visibility: public status page
   - Note: monitor recovered after previous HEAD/405 false alarm

## Control Mapping

- **CC7.3 / A1.1:** Availability monitoring is operational with public incident/status communications.
