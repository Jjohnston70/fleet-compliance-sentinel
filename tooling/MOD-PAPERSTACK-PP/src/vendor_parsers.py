"""
Vendor Invoice Parsers
=======================
Auto-detects vendor from PDF content and extracts structured data.
Each vendor gets its own parser function that returns a standardized dict.

Supported vendors:
  - Colorado Truck Repair (table-based, multi-page)
  - MHC Kenworth (table-based, multi-page)
  - Purcell Tire (table + text hybrid)
  - Southern Tire Mart (table + text hybrid)
  - Rush Truck Centers (table-based)
  - Randy's Towing (simple table)
  - NAPA Auto Parts (many tables)
  - Bosselman (text-only receipt)
  - PSC Custom (text-only)
  - Service Auto Glass (text-only)
  - Bruckners (OCR-based, scanned PDFs)
  - Arnold Machinery (OCR-based, scanned PDFs)
"""

import re
import os
import pdfplumber


def detect_vendor(text, filename=""):
    """Detect vendor from PDF text content or filename."""
    text_lower = text.lower()
    fname_lower = filename.lower()

    checks = [
        ("Colorado Truck Repair", ["colorado truck repair"]),
        ("MHC Kenworth", ["mhc kenworth", "mhc250ro"]),
        ("Purcell Tire", ["purcell tire"]),
        ("Southern Tire Mart", ["southern tire mart"]),
        ("Rush Truck Centers", ["rush truck center"]),
        ("Randy's Towing", ["randy's high country", "randy's towing", "randys"]),
        ("NAPA", ["napa auto parts"]),
        ("Bosselman", ["bosselman"]),
        ("PSC Custom", ["psc custom", "521s"]),
        ("Service Auto Glass", ["service auto glass", "pro glass"]),
        ("Bruckners", ["bruckner", "bruckners", "corporate billing llc"]),
        ("Arnold Machinery", ["arnold machinery", "arnold"]),
    ]

    for vendor, keywords in checks:
        for kw in keywords:
            if kw in text_lower or kw in fname_lower:
                return vendor

    return "Unknown"


def _safe_float(val):
    """Convert string to float, return 0 on failure."""
    if not val:
        return 0.0
    try:
        return float(str(val).replace(",", "").replace("$", "").strip())
    except (ValueError, TypeError):
        return 0.0


def _find_in_text(text, pattern):
    """Search for a regex pattern and return first group or None."""
    m = re.search(pattern, text, re.IGNORECASE)
    return m.group(1).strip() if m else ""


# ============================================
# COLORADO TRUCK REPAIR
# ============================================
def parse_colorado_truck_repair(pdf):
    text = pdf.pages[0].extract_text() or ""
    table1 = pdf.pages[0].extract_tables()[0]

    header = table1[1]
    unit_row = table1[2]

    date_open = _find_in_text(text, r'Date Open\s+(\d+/\d+/\d+)')
    iso_date = ""
    if date_open:
        parts = date_open.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    result = {
        "vendor": "Colorado Truck Repair",
        "invoice_date": iso_date,
        "po_number": (header[7] or "").replace("Customer Po #\n", ""),
        "written_by": (header[0] or "").replace("Written By\n", ""),
        "unit_number": (unit_row[0] or "").replace("Unit #\n", ""),
        "plate_number": (unit_row[2] or "").replace("Plate #\n", ""),
        "year": (unit_row[4] or "").replace("Year\n", ""),
        "make": (unit_row[5] or "").replace("Make\n", ""),
        "model": (unit_row[8] or "").replace("Model\n", ""),
        "vin": (unit_row[11] or "").replace("VIN\n", ""),
        "engine": (unit_row[15] or "").replace("Engine\n", ""),
        "mileage_hours": (unit_row[9] or "").replace("Mileage/Hrs\n", ""),
        "line_items": [],
        "work_descriptions": [],
    }

    # Parse all pages
    for pi, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables: continue
        table = tables[0]
        for row_idx, row in enumerate(table):
            if row_idx < 4: continue
            qty_cell = row[0] or ""
            desc_cell = row[1] or ""
            price_cell = (row[13] if len(row) > 13 else "") or ""
            amount_cell = (row[14] if len(row) > 14 else "") or ""

            if not qty_cell and not desc_cell: continue

            if "Work Requested" in desc_cell or "Work Completed" in desc_cell:
                result["work_descriptions"].append({"page": pi+1, "work_text": desc_cell.strip()})

            qty_lines = [q.strip() for q in qty_cell.split("\n") if q.strip()]
            price_lines = [p.strip() for p in price_cell.split("\n") if p.strip() and p.strip() != "SubTotal"]
            amount_lines = [a.strip() for a in amount_cell.split("\n") if a.strip()]

            # Extract part names (skip work description text)
            desc_lines = desc_cell.split("\n")
            part_names = []
            in_work = False
            for line in desc_lines:
                line = line.strip()
                if not line: continue
                if line.startswith("Work Requested") or line.startswith("Work Completed"):
                    in_work = True
                elif in_work and re.match(r'^[A-Z][A-Z\s\d\-\"/\.\']+$', line) and len(line) < 60:
                    in_work = False
                    part_names.append(line)
                elif not in_work:
                    part_names.append(line)

            if qty_lines and price_lines:
                for i, qty in enumerate(qty_lines):
                    result["line_items"].append({
                        "page": pi+1,
                        "qty": _safe_float(qty),
                        "description": part_names[i] if i < len(part_names) else "",
                        "unit_price": _safe_float(price_lines[i]) if i < len(price_lines) else 0,
                        "amount": _safe_float(amount_lines[i]) if i < len(amount_lines) else 0,
                    })

    # Totals from last page
    # CTR invoices have totals in the disclaimer block:
    #   Parts........ 1168.16
    #   Labor........ 1320.00
    #   Shop Supplies 105.60
    #   Sub Total 2593.76
    #   Sales Tax.... 88.93
    #   TOTAL 2682.69
    last_text = pdf.pages[-1].extract_text() or ""
    result["parts_total"] = _safe_float(_find_in_text(last_text, r'Parts\.+\s*([\d,]+\.?\d*)'))
    result["labor_total"] = _safe_float(_find_in_text(last_text, r'Labor\.+\s*([\d,]+\.?\d*)'))
    result["shop_supplies"] = _safe_float(_find_in_text(last_text, r'Shop Supplies\s+([\d,]+\.?\d*)'))
    result["subtotal"] = _safe_float(_find_in_text(last_text, r'Sub Total\s+([\d,]+\.?\d*)'))
    result["sales_tax"] = _safe_float(_find_in_text(last_text, r'Sales Tax\.+\s*([\d,]+\.?\d*)'))
    # Match "TOTAL 2682.69" — exclude "Sub Total" and "SubTotal" matches
    # CTR format: "Authorized By ____ TOTAL 2682.69" (on same line as other text)
    result["grand_total"] = _safe_float(_find_in_text(last_text, r'(?<![Ss]ub\s)(?<![Ss]ub)TOTAL\s+([\d,]+\.?\d*)'))

    return result


