# Onboarding Release Evidence Pack

Last Updated: 2026-04-06  
Owners: Fleet-Compliance platform team  
Purpose: Auditable release artifacts for release-gate sign-off on Phase 6 onboarding hardening.

## Section 1: Release Sign-Off Checklist

Gate-level checklist for go/no-go decision authority. All items must be green or marked NA with documented justification before release authorization.

| Checklist Item | Pass | Fail | NA | Notes |
|---|---|---|---|---|
| All Phase 6 tests green (phase6-release-gate.test.ts) | | | | Acceptance matrix scenarios 1-5 must execute without failure |
| API contract tests green (contract-drift suite) | | | | Onboarding route signatures and mutation inputs validated |
| Alert binding tests green (alert-binding suite) | | | | Outbox failure signals and retry volume metrics verified |
| Build compiles successfully | | | | `npm run build` with no errors; `next build` with no warnings |
| No P1/P2 Sentry errors in staging | | | | Exclude known suppressed errors; focus on unhandled exceptions |
| Onboarding Phase 1 tests green (phase1 suite) | | | | Existing employee/run APIs remain compatible |
| Database migrations applied and reversible | | | | All migrations in migrations/ executed forward and backward without data loss |
| Feature flag verified in staging | | | | `onboarding` module enabled in test org; intake token path accessible |
| Rollback plan documented and validated | | | | See Section 5 for procedure; simulated rollback in staging confirmed |
| Operator runbook reviewed by duty officer | | | | ONBOARDING_OPERATOR_RUNBOOK.md acknowledged; alert triage confirmed |
| Intake token signing validated | | | | Token issuance, submission, one-time consumption path verified end-to-end |
| Idempotency keys stable | | | | Run dedupe keys prevent duplicate onboarding on retry |
| Tenant isolation confirmed | | | | Org A data not visible in Org B queries; cross-org access rejected |

## Section 2: Test Log Template

Record test suite execution results at each stage (pre-release, staging, release candidate). Use this template to capture run metadata and outcomes.

| Test Suite Name | Pass Count | Fail Count | Skip Count | Date | Runner | Environment | Notes |
|---|---|---|---|---|---|---|---|
| phase6-release-gate | | | | | | | |
| contract-drift | | | | | | | |
| alert-binding | | | | | | | |
| onboarding-phase1 | | | | | | | |

**Test suite definitions:**

- `phase6-release-gate`: Acceptance matrix scenarios (non-driver, driver+hazmat, partial failure recovery, intake flow, two-org isolation). Source: `src/lib/onboarding/phase6-release-gate.test.ts`
- `contract-drift`: API route contract assertions (POST /onboarding/employees, PATCH /onboarding/employees/{id}, POST /onboarding/intake-tokens, POST /onboarding/outbox/process). Validates request/response schemas.
- `alert-binding`: Observability signal validation (onboarding.metrics, onboarding.alerts, failure-rate detection, retry-volume detection). Simulates outbox failures and inspects alert payloads.
- `onboarding-phase1`: Existing onboarding Phase 1 suite validating backward compatibility (employee create, run list/detail, invite flow). Source: `src/lib/onboarding/*.test.ts` (all except phase6).

**How to execute:**

```bash
npm run test:onboarding-phase6
npm run test:onboarding-drift
npm run test:onboarding-alerts
npm run test:onboarding-phase1
```

## Section 3: Build Verification Record

Capture build artifacts and deployment checkpoint metadata. One record per release candidate.

| Commit SHA | Build Timestamp | Deployment Target | Build Status | Deployment URL | Verified By | Notes |
|---|---|---|---|---|---|---|
| | | staging | | | | |
| | | production | | | | |

**Field definitions:**

- **Commit SHA**: Full commit hash of the code being released (e.g., `a3f8e9c...`). Verify with `git rev-parse HEAD`.
- **Build Timestamp**: UTC timestamp when build completed (e.g., `2026-04-06T15:30:45Z`).
- **Deployment Target**: `staging` or `production`.
- **Build Status**: `pass` or `fail`. Build must pass all preflight checks (skill-pack validation, CFR index generation, TypeScript compile, next build).
- **Deployment URL**: Vercel deployment URL (e.g., `https://fleet-compliance-release.vercel.app`).
- **Verified By**: Operator/engineer name who confirmed the deployment is live and passing smoke tests.
- **Notes**: Any blocked issues, workarounds, or follow-up actions.

## Section 4: Residual Risk Register

Identify and track residual risks post-release. Update status as mitigation evidence accumulates.

