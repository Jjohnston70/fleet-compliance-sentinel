# Invoice Extraction Module - TODO

**Date**: 2026-03-26
**Project**: PaperStack / Invoice Extraction Module
**Owner**: Jacob Johnston, True North Data Strategies LLC
**Target Integration**: website-pipeline-punks-pipelinex-v2 (first module deployment)
**SOC2 Reference**: soc2-evidence/policies/ in pipelinex-v2 repo

---

## Project Status Summary

COMPLETED 2026-03-26. All 6 phases executed. 12 vendors supported (10 text-based, 2 OCR). 24 pytest tests passing. SOC2 compliance controls implemented. Module packaged and documented. v1.1.0 adds fleet-compliance-bulk-upload-template export format with auto-derived Service Type, Category, and Maintenance Tracker generation.

---

## Section 1: Required Extraction Fields Per Invoice

Every test must confirm extraction of these fields, aligned to both the `maintenance_import.xlsx` and `fleet-compliance-bulk-upload-template.xlsx` schemas:

| Field | Excel Column | Notes |
|-------|-------------|-------|
| Vendor | `Vendor` | Auto-detected from PDF content/filename |
| Asset Name | `Asset Name` | Formatted as "Year Make Model" |
| Truck/Unit Number | `Unit Number` | Fleet ID, unit #, or truck # |
| Itemized Parts | `Line Items` sheet | Qty, Item Description, Unit Price, Line Amount per part |
| Parts Cost | `Parts Cost` | Sum of all parts/materials |
| Labor Cost | `Labor Cost` | Sum of all labor charges |
| Total Invoice | `Invoice Total` | Grand total including tax |
| Engine Hours / Miles | `Mileage Hours` | Mileage, engine hours, or both (e.g., "157126/6434.0") |
| Invoice Date | `Completed Date` | ISO format (YYYY-MM-DD) |
| PO Number | `PO Number` | Customer purchase order reference |
| VIN | `VIN` | Vehicle identification number |
| Engine Type | `Engine` | Engine model (e.g., "PX9") |
| Plate Number | `Plate Number` | License plate |
| Year/Make/Model | `Year`, `Make`, `Model` | Individual fields |
| Work Descriptions | `Work Requested`, `Work Completed` | Separated into requested vs. completed |
| Source File | `Source File` | Original PDF filename |

---

## Section 2: Test Plan - Per Invoice Sample

Each test runs `parse_invoice()` from `vendor_parsers.py` against the sample PDF and validates extracted data against the known values from the filename and Excel reference.

### Test 2.1: Bosselman 48.16 Hauling #415.pdf
- [x] Vendor detected: "Bosselman"
- [x] Invoice Total: $48.16
- [x] Parts Cost: $44.08
- [x] Labor Cost: $0
- [x] Sales Tax: ~$4.08
- [x] Unit Number: (not available - verify graceful empty)
- [x] Asset Name: (not available - verify graceful empty)
- [x] Mileage/Hours: (not available - verify graceful empty)
- [x] Line items extracted: at least 1 item
- [x] Date in ISO format

### Test 2.2: Colorado Truck Repair 2,682.69 TW #249.pdf
- [x] Vendor detected: "Colorado Truck Repair"
- [x] Invoice Total: $2,682.69 (NOTE: Excel shows $384.40 - validate actual PDF total)
- [x] Unit Number: "CP 49"
- [x] Asset Name: "2022 KENWORTH T360"
- [x] VIN: "1SAMPLE00000000002"
- [x] Engine: "PX9"
- [x] Mileage/Hours: "157126/6434.0"
- [x] Plate Number: "DGE-451"
- [x] Parts Cost: $1,168.16
- [x] Labor Cost: $1,320.00
- [x] Shop Supplies: $105.60
- [x] Line items: 25 items
- [x] Work Requested and Work Completed separated correctly
- [x] Multi-page parsing works (all pages captured)

### Test 2.3: MHC 83.22 Lubes #571.pdf
- [x] Vendor detected: "MHC Kenworth"
- [x] Invoice Total: $83.22
- [x] Unit Number: "7119"
- [x] Asset Name: "2019 HINO 338-07"
- [x] VIN: "1SAMPLE00000000003"
- [x] Mileage/Hours: "164476"
- [x] Parts Cost: $6.53
- [x] Labor Cost: $68.47
- [x] Shop Supplies: $8.22
- [x] Date parsed (verify ISO format)
- [x] Work descriptions contain DOT inspection and trans leak repair notes

### Test 2.4: Napa 116.90 - TW 45.pdf
- [x] Vendor detected: "NAPA"
- [x] Invoice Total: $116.90 (NOTE: Excel shows $12.00 - parser likely broken, fix required)
- [x] Unit Number: extracted or graceful empty
- [x] Line items: validate all parts with part numbers
- [x] Date in ISO format

