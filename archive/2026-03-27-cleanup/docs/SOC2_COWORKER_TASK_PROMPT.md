# SOC 2 Compliance Task Prompt — Coworker (Claude in Chrome + MCP)

**Project**: Fleet-Compliance Sentinel — True North Data Strategies LLC
**Owner**: Jacob Johnston | jacob@truenorthstrategyops.com | 555-555-5555
**Repo**: https://github.com/Pipeline-Punks/website-pipeline-punks-pipelinex-v2
**Production URL**: https://www.pipelinepunks.com
**SOC 2 Observation Window**: 2026-03-24 through 2026-06-22

You are completing the 5 remaining SOC 2 compliance tasks for Fleet-Compliance Sentinel.
These were due 2026-03-29. Complete everything you have access to and flag what requires Jacob.

You have access to: Vercel, Railway, Sentry, Slack, GitHub (via browser or MCP).
You do NOT have access to: Clerk dashboard, Neon dashboard (flag these for Jacob).

For every task completed: record the date, time, and verification screenshot or output
in the secret rotation log at:
soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md

---

## TASK 1 — Secret Rotation (HIGHEST PRIORITY — CC6.1)

### Secrets you CAN rotate (you have access):

**1a. PENNY_API_KEY — Vercel + Railway**

This secret is shared between Vercel (where Next.js calls Railway) and Railway (where FastAPI validates it).
Both must be updated to the same new value simultaneously.

Steps:
1. Generate a new secret:
   - Open browser console or any JS environment
   - Run: `crypto.getRandomValues(new Uint8Array(32)).reduce((a,b)=>a+b.toString(16).padStart(2,'0'),'')`
   - Copy the 64-char hex output
2. Go to Railway dashboard → project `pipeline-punks-v2` → service `pipeline-punks-v2` → Variables
   - Find `PENNY_API_KEY` → update to new value → Save
   - Wait for Railway to redeploy
3. Go to Vercel dashboard → project `pipeline-punks-pipelinex-v2` → Settings → Environment Variables
   - Find `PENNY_API_KEY` → update to same new value → Save
   - Redeploy Vercel: go to Deployments → Redeploy latest
4. Verify: visit https://pipeline-punks-v2-production.up.railway.app/health
   - Should return HTTP 200 with `{"status": "ok"}`
5. Verify: visit https://www.pipelinepunks.com/api/penny/health
   - Should return HTTP 200
6. Record in SECRET_ROTATION_EXECUTION_LOG.md:
   | PENNY_API_KEY | Vercel/Railway | [datetime] | [your name] | Health endpoints confirmed 200 | — |

**1b. FLEET_COMPLIANCE_CRON_SECRET — Vercel**

Steps:
1. Generate: same method as above
2. Go to Vercel → Settings → Environment Variables
   - Find `FLEET_COMPLIANCE_CRON_SECRET` → update → Save
   - Redeploy
3. Verify: the cron runs automatically at 08:00 UTC. Check Vercel Functions logs
   after next cron trigger for successful execution.
4. Record in SECRET_ROTATION_EXECUTION_LOG.md

**1c. TELEMATICS_CRON_SECRET — Vercel (NEW — not yet set)**

This secret does not exist yet. You must CREATE it.

Steps:
1. Generate a new 64-char hex secret (same method as above)
2. Go to Vercel → Settings → Environment Variables → Add New
   - Key: `TELEMATICS_CRON_SECRET`
   - Value: [generated secret]
   - Environment: Production only
   - Save
3. Redeploy Vercel
4. Record in SECRET_ROTATION_EXECUTION_LOG.md:
   | TELEMATICS_CRON_SECRET | Vercel | [datetime] | [your name] | Created new — Production env only | telematics-credential-security.md |

### Secrets Jacob must rotate (flag these — no dashboard access for you):

**1d. CLERK_SECRET_KEY — Clerk dashboard**
- Jacob: log into https://dashboard.clerk.com → API Keys → Roll Secret Key → update in Vercel env vars
- Record rotation date in SECRET_ROTATION_EXECUTION_LOG.md

**1e. DATABASE_URL — Neon dashboard**
- Jacob: log into https://console.neon.tech → project → Settings → Reset Password
- Update DATABASE_URL in Vercel env vars with new password
- Record rotation date in SECRET_ROTATION_EXECUTION_LOG.md

---

## TASK 2 — Status Page DNS (CC7.3, A1.1)

**Goal**: Make `status.pipelinepunks.com` live and publicly accessible.

UptimeRobot is already configured. The status page URL exists at UptimeRobot.
The gap is the DNS CNAME record pointing `status.pipelinepunks.com` to UptimeRobot.

Steps:
1. Log into UptimeRobot → Status Pages → find the Fleet-Compliance status page
2. Note the UptimeRobot status page domain (e.g., `stats.uptimerobot.com/xxxxxxx`)
3. Go to the DNS provider for `pipelinepunks.com`
   (Check Vercel → project → Settings → Domains to identify the DNS provider)
4. Add a CNAME record:
   - Name: `status`
   - Value: [UptimeRobot status page domain]
   - TTL: 3600