# ============================================
# MHC KENWORTH
# ============================================
def parse_mhc(pdf):
    text = pdf.pages[0].extract_text() or ""
    tables0 = pdf.pages[0].extract_tables() or []

    invoice_num = _find_in_text(text, r'Invoice Number:\s*(\S+)')

    # MHC dates are in table 1, row 1: [Tax Status, ..., Terms, ..., P.O.#, ..., Service Date, Invoice Date]
    # Table 1 structure: headers in row 0, values in row 1
    service_date = ""
    invoice_date = ""
    po_number = ""

    if len(tables0) >= 2:
        date_table = tables0[1]
        if len(date_table) >= 2:
            val_row = date_table[1]
            # Service Date and Invoice Date are typically the last two columns
            for ci, cell in enumerate(val_row):
                cell_str = str(cell or "").strip()
                # Check if it looks like a date (M/D/YYYY or MM/DD/YYYY)
                if re.match(r'^\d{1,2}/\d{1,2}/\d{4}$', cell_str):
                    if not service_date:
                        service_date = cell_str
                    else:
                        invoice_date = cell_str
            # P.O.# is usually in the middle of the row
            for ci, cell in enumerate(date_table[1]):
                cell_str = str(cell or "").strip()
                if cell_str and not re.match(r'^\d{1,2}/\d{1,2}/\d{4}$', cell_str) and cell_str not in ("RES", "CHARGE", ""):
                    if re.match(r'^\d+$', cell_str):
                        po_number = cell_str

    # Fallback: try text-based extraction
    if not service_date:
        service_date = _find_in_text(text, r'Service Date\s+(\d{1,2}/\d{1,2}/\d{4})')
    if not invoice_date:
        invoice_date = _find_in_text(text, r'Invoice Date\s+(\d{1,2}/\d{1,2}/\d{4})')
    if not po_number:
        po_number = _find_in_text(text, r'P\.O\.#\s+(\d+)')

    # Parse date — prefer service date (when work was done)
    iso_date = ""
    date_str = service_date or invoice_date
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    # Vehicle info from table 2 (Serial/Unit/Make/Year/License/Mileage)
    unit = vin = make_model = year = mileage = ""
    if len(tables0) >= 3:
        veh_table = tables0[2]
        if len(veh_table) >= 2:
            veh_row = veh_table[1]
            vin = veh_row[0] or ""
            unit = veh_row[1] or ""
            make_model = veh_row[2] or ""
            year = veh_row[3] or ""
            mileage = veh_row[5] if len(veh_row) > 5 else ""

    # Parse work descriptions and parts from text
    all_text = "\n".join([p.extract_text() or "" for p in pdf.pages])
    work_descs = re.findall(r'(?:COMPLAINT|CORRECTION):\s*(.*?)(?=(?:COMPLAINT|CORRECTION|Labor Total|Parts Total|$))', all_text, re.DOTALL)

    # Parts from text lines matching pattern: PARTNUM DESCRIPTION QTY PRICE AMOUNT
    line_items = []
    part_lines = re.findall(r'(\S+)\s+(.+?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)', all_text)
    for part_num, desc, qty, price, amount in part_lines:
        if desc.strip() and not desc.startswith("COMPLAINT") and not desc.startswith("CORRECTION"):
            line_items.append({
                "page": 1, "qty": _safe_float(qty),
                "description": f"{part_num} {desc.strip()}",
                "unit_price": _safe_float(price), "amount": _safe_float(amount),
            })

    # Totals from last page — MHC summary page has:
    #   Labor Total 68.47
    #   Parts Total 6.53
    #   Shop Supplies 8.22
    #   TOTAL DUE 83.22
    last_text = pdf.pages[-1].extract_text() or ""
    # Also check all pages for totals (sometimes summary is mid-document)
    all_text_totals = "\n".join([p.extract_text() or "" for p in pdf.pages])
    labor = _safe_float(_find_in_text(all_text_totals, r'Labor Total\s+(?:--\s*)?([\d,.]+)'))
    parts = _safe_float(_find_in_text(all_text_totals, r'Parts Total\s+(?:--\s*)?([\d,.]+)'))
    supplies = _safe_float(_find_in_text(all_text_totals, r'Shop Supplies\s+([\d,.]+)'))
    total_due = _safe_float(_find_in_text(last_text, r'TOTAL DUE\s+([\d,.]+)'))

    make = model = ""
    if "/" in make_model:
        make, model = make_model.split("/", 1)

    grand = total_due if total_due else (labor + parts + supplies)

    return {
        "vendor": "MHC Kenworth",
        "invoice_date": iso_date,
        "po_number": po_number,
        "written_by": "",
        "unit_number": unit,
        "plate_number": "",
        "year": year,
        "make": make.strip(),
        "model": model.strip(),
        "vin": vin,
        "engine": "",
        "mileage_hours": str(mileage),
        "parts_total": parts,
        "labor_total": labor,
        "shop_supplies": supplies,
        "subtotal": labor + parts + supplies,
        "sales_tax": 0,
        "grand_total": grand,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": d.strip()} for d in work_descs if d.strip()],
    }