### Test 2.5: PSC Custom 1,817.99 TW #248.pdf
- [x] Vendor detected: "PSC Custom"
- [x] Invoice Total: $1,817.99
- [x] Unit Number: "48"
- [x] Asset Name: "2021 WESTMOR DOT406"
- [x] VIN: "479378"
- [x] PO Number: "844"
- [x] Parts Cost and Labor Cost extracted (currently both 0 in Excel - parser needs fix)
- [x] Line items: 4 items
- [x] Work descriptions: complaint/correction format parsed
- [x] Multi-page content captured

### Test 2.6: Purcell 2,521.68 Lubes #544.pdf
- [x] Vendor detected: "Purcell Tire"
- [x] Invoice Total: $2,521.68
- [x] Unit Number: "44"
- [x] Asset Name: "2017 KENWORTH CONSTRUCTION T370"
- [x] Plate Number: "NGQ-802"
- [x] VIN: "1SAMPLE00000000004"
- [x] Parts Cost: $1,976.80
- [x] Labor Cost: $240.00
- [x] Sales Tax: $187.32
- [x] Line items: 6 items

### Test 2.7: Randy's Towing 654.00 TW #247.pdf
- [x] Vendor detected: "Randy's Towing"
- [x] Invoice Total: $654.00
- [x] Labor Cost: $654.00 (towing = labor)
- [x] Work descriptions: tow from/to locations captured
- [x] Line items: 2 items
- [x] Date in ISO format

### Test 2.8: Rush Truck Centers 450.42 Hauling #411.pdf
- [x] Vendor detected: "Rush Truck Centers"
- [x] Invoice Total: $450.42
- [x] Parts Cost: $395.00
- [x] Shipping/Shop Supplies: $35.00
- [x] Sales Tax: $20.42
- [x] PO Number: "TRL11"
- [x] Line items: 3 items with part numbers

### Test 2.9: Service Auto Glass 432.05 Lubes #595.pdf
- [x] Vendor detected: "Service Auto Glass"
- [x] Invoice Total: $432.05
- [x] Unit Number: "9518"
- [x] Asset Name: "2019 FREIGHTLINER BUSINESS CLASS M2 4 DOOR CONVENTIONAL CAB"
- [x] VIN: "1SAMPLE00000000005"
- [x] Parts Cost (Material): $223.49
- [x] Labor Cost: $190.23
- [x] Sales Tax: $18.33
- [x] Line items: 1 item

### Test 2.10: Southern Tire Mart 1,465.24 Hauling #373.pdf
- [x] Vendor detected: "Southern Tire Mart"
- [x] Invoice Total: $1,465.24
- [x] Unit Number: "373"
- [x] Parts Cost: $1,142.94
- [x] Labor Cost: $160.00
- [x] Sales Tax: $92.12
- [x] Line items: 6 items

### Test 2.11: 09.17.25 Bruckners 14.86 - Hauling 373.pdf (NEW - NO PARSER)
- [x] **BUILD PARSER**: Bruckners is a scanned PDF - requires OCR pipeline
- [x] Vendor detected: "Bruckners"
- [x] Invoice Total: $14.86
- [x] Unit/Asset: Hauling #373
- [x] Extract all available fields via OCR
- [x] Itemized parts extracted
- [x] Mileage/Hours if present
- [x] Graceful handling of OCR confidence issues

### Test 2.12: Arnold Machinery 235.60 FL #01.pdf (NEW - NO PARSER)
- [x] **BUILD PARSER**: Arnold Machinery is fully image-based - zero extractable text, requires full OCR
- [x] Vendor detected: "Arnold Machinery"
- [x] Invoice Total: $235.60
- [x] Unit/Asset: FL #01
- [x] Extract all available fields via OCR
- [x] Itemized parts extracted
- [x] Mileage/Hours if present
- [x] Graceful handling of OCR confidence issues

---

## Section 3: Known Bugs and Data Quality Issues

These were found during review and must be fixed before module release:

### 3.1 Parser Accuracy Fixes
- [x] **NAPA parser broken**: Excel shows $12.00 total but filename says $116.90. The regex `(\S+)\s+\w+\s+(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)` is too aggressive and misses most line items. Rewrite parser.
- [x] **Colorado Truck Repair total mismatch**: Excel shows $384.40 in Invoice Total but filename says $2,682.69 and parts ($1,168.16) + labor ($1,320.00) + supplies ($105.60) + tax ($88.93) = $2,682.69. The `grand_total` regex is likely matching a subtotal. Fix regex.
- [x] **PSC Custom parts/labor both $0**: Parser extracts $1,817.99 total but can't separate parts vs. labor. The PSC invoice format has "Total Parts" and "Total Labor" lines that need specific regex patterns.
- [x] **MHC Kenworth date extraction**: Returns None in Excel. The date regex pattern needs fixing for the MHC format.
- [x] **extract_invoice.py hardcoded**: The main `extract_invoice()` function only handles Colorado Truck Repair format. It should delegate to `vendor_parsers.parse_invoice()` for all vendors.

