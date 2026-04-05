Goal

Convert FEDERAL-COMPLIANCE-TEMPLATE/ (87 files, 7 packages) into a PII-free, reusable federal compliance skill system structured like the existing sales-operations skills. Convert completed audits/reviews into reusable checklist templates.



Phase 0: Setup — Create Target Directory Structure ✅ COMPLETE

Created the new skill directory tree inside FEDERAL-COMPLIANCE-TEMPLATE/:

federal-compliance-skills/

├── README.md ✅

├── LIFECYCLE.md ✅

├── PLAYBOOK.md ✅

├── DISPOSITION.md ✅

├── shared-reference/

│   ├── compliance-framework-map.md

│   ├── package-dependency-matrix.md

│   ├── universal-principles.md

│   └── retention-schedule.md

├── internal-compliance/          (from Package 1, 21 docs)

│   ├── SKILL.md

│   └── templates/

├── security-governance/          (from Package 2, 1 master doc)

│   ├── SKILL.md

│   └── templates/

├── data-handling-privacy/        (from Package 3, 7 docs)

│   ├── SKILL.md

│   └── templates/

├── government-contracting/       (from Package 4, 9 docs)

│   ├── SKILL.md

│   └── templates/

├── cloud-platform-security/      (from Package 5, 7 docs)

│   ├── SKILL.md

│   └── templates/

├── business-operations/          (from Package 6, 10 docs)

│   ├── SKILL.md

│   └── templates/

├── contracts-risk-assurance/     (from Package 7, 10 docs)

│   ├── SKILL.md

│   └── templates/

├── compliance-audit/             (from 5 cross-cutting review docs)

│   ├── SKILL.md

│   ├── templates/

│   └── reference/

├── compliance-research/          (from RESEARCH\_DOCUMENTS, 8 docs)

│   ├── SKILL.md

│   └── reference/

└── compliance-usage/             (from USAGE\_DOCUMENTS, 7 docs)

&nbsp;   ├── SKILL.md

&nbsp;   └── reference/

10 skills total (7 policy + 1 audit + 1 research + 1 usage).



## PROGRESS UPDATE (2026-02-07)

### CURRENT SCOPE: Packages 1, 5, 6, 7 COMPLETE

**Package 1 (internal-compliance)** ✅ COMPLETE & VERIFIED
- Templates: 21/21 written ✅
- SKILL.md: Complete ✅
- PII Removal: Verified clean ✅
- File Naming: All standardized (kebab-case) ✅
- Cross-references: Updated to skill-based references ✅
- Verification Date: 2026-02-07

**Package 7 (contracts-risk-assurance)** ✅ COMPLETE & VERIFIED
- Templates: 10/10 written ✅
- SKILL.md: Complete ✅
- PII Removal: Verified clean ✅
- File Naming: All standardized (kebab-case) ✅
- Cross-references: Updated to skill-based references ✅
- Verification Date: 2026-02-07

**Package 5 (cloud-platform-security)** ✅ COMPLETE & VERIFIED
- Templates: 7/7 written ✅
- SKILL.md: Complete ✅
- PII Removal: Verified clean ✅
- File Naming: All standardized (kebab-case) ✅
- Vendor Neutralization: Complete (Google → [CLOUD_PROVIDER], etc.) ✅
- Cross-references: Updated to skill-based references ✅
- Verification Date: 2026-02-07

**Package 6 (business-operations)** ✅ COMPLETE & VERIFIED
- Templates: 10/10 written ✅
- SKILL.md: Complete ✅
- PII Removal: Verified clean ✅
- File Naming: All standardized (kebab-case) ✅
- Cross-references: Updated to skill-based references ✅
- Verification Date: 2026-02-07

### Completed Package Summary (7/10 packages) — ALL POLICY PACKAGES COMPLETE! 🎉