5. Wait for DNS propagation (5-60 minutes)
6. Verify: open https://status.pipelinepunks.com in a browser — should show UptimeRobot status page
7. Take a screenshot of the live status page
8. Save screenshot as: `soc2-evidence/incident-response/status-page-live-2026-03-29.png`
9. Update `soc2-evidence/incident-response/STATUS_PAGE_OPERATIONAL_CHECK_2026-03-25.md`:
   - Add a new entry with date, DNS record confirmed, and screenshot reference

---

## TASK 3 — Branch Protection Verification (CC8.1)

**Goal**: Confirm `main` branch is protected in GitHub and screenshot the settings.

Steps:
1. Go to https://github.com/Pipeline-Punks/website-pipeline-punks-pipelinex-v2
2. Settings → Branches → Branch protection rules
3. If a rule for `main` exists: verify these settings are enabled:
   - Require pull request before merging: ON
   - Require at least 1 approval: ON
   - Require status checks to pass before merging: ON
   - Restrict force pushes: ON
   - Restrict direct pushes to `main`: ON
4. If no rule exists: click "Add rule" → branch name pattern: `main` → enable all settings above → Save
5. Take a screenshot of the branch protection settings page
6. Save screenshot as: `soc2-evidence/change-management/branch-protection-verified-2026-03-29.png`
7. Update `soc2-evidence/change-management/BRANCH_PROTECTION_AND_CODEOWNERS_VERIFICATION.md`:
   - Change "Status: Pending manual verification" to "Status: Verified 2026-03-29"
   - Add screenshot reference

---

## TASK 4 — Sentry Verification (Monitoring evidence)

**Goal**: Confirm Sentry is receiving events in production and capture evidence.

Steps:
1. Log into Sentry → project `pipeline-punks-nextjs`
2. Confirm:
   - Events are being received from production (`pipelinepunks.com`)
   - PII scrubbing is active (check Data Scrubbing settings)
   - No critical unresolved issues in the last 7 days (or document any that exist)
3. Take a screenshot of the Sentry issues dashboard showing production events
4. Save as: `soc2-evidence/monitoring/sentry-production-evidence-2026-03-29.png`
5. Check: Issues → any HIGH priority issues? If yes, flag for Jacob

---

## TASK 5 — ZAP Scan (CC7.1) — FLAG FOR JACOB

You cannot run ZAP without a Docker-capable environment.
Create a task note for Jacob:

```
TASK 5 — ZAP Baseline Scan
Requires: Docker Desktop installed locally
Estimated time: 2 hours
Command to run (from repo root):
  docker pull ghcr.io/zaproxy/zaproxy:stable
  docker run --rm ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
    -t https://www.pipelinepunks.com \
    -r zap-report.html
Save report to: soc2-evidence/penetration-testing/zap-report-2026-03-29.html
Update: soc2-evidence/penetration-testing/ZAP_BASELINE_ATTEMPT_2026-03-25.md
```

---

## TASK 6 — Clerk Test Org Cleanup (CC6.1) — FLAG FOR JACOB

Jacob must do this in the Clerk dashboard.

```
TASK 6 — Clerk Test Org Cleanup
1. Log into https://dashboard.clerk.com
2. Go to Organizations
3. Find and delete any test organizations (e.g., orgs created during development)
4. Confirm no test users remain with production-level access
5. Record cleanup date in soc2-evidence/access-control/test-data-cleanup-2026-03-25.md
   - Add new entry with date 2026-03-29
```

---

## AFTER COMPLETING ALL ACCESSIBLE TASKS

Run this verification check and paste the output:

```
# Check compliance ops script
cd <REPO_ROOT>\Desktop\website-pipeline-punks-pipelinex-v2
node scripts/check-operational-gaps.mjs
```

Then commit all evidence updates:

```
git add soc2-evidence/
git commit -m "ops(soc2): secret rotation, status page DNS, branch protection verification

- Rotate PENNY_API_KEY in Vercel + Railway (Tasks 1a/1b)
- Create TELEMATICS_CRON_SECRET in Vercel (Task 1c)
- Status page DNS CNAME added, live at status.pipelinepunks.com (Task 2)
- Branch protection verified on main branch in GitHub (Task 3)
- Sentry production evidence captured (Task 4)
- SECRET_ROTATION_EXECUTION_LOG.md updated with rotation timestamps

Jacob to complete: CLERK_SECRET_KEY rotation (1d), DATABASE_URL rotation (1e),
ZAP scan (Task 5), Clerk test org cleanup (Task 6)."
git push origin main
```

---

## SECRET ROTATION LOG FORMAT

When updating `soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md`,
add rows to the existing table using this format:

| Secret Name | Service | Rotated At | Rotated By | Verification | Evidence Link |
|---|---|---|---|---|---|
| PENNY_API_KEY | Vercel/Railway | 2026-03-29 HH:MM UTC | Coworker | Health endpoints confirmed 200 | — |

The file is at:
`<REPO_ROOT>\Desktop\website-pipeline-punks-pipelinex-v2\soc2-evidence\access-control\SECRET_ROTATION_EXECUTION_LOG.md`
