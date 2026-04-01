# Invoice Extraction Module

**True North Data Strategies LLC**
Version 1.1.0 | 2026-03-26

Portable invoice extraction module for fleet maintenance PDFs. Detects vendors automatically, parses structured data from text-based and scanned invoices, and outputs to Excel or JSON in standardized schemas.

---

## What This Is

A Python module that takes fleet maintenance invoice PDFs and extracts structured data: vendor, costs, line items, vehicle info, work descriptions. Supports 12 vendors with automatic detection. Includes SOC2-compliant audit logging, PII masking, and org-scoped multi-tenant isolation.

Two Excel export formats are supported:

- **Original format** (`to_xlsx`): Invoices + Line Items sheets matching the `maintenance_import.xlsx` schema (23 + 11 columns)
- **Fleet compliance format** (`to_fleet_xlsx`): Invoices + Maintenance Tracker + Line Items sheets matching the `fleet-compliance-bulk-upload-template.xlsx` schema (15 + 13 + 9 columns)

## Who It's For

Operations teams managing fleet maintenance records across multiple vendors. Built for integration into the pipelinex-v2 platform but portable to any Python project.

## Problems This Removes

- Manual data entry from PDF invoices into spreadsheets
- Inconsistent field extraction across vendor formats
- No audit trail on who processed what invoice and when
- PII exposure in logs (VINs, plate numbers, customer names)
- Vendor lock-in to a single invoice format
- Service type and category classification done by hand

---

## Installation

```bash
# From the PaperStack project root
pip install -r requirements.txt

# External tools (required for OCR vendors only)
# Poppler: https://github.com/oschwartz10612/poppler-windows/releases
# Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| pdfplumber | >=0.11.9 | PDF text and table extraction |
| pytesseract | >=0.3.13 | OCR for scanned invoices |
| openpyxl | >=3.1.5 | Excel export |
| pdf2image | >=1.17.0 | PDF page rendering for OCR |
| Pillow | >=12.1.1 | Image processing |
| pytest | >=9.0.0 | Test framework |

External: Poppler (pdftoppm), Tesseract OCR (for Bruckners and Arnold Machinery only).

---

## Quick Start

### Single Invoice

```python
from invoice_module import extract

result = extract("invoices/MHC 83.22 Lubes #571.pdf")
print(result["vendor"])       # "MHC Kenworth"
print(result["grand_total"])  # 83.22
print(len(result["line_items"]))  # 1
```

### Batch Processing (Original Format)

```python
from invoice_module import extract_batch, to_xlsx
import glob

pdfs = glob.glob("invoices/*.pdf")
results = extract_batch(pdfs, org_id="org_acme_fleet")
to_xlsx(results, "output/maintenance_import.xlsx")
```

### Batch Processing (Fleet Compliance Format)

```python
from invoice_module import extract_batch, to_fleet_xlsx
import glob

pdfs = glob.glob("invoices/*.pdf")
results = extract_batch(pdfs)
to_fleet_xlsx(results, "output/fleet_invoice_export.xlsx")
# Produces: Invoices (15 cols) + Maintenance Tracker (13 cols) + Line Items (9 cols)
```

### JSON Output

```python
from invoice_module import extract, to_json

result = extract("invoices/Purcell 2,521.68 Lubes #544.pdf")
print(to_json(result))
```

### SOC2-Compliant Extraction (with audit logging)

```python
from compliance import scoped_extract, AuditLogger

