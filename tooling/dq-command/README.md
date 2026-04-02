# dq-command

DOT Driver Qualification File System for Fleet-Compliance Sentinel.

## Overview

`dq-command` manages the full lifecycle of DOT Driver Qualification Files (DQF) and Drug & Alcohol History Files (DHF) per 49 CFR Part 391. It handles driver self-service intake, document checklist tracking, auto-generation of compliance documents, and a daily sweep that creates suspense items for missing or expiring documents.

Two separate files are legally required per driver. This module manages both:

- **DQF** (Driver Qualification File) -- 49 CFR SS391.51 -- 20 document types tracked
- **DHF** (Drug & Alcohol History File) -- 49 CFR SS391.53 -- 6 document types tracked, stored separately from DQF

## Architecture

Follows the TNDS 6-layer module pattern:

```
dq-command/
  src/
    data/           # Schema types, in-memory repository
    services/       # Business logic (DQ file lifecycle, intake, documents)
    api/            # REST endpoint handlers
    hooks/          # Automation (compliance sweep, suspense creation)
    config/         # Checklist config, intake form schema, thresholds
    reporting/      # (Phase 4) Compliance metrics and dashboards
  tests/            # Vitest unit tests
  migrations/       # SQL migrations (014, 015)
  src/tools.ts      # 11 LLM tool definitions
  manifest.json     # Module manifest
```

## Installation

```bash
cd tooling/dq-command
npm install
```

## Quick Start

### Initialize Service

```typescript
import {
  InMemoryDqRepository,
  DqFileService,
  IntakeService,
  DocumentService,
  DqComplianceSweep,
  createDqTools,
} from '@tnds/dq-command';

const repo = new InMemoryDqRepository();
const fileService = new DqFileService(repo);
const intakeService = new IntakeService(repo);
const documentService = new DocumentService(repo);
```

### Create a DQ File for a New Driver

```typescript
const dqFile = await fileService.createDqFile('org_abc123', {
  driver_id: 'driver_001',
  driver_name: 'John Carter',
  cdl_holder: true,
  hire_date: '2026-04-01',
});

console.log(`Intake token: ${dqFile.intake_token}`);
// Send to driver via: /intake/{token}
```

### Get the Document Checklist

```typescript
const checklist = await fileService.getChecklist(dqFile.id);

console.log(`${checklist.completed_docs}/${checklist.total_docs} docs complete (${checklist.completion_pct}%)`);
for (const item of checklist.items) {
  console.log(`  ${item.doc_label} [${item.status}] ${item.cfr_reference}`);
}
```

### Upload a Document

```typescript
const doc = await documentService.uploadDocument('org_abc123', {
  dq_file_id: dqFile.id,
  doc_type: 'cdl_copy',
  file_path: '/uploads/driver_001/cdl_front.pdf',
  expires_at: '2028-06-15T00:00:00Z',
});
```

### Run a Compliance Sweep

```typescript
const sweep = new DqComplianceSweep(repo);
const result = await sweep.run('org_abc123', false); // set true for dry run

console.log(`Created ${result.suspense_items_created} suspense items`);
console.log(`  Expired: ${result.expired_docs_flagged}`);
console.log(`  Missing: ${result.missing_docs_flagged}`);
console.log(`  Incomplete files: ${result.incomplete_files_flagged}`);
```

### LLM Tool Integration

```typescript
const tools = createDqTools(repo);
// Returns 11 ToolHandler[] for:
// create_dq_file, get_dq_checklist, get_dq_gaps, upload_dq_document,
// generate_dq_document, send_intake_link, get_intake_status,
// mark_doc_verified, run_dq_sweep, get_dq_summary, archive_dq_file
```

## Database Migrations

Two migrations in sequence (run after existing 013):

```bash
# From project root
psql $DATABASE_URL -f tooling/dq-command/migrations/014_dq_files.sql
psql $DATABASE_URL -f tooling/dq-command/migrations/015_dq_retention_flag.sql
```

**014_dq_files.sql** creates four tables: `dq_files`, `dq_documents`, `dq_intake_responses`, `dq_audit_log`.

**015_dq_retention_flag.sql** adds `retention_delete_after` column for 3-year post-termination retention per SS391.51(c).

## API Routes

All routes under `/api/fleet-compliance/dq/`:

### DQ File Management (Clerk auth)

| Route | Method | Purpose |
|-------|--------|---------|
| `/files` | GET | List all DQ files for org with checklist completion % |
| `/files` | POST | Create DQ file record for a driver, generate intake token |
| `/files/[id]` | GET | Get single DQ file with full document checklist |
| `/files/[id]` | PATCH | Update DQ file status, notes |
| `/files/[id]/checklist` | GET | Checklist view -- all docs, status, expiry, gaps |

### Document Operations (Clerk + admin)

| Route | Method | Purpose |
|-------|--------|---------|
| `/documents` | POST | Upload a document (sets status = uploaded) |
| `/documents/[id]` | PATCH | Update doc status, expiry, reviewer notes |
| `/documents/[id]` | DELETE | Soft delete a document record |
| `/documents/generate` | POST | Generate a document from driver data |

### Driver Intake (Token-gated, unauthenticated)

| Route | Method | Purpose |
|-------|--------|---------|
| `/intake/[token]` | GET | Validate intake token, return form schema |
| `/intake/[token]` | POST | Submit intake section data |
| `/intake/[token]/complete` | POST | Mark intake complete, trigger doc generation |

