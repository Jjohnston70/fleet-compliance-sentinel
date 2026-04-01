# PaperStack — Document Engineering Toolkit

**True North Data Strategies LLC**
Turning Data into Direction

---

## What This Is

A complete set of tools for creating, converting, reverse engineering, and inspecting documents. Build marketing flyers from code, reverse engineer Word docs into generator scripts, inspect scanned PDFs for data extraction coordinates, and convert Markdown to styled HTML — all annotated with line-by-line dev notes for learning.

This started as a Pipeline product flyer generator and grew into a full document engineering system. Every tool in here is production-ready and Pipeline Punks teaching-ready.

---

## What's In The Box

```
PaperStack/
│
├── paperstack.py                                    ← Main launcher (single entry point)
├── setup.py                                         ← One-command install
├── requirements.txt                                 ← Python dependencies
├── README.md                                        ← You are here
├── .gitignore                                       ← Git ignore rules
│
├── src/                                             ← All tool source code
│   ├── generators/                                  ← Code → Document (Forward)
│   │   ├── pdf_generator.py                         ← Python → PDF (reportlab)
│   │   └── docx_generator.js                        ← Node.js → Word (docx-js)
│   │
│   ├── converters/                                  ← Format conversion
│   │   └── md_to_html.py                            ← Markdown → GitHub-styled HTML
│   │
│   ├── reverse/                                     ← Document → Code (Reverse)
│   │   └── doc_to_code.py                           ← DOCX → generator code
│   │
│   ├── inspectors/                                  ← Visual document inspection
│   │   ├── pdf_inspector.py                         ← Click-to-extract for text PDFs
│   │   └── pdf_scan_inspector.py                    ← OCR inspector for scanned PDFs
│   │
│   └── shared/                                      ← Shared config and utilities
│       └── config.py                                ← Brand colors, paths, tool registry
│
├── templates/                                       ← Ready-to-use document templates
│   ├── Pipeline_Flyer.html                          ← Standalone HTML flyer
│   └── Pipeline_Flyer.md                            ← Markdown flyer
│
├── assets/                                          ← Marketing and example files
│   ├── marketing/                                   ← Email and social templates
│   │   ├── Pipeline_Cold_Email_Template.md
│   │   └── Pipeline_Social_Media_Posts.md
│   └── examples/                                    ← Generated code examples
│       └── TNDS_Email_Sequences_generator.*         ← Reverse engineer output samples
│
├── docs/                                            ← Documentation
│   └── USER_MANUAL.md                               ← Complete operator guide
│
├── invoice-samples/                                 ← 12 fleet maintenance invoice PDFs
│
├── tests/                                           ← Invoice extraction test suite
│   ├── conftest.py                                  ← pytest fixtures
│   ├── expected_values.json                         ← Ground truth per vendor
│   └── test_invoice_extraction.py                   ← 24 test cases
│
├── invoice-module/                                  ← STANDALONE package (copy to other projects)
│   ├── README.md                                    ← Standalone usage guide
│   ├── requirements.txt                             ← Invoice module dependencies only
│   ├── setup.py                                     ← pip install -e .
│   └── ...                                          ← Self-contained copy of the module
│
├── TNDS_UserManual_InvoiceExtractionModule_*.docx   ← Branded user manual
├── TODO.md                                          ← Invoice module task tracker
│
├── output/                                          ← Generated files land here
│
└── scripts/                                         ← Future automation scripts
```

---

## The Tools at a Glance

### Forward: Code → Document

| Tool | Input | Output | Library |
|------|-------|--------|---------|
| `Pipeline_Flyer_Generator.py` | Python script | PDF file | reportlab |
| `Pipeline_Flyer_Generator_DOCX.js` | Node.js script | Word file | docx-js |
| `Pipeline_Flyer.html` | Double-click | Browser view | HTML/CSS |
| `Pipeline_Flyer.md` | Text editor | Markdown view | None |

### Converter: Format → Format

| Tool | Input | Output | Library |
|------|-------|--------|---------|
| `md_to_html.py` | Any `.md` file | Styled `.html` file | markdown |

### Reverse: Document → Code

| Tool | Input | Output | Library |
|------|-------|--------|---------|
| `doc_to_code.py` | Any `.docx` file | Generator code (JS, Python, or PDF) | python-docx |

### Inspector: Visual Document Analysis

| Tool | Input | Output | Library |
|------|-------|--------|---------|
| `pdf_inspector.py` | Text-based PDF | Click-to-extract code | pdfplumber + Flask |
| `pdf_scan_inspector.py` | Scanned or text PDF | OCR click-to-extract code | Tesseract + pdfplumber + Flask |