| Package | Templates | SKILL.md | Status |
|---------|-----------|----------|--------|
| Package 1 (internal-compliance) | 21/21 ✅ | ✅ | COMPLETE |
| Package 2 (security-governance) | 1/1 ✅ | ✅ | COMPLETE (MASTER DOC) |
| Package 3 (data-handling-privacy) | 7/7 ✅ | ✅ | COMPLETE |
| Package 4 (government-contracting) | 9/9 ✅ | ✅ | COMPLETE |
| Package 5 (cloud-platform-security) | 7/7 ✅ | ✅ | COMPLETE |
| Package 6 (business-operations) | 10/10 ✅ | ✅ | COMPLETE |
| Package 7 (contracts-risk-assurance) | 10/10 ✅ | ✅ | COMPLETE |

**Total Progress: 65 templates + 7 SKILL.md files = 72 files complete**

**All 7 policy packages complete! Remaining work: audit/review conversions and reference documentation.**

### 🎉 ALL 10 PACKAGES COMPLETE! 🎉

| Package | Templates/Reference | SKILL.md | Status |
|---------|-----------|----------|--------|
| Package 1 (internal-compliance) | 21 templates ✅ | ✅ | COMPLETE |
| Package 2 (security-governance) | 1 template ✅ | ✅ | COMPLETE (MASTER DOC) |
| Package 3 (data-handling-privacy) | 7 templates ✅ | ✅ | COMPLETE |
| Package 4 (government-contracting) | 9 templates ✅ | ✅ | COMPLETE |
| Package 5 (cloud-platform-security) | 7 templates ✅ | ✅ | COMPLETE |
| Package 6 (business-operations) | 10 templates ✅ | ✅ | COMPLETE |
| Package 7 (contracts-risk-assurance) | 10 templates ✅ | ✅ | COMPLETE |
| compliance-audit | 4 templates + 1 reference ✅ | ✅ | COMPLETE |
| compliance-research | 7 reference docs ✅ | ✅ | COMPLETE |
| compliance-usage | 7 reference docs ✅ | ✅ | COMPLETE |

**Total Files Created:**
- **Policy Templates:** 65 files
- **Audit Templates:** 4 files
- **Reference Documents:** 15 files (1 audit scoring + 7 research + 7 usage)
- **SKILL.md Files:** 10 files
- **Shared Reference:** 4 files
**Composite Documents:** 4 files (README, LIFECYCLE, PLAYBOOK, DISPOSITION)
**GRAND TOTAL:** 102 files

### 🎉 PROJECT STATUS: 100% COMPLETE! 🎉

**All Phases Complete:**
- ✅ Phase 0: Directory Structure Created
- ✅ Phase 1: PII Removal + File Conversion (94 skill files)
- ✅ Phase 2: Audit-to-Template Conversion (completed in compliance-audit)
- ✅ Phase 3: Shared Reference Files (4 files)
- ✅ Phase 4: SKILL.md Files (10 files - completed in Phase 1)
- ✅ Phase 5: Composite Documents (4 files)
- ✅ Phase 6: Verification (PASSED - 0 PII found, 948 placeholders verified)

**Final Output:** 102 markdown files ready for production use!

### Packages 1, 5, 6, 7 Status: READY FOR USE ✅

No further work required on completed packages unless user requests modifications.

---

Phase 1: PII Removal + File Rename + Copy to New Structure ✅ COMPLETE (100%)

All 10 skill packages complete! 94 files created (65 policy templates + 4 audit templates + 15 reference docs + 10 SKILL.md files)

PII Replacement Map (~1,328 occurrences across 82+ files)