# ============================================
# PURCELL TIRE / SOUTHERN TIRE MART
# (Same format — Purcell/Southern share a system)
# ============================================
def parse_tire_vendor(pdf, vendor_name):
    text = pdf.pages[0].extract_text() or ""

    invoice_num = _find_in_text(text, r'INVOICE #\s*(\S+)')
    invoice_date = _find_in_text(text, r'INVOICE DATE:\s*(\S+)')
    po_number = _find_in_text(text, r'PO NUMBER:\s*(.+?)(?:\n|$)')

    iso_date = ""
    if invoice_date:
        parts = invoice_date.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    # Vehicle info
    vehicle_match = re.search(r'VEHICLE:\s*(\d{4})\s+(\w+)\s+(.+?)(?:\n|$)', text)
    year = vehicle_match.group(1) if vehicle_match else ""
    make = vehicle_match.group(2) if vehicle_match else ""
    model = vehicle_match.group(3).strip() if vehicle_match else ""

    license_plate = _find_in_text(text, r'LICENSE:\s*(\S+)')
    mileage = _find_in_text(text, r'MILEAGE:\s*(\S+)')
    vin = _find_in_text(text, r'VIN:\s*(\S+)')
    fleet_id = _find_in_text(text, r'Fleet ID\s*(\S+)')
    unit = fleet_id or _find_in_text(text, r'TRK#(\S+)')

    # Line items from table text
    line_items = []
    tables = pdf.pages[0].extract_tables() or []
    for table in tables:
        for row in table:
            cell = row[0] if row else ""
            if not cell or "PRODUCT" in str(cell): continue
            lines = str(cell).split("\n")
            for line in lines:
                # Match: DESCRIPTION QTY PRICE AMOUNT
                m = re.match(r'(.+?)\s+(\d+\.?\d*)\s+([\d.]+)\s+([\d.]+)$', line.strip())
                if m:
                    desc, qty, price, amount = m.groups()
                    # Skip summary lines
                    if any(skip in desc.upper() for skip in ["MERCHANDISE", "LABOR", "F.E.T.", "SALES TAX", "INVOICE TOTAL", "ON ACCOUNT", "CHARGE ACCOUNT"]):
                        continue
                    line_items.append({
                        "page": 1, "qty": _safe_float(qty),
                        "description": desc.strip(),
                        "unit_price": _safe_float(price), "amount": _safe_float(amount),
                    })

    # Totals
    merch = _safe_float(_find_in_text(text, r'MERCHANDISE:\s*([\d,.]+)'))
    labor = _safe_float(_find_in_text(text, r'LABOR:\s*([\d,.]+)'))
    tax = _safe_float(_find_in_text(text, r'SALES TAX:\s*([\d,.]+)'))
    total = _safe_float(_find_in_text(text, r'INVOICE TOTAL:\s*([\d,.]+)'))

    # Work description
    work_text = _find_in_text(text, r'(REPLACED.*?(?:MILE-\d+|$))')

    return {
        "vendor": vendor_name,
        "invoice_date": iso_date,
        "po_number": po_number.strip(),
        "written_by": "",
        "unit_number": unit,
        "plate_number": license_plate,
        "year": year, "make": make, "model": model,
        "vin": vin, "engine": "",
        "mileage_hours": mileage,
        "parts_total": merch, "labor_total": labor,
        "shop_supplies": 0, "subtotal": total - tax,
        "sales_tax": tax, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": work_text}] if work_text else [],
    }


