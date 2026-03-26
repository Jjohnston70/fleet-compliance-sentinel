# Fleet-Compliance Error Boundary Evidence

## Source Files
- `src/components/fleet-compliance/FleetComplianceErrorBoundary.tsx`
- `src/app/fleet-compliance/error.tsx`
- Wrapped pages:
  - `/chief`
  - `/fleet-compliance/assets`
  - `/fleet-compliance/compliance`
  - `/fleet-compliance/suspense`
  - `/fleet-compliance/employees`
  - `/fleet-compliance/invoices`
  - `/fleet-compliance/fmcsa`
  - `/fleet-compliance/alerts`
  - `/fleet-compliance/import`

## Structured Logging Contract

```json
{
  "timestamp": "ISO-8601",
  "page": "/fleet-compliance/...",
  "error": "error.message",
  "userId": "string|null",
  "orgId": "string|null"
}
```

## User-Safe Fallback Behavior
- Displays error message and timestamp.
- Shows `Retry` button.
- Shows `Contact support` CTA.
- Does not expose stack traces in UI.
