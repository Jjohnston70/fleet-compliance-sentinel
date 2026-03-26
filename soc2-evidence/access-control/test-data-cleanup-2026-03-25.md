# Database Test Data Cleanup (Phase 6)

Date: 2026-03-25  
Operator: Codex

## Scope

- Neon Postgres (`DATABASE_URL` from `.env.local`)
- Tables inspected: `organizations`, `chief_records`, `org_audit_events`, `organization_contacts`, `subscriptions`, `stripe_webhook_events`

## Before Cleanup

- `organizations`: 1
- `chief_records` (active): 75
- `chief_records` with `org_id IS NULL`: 72
- `chief_records` with orphan `org_id` (no matching org): 1

## Cleanup Actions Executed

- Deleted all legacy unscoped records (`chief_records` where `org_id IS NULL`): 72 rows
- Deleted orphan org record(s) in `chief_records`: 1 row
- Deleted records for test org(s) (`name` like `Organization org_%`): 2 rows
- Deleted related `org_audit_events` for test org(s): 2 rows
- Deleted test org(s) from `organizations`: 1 row

## After Cleanup

- `organizations`: 0
- `chief_records` (active): 0
- `chief_records` with `org_id IS NULL`: 0
- `chief_records` with orphan `org_id`: 0

## Notes

- Attempted Clerk org cleanup for matching org IDs via MCP tool, but operation returned `Unauthorized` from Clerk API in this environment.
- Clerk-side deletion must be completed from an authorized admin session if those org IDs still exist in Clerk.