logger = AuditLogger(log_path="output/audit.jsonl")
result = scoped_extract(
    pdf_path="invoices/CTR invoice.pdf",
    org_id="org_acme_fleet",
    operator="jacob@truenorthstrategyops.com",
    audit_logger=logger,
)
# Audit entry written to output/audit.jsonl
```

---

## API Reference

### `extract(pdf_path, org_id=None, operator="system") -> dict`

Extract structured data from a single invoice PDF.

**Args:**
- `pdf_path` (str): Path to invoice PDF file
- `org_id` (str, optional): Organization ID for multi-tenant scoping
- `operator` (str, optional): Operator identifier for audit trail

**Returns:** dict with standardized invoice fields (see Output Schema below)

**Raises:**
- `FileNotFoundError` if PDF does not exist
- `ValueError` if PDF cannot be parsed

### `extract_batch(pdf_paths, org_id=None, operator="system") -> list[dict]`

Extract from multiple PDFs. Errors are collected but don't stop processing.

**Args:**
- `pdf_paths` (list): List of PDF file paths
- `org_id` (str, optional): Organization ID
- `operator` (str, optional): Operator identifier

**Returns:** list of result dicts, one per successfully parsed invoice

**Raises:** `ValueError` if zero PDFs parse successfully

### `to_xlsx(data_list, output_path) -> str`

Export extracted data to the original `maintenance_import.xlsx` format with two sheets.

**Args:**
- `data_list` (list): List of invoice data dicts
- `output_path` (str): Output file path

**Returns:** Path to created Excel file

**Sheets produced:**
- **Invoices**: 23 columns (Invoice ID, Completed Date, Vendor, PO Number, Unit Number, Asset Name, Year, Make, Model, Plate Number, VIN, Engine, Mileage Hours, Written By, Parts Cost, Labor Cost, Shop Supplies, Sales Tax, Invoice Total, Line Item Count, Work Requested, Work Completed, Source File)
- **Line Items**: 11 columns (Line Item ID, Invoice ID, Invoice Date, Vendor, Unit Number, Asset Name, VIN, Item Qty, Item Description, Unit Price, Line Amount)

### `to_fleet_xlsx(data_list, output_path) -> str`

Export to the `fleet-compliance-bulk-upload-template.xlsx` format with three sheets.

**Args:**
- `data_list` (list): List of invoice data dicts
- `output_path` (str): Output file path

**Returns:** Path to created Excel file

**Sheets produced:**
- **Invoices**: 15 columns (Vendor, Invoice Number, Invoice Date, Due Date, Total Amount, Parts Cost, Labor Cost, Shop Supplies, Sales Tax, Category, Asset ID, Service Type, Status, PO Number, Notes)
- **Maintenance Tracker**: 13 columns (Maintenance ID, Asset ID, Asset Name, Service Type, Scheduled Date, Completed Date, Status, Parts Cost, Labor Cost, Total Cost, Vendor, Invoice Number, Notes)
- **Line Items**: 9 columns (Line Item ID, Invoice Number, Vendor, Asset ID, Qty, Part Number, Description, Unit Price, Line Amount)

**Auto-derived fields:**
- Category derived from work descriptions (Compliance, Preventive Maintenance, Tires & Wheels, Towing, Body & Glass, Drivetrain, Brakes & Suspension, Engine, Electrical, HVAC, Parts, Repair)
- Service Type derived from work descriptions and vendor name (DOT Inspection, Lube / PM, Tires, Towing / Recovery, Glass Repair, Transmission, Brakes, Engine Repair, Electrical, HVAC / Cooling, Parts Purchase, General Repair)
- Maintenance ID generated as VND-YYYYMMDD-NNN
- Status defaults to "Completed" for extracted invoices

### `to_json(data, indent=2) -> str`

Serialize extracted data to JSON string.

### `scoped_extract(pdf_path, org_id, operator, audit_logger) -> dict`

SOC2-compliant wrapper. Validates PDF, extracts, tags with org_id, logs audit entry.

Located in `compliance.py`. See SOC2 Compliance section below.

---

## Output Schema

Every extraction returns a dict with these fields:

| Field | Type | Example |
|-------|------|---------|
| vendor | str | "MHC Kenworth" |
| invoice_number | str | "CSKS0132267" |
| invoice_date | str | "2025-05-07" (ISO format) |
| po_number | str | "844" |
| unit_number | str | "7119" |
| year | str | "2019" |
| make | str | "HINO" |
| model | str | "338-07" |
| vin | str | "1SAMPLE00000000003" |
| plate_number | str | "DGE-451" |
| engine | str | "PX9" |
| mileage_hours | str | "157126/6434.0" |
| grand_total | float | 83.22 |
| parts_total | float | 6.53 |
| labor_total | float | 68.47 |
| shop_supplies | float | 8.22 |
| sales_tax | float | 0.0 |
| line_items | list[dict] | See below |
| work_descriptions | list[dict] | See below |
| source_file | str | "MHC 83.22 Lubes #571.pdf" |

### Line Item Schema

| Field | Type | Example |
|-------|------|---------|
| qty | float | 1.0 |
| description | str | "OIL FILTER" |
| unit_price | float | 6.53 |
| amount | float | 6.53 |
| part_number | str | "LF16354" |

### Work Description Schema

| Field | Type | Example |
|-------|------|---------|
| work_type | str | "complaint" or "correction" |
| work_text | str | "DOT inspection and trans leak repair" |

---

## Supported Vendors

| Vendor | Type | Parser | Service Type Auto-Detection |
|--------|------|--------|---------------------------|
| Bosselman | Text PDF | `parse_bosselman` | General Repair |
| Colorado Truck Repair | Text PDF | `parse_colorado_truck_repair` | Lube / PM |
| MHC Kenworth | Text PDF | `parse_mhc_kenworth` | DOT Inspection |
| NAPA | Text PDF (table grid) | `parse_napa` | Parts Purchase |
| PSC Custom | Text PDF | `parse_psc_custom` | DOT Inspection |
| Purcell Tire | Text PDF | `parse_purcell_tire` | Tires |
| Randy's Towing | Text PDF | `parse_randys_towing` | Towing / Recovery |
| Rush Truck Centers | Text PDF | `parse_rush_truck_centers` | General Repair |
| Service Auto Glass | Text PDF | `parse_service_auto_glass` | Glass Repair |
| Southern Tire Mart | Text PDF | `parse_southern_tire_mart` | Tires |
| Bruckners | Scanned PDF (OCR) | `parse_bruckners` | General Repair |
| Arnold Machinery | Image PDF (OCR) | `parse_arnold_machinery` | General Repair |

---

## Adding a New Vendor Parser

1. Open `src/vendor_parsers.py`

2. Add detection keywords to `detect_vendor()`:
```python
if "new vendor name" in text_lower or "new vendor" in text_lower:
    return "New Vendor Name"
