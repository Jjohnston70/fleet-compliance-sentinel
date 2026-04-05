# API Reference: govcon-compliance-command

*Complete Tool, Entity, and Service Reference*

**Version**: 1.0.0
**Last Updated**: 2026-04-05
**Module**: @tnds/govcon-compliance-command

---

## Tool Definitions

All 20 tools follow the same schema format for LLM integration. Each tool has a `name`, `description`, and `inputSchema` (JSON Schema with `type`, `properties`, and `required`).

### Tool 1: search_opportunities

Search and filter federal contracting opportunities.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agency | string | No | Filter by agency name |
| naics_code | string | No | Filter by NAICS code |
| set_aside_type | string (enum) | No | SDVOSB, VOSB, 8a, HUBZone, WOSB, small_business, full_open |
| status | string (enum) | No | identified, evaluating, bid, no_bid, submitted, awarded, lost |

**Returns**: Array of Opportunity objects matching filters.

---

### Tool 2: run_bid_decision

Run weighted bid/no-bid decision for an opportunity with detailed scoring.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| opportunity_id | string (UUID) | Yes | ID of the opportunity |
| technical_fit | number (0-100) | Yes | Technical capability match |
| set_aside_match | number (0-100) | Yes | Set-aside eligibility |
| competition_level | number (0-100) | Yes | Expected competition (0=high, 100=low) |
| contract_value | number | Yes | Estimated contract value in dollars |
| timeline_feasibility | number (0-100) | Yes | Can we meet delivery timeline |
| relationship | number (0-100) | Yes | Existing relationship with agency |
| strategic_value | number (0-100) | Yes | Strategic importance |

**Returns**: BidDecision object with decision (bid/no_bid), score (0-100), criteria_scores array, and rationale.

---

### Tool 3: get_pipeline_status

Get comprehensive view of federal contracting pipeline and metrics.

**Input**: None required.

**Returns**: DashboardMetrics object with opportunity counts by status, pipeline value, upcoming deadlines, action items, and high-value opportunities.

---

### Tool 4: log_outreach_activity

Log outreach activity with a contact.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contact_id | string (UUID) | Yes | ID of the contact |
| activity_type | string (enum) | Yes | email, phone, meeting, event, linkedin |
| subject | string | Yes | Activity subject or description |

**Returns**: Created OutreachActivity object.

---

### Tool 5: check_compliance_status

Check compliance and certification status with expiration alerts.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| authority | string (enum) | No | Filter by: SBA, SAM, IRS, state, VA |

**Returns**: Array of ComplianceAlert objects with severity (critical/warning/upcoming) or filtered ComplianceItem array.

---

### Tool 6: get_upcoming_deadlines

Get opportunities with upcoming response deadlines.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days_from_now | number | No | Days to look ahead (default: 7) |

**Returns**: Array of opportunities with approaching deadlines.

---

### Tool 7: create_opportunity

Create a new opportunity in the pipeline.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Opportunity title |
| solicitation_number | string | Yes | SAM.gov solicitation number |
| agency | string | Yes | Federal agency |
| response_deadline | string (ISO date) | Yes | Response due date |
| set_aside_type | string (enum) | Yes | SDVOSB, VOSB, 8a, HUBZone, WOSB, small_business, full_open |
| naics_code | string | Yes | NAICS code |
| naics_description | string | Yes | NAICS description |
| description | string | Yes | Opportunity description |
| estimated_value | number | No | Contract value estimate |

**Returns**: Created Opportunity object with generated ID.

---

### Tool 8: get_win_loss_report

Generate win-loss analysis and performance metrics.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days | number | No | Days to analyze (default: 180) |

**Returns**: WinLossReport object with totals, win rate, value analysis, and breakdowns by agency and NAICS.

---

### Tool 9: list_contacts

List outreach contacts with optional filtering.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agency | string | No | Filter by agency |
| status | string (enum) | No | prospect, warm, active, cold |

**Returns**: Array of OutreachContact objects.

---

### Tool 10: get_bid_recommendation

Get bid recommendation for an opportunity.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| opportunity_id | string (UUID) | Yes | ID of the opportunity |

**Returns**: Existing BidDecision if one exists, or the Opportunity with a prompt to run the bid decision engine.

---

### Tool 11: submit_company_info