| Risk ID | Description | Likelihood | Impact | Mitigation Strategy | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|
| R-01 | Clerk auth downtime blocks onboarding intake flow. Customer cannot submit intake tokens. | M | H | Graceful degradation: maintain fallback intake page with offline token validation; async invite delivery via outbox; document auth dependency in runbook. | Platform | Active | Monitor Clerk status page; escalate on 15m+ outage. |
| R-02 | Neon DB connection pool exhaustion during bulk onboarding (100+ employees). Queries time out. | M | H | Pool connection limits configured in Neon UI; bulkhead isolation for onboarding queries; scale outbox processing to 2 workers during known bulk runs. | Database | Active | Run load test with 200 concurrent intake submissions in staging. |
| R-03 | Email delivery failures: intake tokens, kickoff, training reminders not sent. Employees cannot start onboarding. | H | H | Resend provider health monitoring; outbox retry logic with exponential backoff (max 5 attempts); fallback notification queue in Slack for duty officer. | Platform | Active | Validate Resend failover and outbox recovery in staging. |
| R-04 | Adapter step failure (e.g., training assignment fails) leaves partial onboarding state. Employee partially on-boarded. | M | M | All adapter calls wrapped in transaction-like step idempotency; partial failure recorded in run status; manual retry capability via admin API. | Platform | Active | Test partial failures in each adapter; verify retry preserves prior outputs. |
| R-05 | Race condition: concurrent onboarding runs for same employee cause duplicate training assignments. | L | M | Idempotency keys enforced at run creation; duplicate detector checks for open runs before accepting new intake; step status checks prevent re-execution of completed steps. | Platform | Active | Reproduce with concurrent test harness; verify at-most-once semantics. |
| R-06 | Module gate miss: onboarding endpoints accessible to org without `onboarding` module enabled. Data leakage. | L | H | All endpoints wrapped with `requireOnboardingAdminContext` or module-level guards; adapter-level module checks (training, tasks); API tests verify rejection on missing module. | Platform | Active | Audit all /onboarding/* routes for guard presence. |
| R-07 | Token expiry window too long (72h default) increases exposure if token leaked. | L | M | Default expiry 72h; admin override to set custom expiry per-token; token rotation on each intake submission; audit log all token issuance and consumption. | Platform | Active | Monitor intake token issuance; alert on unusual patterns. |

## Section 5: Rollback Procedure

Systematic rollback steps if onboarding release is determined unsafe post-deployment. Execute in order.

**Prerequisites:**

- Vercel deployment URL for the prior known-good release.
- Database backup taken before release.
- Operator with Vercel access and database admin credentials.

**Step-by-step rollback:**

1. **Immediate: Disable onboarding at feature-flag level** (fast, non-destructive).
   ```bash
   # Via Fleet-Compliance admin console or API:
   PATCH /api/fleet-compliance/modules/org/{orgId}
   { "onboarding": false }
   ```
   This prevents new intake submissions and run creation without touching data.

2. **Verify rollback state**: Confirm intake token endpoints return 403 (module not enabled).
   ```bash
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://api.fleet-compliance.app/api/fleet-compliance/onboarding/intake-tokens
   # Expected: 403 Forbidden "onboarding module not enabled"
   ```

3. **Revert Vercel deployment** (if feature flag roll back is insufficient or release has critical bugs).
   ```bash
   # Via Vercel CLI or UI:
   vercel rollback --prod
   # Or revert to prior commit:
   git revert HEAD
   git push
   ```
   Vercel will automatically rebuild and deploy the prior version.

4. **Verify post-rollback**: Confirm APIs are serving from the prior build.
   ```bash
   curl https://fleet-compliance.vercel.app/api/health
   # Inspect response header X-Vercel-Deployed-Sha; should match prior commit.
   ```

5. **Database migration revert** (only if schema migrations are determined unsafe; typically not required).
   ```bash
   # If forward migration is irreversible or caused data loss:
   # Restore from backup taken in Step 1.
   # Coordinate with Database team; this is a disruptive operation.
   ```

6. **Post-rollback audit**:
   - Inspect Sentry error counts for the rolled-back environment.
   - Verify outbox queue is empty or processing stalled events.
   - Re-enable onboarding module only after root-cause analysis is complete and fix is staged.

**Communication checklist after rollback:**

- Notify all platform team members of rollback decision and reason.
- Update status page with rollback timestamp and ETA for re-release.
- Schedule incident review within 24h to identify root cause.

## Section 6: Go/No-Go Decision Matrix

Gate approval matrix. Use this to evaluate readiness against objective criteria at release time.

| Criterion | Required for Go | Current Status | Blocker? | Owner Sign-Off |
|---|---|---|---|---|
| All P6 tests pass (phase6-release-gate.test.ts 5/5 scenarios green) | YES | | | |
| No P1/P2 Sentry errors in staging (last 24h) | YES | | | |
| Database migrations reversible (forward + backward tested) | YES | | | |
| Rollback procedure tested end-to-end in staging | YES | | | |
| Operator runbook reviewed and duty officer trained | YES | | | |
| Intake token path green in staging (issue + submit + one-time) | YES | | | |
| Two-org isolation confirmed in acceptance tests | YES | | | |
| API contract tests passing | YES | | | |
| Alert binding tests passing | YES | | | |
| Feature flag verified enabled in staging | YES | | | |
| Build compiles with no warnings | YES | | | |
| Adapter failure scenarios tested (partial failure + retry) | YES | | | |
| Outbox processing validated (no stuck events) | YES | | | |

**Release decision rule:**

GO if: ALL required criteria are green AND all blockers are resolved or formally accepted by platform lead.

NO-GO if: ANY required criterion is red OR any unresolved blocker exists.

**Sign-off authority:**

Release decision authority: Platform Lead (Engineering)
Rollback authority: On-call engineer + Platform Lead

---

## Appendix: Reference Links

- Phase 6 Plan: `docs/integration/ONBOARDING_PHASE6_RELEASE_GATE_PLAN.md`
- Implementation Spec: `docs/integration/ONBOARDING_ORCHESTRATION_IMPLEMENTATION_SPEC.md`
- Operator Runbook: `docs/integration/ONBOARDING_OPERATOR_RUNBOOK.md`
- Test Suites: `src/lib/onboarding/phase6-release-gate.test.ts`
- Verify Script: `scripts/onboarding-release-verify.sh`