```

3. Create the parser function:
```python
def parse_new_vendor(pdf):
    """Parse New Vendor invoice format."""
    result = {
        "vendor": "New Vendor Name",
        "invoice_number": "",
        "invoice_date": "",
        # ... all schema fields
        "line_items": [],
        "work_descriptions": [],
        "source_file": os.path.basename(pdf.stream.name),
    }
    text = pdf.pages[0].extract_text() or ""
    # ... regex and table extraction logic
    return result
```

4. Register in `parse_invoice()`:
```python
parsers = {
    # ... existing entries
    "New Vendor Name": parse_new_vendor,
}
```

5. Add a test case in `tests/expected_values.json` and `tests/test_invoice_extraction.py`.

6. Run tests: `pytest tests/ -v`

---

## SOC2 Compliance

The module implements controls aligned with SOC2 Type II requirements. Reference policies in `soc2-evidence/policies/` of pipelinex-v2.

### Data Classification (DATA_CLASSIFICATION.md)

- **PUBLIC**: vendor name, invoice_date, source_file
- **CONFIDENTIAL**: costs, totals, unit numbers, work descriptions, line items, category, service_type
- **RESTRICTED PII**: VIN, plate_number, customer_name, customer_address

### Audit Logging

Every extraction writes a structured JSON entry to `output/audit.jsonl`:
```json
{
  "timestamp": "2026-03-26T14:30:00.000Z",
  "operator": "jacob@truenorthstrategyops.com",
  "org_id": "org_acme_fleet",
  "source_file": "MHC 83.22 Lubes #571.pdf",
  "vendor": "MHC Kenworth",
  "status": "success",
  "field_count": 14,
  "total_extracted": 83.22,
  "duration_ms": 245
}
```

No PII (VINs, plate numbers, names, addresses) ever appears in log output.

### PII Masking

```python
from compliance import mask_pii

