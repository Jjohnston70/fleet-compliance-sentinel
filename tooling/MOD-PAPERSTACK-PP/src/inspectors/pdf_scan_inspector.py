"""
PDF Scan Inspector - Visual OCR Inspector for Scanned PDFs
============================================================
TRUE NORTH DATA STRATEGIES

WHAT THIS DOES:
  Same split-screen inspector as pdf_inspector.py, but for SCANNED PDFs.
  Scanned PDFs are just images — no selectable text. This tool runs OCR
  (Optical Character Recognition) to find every word, then gives you the
  same click-to-extract workflow.

  It auto-detects whether a PDF is text-based or scanned:
    - Text-based PDF → uses pdfplumber (fast, exact)
    - Scanned PDF → uses Tesseract OCR (slower, but gets everything)
    - Mixed PDF → uses both, merges results

HOW TO RUN:
  python pdf_scan_inspector.py invoice_scan.pdf
  python pdf_scan_inspector.py report.pdf --port 8080
  python pdf_scan_inspector.py form.pdf --force-ocr    ← force OCR even on text PDFs
  python pdf_scan_inspector.py form.pdf --dpi 300      ← higher DPI for better OCR

REQUIRES:
  pip install pdfplumber flask pdf2image Pillow pytesseract

  ALSO REQUIRES TESSERACT OCR ENGINE:
    Windows:
      1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
      2. Install (default location: C:\\Program Files\\Tesseract-OCR)
      3. Add to PATH or set: pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

    Mac:    brew install tesseract
    Linux:  sudo apt install tesseract-ocr

USE CASES:
  - Parse scanned invoices → extract amounts, dates, vendor info
  - Read scanned government forms → pull field values by position
  - Process scanned contracts → find key terms and their locations
  - Digitize paper documents → extract structured data to spreadsheets
  - Any PDF where you can't select/copy the text
"""

import sys
import os
import json
import base64
import io
import webbrowser
import threading

import pdfplumber
from pdf2image import convert_from_path
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

# ============================================
# Check if Tesseract is available
# ============================================
try:
    pytesseract.get_tesseract_version()
    TESSERACT_AVAILABLE = True
except Exception:
    TESSERACT_AVAILABLE = False
    print("WARNING: Tesseract not found. Install it:")
    print("  Windows: https://github.com/UB-Mannheim/tesseract/wiki")
    print("  Mac:     brew install tesseract")
    print("  Linux:   sudo apt install tesseract-ocr")

from flask import Flask, render_template_string, jsonify, Response


# ============================================
# IMAGE PREPROCESSING FOR BETTER OCR
# ============================================
def preprocess_for_ocr(img):
    """
    Enhance a scanned image before running OCR.
    Improves accuracy on low-quality scans, faded text, or noisy backgrounds.

    Steps:
      1. Convert to grayscale (removes color noise)
      2. Increase contrast (makes text darker, background lighter)
      3. Sharpen (crisps up blurry text edges)

    For most scans this improves OCR accuracy by 5-15%.
    """
    # Convert to grayscale
    gray = img.convert('L')

    # Increase contrast
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.8)                    # 1.0 = original, 2.0 = double contrast

    # Sharpen
    sharpened = enhanced.filter(ImageFilter.SHARPEN)

    return sharpened


# ============================================
# DETECT IF PDF IS SCANNED OR TEXT-BASED
# ============================================
def detect_pdf_type(filepath):
    """
    Opens the PDF and checks if it has extractable text.
    Returns 'text', 'scanned', or 'mixed'.

    Logic:
      - Count words on each page using pdfplumber
      - If a page has < 5 words, it's probably a scan
      - If ALL pages are scans, return 'scanned'
      - If SOME pages are scans, return 'mixed'
      - If NO pages are scans, return 'text'
    """
    pdf = pdfplumber.open(filepath)
    page_types = []

    for page in pdf.pages:
        words = page.extract_words()
        if len(words) < 5:                              # Less than 5 words = probably a scan
            page_types.append("scanned")
        else:
            page_types.append("text")

    pdf.close()

    if all(t == "scanned" for t in page_types):
        return "scanned", page_types
    elif all(t == "text" for t in page_types):
        return "text", page_types
    else:
        return "mixed", page_types


