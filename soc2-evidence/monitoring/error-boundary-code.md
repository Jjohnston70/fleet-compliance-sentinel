# Chief Error Boundary Evidence

## Source Files
- `src/components/chief/ChiefErrorBoundary.tsx`
- `src/app/chief/error.tsx`
- Wrapped pages:
  - `/chief`
  - `/chief/assets`
  - `/chief/compliance`
  - `/chief/suspense`
  - `/chief/employees`
  - `/chief/invoices`
  - `/chief/fmcsa`
  - `/chief/alerts`
  - `/chief/import`

## Structured Logging Contract

```json
{
  "timestamp": "ISO-8601",
  "page": "/chief/...",
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
