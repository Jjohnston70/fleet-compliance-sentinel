# Org Scoping Migration SQL

Date: 2026-03-25
Owner: Codex automation

## Migration File

- `migrations/004_org_scoping.sql`

## Applied Changes

- Added `org_id` columns (conditional by table existence) for:
  - `assets`
  - `drivers`
  - `permits`
  - `suspense_items`
  - `employees`
  - `invoices`
  - `chief_records`
- Added org indexes (conditional by table existence):
  - `idx_assets_org_id`
  - `idx_drivers_org_id`
  - `idx_permits_org_id`
  - `idx_suspense_org_id`
  - `idx_employees_org_id`
  - `idx_invoices_org_id`
  - `idx_chief_records_org_id`
- Created:
  - `organizations`
  - `subscriptions`
- Added:
  - `idx_subscriptions_org_id_created_at`

## Post-Migration Verification (Database)

Command output snapshot:

```text
tables=chief_records,invoices,organizations,subscriptions
org_id_columns=chief_records,invoices
indexes=idx_chief_records_org_id,idx_invoices_org_id,idx_subscriptions_org_id_created_at
counts={"chief_records_count":81,"invoices_count":0,"organizations_count":0,"subscriptions_count":0}
```

Notes:
- This environment currently has `chief_records` and `invoices` as active operational tables.
- Conditional migration guards (`ALTER TABLE IF EXISTS` + `to_regclass`) prevent failures on absent legacy-normalized tables while preserving forward compatibility.

