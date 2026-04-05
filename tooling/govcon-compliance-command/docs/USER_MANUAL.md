# User Manual: GovCon Compliance Command

*Operational Guide for Federal Contracting & Compliance Management*

**Version**: 1.0.0
**Last Updated**: 2026-04-05
**Module**: @tnds/govcon-compliance-command

---

## What This Is

GovCon Compliance Command is the operational backbone for federal government contracting at True North Data Strategies. It tracks opportunities, makes bid/no-bid recommendations, manages compliance certifications, generates compliance documentation, scores organizational maturity, and produces bid packages.

One module handles the entire federal contracting lifecycle from "found an opportunity on SAM.gov" to "submitted a complete bid package."

## Who This Is For

This manual is for anyone operating the GovCon pipeline day-to-day: entering opportunities, running bid decisions, generating compliance documents, and tracking certifications. You don't need to write code. You interact with the system through 21 pre-built tools that an LLM (like Claude) can call on your behalf.

---

## Getting Started

### First-Time Setup

Before using any compliance or bid document features, submit your company information:

**Tool**: `submit_company_info`
**Required field**: `company_name`

The more fields you populate, the better your generated documents will be. Key fields to fill:

- Company name, address, phone, email, website
- Owner name and title
- UEI and CAGE code (for federal contracting)
- Primary NAICS code
- Business type and certifications
- Security officer, privacy officer, compliance officer names
- Cloud provider (Google Cloud, AWS, Azure)
- Data handling flags: handles_phi, handles_pci, handles_cui
- Federal contracts flag
- Required compliance frameworks

TNDS defaults are pre-configured in the system. For client work, submit the client's company info to generate their documentation.

### Seed Data

The system comes pre-loaded with sample data for testing: 2 opportunities, 2 outreach contacts, and 8 compliance items. This lets you explore the tools before adding real data.

---

## Pipeline Operations

### Adding an Opportunity

When you find an opportunity on SAM.gov or through other channels:

**Tool**: `create_opportunity`

Required information:
- Title
- Solicitation number
- Agency
- Response deadline (date)
- Set-aside type (SDVOSB, VOSB, 8a, HUBZone, WOSB, small_business, full_open)
- NAICS code and description
- Description of the work

Optional: estimated contract value, place of performance, URL to SAM.gov listing.

The opportunity enters the pipeline with status "identified."

### Searching Opportunities

**Tool**: `search_opportunities`

Filter by any combination of: agency, NAICS code, set-aside type, status. Leave all filters blank to see everything in the pipeline.

Status values track the lifecycle: identified → evaluating → bid/no_bid → submitted → awarded/lost.

### Making a Bid/No-Bid Decision

**Tool**: `run_bid_decision`

This is the core decision engine. You provide scores (0-100) for 7 criteria:

| Criterion | What You're Scoring | Weight |
|-----------|-------------------|--------|
| Technical Fit | Can we do this work? Do we have the skills and experience? | 3/14 |
| Set-Aside Match | Do we qualify for the set-aside? Is it our lane? | 3/14 |
| Competition Level | How crowded is the field? (0 = packed, 100 = just us) | 2/14 |
| Contract Value | Dollar amount of the contract | 2/14 |
| Timeline Feasibility | Can we meet the delivery schedule? | 2/14 |
| Relationship | Do we have existing contacts at the agency? | 1/14 |
| Strategic Value | Is this worth pursuing even if the numbers are marginal? | 1/14 |

The engine produces a weighted score (0-100) and a recommendation:
- 70+ = Strong bid recommendation
- 55-69 = Conditional bid (evaluate based on bandwidth)
- 40-54 = Conditional no-bid (significant gaps)
- Below 40 = Pass

Each criterion gets notes explaining the score interpretation. Use this output to make the final call.

### Checking Pipeline Status

**Tool**: `get_pipeline_status`

Returns a dashboard view: total opportunities by status, pipeline value, upcoming deadlines, action items, and high-value opportunities.

### Tracking Deadlines

**Tool**: `get_upcoming_deadlines`

Shows opportunities with response deadlines approaching. Default lookahead is 7 days. Alerts fire at three levels: one week, three days, one day.

### Win-Loss Analysis

**Tool**: `get_win_loss_report`

Performance analysis over a time period (default 180 days). Shows total bids submitted, wins, losses, win rate, total value won, and breakdowns by agency and NAICS code. Also analyzes loss patterns.

---

## Outreach Management

### Managing Contacts

**Tool**: `list_contacts`

Filter by agency or status (prospect, warm, active, cold). Shows contact count, last contact date, and OSDBU flag.

### Logging Activity

**Tool**: `log_outreach_activity`

