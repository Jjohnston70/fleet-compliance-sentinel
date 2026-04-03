dq-command — Module Spec

DOT Driver Qualification File System

Fleet-Compliance Sentinel | True North Data Strategies LLC

Version 1.0 | April 2, 2026



Architecture Summary

DRIVER INTAKE FLOW                    FLEET MANAGER VIEW

─────────────────────                 ──────────────────────────────

Driver receives link                  DQ File Dashboard

&#x20; └─ Multi-step form                    ├─ Per-driver checklist

&#x20;      ├─ Personal info                 ├─ Document status (received/missing/expired)

&#x20;      ├─ Employment history            ├─ Compliance % per driver

&#x20;      ├─ Violations record             ├─ Days until expiration per item

&#x20;      └─ Uploads (CDL, med cert)       └─ Suspense items auto-created for gaps

&#x20;            │

&#x20;            ▼

&#x20;   dq\_records table (JSONB, org-scoped)

&#x20;            │

&#x20;            ▼

&#x20;   Document generation (PDF + branded cover)

&#x20;   + Checklist tracker

&#x20;   + Suspense integration (missing/expiring docs → open items)



Regulatory Inventory — What Goes In a DQ File

Two separate files are legally required. This module manages both.

File 1: Driver Qualification File (DQF) — 49 CFR §391.51

The DQF must include the driver's application for employment completed per §391.21, a copy of the motor vehicle record from each licensing authority per §391.23(a)(1), and the certificate of driver's road test per §391.31(e). Legal Information Institute Additionally, the file must contain the annual MVR updates required by §391.25(a), a note on the annual review of driving record per §391.25(c)(2), and for non-CDL drivers, a note verifying the medical examiner's listing on the National Registry of Certified Medical Examiners per §391.23(m)(1). Retention is required for the duration of employment plus three years thereafter. eCFR

Full DQF document list, categorized by timing:

Pre-Employment / At Hire (one-time)

DocCFR ReferenceWho ProvidesGenerated or UploadedApplication for Employment§391.21DriverGenerated from intake formRecord of Violations (12-month)§391.27Driver (self-certified)Generated from intake formRoad Test Certificate§391.31Carrier issues after testGenerated + signed by carrierCDL copy (as road test equivalent)§391.33DriverUploadedPre-employment MVR (3-year)§391.23(a)(1)Carrier obtains from stateUploadedPrevious employer investigation§391.23(d)Carrier conductsUpload record of contactD\&A history inquiry (prior employers, 3yr)§391.23(e)Carrier conductsUpload response recordsDrug \& Alcohol Clearinghouse — full pre-employment query§382.701Carrier runsUpload query resultClearinghouse consent form (driver-signed)§382.701(b)Driver signsGenerated from intakeMedical Examiner's Certificate (non-CDL)§391.43Driver (from NRCME examiner)UploadedCDLIS MVR (CDL holders)§384.105Carrier obtainsUploadedNRCME verification note§391.23(m)(1)Carrier documentsGenerated (system note)Entry-Level Driver Training Certificate§380.509(b)Driver (CDL, <1yr exp)Uploaded — conditionalSPE Certificate or Medical Exemption§391.49 / Part 381FMCSA issuesUploaded — conditional

Annual (recurring, tracked with expiration dates)

DocCFR ReferenceCadenceWhoMVR annual update§391.25(a)AnnualCarrier obtainsAnnual review of driving record (note)§391.25(c)(2)AnnualCarrier documentsMedical Examiner's Certificate renewal§391.45Every 24 months (or sooner per examiner)DriverClearinghouse — limited annual query§382.701(b)AnnualCarrier runsClearinghouse limited query consent (annual release)§382.701AnnualDriver signs



File 2: Drug \& Alcohol History File (DHF) — 49 CFR §391.53

This is a separate file from the DQF. Beginning in 2004 the DHF was separated from the DQF. §391.53 requires the DHF to include a copy of the driver's written authorization for the motor carrier to seek information about drug and alcohol history from previous employers. Wasterecycling