### Invoice Extraction Module (v1.1.0)

| Tool | Input | Output | Library |
|------|-------|--------|---------|
| `invoice_module.extract()` | Single invoice PDF | Structured dict | pdfplumber |
| `invoice_module.extract_batch()` | Multiple invoice PDFs | List of dicts | pdfplumber |
| `invoice_module.to_xlsx()` | Extracted data | Excel (maintenance_import format) | openpyxl |
| `invoice_module.to_fleet_xlsx()` | Extracted data | Excel (fleet-compliance format) | openpyxl |
| `vendor_parsers.py` | Any of 12 vendor PDFs | Auto-detected structured data | pdfplumber + pytesseract |
| `compliance.py` | Extraction operations | Audit logs + PII masking | SOC2 controls |

12 vendors supported. 24 tests passing. SOC2 compliant. See `src/invoice_module/README.md` for full API reference or the TNDS User Manual (.docx) for operator guide.

Also available as a **standalone package** at `invoice-module/` — copy it to any project and `pip install -e .` to use.

---

## Quick Start

### First Time Setup

```powershell
cd <REPO_ROOT>\Desktop\PaperStack
python setup.py
```

### Using the Launcher (Recommended)

Every tool runs through `paperstack.py` — one command, one entry point:

```powershell
cd <REPO_ROOT>\Desktop\PaperStack

python paperstack.py                                    # Show all commands
python paperstack.py list                               # Show all tools with status
python paperstack.py check                              # Check all dependencies

python paperstack.py generate pdf                       # Generate Pipeline PDF flyer
python paperstack.py generate docx                      # Generate Pipeline Word flyer

python paperstack.py convert README.md                  # Convert Markdown to HTML
python paperstack.py convert README.md --dark --open    # Dark theme + auto-open

python paperstack.py reverse proposal.docx              # Reverse DOCX → Node.js code
python paperstack.py reverse proposal.docx --python     # Reverse DOCX → Python code
python paperstack.py reverse proposal.docx --pdf        # Reverse DOCX → reportlab code

python paperstack.py inspect invoice.pdf                # Visual inspector for text PDFs
python paperstack.py scan scanned_form.pdf              # OCR inspector for scanned PDFs
python paperstack.py scan blurry.pdf --dpi 400          # Higher DPI for poor scans
```

### Running Tools Directly (Also Works)

```powershell
python src\generators\pdf_generator.py
node src\generators\docx_generator.js
python src\converters\md_to_html.py README.md --dark
python src\reverse\doc_to_code.py document.docx --python
python src\inspectors\pdf_inspector.py invoice.pdf
python src\inspectors\pdf_scan_inspector.py scan.pdf --dpi 400
```

---

## System Requirements

### Already Installed (Your Windows Desktop)

- Windows 10/11
- Python 3.14
- Node.js
- PowerShell 7.5
- VS Code
- Any web browser (Chrome, Edge, Firefox)

### Python Libraries

| Library | Used By | Install |
|---------|---------|---------|
| reportlab | PDF Generator | `pip install reportlab` |
| python-docx | Doc Reverse Engineer | `pip install python-docx` |
| markdown | Markdown Converter | `pip install markdown pymdown-extensions` |
| pdfplumber | PDF Inspector | `pip install pdfplumber` |
| flask | PDF Inspectors (web UI) | `pip install flask` |
| pdf2image | PDF Inspectors (rendering) | `pip install pdf2image` |
| Pillow | PDF Inspectors (image handling) | `pip install Pillow` |
| pytesseract | Scan Inspector (OCR) | `pip install pytesseract` |

### Node.js Libraries

| Library | Used By | Install |
|---------|---------|---------|
| docx | Word Generator | `npm install docx` |

### External Tools (Not Python/Node)

| Tool | Used By | Install |
|------|---------|---------|
| Poppler | PDF Inspectors (page rendering) | Download from [GitHub](https://github.com/oschwartz10612/poppler-windows/releases), extract to `C:\poppler`, add `C:\poppler\Library\bin` to PATH |
| Tesseract OCR | Scan Inspector | Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki), install, add to PATH |

### Install Everything at Once

```powershell
cd <REPO_ROOT>\Desktop\PaperStack
python setup.py                    # Installs everything
python paperstack.py check             # Verify it all worked
```

Or manually:

```powershell
pip install -r requirements.txt
npm install docx
```

---

## How Each Tool Works

### Pipeline Flyer Generator (Python → PDF)

Uses reportlab to draw on a canvas with x,y coordinates. Every element is positioned absolutely — you place text, shapes, and colors at exact points on the page. The coordinate system starts at bottom-left (0,0) and goes to top-right (612, 792) for US Letter. Every line is annotated with what it does and what happens when you change parameters.

