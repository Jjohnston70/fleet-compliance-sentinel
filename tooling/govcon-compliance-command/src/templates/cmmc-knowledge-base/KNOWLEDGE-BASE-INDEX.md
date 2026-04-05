# CMMC Knowledge Base -- Document Index

**Purpose:** Complete reference library for building the CMMC Operational Readiness Package
**Created:** 2026-03-07
**Gap Fill Target:** 10 identified gaps from the Master Playbook

---

## Folder Structure

```
cmmc-knowledge-base/
|
|-- 01-tier1-core-regulatory/          <-- READ THESE FIRST
|   |-- NIST-SP-800-171r2.pdf              The 110 controls (the exam)
|   |-- NIST-SP-800-171A.pdf               320 assessment objectives (grading rubric)
|   |-- NIST-SP-800-171A-assessment-procedures.xlsx  Spreadsheet of all objectives
|   |-- CMMC-Assessment-Guide-Level2-v2.13.pdf       What C3PAOs actually check
|   |-- CMMC-Scoping-Guide-Level2.pdf                What's in scope
|   |-- CMMC-Scoping-Guide-Level2-v2.13.pdf          Updated scoping (Sep 2024)
|   |-- CMMC-Model-Overview-v2.13.pdf                Three levels explained
|   |-- DoD-Assessment-Methodology-v1.2.1.pdf        SPRS scoring weights
|   |-- CMMC-Assessment-Guide-Level1-v2.13.pdf       Level 1 self-assessment
|   |-- CMMC-Assessment-Guide-Level3-v2.13.pdf       Level 3 reference
|
|-- 02-tier2-supporting-standards/     <-- REFERENCE AS NEEDED
|   |-- NIST-SP-800-53r5.pdf               Full control catalog (parent of 800-171)
|   |-- NIST-SP-800-172.pdf                Enhanced requirements (Level 3)
|   |-- NIST-CSF-2.0.pdf                   Cybersecurity Framework 2.0
|   |-- NIST-SP-800-37r2.pdf               Risk Management Framework
|   |-- NIST-SP-800-61r3.pdf               Incident Handling Guide
|   |-- NIST-SP-800-88r1.pdf               Media Sanitization Guidelines
|   |-- NIST-SP-800-34r1.pdf               Contingency Planning Guide
|   |-- CUI-Marking-Handbook-v1.1.pdf      How to mark CUI documents
|
|-- 03-tier3-deep-reference/           <-- SPECIALIZED USE
|   |-- C2M2-CMMC-Supplemental-Guidance.pdf   DOE crosswalk
|   |-- NIST-SP-800-63B.pdf                   Digital Identity / MFA
|   |-- CMMC-Assessment-Guide-Level2-v2.0-Original.pdf  Original 2021 version
|
|-- 04-tier4-adjacent-govcon/          <-- WEB PAGES (save from browser)
|   |-- (see bookmarks list below)
|
|-- 05-templates-official/             <-- NIST OFFICIAL TEMPLATES
|   |-- NIST-CUI-SSP-Template.docx        System Security Plan template
|   |-- NIST-CUI-POAM-Template.docx       Plan of Action & Milestones template
|
|-- 06-gap-fill-templates/             <-- YOUR TNDS TEMPLATES GO HERE
|   |-- (build these to fill the 10 gaps)
|
|-- download-all-cmmc-docs.sh          <-- RUN THIS TO DOWNLOAD EVERYTHING
|-- KNOWLEDGE-BASE-INDEX.md            <-- THIS FILE
```

---

## Gap-to-Source Mapping

Which downloaded documents feed which gap templates:

| Gap | Template to Build | Source Documents to Reference |
|-----|------------------|------------------------------|
| 1. SSP Template | Client-facing SSP with guided prompts | `NIST-CUI-SSP-Template.docx` + `NIST-SP-800-171r2.pdf` |
| 2. SPRS Scoring Worksheet | Excel auto-calculator | `DoD-Assessment-Methodology-v1.2.1.pdf` + `NIST-SP-800-171A-assessment-procedures.xlsx` |
| 3. POA&M Template | Client-ready with 180-day tracking | `NIST-CUI-POAM-Template.docx` |
| 4. Network Diagram Guide | SMB topology examples | `CMMC-Scoping-Guide-Level2.pdf` (asset categories) |
| 5. Asset Inventory Template | Categorized by CMMC scoping classes | `CMMC-Scoping-Guide-Level2.pdf` + `CMMC-Scoping-Guide-Level2-v2.13.pdf` |
| 6. CUI ID & Marking Guide | Identification checklist | `CUI-Marking-Handbook-v1.1.pdf` + CUI Registry (web) |
| 7. Enclave Scoping Guide | Decision criteria + patterns | `CMMC-Scoping-Guide-Level2.pdf` + `CMMC-Assessment-Guide-Level2-v2.13.pdf` |
| 8. 14 Policy Templates | One per NIST 800-171 family | `NIST-SP-800-171r2.pdf` (all 14 families) |
| 9. Evidence Collection Guide | Per-family artifact checklist | `CMMC-Assessment-Guide-Level2-v2.13.pdf` + `NIST-SP-800-171A.pdf` |
| 10. DFARS 7012 IR Playbook | 72-hour response steps | `NIST-SP-800-61r3.pdf` + DFARS 7012 (web) |

---

## Web Pages to Bookmark / Save as PDF

These are live regulations and portals. Open in browser and either bookmark or Print > Save as PDF:

1. **32 CFR Part 170** (CMMC Program Rule)
   https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-G/part-170

2. **DFARS 252.204-7012** (Safeguarding CDI + Cyber Incident Reporting)
   https://www.acquisition.gov/dfars/252.204-7012-safeguarding-covered-defense-information-and-cyber-incident-reporting.

3. **DFARS 252.204-7021** (CMMC Requirements Clause)
   https://www.federalregister.gov/documents/2025/09/10/2025-17359/defense-federal-acquisition-regulation-supplement-assessing-contractor-implementation-of

4. **FAR 52.204-21** (Basic Safeguarding -- Level 1 Controls)
   https://www.acquisition.gov/far/52.204-21

5. **CUI Registry** (All CUI categories and marking requirements)
   https://www.archives.gov/cui

6. **SPRS Portal** (Score submission)
   https://www.sprs.csd.disa.mil/nistsp.htm

7. **Cyber-AB** (CMMC Accreditation Body -- C3PAO directory)
   https://cyberab.org/

8. **DoD CIO CMMC Hub** (Official resource page)
   https://dodcio.defense.gov/CMMC/Resources-Documentation/

9. **Federal Register CMMC Final Rule** (Full text + preamble)
   https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program

10. **32 CFR Part 2002** (CUI Program Implementation by NARA)
    https://www.ecfr.gov/current/title-32/subtitle-B/chapter-XX/part-2002

11. **CISA Cybersecurity Advisories** (Current threat intel)
    https://www.cisa.gov/news-events/cybersecurity-advisories

---

## Reading Order for SME-Level Knowledge

If you read these in this order and retain the content, you will know more about CMMC operational requirements than 90% of consultants in this space:

**Week 1 -- Foundation**
1. `CMMC-Model-Overview-v2.13.pdf` (30 min) -- The big picture
2. `NIST-SP-800-171r2.pdf` (2-3 hours) -- The 110 controls. Read every one.
3. `DoD-Assessment-Methodology-v1.2.1.pdf` (1 hour) -- How scoring works

**Week 2 -- Assessment Depth**
4. `CMMC-Assessment-Guide-Level2-v2.13.pdf` (3-4 hours) -- What assessors check
5. `NIST-SP-800-171A.pdf` (2-3 hours) -- The 320 objectives
6. `CMMC-Scoping-Guide-Level2.pdf` (1 hour) -- Asset categories, boundary definition

**Week 3 -- Supporting Knowledge**
7. `CUI-Marking-Handbook-v1.1.pdf` (30 min) -- How to mark documents
8. `NIST-SP-800-61r3.pdf` (1 hour) -- Incident handling
9. `NIST-SP-800-88r1.pdf` (30 min) -- Media sanitization
10. Web: 32 CFR Part 170 + DFARS 7012 + FAR 52.204-21 (1 hour) -- The legal chain

**Week 4 -- Advanced**
11. `NIST-SP-800-53r5.pdf` (skim for context, 2 hours) -- Parent catalog
12. `NIST-SP-800-37r2.pdf` (1 hour) -- Risk management framework
13. `NIST-CSF-2.0.pdf` (1 hour) -- Broader framework context
14. `NIST-SP-800-63B.pdf` (30 min) -- Authentication requirements

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
True North Data Strategies -- Colorado Springs, CO