DocCFR ReferenceNotesDriver authorization to release D\&A records§391.23(e)Driver signs at hirePrevious employer D\&A inquiry responses§391.23(e)Carrier must document all contact attemptsPre-employment drug test result§382.301Carrier/labClearinghouse full query result§382.701Must show "not prohibited" before safety-sensitive functionsSAP referral and RTD records (if applicable)§382.605ConditionalFollow-up testing records (if applicable)§40 Subpart OConditional

Key compliance note: As of January 6, 2023, once three years of violation data are stored in the Clearinghouse, employers are no longer required to also request information from the driver's previous FMCSA-regulated employers under §391.23(e) — an employer's Clearinghouse query satisfies that requirement. Lancer Insurance

DHF storage rule: All driver qualification files and drug and alcohol testing information must be stored in a secure area not accessible by other employees, or in a locked cabinet. The DQF must be complete within 30 days of hire. North Risk Partners



Data Model

Primary Table: dq\_records

Extends the existing fleet\_compliance\_records JSONB pattern. New collection key: dq\_files.

sql-- New dedicated table (not JSONB collection — DQ has structured enough fields to warrant it)



CREATE TABLE dq\_files (

&#x20; id              SERIAL PRIMARY KEY,

&#x20; org\_id          TEXT NOT NULL,                        -- Clerk org ID (tenant isolation)

&#x20; driver\_id       TEXT NOT NULL,                        -- FK to people collection

&#x20; driver\_name     TEXT NOT NULL,                        -- Denormalized for query speed

&#x20; cdl\_holder      BOOLEAN NOT NULL DEFAULT false,

&#x20; status          TEXT NOT NULL DEFAULT 'incomplete',   -- incomplete | complete | expired | flagged

&#x20; file\_type       TEXT NOT NULL DEFAULT 'dqf',          -- dqf | dhf

&#x20; intake\_token    UUID UNIQUE,                          -- one-time driver intake link token

&#x20; intake\_completed\_at TIMESTAMPTZ,

&#x20; created\_at      TIMESTAMPTZ DEFAULT now(),

&#x20; updated\_at      TIMESTAMPTZ DEFAULT now(),

&#x20; deleted\_at      TIMESTAMPTZ                           -- soft delete

);



CREATE INDEX idx\_dq\_files\_org\_driver ON dq\_files (org\_id, driver\_id);

CREATE INDEX idx\_dq\_files\_status     ON dq\_files (org\_id, status);



\-- ─────────────────────────────────────────────────────────────────────────────



CREATE TABLE dq\_documents (

&#x20; id              SERIAL PRIMARY KEY,

&#x20; dq\_file\_id      INTEGER REFERENCES dq\_files(id) ON DELETE CASCADE,

&#x20; org\_id          TEXT NOT NULL,

&#x20; doc\_type        TEXT NOT NULL,                        -- enum: see DOC\_TYPES below

&#x20; doc\_label       TEXT NOT NULL,                        -- human-readable

&#x20; cfr\_reference   TEXT,                                 -- e.g., "§391.21"

&#x20; status          TEXT NOT NULL DEFAULT 'missing',      -- missing | uploaded | generated | verified | expired

&#x20; required\_for    TEXT NOT NULL DEFAULT 'all',          -- all | cdl\_only | non\_cdl\_only | conditional

&#x20; cadence         TEXT NOT NULL DEFAULT 'one\_time',     -- one\_time | annual | biennial

&#x20; expires\_at      TIMESTAMPTZ,                          -- null for non-expiring docs

&#x20; uploaded\_at     TIMESTAMPTZ,

&#x20; generated\_at    TIMESTAMPTZ,

&#x20; file\_path       TEXT,                                 -- storage path for uploaded docs

&#x20; generated\_doc\_path TEXT,                              -- path for system-generated docs

&#x20; notes           TEXT,                                 -- reviewer notes

&#x20; reviewed\_by     TEXT,                                 -- userId

&#x20; reviewed\_at     TIMESTAMPTZ,

&#x20; created\_at      TIMESTAMPTZ DEFAULT now()

);



