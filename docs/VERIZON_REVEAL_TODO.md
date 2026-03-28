# Verizon Reveal TODO

Date: 2026-03-28  
Owner: Jacob Johnston  
System: Fleet-Compliance Sentinel / Pipeline Penny

## Current Access and Working Components
- Verizon Connect Reveal credentials are available in production environment variables.
- Railway telematics API is reachable and authorized via `X-Penny-Api-Key`.
- Telematics health endpoint is returning data for `example-fleet-co` (vehicles/drivers/GPS counts).
- Fleet-Compliance telematics dashboard is rendering live risk output from synced tables.
- Next.js telematics risk API is operational and serving dashboard metrics.

## Current Gaps to Close
- Railway container must include `/app/scripts/reveal_sync_neon.py` at build time.
- Railway runtime environment must contain all required reveal sync variables:
  - `DATABASE_URL`
  - `PENNY_API_KEY`
  - `REVEAL_USERNAME`
  - `REVEAL_PASSWORD`
  - `REVEAL_APP_ID`
  - `APP_ENCRYPTION_KEY`
- Next.js cron endpoint auth must align with deployed `TELEMATICS_CRON_SECRET` value.
- Scheduled sync cadence must be verified in production (daily minimum).

## Verification Checklist
1. Confirm `railway-backend/scripts/reveal_sync_neon.py` exists and is committed.
2. Confirm Railway deploy includes script and endpoint can execute sync subprocess.
3. Run Railway direct sync:
   - `POST /telematics/sync` with `X-Penny-Api-Key`.
   - Expect `status: success` and non-zero telemetry writes.
4. Run Railway health:
   - `GET /telematics/health?org_id=example-fleet-co` with `X-Penny-Api-Key`.
   - Confirm non-zero counts and recent `last_sync`.
5. Run Next.js cron endpoint:
   - `GET /api/fleet-compliance/telematics-sync` with `Authorization: Bearer <TELEMATICS_CRON_SECRET>`.
   - Expect success payload, not 401/404.
6. Validate dashboard:
   - `/fleet-compliance/telematics` shows expected totals and recent sync timestamp.

## Immediate Next Build Targets
1. Geotab adapter scaffold in Railway backend (`integrations/geotab/`).
2. Telematics adapter normalization layer for multi-provider support.
3. Unified event schema for Reveal + future Geotab ingestion.
4. Predictive risk score enrichment from telematics event trends.
5. Morning proactive Penny briefing driven by risk engine output.

## Security and Compliance Guardrails
- Keep all credentials in environment variables only.
- No secrets or PII in logs.
- Maintain SOC 2 evidence trail for deploy, auth, and sync verification.
