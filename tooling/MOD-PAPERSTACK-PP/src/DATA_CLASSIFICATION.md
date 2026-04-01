# Data Classification for Invoice Extraction Module

## Overview

This document defines the sensitivity levels and handling requirements for data extracted from invoices. Classification aligns with SOC2 Type II controls and the pipelinex-v2 framework.

## Classification Levels

### PUBLIC

Data that can be shared, logged, reported, and exposed without restriction.

**Fields:**
- `vendor`: Vendor/supplier name (e.g., "Colorado Truck Repair")
- `invoice_date`: Date the invoice was issued
- `source_file`: Base filename of the invoice (e.g., "invoice.pdf")
- `vendor` detection/categorization

**Handling:**
- May be included in audit logs
- Safe to display in UI dashboards
- Can be shared in error messages and reports
- No encryption required in transit or at rest

---

### CONFIDENTIAL

Business-sensitive data that should be restricted to authorized personnel and logged under audit controls.

**Fields:**
- `po_number`: Purchase order number
- `written_by`: Employee or operator identifier
- `unit_number`: Vehicle/equipment unit identifier
- `year`, `make`, `model`: Vehicle classification
- `engine`: Engine specification
- `mileage_hours`: Operating hours or mileage
- `line_items`: Parts list with quantities
- `parts`: Individual part numbers and descriptions
- `qty`: Quantities of parts
- `unit_price`: Unit cost of parts
- `parts_total`: Total cost of parts
- `labor_total`: Total labor cost
- `shop_supplies`: Supply costs
- `subtotal`: Subtotal before tax
- `sales_tax`: Tax amount
- `grand_total`: Final invoice total
- `work_descriptions`: Description of work performed
- `invoice_number`: Internal invoice identifier

**Handling:**
- Logged with org_id scoping (multi-tenant isolation)
- Included in audit trail with operator identification
- Masked in general logging and dashboards
- Restricted to authorized personnel
- Should be encrypted in transit (TLS)
- Access requires authentication and authorization

---

### RESTRICTED PII (Personally Identifiable Information)

Highly sensitive personal and identity data that must be masked in all logs and reports.

**Fields:**
- `vin`: Vehicle Identification Number
- `plate_number`: License plate number
- `customer_name`: Customer or vehicle owner name
- `customer_address`: Customer address (street, city, state, ZIP)

**Handling:**
- **NEVER** logged to audit files
- **ALWAYS** masked in any logging output (replaced with "***MASKED_***")
- Not included in user-facing reports
- Excluded from error messages and stack traces
- Access requires explicit authorization and justification
- Must be encrypted at rest
- Subject to data retention and deletion policies
- For compliance purposes, only the last 4 characters of VINs may be logged (e.g., "***MASKED_VIN_A1B2***")

---

## Audit Logging Policy

### Logged Fields (Public + Confidential)

Audit entries **ALWAYS** include:
- `timestamp` (ISO 8601 UTC)
- `operator` (user/system identifier)
- `org_id` (organization for multi-tenant scoping)
- `source_file` (base filename only, not full path)
- `vendor` (detected vendor)
- `status` (success, partial, error)
- `field_count` (number of extracted fields)
- `total_extracted` (sum of financial amounts)
- `duration_ms` (extraction time)

### Masked/Excluded Fields

The following are **NEVER** logged:
- VINs
- Plate numbers
- Customer names
- Customer addresses
- Customer contact information

### Masked Output for Dashboards

When displaying extraction results in user-facing contexts:
1. Use the `mask_pii()` function from `compliance.py`
2. Replace PII fields with masked placeholders
3. Keep confidential business data visible only to authorized roles

---

## Multi-Tenant Isolation

All extraction operations must include `org_id` for proper data isolation:

```python
result = scoped_extract(pdf_path, org_id="org_123", operator="user_456")
```

The `org_id` is:
- Attached to every extracted result
- Included in all audit log entries
- Used for access control and data filtering
- Validated before returning results to authenticated users

---

## Data Retention

- **Audit logs**: Retain for minimum 7 years (SOC2 Type II requirement)
- **Extracted data**: Follow organization data retention policy
- **PII data**: Minimize retention; delete upon invoice fulfillment or per data subject request
- **Logs with errors**: Retain with any sensitive data removed/masked

---

## Compliance Checklist

- [x] AuditLogger excludes PII from all log entries
- [x] Input validation prevents malicious files
- [x] Text sanitization removes control characters
- [x] PII masking applied before dashboard/report display
- [x] Org scoping enforced on all extraction operations
- [x] Multi-tenant data isolation via org_id
- [x] Operator tracking for all extraction events
- [x] Error logging without exposing sensitive data
- [x] Configurable audit log path for compliance systems
- [x] External callback support for SIEM/logging integration

---

## Field Reference Table

| Field Name | Classification | Example | Masking Rule |
|---|---|---|---|
| vendor | PUBLIC | "Colorado Truck Repair" | No |
| invoice_date | PUBLIC | "2026-03-15" | No |
| source_file | PUBLIC | "invoice_001.pdf" | No |
| po_number | CONFIDENTIAL | "PO-12345" | In general reports |
| vin | RESTRICTED PII | "1HGCV53387A123456" | Always (show last 4) |
| plate_number | RESTRICTED PII | "ABC123" | Always |
| customer_name | RESTRICTED PII | "John Doe" | Always |
| customer_address | RESTRICTED PII | "123 Main St, Denver, CO 80202" | Always |
| grand_total | CONFIDENTIAL | 2682.69 | In general reports |
| line_items | CONFIDENTIAL | [{"qty": 2, "description": "Part X", ...}] | Descriptions checked |
| work_descriptions | CONFIDENTIAL | "Engine rebuild" | In general reports |

---

## Fleet Compliance Template Fields

The `to_fleet_xlsx()` export introduces additional derived fields. Their classification:

| Field Name | Classification | Source | Notes |
|---|---|---|---|
| category | CONFIDENTIAL | Auto-derived from work_descriptions | e.g., "Compliance", "Preventive Maintenance" |
| service_type | CONFIDENTIAL | Auto-derived from work_descriptions + vendor | e.g., "DOT Inspection", "Lube / PM" |
| maintenance_id | CONFIDENTIAL | Generated (VND-YYYYMMDD-NNN) | Unique per extraction run |
| status | PUBLIC | Default "Completed" | For extracted invoices |
| due_date | CONFIDENTIAL | Not currently extracted | Blank in output |
| asset_id | CONFIDENTIAL | Maps to unit_number | Fleet unit identifier |
| asset_name | CONFIDENTIAL | Composite of year + make + model | e.g., "2022 KENWORTH T360" |
| notes (Invoices) | MIXED | Contains source_file (PUBLIC) + VIN/Plate (PII) | Apply PII masking before sharing |
| notes (Maint. Tracker) | CONFIDENTIAL | Contains work_descriptions text | May contain sensitive job details |

**Handling for derived fields:**
- Category and Service Type are safe for general reporting (CONFIDENTIAL but not PII)
- Notes fields in both Invoices and Maintenance Tracker sheets may contain PII references (VIN, Plate) and should be masked before external sharing
- Maintenance IDs are safe for logging and cross-referencing

---

## Related Files

- `compliance.py`: Implementation of AuditLogger, validators, maskers
- `vendor_parsers.py`: Invoice parsing with field extraction
- `extract_invoice.py`: CLI and integration interface
- `invoice_module/api.py`: Public API including `to_fleet_xlsx()` export