PIIPlaceholderTrue North Data Strategies LLC\[COMPANY\_LEGAL\_NAME]True North Data Strategies\[COMPANY\_NAME]TNDS (in prose, not filenames)\[COMPANY\_ABBREVIATION]Jacob Johnston\[OWNER\_NAME]jacob@truenorthstrategyops.com\[CONTACT\_EMAIL]555-555-5555\[CONTACT\_PHONE]123 Example St\[COMPANY\_ADDRESS]Colorado Springs, CO 80909\[COMPANY\_CITY\_STATE\_ZIP]Colorado Springs\[COMPANY\_CITY]truenorthstrategyops.com / www.truenorthstrategyops.com\[COMPANY\_WEBSITE]WKJXXACV8U43\[COMPANY\_UEI]16TC1\[COMPANY\_CAGE\_CODE]41-2572060\[COMPANY\_EIN]20251659916\[STATE\_REGISTRATION\_ID]November 13, 2026 (SAM expiry)\[SAM\_EXPIRATION\_DATE]SDVOSB / Service-Disabled Veteran-Owned Small Business\[BUSINESS\_DESIGNATION]Carahsoft\[CLOUD\_PARTNER\_RESELLER]Colorado (as governing law/jurisdiction)\[GOVERNING\_STATE]Specific dates (Nov 2025, Jan 2025, etc.)\[DOCUMENT\_DATE]100% service-disabled veteran\[OWNER\_VETERAN\_STATUS]

File Rename Convention



Remove TNDS\_ prefix from all filenames

Remove XX\_ numeric prefix, replace with XX- (kebab-case)

Lowercase all filenames

Remove vendor names (GOOGLE\_ → cloud-)

Example: 01\_TNDS\_INFORMATION\_SECURITY\_POLICY.md → 01-information-security-policy.md



Cross-Reference Updates

Replace package references in prose:



"Package 1 (Internal Compliance)" → "internal-compliance skill"

"Package 2 ..." → "security-governance skill"

"Package 3 ..." → "data-handling-privacy skill"

"Package 4 ..." → "government-contracting skill"

"Package 5 ..." → "cloud-platform-security skill"

"Package 6 ..." → "business-operations skill"

"Package 7 ..." → "contracts-risk-assurance skill"



Execution Order



Start with Package 7 (fewest PII, validate approach)

Package 1 (21 files, highest volume)

Packages 3, 5, 6 (medium complexity)

Package 4 (highest PII density — capability statement)

Package 2 (master governance doc)

Research + Usage docs

Verification: grep entire target for ALL PII strings — must return zero



Exclusions



TNDS\_Handbook\_2025\_Final.docx — exclude (markdown version has same content)

PACKAGE\_1/INTERNAL\_REVIEW\_DOCUMENTATION REVIEW.md — duplicate of root-level copy, remove

FIXES TO HANDBOOK.md — merge key content into shared-reference/universal-principles.md





Phase 2: Audit-to-Template Conversion (5 documents → reusable checklists)

2a. FINAL\_PACKAGE\_EVALUATION.md → compliance-audit/templates/package-maturity-assessment.md



Extract scoring framework (categories, criteria, rating scale)

Replace all TNDS findings with \[FINDING], scores with \[SCORE]

Add header: \[ORGANIZATION\_NAME], \[REVIEWER\_NAME], \[ASSESSMENT\_DATE]

Keep package-by-package structure as reusable assessment rubric

Add Status/Evidence/Findings columns per checklist item



2b. INTERNAL\_REVIEW\_DOCUMENTATION REVIEW.md → compliance-audit/templates/cross-package-dependency-review.md



Largest conversion (1957 lines)

Extract per-package fix-list format → checklist with \[STATUS], \[OWNER], \[DUE\_DATE]

Extract dependency maps → fill-in dependency template

Extract architecture diagrams → generic framework diagrams

Remove all TNDS-specific ratings and findings



2c. NEEDED COMPLIANCE ITEM LIST.md → compliance-audit/templates/compliance-roadmap-checklist.md



Remove conversational tone and emoji

Structure as formal phased milestone checklist

Add \[STATUS], \[TARGET\_DATE], \[RESPONSIBLE\_PARTY] fields

Generalize items to universal federal compliance milestones



