# Proposal Intake Schema

This skill prepares payloads for:
- `POST /proposals/validate`
- `POST /proposals/generate`
- SOP command `Run Client Proposal Generation`

## Payload Shape

```json
{
  "template_id": "tnds-command-center",
  "service_type": "Command Center Build",
  "client_data": {
    "CLIENT_NAME": "Sarah Chen",
    "CLIENT_COMPANY": "Mountain View Dental",
    "SERVICE_TYPE": "Command Center Build",
    "TOTAL_INVESTMENT": 3000,
    "PROJECT_TIMELINE": "3 weeks",
    "SCOPE_SUMMARY": "Need a repeatable weekly operating cadence"
  }
}
```

## Required Fields

Base required fields:
- `CLIENT_NAME`
- `CLIENT_COMPANY`
- `TOTAL_INVESTMENT`

Template-specific required fields:
- If `template_id == tnds-command-partner`, financial required field is `MONTHLY_RATE` instead of `TOTAL_INVESTMENT`.

## Recommended Fields

- `SCOPE_SUMMARY`
- `CURRENT_SITUATION`
- `PAIN_POINTS`
- `DELIVERABLES_LIST`
- `INCLUDED_ITEMS`
- `PROJECT_TIMELINE`

## MAP Notes Extraction Rules

- Map explicit client/company/service text directly.
- Normalize money values to numeric fields where possible.
- Keep uncertain extracted values blank and flag them as missing.
- Never fabricate financial values.
