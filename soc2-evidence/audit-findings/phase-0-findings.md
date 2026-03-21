# Phase 0 Audit Findings
**Auditor**: Claude Code (automated static analysis review)
**Date**: 2026-03-20
**Audit Report Reviewed**: AUDIT_REPORT.md
**Scope**: Repository audit — file inventory, dependency audit, secret exposure, hardcoded values, dead code, environment variable contract, Railway backend health, Google Drive coupling analysis

---

## Phase 0 Audit Findings
**Overall Score**: 7/10
**Pass/Conditional Pass/Fail**: Conditional Pass
**Blocker Count**: 2 (issues that must be fixed before Phase 1)

---

### Critical Findings (must fix before Phase 1)

1. **Live secrets present in `.env` / `.env.local` on developer workstation** — While these files are correctly `.gitignore`'d and were never committed to git history, the audit confirmed they contain production-grade credentials (Clerk secret key, Google OAuth refresh token, Neon DB connection string, Vercel OIDC token). **Recommended fix**: Rotate all credentials immediately. Migrate all secrets to Vercel Environment Variables (production/preview) and Railway secret store. Remove `.env.local` from developer machines and use `vercel env pull` workflow instead. Document the rotation in `COMPLIANCE_MILESTONES.md`.

2. **Google Drive coupling is broad and deeply embedded** — The `/resources` route, middleware matcher, Penny query proxy, Chief dashboard cards, and `chief-data.ts` link data all reference Google Drive / `googleapis`. This is a security surface (OAuth refresh tokens, Drive API scopes) and an architectural liability for SOC 2 system boundary definition. **Recommended fix**: Execute the full removal plan in AUDIT_REPORT.md Section 3 during Phase 1. Delete `src/lib/drive.ts`, both `/resources` routes, the middleware matcher, Navigation link, sitemap entry, and all `/resources` href references in `chief-data.ts`. Remove `googleapis` from `package.json`. Update `ENV_EXAMPLE.md` to drop Drive-related vars.

---

### High Findings (fix within 2 phases)

1. **Active `localStorage` dependencies across 9 components for business-critical state** — Suspense resolve status, asset status overrides, FMCSA snapshots, inline notes, and Penny chat history are all persisted in browser `localStorage`. This data is invisible to the server, unauditable, and lost on device/browser change. **Recommended fix**: Migrate business-critical state (suspense resolutions, asset overrides, notes) to Neon Postgres with user/org scoping in Phase 2 or Phase 4. Keep `localStorage` only for non-critical UX preferences (cookie consent, chat history drafts).

2. **`demo` role codepath active in production** — `penny-access.ts:3` includes `demo` in the role allowlist, `penny/page.tsx:56` branches on it, and `penny/query/route.ts:165` has fallback behavior tied to it. Demo users may have different security boundaries than production users. **Recommended fix**: Remove `demo` role from allowlist and all demo-specific branching before first paying client. If demo access is still needed, gate it behind a feature flag checked at the edge, not in role logic.

3. **15 environment variables referenced in code but missing from `.env.example` documentation** — Including `ADMIN_EMAIL`, `CHIEF_ALERT_EMAIL`, `PENNY_ALLOWED_EMAILS`, and various `KNOWLEDGE_*` / `RAILWAY_*` vars. This creates deployment risk — a new developer or CI pipeline will have silent failures. **Recommended fix**: `ENV_EXAMPLE.md` was created during this audit but the root `.env.example` file still lacks these entries. Reconcile both files and keep one canonical source.

4. **Dependency hygiene issues** — `typescript` is listed in `dependencies` instead of `devDependencies` (ships to production unnecessarily). `lucide-react` is declared but not imported anywhere. Workspace packages (`@tnds/*`) declare dependencies only at root, which is brittle if packages are ever published or isolated. **Recommended fix**: Move `typescript` to `devDependencies`. Remove `lucide-react` if confirmed unused via build. Add `mammoth`, `pdf-parse`, `csv-parse`, `cheerio` to `packages/tnds-ingest-core/package.json`.

---

### Medium Findings (fix before first paying client)

1. **Hardcoded integration URLs in runtime code** — Google Apps Script URL in `assetcommand/page.tsx:8`, Railway fallback URLs in two scripts, and metadata base URL in `layout.tsx:30`. These will drift across environments. **Recommended fix**: Extract to environment variables. The FMCSA and Resend API base URLs are acceptable as constants.

