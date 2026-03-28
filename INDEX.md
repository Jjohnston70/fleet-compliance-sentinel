# Fleet-Compliance Sentinel — Repo Index

Last updated: 2026-03-28 (post-telematics stabilization + branch audit)

## Root Files

| Path | Purpose |
|------|---------|
| `README.md` | Primary product + SOC2 status summary |
| `INDEX.md` | Repository map (this file) |
| `PLATFORM_OVERVIEW.md` | Canonical platform and control document |
| `.env.example` | Sectioned env template (core + telematics + backend + tooling) |
| `.mcp.json` | MCP config for Claude Code |
| `.vscode/mcp.json` | MCP config for VS Code |
| `package.json` / `package-lock.json` | Node dependency graph |
| `next.config.js` / `vercel.json` | Next.js + Vercel runtime configuration |
| `sentry.*.config.ts` | Sentry client/server/edge SDK configuration |

## Source Tree

| Path | Current State |
|------|---------------|
| `src/app/` | 33 page routes + 27 API route files |
| `src/components/` | 26 React components including telematics risk UI |
| `src/lib/` | 26 TS utility modules (db/auth/audit/alerts/telematics) |
| `src/app/fleet-compliance/telematics/page.tsx` | Telematics dashboard route |
| `src/components/fleet-compliance/TelematicsRiskBadge.tsx` | Risk badge component |
| `src/app/api/fleet-compliance/telematics-sync/route.ts` | Scheduled telematics sync endpoint |
| `src/app/api/fleet-compliance/telematics-risk/route.ts` | Telematics risk endpoint |

## Backend and Data

| Path | Current State |
|------|---------------|
| `railway-backend/app/main.py` | FastAPI backend (957 lines) |
| `railway-backend/app/telematics_router.py` | Reveal telematics API routes |
| `railway-backend/integrations/verizon_reveal/` | Reveal adapter/auth/normalizer/rest client/webhook receiver |
| `migrations/` | 10 SQL migrations (`001` through `010`) |
| `tooling/fleet-compliance-sentinel/templates/fleet-compliance-bulk-upload-template.xlsx` | Moved from root; canonical tracked template artifact |

## Packages and Scripts

| Path | Purpose |
|------|---------|
| `packages/tnds-types/` | Shared TypeScript types |
| `packages/tnds-ingest-core/` | Ingestion primitives |
| `packages/tnds-retrieval-core/` | Retrieval primitives |
| `packages/tnds-memory-core/` | Memory/timeline package |
| `scripts/check-env.ts` | Runtime env guardrail script |
| `scripts/check-operational-gaps.mjs` | Operational evidence gap scanner |
| `scripts/reveal_sync_neon.py` | Reveal telematics ingestion utility |

## SOC2 Evidence Inventory

Total evidence files: **73**

| Path | File Count | Notes |
|------|------------|------|
| `soc2-evidence/access-control/` | 19 | Secret rotation, auth isolation, test-data cleanup |
| `soc2-evidence/audit-findings/` | 13 | Phase findings + post-phase updates |
| `soc2-evidence/change-management/` | 2 | Branch protection + CODEOWNERS verification |
| `soc2-evidence/compliance-milestones/` | 1 | Observation window record |
| `soc2-evidence/incident-response/` | 4 | IRP + runbook + status-page checks |
| `soc2-evidence/monitoring/` | 10 | Sentry, UptimeRobot, logs, cron health |
| `soc2-evidence/penetration-testing/` | 5 | ZAP baseline attempt + completed reports |
| `soc2-evidence/policies/` | 14 | Policy set and associated analyses |
| `soc2-evidence/system-description/` | 4 | Architecture + env matrix + boundary diagram |
| `soc2-evidence/vendor-management/` | 1 | Subprocessor registry |

## Documentation (`docs/`)

| Path | Purpose |
|------|---------|
| `docs/STATUS.md` | Current execution status and completion log |
| `docs/ROTATION_RUNBOOK.md` | Secret rotation runbook |
| `docs/GIT_WORKFLOW.md` | PR workflow under branch protection |
| `docs/UPTIME_SETUP.md` | UptimeRobot Solo baseline (3 monitors + status page) |
| `docs/RAILWAY_CONFIG.md` | Railway variable and deployment notes |
| `docs/NEON_MIGRATION.md` | Neon migration notes |
| `docs/PENNY_EVALS.md` | Penny eval approach and baseline info |

## Archive

| Path | Purpose |
|------|---------|
| `archive/2026-03-27-cleanup/` | Superseded prompts/docs and duplicate root files moved during this cleanup |
| `archive/2026-03-21-pre-phase3-cleanup/` | Earlier legacy cleanup snapshot |
| `archive/2026-02-26-pre-penny-cleanup/` | Pre-Penny historical artifacts |

## Removed/Relocated in This Rebuild

- Removed from active tree: `src/app/sentry-example-page/page.tsx`
- Removed from active tree: `src/app/api/sentry-example-api/route.ts`
- Relocated to archive: superseded SOC2 prompt docs, root `SECURITY_ROTATION.md`, root `CODEOWNERS`

## GitHub Branch Audit (2026-03-28)

- `origin/main` is current production baseline at PR #13 merge commit.
- Open pull requests: none.
- Merged PR range under branch protection: #1 through #13.
- Remote topic branches from prior sessions remain for audit trail; they are behind `origin/main` and no longer required for active deployment.