# ============================================
# RUSH TRUCK CENTERS
# ============================================
def parse_rush(pdf):
    text = pdf.pages[0].extract_text() or ""
    tables = pdf.pages[0].extract_tables() or []

    invoice_date = _find_in_text(text, r'(\d{2}/\d{2}/\d{4})')
    invoice_num = _find_in_text(text, r'INVOICE NUMBER\s*(\d+)')
    po = _find_in_text(text, r'(\S+)\s+\d+\s+719-473-7760')

    iso_date = ""
    if invoice_date:
        parts = invoice_date.split("/")
        if len(parts) == 3:
            m, d, y = parts
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    # Line items from the big table cell
    line_items = []
    for table in tables:
        for row in table:
            for cell in row:
                if not cell: continue
                # Match: QTY PARTNUMBER DESCRIPTION PRICE EA AMOUNT
                for m in re.finditer(r'(\d+)\s+(\d+-\d+:\S+)\s+(.+?)\s+NS\s+([\d.]+)\s+EA\s+([\d.]+)', str(cell)):
                    qty, part, desc, price, amount = m.groups()
                    line_items.append({
                        "page": 1, "qty": _safe_float(qty),
                        "description": f"{part} {desc.strip()}",
                        "unit_price": _safe_float(price), "amount": _safe_float(amount),
                    })

    subtotal = _safe_float(_find_in_text(text, r'SUBTOTAL\s+([\d,.]+)'))
    shipping = _safe_float(_find_in_text(text, r'SHIPPING\s+([\d,.]+)'))
    tax = _safe_float(_find_in_text(text, r'SALES TAX\s+([\d,.]+)'))
    total = _safe_float(_find_in_text(text, r'BALANCE DUE\s+([\d,.]+)'))

    return {
        "vendor": "Rush Truck Centers",
        "invoice_date": iso_date,
        "po_number": po,
        "written_by": "",
        "unit_number": "", "plate_number": "",
        "year": "", "make": "", "model": "",
        "vin": "", "engine": "", "mileage_hours": "",
        "parts_total": subtotal, "labor_total": 0,
        "shop_supplies": shipping, "subtotal": subtotal + shipping,
        "sales_tax": tax, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [],
    }


# ============================================
# RANDY'S TOWING
# ============================================
def parse_randys(pdf):
    text = pdf.pages[0].extract_text() or ""

    invoice_num = _find_in_text(text, r'Invoice #\s*(\d+)')
    date_str = _find_in_text(text, r'Printed\s+(\d+/\d+/\d+)')

    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    tow_from = _find_in_text(text, r'Tow From\s+(.+?)(?:\n|Date)')
    tow_to = _find_in_text(text, r'Tow To\s+(.+?)(?:\n|Date)')

    # Line items from table
    line_items = []
    tables = pdf.pages[0].extract_tables() or []
    for table in tables:
        for row in table:
            cell = str(row[0] or "") if row else ""
            for m in re.finditer(r'(.+?)\s+(\d+)\s+\$([\d,.]+)\s+\$([\d,.]+)', cell):
                desc, qty, price, amount = m.groups()
                line_items.append({
                    "page": 1, "qty": _safe_float(qty),
                    "description": desc.strip(),
                    "unit_price": _safe_float(price), "amount": _safe_float(amount),
                })

    total = _safe_float(_find_in_text(text, r'Grand Total\s+\$([\d,.]+)'))

    return {
        "vendor": "Randy's Towing",
        "invoice_date": iso_date,
        "po_number": "", "written_by": "",
        "unit_number": "", "plate_number": "",
        "year": "", "make": "", "model": "",
        "vin": "", "engine": "", "mileage_hours": "",
        "parts_total": 0, "labor_total": total,
        "shop_supplies": 0, "subtotal": total,
        "sales_tax": 0, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": f"Tow from: {tow_from}\nTow to: {tow_to}"}],
    }


