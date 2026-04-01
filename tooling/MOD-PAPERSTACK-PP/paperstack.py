"""
PaperStack — Document Engineering Toolkit Launcher
====================================================
TRUE NORTH DATA STRATEGIES

Single entry point for all tools. Run any tool from the project root.

USAGE:
  python paperstack.py                          ← Show all tools and status
  python paperstack.py generate pdf             ← Generate Pipeline PDF flyer
  python paperstack.py generate docx            ← Generate Pipeline Word flyer
  python paperstack.py convert <file.md>        ← Convert Markdown to HTML
  python paperstack.py convert <file.md> --dark ← Convert with dark theme
  python paperstack.py reverse <file.docx>      ← Reverse engineer a Word doc
  python paperstack.py reverse <file.docx> --python --pdf  ← Multiple output modes
  python paperstack.py inspect <file.pdf>       ← Inspect a text PDF
  python paperstack.py scan <file.pdf>          ← Inspect a scanned PDF (OCR)
  python paperstack.py scan <file.pdf> --dpi 400 ← OCR at higher resolution
  python paperstack.py check                    ← Check all dependencies
  python paperstack.py doctor                   ← Full diagnostic check
"""

import sys
import os
import subprocess
import shutil

# Add project root to path so imports work
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

from src.shared.config import BRAND, PATHS, TOOL_REGISTRY, check_python_deps, check_external_deps


