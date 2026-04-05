#!/bin/bash
# ============================================================
# TNDS CMMC Knowledge Base -- Document Downloader
# Run this script from the cmmc-knowledge-base folder
# All documents are public .gov / .nist.gov / official sources
# ============================================================
# Usage: cd to the cmmc-knowledge-base folder, then run:
#   chmod +x download-all-cmmc-docs.sh
#   ./download-all-cmmc-docs.sh
# ============================================================

set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Downloading to: $BASE_DIR"
echo ""

# ============================================================
# TIER 1 -- Core Regulatory (Must Read)
# ============================================================
TIER1="$BASE_DIR/01-tier1-core-regulatory"
echo "=== TIER 1: Core Regulatory Documents ==="

echo "[1/10] NIST SP 800-171 Rev 2 (The 110 Controls)..."
curl -sL -o "$TIER1/NIST-SP-800-171r2.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-171r2.pdf"

echo "[2/10] NIST SP 800-171A (Assessment Procedures -- 320 Objectives)..."
curl -sL -o "$TIER1/NIST-SP-800-171A.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-171A.pdf"

echo "[3/10] NIST SP 800-171A Assessment Spreadsheet (XLSX)..."
curl -sL -o "$TIER1/NIST-SP-800-171A-assessment-procedures.xlsx" \
  "https://csrc.nist.gov/files/pubs/sp/800/171/a/final/docs/sp800-171a-assessment-procedures.xlsx"

echo "[4/10] CMMC Assessment Guide Level 2 v2.13..."
curl -sL -o "$TIER1/CMMC-Assessment-Guide-Level2-v2.13.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf"

echo "[5/10] CMMC Scoping Guide Level 2..."
curl -sL -o "$TIER1/CMMC-Scoping-Guide-Level2.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2v2.pdf"

echo "[6/10] CMMC Model Overview v2.13..."
curl -sL -o "$TIER1/CMMC-Model-Overview-v2.13.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview.pdf"

echo "[7/10] DoD Assessment Methodology v1.2.1 (SPRS Scoring)..."
curl -sL -o "$TIER1/DoD-Assessment-Methodology-v1.2.1.pdf" \
  "https://www.acq.osd.mil/asda/dpc/cp/cyber/docs/safeguarding/NIST-SP-800-171-Assessment-Methodology-Version-1.2.1-6.24.2020.pdf"

echo "[8/10] CMMC Assessment Guide Level 1 v2.13..."
curl -sL -o "$TIER1/CMMC-Assessment-Guide-Level1-v2.13.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf"

echo "[9/10] CMMC Assessment Guide Level 3 v2.13..."
curl -sL -o "$TIER1/CMMC-Assessment-Guide-Level3-v2.13.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3v2.pdf"

echo "[10/10] CMMC Scoping Guide Level 2 (v2.13 September 2024 version)..."
curl -sL -o "$TIER1/CMMC-Scoping-Guide-Level2-v2.13.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2.pdf"

echo "Tier 1 complete."
echo ""

# ============================================================
# TIER 2 -- Supporting Standards
# ============================================================
TIER2="$BASE_DIR/02-tier2-supporting-standards"
echo "=== TIER 2: Supporting Standards ==="

echo "[1/8] NIST SP 800-53 Rev 5 (Full Control Catalog)..."
curl -sL -o "$TIER2/NIST-SP-800-53r5.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf"

echo "[2/8] NIST SP 800-172 (Enhanced Security Requirements)..."
curl -sL -o "$TIER2/NIST-SP-800-172.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-172.pdf"

echo "[3/8] CUI Marking Handbook (NARA)..."
curl -sL -o "$TIER2/CUI-Marking-Handbook-v1.1.pdf" \
  "https://www.archives.gov/files/cui/20161206-cui-marking-handbook-v1-1.pdf"

echo "[4/8] NIST Cybersecurity Framework 2.0..."
curl -sL -o "$TIER2/NIST-CSF-2.0.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"

echo "[5/8] NIST SP 800-37 Rev 2 (Risk Management Framework)..."
curl -sL -o "$TIER2/NIST-SP-800-37r2.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-37r2.pdf"

echo "[6/8] NIST SP 800-61 Rev 3 (Incident Handling Guide)..."
curl -sL -o "$TIER2/NIST-SP-800-61r3.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf"

echo "[7/8] NIST SP 800-88 Rev 1 (Media Sanitization)..."
curl -sL -o "$TIER2/NIST-SP-800-88r1.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r1.pdf"

echo "[8/8] NIST SP 800-34 Rev 1 (Contingency Planning)..."
curl -sL -o "$TIER2/NIST-SP-800-34r1.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-34r1.pdf"

echo "Tier 2 complete."
echo ""

# ============================================================
# TIER 3 -- Deep Reference / Supplemental
# ============================================================
TIER3="$BASE_DIR/03-tier3-deep-reference"
echo "=== TIER 3: Deep Reference ==="

echo "[1/3] C2M2-CMMC Supplemental Guidance (DOE)..."
curl -sL -o "$TIER3/C2M2-CMMC-Supplemental-Guidance.pdf" \
  "https://c2m2.doe.gov/C2M2%E2%80%94CMMC%20Supplemental%20Guidance.pdf"