CREATE INDEX idx\_dq\_docs\_file   ON dq\_documents (dq\_file\_id);

CREATE INDEX idx\_dq\_docs\_status ON dq\_documents (org\_id, status);

CREATE INDEX idx\_dq\_docs\_expiry ON dq\_documents (org\_id, expires\_at) WHERE expires\_at IS NOT NULL;



\-- ─────────────────────────────────────────────────────────────────────────────



CREATE TABLE dq\_intake\_responses (

&#x20; id              SERIAL PRIMARY KEY,

&#x20; dq\_file\_id      INTEGER REFERENCES dq\_files(id),

&#x20; org\_id          TEXT NOT NULL,

&#x20; section         TEXT NOT NULL,                        -- personal | employment\_history | violations | certifications

&#x20; response\_data   JSONB NOT NULL,                       -- structured form data per section

&#x20; submitted\_at    TIMESTAMPTZ DEFAULT now()

);



\-- ─────────────────────────────────────────────────────────────────────────────



CREATE TABLE dq\_audit\_log (

&#x20; id              BIGSERIAL PRIMARY KEY,

&#x20; dq\_file\_id      INTEGER REFERENCES dq\_files(id),

&#x20; org\_id          TEXT NOT NULL,

&#x20; actor\_id        TEXT NOT NULL,                        -- userId or 'system' or 'driver'

&#x20; actor\_type      TEXT NOT NULL,                        -- user | system | driver

&#x20; action          TEXT NOT NULL,                        -- doc.uploaded | doc.generated | status.changed | intake.completed | suspense.created

&#x20; doc\_type        TEXT,

&#x20; metadata        JSONB,

&#x20; created\_at      TIMESTAMPTZ DEFAULT now()

);



Document Type Enum (DOC\_TYPES)

Canonical list used across the API, UI checklist, and document generator:

typescriptexport const DQ\_DOC\_TYPES = {

&#x20; // ── DQF: Pre-Employment ──────────────────────────────────────────────────

&#x20; APPLICATION\_FOR\_EMPLOYMENT:       'application\_for\_employment',        // §391.21  — generated

&#x20; RECORD\_OF\_VIOLATIONS:             'record\_of\_violations',              // §391.27  — generated

&#x20; ROAD\_TEST\_CERTIFICATE:            'road\_test\_certificate',             // §391.31  — generated

&#x20; CDL\_COPY:                         'cdl\_copy',                          // §391.33  — uploaded

&#x20; PRE\_EMPLOYMENT\_MVR:               'pre\_employment\_mvr',                // §391.23  — uploaded

&#x20; PREV\_EMPLOYER\_INVESTIGATION:      'prev\_employer\_investigation',       // §391.23(d) — uploaded

&#x20; DA\_HISTORY\_INQUIRY:               'da\_history\_inquiry',                // §391.23(e) — uploaded

&#x20; CLEARINGHOUSE\_FULL\_QUERY:         'clearinghouse\_full\_query',          // §382.701  — uploaded

&#x20; CLEARINGHOUSE\_CONSENT\_PRE\_EMP:    'clearinghouse\_consent\_pre\_emp',     // §382.701(b) — generated

&#x20; MED\_EXAMINER\_CERT:                'med\_examiner\_cert',                 // §391.43  — uploaded (non-CDL)

&#x20; CDLIS\_MVR:                        'cdlis\_mvr',                         // §384.105  — uploaded (CDL)

&#x20; NRCME\_VERIFICATION\_NOTE:          'nrcme\_verification\_note',           // §391.23(m) — generated

&#x20; // ── DQF: Conditional ────────────────────────────────────────────────────

&#x20; ENTRY\_LEVEL\_DRIVER\_TRAINING:      'entry\_level\_driver\_training',       // §380.509(b) — uploaded, CDL + <1yr

&#x20; SPE\_CERTIFICATE:                  'spe\_certificate',                   // §391.49   — uploaded, if applicable

&#x20; MEDICAL\_EXEMPTION\_LETTER:         'medical\_exemption\_letter',          // Part 381  — uploaded, if applicable

&#x20; // ── DQF: Annual Recurring ────────────────────────────────────────────────

&#x20; MVR\_ANNUAL\_UPDATE:                'mvr\_annual\_update',                 // §391.25(a)   — uploaded

&#x20; ANNUAL\_REVIEW\_NOTE:               'annual\_review\_note',                // §391.25(c)(2) — generated

&#x20; MED\_CERT\_RENEWAL:                 'med\_cert\_renewal',                  // §391.45  — uploaded

&#x20; CLEARINGHOUSE\_LIMITED\_QUERY:      'clearinghouse\_limited\_query',       // §382.701(b) — uploaded

&#x20; CLEARINGHOUSE\_CONSENT\_ANNUAL:     'clearinghouse\_consent\_annual',      // §382.701  — generated

&#x20; // ── DHF ─────────────────────────────────────────────────────────────────

&#x20; DHF\_DRIVER\_AUTHORIZATION:         'dhf\_driver\_authorization',          // §391.23(e) — generated

&#x20; DHF\_PREV\_EMPLOYER\_DA\_RESPONSES:   'dhf\_prev\_employer\_da\_responses',    // §391.23(e) — uploaded

&#x20; DHF\_PRE\_EMP\_DRUG\_TEST:            'dhf\_pre\_emp\_drug\_test',             // §382.301  — uploaded

&#x20; DHF\_CLEARINGHOUSE\_QUERY:          'dhf\_clearinghouse\_query',           // §382.701  — uploaded

&#x20; DHF\_SAP\_REFERRAL:                 'dhf\_sap\_referral',                  // §382.605  — conditional

&#x20; DHF\_RTD\_RECORDS:                  'dhf\_rtd\_records',                   // 40 Subpart O — conditional

} as const;



