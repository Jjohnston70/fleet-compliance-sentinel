# Sentry Production Monitoring Evidence

Date: 2026-03-27 20:12 UTC
Updated: 2026-03-27 ~21:30 UTC
Reviewer: Coworker (Claude) + Jacob Johnston

## Project Details

- Organization: true-north-data-strategies-llc
- Project: pipeline-punks-nextjs
- Project ID: 4511085767819264
- URL: https://true-north-data-strategies-llc.sentry.io/

## SDK Integration (Completed 2026-03-27)

- Wizard version: @sentry/wizard@6.12.0
- SDK: @sentry/nextjs (updated to latest via wizard)
- Features enabled: Error tracking, Session Replay, Structured Logs
- Ad-blocker bypass: Enabled (tunnelRoute: /monitoring)
- Source map uploads: Enabled (widenClientFileUpload: true)
- Vercel Cron monitoring: Enabled (automaticVercelMonitors: true)
- Example test page created: /sentry-example-page

## Configuration Files

- sentry.client.config.ts: Environment-based DSN, custom scrubSentryEvent hook, replay at 10% sessions / 100% errors
- sentry.server.config.ts: Environment-based DSN, sendDefaultPii: false (SOC 2)
- sentry.edge.config.ts: Environment-based DSN, sendDefaultPii: false (SOC 2)
- src/instrumentation.ts: Sentry server/edge imports + existing env check logic preserved
- src/instrumentation-client.ts: Client-side Sentry init (wizard-generated)
- next.config.js: withSentryConfig wrapper with tunnel route, source maps, cron monitors
- .env.sentry-build-plugin: Local auth token (added to .gitignore)

## Vercel Environment Variables

- NEXT_PUBLIC_SENTRY_DSN: Set (All Environments)
- SENTRY_ORG: Set (All Environments)
- SENTRY_PROJECT: Set (All Environments)
- SENTRY_AUTH_TOKEN: Set (All Environments)

## Data Scrubbing Settings (PII Protection)

- Data Scrubber (server-side scrubbing): ENABLED
- Default Scrubbers (passwords, credit cards): ENABLED
- Prevent Storing IP Addresses: ENABLED (2026-03-27 by Jacob Johnston)
- sendDefaultPii in SDK configs: false (hardened from wizard default of true)
- Advanced Data Scrubbing Rules: None configured

## Post-Deploy Verification Update (2026-03-28 UTC)

- `https://www.pipelinepunks.com/sentry-example-page` returned HTTP 200.
- Trigger endpoint `https://www.pipelinepunks.com/api/sentry-example-api` returned HTTP 500 (test error path executed).
- Example verification files removed from repo:
  - `src/app/sentry-example-page/page.tsx`
  - `src/app/api/sentry-example-api/route.ts`
- Direct Sentry dashboard confirmation is still required for final auditor screenshot (not possible from this runtime due missing authenticated Sentry browser session).
