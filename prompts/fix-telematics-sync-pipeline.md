# Fix Telematics Sync Pipeline — Handoff Prompt

**Date:** 2026-03-28
**Author:** Jacob Johnston / Claude (Cowork session)
**Repo:** Pipeline-Punks/website-pipeline-punks-pipelinex-v2
**Branch:** fix/telematics-site-url (or create new branch off main)

---

## Context

The Pipeline Punks Fleet-Compliance telematics dashboard at `https://www.pipelinepunks.com/fleet-compliance/telematics` shows 0 vehicles, 0 drivers, and 0 GPS events. The dashboard itself is functional (auth fixed in PR #8 and #9), but the data sync pipeline from Verizon Connect Reveal to Neon PostgreSQL is broken.

### Architecture

```
Verizon Connect Reveal API (Fleetmatics)
        │
        ▼
Railway backend (FastAPI / Python 3.11)
  POST /telematics/sync  →  runs reveal_sync_neon.py
        │
        ▼
Neon PostgreSQL (telematics_vehicles, telematics_drivers, telematics_gps_events, telematics_sync_log)
        │
        ▼
Next.js API route: GET /api/fleet-compliance/telematics-risk  (reads from Neon, computes risk scores)
        │
        ▼
Next.js server component: /fleet-compliance/telematics/page.tsx (renders dashboard)
```

### Trigger Chain

1. A cron job (or manual call) hits `GET https://www.pipelinepunks.com/api/fleet-compliance/telematics-sync` with `Authorization: Bearer <TELEMATICS_CRON_SECRET>`
2. The Next.js route forwards a `POST` to `https://pipeline-punks-v2-production.up.railway.app/telematics/sync` with `X-Penny-Api-Key` header
3. The Railway endpoint (`railway-backend/app/telematics_router.py`) runs `python /app/scripts/reveal_sync_neon.py` as a subprocess
4. The sync script authenticates with Verizon Reveal, pulls vehicles/drivers/GPS segments, and writes to Neon

---

## What Has Been Fixed (This Session)

1. **PR #8 — Clerk `needs_client_trust` error** (MERGED to main)
   - Updated `@clerk/nextjs` from `^6.38.2` to latest v6
   - Fixed sign-in error caused by Clerk Client Trust bot protection

2. **PR #9 — Telematics 401 cookie domain mismatch** (MERGED to main)
   - `src/app/fleet-compliance/telematics/page.tsx` was using `VERCEL_URL` for server-side API fetch
   - Clerk session cookies are scoped to `pipelinepunks.com`, not the Vercel deployment URL
   - Changed to use `SITE_URL` first, falling back to `VERCEL_URL`, then `localhost:3000`

3. **Railway `DATABASE_URL`** — was missing from Railway env vars, now added

---

## What Is Still Broken

### Primary Issue: `reveal_sync_neon.py` not found in Railway container

**Error:** `python: can't open file '/app/scripts/reveal_sync_neon.py': [Errno 2] No such file or directory`

**Root cause:** The Dockerfile at `railway-backend/Dockerfile` includes `COPY scripts ./scripts` (line 15), but there is NO `scripts/` directory inside `railway-backend/`. The `reveal_sync_neon.py` file lives at the repo root `scripts/reveal_sync_neon.py`. The Docker build context is `railway-backend/`, so the COPY silently produces an empty directory.

**Fix:** Copy (or symlink) `scripts/reveal_sync_neon.py` into `railway-backend/scripts/reveal_sync_neon.py` so the Docker build includes it.

```bash
mkdir -p railway-backend/scripts
cp scripts/reveal_sync_neon.py railway-backend/scripts/reveal_sync_neon.py
```

NOTE: This file was already copied via Desktop Commander during this session but the commit failed due to Windows CMD quote parsing. The staged file may or may not still be in the working tree. Verify with `git status`.

### Secondary Issue: Railway Environment Variables

The sync script (`reveal_sync_neon.py`) requires these env vars at runtime. Verify ALL are set in Railway's service environment:

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Added this session |
| `PENNY_API_KEY` | API auth for the FastAPI endpoints | Confirmed matching |
| `REVEAL_USERNAME` | Verizon Connect Reveal REST API username | VERIFY in Railway |
| `REVEAL_PASSWORD` | Verizon Connect Reveal REST API password | VERIFY in Railway |
| `REVEAL_APP_ID` | Verizon Fleetmatics atmosphere app ID | VERIFY in Railway |
| `APP_ENCRYPTION_KEY` | Used for `pgp_sym_encrypt/decrypt` in Neon | VERIFY in Railway |
| `REVEAL_ORG_ID` | Org identifier for Neon rows (default: `example-fleet-co`) | Optional, defaults to `example-fleet-co` |

Production values for all of the above exist in Vercel env vars. If not already in Railway, copy them over.

---

## Constraints

- **Do NOT upgrade `@clerk/nextjs` to v7.** Stay on v6.x to avoid Core 3 breaking changes. The codebase uses `auth()`, `currentUser()`, `clerkClient()`, `SignedIn/SignedOut`, session claims for RBAC, and org-based access control — all of which have breaking changes in v7.
- **Do NOT duplicate sensitive values in code.** All credentials must stay in environment variables (Vercel for Next.js, Railway for the Python backend).
- **Railway builds from `railway-backend/` as Docker context.** Any files the container needs must be inside that directory or the Dockerfile must be updated to use a broader context.
- **The sync script has hardcoded driver IDs for ELD logbook settings** (lines 100-106 of `reveal_sync_neon.py`). These are specific to the Example Fleet Co account. This is tech debt but not blocking.
- **SOC 2 compliance is active.** Follow secure practices: no PII in logs, no secrets in code, maintain audit trail.

---

## Deliverables

### 1. Railway Sync Script Available in Container
- Ensure `railway-backend/scripts/reveal_sync_neon.py` exists and is committed
- Verify the Dockerfile COPY includes it at `/app/scripts/reveal_sync_neon.py`
- Push to branch, merge to main, confirm Railway redeploys

### 2. Railway Environment Variables Complete
- All 6 required env vars set in Railway production service
- Trigger a manual sync to verify end-to-end:
  ```
  POST https://pipeline-punks-v2-production.up.railway.app/telematics/sync
  Header: X-Penny-Api-Key: <PENNY_API_KEY value>
  ```
- Expected response: `{"status":"success","vehicles":30,"drivers":24,"gps_events":>0,...}`

### 3. Telematics Dashboard Populated
- Visit `https://www.pipelinepunks.com/fleet-compliance/telematics`
- Should show ~30 vehicles, ~24 drivers, risk scores, GPS event counts
- At least 1 HIGH risk flag (David Layne — ELD driver with stale data)

### 4. Cron Schedule Configured
- Verify a cron job or Vercel cron is configured to hit `GET /api/fleet-compliance/telematics-sync` with the `Authorization: Bearer <TELEMATICS_CRON_SECRET>` header on a regular schedule (daily recommended)
- Check `vercel.json` for cron config or set up external cron (UptimeRobot, Railway cron, etc.)

---

## Key Files

| File | Purpose |
|------|---------|
| `railway-backend/Dockerfile` | Docker build for Railway; must COPY scripts/ |
| `railway-backend/app/telematics_router.py` | FastAPI endpoints: POST /telematics/sync, GET /telematics/health |
| `scripts/reveal_sync_neon.py` | The actual sync script (needs to be in railway-backend/scripts/) |
| `src/app/api/fleet-compliance/telematics-sync/route.ts` | Next.js cron endpoint that triggers Railway sync |
| `src/app/api/fleet-compliance/telematics-risk/route.ts` | Next.js API that reads Neon and computes risk scores |
| `src/app/fleet-compliance/telematics/page.tsx` | Server component rendering the dashboard |
| `src/lib/fleet-compliance-auth.ts` | Clerk auth + org plan gating for fleet-compliance routes |
| `src/lib/telematics-db.ts` | Neon query functions for telematics tables |

---

## Verification Steps

1. `git status` — confirm `railway-backend/scripts/reveal_sync_neon.py` is tracked
2. Push to main → Railway auto-redeploys
3. Check Railway deploy logs for successful build (no COPY errors)
4. Hit `/telematics/health?org_id=example-fleet-co` via Railway with API key — should return vehicle/driver counts > 0 after sync
5. Hit `/telematics/sync` via Railway with API key — should return `status: success`
6. Load `https://www.pipelinepunks.com/fleet-compliance/telematics` — should show populated tables
7. Check Sentry for any new errors on the `pipeline-punks-nextjs` project
8. Confirm the `needs_client_trust` Clerk error is resolved in Sentry (mark as resolved if still open)