API Route Surface

All routes under /api/fleet-compliance/dq/ — consistent with existing FCS route structure.

DQ File Management

RouteMethodAuthPurpose/api/fleet-compliance/dq/filesGETClerkList all DQ files for org — with checklist completion %/api/fleet-compliance/dq/filesPOSTClerk + adminCreate DQ file record for a driver, generate intake token/api/fleet-compliance/dq/files/\[id]GETClerkGet single DQ file with full document checklist/api/fleet-compliance/dq/files/\[id]PATCHClerk + adminUpdate DQ file status, notes/api/fleet-compliance/dq/files/\[id]/checklistGETClerkGet checklist view — all docs, status, expiry, gaps

Document Operations

RouteMethodAuthPurpose/api/fleet-compliance/dq/documentsPOSTClerk + adminUpload a document (sets status = uploaded)/api/fleet-compliance/dq/documents/\[id]PATCHClerk + adminUpdate doc status, expiry, reviewer notes/api/fleet-compliance/dq/documents/\[id]DELETEClerk + adminSoft delete a document record/api/fleet-compliance/dq/documents/generatePOSTClerk + adminGenerate a document from driver data (application, violations record, consent forms, review notes)

Driver Intake (Unauthenticated — Token-gated)

RouteMethodAuthPurpose/api/fleet-compliance/dq/intake/\[token]GETToken (public)Validate intake token, return form schema/api/fleet-compliance/dq/intake/\[token]POSTToken (public)Submit intake section data/api/fleet-compliance/dq/intake/\[token]/completePOSTToken (public)Mark intake complete, trigger document generation

Compliance Sweep

RouteMethodAuthPurpose/api/fleet-compliance/dq/sweepPOSTCron secretDaily sweep — flag expiring docs, create suspense items/api/fleet-compliance/dq/gapsGETClerkReturn all drivers with missing or expiring DQ docs



Tool Surface (dq-command)

Follows the same pattern as other command-center modules. 11 tools.