# ============================================
# NAPA AUTO PARTS
# ============================================
def parse_napa(pdf):
    text = pdf.pages[0].extract_text() or ""

    invoice_num = _find_in_text(text, r'Invoice Number\s+(\d+)')
    # Date format can be Date:MM/DD/YYYY (no space) or Date: MM/DD/YYYY
    date_str = _find_in_text(text, r'Date:\s*(\d{1,2}/\d{1,2}/\d{4})')

    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    po_number = _find_in_text(text, r'PO#:\s*(.+?)(?:\n|$)')

    # Line items from table (Table 3 typically has the parts grid)
    line_items = []
    tables = pdf.pages[0].extract_tables() or []
    for table in tables:
        for row in table:
            if not row or len(row) < 9:
                continue
            # Look for rows where first cell looks like a part number (e.g., "12-95044")
            part_cell = str(row[0] or "").strip()
            if not part_cell or part_cell in ("Part Number", ""):
                continue
            if not re.match(r'^[\dA-Z][\dA-Z\-]+$', part_cell):
                continue
            # Extract from table columns: Part, Line, Description, Quantity, Price, Net, Total
            # Table structure: [part, None, line, desc, qty, price, net, None, total, ...]
            desc = str(row[3] or "").strip() if len(row) > 3 else ""
            qty = _safe_float(row[4]) if len(row) > 4 else 0
            list_price = _safe_float(row[5]) if len(row) > 5 else 0
            net_price = _safe_float(row[6]) if len(row) > 6 else 0
            amount = _safe_float(row[8]) if len(row) > 8 else 0
            if qty > 0 or amount > 0:
                line_items.append({
                    "page": 1, "qty": qty,
                    "description": f"{part_cell} {desc}".strip(),
                    "unit_price": net_price if net_price else list_price,
                    "amount": amount,
                })

    # Fallback: parse from text if tables didn't yield results
    if not line_items:
        # Pattern: PARTNUM LINE DESCRIPTION QTY PRICE NET TOTAL
        for m in re.finditer(
            r'([\dA-Z][\dA-Z\-]+)\s+\w+\s+(.+?)\s+(\d+\.?\d*)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)',
            text
        ):
            part_num, desc, qty, list_price, net_price, total = m.groups()
            if part_num and not part_num.startswith("5000"):
                line_items.append({
                    "page": 1, "qty": _safe_float(qty),
                    "description": f"{part_num} {desc.strip()}",
                    "unit_price": _safe_float(net_price), "amount": _safe_float(total),
                })

    # Totals - look for specific labeled totals
    subtotal = _safe_float(_find_in_text(text, r'Subtotal\s+([\d,.]+)'))
    tax = _safe_float(_find_in_text(text, r'(?:Tax|Count)\s+[\d.]+%\s+([\d,.]+)'))
    # Use "Charge Sale" which is the most reliable NAPA total line
    total = _safe_float(_find_in_text(text, r'Charge Sale\s+([\d,.]+)'))
    # Fallback: look for standalone "Total" followed by amount on same line
    # IMPORTANT: avoid matching "Net Total\n12-95044" (header + part number)
    if not total:
        total_match = re.search(r'^Total\s+([\d,.]+)', text, re.MULTILINE)
        if total_match:
            total = _safe_float(total_match.group(1))
    if not total and subtotal:
        total = subtotal + tax

    return {
        "vendor": "NAPA",
        "invoice_date": iso_date,
        "po_number": po_number.strip() if po_number else "",
        "written_by": "",
        "unit_number": "", "plate_number": "",
        "year": "", "make": "", "model": "",
        "vin": "", "engine": "", "mileage_hours": "",
        "parts_total": subtotal if subtotal else total,
        "labor_total": 0,
        "shop_supplies": 0, "subtotal": subtotal if subtotal else total,
        "sales_tax": tax, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [],
    }


