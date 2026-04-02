# FEATURE SPEC: Hazmat Training Compliance Tracker

**True North Data Strategies | Pipeline Punks**
**Project**: Fleet-Compliance Sentinel
**Owner**: Jacob Johnston | jacob@truenorthstrategyops.com
**Version**: 1.0 | 2026-04-01
**Status**: Spec Complete -- Ready for Sprint Planning
**Priority**: High (regulatory requirement, direct compliance risk)

---

## PURPOSE

Fleet operators handling hazardous materials must comply with 49 CFR 172 Subpart H training requirements. Failure to maintain current training records is a common DOT audit finding that results in fines ($500-$80,000+ per violation). FCS currently tracks driver qualifications and vehicle inspections but has no visibility into hazmat training status.

This feature adds per-employee hazmat training tracking with deadline awareness, module-level completion status, certificate storage, and proactive alerting -- all mapped to the 12 PHMSA-required modules and 19 supplemental NFPA 472 courses.

---

## WHAT THIS SOLVES

Operators currently track hazmat training in spreadsheets, paper binders, or not at all. Common failure modes:

- Employee's 3-year recurrence deadline passes without anyone noticing
- New hire's 90-day initial training window expires before modules are completed
- Certificates exist somewhere on someone's computer but can't be produced during audit
- No visibility into which modules are complete vs outstanding per employee
- Supplemental training (NFPA 472) is never tracked, so operators can't demonstrate enhanced qualifications

FCS closes all of these gaps with automated tracking, proactive alerts, and audit-ready reporting.

---

## DATA MODEL

### New Table: `hazmat_training_records`

```sql
CREATE TABLE hazmat_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  employee_id UUID NOT NULL REFERENCES employees(id),

  -- Module identification
  module_code TEXT NOT NULL,          -- e.g., "0.0", "1.0", "7.0a", "NFPA-AW-01"
  module_title TEXT NOT NULL,         -- "Hazardous Materials Regulations Introduction"
  module_category TEXT NOT NULL,      -- "required" | "nfpa_awareness" | "nfpa_operations" | "supplemental"

  -- Completion tracking
  status TEXT NOT NULL DEFAULT 'not_started',  -- not_started | in_progress | complete | delinquent
  credit_pathway TEXT,               -- "scorm" | "general_task" | "classroom" | "other"
  completion_date TIMESTAMPTZ,

  -- Training window
  training_window_start TIMESTAMPTZ,
  training_window_end TIMESTAMPTZ,

  -- Recurrence
  recurrence_cycle_years INT DEFAULT 3,
  next_due_date TIMESTAMPTZ,         -- Computed: completion_date + recurrence_cycle

  -- Certificate
  certificate_url TEXT,              -- S3/R2 path to uploaded PDF
  certificate_uploaded_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,

  UNIQUE(org_id, employee_id, module_code)
);

CREATE INDEX idx_hazmat_training_org ON hazmat_training_records(org_id);
CREATE INDEX idx_hazmat_training_employee ON hazmat_training_records(employee_id);
CREATE INDEX idx_hazmat_training_status ON hazmat_training_records(status);
CREATE INDEX idx_hazmat_training_due ON hazmat_training_records(next_due_date);
```

### New Table: `hazmat_training_modules` (Reference/Lookup)

```sql
CREATE TABLE hazmat_training_modules (
  module_code TEXT PRIMARY KEY,
  module_title TEXT NOT NULL,
  module_category TEXT NOT NULL,    -- required | nfpa_awareness | nfpa_operations | supplemental
  cfr_reference TEXT,               -- "49 CFR 172.704" etc.
  erg_section TEXT,                 -- Cross-reference to ERG pages
  sort_order INT NOT NULL,
  description TEXT
);
```

### Seed Data: 31 Modules

```
-- 12 Required PHMSA Modules
(0.0, "Hazardous Materials Regulations Introduction", "required", "49 CFR 172 Subpart H", "White Pages", 1)
(1.0, "Hazardous Materials Table", "required", "49 CFR 172.101", "Yellow/Blue Pages", 2)
(2.0, "Shipping Papers", "required", "49 CFR 172.200-205", "White Pages", 3)
(3.0, "Packaging", "required", "49 CFR Parts 173/178", "White Pages", 4)
(4.0, "Marking", "required", "49 CFR 172.300-338", "White Pages", 5)
(5.0, "Labeling", "required", "49 CFR 172.400-450", "White Pages", 6)
(6.0, "Placarding", "required", "49 CFR 172.500-560", "White Pages", 7)
(7.0a, "Carrier Requirements - Highway", "required", "49 CFR Parts 177/397", "Orange Pages", 8)
(7.0b, "Carrier Requirements - Air", "required", "49 CFR Part 175", "Orange Pages", 9)
(7.0c, "Carrier Requirements - Rail", "required", "49 CFR Part 174", "Orange Pages", 10)
(7.0d, "Carrier Requirements - Vessel", "required", "49 CFR Part 176", "Orange Pages", 11)
(8.0, "Security Requirements", "required", "49 CFR 172.800-804", "White Pages", 12)

-- 6 NFPA 472 Awareness Units
(NFPA-AW-01 through NFPA-AW-06)

-- 12 NFPA 472 Operations Units
(NFPA-OP-01 through NFPA-OP-12)

-- 1 Supplemental
(PHMSA-GRANT, "PHMSA Hazmat Grant Program Overview", "supplemental")
```

