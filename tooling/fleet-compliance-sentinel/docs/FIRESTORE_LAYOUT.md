# Firestore Collection Layout

## Purpose

This file defines the Firestore-ready collection structure for the Example Fleet Co module and pairs with the example JSON files in `firestore_examples/`.

The design is based on:

- `databases/*.csv`
- `asset-command_vs.001/asset-command-working-testing-03-07-2026.xlsx`
- `asset-command_vs.001/code.md`
- the suspense-email and FMCSA requirements added during planning

## Top-Level Strategy

Use a single tenant-safe root with `orgId` on every record from day one.

Recommended Firestore layout:

```text
organizations/{orgId}
people/{personId}
employee_compliance/{complianceId}
emergency_contacts/{contactId}
assets/{assetId}
vehicle_assets/{assetId}
tank_assets/{assetId}
activity_logs/{activityId}
maintenance_plans/{planId}
maintenance_events/{eventId}
compliance_requirement_templates/{templateId}
permit_license_records/{recordId}
suspense_items/{suspenseItemId}
attachments/{attachmentId}
reference_contacts/{referenceContactId}
fmcsa_snapshots/{snapshotId}
notifications_log/{notificationId}
```

## ID Conventions

- `orgId`: slug-style, for example `example-fleet-co`
- `personId`: `emp_<employee-id>` when imported from employee data
- `assetId`: keep existing asset IDs when present; otherwise generate stable IDs such as `veh_001`, `tank_t001`
- `recordId`: use semantic prefixes when possible, for example `permit_ucr_2026`
- `suspenseItemId`: generated UUID or deterministic key from source record plus due date

## Relationship Rules

- Every record includes `orgId`.
- Child collections reference parent records by ID rather than by name whenever possible.
- `assets` is the shared parent collection for vehicles, equipment, cubes, skid tanks, and tanks.
- `vehicle_assets` and `tank_assets` extend the shared `assets` record using the same `assetId`.
- `suspense_items` reference the originating compliance or permit record through `sourceType` and `sourceId`.

## Import Order

1. `organizations`
2. `people`
3. `employee_compliance`
4. `assets`
5. `vehicle_assets`
6. `tank_assets`
7. `maintenance_plans`
8. `maintenance_events`
9. `activity_logs`
10. `permit_license_records`
11. `reference_contacts`
12. `emergency_contacts`
13. `attachments`
14. generated `suspense_items`
15. optional `fmcsa_snapshots`

## Core Derived Rules

- `Cost Tracking` remains derived and should not be imported as a source-of-truth collection.
- `Dashboard`, `Dashboard 2`, and setup sheets remain presentation-only.
- `suspense_items` are generated from due dates and alert windows, not manually duplicated from permit rows unless a manual override is needed.
- Full SSNs must not be stored in frontend-readable Firestore documents.

## Compliance Templates To Seed

- `state_hazmat`: annual
- `federal_hazmat`: every 4 years
- `ucr`: annual
- `operating_authority_mc150`: every 2 years, not later than October
- `ifta`: quarterly
- `irp`: annual

## Example Files

See `firestore_examples/` for document examples covering:

- organization config
- people
- driver compliance
- assets
- vehicle asset detail
- tank asset detail
- permit/license tracking
- suspense items
- FMCSA snapshots
- attachments
- reference contacts