# ============================================
# BOSSELMAN
# ============================================
def parse_bosselman(pdf):
    text = pdf.pages[0].extract_text() or ""

    date_str = _find_in_text(text, r'(\d{2}/\d{2}/\d{2})')
    order_num = _find_in_text(text, r'ORDER#:\s*(\d+)')

    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    # Line items from text
    line_items = []
    for m in re.finditer(r'(\S+)\s+(.+?)\s+\w+\s+(\d+)\s+\d+\s+\d+\s+\*?\s+([\d.]+)\s+([\d.]+)', text):
        part_num, desc, qty, price, amount = m.groups()
        line_items.append({
            "page": 1, "qty": _safe_float(qty),
            "description": f"{part_num} {desc.strip()}",
            "unit_price": _safe_float(price), "amount": _safe_float(amount),
        })

    total = _safe_float(_find_in_text(text, r'TOTAL CHARGE\s+([\d,.]+)'))
    subtotal = _safe_float(_find_in_text(text, r'SUB TOTAL==>\s*([\d,.]+)'))
    tax = total - subtotal if total and subtotal else 0

    return {
        "vendor": "Bosselman",
        "invoice_date": iso_date,
        "po_number": order_num, "written_by": "",
        "unit_number": "", "plate_number": "",
        "year": "", "make": "", "model": "",
        "vin": "", "engine": "", "mileage_hours": "",
        "parts_total": subtotal, "labor_total": 0,
        "shop_supplies": 0, "subtotal": subtotal,
        "sales_tax": tax, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [],
    }


# ============================================
# PSC CUSTOM
# ============================================
def parse_psc(pdf):
    all_text = "\n".join([p.extract_text() or "" for p in pdf.pages])

    invoice_num = _find_in_text(all_text, r'Invoice:\s*(\S+)')
    date_str = _find_in_text(all_text, r'Date / Hour:\s*(\d+/\d+/\d+)')
    po = _find_in_text(all_text, r'Customer P/O:\s*(\S+)')
    total = _safe_float(_find_in_text(all_text, r'Total Invoice:\s*\$([\d,.]+)'))

    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    unit = _find_in_text(all_text, r'Unit Number:\s*(\S+)')
    year = _find_in_text(all_text, r'Model Year:\s*(\d+)')
    make_model = _find_in_text(all_text, r'Make/Mode[l]?:\s*(.+?)(?:\n|VIN)')
    vin = _find_in_text(all_text, r'VIN:\s*(\S+)')
    # PSC uses "Meter:" for mileage
    mileage = _find_in_text(all_text, r'Mileage In:\s*(\S+)')
    if not mileage or mileage == "0":
        meter = _find_in_text(all_text, r'Meter:\s*(\S+)')
        if meter and meter != "0":
            mileage = meter
    completion = _find_in_text(all_text, r'Completion Date:\s*(\d+/\d+/\d+)')

    make = model = ""
    if make_model:
        parts = make_model.strip().split(" ", 1)
        make = parts[0] if parts else ""
        model = parts[1] if len(parts) > 1 else ""

    # Parse line items from the parts table
    # PSC format: "SUPP PARTNUM DESCRIPTION U/M QTY $PRICE $EXTENDED"
    line_items = []
    # Match lines like: AYC 41318A NIPPLE-... Each 1.0 $10.99 $10.99
    for m in re.finditer(
        r'([A-Z]{2,})\s+(\S+)\s+(.+?)\s+(?:Each|Hour|Job)\s+(\d+\.?\d*)\s+\$([\d,.]+)\s+\$([\d,.]+)',
        all_text
    ):
        supp, part_num, desc, qty, price, amount = m.groups()
        # Skip fee/shop/freight lines
        if any(skip in supp.upper() for skip in ["COMPLIANCE", "RETAIN", "SHOP", "SVCFREIGHT"]):
            continue
        line_items.append({
            "page": 1, "qty": _safe_float(qty),
            "description": f"{supp} {part_num} {desc}".strip(),
            "unit_price": _safe_float(price), "amount": _safe_float(amount),
        })

    # Also capture fee/misc line items separately
    for m in re.finditer(
        r'(Compliance|Retain|Shop|SvcFreight)\s+(.+?)\s+(\d+\.?\d*)\s+\$([\d,.]+)\s+\$([\d,.]+)',
        all_text
    ):
        fee_type, desc, qty, price, amount = m.groups()
        line_items.append({
            "page": 1, "qty": _safe_float(qty),
            "description": f"{fee_type} - {desc}".strip(),
            "unit_price": _safe_float(price), "amount": _safe_float(amount),
        })

    # Extract parts/labor/misc totals - PSC has these explicitly
    parts_total = _safe_float(_find_in_text(all_text, r'Total Parts:\s*\$([\d,.]+)'))
    labor_total = _safe_float(_find_in_text(all_text, r'Total Labor:\s*\$([\d,.]+)'))
    misc_total = _safe_float(_find_in_text(all_text, r'Total Miscellaneous:\s*\$([\d,.]+)'))
    subtotal_val = _safe_float(_find_in_text(all_text, r'Invoice Subtotal:\s*\$([\d,.]+)'))
    tax = _safe_float(_find_in_text(all_text, r'Total Tax:\s*\$([\d,.]+)'))
    # Fallback tax extraction (sometimes formatted oddly)
    if not tax:
        tax = _safe_float(_find_in_text(all_text, r'Total:\s*\$([\d,.]+)'))

    # Work descriptions
    work_sections = re.findall(r'((?:Complaint|Correction|Cause):.+?)(?=(?:Complaint|Correction|Cause|\*{5}|Supp\.|Extended|$))', all_text, re.DOTALL)

    return {
        "vendor": "PSC Custom",
        "invoice_date": iso_date,
        "po_number": po, "written_by": "",
        "unit_number": unit, "plate_number": "",
        "year": year, "make": make, "model": model,
        "vin": vin, "engine": "", "mileage_hours": mileage,
        "parts_total": parts_total, "labor_total": labor_total,
        "shop_supplies": misc_total, "subtotal": subtotal_val if subtotal_val else total,
        "sales_tax": tax, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": w.strip()} for w in work_sections if w.strip()],
    }


