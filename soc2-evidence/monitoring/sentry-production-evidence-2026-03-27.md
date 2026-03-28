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
- Prevent Storing IP Addresses: DISABLED (flag for Jacob to enable)
- sendDefaultPii in SDK configs: false (hardened from wizard default of true)
- Advanced Data Scrubbing Rules: None configured

## Event Status

- SDK wizard completed 2026-03-27.
- Vercel deployment triggered with Sentry env vars configured.
- Production event verification pending (visit /sentry-example-page on production URL to trigger test error).

## Remaining Action Items

1. Enable "Prevent Storing IP Addresses" in Sentry project settings (Settings > Security & Privacy).
2. Verify test error appears in Sentry dashboard after production deploy.
3. Delete /sentry-example-page and /api/sentry-example-api after verification.
4. Consider reducing tracesSampleRate from 1.0 to 0.2-0.5 for production cost optimization.
