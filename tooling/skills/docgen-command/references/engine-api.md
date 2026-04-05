# Docgen Engine API (Pipeline Penny)

This skill is aligned to the existing backend implementation in:
- `knowledge/agent/proposals/tnds_proposal_engine.py`
- `knowledge/agent/proposals/adapter.py`
- `knowledge/agent/api.py`

Use API endpoints instead of creating a parallel engine path.

## Primary endpoint

`POST /proposals/generate`

### Request body

```json
{
  "client_data": {
    "CLIENT_NAME": "Sarah Chen",
    "CLIENT_COMPANY": "Mountain View Dental",
    "SERVICE_TYPE": "Command Center Build",
    "TOTAL_INVESTMENT": 3500,
    "PROJECT_TIMELINE": "3 weeks",
    "SCOPE_SUMMARY": "Build operational visibility and cadence."
  },
  "template_id": "tnds-command-center",
  "service_type": "Command Center Build",
  "output_filename": "TNDS_Proposal_MountainViewDental_2026-02-20.docx",
  "logo_path": "word-doc-tnds-logo.png"
}
```

### Response shape

```json
{
  "template_id": "tnds-command-center",
  "template_name": "Command Center Build",
  "template_structure": "tnds_8_section",
  "warnings": [],
  "output_path": "C:/.../audit/proposals/TNDS_Proposal_MountainViewDental_2026-02-20.docx",
  "artifact": {
    "type": "proposal.docx",
    "label": "Client Proposal DOCX",
    "path": "C:/.../audit/proposals/TNDS_Proposal_MountainViewDental_2026-02-20.docx",
    "url": "http://127.0.0.1:8000/proposals/TNDS_Proposal_MountainViewDental_2026-02-20.docx",
    "file_name": "TNDS_Proposal_MountainViewDental_2026-02-20.docx",
    "file_size_bytes": 12345
  },
  "processing_ms": 410
}
```

## Companion endpoints

- `POST /proposals/validate`
  - Preflight contract + required field validation.
- `GET /proposals/templates`
  - Returns template catalog metadata.
- `GET /parse/schemas`
  - Lists available parse schemas.
- `POST /parse/documents`
  - Parses a local PDF/DOCX/TXT document and returns structured field extraction plus CSV artifact metadata.

### Parse request body example

```json
{
  "document_path": "<REPO_ROOT>/Desktop/pipeline_penny/samples/vendor_invoice.txt",
  "schema_id": "vendor-invoice-basic"
}
```

When multiple schemas exist, `schema_id` is required.

### Parse response shape

```json
{
  "schema_id": "vendor-invoice-basic",
  "schema_name": "Vendor Invoice Basic",
  "document_path": "C:/.../vendor_invoice.txt",
  "matched_count": 6,
  "total_fields": 6,
  "unmatched_required_fields": [],
  "fields": [
    {
      "name": "invoice_number",
      "label": "Invoice Number",
      "required": true,
      "type": "text",
      "status": "MATCHED",
      "value": "INV-2026-0192",
      "value_preview": "INV-2026-0192",
      "confidence": 0.95
    }
  ],
  "csv_artifact": {
    "type": "parsed.csv",
    "label": "Parsed Field CSV",
    "path": "C:/.../output/parsed/parsed_vendor-invoice-basic_vendor_invoice_20260220-101515.csv",
    "url": "http://127.0.0.1:8000/parsed/parsed_vendor-invoice-basic_vendor_invoice_20260220-101515.csv",
    "file_name": "parsed_vendor-invoice-basic_vendor_invoice_20260220-101515.csv",
    "file_size_bytes": 972
  },
  "processing_ms": 73
}
```

## Required fields (minimum intake)

Base required fields:
- `CLIENT_NAME`
- `CLIENT_COMPANY`
- `TOTAL_INVESTMENT` (or `MONTHLY_RATE` for command-partner monthly workflows)

Recommended operational fields:
- `SERVICE_TYPE`
- `PROJECT_TIMELINE`
- `SCOPE_SUMMARY`
- `CURRENT_SITUATION`
- `PAIN_POINTS`

## Notes

- Output path default currently resolves under repo `audit/proposals` via adapter defaults.
- Validation failures return HTTP 400 with missing field details.
- Engine selection/routing is handled by backend adapter and template routing logic; do not duplicate routing logic in the skill layer.
- Parse schema regex tuning lives in `parse/schemas/*.json`; update schema patterns instead of hardcoding parse behavior in skill text.
