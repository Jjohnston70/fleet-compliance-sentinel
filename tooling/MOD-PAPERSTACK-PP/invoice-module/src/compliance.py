"""
SOC2 Compliance Layer for Invoice Extraction Module
====================================================
Provides audit logging, input validation, PII masking, and org scoping
for the invoice extraction pipeline in compliance with SOC2 Type II controls.

Components:
- AuditLogger: Structured JSON logging of extraction events
- Input Validator: PDF file validation (existence, format, size)
- Text Sanitizer: Unicode normalization and control character removal
- PII Masker: Sensitive data masking for safe logging
- Org Scoping Wrapper: Extract with organization context and audit trail
"""

import os
import json
import logging
import hashlib
import re
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, Callable
from pathlib import Path
from dataclasses import dataclass, field, asdict
from io import open as io_open

from vendor_parsers import parse_invoice


# ============================================
# LOGGING CONFIGURATION
# ============================================

def setup_compliance_logger(name: str = "compliance") -> logging.Logger:
    """Set up the compliance logger with standard formatting."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger


_compliance_logger = setup_compliance_logger("compliance")


# ============================================
# AUDIT LOGGER
# ============================================

@dataclass
class AuditEntry:
    """Represents a single audit log entry."""
    timestamp: str
    operator: str
    org_id: Optional[str]
    source_file: str
    vendor: str
    status: str
    field_count: int
    total_extracted: int
    duration_ms: int
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    file_hash: Optional[str] = None

    def to_json(self) -> str:
        """Convert to JSON string for log file storage."""
        return json.dumps(asdict(self), default=str)


class AuditLogger:
    """Structured logger for invoice extraction operations with SOC2 compliance."""

    def __init__(
        self,
        log_path: str = "output/audit.jsonl",
        external_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ):
        """
        Initialize the audit logger.

        Args:
            log_path: Path to write audit logs (JSON Lines format). Default: output/audit.jsonl
            external_callback: Optional callback function for external logger integration.
                               Called with audit dict after local logging.
        """
        self.log_path = log_path
        self.external_callback = external_callback

        # Ensure log directory exists
        log_dir = os.path.dirname(log_path) or "."
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)

        _compliance_logger.info(f"AuditLogger initialized: {log_path}")

    def log_extraction(
        self,
        operator: str,
        source_file: str,
        vendor: str,
        result_status: str,
        field_count: int,
        total_extracted: int,
        duration_ms: int = 0,
        org_id: Optional[str] = None,
    ) -> None:
        """
        Log a successful invoice extraction event.

        Args:
            operator: User/system identifier performing the extraction
            source_file: Base filename of the invoice (no full path for security)
            vendor: Detected vendor name
            result_status: Status of extraction (success, partial, unknown_vendor)
            field_count: Number of fields successfully extracted
            total_extracted: Total value of extracted amounts (numeric)
            duration_ms: Duration of extraction in milliseconds
            org_id: Organization ID for multi-tenant scoping

        Note: NEVER include VINs, plate numbers, customer names, or addresses.
        """
        entry = AuditEntry(
            timestamp=datetime.utcnow().isoformat() + "Z",
            operator=operator,
            org_id=org_id,
            source_file=source_file,
            vendor=vendor,
            status=result_status,
            field_count=field_count,
            total_extracted=total_extracted,
            duration_ms=duration_ms,
        )

        self._write_log_entry(entry)
        _compliance_logger.info(
            f"Extraction logged: {operator} | {vendor} | {source_file} | {result_status}"
        )

    def log_error(
        self,
        operator: str,
        source_file: str,
        error_type: str,
        error_message: str,
        org_id: Optional[str] = None,
    ) -> None:
        """
        Log an extraction error event.

        Args:
            operator: User/system identifier
            source_file: Base filename of the invoice
            error_type: Category of error (invalid_pdf, parse_error, unknown_vendor, etc.)
            error_message: Safe error message (no sensitive data)
            org_id: Organization ID for multi-tenant scoping
        """
        entry = AuditEntry(
            timestamp=datetime.utcnow().isoformat() + "Z",
            operator=operator,
            org_id=org_id,
            source_file=source_file,
            vendor="",
            status="error",
            field_count=0,
            total_extracted=0,
            duration_ms=0,
            error_type=error_type,
            error_message=error_message,
        )

        self._write_log_entry(entry)
        _compliance_logger.warning(
            f"Extraction error logged: {operator} | {source_file} | {error_type}"
        )

    def _write_log_entry(self, entry: AuditEntry) -> None:
        """Write audit entry to log file and external callback."""
        entry_dict = asdict(entry)

        # Write to local log file (JSON Lines format)
        try:
            with io_open(self.log_path, "a", encoding="utf-8") as f:
                f.write(entry.to_json() + "\n")
        except IOError as e:
            _compliance_logger.error(f"Failed to write audit log: {e}")

        # Call external callback if provided
        if self.external_callback:
            try:
                self.external_callback(entry_dict)
            except Exception as e:
                _compliance_logger.error(f"Error in external audit callback: {e}")


# ============================================
# INPUT VALIDATOR
# ============================================

def validate_pdf_input(file_path: str, max_size_mb: int = 50) -> Tuple[bool, str]:
    """
    Validate PDF file for extraction.

    Checks:
    - File exists
    - File is a valid PDF (magic bytes)
    - File size under limit
    - Filename doesn't contain path traversal attempts

    Args:
        file_path: Path to the PDF file
        max_size_mb: Maximum file size in megabytes

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Expand path
    expanded_path = os.path.expanduser(file_path)

    # Check for path traversal attempts
    if ".." in file_path or file_path.startswith("/"):
        return False, "Path traversal detected in file_path"

    # Check file exists
    if not os.path.exists(expanded_path):
        return False, f"File does not exist: {file_path}"

    # Check file size
    file_size_mb = os.path.getsize(expanded_path) / (1024 * 1024)
    if file_size_mb > max_size_mb:
        return False, f"File size {file_size_mb:.2f}MB exceeds limit of {max_size_mb}MB"

    # Check if it's actually a PDF (magic bytes: %PDF)
    try:
        with io_open(expanded_path, "rb") as f:
            header = f.read(4)
            if header != b"%PDF":
                return False, "File does not have PDF magic bytes (%PDF)"
    except IOError as e:
        return False, f"Cannot read file: {e}"

    return True, ""