# ============================================
# EXTRACT WITH OCR (for scanned pages)
# ============================================
def extract_ocr_words(filepath, page_num, dpi=300):
    """
    Converts a PDF page to an image, runs Tesseract OCR, and returns
    word positions in PDF coordinate space (not pixel space).

    The coordinate conversion is critical:
      - Tesseract returns pixel positions at whatever DPI we rendered
      - PDF coordinates are at 72 DPI (points)
      - We scale: pdf_coord = pixel_coord * (72 / render_dpi)

    Parameters:
      filepath = path to PDF
      page_num = 1-indexed page number
      dpi      = render resolution (higher = better OCR but slower)
                 200 = fast, good for clean scans
                 300 = default, good for most scans
                 400 = slow, needed for poor quality scans
    """
    # Render PDF page to image at specified DPI
    images = convert_from_path(filepath, dpi=dpi, first_page=page_num, last_page=page_num)
    if not images:
        return []

    img = images[0]

    # Preprocess for better OCR accuracy
    processed = preprocess_for_ocr(img)

    # Run Tesseract OCR with full position data
    # output_type=DICT gives us: text, conf, left, top, width, height for every word
    data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)

    # Scale factor: convert pixel coordinates to PDF points
    # PDF points = 72 per inch, so if we rendered at 300 DPI:
    # scale = 72 / 300 = 0.24
    scale = 72.0 / dpi

    words = []
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        conf = int(data['conf'][i])

        # Skip empty text and low-confidence detections
        if not text or conf < 30:                       # 30% minimum confidence threshold
            continue

        # Pixel coordinates from Tesseract
        px_left = data['left'][i]
        px_top = data['top'][i]
        px_width = data['width'][i]
        px_height = data['height'][i]

        # Convert to PDF coordinate space (72 DPI points)
        pdf_x0 = round(px_left * scale, 2)
        pdf_top = round(px_top * scale, 2)
        pdf_x1 = round((px_left + px_width) * scale, 2)
        pdf_bottom = round((px_top + px_height) * scale, 2)

        words.append({
            "text": text,
            "x0": pdf_x0,
            "top": pdf_top,
            "x1": pdf_x1,
            "bottom": pdf_bottom,
            "width": round(pdf_x1 - pdf_x0, 2),
            "height": round(pdf_bottom - pdf_top, 2),
            "cx": round((pdf_x0 + pdf_x1) / 2, 2),
            "cy": round((pdf_top + pdf_bottom) / 2, 2),
            "fontname": "OCR-Detected",                 # OCR can't determine font name
            "size": round(pdf_bottom - pdf_top, 1),     # Estimate size from height
            "confidence": conf,                         # OCR confidence 0-100%
            "source": "ocr",                            # Flag that this came from OCR not text extraction
            # Keep pixel coordinates too (useful for image-based extraction)
            "px_left": px_left,
            "px_top": px_top,
            "px_width": px_width,
            "px_height": px_height,
        })

    return words


# ============================================
# EXTRACT WITH PDFPLUMBER (for text PDFs)
# ============================================
def extract_text_words(filepath, page_num_0indexed):
    """Extract words from a text-based PDF page using pdfplumber."""
    pdf = pdfplumber.open(filepath)
    page = pdf.pages[page_num_0indexed]

    raw_words = page.extract_words(
        keep_blank_chars=True,
        extra_attrs=["fontname", "size"]
    )

    words = []
    for w in raw_words:
        words.append({
            "text": w["text"],
            "x0": round(float(w["x0"]), 2),
            "top": round(float(w["top"]), 2),
            "x1": round(float(w["x1"]), 2),
            "bottom": round(float(w["bottom"]), 2),
            "width": round(float(w["x1"]) - float(w["x0"]), 2),
            "height": round(float(w["bottom"]) - float(w["top"]), 2),
            "cx": round((float(w["x0"]) + float(w["x1"])) / 2, 2),
            "cy": round((float(w["top"]) + float(w["bottom"])) / 2, 2),
            "fontname": w.get("fontname", "Unknown"),
            "size": round(float(w.get("size", 0)), 1),
            "confidence": 100,                          # Text extraction is 100% confident
            "source": "text",                           # Flag that this came from text extraction
        })

    # Also get tables and rects
    tables = page.extract_tables()
    rects = page.rects or []
    lines = page.lines or []

    page_info = {
        "width": float(page.width),
        "height": float(page.height),
        "tables": [],
        "rects": [],
        "lines": [],
    }

    if tables:
        for t_idx, table in enumerate(tables):
            page_info["tables"].append({
                "index": t_idx,
                "rows": len(table),
                "cols": len(table[0]) if table else 0,
                "data": table,
            })

    for r in rects:
        page_info["rects"].append({
            "x0": round(float(r["x0"]), 2),
            "top": round(float(r["top"]), 2),
            "x1": round(float(r["x1"]), 2),
            "bottom": round(float(r["bottom"]), 2),
        })

    for l in lines:
        page_info["lines"].append({
            "x0": round(float(l["x0"]), 2),
            "top": round(float(l["top"]), 2),
            "x1": round(float(l["x1"]), 2),
            "bottom": round(float(l["bottom"]), 2),
        })

    pdf.close()
    return words, page_info