typescriptexport const DQ\_TOOLS = \[

&#x20; {

&#x20;   name: 'create\_dq\_file',

&#x20;   description: 'Create a new DQ file record for a driver and generate their intake link',

&#x20;   inputs: \['driver\_id', 'cdl\_holder', 'hire\_date']

&#x20; },

&#x20; {

&#x20;   name: 'get\_dq\_checklist',

&#x20;   description: 'Return the complete DQ file checklist for a driver — all required docs, current status, and gaps',

&#x20;   inputs: \['driver\_id', 'file\_type?']  // file\_type: dqf | dhf | both (default: both)

&#x20; },

&#x20; {

&#x20;   name: 'get\_dq\_gaps',

&#x20;   description: 'Return all drivers across the org with missing or expiring DQ documents',

&#x20;   inputs: \['org\_id', 'include\_expiring\_within\_days?']  // default: 30

&#x20; },

&#x20; {

&#x20;   name: 'upload\_dq\_document',

&#x20;   description: 'Record that a document has been uploaded and update its status in the checklist',

&#x20;   inputs: \['dq\_file\_id', 'doc\_type', 'expires\_at?', 'file\_path']

&#x20; },

&#x20; {

&#x20;   name: 'generate\_dq\_document',

&#x20;   description: 'Generate a pre-filled DOT document (application, violations record, consent form, review note) from driver intake data',

&#x20;   inputs: \['dq\_file\_id', 'doc\_type', 'generation\_options?']

&#x20; },

&#x20; {

&#x20;   name: 'send\_intake\_link',

&#x20;   description: 'Generate or resend a driver intake link for a given DQ file',

&#x20;   inputs: \['dq\_file\_id', 'delivery\_method?']  // delivery\_method: email | sms | copy\_link

&#x20; },

&#x20; {

&#x20;   name: 'get\_intake\_status',

&#x20;   description: 'Check whether a driver has completed their intake form and which sections are done',

&#x20;   inputs: \['dq\_file\_id']

&#x20; },

&#x20; {

&#x20;   name: 'mark\_doc\_verified',

&#x20;   description: 'Mark a document as reviewed and verified by a fleet manager',

&#x20;   inputs: \['document\_id', 'reviewer\_id', 'notes?']

&#x20; },

&#x20; {

&#x20;   name: 'run\_dq\_sweep',

&#x20;   description: 'Trigger a compliance sweep — find expiring or missing docs and create suspense items',

&#x20;   inputs: \['org\_id', 'dry\_run?']

&#x20; },

&#x20; {

&#x20;   name: 'get\_dq\_summary',

&#x20;   description: 'Return org-level DQ compliance summary — total drivers, % complete, count by status',

&#x20;   inputs: \['org\_id']

&#x20; },

&#x20; {

&#x20;   name: 'archive\_dq\_file',

&#x20;   description: 'Soft-delete a DQ file (driver terminated) — triggers 3-year retention flag per §391.51(c)',

&#x20;   inputs: \['dq\_file\_id', 'termination\_date', 'reason?']

&#x20; }

];

```



\---



\## Driver Intake Flow — Recommendation



Here's my recommendation on the data entry question you left open.



\*\*Use a token-gated, unauthenticated driver intake form.\*\* Not driver accounts — that's a whole auth headache with zero benefit. Not manager-entry-on-behalf — that creates liability if data is wrong. A single-use magic link sent to the driver via email or SMS is the right pattern. Here's why:



The driver fills in their own information (employment history, violations, CDL details, etc.), which creates a signed legal record that says the driver certified the data. That's the exact language required by §391.21 — the application must be signed by the driver. If the manager types it in, you lose that signature chain.



\*\*Intake form sections:\*\*

```

Section 1 — Personal Information

&#x20; Full legal name, DOB, SSN (last 4 only — do not store full SSN), 

&#x20; address history (3 years), phone, email



Section 2 — Licensing

&#x20; CDL/license number, issuing state, expiration, CDL class, endorsements,

&#x20; any states licensed in past 3 years



Section 3 — Employment History (3 years non-CDL / 10 years CDL)

&#x20; Employer name, address, contact, dates, position, reason for leaving,