### 3.2 Missing Vendor Parsers
- [x] **Bruckners parser**: Scanned PDF with minimal extractable text. Needs OCR-based extraction via pytesseract. Add to `detect_vendor()` and create `parse_bruckners()`.
- [x] **Arnold Machinery parser**: Fully image-based PDF (zero words). Needs full OCR pipeline. Add to `detect_vendor()` and create `parse_arnold_machinery()`.

### 3.3 Schema Alignment
- [x] Ensure all parsers return the exact same dict keys matching the Excel Invoices sheet columns
- [x] Ensure line items match the Excel Line Items sheet columns
- [x] Add `invoice_number` field (currently extracted but not in output for some vendors)
- [x] Standardize empty values: use `None` or `""` consistently, not a mix

---

## Section 4: SOC2 Compliance Requirements

Reference: `soc2-evidence/policies/` in `website-pipeline-punks-pipelinex-v2`

### 4.1 Data Classification (per DATA_CLASSIFICATION_POLICY.md)
- [x] Invoice data classified as **Confidential** (client business data)
- [x] VINs, plate numbers, customer names classified as **Confidential PII**
- [x] Add `DATA_CLASSIFICATION.md` to module documenting field sensitivity levels
- [x] No PII in log output (mask VINs, plate numbers, customer addresses in any print/log statements)

### 4.2 Access Control (per ACCESS_CONTROL_POLICY.md)
- [x] Module must accept `org_id` parameter for org-scoped operations
- [x] All extracted data must carry `org_id` for downstream storage
- [x] No cross-org data leakage in batch processing (each invoice tagged to its org)
- [x] File paths must not leak org data between tenants

### 4.3 Information Security (per INFORMATION_SECURITY_POLICY.md)
- [x] No sensitive data written to temp files without cleanup
- [x] PDF files processed in memory where possible (pdfplumber already does this)
- [x] Output files written to org-scoped directories only
- [x] No hardcoded credentials or API keys in module code
- [x] Error messages must not expose internal file paths or stack traces to end users

### 4.4 Audit Logging
- [x] Add structured audit logging for every extraction operation:
  - WHO: operator/system identity
  - WHAT: file processed, vendor detected, fields extracted
  - WHEN: ISO timestamp
  - RESULT: success/failure, field count, total extracted
- [x] Log format compatible with pipelinex-v2 audit logger pattern
- [x] No PII in log entries (log invoice ID, vendor, totals - not VINs or customer names)
- [x] Log extraction errors with enough context to debug without exposing sensitive data

### 4.5 Vendor Management
- [x] Document all external dependencies (pdfplumber, pytesseract, openpyxl, etc.)
- [x] Pin dependency versions in requirements.txt
- [x] No external API calls during extraction (all processing is local)
- [x] OCR processing (Tesseract) runs locally, no cloud OCR services

### 4.6 Data Handling
- [x] Input validation: verify file is a valid PDF before processing
- [x] Input validation: file size limits to prevent DoS
- [x] Sanitize extracted text (strip control characters, null bytes)
- [x] Output encoding: UTF-8 for all JSON/Excel output
- [x] No extracted data sent to external LLMs without explicit approval and anonymization

---

## Section 5: Module Packaging for Reuse

### 5.1 Module Structure
- [x] Create `src/invoice_module/` package directory with `__init__.py`
- [x] Move `vendor_parsers.py` and `extract_invoice.py` into `src/invoice_module/`
- [x] Create clean public API: `extract(pdf_path, org_id=None) -> dict`
- [x] Create batch API: `extract_batch(pdf_paths, org_id=None) -> list[dict]`
- [x] Create Excel export API: `to_xlsx(data, output_path) -> str`
- [x] Create fleet-compliance Excel export API: `to_fleet_xlsx(data, output_path) -> str`
- [x] Create JSON export API: `to_json(data) -> str`

### 5.2 Configuration
- [x] Externalize vendor detection keywords to config (not hardcoded)
- [x] Externalize output schema mapping to config
- [x] Support custom field mappings for different target systems
- [x] OCR settings configurable (DPI, language, confidence threshold)

