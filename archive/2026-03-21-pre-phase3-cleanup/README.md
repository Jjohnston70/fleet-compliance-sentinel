# Archive: Pre-Phase 3 Cleanup (2026-03-21)

Artifacts moved here during repo cleanup before starting SOC 2 Phase 3 (Audit Logging + Observability). Nothing in this directory is referenced by runtime code.

## What was moved and why

### legacy-plans/
Files superseded by `CHIEF_TODO_v2.md` (the active implementation tracker):

| File | Original Date | Why Archived |
|------|--------------|--------------|
| PipelineX-Main-TODO.md | 2025-02-25 | v1 TODO, replaced by CHIEF_TODO_v2.md |
| PipelineX-Architecture-Blueprint.md | 2025-02-18 | Pre-Phase 0 architecture, replaced by soc2-evidence/system-description/ARCHITECTURE.md |
| TODO.md | 2025-03-19 | Minimal stub, no longer used |
| TODO-02-27-2025.md | 2025-03-06 | Single-line dated file |
| pipeline-penny-deployment-plan.md | 2025-02-25 | Penny deployment plan, superseded by RAILWAY_CONFIG.md |
| RAILWAY_DEPLOY_CHECKLIST.md | 2025-03-18 | Deploy checklist, superseded by RAILWAY_CONFIG.md |

### legacy-docs/
Root-level documentation files that are exact duplicates of canonical copies in `/soc2-evidence/system-description/`:

| File | Canonical Location |
|------|-------------------|
| ARCHITECTURE.md | soc2-evidence/system-description/ARCHITECTURE.md |
| AUDIT_REPORT.md | soc2-evidence/system-description/AUDIT_REPORT.md |
| ENV_EXAMPLE.md | soc2-evidence/system-description/ENV_EXAMPLE.md |

### test-data/
| File | Why Archived |
|------|--------------|
| chief-bulk-upload-filled.xlsx | Sample import template with test data, not needed at repo root |

### pipeline-x-reference/
| Directory | Why Archived |
|-----------|--------------|
| pipeline_x_non_gov-main/ | Old monorepo reference used as source for @tnds package integration. Packages are now in /packages/ as workspace deps. This directory is no longer needed. |

## Also deleted
- `desktop.ini` (Windows Explorer metadata, not source code)
