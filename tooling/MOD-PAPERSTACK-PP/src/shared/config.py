"""
PaperStack Shared Configuration
=================================
Central config for all tools. Import this instead of hardcoding values.

Usage:
    from shared.config import BRAND, PATHS, TOOL_REGISTRY
"""

import os
import sys
from pathlib import Path


# ============================================
# APP ROOT
# Finds the PaperStack root directory regardless
# of which subfolder a script is running from.
# ============================================
def find_app_root():
    """Walk up from this file until we find PaperStack root (has README.md + src/)."""
    current = Path(__file__).resolve().parent
    for _ in range(5):                                  # Max 5 levels up
        if (current / "README.md").exists() and (current / "src").exists():
            return current
        current = current.parent
    return Path(__file__).resolve().parent.parent.parent  # Fallback

APP_ROOT = find_app_root()


# ============================================
# BRAND CONSTANTS
# Single source of truth for all brand values.
# Every tool imports from here.
# ============================================
BRAND = {
    "company": "True North Data Strategies LLC",
    "tagline": "Turning Data into Direction",
    "owner": "Jacob Johnston",
    "email": "jacob@truenorthstrategyops.com",
    "phone": "555-555-5555",
    "website": "truenorthstrategyops.com",
    "location": "Colorado Springs, CO",
    "certification": "SBA-certified VOSB/SDVOSB",

    # Brand colors
    "colors": {
        "navy":         "#1a3a5c",
        "navy_light":   "#1f4570",
        "navy_card":    "#162e48",
        "navy_dark":    "#0f2236",
        "teal":         "#3d8eb9",
        "white":        "#ffffff",
        "text_light":   "#c8dae8",
        "text_muted":   "#a0b8cc",
        "text_subtle":  "#6b8aa5",
        "bg_light":     "#f5f9fc",
    },

    # Footer text
    "footer": "Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com",
    "copyright": "2026 True North Data Strategies LLC",
}


# ============================================
# PATHS
# All directory paths relative to APP_ROOT.
# Tools use these instead of hardcoding paths.
# ============================================
PATHS = {
    "root":         APP_ROOT,
    "src":          APP_ROOT / "src",
    "generators":   APP_ROOT / "src" / "generators",
    "converters":   APP_ROOT / "src" / "converters",
    "reverse":      APP_ROOT / "src" / "reverse",
    "inspectors":   APP_ROOT / "src" / "inspectors",
    "shared":       APP_ROOT / "src" / "shared",
    "templates":    APP_ROOT / "templates",
    "assets":       APP_ROOT / "assets",
    "marketing":    APP_ROOT / "assets" / "marketing",
    "examples":     APP_ROOT / "assets" / "examples",
    "docs":         APP_ROOT / "docs",
    "output":       APP_ROOT / "output",
    "scripts":      APP_ROOT / "scripts",
}

# Create output directory if it doesn't exist
PATHS["output"].mkdir(exist_ok=True)


# ============================================
# TOOL REGISTRY
# Every tool in the system is registered here.
# The launcher and future UI use this to discover tools.
# ============================================
TOOL_REGISTRY = {
    "pdf_generator": {
        "name": "PDF Flyer Generator",
        "category": "generators",
        "file": "pdf_generator.py",
        "language": "python",
        "description": "Generate Pipeline flyer as PDF using reportlab",
        "requires": ["reportlab"],
        "command": "python src/generators/pdf_generator.py",
    },
    "docx_generator": {
        "name": "Word Doc Generator",
        "category": "generators",
        "file": "docx_generator.js",
        "language": "node",
        "description": "Generate Pipeline flyer as Word doc using docx-js",
        "requires": ["docx"],
        "command": "node src/generators/docx_generator.js",
    },
    "md_to_html": {
        "name": "Markdown to HTML Converter",
        "category": "converters",
        "file": "md_to_html.py",
        "language": "python",
        "description": "Convert any .md file to GitHub-styled .html",
        "requires": ["markdown", "pymdown-extensions"],
        "command": "python src/converters/md_to_html.py",
        "args": "<input.md> [output.html] [--dark] [--open]",
    },
    "doc_to_code": {
        "name": "Document Reverse Engineer",
        "category": "reverse",
        "file": "doc_to_code.py",
        "language": "python",
        "description": "Reverse engineer .docx into generator code (JS, Python, or PDF)",
        "requires": ["python-docx"],
        "command": "python src/reverse/doc_to_code.py",
        "args": "<file.docx> [--python] [--pdf] [--output name]",
    },
    "pdf_inspector": {
        "name": "PDF Inspector",
        "category": "inspectors",
        "file": "pdf_inspector.py",
        "language": "python",
        "description": "Visual click-to-extract inspector for text-based PDFs",
        "requires": ["pdfplumber", "flask", "pdf2image", "Pillow"],
        "external": ["poppler"],
        "command": "python src/inspectors/pdf_inspector.py",
        "args": "<file.pdf> [--port 5000]",
    },
    "pdf_scan_inspector": {
        "name": "PDF Scan Inspector (OCR)",
        "category": "inspectors",
        "file": "pdf_scan_inspector.py",
        "language": "python",
        "description": "Visual OCR inspector for scanned and text PDFs",
        "requires": ["pdfplumber", "flask", "pdf2image", "Pillow", "pytesseract"],
        "external": ["poppler", "tesseract"],
        "command": "python src/inspectors/pdf_scan_inspector.py",
        "args": "<file.pdf> [--port 5000] [--force-ocr] [--dpi 300]",
    },
}


# ============================================
# DEPENDENCY CHECKS
# ============================================
def check_python_deps(tool_key):
    """Check if a tool's Python dependencies are installed."""
    tool = TOOL_REGISTRY.get(tool_key)
    if not tool:
        return {"ok": False, "missing": [f"Unknown tool: {tool_key}"]}

    missing = []
    for dep in tool.get("requires", []):
        # Map pip names to import names
        import_map = {
            "python-docx": "docx",
            "pymdown-extensions": "pymdownx",
            "Pillow": "PIL",
            "pdf2image": "pdf2image",
        }
        import_name = import_map.get(dep, dep)
        try:
            __import__(import_name)
        except ImportError:
            missing.append(dep)

    return {"ok": len(missing) == 0, "missing": missing}


def check_external_deps(tool_key):
    """Check if external tools (poppler, tesseract) are available."""
    import shutil
    tool = TOOL_REGISTRY.get(tool_key)
    if not tool:
        return {"ok": False, "missing": []}

    missing = []
    for ext in tool.get("external", []):
        if ext == "poppler":
            if not shutil.which("pdftoppm"):
                missing.append("poppler (pdftoppm not found in PATH)")
        elif ext == "tesseract":
            if not shutil.which("tesseract"):
                missing.append("tesseract (not found in PATH)")

    return {"ok": len(missing) == 0, "missing": missing}