Submit or update company information for compliance document generation.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_name | string | Yes | Company legal name |
| owner_name | string | No | Owner's full name |
| owner_title | string | No | Owner's title |
| address | string | No | Street address |
| city | string | No | City |
| state | string | No | State |
| zip | string | No | ZIP code |
| phone | string | No | Phone number |
| email | string | No | Contact email |
| uei | string | No | Unique Entity Identifier |
| cage_code | string | No | CAGE Code |
| naics_primary | string | No | Primary NAICS code |
| business_type | string | No | Business type description |
| employee_count | number | No | Number of employees |
| security_officer | string | No | Security officer name |
| privacy_officer | string | No | Privacy officer name |
| compliance_officer | string | No | Compliance officer name |
| cloud_provider | string | No | Cloud platform provider |
| federal_contracts | boolean | No | Has federal contracts |
| handles_phi | boolean | No | Handles protected health information |
| handles_pci | boolean | No | Handles payment card data |
| handles_cui | boolean | No | Handles controlled unclassified information |
| frameworks_required | string[] | No | Required compliance frameworks |

**Returns**: Created or updated CompanyRecord object.

---

### Tool 12: generate_compliance_package

Generate a compliance document package for a company.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_id | string (UUID) | Yes | Company ID |
| package_number | number (1-7) | Yes | Package to generate |
| formats | string[] | No | Output formats: docx, pdf, markdown (default: all) |

**Returns**: CompliancePackage object with generated content and output format status.

**Package Numbers**: 1=Internal Policy, 2=Security Handbook, 3=Data Privacy, 4=GovCon, 5=Google Partner, 6=Business Ops, 7=CMMC/FedRAMP.

---

### Tool 13: generate_all_compliance_packages

Generate all 7 compliance packages for a company at once.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_id | string (UUID) | Yes | Company ID |
| formats | string[] | No | Output formats (default: all) |

**Returns**: Array of 7 CompliancePackage objects.

---

### Tool 14: get_package_status

Get generation status for all 7 compliance packages.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_id | string (UUID) | Yes | Company ID |

**Returns**: Array of CompliancePackage objects with status (pending/generating/complete/error).

---

### Tool 15: run_intake_wizard

Run compliance intake wizard for a company.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_id | string (UUID) | Yes | Company ID |

**Returns**: IntakeResult with recommended_skills array. Each recommendation has skill_id, skill_name, priority (CRITICAL/HIGH/MEDIUM/LOW), and reason.

---

### Tool 16: get_maturity_score

Get compliance maturity score (0-10) with domain breakdown.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_id | string (UUID) | Yes | Company ID |

**Returns**: Object with overall score (0-10) and per-domain scores.

---

### Tool 17: update_template_status

Update implementation status of a compliance template.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tracker_id | string (UUID) | Yes | Maturity tracker ID |
| template_id | string | Yes | Template ID to update |
| status | string (enum) | Yes | not_started, in_progress, implemented, verified |
| notes | string | No | Implementation notes |

**Returns**: Updated MaturityTracker object.

---

### Tool 18: generate_bid_document

Generate a specific bid document for an opportunity.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| opportunity_id | string (UUID) | Yes | Opportunity ID |
| document_type | string (enum) | Yes | capability_statement, technical_approach, past_performance, price_proposal, management_approach, compliance_matrix, full_proposal |
| company_id | string (UUID) | No | Company ID (uses TNDS defaults if omitted) |
| formats | string[] | No | Output formats (default: all) |

**Returns**: BidDocument object with generated content and output format status.

---

### Tool 19: generate_full_bid_package

Generate a complete bid package (all 7 document types) for an opportunity.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| opportunity_id | string (UUID) | Yes | Opportunity ID |
| company_id | string (UUID) | No | Company ID (optional) |
| formats | string[] | No | Output formats (default: all) |

**Returns**: Array of 7 BidDocument objects.

---

### Tool 20: list_bid_documents

List all bid documents generated for an opportunity.

**Input**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| opportunity_id | string (UUID) | Yes | Opportunity ID |

**Returns**: Array of BidDocument objects for the specified opportunity.

---

## Entity Schemas

### Opportunity

```typescript
{
  id: string (UUID, auto-generated)
  title: string
  solicitation_number: string
  agency: string
  sub_agency?: string
  posted_date: Date
  response_deadline: Date
  set_aside_type: "SDVOSB" | "VOSB" | "8a" | "HUBZone" | "WOSB" | "small_business" | "full_open" | "sole_source"
  naics_code: string
  naics_description: string
  estimated_value?: number
  place_of_performance?: string
  description: string
  url?: string (URL)
  status: "identified" | "evaluating" | "bid" | "no_bid" | "submitted" | "awarded" | "lost"
  source: "sam_gov" | "manual" | "referral"
  created_at: Date
  updated_at: Date
}
```

