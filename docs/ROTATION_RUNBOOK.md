# Secret Rotation Runbook

Owner: Jacob Johnston
Last Updated: 2026-03-27
SOC 2 Control: CC6.1 (Logical and Physical Access Controls)

This runbook provides step-by-step procedures for rotating every secret in the Fleet-Compliance Sentinel stack. Rotation frequency is defined in `soc2-evidence/access-control/SECURITY_ROTATION.md`. Execution evidence goes in `soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md`.

---

## General Rotation Principles

1. Never delete the old credential before confirming the new one works in production.
2. Rotate in all environments (Production, Preview) unless noted otherwise.
3. Redeploy after every env var update -- env vars are baked into the deployment at build time.
4. Record every rotation in the execution log with timestamp, operator, and verification method.
5. If a credential is ever exposed (chat logs, commit history, logs), rotate immediately and treat the exposed value as compromised.

---

## CLERK_SECRET_KEY

Frequency: Every 90 days
Dashboard: https://dashboard.clerk.com/last-active?path=api-keys
Affects: Vercel (All Environments)

### Steps

1. Log into Clerk dashboard.
2. Go to API Keys (left sidebar or Settings > API Keys).
3. Under Secret Keys, click "+ Add new key" to generate a second key.
   - Both keys are valid simultaneously (zero-downtime rotation).
4. Copy the new key value.
5. Go to Vercel > Project Settings > Environment Variables.
6. Find `CLERK_SECRET_KEY`, click the three dots > Edit.
7. Paste the new key. Ensure it applies to All Environments.
8. Save. Trigger a redeploy: Deployments > latest > Redeploy.
9. Wait for deploy to finish. Verify the site loads and authentication works (sign in, sign out).
10. Return to Clerk dashboard. Delete the OLD key (the one created before today).
11. Record in `SECRET_ROTATION_EXECUTION_LOG.md`:
    - Rotated At: current UTC timestamp
    - Rotated By: your name
    - Verification: "Auth flow confirmed working post-deploy"

### Gotchas

- Clerk SDK v6.x does not have a "Roll Key" button -- use the "+ Add new key" approach.
- If upgrading to @clerk/nextjs v7+, the "Roll Key" feature becomes available.
- The publishable key (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) rarely needs rotation but follows the same pattern.

---

## DATABASE_URL (Neon Postgres)

Frequency: Every 90 days
Dashboard: https://console.neon.tech/app/projects
Affects: Vercel (All Environments) via Neon integration auto-sync

### Steps

1. Log into Neon console (console.neon.tech).
2. Select your project (neon-cerise-horizon).
3. Left sidebar > Branches > select `main`.
4. In the Roles & Databases section, find your role (neondb_owner).
5. Click the three dots / options next to the role > Reset Password.
6. Neon generates a new password and updates the connection string.
7. If the Vercel-Neon integration is active:
   - The integration should auto-sync `DATABASE_URL`, `PGPASSWORD`, `POSTGRES_PASSWORD`, and all related vars to Vercel.
   - Go to Vercel > Settings > Environment Variables and verify the password portion changed (click the eye icon on `DATABASE_URL`).
8. If auto-sync did not work:
   - Copy the new connection string from Neon dashboard (Connection Details).
   - Manually update `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PGPASSWORD`, `POSTGRES_PASSWORD`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL_NO_SSL`, `POSTGRES_PRISMA_URL` in Vercel.
9. Trigger a redeploy in Vercel.
10. Verify: site loads, database queries work (check any page that fetches data).
11. Record in `SECRET_ROTATION_EXECUTION_LOG.md`.

### Gotchas

- The Neon-Vercel integration manages ~16 env vars. If you manually edit one, the integration may overwrite it on next sync.
- The pooled URL (`DATABASE_URL`) uses pgbouncer. The unpooled URL is for migrations.
- Never share the password in chat logs or commit it. If exposed, reset immediately in Neon (the integration will re-sync).

---

## PENNY_API_KEY

Frequency: Every 90 days
Dashboard: N/A (self-generated shared secret)
Affects: Vercel (Production + Preview separately) AND Railway

### Steps

1. Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update in Vercel:
   - Settings > Environment Variables > PENNY_API_KEY
   - Update for Production environment.
   - Update for Preview environment (separate entry).
3. Update in Railway:
   - Open Railway dashboard > project > Variables
   - Find PENNY_API_KEY, paste new value.
4. Redeploy both Vercel and Railway.
5. Verify: `curl https://www.pipelinepunks.com/api/penny/health` returns 200.
6. Verify: `curl https://pipeline-punks-v2-production.up.railway.app/health` returns 200.
7. Record in execution log.

### Gotchas

- This key must match between Vercel and Railway -- they use it as a shared authentication secret.
- Vercel has separate entries for Production and Preview. Update both.

---

## FLEET_COMPLIANCE_CRON_SECRET

Frequency: Every 90 days
Dashboard: N/A (self-generated)
Affects: Vercel (All Environments)

### Steps

1. Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update in Vercel: Settings > Environment Variables > FLEET_COMPLIANCE_CRON_SECRET > Edit.
3. Redeploy.
4. Verify: cron job executes on next scheduled run (check Vercel logs or Sentry cron monitors).
5. Record in execution log.