Record every touchpoint: email, phone, meeting, event, LinkedIn. The system auto-increments contact count and updates the last contacted date. This feeds into the outreach report.

Activity types: email, phone, meeting, event, linkedin.

---

## Compliance Tracking

### Checking Compliance Status

**Tool**: `check_compliance_status`

Shows the current status of all certifications and registrations. Filter by authority (SBA, SAM, IRS, state, VA) or see everything at once.

The system monitors expiration dates and generates alerts:
- **Critical**: Expired or expiring within 7 days
- **Warning**: Expiring within 30 days
- **Upcoming**: Expiring within 90 days

Pre-loaded compliance items for TNDS include: SAM.gov registration, SDVOSB certification, Colorado business license, EIN, DUNS/UEI, insurance certificates, state tax registration, and veterans affairs verification.

---

## Compliance Document Generation

### The Process

Three steps to generate compliance documentation:

1. **Submit company info** (`submit_company_info`) - Provide company data that populates the templates.
2. **Generate packages** (`generate_compliance_package` or `generate_all_compliance_packages`) - The system renders Handlebars templates with your company data and produces documents in DOCX, PDF, and Markdown.
3. **Check status** (`get_package_status`) - Verify all packages generated successfully.

### The 7 Compliance Packages

| # | Package | What It Covers |
|---|---------|---------------|
| 1 | Internal Compliance Policy | Company-wide compliance framework, roles, reporting, training |
| 2 | Security Compliance Handbook | Security controls, access management, incident response |
| 3 | Data Handling & Privacy Policy | Data classification, handling procedures, privacy requirements |
| 4 | Government Contracting Compliance | FAR/DFARS compliance, CUI handling, NIST requirements |
| 5 | Google Partner Compliance | Google Cloud security, data handling, partner program requirements |
| 6 | Business Operations Compliance | Business continuity, insurance, record keeping, ethics |
| 7 | Advanced Compliance (CMMC/FedRAMP) | CMMC certification prep, FedRAMP controls, SPRS scoring |

Each package outputs in three formats: Word document (DOCX), PDF, and Markdown. The 39 placeholder tokens in each template are auto-replaced with your company data.

### Generating a Single Package

**Tool**: `generate_compliance_package`

Provide the company ID and package number (1-7). Optionally specify output formats (defaults to all three).

### Generating All Packages

**Tool**: `generate_all_compliance_packages`

Generates all 7 packages at once. Same output: DOCX, PDF, and Markdown for each.

---

## Intake Wizard

### What It Does

The intake wizard analyzes a company's business profile and recommends which compliance skill domains to focus on first. It looks at industry type, employee count, data handling (PHI, PCI, CUI), federal contract status, cloud platform, and requested frameworks.

### Running the Wizard

**Tool**: `run_intake_wizard`

Requires a company ID. The company must have info submitted first via `submit_company_info`.

The wizard returns a prioritized list of recommended compliance skill domains:

| Priority | Meaning |
|----------|---------|
| CRITICAL | Must address immediately, likely a regulatory requirement |
| HIGH | Important for your business profile, address within 30 days |
| MEDIUM | Should address, but not urgent |
| LOW | Nice to have, address when resources allow |

### Conditional Logic

The wizard applies these rules automatically:

- **Federal contracts** → Government Contracting (CRITICAL) + Contracts & Risk (HIGH)
- **Handles PHI** → Data Handling & Privacy (CRITICAL)
- **Handles PCI** → Data Handling & Privacy (CRITICAL) + Cloud Platform Security (HIGH)
- **Handles CUI** → Security Governance (CRITICAL) + Government Contracting (CRITICAL)
- **Google Cloud** → Cloud Platform Security (recommended)
- **Specific frameworks requested** → Mapped to relevant skill domains

---

## Maturity Scoring

### How It Works

The maturity score measures how far along you are in implementing compliance across all skill domains. It runs on a 0-10 scale using governance-weighted scoring.

**Governance Tiers** (higher weight = more impact on your score):

| Tier | Weight | Domains |
|------|--------|---------|
| ROOT | 3.0 | Security Governance |
| BASELINE | 2.5 | Internal Compliance, Data Handling & Privacy, Compliance Audit |
| PLATFORM | 2.0 | Cloud Platform Security |
| CONTRACTUAL | 1.5 | Government Contracting, Contracts & Risk Assurance |
| SUPPORT | 1.0 | Business Operations, Compliance Research, Usage Guides |

**Status Progression** (each template progresses through these states):

| Status | Score | Meaning |
|--------|-------|---------|
| not_started | 0.0 | Haven't touched it |
| in_progress | 0.25 | Working on it |
| implemented | 0.75 | In place, not yet verified |
| verified | 1.0 | In place and validated |

