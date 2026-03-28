# Database + Clerk Test Data Cleanup Evidence (Phase 6)

Date Opened: 2026-03-25  
Primary Scope: Test data removal from production data plane and identity plane

## A) Neon Postgres Cleanup (Completed)

Operator: Codex  
Completion Date: 2026-03-25

### Scope

- Neon Postgres (`DATABASE_URL`)
- Tables inspected: `organizations`, `chief_records`, `org_audit_events`, `organization_contacts`, `subscriptions`, `stripe_webhook_events`

### Before Cleanup

- `organizations`: 1
- `chief_records` (active): 75
- `chief_records` with `org_id IS NULL`: 72
- `chief_records` with orphan `org_id` (no matching org): 1

### Cleanup Actions Executed

- Deleted legacy unscoped records (`chief_records` where `org_id IS NULL`): 72 rows
- Deleted orphan `chief_records` row(s): 1 row
- Deleted records for test org(s) (`name` like `Organization org_%`): 2 rows
- Deleted related `org_audit_events` for test org(s): 2 rows
- Deleted test org(s) from `organizations`: 1 row

### After Cleanup

- `organizations`: 0
- `chief_records` (active): 0
- `chief_records` with `org_id IS NULL`: 0
- `chief_records` with orphan `org_id`: 0

## B) Clerk Cleanup (Manual Admin Action Required)

### Attempted Automation (2026-03-28 UTC)

- Attempted Clerk MCP verification/cleanup from this environment.
- Result: `Unauthorized` (no active authorized Clerk admin session/API token in this runtime).

### Clerk Cleanup Date

- **Pending (admin dashboard action required)**

### Clerk Cleanup By

- **Pending (Jacob Johnston or authorized Clerk admin)**

### Required Manual Checklist (Clerk Dashboard)

1. Open Organizations in Clerk dashboard.
2. Delete any test orgs (examples: `Organization org_*`, `Test Org`, non-customer orgs).
3. Open Users and remove test/dummy users with production access.
4. Capture before/after screenshots for auditor packet.
5. Record final counts below.

### Final Clerk Results (To Be Filled After Admin Action)

- Test organizations found: Pending
- Test organizations deleted: Pending
- Test users found: Pending
- Test users deleted: Pending
- Confirmation no test production access remains: Pending

## Control Mapping

- **CC6.1 (Access Control):** Database-side cleanup complete; Clerk identity-plane cleanup still pending authorized manual completion.
