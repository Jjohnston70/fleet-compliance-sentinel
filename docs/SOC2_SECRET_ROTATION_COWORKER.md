# SOC 2 Secret Rotation — Scheduled Task for Coworker

**When to run this**: Whenever Jacob schedules secret rotation.
Per the rotation policy, secrets should be rotated:
- On schedule: every 90 days
- On demand: when a team member leaves, when a secret may have been exposed,
  or when Jacob asks you to run this task
- Next scheduled rotation: 2026-06-27 (90 days from 2026-03-27)

**You have MCP access to**: Vercel, Railway, Sentry, GitHub
**Jacob must handle**: Clerk, Neon (no MCP access available)

---

## STEP 1 — Generate all new secrets first

Open browser console (F12 → Console) and run this once per secret needed:

```javascript
crypto.getRandomValues(new Uint8Array(32))
  .reduce((a,b) => a + b.toString(16).padStart(2,'0'), '')
```

Generate and save these values locally BEFORE touching any dashboards.
Label each one clearly. You will need them across multiple dashboards.

Secrets to generate:
- NEW_PENNY_API_KEY
- NEW_FLEET_COMPLIANCE_CRON_SECRET
- NEW_TELEMATICS_CRON_SECRET

---

## STEP 2 — Rotate PENNY_API_KEY (Vercel + Railway — must match)

**Railway first:**
1. Go to Railway dashboard → project `pipeline-punks-v2`
2. Select service `pipeline-punks-v2` → Variables tab
3. Find `PENNY_API_KEY` → Edit → paste NEW_PENNY_API_KEY → Save
4. Wait for Railway redeploy to complete
5. Verify: GET https://pipeline-punks-v2-production.up.railway.app/health → must return 200

**Vercel second (same value):**
1. Go to Vercel dashboard → project `pipeline-punks-pipelinex-v2`
2. Settings → Environment Variables
3. Find `PENNY_API_KEY` → Edit → paste same NEW_PENNY_API_KEY → Save
4. Go to Deployments → Redeploy latest production deployment
5. Verify: GET https://www.pipelinepunks.com/api/penny/health → must return 200

---

## STEP 3 — Rotate FLEET_COMPLIANCE_CRON_SECRET (Vercel only)

1. Go to Vercel → project → Settings → Environment Variables
2. Find `FLEET_COMPLIANCE_CRON_SECRET` → Edit → paste NEW_FLEET_COMPLIANCE_CRON_SECRET → Save
3. Redeploy Vercel
4. Verify: check Vercel Functions logs the next morning (cron runs at 08:00 UTC)
   - Look for a successful `fleet-compliance-alert-sweep` log entry

---

## STEP 4 — Rotate TELEMATICS_CRON_SECRET (Vercel only)

1. Go to Vercel → project → Settings → Environment Variables
2. Find `TELEMATICS_CRON_SECRET` → Edit → paste NEW_TELEMATICS_CRON_SECRET → Save
3. Redeploy Vercel
4. Verify: check Vercel Functions logs the next morning (cron runs at 02:00 UTC)
   - Look for a successful `telematics-sync` log entry

---

## STEP 5 — Update the rotation log

Open the file:
`soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md`

Add rows to the table for each secret rotated, using today's date and UTC time.
Example format:
| PENNY_API_KEY | Vercel/Railway | 2026-06-27 14:23 UTC | Coworker | Health endpoints 200 confirmed | — |

Then commit:
```
git add soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md
git commit -m "ops(soc2): scheduled secret rotation 2026-06-27

Rotated: PENNY_API_KEY, FLEET_COMPLIANCE_CRON_SECRET, TELEMATICS_CRON_SECRET
Verified: Railway health 200, Vercel health 200, cron logs checked
Jacob to rotate: CLERK_SECRET_KEY, DATABASE_URL"
git push origin main
```

---

## STEP 6 — Flag for Jacob (cannot be done without Clerk/Neon access)

Send Jacob this message:

```
Secret rotation partial complete — [date].

Done (Coworker):
✅ PENNY_API_KEY — Vercel + Railway — verified 200
✅ FLEET_COMPLIANCE_CRON_SECRET — Vercel
✅ TELEMATICS_CRON_SECRET — Vercel

Needs Jacob (dashboard access required):
❌ CLERK_SECRET_KEY — Clerk dashboard → API Keys → Roll Secret Key
   → Update CLERK_SECRET_KEY in Vercel env vars → Redeploy
❌ DATABASE_URL — Neon dashboard → project → Settings → Reset Password
   → Update DATABASE_URL in Vercel env vars → Redeploy
   → Test: node scripts/check-env.ts should pass

Both are REQUIRED for SOC 2 CC6.1 compliance.
Record rotation dates in soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md
```

---

## Rotation Schedule Reference

| Secret | Service | Rotation Frequency | Who |
|---|---|---|---|
| PENNY_API_KEY | Vercel + Railway | Every 90 days | Coworker |
| FLEET_COMPLIANCE_CRON_SECRET | Vercel | Every 90 days | Coworker |
| TELEMATICS_CRON_SECRET | Vercel | Every 90 days | Coworker |
| CLERK_SECRET_KEY | Clerk + Vercel | Every 90 days | Jacob |
| DATABASE_URL | Neon + Vercel | Every 90 days | Jacob |
| APP_ENCRYPTION_KEY | Railway + Neon | Every 90 days | Jacob |
| REVEAL_USERNAME / REVEAL_PASSWORD | Railway | On client change or annual | Jacob |

Next rotation due: **2026-06-27**