# ============================================
# MAIN EXTRACTION FUNCTION
# ============================================
def extract_all_pages(filepath, force_ocr=False, ocr_dpi=300):
    """
    Extract all data from every page of a PDF.
    Auto-detects scanned vs text pages and uses the right method.
    """
    pdf_type, page_types = detect_pdf_type(filepath)
    print(f"  PDF type: {pdf_type}")
    print(f"  Page types: {page_types}")

    if force_ocr:
        print(f"  Force OCR: ON (overriding text detection)")
        page_types = ["scanned"] * len(page_types)

    pdf = pdfplumber.open(filepath)
    total_pages = len(pdf.pages)
    pages_data = []

    for i in range(total_pages):
        page = pdf.pages[i]
        page_info = {
            "page_num": i + 1,
            "width": float(page.width),
            "height": float(page.height),
            "words": [],
            "tables": [],
            "rects": [],
            "lines": [],
            "source": page_types[i],                    # "text" or "scanned"
        }

        if page_types[i] == "scanned" and TESSERACT_AVAILABLE:
            # OCR extraction
            print(f"  Page {i+1}: Running OCR at {ocr_dpi} DPI...")
            words = extract_ocr_words(filepath, i + 1, dpi=ocr_dpi)
            page_info["words"] = words
            page_info["source"] = "ocr"
            print(f"    Found {len(words)} words via OCR")

        else:
            # Text extraction
            words, extra = extract_text_words(filepath, i)
            page_info["words"] = words
            page_info["tables"] = extra["tables"]
            page_info["rects"] = extra["rects"]
            page_info["lines"] = extra["lines"]
            page_info["source"] = "text"
            print(f"  Page {i+1}: {len(words)} words via text extraction")

        pages_data.append(page_info)

    pdf.close()
    return pages_data


def render_page_image(filepath, page_num, dpi=200):
    """Render a PDF page to a base64-encoded PNG image."""
    images = convert_from_path(filepath, dpi=dpi, first_page=page_num, last_page=page_num)
    if images:
        img = images[0]
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return b64, img.width, img.height
    return None, 0, 0


