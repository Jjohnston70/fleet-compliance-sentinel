# SOC 2 Compliance -- Remaining Tasks Continuation Prompt

Copy this entire prompt into a new conversation to continue the SOC 2 compliance work.

---

## Context

Fleet-Compliance Sentinel SOC 2 observation window: 2026-03-24 through 2026-06-22.
Original deadline: 2026-03-29.
Previous session completed Tasks 1-4 (secret rotation, DNS/status page CNAME, branch protection, Sentry SDK integration).

This prompt covers the 3 remaining tasks plus post-deployment verification.

## Repository

The working repo is `website-pipeline-punks-pipelinex-v2` (Next.js 14, TypeScript, Tailwind, Clerk auth, Neon Postgres, deployed on Vercel + Railway).

---

## Task 5 -- OWASP ZAP Baseline Scan (CC7.1)

**Control:** CC7.1 (System Operations -- vulnerability detection)
**Status:** Not started. Docker was unavailable in previous session.
**Evidence file:** `soc2-evidence/penetration-testing/ZAP_BASELINE_ATTEMPT_2026-03-25.md`

### Steps

1. Ensure Docker Desktop is running locally.
2. Pull the ZAP image:
   ```
   docker pull ghcr.io/zaproxy/zaproxy:stable
   ```
3. Run the baseline scan against production:
   ```
   docker run --rm -v "${PWD}:/zap/wrk" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
     -t https://www.pipelinepunks.com \
     -J /zap/wrk/soc2-evidence/penetration-testing/zap-baseline-2026-03-29.json \
     -r /zap/wrk/soc2-evidence/penetration-testing/zap-baseline-2026-03-29.html \
     -w /zap/wrk/soc2-evidence/penetration-testing/zap-baseline-2026-03-29.md \
     -m 3
   ```
4. Review the output. Common findings to expect:
   - Missing CSP headers (may already be partially addressed in next.config.js)
   - Cookie flags (Secure, HttpOnly, SameSite)
   - X-Frame-Options (already set to SAMEORIGIN in next.config.js)
5. Create a remediation plan for any WARN or FAIL findings.
6. Update `soc2-evidence/penetration-testing/ZAP_BASELINE_ATTEMPT_2026-03-25.md` with:
   - Scan completion timestamp
   - Summary of findings (PASS/WARN/FAIL counts)
   - Link to the generated report files
   - Remediation plan for any WARN/FAIL items

### Evidence Files to Generate
- `soc2-evidence/penetration-testing/zap-baseline-2026-03-29.json`
- `soc2-evidence/penetration-testing/zap-baseline-2026-03-29.html`
- `soc2-evidence/penetration-testing/zap-baseline-2026-03-29.md`

---

## Task 6 -- Clerk Test Organization Cleanup (CC6.1)

**Control:** CC6.1 (Access Control -- no test data in production)
**Status:** Database-side cleanup completed 2026-03-25 (72 legacy records + 1 test org deleted from Neon). Clerk-side cleanup still pending.
**Evidence file:** `soc2-evidence/access-control/test-data-cleanup-2026-03-25.md`

### Steps

1. Log into https://dashboard.clerk.com
2. Navigate to Organizations (left sidebar).
3. Review all organizations listed:
   - Delete any test organizations (names like "Organization org_*", "Test Org", or any org not associated with a real customer).
   - Screenshot the organizations list BEFORE and AFTER cleanup.
4. Navigate to Users.
5. Review user list:
   - Confirm no test users have production-level access.
   - Delete any test/dummy user accounts.
6. Update `soc2-evidence/access-control/test-data-cleanup-2026-03-25.md`:
   - Fill in `Clerk Cleanup Date` (currently "Pending")
   - Fill in `Clerk Cleanup By` (currently "Pending")
   - Add summary of what was found and deleted

### Evidence to Record
- Number of test organizations found and deleted
- Number of test users found and deleted
- Confirmation that no test accounts remain with production access
- Screenshots (optional but recommended for SOC 2 auditor)

---

## Task 2 Follow-up -- Status Page DNS Verification (CC7.3, A1.1)

**Control:** CC7.3 (System Operations), A1.1 (Availability)
**Status:** CNAME record added 2026-03-27 (status -> stats.uptimerobot.com). DNS propagation pending verification.
**Evidence file:** `soc2-evidence/incident-response/STATUS_PAGE_OPERATIONAL_CHECK_2026-03-25.md`

### Steps

1. Check if DNS has propagated:
   ```
   nslookup status.pipelinepunks.com
   ```
   or
   ```
   dig status.pipelinepunks.com CNAME
   ```
   Expected result: CNAME pointing to `stats.uptimerobot.com`

2. Try loading https://status.pipelinepunks.com in a browser.
   - If it loads the UptimeRobot status page: success.
   - If it shows an error or doesn't resolve: check Squarespace DNS settings and UptimeRobot custom domain config.

3. Log into UptimeRobot (https://uptimerobot.com/dashboard):
   - Go to the status page settings.
   - Confirm the custom domain `status.pipelinepunks.com` is configured.
   - If not configured, add it (Status Pages > your page > Settings > Custom Domain).

4. Update `soc2-evidence/incident-response/STATUS_PAGE_OPERATIONAL_CHECK_2026-03-25.md` with:
   - DNS verification result
   - Screenshot of status page loading
   - UptimeRobot custom domain configuration status

---

## Post-Deployment Verification

After completing the above, also verify these items from the previous session:

1. **Sentry test error:** Visit https://www.pipelinepunks.com/sentry-example-page and click the "Throw error" button. Verify the error appears in Sentry at https://true-north-data-strategies-llc.sentry.io/issues/. Then delete the example page files:
   - `src/app/sentry-example-page/page.tsx`
   - `src/app/api/sentry-example-api/route.ts`

2. **Sentry IP storage:** In Sentry dashboard, go to Settings > Security & Privacy > enable "Prevent Storing IP Addresses".

3. **Neon password verification:** Confirm the site loads and database queries work after the Neon password rotation + Vercel redeploy.

---

## Git Commit

After all tasks are complete, commit all evidence files:

```
git add soc2-evidence/ docs/ROTATION_RUNBOOK.md
git commit -m "SOC 2: Complete remaining compliance tasks (ZAP scan, Clerk cleanup, DNS verification)

- Task 5: ZAP baseline scan results and remediation plan
- Task 6: Clerk test organization cleanup evidence
- Task 2 follow-up: Status page DNS verification
- Post-deploy: Sentry event verification

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Note: Branch protection requires a PR for merging to main. Create a feature branch first:
```
git checkout -b soc2/remaining-tasks-2026-03-29
git push -u origin soc2/remaining-tasks-2026-03-29
```
Then open a PR for review.
