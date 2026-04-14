# COMMANDSTACK Knowledge Migration Notes
Generated: 2026-04-14
Source repo: FCS (00-FLEET-COMPLIANCE-SENTINEL)
Target: COMMANDSTACK_vs.0.0.1 → data/knowledge-base/

## Changes Made in FCS (Apply These to COMMANDSTACK)

### 1. clearinghouse.md — REPLACE IN COMMANDSTACK
File to update: data/knowledge-base/domains/clearinghouse.md
Action: Delete existing content. Copy the new content from:
  FCS: knowledge/domains/clearinghouse.md (2026-04-14 output)
Same Swagger bug exists in COMMANDSTACK. Must be fixed there too.

**What changed:** The file previously contained a raw Swagger UI page dump of the FMCSA
SDLA REST API (State Driver Licensing Agency endpoints for querying the Clearinghouse).
This was API reference documentation for state agencies, NOT employer compliance guidance.

**What it now contains:** Authoritative employer-facing Clearinghouse compliance guidance
covering 49 CFR Part 382, Subpart G. 10 sections with section-level CFR citations
(citation level 4). Topics: registration, pre-employment queries, annual queries,
prohibited status, reporting obligations, RTD process, record retention, penalties,
and a practical employer checklist.

### 2. SOURCE_MANIFEST.json — UPDATE COMMANDSTACK v2.0
File: data/SOURCE_MANIFEST.json
Update only the fmcsa-clearinghouse entry to match these FCS v1.0 updates:
- `lastUpdated`: "2026-04-14"
- `lastChecked`: "2026-04-14"
- Add `contentType`: "employer-compliance-guidance"
- Add `citationLevel`: 4
- Update `notes` to: "Employer-facing Clearinghouse compliance guidance covering 49 CFR Part 382 Subpart G: pre-employment and annual query requirements, prohibited status obligations, reporting timelines, RTD process, record retention, and penalty thresholds. Replaced SDLA REST API Swagger dump on 2026-04-14."

Do not add new entries or remove existing ones.

### 3. chunks.json — REBUILD RECOMMENDED (NOT REQUIRED FOR CONTAMINATION FIX)
File: data/knowledge-base/cfr/chunks.json

**Contamination audit result from FCS:** 0 contaminated chunks found. The Swagger dump
in clearinghouse.md was never indexed into chunks.json. No emergency rebuild needed.

**However:** The new employer guidance content in clearinghouse.md is also NOT currently
indexed. To make this content available to Pipeline Penny's vector store, a chunk rebuild
is needed to ADD the new clearinghouse content.

Check: search for "SDLA", "Swagger", "/api/Driver" in chunks.json.
If found: run the CFR index rebuild script.
If not found (expected): rebuild is still recommended to index the new content.

### 4. DO NOT MIGRATE TO COMMANDSTACK (FCS-specific)
- .claude/ skill packs and agent configs (FCS-specific)
- soc2-evidence/ folder (FCS production evidence only)
- migrations/ folder (FCS has 19 migrations; COMMANDSTACK has separate DB)
- tooling/ modules (already present in COMMANDSTACK as modules/)
- railway-backend/ (FCS production backend; COMMANDSTACK has separate services/)

### 5. What COMMANDSTACK Already Has That Is Correct
- data/knowledge-base/fmcsa-dot/ — cleaned FMCSA CFR files (7 parts + meta)
- data/knowledge-base/cfr/ raw eCFR files (need nav chrome removal — separate task)
- data/training-content/ — identical to FCS, no changes needed
- data/knowledge-base/tnds-protocols/ — COMMANDSTACK-specific, do not touch

## Knowledge Content That Exists Only in FCS (Not Yet in COMMANDSTACK)
- clearinghouse employer guidance (this session's output — add to COMMANDSTACK)
- phmsa-training OTIS module content (same markdown, already in both)

## Recommended Next Session for COMMANDSTACK
1. Replace COMMANDSTACK data/knowledge-base/domains/clearinghouse.md
2. Run metadata auditor on data/knowledge-base/cfr/chunks.json
3. Strip eCFR nav chrome from raw data/knowledge-base/cfr/ markdown files
   (use data/knowledge-base/fmcsa-dot/ cleaned versions as reference)
4. Run audit script: python commandstack-metadata-auditor/scripts/audit.py
   data/knowledge-base/cfr/chunks.json full_audit
5. Rebuild chunk index to include new clearinghouse employer guidance content