# ============================================
# HTML TEMPLATE
# Same split-screen UI as pdf_inspector.py
# but with OCR-specific additions:
#   - Confidence scores on each word
#   - OCR vs Text source indicator
#   - Confidence color coding (green/yellow/red)
#   - OCR-specific extraction code
# ============================================
HTML_TEMPLATE = r"""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PDF Scan Inspector — {{ filename }}</title>
<style>
    :root {
        --bg: #0d1117; --bg-panel: #161b22; --bg-code: #1c2129;
        --border: #30363d; --text: #e6edf3; --text-muted: #8b949e;
        --teal: #3d8eb9; --green: #3fb950; --yellow: #d29922;
        --red: #f85149; --orange: #db6d28; --navy: #1a3a5c;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; }

    .toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: var(--bg-panel); border-bottom: 1px solid var(--border); height: 48px; }
    .toolbar-left { display: flex; align-items: center; gap: 16px; }
    .toolbar h1 { font-size: 14px; font-weight: 600; color: var(--teal); letter-spacing: 1px; }
    .toolbar .filename { font-size: 13px; color: var(--text-muted); }
    .page-nav { display: flex; align-items: center; gap: 8px; }
    .page-nav button { background: var(--bg); color: var(--text); border: 1px solid var(--border); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
    .page-nav button:hover { border-color: var(--teal); }
    .page-nav span { font-size: 13px; color: var(--text-muted); }

    .source-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }
    .source-badge.ocr { background: var(--orange); color: white; }
    .source-badge.text { background: var(--green); color: white; }

    .split-container { display: flex; height: calc(100vh - 48px); }
    .pdf-panel { flex: 1; overflow: auto; position: relative; background: #1a1a2e; border-right: 1px solid var(--border); }
    .pdf-container { position: relative; display: inline-block; cursor: crosshair; }
    .pdf-container img { display: block; }

    .word-overlay { position: absolute; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; }
    .word-overlay:hover { background: rgba(61, 142, 185, 0.25); border-color: var(--teal); }
    .word-overlay.selected { background: rgba(61, 142, 185, 0.35); border: 2px solid var(--teal); box-shadow: 0 0 8px rgba(61,142,185,0.3); }
    .word-overlay.region-selected { background: rgba(59,185,80,0.2); border: 1px solid var(--green); }
    .word-overlay.low-conf { border: 1px dashed var(--yellow); }

    .region-select { position: absolute; border: 2px dashed var(--green); background: rgba(59,185,80,0.1); pointer-events: none; display: none; }
    .coord-tooltip { position: fixed; background: var(--bg-panel); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: Consolas, monospace; color: var(--teal); pointer-events: none; display: none; z-index: 100; }

    .code-panel { width: 520px; min-width: 400px; display: flex; flex-direction: column; background: var(--bg-panel); }
    .element-info { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 12px; display: none; }
    .element-info.visible { display: block; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .info-item { background: var(--bg); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); }
    .info-item .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item .value { font-size: 13px; color: var(--text); font-family: Consolas, monospace; margin-top: 2px; }
    .info-item .value.highlight { color: var(--teal); }
    .info-item .value.conf-high { color: var(--green); }
    .info-item .value.conf-med { color: var(--yellow); }
    .info-item .value.conf-low { color: var(--red); }

    .code-content { flex: 1; overflow: auto; padding: 16px; }
    pre.code-block { background: var(--bg-code); border: 1px solid var(--border); border-radius: 6px; padding: 14px; font-size: 12.5px; font-family: Consolas, monospace; line-height: 1.6; overflow-x: auto; white-space: pre; margin-bottom: 12px; color: var(--text); }
    .code-section-title { font-size: 11px; font-weight: 600; color: var(--teal); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; margin-top: 16px; }
    .code-section-title:first-child { margin-top: 0; }
    .code-wrapper { position: relative; }
    .copy-btn { position: absolute; top: 8px; right: 8px; background: var(--bg-panel); border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; }
    .copy-btn:hover { color: var(--teal); border-color: var(--teal); }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); text-align: center; padding: 32px; }
    .empty-state .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 16px; margin-bottom: 8px; color: var(--text); }
    .empty-state p { font-size: 13px; line-height: 1.6; }

    .stats-bar { padding: 6px 16px; background: var(--bg); border-top: 1px solid var(--border); font-size: 11px; color: var(--text-muted); display: flex; gap: 16px; }
    .stats-bar .stat-val { color: var(--teal); }

    .mode-toggle { display: flex; gap: 4px; background: var(--bg); border-radius: 4px; padding: 2px; }
    .mode-btn { padding: 4px 12px; font-size: 11px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; border-radius: 3px; }
    .mode-btn.active { background: var(--teal); color: white; }
</style>
</head>
<body>

<div class="toolbar">
    <div class="toolbar-left">
        <h1>PDF SCAN INSPECTOR</h1>
        <span class="filename">{{ filename }}</span>
        <span class="source-badge {{ 'ocr' if pdf_type != 'text' else 'text' }}" id="sourceBadge">
            {{ pdf_type.upper() }}
        </span>
        <div class="page-nav">
            <button onclick="changePage(-1)">&laquo; Prev</button>
            <span id="pageIndicator">Page 1 / {{ total_pages }}</span>
            <button onclick="changePage(1)">Next &raquo;</button>
        </div>
    </div>
    <div style="display:flex; gap:12px; align-items:center;">
        <div class="mode-toggle">
            <button class="mode-btn active" onclick="setMode('click',this)">Click</button>
            <button class="mode-btn" onclick="setMode('region',this)">Region</button>
        </div>
        <span style="font-size:11px; color:var(--text-muted);">True North Data Strategies</span>
    </div>
</div>

<div class="split-container">
    <div class="pdf-panel" id="pdfPanel">
        <div class="pdf-container" id="pdfContainer">
            <img id="pdfImage" src="" alt="PDF Page">
            <div class="region-select" id="regionSelect"></div>
        </div>
    </div>
    <div class="code-panel">
        <div class="element-info" id="elementInfo">
            <div style="font-weight:600; margin-bottom:4px;"><span style="color:var(--teal);">&#9632;</span> Selected Element</div>
            <div class="info-grid" id="infoGrid"></div>
        </div>
        <div class="code-content" id="codeContent">
            <div class="empty-state">
                <div class="icon">&#9044;</div>
                <h3>Click any text on the PDF</h3>
                <p>Works on both regular PDFs and <strong>scanned documents</strong>.<br><br>
                OCR-detected text shows confidence scores.<br>
                Yellow borders = lower confidence words.<br><br>
                Switch to <strong>Region</strong> mode to drag-select areas.</p>
            </div>
        </div>
        <div class="stats-bar">
            <span>Words: <span class="stat-val" id="statWords">0</span></span>
            <span>Source: <span class="stat-val" id="statSource">—</span></span>
            <span>Tables: <span class="stat-val" id="statTables">0</span></span>
            <span>Cursor: <span class="stat-val" id="statCursor">—</span></span>
        </div>
    </div>
</div>

<div class="coord-tooltip" id="coordTooltip"></div>

<script>
const pagesData = {{ pages_data | tojson }};
const filename = "{{ filename }}";
const totalPages = {{ total_pages }};
let currentPage = 0, mode = "click", selectedWord = null, regionWords = [], regionStart = null, isDrawing = false;
const DPI = {{ display_dpi }};
const scaleFactor = DPI / 72.0;

function init() {
    loadPage(0);
    const panel = document.getElementById("pdfPanel");
    panel.addEventListener("mousemove", e => {
        const tt = document.getElementById("coordTooltip");
        const rect = document.getElementById("pdfContainer").getBoundingClientRect();
        const px = ((e.clientX - rect.left) / scaleFactor).toFixed(1);
        const py = ((e.clientY - rect.top) / scaleFactor).toFixed(1);
        tt.style.left = (e.clientX+14)+"px"; tt.style.top = (e.clientY-28)+"px";
        tt.style.display = "block"; tt.textContent = "x:"+px+" y:"+py;
        document.getElementById("statCursor").textContent = "("+px+", "+py+")";
    });
    panel.addEventListener("mouseleave", () => { document.getElementById("coordTooltip").style.display="none"; });
    const container = document.getElementById("pdfContainer");
    container.addEventListener("mousedown", onRegionStart);
    container.addEventListener("mousemove", onRegionDrag);
    container.addEventListener("mouseup", onRegionEnd);
}

function loadPage(idx) {
    currentPage = idx;
    document.getElementById("pdfImage").src = "/page_image/"+idx;
    document.getElementById("pdfImage").onload = buildOverlays;
    const pd = pagesData[idx];
    document.getElementById("pageIndicator").textContent = "Page "+(idx+1)+" / "+totalPages;
    document.getElementById("statWords").textContent = pd.words.length;
    document.getElementById("statSource").textContent = pd.source.toUpperCase();
    document.getElementById("statTables").textContent = pd.tables.length;
    const badge = document.getElementById("sourceBadge");
    badge.textContent = pd.source.toUpperCase();
    badge.className = "source-badge " + (pd.source === "ocr" ? "ocr" : "text");
    selectedWord = null; regionWords = [];
    document.getElementById("elementInfo").classList.remove("visible");
}

function changePage(d) { const n=currentPage+d; if(n>=0&&n<totalPages) loadPage(n); }

function buildOverlays() {
    const c = document.getElementById("pdfContainer");
    c.querySelectorAll(".word-overlay").forEach(el=>el.remove());
    pagesData[currentPage].words.forEach((w,i)=>{
        const d = document.createElement("div");
        d.className = "word-overlay" + (w.confidence && w.confidence < 70 ? " low-conf" : "");
        d.style.left = (w.x0*scaleFactor)+"px";
        d.style.top = (w.top*scaleFactor)+"px";
        d.style.width = (w.width*scaleFactor)+"px";
        d.style.height = (w.height*scaleFactor)+"px";
        d.dataset.idx = i;
        d.addEventListener("click", e=>{ e.stopPropagation(); if(mode==="click") selectWord(i); });
        c.appendChild(d);
    });
}

function selectWord(idx) {
    document.querySelectorAll(".word-overlay.selected,.word-overlay.region-selected").forEach(el=>el.classList.remove("selected","region-selected"));
    const ov = document.querySelector('.word-overlay[data-idx="'+idx+'"]');
    if(ov) ov.classList.add("selected");
    selectedWord = pagesData[currentPage].words[idx];
    regionWords = [selectedWord];
    showInfo(selectedWord);
    generateCode(selectedWord);
}

function onRegionStart(e) {
    if(mode!=="region") return;
    const rect = document.getElementById("pdfContainer").getBoundingClientRect();
    regionStart = { x: e.clientX-rect.left, y: e.clientY-rect.top };
    isDrawing = true;
    const s = document.getElementById("regionSelect");
    s.style.left=regionStart.x+"px"; s.style.top=regionStart.y+"px"; s.style.width="0"; s.style.height="0"; s.style.display="block";
}
function onRegionDrag(e) {
    if(!isDrawing||mode!=="region") return;
    const rect = document.getElementById("pdfContainer").getBoundingClientRect();
    const cx=e.clientX-rect.left, cy=e.clientY-rect.top;
    const s = document.getElementById("regionSelect");
    s.style.left=Math.min(regionStart.x,cx)+"px"; s.style.top=Math.min(regionStart.y,cy)+"px";
    s.style.width=Math.abs(cx-regionStart.x)+"px"; s.style.height=Math.abs(cy-regionStart.y)+"px";
}
function onRegionEnd(e) {
    if(!isDrawing||mode!=="region") return; isDrawing=false;
    const rect = document.getElementById("pdfContainer").getBoundingClientRect();
    const ex=e.clientX-rect.left, ey=e.clientY-rect.top;
    const x0=Math.min(regionStart.x,ex)/scaleFactor, y0=Math.min(regionStart.y,ey)/scaleFactor;
    const x1=Math.max(regionStart.x,ex)/scaleFactor, y1=Math.max(regionStart.y,ey)/scaleFactor;
    document.querySelectorAll(".word-overlay.selected,.word-overlay.region-selected").forEach(el=>el.classList.remove("selected","region-selected"));
    regionWords = [];
    pagesData[currentPage].words.forEach((w,i)=>{
        if(w.x0>=x0-2&&w.x1<=x1+2&&w.top>=y0-2&&w.bottom<=y1+2) {
            regionWords.push(w);
            const ov=document.querySelector('.word-overlay[data-idx="'+i+'"]');
            if(ov) ov.classList.add("region-selected");
        }
    });
    if(regionWords.length>0) generateRegionCode(regionWords,x0,y0,x1,y1);
    document.getElementById("regionSelect").style.display="none";
}

function showInfo(w) {
    const info=document.getElementById("elementInfo"); info.classList.add("visible");
    const confClass = w.confidence>=90?"conf-high":w.confidence>=70?"conf-med":"conf-low";
    document.getElementById("infoGrid").innerHTML = `
        <div class="info-item"><div class="label">Text</div><div class="value highlight">${esc(w.text.substring(0,30))}</div></div>
        <div class="info-item"><div class="label">Position</div><div class="value">(${w.x0}, ${w.top})</div></div>
        <div class="info-item"><div class="label">Size</div><div class="value">${w.width} x ${w.height}</div></div>
        <div class="info-item"><div class="label">Font</div><div class="value">${w.fontname}</div></div>
        <div class="info-item"><div class="label">Pt Size</div><div class="value">${w.size}pt</div></div>
        <div class="info-item"><div class="label">Confidence</div><div class="value ${confClass}">${w.confidence}%</div></div>`;
}

function generateCode(w) {
    const pg=currentPage, isOcr=pagesData[pg].source==="ocr";
    const ocrDpi = {{ ocr_dpi }};
    document.getElementById("codeContent").innerHTML = `
        <div class="code-section-title">${isOcr?"OCR":"Text"} Extraction — This Element</div>
        <div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre class="code-block">${isOcr ? `import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# Render page at ${ocrDpi} DPI for OCR
images = convert_from_path("${filename}", dpi=${ocrDpi}, first_page=${pg+1}, last_page=${pg+1})
img = images[0]

# Run OCR with position data
data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

# Find this specific word by position
# Target: "${esc(w.text)}" near pixel (${w.px_left||"~"}, ${w.px_top||"~"})
scale = 72.0 / ${ocrDpi}
for i in range(len(data["text"])):
    text = data["text"][i].strip()
    if not text: continue
    pdf_x = data["left"][i] * scale
    pdf_y = data["top"][i] * scale
    if abs(pdf_x - ${w.x0}) < 5 and abs(pdf_y - ${w.top}) < 5:
        print(f"Found: '{text}' conf={data['conf'][i]}%")
        break` : `import pdfplumber

pdf = pdfplumber.open("${filename}")
page = pdf.pages[${pg}]

# Crop to exact region: (${w.x0}, ${w.top}, ${w.x1}, ${w.bottom})
region = page.crop((${w.x0}, ${w.top}, ${w.x1}, ${w.bottom}))
text = region.extract_text()
print(text)  # "${esc(w.text)}"
pdf.close()`}</pre></div>

        <div class="code-section-title">Extract by Region (Reusable for Same Layout)</div>
        <div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre class="code-block">${isOcr ? `import pytesseract
from pdf2image import convert_from_path

def ocr_region(pdf_path, page_num, x0, y0, x1, y1, dpi=${ocrDpi}):
    # Convert region coords (PDF pts) to pixel crop coords
    scale = dpi / 72.0
    images = convert_from_path(pdf_path, dpi=dpi, first_page=page_num, last_page=page_num)
    img = images[0]
    # Crop image to target region
    cropped = img.crop((int(x0*scale), int(y0*scale), int(x1*scale), int(y1*scale)))
    text = pytesseract.image_to_string(cropped).strip()
    return text

# Extract region containing "${esc(w.text)}"
value = ocr_region("${filename}", ${pg+1}, ${w.x0}, ${w.top}, ${w.x1}, ${w.bottom})
print(f"Extracted: {value}")` : `import pdfplumber

def extract_field(pdf_path, page_num, x0, top, x1, bottom):
    pdf = pdfplumber.open(pdf_path)
    page = pdf.pages[page_num]
    region = page.crop((x0, top, x1, bottom))
    text = region.extract_text()
    pdf.close()
    return text

value = extract_field("${filename}", ${pg}, ${w.x0}, ${w.top}, ${w.x1}, ${w.bottom})
print(f"Extracted: {value}")`}</pre></div>

        <div class="code-section-title">Write to Excel</div>
        <div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre class="code-block">import openpyxl  # pip install openpyxl

# After extracting value with code above:
wb = openpyxl.Workbook()
ws = wb.active
ws["A1"] = "Field"
ws["B1"] = "Value"
ws["A2"] = "${esc(w.text.substring(0,30))}"
ws["B2"] = value  # extracted text
wb.save("extracted_data.xlsx")
print("Saved to extracted_data.xlsx")</pre></div>

        ${isOcr ? `<div class="code-section-title">OCR Full Page Dump (All Words + Positions)</div>
        <div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre class="code-block">import pytesseract, csv
from pdf2image import convert_from_path

images = convert_from_path("${filename}", dpi=${ocrDpi}, first_page=${pg+1}, last_page=${pg+1})
data = pytesseract.image_to_data(images[0], output_type=pytesseract.Output.DICT)

scale = 72.0 / ${ocrDpi}
with open("ocr_dump.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["text", "confidence", "pdf_x0", "pdf_top", "pdf_x1", "pdf_bottom"])
    for i in range(len(data["text"])):
        text = data["text"][i].strip()
        if not text or int(data["conf"][i]) < 30: continue
        writer.writerow([
            text, data["conf"][i],
            round(data["left"][i]*scale, 2),
            round(data["top"][i]*scale, 2),
            round((data["left"][i]+data["width"][i])*scale, 2),
            round((data["top"][i]+data["height"][i])*scale, 2),
        ])
print("All OCR words saved to ocr_dump.csv")</pre></div>` : ""}`;
}

function generateRegionCode(words, x0, y0, x1, y1) {
    const pg=currentPage, isOcr=pagesData[pg].source==="ocr", ocrDpi={{ ocr_dpi }};
    const info=document.getElementById("elementInfo"); info.classList.add("visible");
    const avgConf = words.length>0 ? Math.round(words.reduce((s,w)=>s+w.confidence,0)/words.length) : 0;
    const confClass = avgConf>=90?"conf-high":avgConf>=70?"conf-med":"conf-low";
    document.getElementById("infoGrid").innerHTML = `
        <div class="info-item"><div class="label">Region</div><div class="value highlight">${words.length} words</div></div>
        <div class="info-item"><div class="label">Bounds</div><div class="value">(${x0.toFixed(1)},${y0.toFixed(1)})&rarr;(${x1.toFixed(1)},${y1.toFixed(1)})</div></div>
        <div class="info-item"><div class="label">Avg Confidence</div><div class="value ${confClass}">${avgConf}%</div></div>`;

    document.getElementById("codeContent").innerHTML = `
        <div class="code-section-title">Extract Region ${isOcr?"(OCR)":"(Text)"}</div>
        <div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre class="code-block">${isOcr ? `import pytesseract
from pdf2image import convert_from_path

images = convert_from_path("${filename}", dpi=${ocrDpi}, first_page=${pg+1}, last_page=${pg+1})
img = images[0]

# Region: (${x0.toFixed(1)}, ${y0.toFixed(1)}) to (${x1.toFixed(1)}, ${y1.toFixed(1)})
scale = ${ocrDpi} / 72.0
cropped = img.crop((int(${x0.toFixed(1)}*scale), int(${y0.toFixed(1)}*scale), int(${x1.toFixed(1)}*scale), int(${y1.toFixed(1)}*scale)))
text = pytesseract.image_to_string(cropped).strip()
print(text)` : `import pdfplumber

pdf = pdfplumber.open("${filename}")
page = pdf.pages[${pg}]
region = page.crop((${x0.toFixed(1)}, ${y0.toFixed(1)}, ${x1.toFixed(1)}, ${y1.toFixed(1)}))
text = region.extract_text()
print(text)
pdf.close()`}</pre></div>

        <div class="code-section-title">Region to Excel</div>
        <div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre class="code-block">${isOcr ? `import pytesseract, openpyxl
from pdf2image import convert_from_path

images = convert_from_path("${filename}", dpi=${ocrDpi}, first_page=${pg+1}, last_page=${pg+1})
data = pytesseract.image_to_data(images[0], output_type=pytesseract.Output.DICT)

scale = 72.0 / ${ocrDpi}
wb = openpyxl.Workbook()
ws = wb.active
ws.append(["Text", "Confidence", "X0", "Top", "X1", "Bottom"])

for i in range(len(data["text"])):
    text = data["text"][i].strip()
    if not text or int(data["conf"][i]) < 30: continue
    px0 = round(data["left"][i]*scale, 2)
    ptop = round(data["top"][i]*scale, 2)
    px1 = round((data["left"][i]+data["width"][i])*scale, 2)
    pbot = round((data["top"][i]+data["height"][i])*scale, 2)
    if px0 >= ${x0.toFixed(1)}-2 and px1 <= ${x1.toFixed(1)}+2 and ptop >= ${y0.toFixed(1)}-2 and pbot <= ${y1.toFixed(1)}+2:
        ws.append([text, data["conf"][i], px0, ptop, px1, pbot])

wb.save("region_ocr_extract.xlsx")
print("Saved to region_ocr_extract.xlsx")` : `import pdfplumber, openpyxl

pdf = pdfplumber.open("${filename}")
page = pdf.pages[${pg}]
region = page.crop((${x0.toFixed(1)}, ${y0.toFixed(1)}, ${x1.toFixed(1)}, ${y1.toFixed(1)}))
words = region.extract_words(extra_attrs=["fontname", "size"])

wb = openpyxl.Workbook()
ws = wb.active
ws.append(["Text", "X0", "Top", "X1", "Bottom", "Font", "Size"])
for w in words:
    ws.append([w["text"], w["x0"], w["top"], w["x1"], w["bottom"], w.get("fontname",""), w.get("size","")])
wb.save("region_extract.xlsx")
print(f"Exported {len(words)} words")
pdf.close()`}</pre></div>

        <div class="code-section-title">Words in Region</div>
        <pre class="code-block">${words.map(w=>
            `"${esc(w.text)}"  conf=${w.confidence}%  at (${w.x0}, ${w.top})`
        ).join("\\n")}</pre>`;
}

function setMode(m,btn) { mode=m; document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); }
function copyCode(btn) { navigator.clipboard.writeText(btn.nextElementSibling.textContent).then(()=>{ btn.textContent="Copied!"; setTimeout(()=>btn.textContent="Copy",1500); }); }
function esc(t) { return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

init();
</script>
</body>
</html>
"""