# ============================================
# SERVICE AUTO GLASS
# ============================================
def parse_service_auto_glass(pdf):
    text = pdf.pages[0].extract_text() or ""

    invoice_num = _find_in_text(text, r'Invoice:\s*(\d+)')
    date_str = _find_in_text(text, r'Date:\s*(\d+/\d+/\d+)')

    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    vin = _find_in_text(text, r'VIN:(\S+)')
    unit = _find_in_text(text, r'Unit:(\S+)')
    vehicle = _find_in_text(text, r'Vehicle:\s*(.+?)(?:\n|$)')

    year = make = model = ""
    if vehicle:
        v_parts = vehicle.split()
        if len(v_parts) >= 2:
            year = v_parts[0]
            make = v_parts[1]
            model = " ".join(v_parts[2:]) if len(v_parts) > 2 else ""

    po = _find_in_text(text, r'PO:\s*(\S+)')

    # Line items: "Qty PARTNUM - Description LIST MATERIAL LABOR TOTAL"
    line_items = []
    for m_li in re.finditer(
        r'^(\d+)\s+(\S+)\s+-\s+(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)',
        text, re.MULTILINE
    ):
        qty, part, desc, list_p, material, labor, item_total = m_li.groups()
        line_items.append({
            "page": 1, "qty": _safe_float(qty),
            "description": f"{part} - {desc.strip()}",
            "unit_price": _safe_float(material) + _safe_float(labor),
            "amount": _safe_float(item_total),
        })

    # Totals from summary line: Material Labor Tax Total Deductible Payments Balance
    totals_match = re.search(
        r'^([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+[\d.]+\s+[\d.]+\s+([\d.]+)',
        text, re.MULTILINE
    )
    material_total = _safe_float(totals_match.group(1)) if totals_match else 0
    labor_total = _safe_float(totals_match.group(2)) if totals_match else 0
    tax = _safe_float(totals_match.group(3)) if totals_match else 0
    total = _safe_float(totals_match.group(4)) if totals_match else 0
    balance = _safe_float(totals_match.group(5)) if totals_match else total

    # Work description from job location line
    job_loc = _find_in_text(text, r'(Job Location.*?)(?:\n|Signature)')

    return {
        "vendor": "Service Auto Glass",
        "invoice_date": iso_date,
        "po_number": po, "written_by": "",
        "unit_number": unit, "plate_number": "",
        "year": year, "make": make, "model": model,
        "vin": vin, "engine": "", "mileage_hours": "",
        "parts_total": material_total, "labor_total": labor_total,
        "shop_supplies": 0, "subtotal": total - tax,
        "sales_tax": tax, "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": job_loc}] if job_loc else [],
    }


# ============================================
# BRUCKNERS (OCR-based, scanned PDFs)
# ============================================
def parse_bruckners(pdf):
    """Parse Bruckners invoices (scanned/image-based PDFs with OCR)."""
    text = ""
    
    # Try normal text extraction first
    try:
        text = pdf.pages[0].extract_text() or ""
    except Exception:
        text = ""
    
    # Fall back to OCR if text is insufficient
    if len(text) < 50:
        try:
            from pdf2image import convert_from_path
            import pytesseract
            
            # Convert first page to image and OCR
            pages = convert_from_path(pdf.filename, first_page=1, last_page=1)
            if pages:
                text = pytesseract.image_to_string(pages[0])
        except Exception as e:
            text = f"(OCR unavailable: {str(e)[:50]})"
    
    # Extract what we can from text
    invoice_num = _find_in_text(text, r'Invoice[#:]?\s*(\d+)')
    date_str = _find_in_text(text, r'Date[:\s]+(\d{1,2}/\d{1,2}/\d{4})')
    
    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    
    total = _safe_float(_find_in_text(text, r'(?:Total|Grand Total|Amount Due)[:\s]+([\d,.]+)'))
    po = _find_in_text(text, r'PO[#\s:]?(\S+)')
    
    # Line items from OCR/extracted text
    line_items = []
    # Match lines with quantity, description, price, amount
    for m in re.finditer(r'(\d+)\s+(.+?)\s+([\d,.]+)\s+([\d,.]+)', text):
        qty, desc, price, amount = m.groups()
        if not desc.strip().upper().startswith(("INVOICE", "DATE", "PO")):
            line_items.append({
                "page": 1, "qty": _safe_float(qty),
                "description": desc.strip(),
                "unit_price": _safe_float(price),
                "amount": _safe_float(amount),
            })
    
    return {
        "vendor": "Bruckners",
        "invoice_date": iso_date,
        "po_number": po,
        "written_by": "",
        "unit_number": "",
        "plate_number": "",
        "year": "", "make": "", "model": "",
        "vin": "", "engine": "", "mileage_hours": "",
        "parts_total": total,
        "labor_total": 0,
        "shop_supplies": 0,
        "subtotal": total,
        "sales_tax": 0,
        "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": f"OCR text available: {len(text)} chars"}] if text else [],
    }


