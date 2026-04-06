# Knowledge Base -- Fleet-Compliance Sentinel

**Last Updated:** 2026-04-06
**Owner:** Jacob Johnston, True North Data Strategies

---

## Purpose

This directory contains all regulatory, compliance, and training reference documents used by Pipeline Penny AI and the training LMS. Documents are indexed into vector stores for retrieval-augmented generation (RAG) queries.

---

## Directory Structure

```
knowledge/
  README.md                    -- This file
  SOURCE_MANIFEST.json         -- Source tracking for freshness checks
  cfr-index/                   -- Code of Federal Regulations index (49 CFR)
    chunks.json                -- Pre-chunked CFR content for Penny
  demo-index/                  -- Demo/evaluation knowledge index
    chunks.json                -- Pre-chunked demo content
  domains/                     -- Domain-specific knowledge by topic
    dot-compliance/            -- DOT compliance documents, skills, prompts
    clearinghouse.md           -- FMCSA Drug & Alcohol Clearinghouse
    *.pdf, *.csv               -- Reference documents (audit manual, IFTA, etc.)
  training-content/            -- Training LMS content
    hazmat/                    -- Hazmat training markdown modules (12 modules)
    assessments/               -- Assessment question JSON files
    decks/                     -- Slide deck JSON files (generated from markdown)
  org-data/                    -- Reserved: per-org knowledge (future)
  timeline/                    -- Reserved: compliance event timeline (future)
```

---

## Adding New Knowledge

To add a new knowledge category:

1. Create a subfolder under `knowledge/` (e.g., `knowledge/osha-regulations/`).
2. Place source documents in the subfolder (markdown, PDF, CSV, TXT).
3. Add an entry to `SOURCE_MANIFEST.json` with the source URL, category, and local path.
4. Run `npm run sync:knowledge` to index the new content for Penny.
5. Run `npm run build:cfr-index` if adding CFR-related content.

---

## Freshness Checks

Run `npm run knowledge:check-freshness` to check if source documents have updates available from their originating agencies. See `SOURCE_MANIFEST.json` for tracked sources.

---

## Data Policy

- Knowledge documents are regulatory/reference content, NOT client data.
- Do NOT store PII, client records, or org-specific data in this directory.
- `org-data/` is reserved for future per-org knowledge features (empty for now).
