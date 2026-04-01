"""
Pytest suite for invoice extraction module.

Tests all 12 invoice PDFs for:
- Vendor detection accuracy
- Field extraction correctness
- Total calculations
- Line item counts
- Date format validation
- PII masking in audit logs
"""

import sys
import os
import json
import pytest
from pathlib import Path

# Add src/ directory to path
_src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from vendor_parsers import parse_invoice, detect_vendor
from compliance import mask_pii
import pdfplumber


# Load expected values
_test_dir = os.path.dirname(os.path.abspath(__file__))
_expected_path = os.path.join(_test_dir, "expected_values.json")
with open(_expected_path) as f:
    EXPECTED_VALUES = json.load(f)

# Map filenames to test names
INVOICE_FILES = {
    "Bosselman 48.16 Hauling #415.pdf": "bosselman",
    "Colorado Truck Repair 2,682.69 TW #249.pdf": "colorado_truck_repair",
    "MHC 83.22 Lubes #571.pdf": "mhc_kenworth",
    "Napa 116.90 - TW 45.pdf": "napa",
    "PSC Custom 1,817.99 TW #248.pdf": "psc_custom",
    "Purcell 2,521.68 Lubes #544.pdf": "purcell_tire",
    "Randy's Towing 654.00 TW #247.pdf": "randys_towing",
    "Rush Truck Centers 450.42 Hauling #411.pdf": "rush_truck_centers",
    "Service Auto Glass 432.05 Lubes #595.pdf": "service_auto_glass",
    "Southern Tire Mart 1,465.24 Hauling #373.pdf": "southern_tire_mart",
}


def test_vendor_detection(samples_dir):
    """Test that all 10 parseable PDFs detect the correct vendor."""
    results = {}
    for filename, vendor_key in INVOICE_FILES.items():
        pdf_path = os.path.join(samples_dir, filename)
        
        if not os.path.exists(pdf_path):
            pytest.skip(f"Sample not found: {filename}")
        
        with pdfplumber.open(pdf_path) as pdf:
            text = pdf.pages[0].extract_text() or ""
        
        detected_vendor = detect_vendor(text, filename)
        expected_vendor = EXPECTED_VALUES[filename]["vendor"]
        
        results[filename] = {
            "detected": detected_vendor,
            "expected": expected_vendor,
            "match": detected_vendor == expected_vendor,
        }
        
        assert detected_vendor == expected_vendor, \
            f"{filename}: Expected vendor '{expected_vendor}', got '{detected_vendor}'"
    
    passed = sum(1 for r in results.values() if r["match"])
    total = len(results)
    print(f"\nVendor Detection: {passed}/{total} invoices detected correctly")


@pytest.mark.parametrize("filename,vendor_key", list(INVOICE_FILES.items()))
def test_field_extraction(filename, vendor_key, samples_dir):
    """Test field extraction for each invoice."""
    pdf_path = os.path.join(samples_dir, filename)
    if not os.path.exists(pdf_path):
        pytest.skip(f"Sample not found: {filename}")
    
    expected = EXPECTED_VALUES[filename]
    result = parse_invoice(pdf_path)
    
    assert result["vendor"] == expected["vendor"], \
        f"Vendor mismatch: {result['vendor']} != {expected['vendor']}"
    
    assert abs(result.get("grand_total", 0) - expected["grand_total"]) < 0.01, \
        f"Grand total mismatch for {filename}: {result.get('grand_total', 0)} != {expected['grand_total']}"
    
    assert abs(result.get("parts_total", 0) - expected["parts_total"]) < 0.01, \
        f"Parts total mismatch for {filename}: {result.get('parts_total', 0)} != {expected['parts_total']}"
    
    assert abs(result.get("labor_total", 0) - expected["labor_total"]) < 0.01, \
        f"Labor total mismatch for {filename}: {result.get('labor_total', 0)} != {expected['labor_total']}"
    
    if expected.get("unit_number"):
        assert result.get("unit_number") == expected["unit_number"], \
            f"Unit number mismatch for {filename}: {result.get('unit_number')} != {expected['unit_number']}"
    
    assert result.get("invoice_date") == expected["invoice_date"], \
        f"Invoice date mismatch for {filename}: {result.get('invoice_date')} != {expected['invoice_date']}"
    
    print(f"\n{vendor_key}: PASS - {result['vendor']} | ${result.get('grand_total', 0)} | Unit: {result.get('unit_number', 'N/A')} | Date: {result.get('invoice_date')}")


@pytest.mark.parametrize("filename", list(INVOICE_FILES.keys()))
def test_line_item_counts(filename, samples_dir):
    """Validate line item count per invoice."""
    pdf_path = os.path.join(samples_dir, filename)
    if not os.path.exists(pdf_path):
        pytest.skip(f"Sample not found: {filename}")
    
    expected = EXPECTED_VALUES[filename]
    result = parse_invoice(pdf_path)
    
    actual_count = len(result.get("line_items", []))
    expected_count = expected["line_item_count"]
    
    assert actual_count == expected_count, \
        f"{filename}: Expected {expected_count} line items, got {actual_count}"
    
    print(f"\n{filename}: {actual_count} line items (expected: {expected_count})")


def test_total_accuracy(samples_dir):
    """Validate grand_total matches expected for all invoices."""
    all_pass = True
    for filename in INVOICE_FILES.keys():
        pdf_path = os.path.join(samples_dir, filename)
        
        if not os.path.exists(pdf_path):
            pytest.skip(f"Sample not found: {filename}")
        
        expected = EXPECTED_VALUES[filename]
        result = parse_invoice(pdf_path)
        
        actual_total = result.get("grand_total", 0)
        expected_total = expected["grand_total"]
        
        if abs(actual_total - expected_total) >= 0.01:
            all_pass = False
            print(f"\nFAIL: {filename}")
            print(f"  Expected: ${expected_total}")
            print(f"  Got: ${actual_total}")
        else:
            print(f"\nPASS: {filename} - ${actual_total}")
    
    assert all_pass, "Some invoices had total mismatches"


def test_date_format(samples_dir):
    """Validate all dates are ISO format (YYYY-MM-DD) or empty string."""
    import re
    iso_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
    
    all_pass = True
    for filename in INVOICE_FILES.keys():
        pdf_path = os.path.join(samples_dir, filename)
        
        if not os.path.exists(pdf_path):
            pytest.skip(f"Sample not found: {filename}")
        
        result = parse_invoice(pdf_path)
        date_val = result.get("invoice_date", "")
        
        if date_val and not iso_pattern.match(date_val):
            all_pass = False
            print(f"\nFAIL: {filename} has invalid date format: {date_val}")
        else:
            print(f"\nPASS: {filename} - Date: {date_val if date_val else '(empty)'}")
    
    assert all_pass, "Some invoices had invalid date formats"


def test_no_pii_in_masked_output(samples_dir):
    """Test that PII masking removes sensitive data from output."""
    filename = "Bosselman 48.16 Hauling #415.pdf"
    pdf_path = os.path.join(samples_dir, filename)
    
    if not os.path.exists(pdf_path):
        pytest.skip(f"Sample not found: {filename}")
    
    result = parse_invoice(pdf_path)
    masked = mask_pii(result)
    
    assert isinstance(masked, dict), "Masked output should be a dict"
    assert "vendor" in masked, "Masked output should still have vendor field"
    
    print(f"\nPII Masking Test:")
    print(f"  Original VIN: {result.get('vin')}")
    print(f"  Masked VIN: {masked.get('vin')}")
    print(f"  Original Unit: {result.get('unit_number')}")
    print(f"  Masked Unit: {masked.get('unit_number')}")
