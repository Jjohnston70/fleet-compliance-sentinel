# Security Rotation Schedule

Date: 2026-03-25  
Source: `soc2-evidence/system-description/ENV_EXAMPLE.md`

| Secret | Service | Rotation Dashboard URL | Frequency | Last Rotated |
|---|---|---|---|---|
| `CLERK_SECRET_KEY` | Clerk | https://dashboard.clerk.com/last-active?path=api-keys | Every 90 days | Not recorded |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | https://dashboard.clerk.com/last-active?path=api-keys | Every 180 days | Not recorded |
| `DATABASE_URL` | Neon Postgres | https://console.neon.tech/app/projects | Every 90 days | Not recorded |
| `PENNY_API_KEY` | Vercel + Railway shared secret | https://vercel.com/<team>/<project>/settings/environment-variables and https://railway.com/project/<project>/variables | Every 90 days | Not recorded |
| `RESEND_API_KEY` | Resend | https://resend.com/api-keys | Every 90 days | Not recorded |
| `FLEET_COMPLIANCE_CRON_SECRET` | Vercel Cron auth | https://vercel.com/<team>/<project>/settings/environment-variables | Every 90 days | Not recorded |
| `FMCSA_API_KEY` | FMCSA Query Central | https://ai.fmcsa.dot.gov/SMS/Tools/Downloads.aspx | Every 180 days | Not recorded |
| `SENTRY_DSN` | Sentry | https://sentry.io/settings/projects/<project>/client-keys/ | Every 180 days | Not recorded |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | https://sentry.io/settings/projects/<project>/client-keys/ | Every 180 days | Not recorded |
| `SENTRY_AUTH_TOKEN` | Sentry | https://sentry.io/settings/account/api/auth-tokens/ | Every 90 days | Not recorded |
| `DATADOG_API_KEY` | Datadog | https://app.datadoghq.com/organization-settings/api-keys | Every 90 days | Not recorded |
| `GOOGLE_SHEET_WEBHOOK_URL` | Google Apps Script | https://script.google.com/home | Every 180 days | Not recorded |
| `STRIPE_WEBHOOK_SECRET` | Stripe | https://dashboard.stripe.com/webhooks | Every 90 days | Not recorded |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis | https://console.upstash.com/redis | Every 90 days | Not recorded |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis | https://console.upstash.com/redis | On endpoint change only | Not recorded |
| `ANTHROPIC_API_KEY` | Anthropic | https://console.anthropic.com/settings/keys | Every 90 days | Not recorded |
| `OPENAI_API_KEY` | OpenAI | https://platform.openai.com/api-keys | Every 90 days | Not recorded |
| `GEMINI_API_KEY` | Google AI Studio | https://aistudio.google.com/app/apikey | Every 90 days | Not recorded |
| `PENNY_ALLOWED_EMAILS` | Vercel allowlist config | https://vercel.com/<team>/<project>/settings/environment-variables | Every 180 days (review) | Not recorded |
| `ADMIN_EMAIL` | Vercel allowlist config | https://vercel.com/<team>/<project>/settings/environment-variables | Every 180 days (review) | Not recorded |

## Rotation Procedure (Standard)

1. Generate new credential in provider dashboard.
2. Update secret in target runtime(s) (Vercel/Railway/local secure store).
3. Redeploy service(s) using the rotated secret.
4. Validate health + smoke tests.
5. Revoke prior credential.
6. Record `Last Rotated` date and operator in SOC2 evidence log.

## Execution Evidence

- Rotation execution log: `soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md`
- First rotation batch due: 2026-03-29