### Initializing the Tracker

**Tool**: `initialize_maturity_tracker`

After running the intake wizard, initialize a maturity tracker for the company. This bridges the intake results into a tracker that `get_maturity_score` and `update_template_status` operate on. Without this step, those tools have nothing to work with.

Requires: company must have intake results (run `run_intake_wizard` first).

### Getting Your Score

**Tool**: `get_maturity_score`

Returns the overall score (0-10) plus a breakdown by skill domain. Use this to identify which domains need attention and track improvement over time.

### Updating Template Status

**Tool**: `update_template_status`

As you implement compliance templates, update their status. This directly affects your maturity score. Provide the tracker ID, template ID, new status, and optional notes.

---

## Bid Document Generation

### The 7 Document Types

| Type | What It Produces |
|------|-----------------|
| Capability Statement | Company overview, core competencies, past performance summary, certifications |
| Technical Approach | How you'll perform the work, methodology, tools, staffing |
| Past Performance | Relevant contract history, references, outcomes |
| Price Proposal | Cost breakdown, labor categories, pricing structure |
| Management Approach | Project management methodology, org chart, communication plan |
| Compliance Matrix | Point-by-point response to solicitation requirements |
| Full Proposal | All sections combined into one document |

### Generating a Single Document

**Tool**: `generate_bid_document`

Required: opportunity ID and document type. Optional: company ID (uses TNDS defaults if not provided) and output formats.

Each document is auto-populated with opportunity details (agency, solicitation number, description, value) and company information (name, certifications, NAICS codes, past performance).

### Generating a Full Bid Package

**Tool**: `generate_full_bid_package`

Generates all 7 document types for an opportunity at once. This is the "give me everything" option for a complete bid submission package.

### Listing Bid Documents

**Tool**: `list_bid_documents`

Shows all generated bid documents for a specific opportunity, including document type, status, version, and output formats.

---

## Regulatory Template Library

The module includes 216 regulatory template files organized across 10 skill domains plus supplementary resources:

**Skill Domains**: Security Governance, Internal Compliance, Data Handling & Privacy, Cloud Platform Security, Business Operations, Government Contracting, Contracts & Risk Assurance, Compliance Audit, Compliance Research, Usage Guides.

**Supplementary Resources**: CMMC Knowledge Base (6 tiers), Compliance Mappings (SOC 2, FedRAMP), Master GovCon Playbook, Controls Mapping, Lifecycle docs, and Shared Reference materials.

**Framework Coverage**: NIST 800-53, NIST 800-171, CMMC (all levels), SOC 2 Type II, FedRAMP, HIPAA, PCI DSS, GDPR, CCPA/CPRA, ISO 27001.

These templates feed into the maturity scoring system and provide the foundation for compliance package generation.

---

## Common Workflows

### New Opportunity Discovered on SAM.gov

1. `create_opportunity` - Enter the opportunity details
2. `run_bid_decision` - Score it against the 7 criteria
3. If bid: `generate_bid_document` (capability statement first)
4. `log_outreach_activity` - Record agency contact

### Quarterly Compliance Check

1. `check_compliance_status` - Review all certifications
2. `get_maturity_score` - Check current maturity score
3. Address any critical/warning alerts before they expire
4. `update_template_status` - Update any templates you've implemented

### Client Onboarding (Compliance Services)

1. `submit_company_info` - Enter client company data
2. `run_intake_wizard` - Get recommended compliance domains
3. `initialize_maturity_tracker` - Create the maturity tracker from intake results
4. `generate_all_compliance_packages` - Generate their documentation
5. `get_maturity_score` - Establish baseline score
6. Work through recommended domains by priority

### Full Bid Submission

1. `create_opportunity` - Log the opportunity
2. `run_bid_decision` - Validate the bid decision
3. `submit_company_info` - Ensure company profile is current
4. `generate_full_bid_package` - Generate all 7 bid documents
5. `list_bid_documents` - Verify all documents generated
6. Review and customize generated documents before submission

---

## Troubleshooting

**"Company not found"** - Submit company info first with `submit_company_info`. The company_id is returned when you create the record.

**"Opportunity not found"** - The opportunity_id must match an existing opportunity. Use `search_opportunities` to find valid IDs.

**Package generation returns "error" status** - Check that the company record has enough data populated. The more fields completed in `submit_company_info`, the more complete the generated documents will be.

**Maturity score is 0** - The tracker needs to be initialized and template statuses updated. Run `run_intake_wizard` first, then `initialize_maturity_tracker` to create the tracker, then start updating template statuses with `update_template_status` as you implement them.

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
