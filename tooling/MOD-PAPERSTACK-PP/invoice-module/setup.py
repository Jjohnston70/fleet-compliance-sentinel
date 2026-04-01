"""
Invoice Extraction Module - Setup
True North Data Strategies LLC

Install for development:
    pip install -e .

Install for production:
    pip install .
"""

from setuptools import setup, find_packages

setup(
    name="invoice-extraction-module",
    version="1.1.0",
    description="Fleet maintenance invoice PDF extraction with vendor auto-detection",
    author="Jacob Johnston",
    author_email="jacob@truenorthstrategyops.com",
    url="https://github.com/truenorthdatastrategies/invoice-extraction-module",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.10",
    install_requires=[
        "pdfplumber>=0.11.9",
        "openpyxl>=3.1.5",
    ],
    extras_require={
        "ocr": [
            "pytesseract>=0.3.13",
            "pdf2image>=1.17.0",
            "Pillow>=12.1.1",
        ],
        "dev": [
            "pytest>=9.0.0",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: Other/Proprietary License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Office/Business :: Financial",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
)
