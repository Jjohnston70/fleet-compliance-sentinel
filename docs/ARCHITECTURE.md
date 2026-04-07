# Fleet-Compliance Sentinel — Architecture Entry Point

Last updated: 2026-04-07

This file is the architecture index for the project. Use it to find the right depth of documentation quickly.

## Canonical Documents

- `DEVELOPER_MANUAL.md`: full engineering architecture, auth model, API reference, environment variables, deployment, troubleshooting.
- `.claude/ARCHITECTURE.md`: high-level system map, service ownership, current-state gaps, roadmap.
- `docs/USER_MANUAL.md`: client-facing operations guide for org admins and members.
- `src/components/fleet-compliance/UserManualModal.tsx`: in-app manual content source (must stay aligned with `docs/USER_MANUAL.md`).

## Access Model Summary

- `member`: day-to-day operational usage with constrained write permissions.
- `org admin`: tenant administration (settings/import/alerts) and **view-only** Feature Modules page at `/fleet-compliance/settings/modules`.
- `platform admin` (allowlist): developer/operator controls including module activation writes, Command Center, Module Tools, and Developer Module Console.

## Module Management Surfaces

- `/fleet-compliance/settings/modules`: client-facing module visibility and plan status.
- `/fleet-compliance/dev/modules`: platform-admin developer console (multi-tenant scope + module gateway ACL).
- `/fleet-compliance/tools`: platform-admin execution surface for module gateway actions.