---

## UI COMPONENTS

### 1. Hazmat Training Tab (Employee Detail Page)

Located in the Employee detail view, new tab alongside existing DQF, Medical, and License tabs.

**Layout**:

- Top bar: Employee name, overall hazmat compliance status badge (Compliant / At Risk / Delinquent), percentage complete indicator
- Required modules section: 12-row table showing module code, title, status, completion date, credit pathway, certificate link, days until due
- Supplemental section (collapsible): 19-row table for NFPA 472 + grant course
- Action buttons: "Record Completion", "Upload Certificate", "Set Training Window"

**Status badges**:

- **Compliant** (green): All 12 required modules complete and within recurrence window
- **At Risk** (amber): One or more modules within 90 days of due date
- **Delinquent** (red): One or more modules past due date
- **New Hire** (blue): Employee within 90-day initial training window

### 2. Hazmat Training Dashboard Widget

New card on the main Compliance dashboard page.

**Content**:

- Count of employees by status (Compliant / At Risk / Delinquent / Not Tracked)
- "Upcoming expirations" list: employees with modules due in next 90 days, sorted by soonest
- Quick link to full hazmat training report

### 3. Hazmat Training Report (Compliance > Reports)

Full-page report view with filtering and export.

**Filters**: Employee, status, module, date range, credit pathway
**Columns**: Employee name, module, status, completion date, due date, days remaining, certificate status
**Export**: CSV and PDF (audit-ready format with org header, date range, signature line)
**Sort**: Default by days remaining ascending (most urgent first)

### 4. Certificate Upload Flow

**Process**:

1. User clicks "Upload Certificate" on a module row
2. File picker accepts PDF only (max 10MB)
3. File is uploaded to object storage (S3/R2) under `/{org_id}/hazmat-certs/{employee_id}/{module_code}_{date}.pdf`
4. Record updates with certificate_url and certificate_uploaded_at
5. Certificate icon appears in the module row, clickable to view/download

---

## ALERT RULES

### Suspense Integration

Hazmat training alerts feed into the existing FCS Suspense system.

| Trigger                     | Alert Type | Timing               | Action                                                                  |
| --------------------------- | ---------- | -------------------- | ----------------------------------------------------------------------- |
| Module due date approaching | Warning    | 90 days before due   | Suspense item created, dashboard badge turns amber                      |
| Module due date approaching | Urgent     | 30 days before due   | Suspense item escalated, email notification to org admin                |
| Module past due             | Delinquent | Day of due date      | Suspense item turns red, employee status changes to Delinquent          |
| New hire 90-day window      | Info       | Day of hire          | Suspense items created for all 12 required modules with 90-day deadline |
| New hire 60 days in         | Warning    | 60 days after hire   | Notification if any required modules still incomplete                   |
| Certificate missing         | Info       | On completion record | Nudge to upload certificate for audit readiness                         |

### Email Notifications

Use existing Resend integration. New templates:

- `hazmat-training-due-90`: "Hazmat training due in 90 days" -- sent to org admin
- `hazmat-training-due-30`: "Hazmat training due in 30 days" -- sent to org admin + employee (if email on file)
- `hazmat-training-delinquent`: "Hazmat training past due" -- sent to org admin
- `hazmat-newhire-reminder`: "New hire hazmat training reminder" -- sent 60 days after hire

---

## API ENDPOINTS

### FastAPI Backend

```
GET    /api/v1/hazmat-training/{employee_id}          -- All training records for employee
GET    /api/v1/hazmat-training/org/{org_id}/summary    -- Org-wide compliance summary
POST   /api/v1/hazmat-training/{employee_id}/record    -- Record module completion
PUT    /api/v1/hazmat-training/records/{record_id}     -- Update training record
POST   /api/v1/hazmat-training/{record_id}/certificate -- Upload certificate PDF
GET    /api/v1/hazmat-training/org/{org_id}/report     -- Filterable report data
GET    /api/v1/hazmat-training/org/{org_id}/expiring   -- Modules expiring in N days
DELETE /api/v1/hazmat-training/records/{record_id}     -- Soft delete record
```

