# CMMC Knowledge Base -- Conversion Log

**Last Updated:** 2026-03-07 18:30
**Total Markdown Files:** 28
**From PDF conversion:** 17
**From XLSX conversion:** 1
**From DOCX conversion:** 2
**From web page capture:** 11 (1 Chrome download + 10 reference builds)
**Still Missing (need Chrome re-download):** 6 PDFs

---

## Current Status: 28 of 34 Target Files Complete

### What's Done

| Tier | Files | Status |
|------|-------|--------|
| 01-tier1-core-regulatory | 5 markdown files | 4 from PDF + 1 from XLSX. Missing 5 dodcio PDFs |
| 02-tier2-supporting-standards | 8 markdown files | All 8 complete |
| 03-tier3-deep-reference | 2 markdown files | Missing 1 dodcio PDF (L2 v2.0 Original) |
| 04-tier4-adjacent-govcon | 11 markdown files | 1 Chrome capture + 10 reference builds |
| 05-templates-official | 2 markdown files | Both complete (SSP + POA&M) |

### Files Still Missing -- Need Browser Download

These 6 PDFs from dodcio.defense.gov cannot be downloaded via curl/wget (bot protection).
They must be downloaded manually through a browser and placed in `01-tier1-core-regulatory/`:

| File | URL | Pages |
|------|-----|-------|
| CMMC-Model-Overview-v2.13.pdf | https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview.pdf | 46 |
| CMMC-Scoping-Guide-Level2-v2.13.pdf | https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2v2.pdf | 16 |
| CMMC-Scoping-Guide-Level2.pdf | https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideLevel2.pdf | 16 |
| CMMC-Assessment-Guide-Level1-v2.13.pdf | https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf | 54 |
| CMMC-Assessment-Guide-Level3-v2.13.pdf | https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3v2.pdf | 90 |
| CMMC-Assessment-Guide-Level2-v2.0-Original.pdf | https://dodcio.defense.gov/Portals/0/Documents/CMMC/AG_Level2_MasterV2.0_FINAL_202112016_508.pdf | 271 |

After downloading, re-run `convert_to_markdown.py` to convert them.

---

## Full Conversion Log

### Tier 1: Core Regulatory (5 files)

| Status | File | Details |
|--------|------|---------|
| OK | `DoD-Assessment-Methodology-v1.2.1.md` | Converted 21/21 pages, 51,807 chars |
| OK | `NIST-SP-800-171A-assessment-procedures.md` | Converted 2 sheets, 408 rows |
| OK | `NIST-SP-800-171A.md` | Converted 93/93 pages, 252,254 chars |
| OK | `NIST-SP-800-171r2.md` | Converted 114/114 pages, 303,497 chars |
| OK | `CMMC-Assessment-Guide-Level2-v2.13.md` | Converted 275/276 pages, 513,243 chars (Chrome download) |

### Tier 2: Supporting Standards (8 files)

| Status | File | Details |
|--------|------|---------|
| OK | `CUI-Marking-Handbook-v1.1.md` | Converted 41/41 pages, 54,282 chars |
| OK | `NIST-CSF-2.0.md` | Converted 32/32 pages, 69,733 chars |
| OK | `NIST-SP-800-172.md` | Converted 84/84 pages, 215,209 chars |
| OK | `NIST-SP-800-34r1.md` | Converted 149/149 pages, 400,610 chars |
| OK | `NIST-SP-800-37r2.md` | Converted 183/183 pages, 653,367 chars |
| OK | `NIST-SP-800-53r5.md` | Converted 492/492 pages, 1,651,613 chars |
| OK | `NIST-SP-800-61r3.md` | Converted 48/48 pages, 107,986 chars |
| OK | `NIST-SP-800-88r1.md` | Converted 65/65 pages, 165,492 chars |

### Tier 3: Deep Reference (2 files)

| Status | File | Details |
|--------|------|---------|
| OK | `C2M2-CMMC-Supplemental-Guidance.md` | Converted 167/168 pages, 296,011 chars |
| OK | `NIST-SP-800-63B.md` | Converted 80/80 pages, 202,509 chars |

### Tier 4: Adjacent GovCon (11 files)

| Status | File | Details |
|--------|------|---------|
| OK | `32-CFR-Part-170-CMMC-Program-Rule.md` | Chrome download, 150K chars |
| OK | `DFARS-252.204-7012-Safeguarding-CDI.md` | Reference build, 16K |
| OK | `DFARS-252.204-7021-CMMC-Requirements.md` | Reference build, 26K |
| OK | `FAR-52.204-21-Basic-Safeguarding.md` | Reference build, 33K |
| OK | `CUI-Registry-NARA.md` | Reference build, 25K |
| OK | `SPRS-Portal-Reference.md` | Reference build, 23K |
| OK | `CyberAB-CMMC-Accreditation-Body.md` | Reference build, 22K |
| OK | `DoD-CIO-CMMC-Resources-Hub.md` | Reference build, 24K |
| OK | `Federal-Register-CMMC-Final-Rule.md` | Reference build, 21K |
| OK | `32-CFR-Part-2002-CUI-Program.md` | Reference build, 24K |
| OK | `CISA-Cybersecurity-Advisories.md` | Reference build, 22K |

### Tier 5: Templates (2 files)

| Status | File | Details |
|--------|------|---------|
| OK | `NIST-CUI-POAM-Template.md` | Converted 1 table, 1.3K |
| OK | `NIST-CUI-SSP-Template.md` | Converted 116 tables, 15,040 chars |

---

## Archived Originals

All successfully converted PDFs/XLSX/DOCX moved to `archive-originals/` (by tier).
7 failed initial downloads moved to `archive-originals/failed-downloads/`.

---

## Vector DB Readiness

All 28 markdown files include:
- YAML frontmatter (title, source_file/source_url, source_type, chunk_strategy)
- Chunk boundary markers (`<!-- chunk: page_X -->` or `<!-- chunk: section_X -->`)
- Consistent heading hierarchy for section-based splitting