### BidDecision

```typescript
{
  id: string (UUID)
  opportunity_id: string (UUID)
  decision: "bid" | "no_bid"
  score: number (0-100)
  criteria_scores: Array<{
    criterion: string
    score: number (0-100)
    weight: number (0-1)
    notes?: string
  }>
  decision_date: Date
  decided_by: string
  rationale: string
}
```

### Proposal

```typescript
{
  id: string (UUID)
  opportunity_id: string (UUID)
  title: string
  version: number (default: 1)
  status: "drafting" | "review" | "submitted" | "accepted" | "rejected"
  submitted_date?: Date
  contract_value?: number
  period_of_performance?: { start_date: Date, end_date: Date }
  team_members: string[]
  documents: Array<{ name: string, type: string, url?: string }>
  created_at: Date
  updated_at: Date
}
```

### OutreachContact

```typescript
{
  id: string (UUID)
  agency: string
  office?: string
  name: string
  title: string
  email: string (email format)
  phone?: string
  osdbu: boolean (default: false)
  last_contacted?: Date
  contact_count: number (default: 0)
  notes?: string
  status: "prospect" | "warm" | "active" | "cold" (default: "prospect")
  created_at: Date
}
```

### OutreachActivity

```typescript
{
  id: string (UUID)
  contact_id: string (UUID)
  activity_type: "email" | "phone" | "meeting" | "event" | "linkedin"
  subject: string
  notes?: string
  follow_up_date?: Date
  completed: boolean (default: false)
  created_at: Date
}
```

### ComplianceItem

```typescript
{
  id: string (UUID)
  item_type: "registration" | "certification" | "renewal" | "filing"
  name: string
  description: string
  authority: "SBA" | "SAM" | "IRS" | "state" | "VA"
  status: "current" | "expiring" | "expired" | "pending"
  effective_date?: Date
  expiration_date?: Date
  reminder_days_before: number (default: 30)
  notes?: string
}
```

### PipelineMetrics

```typescript
{
  id: string (UUID)
  period: "monthly" | "quarterly" | "annual"
  date: Date
  opportunities_identified: number
  bids_submitted: number
  wins: number
  losses: number
  no_bids: number
  total_bid_value: number
  total_won_value: number
  win_rate: number (0-1)
  avg_bid_value: number
  created_at: Date
}
```

### CompanyRecord

```typescript
{
  id: string (UUID)
  company_name: string
  legal_name?: string
  owner_name?: string
  owner_title?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email?: string
  website?: string
  ein?: string
  uei?: string
  cage_code?: string
  duns?: string
  naics_primary?: string
  business_type?: string
  employee_count?: number
  annual_revenue?: number
  year_founded?: number
  certifications: string[]
  security_officer?: string
  privacy_officer?: string
  compliance_officer?: string
  it_contact?: string
  cloud_provider?: string
  data_types_handled: string[]
  frameworks_required: string[]
  federal_contracts: boolean
  handles_phi: boolean
  handles_pci: boolean
  handles_cui: boolean
  created_at: Date
  updated_at: Date
}
```

### CompliancePackage

```typescript
{
  id: string (UUID)
  company_id: string (UUID)
  package_number: number (1-7)
  package_name: string
  slug: string
  status: "pending" | "generating" | "complete" | "error"
  generated_content?: string
  output_formats: ("docx" | "pdf" | "markdown")[]
  generated_at?: Date
  error_message?: string
}
```

### IntakeResult

```typescript
{
  id: string (UUID)
  company_id: string (UUID)
  business_type: string
  employee_count: number
  handles_phi: boolean
  handles_pci: boolean
  federal_contracts: boolean
  cloud_platform?: string
  frameworks_requested: string[]
  recommended_skills: Array<{
    skill_id: string
    skill_name: string
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    reason: string
  }>
  created_at: Date
}
```

### MaturityTracker

```typescript
{
  id: string (UUID)
  company_id: string (UUID)
  template_statuses: Array<{
    template_id: string
    skill_domain: string
    governance_level: string
    status: "not_started" | "in_progress" | "implemented" | "verified"
    notes?: string
    updated_at: Date
  }>
  overall_score: number (0-10)
  last_scored_at?: Date
}
```

### BidDocument

```typescript
{
  id: string (UUID)
  opportunity_id: string (UUID)
  document_type: "capability_statement" | "technical_approach" | "past_performance" | "price_proposal" | "management_approach" | "compliance_matrix" | "full_proposal"
  title: string
  content: string
  output_formats: ("docx" | "pdf" | "markdown")[]
  status: "draft" | "review" | "final"
  version: number (default: 1)
  created_at: Date
  updated_at: Date
}
```

