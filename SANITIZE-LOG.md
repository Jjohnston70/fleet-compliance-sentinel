# SANITIZE-LOG

**Repository:** Fleet-Compliance Sentinel (FCS) — Public Mirror
**Operation:** History rewrite for public release
**Date:** 2026-04-23
**Owner:** Jacob Johnston, True North Data Strategies LLC

---

## Purpose

This log documents the sanitization process applied to the Fleet-Compliance Sentinel repository before publication to GitHub. It serves as an audit trail for anyone reviewing the provenance of the public repo.

## Overview

The source repository was a production-grade SOC 2 observation-window codebase containing real client identifiers, operator PII, internal filesystem paths, and confidential documentation not intended for public release. The repository was rewritten in place using `git-filter-repo` over two working sessions on 2026-04-23. All commits were preserved; content was modified or removed to strip identifying data before the force-push to the public remote.

## Scrubbed Content

### Text substitutions (filter-repo --replace-text)

Applied across the entire git history:

- Client organization name (six case variants) replaced with a generic placeholder
- Five real Vehicle Identification Numbers replaced with sample VINs
- Personal filesystem path replaced with `<REPO_ROOT>`
- Personal home address replaced with a generic placeholder
- Personal phone number replaced with `555-555-5555` (applied to text files only; binary Office files handled separately)

The full substitution mapping is preserved privately in `pii-replacements.txt` (gitignored; not in public history).

### Binary file deletions (filter-repo --invert-paths)

Sixty PDF files were removed from the entire git history. These contained client-confidential documentation, audit reports, and internal compliance artifacts not safe for public distribution. Three reference PDFs were preserved (Audit Manual, Procedures Manual, ODBC Guide) because they contain no client data.

Deletion paths preserved privately in `pdfs-to-delete.txt` (gitignored).

### Binary Office files (pre-commit deletion)

Six DOCX files were deleted from the working tree before the final commit. These files carried PII inside ZIP-compressed Office containers that `git-filter-repo`'s text-replacement pass cannot reach. All files are regenerable from source data pipelines in this repository:

- `tooling/ML-EIA-PETROLEUM-INTEL/output/reports/petroleum_executive_summary_20260331.docx`
- `tooling/ML-SIGNAL-STACK-TNCC/reports/SignalStack_Report_2026-W13.docx`
- `tooling/ML-SIGNAL-STACK-TNCC/reports/SignalStack_Report_2026-W14.docx`
- `tooling/MOD-PAPERSTACK-PP/Pipeline_Flyer.docx`
- `tooling/MOD-PAPERSTACK-PP/TNDS_UserManual_InvoiceExtractionModule_2026-03-26.docx`
- `tooling/MOD-PAPERSTACK-PP/invoice-module/TNDS_UserManual_InvoiceExtractionModule_2026-03-26.docx`

## Preserved Content

The following references remain intact and are intentionally public:

- Brand name "True North Data Strategies" and "TNDS"
- Contact email `jacob@truenorthstrategyops.com`
- GitHub username `Jjohnston70`
- Domain `truenorthstrategyops.com`
- CFR regulatory knowledge base (`knowledge/cfr-index/chunks.json`, verified clean of PII canaries)
- All source code, architecture documentation, migration scripts, and SOC 2 procedural records
- Three preserved PDFs (Audit Manual, Procedures Manual, ODBC Guide)

## Deferred Items

These items were identified during sanitization but deferred to keep scope controlled. None are blockers for public release; they are cosmetic or naming-hygiene improvements for a future session:

- Internal codename rewrite across ~114 files (requires surgical pattern matching to avoid false positives)
- Additional driver-name scrubs
- Filename rewrites via `--path-rename` (some filenames still carry legacy codename references)

## Technical Approach

- Tool: `git-filter-repo` 2.47.0
- All commit SHAs were rewritten; force-push was required to the public remote because local and remote histories share no common ancestry after rewrite
- Verification: pickaxe history scans (`git log --all -p -S`) and working-tree grep for all PII canaries
- Local safety net: branch `backup-before-sanitize-2026-04-23` pinned pre-rewrite state (also rewritten by filter-repo; true pre-rewrite history is available in reflog for ~90 days locally)

## Contact

Jacob Johnston
True North Data Strategies LLC
jacob@truenorthstrategyops.com