# ============================================
# COLORS FOR TERMINAL OUTPUT
# ANSI escape codes for colored text in terminal
# ============================================
class C:
    TEAL    = "\033[36m"
    GREEN   = "\033[32m"
    YELLOW  = "\033[33m"
    RED     = "\033[31m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    RESET   = "\033[0m"
    NAVY    = "\033[34m"


def banner():
    """Print the PaperStack startup banner."""
    print()
    print(f"  {C.BOLD}{C.TEAL}PaperStack{C.RESET}  {C.DIM}Document Engineering Toolkit{C.RESET}")
    print(f"  {C.DIM}{BRAND['company']}{C.RESET}")
    print()


def show_help():
    """Show all available commands."""
    banner()
    print(f"  {C.BOLD}COMMANDS{C.RESET}")
    print()
    print(f"  {C.TEAL}generate pdf{C.RESET}              Generate Pipeline PDF flyer")
    print(f"  {C.TEAL}generate docx{C.RESET}             Generate Pipeline Word flyer")
    print()
    print(f"  {C.TEAL}convert{C.RESET} <file.md>         Convert Markdown to styled HTML")
    print(f"    {C.DIM}--dark                    GitHub dark theme{C.RESET}")
    print(f"    {C.DIM}--open                    Auto-open in browser{C.RESET}")
    print()
    print(f"  {C.TEAL}reverse{C.RESET} <file.docx>       Reverse engineer DOCX into code")
    print(f"    {C.DIM}--python                  Generate Python (python-docx) code{C.RESET}")
    print(f"    {C.DIM}--pdf                     Generate Python (reportlab) code{C.RESET}")
    print(f"    {C.DIM}(default)                 Generate Node.js (docx-js) code{C.RESET}")
    print()
    print(f"  {C.TEAL}inspect{C.RESET} <file.pdf>        Visual inspector for text PDFs")
    print(f"    {C.DIM}--port 5000               Set server port{C.RESET}")
    print()
    print(f"  {C.TEAL}scan{C.RESET} <file.pdf>           OCR inspector for scanned PDFs")
    print(f"    {C.DIM}--dpi 300                 OCR resolution (200/300/400){C.RESET}")
    print(f"    {C.DIM}--force-ocr               Force OCR even on text PDFs{C.RESET}")
    print(f"    {C.DIM}--port 5000               Set server port{C.RESET}")
    print()
    print(f"  {C.TEAL}check{C.RESET}                     Check all dependencies")
    print(f"  {C.TEAL}doctor{C.RESET}                    Full diagnostic report")
    print(f"  {C.TEAL}list{C.RESET}                      List all tools with status")
    print()
    print(f"  {C.BOLD}EXAMPLES{C.RESET}")
    print()
    print(f"  {C.DIM}python paperstack.py generate pdf{C.RESET}")
    print(f"  {C.DIM}python paperstack.py convert README.md --dark --open{C.RESET}")
    print(f"  {C.DIM}python paperstack.py reverse proposal.docx --python{C.RESET}")
    print(f"  {C.DIM}python paperstack.py inspect invoice.pdf{C.RESET}")
    print(f"  {C.DIM}python paperstack.py scan scanned_form.pdf --dpi 400{C.RESET}")
    print()


def cmd_list():
    """List all tools with dependency status."""
    banner()
    print(f"  {C.BOLD}TOOL STATUS{C.RESET}")
    print()

    categories = {
        "generators": "FORWARD: Code → Document",
        "converters": "CONVERTER: Format → Format",
        "reverse": "REVERSE: Document → Code",
        "inspectors": "INSPECTOR: Visual Analysis",
    }

    for cat_key, cat_name in categories.items():
        print(f"  {C.BOLD}{C.NAVY}{cat_name}{C.RESET}")
        for tool_key, tool in TOOL_REGISTRY.items():
            if tool["category"] == cat_key:
                py_check = check_python_deps(tool_key)
                ext_check = check_external_deps(tool_key)

                if py_check["ok"] and ext_check["ok"]:
                    status = f"{C.GREEN}READY{C.RESET}"
                else:
                    missing = py_check["missing"] + ext_check["missing"]
                    status = f"{C.RED}MISSING: {', '.join(missing)}{C.RESET}"

                print(f"    {status}  {C.TEAL}{tool['name']}{C.RESET}")
                print(f"           {C.DIM}{tool['description']}{C.RESET}")
        print()


def cmd_check():
    """Check all dependencies."""
    banner()
    print(f"  {C.BOLD}DEPENDENCY CHECK{C.RESET}")
    print()

    all_ok = True

    # Python
    print(f"  {C.BOLD}Python{C.RESET}")
    py_version = sys.version.split()[0]
    print(f"    {C.GREEN}OK{C.RESET}  Python {py_version}")

    # Node
    node_path = shutil.which("node")
    if node_path:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"    {C.GREEN}OK{C.RESET}  Node.js {result.stdout.strip()}")
    else:
        print(f"    {C.RED}MISSING{C.RESET}  Node.js — install from nodejs.org")
        all_ok = False

    print()
    print(f"  {C.BOLD}Python Libraries{C.RESET}")
    all_pip = set()
    for tool in TOOL_REGISTRY.values():
        if tool["language"] == "python":
            all_pip.update(tool.get("requires", []))

    import_map = {
        "python-docx": "docx",
        "pymdown-extensions": "pymdownx",
        "Pillow": "PIL",
    }

    for dep in sorted(all_pip):
        import_name = import_map.get(dep, dep)
        try:
            __import__(import_name)
            print(f"    {C.GREEN}OK{C.RESET}  {dep}")
        except ImportError:
            print(f"    {C.RED}MISSING{C.RESET}  {dep}  →  pip install {dep}")
            all_ok = False

    # Node packages
    print()
    print(f"  {C.BOLD}Node.js Libraries{C.RESET}")
    docx_check = os.path.exists(os.path.join(PROJECT_ROOT, "node_modules", "docx"))
    if docx_check:
        print(f"    {C.GREEN}OK{C.RESET}  docx")
    else:
        print(f"    {C.YELLOW}NOT INSTALLED{C.RESET}  docx  →  npm install docx")

    # External tools
    print()
    print(f"  {C.BOLD}External Tools{C.RESET}")
    for name, cmd in [("Poppler", "pdftoppm"), ("Tesseract", "tesseract")]:
        if shutil.which(cmd):
            result = subprocess.run([cmd, "--version"] if name == "Tesseract" else [cmd, "-h"],
                                    capture_output=True, text=True)
            version = result.stdout.split('\n')[0] if result.stdout else "found"
            print(f"    {C.GREEN}OK{C.RESET}  {name}")
        else:
            print(f"    {C.RED}MISSING{C.RESET}  {name}  →  See README.md for install instructions")
            all_ok = False

    print()
    if all_ok:
        print(f"  {C.GREEN}{C.BOLD}All dependencies satisfied.{C.RESET}")
    else:
        print(f"  {C.YELLOW}{C.BOLD}Some dependencies missing. Install them to enable all tools.{C.RESET}")
    print()