&#x20; subject to FMCSA regs? (Y/N), subject to D\&A testing? (Y/N)



Section 4 — Record of Violations (past 12 months)

&#x20; Traffic violations (non-parking) — or certification that there are none



Section 5 — Certifications \& Acknowledgments

&#x20; Digital signature: "I certify all entries are true and complete"

&#x20; D\&A authorization signature (consent for prior employer inquiry)

&#x20; Clearinghouse consent signature



Section 6 — Document Uploads

&#x20; CDL front/back

&#x20; Medical Examiner's Certificate (non-CDL drivers)

&#x20; Entry-Level Driver Training Certificate (if applicable)

After submission, the system auto-generates: Application for Employment (pre-filled PDF), Record of Violations, Clearinghouse consent form, D\&A history authorization. Manager uploads the external docs (MVR, road test result, Clearinghouse query confirmation) through the fleet manager dashboard.



Suspense System Integration

The DQ sweep (daily cron, same pattern as compliance alerts) auto-creates suspense items in the existing suspense\_items collection for:



Any required document with status missing and hire date > 30 days ago

Any document expiring within 30/14/7/0 days

Any driver where the DQF is not marked complete and 30 days have elapsed since hire



Suspense item format:

typescript{

&#x20; collection: 'suspense\_items',

&#x20; org\_id: orgId,

&#x20; data: {

&#x20;   title: 'DQ File Incomplete — \[Driver Name]',

&#x20;   description: 'Missing: Medical Examiner Certificate, Annual MVR',

&#x20;   severity: 'high',

&#x20;   due\_date: thirtyDaysFromHire,

&#x20;   owner: null,

&#x20;   source: 'dq-command',

&#x20;   source\_id: dqFileId,

&#x20;   cfr\_reference: '49 CFR §391.51'

&#x20; }

}

```



\---



\## Fleet Manager Dashboard View



\*\*DQ File Dashboard\*\* (`/fleet-compliance/dq`) — new page in the FCS sidebar.



\*\*Org-level summary bar:\*\*

```

\[ 12 Drivers ] \[ 8 Complete ] \[ 3 Incomplete ] \[ 1 Expired ] \[ 4 Items Expiring in 30 Days ]

```



\*\*Per-driver row:\*\*

```

Driver Name     | CDL | DQF Status  | DHF Status  | Docs: 14/17 | Next Expiry | Actions

─────────────────────────────────────────────────────────────────────────────────────────

John Carter     | Yes | Complete    | Complete    | 17/17       | Med cert 45d | View

Maria Santos    | No  | Incomplete  | Complete    | 11/13       | —            | View | Send Intake

Dave Okonkwo    | Yes | Expired     | Complete    | 14/15       | MVR Overdue  | View | Action

```



\*\*Per-driver detail — checklist view:\*\*

```

DQF DOCUMENTS                        STATUS          EXPIRES        ACTION

─────────────────────────────────────────────────────────────────────────────────

Application for Employment           Generated       —              View PDF

Record of Violations                 Generated       —              View PDF

CDL Copy                             Uploaded        —              View

Pre-Employment MVR                   Uploaded        —              View

Road Test Certificate                Generated       —              View PDF

D\&A Clearinghouse Consent            Generated       —              View PDF

Clearinghouse Full Query             MISSING         —              Upload

Medical Examiner Certificate         Uploaded        2027-01-15     View

NRCME Verification Note              Generated       —              View

─────────────────────────────────────────────────────────────────────────────────

ANNUAL RECURRING

─────────────────────────────────────────────────────────────────────────────────

MVR Annual Update (2026)             MISSING         Overdue        Upload  \[!]

Annual Review Note (2026)            MISSING         Overdue        Generate\[!]

Clearinghouse Limited Query (2026)   Uploaded        —              View



SQL Migrations

Two new migrations to add to the sequence:

sql-- 011\_dq\_files.sql

CREATE TABLE dq\_files ( ... );       -- as above

CREATE TABLE dq\_documents ( ... );