### 5.3 Error Handling
- [x] Define custom exception classes: `InvoiceExtractionError`, `VendorNotFoundError`, `OCRError`
- [x] Every parser wrapped in try/except with structured error reporting
- [x] Partial extraction support: return what you can, flag what failed
- [x] Graceful degradation: if OCR fails, return raw text extraction attempt

### 5.4 Testing Framework
- [x] Create `tests/` directory with pytest structure
- [x] `test_vendor_detection.py`: test vendor auto-detection for all 12 samples
- [x] `test_field_extraction.py`: test each required field per vendor against known values
- [x] `test_total_accuracy.py`: validate grand_total, parts_cost, labor_cost math
- [x] `test_line_items.py`: validate line item count and structure per invoice
- [x] `test_excel_output.py`: validate XLSX output matches reference schema
- [x] `test_soc2_compliance.py`: validate no PII in logs, org_id scoping, input validation
- [x] `test_ocr_fallback.py`: test Bruckners and Arnold Machinery OCR extraction
- [x] Expected values file: `tests/expected_values.json` with ground truth per invoice
- [x] CI-compatible: all tests runnable with `pytest tests/`

### 5.5 Documentation
- [x] Module README.md: what it does, how to install, how to use, supported vendors
- [x] API reference: function signatures, input/output schemas, error codes
- [x] Integration guide for pipelinex-v2: how to import and wire into existing codebase
- [x] Vendor parser development guide: how to add a new vendor parser

### 5.6 Integration Points (pipelinex-v2)
- [x] Compatible with pipelinex-v2 `@tnds/ingest-core` package pattern
- [x] Output schema matches `maintenance_tracker` collection in chief_records
- [x] Fleet compliance export matches `fleet-compliance-bulk-upload-template.xlsx`
- [x] Audit log format matches pipelinex-v2 audit logger
- [x] Can be imported as Python package or called via CLI
- [x] Support for Railway backend deployment (FastAPI endpoint wrapper)

---

## Section 6: Execution Priority

### Phase 1 - Fix What's Broken (Critical)
1. [x] Fix NAPA parser ($116.90 not $12.00)
2. [x] Fix Colorado Truck Repair grand_total regex
3. [x] Fix PSC Custom parts/labor separation
4. [x] Fix MHC Kenworth date extraction
5. [x] Unify extract_invoice.py to use vendor_parsers.parse_invoice()

### Phase 2 - New Vendors (High)
6. [x] Build Bruckners OCR parser
7. [x] Build Arnold Machinery OCR parser
8. [x] Add both to detect_vendor() and parser registry

### Phase 3 - SOC2 Compliance (High)
9. [x] Add audit logging framework
10. [x] Add org_id scoping to all functions
11. [x] Strip PII from all log/print output
12. [x] Add input validation (file type, size, sanitization)
13. [x] Create DATA_CLASSIFICATION.md

### Phase 4 - Module Packaging (Medium)
14. [x] Restructure into importable package
15. [x] Create clean public API
16. [x] Externalize config
17. [x] Pin dependency versions

### Phase 5 - Test Harness (Medium)
18. [x] Create pytest test suite
19. [x] Build expected_values.json from Excel reference
20. [x] Run all 12 invoice tests, validate against expected values
21. [x] Add SOC2 compliance tests

### Phase 6 - Documentation and Integration (Low)
22. [x] Module README and API reference
23. [x] Integration guide for pipelinex-v2
24. [x] Vendor parser development guide

### Phase 7 - Fleet Compliance Template Support (Added 2026-03-26)
25. [x] Map extraction fields to fleet-compliance-bulk-upload-template.xlsx schemas
26. [x] Build `to_fleet_xlsx()` with Invoices (15 cols) + Maintenance Tracker (13 cols) + Line Items (9 cols)
27. [x] Auto-derive Service Type and Category from work descriptions and vendor name
28. [x] Generate Maintenance IDs (VND-YYYYMMDD-NNN format)
29. [x] Preserve backward-compatible `to_xlsx()` export
30. [x] Update module exports and version to 1.1.0
31. [x] Update all documentation (README, TODO, DATA_CLASSIFICATION)
32. [x] Create User Manual (.docx) with TNDS branding

---

## Completion Criteria

This module is ready for integration when:
- [x] All 12 invoice samples parse without errors
- [x] All required fields extract correctly (validated against Excel reference)
- [x] All tests pass in pytest
- [x] SOC2 compliance controls implemented and tested
- [x] Module installable as a Python package
- [x] No PII in any log output
- [x] Audit logging operational for all extraction operations
- [x] Documentation complete

---

**True North Data Strategies LLC**
Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
Fixed scope, fixed price. No open-ended projects. No surprise invoices.
                                                                                                                                                                                                                                                                