# ============================================
# ARNOLD MACHINERY (OCR-based, scanned PDFs)
# ============================================
def parse_arnold_machinery(pdf):
    """Parse Arnold Machinery invoices (scanned/image-based PDFs with OCR)."""
    text = ""
    
    # Try normal text extraction first
    try:
        text = pdf.pages[0].extract_text() or ""
    except Exception:
        text = ""
    
    # Fall back to OCR if text is insufficient
    if len(text) < 50:
        try:
            from pdf2image import convert_from_path
            import pytesseract
            
            # Convert first page to image and OCR
            pages = convert_from_path(pdf.filename, first_page=1, last_page=1)
            if pages:
                text = pytesseract.image_to_string(pages[0])
        except Exception as e:
            text = f"(OCR unavailable: {str(e)[:50]})"
    
    # Extract what we can from text
    invoice_num = _find_in_text(text, r'Invoice[#:]?\s*(\d+)')
    date_str = _find_in_text(text, r'Date[:\s]+(\d{1,2}/\d{1,2}/\d{4})')
    
    iso_date = ""
    if date_str:
        parts = date_str.split("/")
        if len(parts) == 3:
            m, d, y = parts
            if len(y) == 2: y = "20" + y
            iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    
    total = _safe_float(_find_in_text(text, r'(?:Total|Grand Total|Amount Due)[:\s]+\$?([\d,.]+)'))

    # Try to extract line items from OCR text
    line_items = []
    for m_item in re.finditer(r'(\d+)\s+(.+?)\s+\$?([\d,.]+)\s+\$?([\d,.]+)', text):
        qty, desc, price, amount = m_item.groups()
        if desc.strip() and "Total" not in desc:
            line_items.append({
                "page": 1, "qty": _safe_float(qty),
                "description": desc.strip(),
                "unit_price": _safe_float(price), "amount": _safe_float(amount),
            })

    return {
        "vendor": "Arnold Machinery",
        "invoice_date": iso_date,
        "po_number": "", "written_by": "",
        "unit_number": "", "plate_number": "",
        "year": "", "make": "", "model": "",
        "vin": "", "engine": "", "mileage_hours": "",
        "parts_total": total,
        "labor_total": 0,
        "shop_supplies": 0,
        "subtotal": total,
        "sales_tax": 0,
        "grand_total": total,
        "line_items": line_items,
        "work_descriptions": [{"page": 1, "work_text": f"OCR text: {len(text)} chars"}] if text else [],
    }


# ============================================
# UNIVERSAL PARSER
# ============================================
def parse_invoice(pdf_path):
    """Auto-detect vendor and parse invoice. Returns standardized dict."""
    pdf = pdfplumber.open(pdf_path)
    text = pdf.pages[0].extract_text() or ""
    filename = os.path.basename(pdf_path)
    vendor = detect_vendor(text, filename)

    parsers = {
        "Colorado Truck Repair": parse_colorado_truck_repair,
        "MHC Kenworth": parse_mhc,
        "Purcell Tire": lambda p: parse_tire_vendor(p, "Purcell Tire"),
        "Southern Tire Mart": lambda p: parse_tire_vendor(p, "Southern Tire Mart"),
        "Rush Truck Centers": parse_rush,
        "Randy's Towing": parse_randys,
        "NAPA": parse_napa,
        "Bosselman": parse_bosselman,
        "PSC Custom": parse_psc,
        "Service Auto Glass": parse_service_auto_glass,
        "Bruckners": parse_bruckners,
        "Arnold Machinery": parse_arnold_machinery,
    }

    parser = parsers.get(vendor)
    if parser:
        try:
            result = parser(pdf)
            result["source_file"] = filename
            result.setdefault("vendor", vendor)
            pdf.close()
            return result
        except Exception as e:
            pdf.close()
            raise ValueError(f"Parser error for {vendor}: {e}")
    else:
        pdf.close()
        raise ValueError(f"No parser for vendor: {vendor} (file: {filename})")
