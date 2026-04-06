# activeContext.md — Current Work State

**Last Updated:** 2026-04-06
**Update this file at the start of every session.**

---

## What We're Working On Right Now

1. **Onboarding Phase 6 Release Gate (P6-T2 through P6-T4):** Completing contract drift tests, alert binding tests, and evidence pack documentation for onboarding release sign-off.
2. **Training Critical Fixes:** 6 critical findings (C-1 through C-6) from the April 2 production readiness audit must be resolved before first paying client. C-2 (server-side score validation) and C-3 (completion bypass) are highest compliance liability.
3. **SOC 2 Evidence Collection:** Observation window is active (started March 24). Need to establish compliance evidence folder structure and begin monthly/weekly collection cadence.
4. **First Client Preparation:** All critical/high findings must be resolved, documentation must be client-ready, and the onboarding flow must work end-to-end for a new org signup.

---

## Recent Decisions

| Decision | Rationale | Date |
|---------|-----------|------|
| Onboarding moved to trial tier | Every org needs employee onboarding from day one, not just pro plans | 2026-04-06 |
| Module-aware sidebar filtering | Sidebar now uses real org modules + role instead of showing everything | 2026-04-06 |
| Developer and User manuals rewritten | Previous manuals were incomplete; new versions match Pipeline Penny reference quality | 2026-04-06 |
| 13 truncated files restored from git HEAD | File corruption discovered during onboarding debug; all restored | 2026-04-06 |
| .claude/ template docs filled out | Standardized agent context docs for consistent AI coding sessions | 2026-04-06 |

---

## Current Blockers

- **C-2: Client-trusted assessment scores** — Must implement server-side score validation before any fleet client takes training. This is a compliance liability.
- **C-1: Training schema not deployment-safe** — New orgs will hit missing-table errors on training features until migration is made idempotent/safe.
- **H-4: Ephemeral certificate storage** — Training certificates stored on Vercel's ephemeral filesystem will be lost on redeploy. Need durable storage (S3/GCS/Neon blob).

---

## Active Files (What's Being Modified)

_Update this when you start working on a specific area._

- `.claude/IDENTITY.md` — New (from template)
- `.claude/ARCHITECTURE.md` — New (from template)
- `.claude/STACK.md` — New (from template)
- `.claude/COMMANDS.md` — New (from template)
- `.claude/SECURITY.md` — New (from template)
- `.claude/PROGRESS.md` — New (from template)
- `.claude/activeContext.md` — New (from template)
- `.claude/claude.md` — Updated (from template, replaces generic version)

---

## Session Notes

_Drop quick notes here during work sessions. Clear at start of next major phase._

- 2026-04-06: Filled out all 8 .claude/ template files with FCS-specific content
- 2026-04-06: Previous session fixed layout.tsx/FleetComplianceShell.tsx truncation, restored 13 corrupted files, completed Phase 6 P6-T1 through P6-T4, rewrote both manuals, updated UserManualModal

---

## What's Done (This Phase)

- Onboarding Phase 5 Hardening (P5-T1 to P5-T3): module gate audit, route hardening, observability
- Onboarding Phase 6 Release Gate: P6-T1 acceptance matrix, P6-T2 contract drift tests, P6-T3 alert binding tests, P6-T4 evidence pack
- Documentation refresh: Developer manual (1,019 lines), User manual (1,083 lines), UserManualModal updated
- Layout/shell file truncation fix and 13 file restoration
- Onboarding moved to trial tier, module-aware sidebar wiring completed

---

## What's Next (After Current Tasks)

1. Fix C-2: Server-side assessment score validation
2. Fix C-1: Make training schema deployment-safe for new orgs
3. Fix C-3: Prevent completion/cert without assignment/deck completion
4. Fix C-6: Seed default training plans for new orgs
5. Fix H-1, H-3: Training data access control for members
6. Fix H-4: Migrate certificate storage to durable backend
7. Establish `/compliance/` evidence folder structure and first collection
8. End-to-end testing of new org signup through onboarding through training
9. Prepare for first paying client onboarding