CREATE TABLE dq\_intake\_responses ( ... );

CREATE TABLE dq\_audit\_log ( ... );



\-- 012\_dq\_retention\_flag.sql

ALTER TABLE dq\_files ADD COLUMN retention\_delete\_after TIMESTAMPTZ; 

\-- Populated on soft-delete as: termination\_date + 3 years (per §391.51(c))



Document Generation — What Gets Auto-Generated

These are the four documents the system generates as pre-filled PDFs from intake data, using PaperStack's existing pdf\_generator.py pattern:

DocumentGenerated FromCFRApplication for EmploymentSection 1-4 intake data + digital sig§391.21Record of ViolationsSection 4 intake data§391.27D\&A Prior Employer AuthorizationDriver name, employer list from Section 3§391.23(e)Clearinghouse Consent (Pre-Employment)Driver name, DOB, org info§382.701(b)Annual Review NoteManager name, date, MVR result summary§391.25(c)(2)NRCME Verification NoteExaminer name/NPI, verification date§391.23(m)Clearinghouse Consent (Annual)Driver name, org info, year§382.701

The branded cover sheet wraps any uploaded document (MVR, road test cert, medical cert) with TNDS/carrier branding, doc type label, CFR citation, date received, and reviewer signature line.



Security \& Compliance Notes

PII handling in intake: Driver SSN is out of scope — the application asks for last 4 only for identity verification. Full SSN is a liability the platform doesn't need to hold. DOB is collected, marked as PII in audit logs, and excluded from LLM context per existing Penny rules.

Intake token: UUID v4, single-use, expires 72 hours after generation. Invalidated on submission. Stored hashed in dq\_files.intake\_token — never logged raw.

DHF storage isolation: The DHF must be stored separately from the DQF. Enforced at the file\_type column level — DHF docs are only returned when file\_type = 'dhf' is explicitly requested. UI renders them in separate tabs.

Retention enforcement: On driver termination (soft-delete), retention\_delete\_after is set to termination\_date + 3 years. The existing offboarding cron checks this column. DQ files are never hard-deleted before that date regardless of org subscription status.



Build Sequence

Phase 1 — Foundation (1 week)



Migrations 011 and 012

dq\_files and dq\_documents CRUD API routes

DQ dashboard page with checklist view (no generation yet)

Manual doc upload flow



Phase 2 — Intake (1 week)



Token generation and validation

Intake form (multi-step, unauthenticated)

Section-by-section save to dq\_intake\_responses

Intake completion trigger



Phase 3 — Generation (1 week)



PaperStack integration for the 7 generated documents

Branded cover sheet for uploaded docs

Generated doc storage and retrieval



Phase 4 — Automation (1 week)



DQ sweep cron integration

Suspense item auto-creation

Expiration tracking and dashboard alerts

Penny knowledge base update (DQ compliance Q\&A)





True North Data Strategies LLC

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com

Fixed scope, fixed price. No open-ended projects. No surprise invoices.



That's the full spec, Jacob. A few things to flag before you start building:

On the intake token approach — the reason I'm recommending driver self-entry over manager-entry is the §391.21 signature requirement. The regulation says the driver must sign the application certifying it's accurate. If your manager types it in on their behalf, that certification chain breaks. A token-gated form with a digital signature block at the end solves that cleanly.

On DHF separation — this trips up a lot of fleet operators. FMCSA can and does cite carriers for commingling the DQF and DHF. The file\_type column enforces separation at the data layer. Keep the UI tabs visually distinct too.

On the Clearinghouse — as of January 2023, the full pre-employment Clearinghouse query replaces the manual prior-employer D\&A inquiry for FMCSA-regulated employers. But you still need the manual inquiry records for any prior DOT employer that wasn't FMCSA (FAA, FRA, FTA). The checklist should track both.

Missing from this spec intentionally — hazmat endorsement-specific documents (Part 397), owner-operator lease arrangements (Part 376), and LCV instructor qualification (Subpart G). Those are edge cases. Get the core DQF/DHF right first.

