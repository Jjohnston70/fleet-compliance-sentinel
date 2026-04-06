# Fleet-Compliance Sentinel — Repo Index

Last updated: 2026-04-01 (repo maintenance + sprint kickoff)

## Root Files

| Path | Purpose |
|------|---------|
| `README.md` | Primary product + SOC2 status summary |
| `INDEX.md` | Repository map (this file) |
| `PLATFORM_OVERVIEW.md` | Canonical platform and control document |
| `TODO-April 2-25 Sprint Plan.md` | Active sprint plan with task prompts for Workstream A + B |
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
| `src/lib/modules-gateway/` | Module gateway orchestration (types, registry, runner, command-center bridge, persistence) |
| `src/app/fleet-compliance/telematics/page.tsx` | Telematics dashboard route |
| `src/app/fleet-compliance/tools/page.tsx` | Module Tools operator UI (Phase 6) |
| `src/components/fleet-compliance/TelematicsRiskBadge.tsx` | Risk badge component |
| `src/app/api/fleet-compliance/telematics-sync/route.ts` | Scheduled telematics sync endpoint |
| `src/app/api/fleet-compliance/telematics-risk/route.ts` | Telematics risk endpoint |
| `src/app/api/modules/` | Module gateway API routes (run, catalog, status, command-center, artifact) |

## Backend and Data

| Path | Current State |
|------|---------------|
| `railway-backend/app/main.py` | FastAPI backend (957 lines) |
| `railway-backend/app/telematics_router.py` | Reveal telematics API routes |
| `railway-backend/integrations/verizon_reveal/` | Reveal adapter/auth/normalizer/rest client/webhook receiver |
| `migrations/` | 10 SQL migrations (`001` through `010`) |
| `tooling/fleet-compliance-sentinel/templates/fleet-compliance-bulk-upload-template.xlsx` | Canonical tracked template artifact |

## Packages

| Path | Purpose | Used In |
|------|---------|---------|
| `packages/tnds-types/` | Shared TypeScript types | `penny-ingest.ts`, `penny/query/route.ts` |
| `packages/tnds-ingest-core/` | Document ingestion primitives | `penny-ingest.ts` |
| `packages/tnds-retrieval-core/` | Chunked retrieval for Penny RAG | `penny/query/route.ts` |
| `packages/tnds-memory-core/` | Memory/timeline package | Future use (timeline feature) |

## Scripts

| Path | Purpose |
|------|---------|
| `scripts/check-env.ts` | Runtime env guardrail script |
| `scripts/check-operational-gaps.mjs` | Operational evidence gap scanner |
| `scripts/reveal_sync_neon.py` | Reveal telematics ingestion utility |
| `scripts/build-cfr-index.mjs` | Build CFR chunk index for Penny |
| `scripts/build-demo-index.mjs` | Build demo knowledge index for Penny |
| `scripts/run-penny-evals.mjs` | Penny evaluation suite |
| `scripts/download-vendor-docs.mjs` | Download vendor llms.txt documentation |
| `scripts/prepare-vendor-docs-package.mjs` | Package vendor docs into zip |
| `scripts/check-legal-pages.mjs` | Compliance legal page validator |
| `scripts/ops-check.mjs` | Operational gap checker |

## Knowledge Base

| Path | Purpose | Size |
|------|---------|------|
| `knowledge/cfr-docs/` | 13 CFR parts in Markdown (DOT/FMCSA regulations) | 16 files, ~2.3 MB |
| `knowledge/cfr-index/chunks.json` | Vectorized CFR index for Penny RAG | 3.9 MB |
| `knowledge/demo-index/chunks.json` | Demo knowledge index (ERG, HubSpot, realty-command) | 15 MB |
| `knowledge/data/original_content/01_realty-command/` | Real estate compliance reference content | 127 files |
| `knowledge/data/original_content/erg-hazmat/` | Emergency Response Guidebook 2024 | 2 files |
| `knowledge/data/original_content/hubspot/` | HubSpot API documentation snapshots | 2 files |
| `knowledge/domains/dot-compliance/` | DOT compliance domain config (manifest, prompts, skills, tags) | Active |
| `knowledge/org-data/` | Organization-specific data (placeholder) | Empty |
| `knowledge/timeline/` | Timeline event data (placeholder) | Empty |
| `knowledge/05_Railway/` | Railway platform documentation reference | 977 files, ~35 MB |

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
| `docs/VERIZON_REVEAL_TODO.md` | Verizon Reveal scope matrix and execution plan |
| `docs/RAILWAY_CONFIG.md` | Railway variable and deployment notes |
| `docs/NEON_MIGRATION.md` | Neon migration notes |
| `docs/PENNY_EVALS.md` | Penny eval approach and baseline info |
| `docs/HQ_SCREENSHOT_WORKFLOW.md` | High-quality screenshot capture workflow |
| `docs/FEATURE_SPEC_HAZMAT_TRAINING_COMPLIANCE.md` | Hazmat training compliance feature spec |
| `docs/FLEET_COMPLIANCE_TODO_v2.md` | Phase 0-8 implementation TODO (complete) |

## Integration Documentation (`docs/integration/`)

| Path | Purpose |
|------|---------|
| `docs/integration/MODULE_GATEWAY_CONTRACT.md` | Frozen module gateway API contract |
| `docs/integration/MODULE_INVENTORY.md` | Phase 1 module inventory lock |
| `docs/integration/MODULE_ENV_MATRIX.md` | Environment variables by module |
| `docs/integration/ML_RUNBOOK.md` | ML-EIA and ML-SIGNAL gateway runbook |
| `docs/integration/PAPERSTACK_RUNBOOK.md` | PaperStack gateway runbook |
| `docs/integration/COMMAND_CENTER_BRIDGE.md` | Command-center bridge runbook |
| `docs/integration/E2E_INTEGRATION_CHECKLIST.md` | End-to-end operator flow validation |
| `docs/integration/OPERATIONS_RUNBOOK.md` | Module gateway operations guide |

## Archive

| Path | Purpose |
|------|---------|
| `archive/2026-04-01-repo-maintenance/` | Unused public assets and duplicate docs archived during April review |
| `archive/2026-03-27-cleanup/` | Superseded prompts/docs and duplicate root files |
| `archive/2026-03-21-pre-phase3-cleanup/` | Earlier legacy cleanup snapshot |
| `archive/2026-02-26-pre-penny-cleanup/` | Pre-Penny historical artifacts |

## GitHub Branch Audit (2026-04-01)

- `origin/main` is current production baseline at PR #14 merge commit.
- Open pull requests: none.
- Merged PR range under branch protection: #1 through #14.
- Active sprint: April 2-25 (Workstream A: Enterprise Hardening + Workstream B: Training-Command)
- Remote topic branches from prior sessions remain for audit trail.