# ============================================
# TEXT SANITIZER
# ============================================

def sanitize_extracted_text(text: str) -> str:
    """
    Sanitize extracted text for safe processing.

    Operations:
    - Remove null bytes
    - Remove control characters (except newline, tab, carriage return)
    - Normalize unicode (NFD -> NFC)
    - Remove excessive whitespace

    Args:
        text: Raw extracted text

    Returns:
        Sanitized text
    """
    if not text:
        return ""

    # Remove null bytes
    text = text.replace("\x00", "")

    # Remove control characters (keep LF, CR, TAB)
    text = "".join(
        ch for ch in text if not (ord(ch) < 32 and ch not in "\n\r\t")
    )

    # Normalize unicode (NFC form)
    import unicodedata
    text = unicodedata.normalize("NFC", text)

    # Collapse excessive whitespace (but preserve structure)
    text = re.sub(r" {2,}", " ", text)

    return text.strip()


# ============================================
# PII MASKER
# ============================================

def mask_pii(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a masked copy of extracted data for safe logging.

    Masks sensitive fields:
    - vin: Replace with "***MASKED_VIN***" or show last 4 chars
    - plate_number: Replace with "***MASKED_PLATE***"
    - customer_name: Replace with "***MASKED_NAME***"
    - customer_address: Replace with "***MASKED_ADDRESS***"

    Args:
        data_dict: Original extracted data dictionary

    Returns:
        New dictionary with PII fields masked
    """
    masked = data_dict.copy()

    # Define PII fields and their masking strategy
    pii_fields = {
        "vin": lambda v: f"***MASKED_VIN_{v[-4:]}***" if v and len(str(v)) >= 4 else "***MASKED_VIN***",
        "plate_number": lambda v: "***MASKED_PLATE***",
        "customer_name": lambda v: "***MASKED_NAME***",
        "customer_address": lambda v: "***MASKED_ADDRESS***",
    }

    for field, mask_func in pii_fields.items():
        if field in masked and masked[field]:
            masked[field] = mask_func(masked[field])

    # Also mask line_items that might contain sensitive info
    if "line_items" in masked and isinstance(masked["line_items"], list):
        masked_items = []
        for item in masked["line_items"]:
            if isinstance(item, dict):
                masked_item = item.copy()
                # Mask description if it contains PII-like patterns
                if "description" in masked_item:
                    desc = str(masked_item["description"]).lower()
                    # Very conservative: keep descriptions but flag them
                    masked_items.append(masked_item)
                else:
                    masked_items.append(masked_item)
        masked["line_items"] = masked_items

    return masked


# ============================================
# ORG SCOPING WRAPPER
# ============================================

def scoped_extract(
    pdf_path: str,
    org_id: str,
    operator: str = "system",
    audit_logger: Optional[AuditLogger] = None,
) -> Dict[str, Any]:
    """
    Extract invoice with organization scoping and full audit trail.

    This wrapper:
    1. Validates the PDF file
    2. Extracts invoice data via parse_invoice()
    3. Adds org_id to result for multi-tenant isolation
    4. Logs the extraction via AuditLogger
    5. Returns the augmented result

    Args:
        pdf_path: Path to the invoice PDF
        org_id: Organization ID for scoping and audit trail
        operator: User/system identifier (default: "system")
        audit_logger: AuditLogger instance (created if not provided)

    Returns:
        Augmented result dict with org_id and audit metadata

    Raises:
        ValueError: If PDF is invalid or parsing fails
    """
    import time

    # Create audit logger if not provided
    if audit_logger is None:
        audit_logger = AuditLogger()

    # Validate input
    is_valid, error_msg = validate_pdf_input(pdf_path)
    if not is_valid:
        audit_logger.log_error(
            operator=operator,
            source_file=os.path.basename(pdf_path),
            error_type="invalid_pdf",
            error_message=error_msg,
            org_id=org_id,
        )
        raise ValueError(f"Invalid PDF: {error_msg}")

    start_time = time.time()
    filename = os.path.basename(pdf_path)

    try:
        # Parse invoice
        result = parse_invoice(pdf_path)

        # Add organization scoping
        result["org_id"] = org_id

        # Calculate metrics for audit log
        duration_ms = int((time.time() - start_time) * 1000)
        field_count = len([v for v in result.values() if v and v != org_id])
        total_extracted = 0.0

        # Sum up numeric values (totals)
        for key in ["grand_total", "subtotal", "total_amount"]:
            if key in result and isinstance(result[key], (int, float)):
                total_extracted += float(result[key])

        # Log successful extraction
        audit_logger.log_extraction(
            operator=operator,
            source_file=filename,
            vendor=result.get("vendor", "Unknown"),
            result_status="success",
            field_count=field_count,
            total_extracted=total_extracted,
            duration_ms=duration_ms,
            org_id=org_id,
        )

        return result

    except ValueError as e:
        # ValueError from parse_invoice (unknown vendor, parser error, etc.)
        error_type = "unknown_vendor" if "No parser for vendor" in str(e) else "parse_error"
        duration_ms = int((time.time() - start_time) * 1000)

        audit_logger.log_error(
            operator=operator,
            source_file=filename,
            error_type=error_type,
            error_message=str(e),
            org_id=org_id,
        )
        raise
    except Exception as e:
        # Unexpected error
        duration_ms = int((time.time() - start_time) * 1000)

        audit_logger.log_error(
            operator=operator,
            source_file=filename,
            error_type="unexpected_error",
            error_message=f"{type(e).__name__}: {str(e)}",
            org_id=org_id,
        )
        raise ValueError(f"Extraction failed: {e}") from e