### Compliance

| Route | Method | Purpose |
|-------|--------|---------|
| `/sweep` | POST | Daily sweep -- flag expiring docs, create suspense items |
| `/gaps` | GET | Return all drivers with missing or expiring DQ docs |
| `/summary` | GET | Org-level DQ compliance summary |

## Document Types (26 total)

### DQF Pre-Employment (one-time)

| Document | CFR | Source |
|----------|-----|--------|
| Application for Employment | SS391.21 | Generated from intake |
| Record of Violations (12-month) | SS391.27 | Generated from intake |
| Road Test Certificate | SS391.31 | Generated + signed |
| CDL Copy | SS391.33 | Uploaded |
| Pre-Employment MVR (3-year) | SS391.23(a)(1) | Uploaded |
| Previous Employer Investigation | SS391.23(d) | Uploaded |
| D&A History Inquiry | SS391.23(e) | Uploaded |
| Clearinghouse Full Query | SS382.701 | Uploaded |
| Clearinghouse Consent (Pre-Emp) | SS382.701(b) | Generated |
| Medical Examiner Certificate | SS391.43 | Uploaded (non-CDL) |
| CDLIS MVR | SS384.105 | Uploaded (CDL only) |
| NRCME Verification Note | SS391.23(m)(1) | Generated |

### DQF Conditional

| Document | CFR | Condition |
|----------|-----|-----------|
| Entry-Level Driver Training Cert | SS380.509(b) | CDL + <1yr experience |
| SPE Certificate | SS391.49 | If applicable |
| Medical Exemption Letter | Part 381 | If applicable |

### DQF Annual Recurring

| Document | CFR | Cadence |
|----------|-----|---------|
| MVR Annual Update | SS391.25(a) | Annual |
| Annual Review Note | SS391.25(c)(2) | Annual |
| Medical Certificate Renewal | SS391.45 | Every 24 months |
| Clearinghouse Limited Query | SS382.701(b) | Annual |
| Clearinghouse Consent (Annual) | SS382.701 | Annual |

### DHF (Drug & Alcohol History File)

| Document | CFR | Source |
|----------|-----|--------|
| D&A Records Authorization | SS391.23(e) | Generated |
| Previous Employer D&A Responses | SS391.23(e) | Uploaded |
| Pre-Employment Drug Test Result | SS382.301 | Uploaded |
| DHF Clearinghouse Query Result | SS382.701 | Uploaded |
| SAP Referral & RTD Records | SS382.605 | Conditional |
| Follow-Up Testing Records | 40 Subpart O | Conditional |

## Driver Intake Flow

Token-gated, unauthenticated multi-step form. Driver fills in their own data to maintain the SS391.21 certification chain.

**Sections:**

1. Personal Information -- name, DOB, SSN (last 4 only), address history (3yr)
2. Licensing -- CDL/license number, class, endorsements, states licensed (3yr)
3. Employment History -- 3yr non-CDL / 10yr CDL, FMCSA/D&A flags per employer
4. Record of Violations -- traffic violations (non-parking) past 12 months
5. Certifications & Acknowledgments -- digital signatures (accuracy, D&A auth, Clearinghouse consent)
6. Document Uploads -- CDL front/back, med cert (non-CDL), ELDT cert (conditional)

**Token rules:** UUID v4, single-use, expires 72 hours after generation. Stored hashed, never logged raw.

## Suspense Integration

The DQ sweep (daily cron) auto-creates suspense items for:

- Any required document with status `missing` and hire date > 30 days ago
- Any document expiring within 30/14/7/0 days
- Any driver where the DQF is not marked `complete` and 30 days have elapsed since hire

## Security & Compliance Notes

- **PII handling:** SSN last-4 only (never full SSN). DOB marked as PII in audit logs, excluded from LLM context.
- **DHF isolation:** DQF and DHF are separate at the data layer (`file_type` column). UI must render in separate tabs.
- **Retention:** On driver termination, `retention_delete_after = termination_date + 3 years` per SS391.51(c). Never hard-deleted before that date.
- **Clearinghouse note:** As of Jan 2023, the full pre-employment Clearinghouse query replaces manual prior-employer D&A inquiry for FMCSA employers. Still need manual inquiry for non-FMCSA DOT employers (FAA, FRA, FTA).

## Build Sequence

- **Phase 1 -- Foundation (1 week):** Migrations, CRUD routes, dashboard, manual upload
- **Phase 2 -- Intake (1 week):** Token generation, multi-step form, section save, completion trigger
- **Phase 3 -- Generation (1 week):** PaperStack integration, 7 generated docs, branded cover sheets
- **Phase 4 -- Automation (1 week):** DQ sweep cron, suspense integration, expiration alerts, Penny KB update

## Testing

```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run type-check  # TypeScript validation
```

## Environment Variables

See `.env.example` for all required configuration.

## Out of Scope (Intentional)

- Hazmat endorsement-specific documents (Part 397)
- Owner-operator lease arrangements (Part 376)
- LCV instructor qualification (Subpart G)

These are edge cases. Get the core DQF/DHF right first.

---

True North Data Strategies LLC
Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
Fixed scope, fixed price. No open-ended projects. No surprise invoices.
