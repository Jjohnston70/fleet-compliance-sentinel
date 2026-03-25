# Client Offboarding Process

Owner: Security and Operations Team
Last Updated: 2026-03-25
Scope: All canceled Fleet-Compliance organizations.

## Offboarding Workflow

When a client cancels:

1. Set organization plan to `canceled`.
2. Access is blocked immediately by API and UI plan gate checks.
3. Set `data_deletion_scheduled_at` to cancellation date + 30 days.
4. At day 30: soft delete records for that `org_id`.
5. At day 60: hard delete records for that `org_id`.
6. Remove users from Clerk organization.
7. Send deletion confirmation and record completion in offboarding log.

## Operational Automation

Automation now runs in production via cron:

- Cron route: `POST /api/fleet-compliance/alerts/run`
- Offboarding worker: `src/lib/offboarding-lifecycle.ts`
- Trigger source: Vercel cron invocation with `FLEET_COMPLIANCE_CRON_SECRET`

The worker performs:

- Schedule creation for canceled orgs missing `data_deletion_scheduled_at`
- Day-30 soft delete pass
- Day-60 hard delete pass
- Structured summary output for audit evidence

## Data Scope Covered by Automation

Hard delete covers all org-scoped operational tables:

1. `fleet_compliance_records`
2. `invoices`
3. `invoice_line_items`
4. `invoice_work_descriptions`
5. `fleet_compliance_error_events`
6. `cron_log`
7. `subscriptions`
8. `stripe_webhook_events`
9. `organization_contacts`
10. `org_audit_events`

## Manual Verification Procedure

### Day 0 (Cancellation Date)

1. Confirm cancellation request is authorized.
2. Verify org plan changed to `canceled`.
3. Verify `data_deletion_scheduled_at` is set.
4. Open offboarding ticket and assign owner.

### Day 30 (Soft Delete Window)

1. Verify soft delete counts in cron response.
2. Validate org records are inaccessible via app/API.
3. Add evidence snapshot to offboarding ticket.

### Day 60 (Hard Delete Window)

1. Verify hard delete counts in cron response.
2. Remove Clerk org membership.
3. Send final deletion confirmation.
4. Close offboarding ticket.

## Individual Deletion Requests (Non-Cancellation)

For GDPR/CCPA requests where an account is still active:

1. Open a privacy request ticket tied to `org_id` and requestor identity.
2. Verify requester authorization and legal basis.
3. Delete only requested subject data within platform retention policy.
4. Record tables affected, timestamp, and operator.
5. Send completion notice to requester.

This flow is separate from full offboarding and does not require plan cancellation.

## Offboarding Log Requirements

Each offboarding entry must include:

- `org_id`
- Cancellation date
- `data_deletion_scheduled_at`
- Soft delete completion timestamp
- Hard delete completion timestamp
- Clerk removal timestamp
- Deletion confirmation timestamp
- Operator and reviewer
- Exceptions and follow-up actions

## Migration Requirement

Required schema update:

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
  data_deletion_scheduled_at TIMESTAMPTZ;
```

Migration file: `migrations/007_offboarding.sql`.