echo "[2/3] NIST SP 800-63B (Digital Identity / Authentication)..."
curl -sL -o "$TIER3/NIST-SP-800-63B.pdf" \
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63b.pdf"

echo "[3/3] CMMC Assessment Guide Level 2 (Original v2.0 Dec 2021)..."
curl -sL -o "$TIER3/CMMC-Assessment-Guide-Level2-v2.0-Original.pdf" \
  "https://dodcio.defense.gov/Portals/0/Documents/CMMC/AG_Level2_MasterV2.0_FINAL_202112016_508.pdf"

echo "Tier 3 complete."
echo ""

# ============================================================
# OFFICIAL TEMPLATES (NIST-provided, free)
# ============================================================
TEMPLATES="$BASE_DIR/05-templates-official"
echo "=== OFFICIAL TEMPLATES ==="

echo "[1/2] NIST CUI System Security Plan (SSP) Template (DOCX)..."
curl -sL -o "$TEMPLATES/NIST-CUI-SSP-Template.docx" \
  "https://csrc.nist.gov/files/pubs/sp/800/171/r2/upd1/final/docs/cui-ssp-template-final.docx"

echo "[2/2] NIST CUI Plan of Action & Milestones (POA&M) Template (DOCX)..."
curl -sL -o "$TEMPLATES/NIST-CUI-POAM-Template.docx" \
  "https://csrc.nist.gov/CSRC/media/Publications/sp/800-171/rev-2/final/documents/CUI-Plan-of-Action-Template-final.docx"

echo "Templates complete."
echo ""

# ============================================================
# WEB PAGES TO SAVE AS BOOKMARKS (can't download as PDFs)
# ============================================================
echo "=== IMPORTANT WEB PAGES (bookmark these) ==="
echo ""
echo "These are live web pages, not downloadable PDFs."
echo "Open them in your browser and bookmark or save as PDF:"
echo ""
echo "  32 CFR Part 170 (CMMC Program Rule):"
echo "    https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-G/part-170"
echo ""
echo "  DFARS 252.204-7012 (Safeguarding CDI):"
echo "    https://www.acquisition.gov/dfars/252.204-7012-safeguarding-covered-defense-information-and-cyber-incident-reporting."
echo ""
echo "  DFARS 252.204-7021 (CMMC Requirements):"
echo "    https://www.federalregister.gov/documents/2025/09/10/2025-17359/defense-federal-acquisition-regulation-supplement-assessing-contractor-implementation-of"
echo ""
echo "  FAR 52.204-21 (Basic Safeguarding -- 15 Controls):"
echo "    https://www.acquisition.gov/far/52.204-21"
echo ""
echo "  CUI Registry (NARA -- all CUI categories):"
echo "    https://www.archives.gov/cui"
echo ""
echo "  SPRS Portal (where scores get submitted):"
echo "    https://www.sprs.csd.disa.mil/nistsp.htm"
echo ""
echo "  Cyber-AB (CMMC Accreditation Body -- C3PAO directory):"
echo "    https://cyberab.org/"
echo ""
echo "  DoD CIO CMMC Resources Hub:"
echo "    https://dodcio.defense.gov/CMMC/Resources-Documentation/"
echo ""
echo "  Federal Register CMMC Final Rule (full text + preamble):"
echo "    https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program"
echo ""
echo "  32 CFR Part 2002 (CUI Program Implementation):"
echo "    https://www.ecfr.gov/current/title-32/subtitle-B/chapter-XX/part-2002"
echo ""
echo "  CISA Cybersecurity Advisories:"
echo "    https://www.cisa.gov/news-events/cybersecurity-advisories"
echo ""

# ============================================================
# SUMMARY
# ============================================================
echo "============================================================"
echo "DOWNLOAD SUMMARY"
echo "============================================================"
echo ""

# Count files
PDF_COUNT=$(find "$BASE_DIR" -name "*.pdf" | wc -l | tr -d ' ')
XLSX_COUNT=$(find "$BASE_DIR" -name "*.xlsx" | wc -l | tr -d ' ')
DOCX_COUNT=$(find "$BASE_DIR" -name "*.docx" | wc -l | tr -d ' ')
TOTAL=$((PDF_COUNT + XLSX_COUNT + DOCX_COUNT))

echo "Downloaded files:"
echo "  PDFs:  $PDF_COUNT"
echo "  XLSX:  $XLSX_COUNT"
echo "  DOCX:  $DOCX_COUNT"
echo "  TOTAL: $TOTAL"
echo ""
echo "Folder structure:"
echo "  01-tier1-core-regulatory/     -- The exam + grading rubric"
echo "  02-tier2-supporting-standards/ -- Parent standards + reference"
echo "  03-tier3-deep-reference/       -- Supplemental guidance"
echo "  04-tier4-adjacent-govcon/      -- ITAR/EAR/FISMA (web-only)"
echo "  05-templates-official/         -- NIST SSP + POA&M templates"
echo "  06-gap-fill-templates/         -- Your TNDS templates (build here)"
echo ""
echo "11 web pages listed above need to be bookmarked or"
echo "saved as PDF from your browser (they're live regulations)."
echo ""
echo "Done."