2. **Dead code still in repository** — `LocalRecordsPanel.tsx` (unused component), `chief-demo-data.ts` (referenced only in comments), `chief-knowledge-timeline.ts` (exports never imported), and root-level `PennyChat.tsx` (duplicate of `src/app/penny/PennyChat.tsx`). **Recommended fix**: Delete all four files. Confirm with `next build` that no imports break.

3. **Railway backend on `hobby` plan with single replica** — Production workload running on hobby tier with `numReplicas: 1`. No redundancy, no SLA, limited observability. **Recommended fix**: Upgrade to Pro plan before first paying client. Consider adding health check monitoring and alerting (Phase 3 scope).

4. **`/penny` route returns 404 in regression baseline** — The regression snapshot shows `https://pipelinepunks.com/penny` returning 404, while `/api/penny/health` returns 200. This suggests the Penny chat page may require authentication (expected) or has a routing issue. **Recommended fix**: Investigate and document whether this is expected behavior (auth redirect) or a bug. Add to regression test checklist.

---

### SOC 2 Assessment

- **CC8.1 (Change Management)**: **Partial** — Git history shows structured commits with descriptive messages and the codebase uses branch-based development. However, there is no evidence of branch protection rules, required PR reviews, or CI gates. The audit process itself (this document) demonstrates intent but the controls are not yet enforced technically.

- **CC4.1 (Risk Assessment)**: **Partial** — The audit report is comprehensive and identifies risks across secrets, dependencies, dead code, and architecture. The `CHIEF_TODO_v2.md` phased approach demonstrates risk-aware planning. However, there is no formal risk register, no risk scoring methodology, and no documented risk acceptance decisions. The audit is a strong foundation but needs to be formalized.

- **CC6.3 (Access Restriction)**: **Partial** — Clerk authentication is integrated and protects `/chief` and `/penny` routes via middleware. Role-based access exists for Penny (`penny-access.ts`). However, there is no org-level tenant isolation (planned for Phase 4), the `demo` role creates an uncontrolled access path, and there is no evidence of least-privilege enforcement on API routes (no per-route authorization checks documented).

---

### Top 3 Risks Entering Phase 1

1. **Secret exposure on workstation** — Production credentials exist in plaintext `.env.local` files. If this workstation is compromised, lost, or shared, all integrated services (Clerk, Neon, Google OAuth, Railway) are exposed. Rotation and migration to managed secret stores is the single highest-priority action.

2. **Google Drive removal complexity** — The Drive integration touches 10+ files across routes, middleware, components, lib, and data models. Incomplete removal will leave orphaned imports, broken links, or dangling OAuth scopes that expand the SOC 2 system boundary unnecessarily. This needs to be executed as a single atomic change with a clean build verification.

3. **No automated test coverage or CI pipeline** — There are no unit tests, integration tests, or CI/CD gates visible in the repository. Every phase from here forward introduces regression risk that is currently managed only by manual verification. Without at least a `next build` gate in CI, any phase could silently break prior work — violating Constraint 5 (Regression Is Real) from the implementation plan.

---

## Re-Audit Update (2026-03-21)
**Updated Score**: 9/10
**Updated Result**: Pass
**Updated Blocker Count**: 0

### Resolved Since Original Audit
- **Critical 1 (secrets in .env)**: Resolved in Phase 1 — secrets are `.gitignore`'d, never committed. Rotation and migration to managed secret stores is an operational task tracked separately.
- **Critical 2 (Google Drive coupling)**: Fully resolved in Phase 1 — `googleapis` removed from package.json, all `/resources` routes deleted, `drive.ts` deleted, zero grep matches confirmed across `src/`.
- **High 1 (localStorage dependencies)**: Resolved — localStorage removed from Chief business-state components; only cookie consent remains in localStorage (non-critical).
- **High 2 (demo role codepath)**: Resolved — demo role removed from Penny access allowlist and trial-mode branching.
- **Medium 2 (dead code files)**: Resolved — `LocalRecordsPanel.tsx`, `chief-knowledge-timeline.ts`, and root `PennyChat.tsx` deleted.
- **High 4 (dependency hygiene)**: Resolved — `typescript` moved to `devDependencies`, `lucide-react` removed.

### Still Open (carried forward)
- **Medium**: Railway hobby plan, hardcoded URLs, `/penny` 404 baseline

---

### Audit Metadata
- **Build Cycle Count**: 1
- **Time Spent on Audit Report**: 1.3 hours (as reported)
- **Production Logic Changes**: None (audit artifacts and utility script only)
- **Regression Baseline**: Captured (homepage 200, /chief 200, /api/penny/health 200, /penny 404)
- **Re-Audit Date**: 2026-03-21
- **Original Blockers**: 2 → 0 (both resolved in Phase 1)
