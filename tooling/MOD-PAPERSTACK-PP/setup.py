"""
PaperStack Setup Script
========================
Installs all Python dependencies and checks external tools.

USAGE:
  python setup.py
"""

import subprocess
import sys
import shutil
import os


def main():
    print()
    print("  PaperStack Setup")
    print("  True North Data Strategies")
    print("  =" * 40)
    print()

    # Install Python dependencies
    print("  [1/4] Installing Python libraries...")
    req_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", req_file],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print("         Done.")
    else:
        print(f"         Warning: {result.stderr[:200]}")

    # Install Node.js dependencies
    print("  [2/4] Installing Node.js libraries...")
    if shutil.which("npm"):
        result = subprocess.run(
            ["npm", "install", "docx"],
            capture_output=True, text=True,
            cwd=os.path.dirname(__file__)
        )
        if result.returncode == 0:
            print("         Done.")
        else:
            print(f"         Warning: {result.stderr[:200]}")
    else:
        print("         Skipped — npm not found. Install Node.js from nodejs.org")

    # Check Poppler
    print("  [3/4] Checking Poppler...")
    if shutil.which("pdftoppm"):
        print("         Found.")
    else:
        print("         NOT FOUND — Required for PDF inspectors.")
        print("         Download: https://github.com/oschwartz10612/poppler-windows/releases")
        print("         Extract to C:\\poppler and add C:\\poppler\\Library\\bin to PATH")

    # Check Tesseract
    print("  [4/4] Checking Tesseract OCR...")
    if shutil.which("tesseract"):
        print("         Found.")
    else:
        print("         NOT FOUND — Required for scanned PDF inspector.")
        print("         Download: https://github.com/UB-Mannheim/tesseract/wiki")
        print("         Install and ensure 'Add to PATH' is checked")

    print()
    print("  Setup complete. Run 'python paperstack.py check' for full status.")
    print()


if __name__ == "__main__":
    main()