### Penny Integration

Penny should be able to answer questions like:

- "Which employees have delinquent hazmat training?"
- "When is John's placarding certification due?"
- "How many employees are hazmat compliant?"
- "What's the difference between Module 7.0a and 7.0b?"

The knowledge base markdown (already ingested) covers module content. The API endpoints above provide live compliance data. Penny's tool-use layer should call the `/summary` and `/expiring` endpoints for real-time answers.

---

## IMPLEMENTATION PHASES

### Phase 1: Data Model + Seed Data (1-2 days)

- Run migration to create `hazmat_training_modules` and `hazmat_training_records` tables
- Seed the 31 module definitions
- Add Neon migration file to `migrations/` directory

**Deliverables**: Migration SQL, seed script, verification query

### Phase 2: API Endpoints (2-3 days)

- CRUD endpoints for training records
- Org summary endpoint with status counts
- Expiring modules endpoint with configurable window
- Report endpoint with filtering
- Certificate upload endpoint with S3/R2 integration

**Deliverables**: FastAPI routes, Pydantic models, test coverage

### Phase 3: UI Components (3-4 days)

- Employee detail hazmat tab
- Training record form (record completion, set dates, select credit pathway)
- Certificate upload component
- Dashboard widget
- Report page with filters and export

**Deliverables**: React components, integration with existing employee detail page

### Phase 4: Alerts + Suspense Integration (1-2 days)

- Suspense item creation for training deadlines
- Email notification templates via Resend
- Cron job or scheduled function for daily deadline check
- New hire auto-enrollment logic (create 12 required module records on employee creation)

**Deliverables**: Alert rules, email templates, cron configuration

### Phase 5: Testing + Audit (1-2 days)

- End-to-end testing: create employee, record training, upload cert, verify alerts
- Verify report export matches audit requirements
- SOC 2 evidence: document the feature's access controls, data retention, and audit trail
- Verify Penny can query training data through tool-use

**Deliverables**: Test results, SOC 2 evidence artifacts, Penny integration verification

---

## ESTIMATED EFFORT

**Total**: 8-13 days (1.5-2.5 sprint weeks)
**Dependencies**: Existing employee table, Suspense system, Resend integration, S3/R2 for certificates
**Risk**: Certificate storage requires object storage configuration if not already set up

---

## COMPETITIVE ADVANTAGE

This feature directly competes with J.J. Keller Encompass ($25-59/vehicle/month) and Tenstreet's Safety Management module. Key differentiators:

- **Integrated with FCS**: Training compliance lives alongside DQF, vehicle inspections, and FMCSA data -- not in a separate system
- **Penny-powered**: Natural language queries against training data ("who's delinquent?") vs clicking through dashboards
- **ERG cross-reference**: Training modules are linked to ERG content already in the knowledge base, so Penny can explain what a module covers and reference the actual regulatory text
- **Free PHMSA training path**: Document that OTIS provides the training content free through PHMSA -- operators only pay for FCS tracking, not course access. This undercuts J.J. Keller's bundled training + tracking model.
- **Small fleet focus**: Built for 5-20 employee operations, not enterprise fleets that need Tenstreet's recruiting pipeline

---

## RELATED: training-command MODULE

This feature spec covers the **admin/compliance tracking side** of hazmat training. A companion module -- `training-command` -- is planned as the **driver-facing training delivery system**. See `todo-04-02-2026.md` for the full sprint plan.

The training-command module will:

- Deliver self-contained training content (authored from ERG, CFR, and PHMSA source material)
- Present training as slide decks generated from markdown via the Electron deck engine
- Include built-in assessments with pass/fail scoring
- Auto-update the compliance records defined in this spec when an employee passes
- Generate certificates for audit readiness
- Support future expansion beyond hazmat (DQF, HOS, Drug/Alcohol, etc.)

When training-command is built, the `credit_pathway` field in `hazmat_training_records` will include a new value: `"fcs_training"` -- indicating the employee completed TNDS-authored training within FCS rather than through OTIS or classroom instruction.

---

## REFERENCES

- 49 CFR 172 Subpart H (Training Requirements)
- 49 CFR 172.704 (Training Requirements -- specific)
- PHMSA OTIS Platform: https://otis.osmanager4.com
- ERG 2024 Full Text: ingested in Penny knowledge base
- NFPA 472: Standard for Competence of Responders to Hazardous Materials/WMD Incidents
- J.J. Keller Competitive Intel: knowledge-downloads/jj-keller/COMPETITIVE_INTEL.md
- Tenstreet Competitive Intel: knowledge-downloads/tenstreet/COMPETITIVE_INTEL.md

---

_True North Data Strategies | Turning Data into Direction_
_Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com_