2d. COMPREHENSIVE\_COMPLIANCE\_REVIEW\_2025.md → compliance-audit/templates/comprehensive-compliance-review.md



Extract review methodology as reusable framework

Replace assessments with placeholder fields

Preserve findings structure as template



2e. Create compliance-audit/reference/audit-scoring-criteria.md



Consolidate scoring criteria from documents 2a and 2d





Phase 3: Shared Reference Files (4 files)

FileSourceContentuniversal-principles.mdFIXES TO HANDBOOK + reviewsData-as-regulated, no-PII-in-logs, role-combination principlescompliance-framework-map.mdPkg 4 Gov Readiness + Comprehensive ReviewNIST/ISO/SOC2/HIPAA/FedRAMP mapping templatepackage-dependency-matrix.mdINTERNAL\_REVIEW dependency mapsSkill-to-skill dependency matrix + governance hierarchyretention-schedule.mdRecords Mgmt Policy + cross-doc refsSingle-source retention schedule with \[RETENTION\_PERIOD] fields



Phase 4: Write 10 SKILL.md Files

Each follows the sales-operations pattern (10 sections):



Skill Identity (name, version, status, domain, origin)

Scope (what it does / does NOT do)

Process Definition (compliance areas, decision points, success criteria)

Inputs (what info needed to customize)

Outputs (list of template files)

Reference Data Dependencies (shared-reference + other skills)

Constraints (no execution authority, requires legal review, etc.)

Integration Points (connections to other skills)

Compliance Lifecycle Position (predecessor/successor)

Governance Statement



Write order (dependency order):



security-governance (root)

internal-compliance

data-handling-privacy

cloud-platform-security

government-contracting

business-operations

contracts-risk-assurance

compliance-audit

compliance-research

compliance-usage





Phase 5: Write 4 Composite Documents

README.md



What Is This, Quick Start table, 10 Skills table, directory structure, principles, file inventory, governance



LIFECYCLE.md



Governance hierarchy diagram (security-governance at top)

Skill registry table (10 skills with type, doc count)

Dependency map

6 lifecycle stages: Establish → Define → Implement → Operationalize → Formalize → Assess

Chain invariants (adapted from sales-ops)



PLAYBOOK.md



10 scenarios: new compliance program, federal proposal prep, employee onboarding, incident response, security questionnaire, audit prep, vendor onboarding, data breach, contract closeout, annual review



DISPOSITION.md



Source-to-artifact traceability for all 87 files

PII removal log (categories + placeholder mapping)

Excluded files and rationale

New artifacts created





Phase 6: Verification



PII sweep — grep all target files for every PII string (17 patterns). Must return zero.

Cross-reference integrity — all skill references in SKILL.md files point to existing skills

Template completeness — every template has at least one \[PLACEHOLDER]

File inventory — count matches LIFECYCLE.md and README.md counts

Link check — relative links in composite docs resolve to actual files





Key Files to Modify/Create

Source files (read + transform):



All 65 policy .md files in PACKAGE\_1 through PACKAGE\_7

5 audit/review files (root + PACKAGE\_7 + RESEARCH\_DOCUMENTS)

8 research docs in RESEARCH\_DOCUMENTS/

7 usage docs in USAGE\_DOCUMENTS/



New files to create:



10 SKILL.md files

4 composite docs (README, LIFECYCLE, PLAYBOOK, DISPOSITION)

4 shared-reference files

1 audit scoring criteria reference

~78 renamed/cleaned template files



Files excluded:



TNDS\_Handbook\_2025\_Final.docx (binary, markdown version exists)

Duplicate INTERNAL\_REVIEW in PACKAGE\_1

FIXES TO HANDBOOK.md (merged into shared-reference)





Output Summary

CategoryCountSKILL.md files10Template files~78Reference files (skill-level)~17Shared reference files4Composite documents4Total~113

All PII removed. All audits converted to reusable checklist templates. Full LLM skill structure matching the sales-operations pattern.