---

## Configuration Constants

### Company Config

| Key | Value |
|-----|-------|
| name | True North Data Strategies LLC |
| owner | Jacob Johnston |
| address | 123 Example St, Anytown, CO 80000 |
| phone | 555-555-5555 |
| email | jacob@truenorthstrategyops.com |
| website | https://truenorthstrategyops.com |
| certification | SBA-certified VOSB/SDVOSB |
| uei | env: UEI |
| cageCode | env: CAGE_CODE |

### Bid Decision Thresholds

| Threshold | Value |
|-----------|-------|
| High Recommendation | >= 70 |
| Conditional | >= 40 |
| No Recommendation | < 40 |

### Compliance Reminder Thresholds

90 days, 60 days, 30 days, 7 days before expiration.

### Deadline Alert Thresholds

7 days (week), 3 days, 1 day before response deadline.

### Contract Value Thresholds

| Threshold | Value |
|-----------|-------|
| Micro-Purchase | $10,000 |
| Small Business | $250,000 |

### Governance Weights (Maturity Scoring)

| Tier | Weight |
|------|--------|
| ROOT | 3.0 |
| BASELINE | 2.5 |
| PLATFORM | 2.0 |
| CONTRACTUAL | 1.5 |
| SUPPORT | 1.0 |

### Status Scores (Maturity Scoring)

| Status | Score |
|--------|-------|
| not_started | 0.0 |
| in_progress | 0.25 |
| implemented | 0.75 |
| verified | 1.0 |

### Compliance Skill Domains

| ID | Name | Governance | Weight |
|----|------|-----------|--------|
| security-governance | Security Governance | ROOT | 3.0 |
| internal-compliance | Internal Compliance | BASELINE | 2.5 |
| data-handling-privacy | Data Handling & Privacy | BASELINE | 2.5 |
| cloud-platform-security | Cloud Platform Security | PLATFORM | 2.0 |
| business-operations | Business Operations | SUPPORT | 1.0 |
| government-contracting | Government Contracting | CONTRACTUAL | 1.5 |
| contracts-risk-assurance | Contracts & Risk Assurance | CONTRACTUAL | 1.5 |
| compliance-audit | Compliance Audit | BASELINE | 2.5 |
| compliance-research | Compliance Research | SUPPORT | 1.0 |
| compliance-usage | Usage Guides | SUPPORT | 1.0 |

### Compliance Frameworks

| ID | Name | Description |
|----|------|-------------|
| cmmc | CMMC | Cybersecurity Maturity Model Certification |
| soc2 | SOC 2 | Service Organization Control 2 |
| fedramp | FedRAMP | Federal Risk and Authorization Management Program |
| nist-800-53 | NIST 800-53 | Security and Privacy Controls for Information Systems |
| nist-800-171 | NIST 800-171 | Protecting Controlled Unclassified Information |
| hipaa | HIPAA | Health Insurance Portability and Accountability Act |
| pci | PCI DSS | Payment Card Industry Data Security Standard |
| gdpr | GDPR | General Data Protection Regulation |
| ccpa | CCPA/CPRA | California Consumer Privacy Act |
| iso-27001 | ISO 27001 | Information Security Management Systems |

### NAICS Codes

| Code | Description | Primary |
|------|-------------|---------|
| 541511 | Custom Computer Programming Services | Yes |
| 541512 | Computer Systems Design Services | Yes |
| 541519 | Other Computer Related Services | Yes |
| 541611 | Administrative Management & General Management Consulting | Yes |
| 518210 | Data Processing, Hosting, and Related Services | No |
| 511210 | Software Publishers | No |
| 561110 | Office Administrative Services | No |

### Set-Aside Types

| Type | Description | TNDS Eligible |
|------|-------------|---------------|
| SDVOSB | Service-Disabled Veteran-Owned Small Business | Yes |
| VOSB | Veteran-Owned Small Business | Yes |
| 8a | 8(a) Business Development | No |
| HUBZone | Historically Underutilized Business Zones | No |
| WOSB | Women-Owned Small Business | No |
| small_business | Small Business Set-Aside | Yes |
| full_open | Full and Open Competition | Yes |
| sole_source | Sole Source | Yes |

---

## Exports

### Services

