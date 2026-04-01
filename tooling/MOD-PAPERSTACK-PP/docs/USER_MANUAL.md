# PaperStack — User Manual

**Version 2.0 | February 2026**
**True North Data Strategies LLC**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements and Installation](#2-system-requirements-and-installation)
3. [PDF Generator Guide](#3-pdf-generator-guide)
4. [Word Doc Generator Guide](#4-word-doc-generator-guide)
5. [HTML Template Guide](#5-html-template-guide)
6. [Markdown Template Guide](#6-markdown-template-guide)
7. [Markdown to HTML Converter](#7-markdown-to-html-converter)
8. [Document Reverse Engineer](#8-document-reverse-engineer)
9. [PDF Inspector (Text PDFs)](#9-pdf-inspector-text-pdfs)
10. [PDF Scan Inspector (Scanned PDFs)](#10-pdf-scan-inspector-scanned-pdfs)
11. [Cold Email and Social Media Templates](#11-cold-email-and-social-media-templates)
12. [Creating Client-Specific Versions](#12-creating-client-specific-versions)
13. [Printing and Exporting](#13-printing-and-exporting)
14. [Common Tasks](#14-common-tasks)
15. [Troubleshooting](#15-troubleshooting)
16. [Quick Reference Card](#16-quick-reference-card)

---

## 1. Introduction

### What Is This Toolkit?

A set of tools that handle the full document lifecycle: creating documents from code, converting between formats, reverse engineering existing documents into editable code, and visually inspecting PDFs to extract data. Eight tools, one toolkit.

### Who Is This For?

- **Jacob:** Build and regenerate flyers, reverse engineer client docs, extract data from scanned PDFs for parsing pipelines
- **Team members (Veronica, Nic, Tristan):** Use the HTML or Word flyers without needing to code, convert Markdown docs to styled HTML
- **Pipeline Punks students:** Learn document generation, OCR, data extraction, and programmatic document creation across multiple languages
- **Client delivery:** Use the inspectors to map PDF layouts for automated data extraction projects

### What's New in Version 2.0

Version 1.0 covered the four flyer formats (PDF, Word, HTML, Markdown) and marketing templates. Version 2.0 adds four new tools: Markdown to HTML converter, document reverse engineer, PDF text inspector, and PDF scan inspector with OCR. The toolkit went from "flyer generator" to "document engineering system."

### How This Manual Is Organized

Each section covers one tool from start to finish: setup, usage, editing, and troubleshooting. Read only the sections you need.

---

## 2. System Requirements and Installation

### What You Need

| Tool | Version | Check |
|------|---------|-------|
| Windows | 10 or 11 | Already installed |
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| PowerShell | 5.1+ | `$PSVersionTable` |
| VS Code | Any | Already installed |
| Chrome/Edge | Any | Already installed |

### Install All Python Libraries

```powershell
pip install reportlab python-docx markdown pymdown-extensions pdfplumber flask pdf2image Pillow pytesseract PyPDF2 openpyxl
```

### Install Node.js Libraries

```powershell
npm install docx
```

### Install Poppler (Required for PDF Inspectors)

Poppler converts PDF pages to images for the inspector UI.

1. Go to: https://github.com/oschwartz10612/poppler-windows/releases
2. Download the latest release `.zip` file
3. Extract to `C:\poppler`
4. Add `C:\poppler\Library\bin` to your system PATH:
   - Start → type "environment variables" → click "Edit the system environment variables"
   - Click "Environment Variables" → find `Path` under System variables → click Edit
   - Click "New" → type `C:\poppler\Library\bin`
   - Click OK on all dialogs
5. Restart your terminal
6. Verify: `pdftoppm -h` should show help text

### Install Tesseract OCR (Required for Scan Inspector)

Tesseract reads text from scanned images.

1. Go to: https://github.com/UB-Mannheim/tesseract/wiki
2. Download the latest `.exe` installer
3. Run the installer. Default location: `C:\Program Files\Tesseract-OCR`
4. Check "Add to PATH" during installation
5. Restart your terminal
6. Verify: `tesseract --version` should show version info

If PATH doesn't work, add this line at the top of `pdf_scan_inspector.py`:

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Recommended Folder Structure

```
C:\Projects\pipeline-doc-toolkit\
├── README.md
├── USER_MANUAL.md
├── generators\
│   ├── Pipeline_Flyer_Generator.py
│   └── Pipeline_Flyer_Generator_DOCX.js
├── templates\
│   ├── Pipeline_Flyer.html
│   └── Pipeline_Flyer.md
├── converters\
│   └── md_to_html.py
├── reverse\
│   └── doc_to_code.py
├── inspectors\
│   ├── pdf_inspector.py
│   └── pdf_scan_inspector.py
├── output\
└── assets\
    ├── Pipeline_Cold_Email_Template.md
    └── Pipeline_Social_Media_Posts.md
```

---

## 3. PDF Generator Guide

**File:** `Pipeline_Flyer_Generator.py`
**Produces:** `Pipeline_Flyer.pdf`
**Library:** reportlab

### Run It

```powershell
cd generators
python .\Pipeline_Flyer_Generator.py
```

### How It Works

reportlab uses a canvas-based drawing system. You specify exact x,y coordinates for every element — text, rectangles, circles, lines. The coordinate system starts at the bottom-left corner (0,0) and goes to the top-right corner (612, 792) for US Letter paper. One inch equals 72 points.

### File Structure

The file is organized in four sections:

1. **COLORS section** (top) — all brand colors as `HexColor` objects. Change colors here.
2. **CONTENT section** — all text strings. Change copy here.
3. **LAYOUT section** — Y-coordinate positions for each section. Adjust spacing here.
4. **draw_flyer() function** — the rendering code. Handles positioning and drawing.

### Edit the Content

Open the file in VS Code. The content section is near the top, clearly labeled:

```python
# CONTENT — edit text here
HEADLINE = "PIPELINE"
TAGLINE_1 = "Your business already has the answers."
TAGLINE_2 = "Pipeline connects them."
```

Change any string, save, run. New PDF is generated.

### Key reportlab Methods

| Method | What It Does |
|--------|-------------|
| `c.rect(x, y, w, h, fill=1)` | Draw a filled rectangle |
| `c.drawString(x, y, text)` | Draw left-aligned text |
| `c.drawCentredString(x, y, text)` | Draw centered text |
| `c.drawRightString(x, y, text)` | Draw right-aligned text |
| `c.setFont(name, size)` | Set font and size |
| `c.setFillColor(color)` | Set fill color for next shape/text |
| `c.circle(x, y, r, fill=1)` | Draw a filled circle |
| `Paragraph(text, style)` | Auto-wrapping text block |

### Coordinate Cheat Sheet

| Position | X | Y |
|----------|---|---|
| Top-left (1" margins) | 36 | 756 |
| Top-center | 306 | 756 |
| Top-right (1" margins) | 576 | 756 |
| Bottom-left (1" margins) | 36 | 36 |
| Center of page | 306 | 396 |

---

## 4. Word Doc Generator Guide

**File:** `Pipeline_Flyer_Generator_DOCX.js`
**Produces:** `Pipeline_Flyer.docx`
**Library:** docx (npm)

### Run It

```powershell
cd generators
npm install docx          # first time only
node .\Pipeline_Flyer_Generator_DOCX.js
```

### How It Works

docx-js builds Word documents as nested JavaScript objects. The key technique for styled layouts is invisible tables: tables with no borders and colored cell backgrounds. This creates the appearance of designed sections inside a Word document.

### Critical Rules

| Rule | Why |
|------|-----|
| Always use `ShadingType.CLEAR` | `SOLID` causes black backgrounds |
| Always use `WidthType.DXA` | `PERCENTAGE` breaks in Google Docs |
| Set both `columnWidths` AND cell `width` | Without both, widths render incorrectly |
| Cell `margins` = padding INSIDE cell | Not added to cell width |
| Use `VerticalAlign.TOP` for columns | Prevents text centering in uneven columns |

### Unit Conversions

| Measurement | DXA Value |
|------------|-----------|
| 1 inch | 1440 |
| US Letter width | 12240 |
| US Letter height | 15840 |
| 1" margin content width | 9360 |
| 12pt font | 24 half-points |

---

## 5. HTML Template Guide

**File:** `Pipeline_Flyer.html`
**Opens in:** Any web browser

### Use It

Double-click the file to open in your default browser. No server, no build step, no internet required.

### How It Works

Self-contained HTML with inline CSS. Colors are set as CSS variables at the top. Layout uses flexbox for multi-column sections. Print styles are included for clean PDF export.

### Edit Colors

```css
:root {
    --navy: #1a3a5c;         /* Change primary color here */
    --teal: #3d8eb9;         /* Change accent color here */
}
```

### Print to PDF

1. Open in Chrome
2. Ctrl+P
3. Destination: Save as PDF
4. Check "Background graphics" (required for colors)
5. Save

---

## 6. Markdown Template Guide

**File:** `Pipeline_Flyer.md`
**Opens in:** VS Code, GitHub, Notion, Obsidian

### Preview in VS Code

- Ctrl+Shift+V — full preview
- Ctrl+K then V — side-by-side preview

### Limitations

Markdown has no background colors, no custom fonts, and renders differently across viewers. It's best for content that will be consumed in Markdown-native environments (GitHub READMEs, Notion, Obsidian).

---

## 7. Markdown to HTML Converter

**File:** `md_to_html.py`
**Converts:** Any `.md` file → Styled `.html` file
**Library:** markdown, pymdown-extensions

### Run It

```powershell
cd converters
python .\md_to_html.py README.md                  # Light theme (default)
python .\md_to_html.py README.md --dark            # Dark theme (GitHub dark)
python .\md_to_html.py README.md --open            # Opens in browser after converting
python .\md_to_html.py README.md output.html       # Custom output filename
python .\md_to_html.py README.md --dark --open     # Combine flags
```

### What It Produces

A single `.html` file with all CSS styling inline. No internet needed, no external files. Double-click to open. Looks like a GitHub README page.

### Theme Options

| Flag | Appearance |
|------|-----------|
| (none) | GitHub light mode — white background, dark text |
| `--dark` | GitHub dark mode — dark background, light text |

### What Markdown Features It Supports

Headings (h1-h6), bold, italic, links, images, code blocks with syntax highlighting, tables, blockquotes, horizontal rules, ordered and unordered lists, task lists, and smart quotes.

### Use Cases

- Convert project documentation to shareable HTML files
- Make READMEs look professional without GitHub
- Create styled documentation for client deliverables
- Preview Markdown without VS Code or a Markdown viewer

---

## 8. Document Reverse Engineer

**File:** `doc_to_code.py`
**Converts:** Any `.docx` file → Runnable generator code
**Library:** python-docx

### Run It

```powershell
cd reverse

# Generate Node.js code (default — same library as the flyer generator)
python .\doc_to_code.py "C:\path\to\document.docx"

# Generate Python code (python-docx library)
python .\doc_to_code.py "C:\path\to\document.docx" --python

# Generate PDF code (reportlab library)
python .\doc_to_code.py "C:\path\to\document.docx" --pdf

# Custom output filename
python .\doc_to_code.py document.docx --output my_generator.js
```

### What It Does

1. Opens the `.docx` file
2. Reads every paragraph, run, table, style, color, font, and margin
3. Generates a runnable script that recreates the document from scratch

### What It Detects

| Element | Extracted Data |
|---------|---------------|
| Page setup | Width, height, margins |
| Paragraphs | Text, style (Normal, Heading 1, etc.), alignment |
| Runs | Bold, italic, underline, font name, font size, color |
| Tables | Row count, column count, cell text, cell background colors |
| Colors | Every color used in the document |
| Fonts | Every font used in the document |

### Output Modes

| Flag | Output | Library | Best For |
|------|--------|---------|----------|
| (none) | `.js` file | docx-js | Generating Word docs programmatically |
| `--python` | `.py` file | python-docx | Python-based document generation |
| `--pdf` | `.py` file | reportlab | Converting the doc to PDF via code |

### The Generated Code

The output is a complete, runnable script with: all content and colors extracted as variables at the top, document structure code below, and comments explaining each element. Run it to produce a `_REBUILT.docx` or `_REBUILT.pdf` that recreates the original.

### Use Cases

- Client gives you a Word doc → reverse it → automate it
- Built a doc manually in Word → extract the code → make it repeatable
- Need to understand how a doc is structured → code shows every element
- Pipeline Punks teaching → see how documents work under the hood

---

## 9. PDF Inspector (Text PDFs)

**File:** `pdf_inspector.py`
**Interface:** Web browser (localhost)
**Libraries:** pdfplumber, Flask, pdf2image, Pillow

### Run It

```powershell
cd inspectors
python .\pdf_inspector.py "C:\path\to\document.pdf"
python .\pdf_inspector.py invoice.pdf --port 8080     # Custom port
```

Browser opens automatically to `http://localhost:5000`.

### What You See

Split-screen interface:

- **Left panel:** Your PDF rendered as an image. Every word has an invisible clickable overlay. Your mouse shows live PDF coordinates.
- **Right panel:** Extraction code for whatever you click on.
- **Bottom bar:** Word count, table count, rectangle count, cursor position.

### Click Mode (Default)

Click any word on the PDF. The right panel shows:

1. **Element info** — text, position, size, font name, font size, bounding box
2. **Exact extraction code** — pdfplumber code to crop and extract that specific text
3. **Reusable function** — an `extract_field()` function you can copy into any parsing script
4. **Font/style matching** — code that finds all text with the same font and size (useful for finding all headings, all amounts, etc.)
5. **Excel export** — code that extracts the value and writes it to a spreadsheet

### Region Mode

Click the "Region" button in the top toolbar. Drag a rectangle around an area of the PDF. The right panel shows:

1. **Region extraction** — code to extract all text from the selected area
2. **Table extraction** — code that tries to parse the region as a table
3. **Excel export** — code to dump all words with positions to a spreadsheet
4. **CSV export** — code to save the region as a CSV file
5. **Word list** — every word found in the region with its coordinates

### Use Cases

- Building invoice parsers: click the amount field → get the code to extract it
- Mapping form layouts: click each field → record its coordinates
- Creating data extraction pipelines: region-select a table → get table parsing code
- Understanding PDF structure: see every word's exact position, font, and size

### Important: Text PDFs Only

This tool works on PDFs where the text is selectable (you can highlight text in Adobe Reader). For scanned PDFs (image-only), use `pdf_scan_inspector.py` instead.

---

## 10. PDF Scan Inspector (Scanned PDFs)

**File:** `pdf_scan_inspector.py`
**Interface:** Web browser (localhost)
**Libraries:** pdfplumber, pytesseract, Flask, pdf2image, Pillow

### Run It

```powershell
cd inspectors
python .\pdf_scan_inspector.py scanned_invoice.pdf
python .\pdf_scan_inspector.py form.pdf --force-ocr     # Force OCR even on text PDFs
python .\pdf_scan_inspector.py blurry.pdf --dpi 400      # Higher DPI for poor scans
python .\pdf_scan_inspector.py doc.pdf --port 8080       # Custom port
```

### Auto-Detection

The tool automatically detects whether each page is text-based or scanned:

| Page Type | Detection | Extraction Method |
|-----------|-----------|-------------------|
| Text-based | pdfplumber finds 5+ words | pdfplumber (fast, exact) |
| Scanned | pdfplumber finds < 5 words | Tesseract OCR (slower, reads pixels) |
| Mixed | Per-page detection | Uses the right method per page |

### The OCR Pipeline

For scanned pages, the tool:

1. Renders the PDF page to a high-resolution image (default 300 DPI)
2. Preprocesses the image: converts to grayscale, increases contrast, sharpens
3. Runs Tesseract OCR to detect every word with position data
4. Converts pixel coordinates to PDF coordinate space (72 DPI points)
5. Displays the results in the same split-screen inspector UI

### Confidence Scores

Every OCR-detected word gets a confidence score from 0-100%:

| Score | Color | Meaning |
|-------|-------|---------|
| 90-100% | Green | High confidence — Tesseract is sure about this word |
| 70-89% | Yellow | Medium confidence — might have errors |
| Below 70% | Red | Low confidence — verify manually |

Words below 70% confidence get a yellow dashed border on the PDF view so you can spot uncertain detections.

### DPI Settings

Higher DPI gives Tesseract more pixels to work with, improving accuracy on poor quality scans but taking longer:

| DPI | Speed | Accuracy | Use For |
|-----|-------|----------|---------|
| 200 | Fast | Good | Clean, high-quality scans |
| 300 | Medium | Better | Most scans (default) |
| 400 | Slow | Best | Blurry, faded, or poor quality scans |

### Generated Code

The right panel generates pytesseract extraction code (not pdfplumber) for scanned pages:

1. **OCR extraction** — Tesseract code to find the clicked word by position
2. **Region crop + OCR** — code that crops the image to a region and runs OCR on just that area
3. **Excel export** — code that OCRs a region and writes results to a spreadsheet
4. **Full page dump** — code that OCRs the entire page and exports all words with positions to CSV

### Use Cases

- Parsing scanned invoices from vendors who only send paper/fax
- Extracting data from scanned government forms (DD-214s, SF-86s, etc.)
- Digitizing paper documents into spreadsheets or databases
- Processing scanned contracts to find key terms and amounts
- Any PDF where you cannot select or copy the text

---

## 11. Cold Email and Social Media Templates

### Cold Email Template

**File:** `Pipeline_Cold_Email_Template.md`

Contains three rotating subject lines, a main email body with `[placeholders]` for personalization, and a 5-day follow-up email. Replace placeholders with client-specific details.

### Social Media Posts

**File:** `Pipeline_Social_Media_Posts.md`

Contains two LinkedIn posts (thought leadership and engagement) and two Facebook posts (conversational local and shareable). Copy, paste, and customize for your audience.

---

## 12. Creating Client-Specific Versions

All generators keep content at the top of the file. To create a version for a specific client:

### Example: Pipeline Summit (Real Estate Broker)

**Python (PDF):**
```python
HEADLINE = "PIPELINE SUMMIT"
TAGLINE_1 = "Your listings, transactions, and team — in one place."
```

**JavaScript (Word):**
```javascript
const HEADLINE = "PIPELINE SUMMIT";
const TAGLINE_1 = "Your listings, transactions, and team — in one place.";
```

**HTML:** Find and replace text in the `<body>` section.
**Markdown:** Edit text directly.

### Industry-Specific Pain Points

**Real Estate:** MLS vs transaction management vs email, agents can't see pipeline without office manager, commission tracking in one person's spreadsheet.

**Field Service:** Job details in texts, invoices in QuickBooks, schedules in calendar. Dispatch depends on one person's memory. Customer history in someone's head.

**Government Contracting:** RFP tracking across multiple portals, compliance documents scattered, past performance narratives buried in old proposals.

---

## 13. Printing and Exporting

### Print the HTML Flyer to PDF

1. Open `Pipeline_Flyer.html` in Chrome
2. Ctrl+P
3. Destination: Save as PDF
4. **Check "Background graphics"** (required for colors to print)
5. Margins: Default or Minimum
6. Save

### Print the Generated PDF

Open `Pipeline_Flyer.pdf` in any PDF reader. Print normally.

### Print the Word Doc

Open `Pipeline_Flyer.docx` in Word or Google Docs. Print normally. Note that Google Docs may not render complex nested tables identically to Word.

---

## 14. Common Tasks

### Change the Phone Number or Email

In every generator, search for `555-555-5555` or `jacob@truenorthstrategyops.com` and replace.

### Change Brand Colors

**Python:** Edit the `HexColor` values at the top of the file.
**JavaScript:** Edit the `const NAVY =` values at the top.
**HTML:** Edit the CSS variables in `:root { }`.
**Markdown:** No color support.

### Add a QR Code to the PDF

```python
# After pip install qrcode
import qrcode
qr = qrcode.make("https://truenorthstrategyops.com")
qr.save("qr_code.png")
# Then in the draw function:
c.drawImage("qr_code.png", x, y, width, height)
```

### Convert Any Markdown File to Styled HTML

```powershell
python md_to_html.py "C:\path\to\any_file.md" --dark --open
```

### Reverse Engineer a Client's Word Doc

```powershell
python doc_to_code.py "C:\path\to\client_doc.docx"
# Then run the generated code:
node client_doc_generator.js
```

### Extract Data from a Scanned Invoice

```powershell
python pdf_scan_inspector.py "C:\path\to\invoice_scan.pdf"
# Click on fields in the browser UI
# Copy the extraction code from the right panel
# Paste into your parsing script
```

### Map All Fields in a PDF Form

1. Open with `pdf_inspector.py` (or `pdf_scan_inspector.py` for scans)
2. Switch to Region mode
3. Drag over each section
4. Copy the coordinates
5. Build your extraction script using the generated code blocks

---

## 15. Troubleshooting

### Python Issues

| Problem | Fix |
|---------|-----|
| `'python' is not recognized` | Reinstall Python with "Add to PATH" checked. Or use `py` instead. |
| `No module named 'reportlab'` | `pip install reportlab` |
| `No module named 'pdfplumber'` | `pip install pdfplumber` |
| `No module named 'flask'` | `pip install flask` |
| `No module named 'pytesseract'` | `pip install pytesseract` |
| `SyntaxError: invalid character` | You may have saved the wrong content as a `.py` file. Re-download. |
| PowerShell needs `.\` prefix | Use `python .\file.py` not `python file.py` |

### Node.js Issues

| Problem | Fix |
|---------|-----|
| `'node' is not recognized` | Reinstall Node.js from nodejs.org |
| `Cannot find module 'docx'` | Run `npm install docx` in the same folder |
| Quote/apostrophe errors | Use `\u2019` for smart apostrophes in strings |

### HTML Issues

| Problem | Fix |
|---------|-----|
| No background colors when printing | Check "Background graphics" in print dialog |
| Font doesn't load | Google Fonts requires internet. Use a system font as fallback. |

### PDF Inspector Issues

| Problem | Fix |
|---------|-----|
| Poppler not found / pdftoppm error | Install Poppler and add `C:\poppler\Library\bin` to PATH. Restart terminal. |
| Blank page in browser | The PDF might be scanned. Use `pdf_scan_inspector.py` instead. |
| No words detected | Text PDF: file might be image-only. Scanned PDF: increase DPI with `--dpi 400`. |
| Port already in use | Use `--port 8080` (or any available port) |
| Browser doesn't open | Manually go to `http://localhost:5000` |

### Scan Inspector Issues

| Problem | Fix |
|---------|-----|
| Tesseract not found | Install Tesseract and add to PATH. Or set the path directly in the script. |
| Poor OCR accuracy | Increase DPI: `--dpi 400`. Ensure the scan is reasonably clear. |
| Slow performance | Lower DPI: `--dpi 200`. OCR takes longer at higher resolutions. |
| Wrong text detected | Check confidence scores. Low confidence words (red) may be misread. |

### Document Reverse Engineer Issues

| Problem | Fix |
|---------|-----|
| No module named 'docx' | `pip install python-docx` (not `pip install docx`) |
| Generated code produces empty doc | Some complex formatting (nested tables, text boxes) may not fully extract. |
| Colors not detected | Colors applied at the style level (not inline) may not appear in the output. |

### Markdown Converter Issues

| Problem | Fix |
|---------|-----|
| No module named 'markdown' | `pip install markdown pymdown-extensions` |
| Code blocks not highlighted | Make sure language is specified: ` ```python ` not just ` ``` ` |
| Tables don't render | Tables need header rows with `|---|` separator line |

---

## 16. Quick Reference Card

### Commands

| Task | Command |
|------|---------|
| Generate PDF flyer | `python Pipeline_Flyer_Generator.py` |
| Generate Word flyer | `node Pipeline_Flyer_Generator_DOCX.js` |
| Convert Markdown to HTML (light) | `python md_to_html.py file.md` |
| Convert Markdown to HTML (dark) | `python md_to_html.py file.md --dark` |
| Convert Markdown and open in browser | `python md_to_html.py file.md --open` |
| Reverse DOCX to Node.js code | `python doc_to_code.py file.docx` |
| Reverse DOCX to Python code | `python doc_to_code.py file.docx --python` |
| Reverse DOCX to PDF code | `python doc_to_code.py file.docx --pdf` |
| Inspect text PDF | `python pdf_inspector.py file.pdf` |
| Inspect scanned PDF | `python pdf_scan_inspector.py file.pdf` |
| Force OCR on any PDF | `python pdf_scan_inspector.py file.pdf --force-ocr` |
| High-quality OCR for blurry scans | `python pdf_scan_inspector.py file.pdf --dpi 400` |

### Brand Colors

| Color | Hex | RGB |
|-------|-----|-----|
| Navy | #1a3a5c | (26, 58, 92) |
| Teal | #3d8eb9 | (61, 142, 185) |
| White | #ffffff | (255, 255, 255) |
| Text Light | #c8dae8 | (200, 218, 232) |
| Text Muted | #a0b8cc | (160, 184, 204) |

### Unit Conversions

| Unit | Equals |
|------|--------|
| 1 inch | 72 PDF points |
| 1 inch | 1440 DXA (Word) |
| 12pt font | 24 half-points (docx-js) |
| US Letter | 612 x 792 points |
| US Letter | 12240 x 15840 DXA |

### Library Map

| Library | Language | Purpose |
|---------|----------|---------|
| reportlab | Python | Create PDFs from scratch |
| python-docx | Python | Read/write Word documents |
| docx (npm) | JavaScript | Create Word documents |
| pdfplumber | Python | Extract text/tables from text PDFs |
| pytesseract | Python | OCR on scanned images |
| pdf2image | Python | Convert PDF pages to images |
| Flask | Python | Serve web UI for inspectors |
| Pillow | Python | Image processing |
| markdown | Python | Convert Markdown to HTML |
| openpyxl | Python | Write Excel files |

---

**True North Data Strategies LLC**
Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
Fixed scope, fixed price. No open-ended projects. No surprise invoices.
