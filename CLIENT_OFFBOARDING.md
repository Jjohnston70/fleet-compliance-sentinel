# Client Offboarding Process

Owner: Jacob
Last Updated: 2026-03-25
Scope: All canceled Fleet-Compliance client organizations.

## Offboarding Workflow

When a client cancels:

1. Set plan to `canceled` in the database.
   - Effect: access is blocked immediately.
2. Retain data for 30 days from cancellation date.
3. At day 30: soft delete all records for `org_id`.
4. At day 60: hard delete all records for `org_id`.
5. Send confirmation email with deletion confirmation.
6. Remove the client from the Clerk organization.
7. Document completion in the offboarding log.

## Operational Procedure

### Day 0 (Cancellation Date)

1. Confirm cancellation request is authorized.
2. Update organization plan state to `canceled`.
3. Set `data_deletion_scheduled_at` to cancellation date + 30 days.
4. Create an offboarding ticket and assign owner.

### Day 30 (Soft Delete Window)

1. Execute soft delete for all records tied to `org_id`.
2. Verify records are inaccessible through app/API.
3. Log completion timestamp, operator, and record counts.

### Day 60 (Hard Delete Window)

1. Execute permanent deletion for all records tied to `org_id`.
2. Remove any remaining org-level references and links.
3. Remove org membership/access in Clerk.
4. Send final deletion confirmation email.
5. Close offboarding ticket and archive evidence.

## Offboarding Log Requirements

Each offboarding entry must include:

- `org_id`
- Cancellation date
- Soft delete completion date/time
- Hard delete completion date/time
- Clerk org removal date/time
- Confirmation email sent date/time
- Operator name
- Notes and exceptions

Store logs in internal operations records and link related artifacts under `SECURITY_REPORTS/incidents/` when relevant.

## Migration Requirement

Required schema update:

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
  data_deletion_scheduled_at TIMESTAMPTZ;
```

Migration file: `migrations/006_offboarding.sql`.