| Export | Type | Description |
|--------|------|-------------|
| OpportunityService | Class | Opportunity pipeline CRUD |
| BidDecisionService | Class | Weighted bid/no-bid scoring |
| OutreachService | Class | Contact and activity management |
| ComplianceService | Class | Certification tracking |
| PipelineService | Class | Aggregate metrics |
| CompliancePackageService | Class | Compliance document generation |
| IntakeService | Class | Business-to-compliance mapping |
| MaturityService | Class | Governance-weighted scoring |
| BidDocumentService | Class | Bid document creation |

### Data

| Export | Type | Description |
|--------|------|-------------|
| InMemoryRepository | Class | In-memory data store |
| seedDatabase | Function | Populate repo with sample data |
| SEED_OPPORTUNITIES | Const | Sample opportunity data |
| SEED_OUTREACH_CONTACTS | Const | Sample contact data |
| SEED_COMPLIANCE_ITEMS | Const | Sample compliance items |
| COMPLIANCE_PACKAGE_TEMPLATES | Const | 7 Handlebars templates |
| PLACEHOLDER_MAP | Const | 26 token-to-field mappings |

### Config

| Export | Type | Description |
|--------|------|-------------|
| COMPANY_CONFIG | Const | Company information |
| BRAND_COLORS | Const | Brand color definitions |
| FONTS | Const | Font specifications |
| BID_DECISION_THRESHOLDS | Const | Bid scoring thresholds |
| COMPLIANCE_REMINDER_DAYS | Const | Expiration alert thresholds |
| DEADLINE_ALERT_DAYS | Const | Deadline alert thresholds |
| COMPLIANCE_PACKAGES | Const | Package definitions (7) |
| COMPLIANCE_FRAMEWORKS | Const | Framework definitions (10) |
| COMPLIANCE_SKILL_DOMAINS | Const | Skill domain definitions (10) |
| GOVERNANCE_WEIGHTS | Const | Maturity scoring weights |
| STATUS_SCORES | Const | Template status scores |
| DOCUMENT_FORMATS | Const | Supported output formats |
| NAICS_CODES | Const | NAICS code definitions (7) |
| SET_ASIDE_TYPES | Const | Set-aside type definitions (8) |

### APIs

| Export | Type | Description |
|--------|------|-------------|
| createOpportunitiesAPI | Factory | Opportunities REST adapter |
| createBidDecisionAPI | Factory | Bid decision REST adapter |
| createOutreachAPI | Factory | Outreach REST adapter |
| createComplianceAPI | Factory | Compliance REST adapter |
| createPipelineAPI | Factory | Pipeline REST adapter |

### Hooks

| Export | Type | Description |
|--------|------|-------------|
| DeadlineMonitor | Class | Opportunity deadline alerts |
| ComplianceMonitor | Class | Certification expiration alerts |

### Reporting

| Export | Type | Description |
|--------|------|-------------|
| PipelineDashboard | Class | Pipeline metrics dashboard |
| WinLossReportGenerator | Class | Performance analysis |
| OutreachReport | Class | Contact engagement metrics |

### Tools

| Export | Type | Description |
|--------|------|-------------|
| GOVCON_COMPLIANCE_TOOLS | Const | 20 tool definitions array |
| createToolHandlers | Factory | Tool handler map from repository |

### Types

| Export | Type | Description |
|--------|------|-------------|
| Opportunity | Type | Opportunity entity |
| BidDecision | Type | Bid decision entity |
| Proposal | Type | Proposal entity |
| OutreachContact | Type | Outreach contact entity |
| OutreachActivity | Type | Outreach activity entity |
| ComplianceItem | Type | Compliance item entity |
| PipelineMetrics | Type | Pipeline metrics entity |
| CompanyRecord | Type | Company record entity |
| CompliancePackage | Type | Compliance package entity |
| IntakeResult | Type | Intake result entity |
| MaturityTracker | Type | Maturity tracker entity |
| BidDocument | Type | Bid document entity |
| BidScoreInput | Interface | Bid scoring input |
| BidScoringWeights | Interface | Bid scoring weights |
| ToolDefinition | Interface | LLM tool definition |
| ToolHandler | Type | Tool handler function |
| DeadlineAlert | Interface | Deadline alert object |
| ComplianceAlert | Interface | Compliance alert object |
| DashboardMetrics | Interface | Pipeline dashboard metrics |
| WinLossReport | Interface | Win-loss report |
| OutreachMetrics | Interface | Outreach report metrics |
| GeneratedDocument | Type | Document output bundle |
| DocumentFormat | Type | docx, pdf, markdown |

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