### Gotchas

- This secret is used in the `Authorization` header of Vercel cron job requests.
- If you change the header format, update the cron route handler to match.

---

## SENTRY_AUTH_TOKEN

Frequency: Every 90 days
Dashboard: https://sentry.io/settings/account/api/auth-tokens/
Affects: Vercel (for source map uploads during build) and local .env.sentry-build-plugin

### Steps

1. Go to Sentry > Settings > Account > API > Auth Tokens.
2. Click Create New Token.
3. Scopes needed: `project:releases`, `org:read`, `project:read`, `project:write`.
4. Copy the new token.
5. Update in Vercel: Settings > Environment Variables > SENTRY_AUTH_TOKEN.
6. Update locally: `.env.sentry-build-plugin` (for local source map uploads).
7. Redeploy Vercel.
8. Verify: check build logs for "Source maps uploaded successfully" (or no source map errors).
9. Revoke the old token in Sentry dashboard.
10. Record in execution log.

---

## RESEND_API_KEY

Frequency: Every 90 days
Dashboard: https://resend.com/api-keys

### Steps

1. Log into Resend dashboard.
2. Go to API Keys.
3. Create a new API key with the same permissions as the existing one.
4. Update in Vercel: RESEND_API_KEY (All Environments).
5. Redeploy.
6. Verify: trigger a test email flow in the app.
7. Delete the old key in Resend dashboard.
8. Record in execution log.

---

## REVEAL_USERNAME / REVEAL_PASSWORD / REVEAL_APP_ID

Frequency: Every 90 days
Dashboard: Reveal (Fleetio/telematics provider)
Affects: Railway + Vercel

### Steps

1. Log into Reveal portal.
2. Generate new API credentials.
3. Update in Railway: REVEAL_USERNAME, REVEAL_PASSWORD, REVEAL_APP_ID.
4. Update in Vercel: REVEAL_USERNAME, REVEAL_PASSWORD (Production + Preview).
5. Redeploy both services.
6. Verify: telematics data flow continues (check latest vehicle records in dashboard).
7. Record in execution log.

---

## STRIPE_WEBHOOK_SECRET

Frequency: Every 90 days
Dashboard: https://dashboard.stripe.com/webhooks

### Steps

1. Log into Stripe dashboard.
2. Go to Developers > Webhooks.
3. Click on the webhook endpoint.
4. Click "Reveal" on the signing secret, or regenerate it by clicking "Roll secret".
5. Copy the new secret (starts with `whsec_`).
6. Update in Vercel: STRIPE_WEBHOOK_SECRET (All Environments).
7. Redeploy.
8. Verify: trigger a test webhook event from Stripe CLI or dashboard.
9. Record in execution log.

### Gotchas

- Rolling the secret in Stripe invalidates the old one immediately. Do this during low-traffic periods.
- The webhook handler uses this to verify Stripe signatures -- if mismatched, all webhooks fail silently.

---

## ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY

Frequency: Every 90 days
Dashboards:
- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys
- Google AI Studio: https://aistudio.google.com/app/apikey

### Steps (same pattern for each)

1. Log into the respective provider dashboard.
2. Create a new API key.
3. Update in Vercel (and Railway if applicable).
4. Redeploy.
5. Verify: trigger an AI feature in the app (e.g., Penny chat, compliance analysis).
6. Delete/revoke the old key in the provider dashboard.
7. Record in execution log.

---

## UPSTASH_REDIS_REST_TOKEN

Frequency: Every 90 days
Dashboard: https://console.upstash.com/redis

### Steps

1. Log into Upstash console.
2. Select the Redis database.
3. Under REST API, regenerate the token.
4. Update in Vercel: UPSTASH_REDIS_REST_TOKEN (All Environments).
5. Redeploy.
6. Verify: any caching or rate limiting features still work.
7. Record in execution log.

---

## APP_ENCRYPTION_KEY

Frequency: Every 90 days (or on suspected compromise)
Affects: Railway + Neon (pgcrypto)

### Steps

1. Generate new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. CRITICAL: Re-encrypt any existing data in Neon that uses the old key BEFORE rotating.
3. Run `ALTER DATABASE` in Neon SQL Editor to update the pgcrypto configuration.
4. Update in Railway: APP_ENCRYPTION_KEY.
5. Redeploy Railway.
6. Verify: encrypted data can be read/written correctly.
7. Record in execution log.

### Gotchas

- This is the most dangerous rotation. If you rotate without re-encrypting existing data, you lose access to that data.
- Always test with a non-production branch first if possible.

---

## Quick Reference: Rotation Checklist

For any rotation:

- [ ] Generate new credential in provider dashboard
- [ ] Update in Vercel (check which environments)
- [ ] Update in Railway (if applicable)
- [ ] Redeploy affected services
- [ ] Verify functionality (health checks, auth flows, data queries)
- [ ] Revoke/delete old credential
- [ ] Record in SECRET_ROTATION_EXECUTION_LOG.md
- [ ] Update Last Rotated date in SECURITY_ROTATION.md