# ============================================
# FLASK APP
# ============================================
def create_app(filepath, force_ocr=False, ocr_dpi=300, display_dpi=200):
    app = Flask(__name__)
    filename = os.path.basename(filepath)

    print(f"\nAnalyzing: {filename}")
    pdf_type, page_types = detect_pdf_type(filepath)

    pages_data = extract_all_pages(filepath, force_ocr=force_ocr, ocr_dpi=ocr_dpi)

    print("\nRendering page images...")
    page_images = {}
    for i in range(len(pages_data)):
        b64, w, h = render_page_image(filepath, i + 1, dpi=display_dpi)
        page_images[i] = b64
        print(f"  Page {i+1}: {w}x{h} px")

    @app.route("/")
    def index():
        return render_template_string(
            HTML_TEMPLATE,
            filename=filename,
            total_pages=len(pages_data),
            pages_data=pages_data,
            pdf_type=pdf_type if not force_ocr else "ocr",
            display_dpi=display_dpi,
            ocr_dpi=ocr_dpi,
        )

    @app.route("/page_image/<int:page_idx>")
    def page_image(page_idx):
        if page_idx in page_images:
            return Response(base64.b64decode(page_images[page_idx]), mimetype="image/png")
        return "Not found", 404

    return app


def main():
    if len(sys.argv) < 2:
        print("=" * 60)
        print("  PDF Scan Inspector")
        print("  Visual OCR Inspector for Scanned & Text PDFs")
        print("  True North Data Strategies")
        print("=" * 60)
        print()
        print("  Usage:")
        print("    python pdf_scan_inspector.py <file.pdf> [options]")
        print()
        print("  Options:")
        print("    --port 5000      Change server port (default: 5000)")
        print("    --force-ocr      Force OCR even on text PDFs")
        print("    --dpi 300        OCR resolution (200/300/400)")
        print()
        print("  Examples:")
        print("    python pdf_scan_inspector.py scanned_invoice.pdf")
        print("    python pdf_scan_inspector.py form.pdf --force-ocr")
        print("    python pdf_scan_inspector.py blurry_scan.pdf --dpi 400")
        print()
        print("  Auto-detects scanned vs text PDFs.")
        print("  Opens browser automatically.")
        print()
        sys.exit(0)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    args = sys.argv[2:]
    port = 5000
    force_ocr = "--force-ocr" in args
    ocr_dpi = 300

    if "--port" in args:
        port = int(args[args.index("--port") + 1])
    if "--dpi" in args:
        ocr_dpi = int(args[args.index("--dpi") + 1])

    app = create_app(filepath, force_ocr=force_ocr, ocr_dpi=ocr_dpi)

    def open_browser():
        import time; time.sleep(1.5)
        webbrowser.open(f"http://localhost:{port}")

    threading.Thread(target=open_browser, daemon=True).start()
    print(f"\n  PDF Scan Inspector running at: http://localhost:{port}")
    print(f"  Press Ctrl+C to stop.\n")
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    main()