safe_data = mask_pii(result)
# safe_data["vin"] == "***MASKED_VIN_8771***"
# safe_data["plate_number"] == "***MASKED_PLATE***"
```

### Input Validation

```python
from compliance import validate_pdf_input

is_valid, error = validate_pdf_input("invoice.pdf", max_size_mb=50)
# Checks: file exists, PDF magic bytes, size limit, path traversal
```

### Org Scoping

All extracted data carries `org_id` for multi-tenant isolation. The `scoped_extract()` wrapper enforces this automatically.

---

## Excel Export Comparison

| Feature | `to_xlsx()` | `to_fleet_xlsx()` |
|---------|------------|-------------------|
| Target schema | maintenance_import.xlsx | fleet-compliance-bulk-upload-template.xlsx |
| Invoices sheet | 23 columns | 15 columns |
| Line Items sheet | 11 columns | 9 columns |
| Maintenance Tracker | No | Yes (13 columns) |
| Service Type auto-detect | No | Yes |
| Category auto-detect | No | Yes |
| Maintenance ID generation | No | Yes (VND-YYYYMMDD-NNN) |
| TNDS branding | Navy headers | Navy headers + Teal accent |

---

## Integration with pipelinex-v2

### Import as Python Package

```python
import sys
sys.path.insert(0, "path/to/PaperStack/src")
from invoice_module import extract, extract_batch, to_xlsx, to_fleet_xlsx
```

### Output Compatibility

- Original Excel output matches `maintenance_tracker` collection schema in `chief_records`
- Fleet compliance output matches the bulk upload template for fleet management systems
- Audit log format is compatible with pipelinex-v2 audit logger pattern
- JSON output can be pushed directly to the Railway backend via `extract_invoice.push_to_api()`

### CLI Usage

```bash
# Single invoice
python src/extract_invoice.py "invoice-samples/MHC 83.22 Lubes #571.pdf"

# Batch (all PDFs in a directory)
python src/extract_invoice.py invoice-samples/ --format xlsx --output output/batch.xlsx
```

---

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test categories
pytest tests/test_invoice_extraction.py -k "vendor_detection" -v
pytest tests/test_invoice_extraction.py -k "field_extraction" -v
pytest tests/test_invoice_extraction.py -k "line_items" -v
pytest tests/test_invoice_extraction.py -k "pii_masking" -v
```

### Test Coverage

- 24 tests covering vendor detection, field extraction, line item counts, total accuracy, date formats, and PII masking
- Expected values defined in `tests/expected_values.json`
- All 12 sample invoices tested (10 text-based, 2 OCR with graceful degradation)

---

## Project Structure

```
src/
  vendor_parsers.py        # Core parser engine (12 vendor parsers)
  extract_invoice.py       # CLI wrapper and legacy API
  compliance.py            # SOC2 audit logging, PII masking, validation
  DATA_CLASSIFICATION.md   # Data sensitivity classification
  invoice_module/
    __init__.py            # Public API exports (v1.1.0)
    api.py                 # extract(), extract_batch(), to_xlsx(), to_fleet_xlsx(), to_json()
    README.md              # This file
tests/
  conftest.py              # pytest fixtures
  expected_values.json     # Ground truth for validation
  test_invoice_extraction.py  # 24 test cases
invoice-samples/           # 12 sample PDFs for testing
output/                    # Generated exports and audit logs
requirements.txt           # Pinned dependencies
TODO.md                    # Project task tracker (all phases complete)
```

---

## Changelog

### v1.1.0 (2026-03-26)
- Added `to_fleet_xlsx()` for fleet-compliance-bulk-upload-template format
- Added auto-derived Service Type and Category fields
- Added Maintenance Tracker sheet generation
- Added Line Items sheet to fleet-compliance export

### v1.0.0 (2026-03-26)
- Initial release with 12 vendor parsers
- Original `to_xlsx()` format (maintenance_import.xlsx schema)
- SOC2 compliance controls (audit logging, PII masking, input validation, org scoping)
- 24 pytest tests passing
- Module packaged for pipelinex-v2 integration

---

**True North Data Strategies LLC**
Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
Fixed scope, fixed price. No open-ended projects. No surprise invoices.