def cmd_doctor():
    """Full diagnostic report."""
    cmd_check()
    print(f"  {C.BOLD}FILE STRUCTURE{C.RESET}")
    for key, path in PATHS.items():
        exists = path.exists()
        status = f"{C.GREEN}OK{C.RESET}" if exists else f"{C.RED}MISSING{C.RESET}"
        print(f"    {status}  {key}: {path}")
    print()

    # Check output directory is writable
    test_file = PATHS["output"] / ".write_test"
    try:
        test_file.write_text("test")
        test_file.unlink()
        print(f"    {C.GREEN}OK{C.RESET}  output/ is writable")
    except Exception:
        print(f"    {C.RED}ERROR{C.RESET}  output/ is not writable")
    print()


def cmd_generate(args):
    """Run a generator."""
    if not args:
        print(f"  {C.YELLOW}Usage: python paperstack.py generate [pdf|docx]{C.RESET}")
        return

    fmt = args[0].lower()
    if fmt == "pdf":
        script = PATHS["generators"] / "pdf_generator.py"
        subprocess.run([sys.executable, str(script)])
    elif fmt in ("docx", "word"):
        script = PATHS["generators"] / "docx_generator.js"
        subprocess.run(["node", str(script)])
    else:
        print(f"  {C.RED}Unknown format: {fmt}. Use 'pdf' or 'docx'.{C.RESET}")


def cmd_convert(args):
    """Run the Markdown to HTML converter."""
    if not args:
        print(f"  {C.YELLOW}Usage: python paperstack.py convert <file.md> [--dark] [--open]{C.RESET}")
        return

    script = PATHS["converters"] / "md_to_html.py"
    subprocess.run([sys.executable, str(script)] + args)


def cmd_reverse(args):
    """Run the document reverse engineer."""
    if not args:
        print(f"  {C.YELLOW}Usage: python paperstack.py reverse <file.docx> [--python] [--pdf]{C.RESET}")
        return

    script = PATHS["reverse"] / "doc_to_code.py"
    subprocess.run([sys.executable, str(script)] + args)


def cmd_inspect(args):
    """Run the PDF text inspector."""
    if not args:
        print(f"  {C.YELLOW}Usage: python paperstack.py inspect <file.pdf> [--port 5000]{C.RESET}")
        return

    script = PATHS["inspectors"] / "pdf_inspector.py"
    subprocess.run([sys.executable, str(script)] + args)


def cmd_scan(args):
    """Run the PDF scan inspector with OCR."""
    if not args:
        print(f"  {C.YELLOW}Usage: python paperstack.py scan <file.pdf> [--dpi 300] [--force-ocr]{C.RESET}")
        return

    script = PATHS["inspectors"] / "pdf_scan_inspector.py"
    subprocess.run([sys.executable, str(script)] + args)


# ============================================
# MAIN ROUTER
# ============================================
def main():
    if len(sys.argv) < 2:
        show_help()
        return

    command = sys.argv[1].lower()
    args = sys.argv[2:]

    commands = {
        "generate": cmd_generate,
        "gen": cmd_generate,
        "convert": cmd_convert,
        "md": cmd_convert,
        "reverse": cmd_reverse,
        "rev": cmd_reverse,
        "inspect": cmd_inspect,
        "scan": cmd_scan,
        "ocr": cmd_scan,
        "check": lambda a: cmd_check(),
        "doctor": lambda a: cmd_doctor(),
        "list": lambda a: cmd_list(),
        "ls": lambda a: cmd_list(),
        "help": lambda a: show_help(),
        "-h": lambda a: show_help(),
        "--help": lambda a: show_help(),
    }

    handler = commands.get(command)
    if handler:
        handler(args)
    else:
        print(f"  {C.RED}Unknown command: {command}{C.RESET}")
        print(f"  {C.DIM}Run 'python paperstack.py' for available commands.{C.RESET}")


if __name__ == "__main__":
    main()
