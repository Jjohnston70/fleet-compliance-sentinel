# Secret Rotation Execution Log

Date Opened: 2026-03-25
Owner: Jacob Johnston

| Secret | Service | Rotated At | Rotated By | Verification | Evidence Link |
|---|---|---|---|---|---|
| CLERK_SECRET_KEY | Clerk | 2026-03-27 ~21:00 UTC | Jacob Johnston | New key generated in Clerk dashboard, updated in Vercel, redeployed | — |
| DATABASE_URL | Neon | 2026-03-27 ~21:15 UTC | Jacob Johnston | Password reset in Neon console (2x — final reset after credential exposure), Vercel integration auto-synced, redeployed | — |
| PENNY_API_KEY | Vercel/Railway | 2026-03-27 20:05 UTC | Coworker (Claude) | Health endpoints confirmed 200 (Railway /health + Vercel /api/penny/health) | — |
| FLEET_COMPLIANCE_CRON_SECRET | Vercel | 2026-03-27 20:08 UTC | Coworker (Claude) | Created new — All Environments. Vercel redeployed. | — |
| REVEAL_USERNAME | Railway | 2026-03-27 | Jacob Johnston | Set in Railway dashboard | telematics-credential-security.md |
| REVEAL_PASSWORD | Railway | 2026-03-27 | Jacob Johnston | Set in Railway dashboard | telematics-credential-security.md |
| REVEAL_APP_ID | Railway | 2026-03-27 | Jacob Johnston | Set in Railway dashboard | telematics-credential-security.md |
| SENTRY_AUTH_TOKEN | Vercel + local build plugin env | 2026-03-27 | Sentry Wizard | New token generated during SDK wizard run; updated in Vercel and `.env.sentry-build-plugin` | monitoring/sentry-production-evidence-2026-03-27.md |
| TELEMATICS_CRON_SECRET | Vercel | 2026-03-27 | Jacob Johnston | Generated via crypto.randomBytes(32) — set in Vercel dashboard (Production environment only) | telematics-credential-security.md |