### Pipeline Flyer Generator (Node.js → Word)

Uses docx-js to build Word documents from JavaScript objects. The key technique is invisible tables with colored cell backgrounds to create the appearance of designed sections. Every cell has borders set to `BorderStyle.NONE` and shading set to `ShadingType.CLEAR` with a fill color. Units are DXA (1440 = 1 inch) and half-points for font sizes (24 = 12pt).

### Markdown to HTML Converter

Takes any `.md` file and wraps it in a self-contained HTML page with GitHub-style CSS. Supports light and dark themes. All styling is inline — no external files, no internet needed. Good for making documentation look professional without a build step.

### Document Reverse Engineer

Reads a `.docx` file using python-docx, extracts every paragraph, run, table, style, color, font, and margin, then generates runnable code that recreates the document. Three output modes: Node.js (docx-js), Python (python-docx), or Python (reportlab for PDF). The generated code is commented and ready to edit.

### PDF Inspector (Text PDFs)

Opens a web browser with a split-screen view. Left side shows the PDF rendered as an image with invisible clickable overlays on every word. Right side shows extraction code. Click any text and get the exact coordinates, font, size, and pdfplumber code to extract it. Drag to select a region and get code for all elements in that zone. Outputs ready-to-use code for writing to Excel, CSV, or database.

### PDF Scan Inspector (Scanned PDFs)

Same split-screen UI as the text inspector but handles scanned documents. Auto-detects whether a PDF is text-based or scanned. For scanned pages, runs Tesseract OCR to find every word, then gives the same click-to-extract workflow. Shows confidence scores for OCR results (green = high, yellow = medium, red = low). Generates pytesseract extraction code instead of pdfplumber code for scanned pages.

---

## Creating Client-Specific Flyers

All generators keep content at the top of the file and layout code below. To create a version for a specific client, edit the content variables:

### Python (PDF)

```python
HEADLINE = "PIPELINE SUMMIT"
TAGLINE_1 = "Your listings, transactions, and team — in one place."
OUTPUT_FILE = "Pipeline_Summit.pdf"
```

### JavaScript (Word)

```javascript
const HEADLINE = "PIPELINE SUMMIT";
const TAGLINE_1 = "Your listings, transactions, and team — in one place.";
const OUTPUT_FILE = "Pipeline_Summit.docx";
```

### HTML

Find and replace text in the `<body>` section. Colors are in CSS variables at the top.

### Markdown

Edit the text directly. No code involved.

---

## Brand Colors (All Formats)

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | #1a3a5c | Primary background |
| Navy Light | #1f4570 | Hero section |
| Navy Card | #162e48 | Card backgrounds |
| Navy Dark | #0f2236 | Footer |
| Teal | #3d8eb9 | Accent, headers, CTA |
| White | #ffffff | Headlines |
| Text Light | #c8dae8 | Body text |
| Text Muted | #a0b8cc | Secondary text |

---

## Teaching Notes

Every file in this toolkit follows the same pattern:

1. Header comment block — what the file does, how to run it, what it needs
2. Cheat sheet — units, syntax reference, common patterns
3. Content section — all editable text and colors at the top of the file
4. Layout section — positioning and spacing variables
5. Implementation — rendering code with line-by-line annotations

Dev note format: what this line does, what parameters control it, what happens when you change values. This is Pipeline Punks curriculum material — every file is a lesson.

---

## Troubleshooting

### Python: 'python' not recognized

Reinstall Python and check "Add to PATH" during setup. Or use `py` instead of `python`.

### Node: 'node' not recognized

Reinstall Node.js from nodejs.org. The installer adds it to PATH.

### reportlab: No module named 'reportlab'

```powershell
pip install reportlab
```

### docx: Cannot find module 'docx'

Run `npm install docx` in the same folder as the `.js` file.

### PDF Inspector: poppler not found

Download Poppler, extract to `C:\poppler`, add `C:\poppler\Library\bin` to your system PATH. Restart your terminal.

### Scan Inspector: tesseract not found

Download Tesseract from the UB-Mannheim page, install it, and make sure "Add to PATH" is checked. If it still fails, add this line to the top of the script:

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### PDF Inspector: blank page or no words

If the PDF is scanned (image-only), use `pdf_scan_inspector.py` instead of `pdf_inspector.py`. The scan inspector auto-detects and runs OCR.

### No background colors when printing HTML

In your browser's print dialog, check "Background graphics" before saving as PDF.

---

**True North Data Strategies LLC**
Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
Fixed scope, fixed price. No open-ended projects. No surprise invoices.
# PAPERSTACK
