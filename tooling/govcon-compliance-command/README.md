# govcon-compliance-command

Unified federal government contracting and compliance management system for True North Data Strategies.

Consolidates `govcon-command`, `compliance-command`, `compliance-gov-module`, and `compliane-security` into a single LLM-droppable TypeScript module following the TNDS 6-layer architecture.

**Package**: `@tnds/govcon-compliance-command` v1.0.0

---

## What This Module Does

This module handles the full lifecycle of government contracting operations: finding opportunities, making bid/no-bid decisions, tracking compliance, generating compliance documentation, assessing organizational maturity, and producing bid packages. One module, six capabilities.

### GovCon Pipeline Management
Track federal contracting opportunities from SAM.gov through the entire lifecycle. Weighted bid/no-bid scoring engine evaluates 7 criteria across 14 total weight points. Outreach contact management with activity logging. Compliance item tracking with expiration alerts at 90/60/30/7 day thresholds. Pipeline metrics, win-loss analysis, and reporting dashboards.

### Compliance Document Generation
Single company intake populates 7 compliance packages via Handlebars templates. 39 placeholder tokens auto-replaced with company data. Output in DOCX, PDF, and Markdown.

Packages:
1. Internal Compliance Policy
2. Security Compliance Handbook
3. Data Handling & Privacy Policy
4. Government Contracting Compliance
5. Google Partner Compliance
6. Business Operations Compliance
7. Advanced Compliance (CMMC/FedRAMP)

### Regulatory Template Library
216 regulatory template files across 10 skill domains plus CMMC knowledge base and compliance mappings. Domains cover Security Governance, Internal Compliance, Data Handling, Cloud Security, Business Operations, Government Contracting, Contracts & Risk, Compliance Audit, Research, and Usage Guides.

Framework coverage: NIST 800-53, NIST 800-171, CMMC, SOC 2, FedRAMP, HIPAA, PCI DSS, GDPR, CCPA/CPRA, ISO 27001.

### CMMC Knowledge Base
6-tier CMMC regulatory document index. SOC 2 Type II and FedRAMP control mappings. NIST SP 800-171 templates (SSP, POA&M). Master GovCon Playbook with SPRS scoring and assessment methodology.

### Intake Wizard
Analyzes business profile (industry, data types, cloud platform, frameworks) and maps to recommended compliance skill domains with priority levels (CRITICAL/HIGH/MEDIUM/LOW). Handles PHI/PCI/CUI conditional logic and framework-specific recommendations.

### Maturity Scoring
Governance-weighted scoring algorithm on a 0-10 scale. Five governance tiers with distinct weights: ROOT (3.0), BASELINE (2.5), PLATFORM (2.0), CONTRACTUAL (1.5), SUPPORT (1.0). Status progression: not_started (0) → in_progress (0.25) → implemented (0.75) → verified (1.0). Breakdown by skill domain.

### Bid Document Creation
7 bid document types auto-populated with opportunity and company data. Output in DOCX, PDF, and Markdown.

Document types:
1. Capability Statement
2. Technical Approach
3. Past Performance
4. Price Proposal
5. Management Approach
6. Compliance Matrix
7. Full Proposal (all sections combined)

---

## Architecture

```
govcon-compliance-command/
  src/
    config/              # Company info, thresholds, NAICS, set-asides, skill domains
    data/                # Zod schemas (12 entities), repository, seed data
    services/            # 9 business services
      opportunity-service.ts      # Opportunity pipeline CRUD + deadline tracking
      bid-decision-service.ts     # Weighted bid/no-bid scoring (7 criteria, 14 weight)
      outreach-service.ts         # Contact and activity management
      compliance-service.ts       # Certification/registration tracking + alerts
      pipeline-service.ts         # Aggregate metrics + win-loss analysis
      package-service.ts          # 7 compliance package generation
      template-engine.ts          # Handlebars template rendering (39 tokens)
      document-generator.ts       # DOCX/PDF/Markdown output
      intake-service.ts           # Business-to-compliance mapping
      maturity-service.ts         # Governance-weighted scoring (0-10)
      bid-document-service.ts     # Bid/proposal document creation (7 types)
    api/                 # 5 REST-style API adapters
    hooks/               # Deadline + compliance monitors
    reporting/           # Pipeline dashboard, win-loss, outreach reports
    templates/           # 216 regulatory templates + CMMC knowledge base
    tools.ts             # 21 LLM tool definitions
    index.ts             # Main exports
```

Follows the TNDS 6-layer module pattern: config → data → services → api → hooks → reporting, with tools.ts and index.ts at the root.

---

## 21 LLM Tools

### Pipeline (1-10)

| # | Tool | Description |
|---|------|-------------|
| 1 | `search_opportunities` | Filter by agency, NAICS, set-aside, status |
| 2 | `run_bid_decision` | Weighted scoring with 7 input criteria |
| 3 | `get_pipeline_status` | Dashboard metrics |
| 4 | `log_outreach_activity` | Email/phone/meeting/event/LinkedIn logging |
| 5 | `check_compliance_status` | Authority compliance check with alerts |
| 6 | `get_upcoming_deadlines` | Response deadline tracking |
| 7 | `create_opportunity` | Add new opportunity to pipeline |
| 8 | `get_win_loss_report` | Performance analysis |
| 9 | `list_contacts` | Search outreach contacts |
| 10 | `get_bid_recommendation` | Get or suggest bid decision |

### Compliance Documents (11-14)

| # | Tool | Description |
|---|------|-------------|
| 11 | `submit_company_info` | Create/update company profile (40+ fields) |
| 12 | `generate_compliance_package` | Generate one package (1-7) |
| 13 | `generate_all_compliance_packages` | Generate all 7 packages |
| 14 | `get_package_status` | Check generation status |

### Intake & Maturity (15-18)

| # | Tool | Description |
|---|------|-------------|
| 15 | `run_intake_wizard` | Business profile to compliance recommendations |
| 16 | `initialize_maturity_tracker` | Create tracker from intake results (bridges intake → maturity) |
| 17 | `get_maturity_score` | Governance-weighted score with domain breakdown |
| 18 | `update_template_status` | Update template implementation status |

### Bid Documents (19-21)

| # | Tool | Description |
|---|------|-------------|
| 19 | `generate_bid_document` | Generate specific bid document type |
| 20 | `generate_full_bid_package` | Generate all 7 bid documents |
| 21 | `list_bid_documents` | List documents for an opportunity |

---

## 12 Data Entities

| Entity | Source | Description |
|--------|--------|-------------|
| Opportunity | govcon-command | Federal contracting opportunities |
| BidDecision | govcon-command | Weighted bid/no-bid scoring results |
| Proposal | govcon-command | Proposal tracking (status, version, team) |
| OutreachContact | govcon-command | Agency contacts and OSDBU liaisons |
| OutreachActivity | govcon-command | Contact interaction logging |
| ComplianceItem | govcon-command | Certifications, registrations, expirations |
| PipelineMetrics | govcon-command | Period-based aggregate metrics |
| CompanyRecord | compliance-command | Company profile (40+ fields) |
| CompliancePackage | compliance-command | Generated document package status |
| IntakeResult | compliance-gov-module | Intake wizard recommendations |
| MaturityTracker | compliance-gov-module | Template implementation status + score |
| BidDocument | new | Generated bid documents |

All entities validated with Zod schemas. TypeScript types inferred from schemas for full type safety.

---

## Setup

```bash
npm install
npm run build
npm test
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Build | `npm run build` | Compile TypeScript to dist/ |
| Dev | `npm run dev` | Watch mode compilation |
| Test | `npm test` | Run tests with Vitest |
| Test Watch | `npm run test:watch` | Watch mode testing |
| Lint | `npm run lint` | Type-check without emit |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| zod | ^3.22.4 | Schema validation |
| docx | ^9.5.1 | Word document generation |
| handlebars | ^4.7.8 | Template rendering |
| pdf-lib | ^1.17.1 | PDF generation |

No external database required. In-memory repository for development and testing. Extend to Firestore for production.

---

## Quick Start

```typescript
import {
  InMemoryRepository,
  OpportunityService,
  CompliancePackageService,
  IntakeService,
  MaturityService,
  BidDocumentService,
  GOVCON_COMPLIANCE_TOOLS,
  createToolHandlers,
  seedDatabase,
} from "@tnds/govcon-compliance-command";

// Initialize repository and seed with sample data
const repo = new InMemoryRepository();
await seedDatabase(repo);

// Get tool handlers for LLM integration
const handlers = createToolHandlers(repo);

// Pipeline dashboard
const dashboard = await handlers.get_pipeline_status({});

// Run bid decision (use seed UUID from seeds.ts)
const bidResult = await handlers.run_bid_decision({
  opportunity_id: "a0000000-0000-4000-8000-000000000001",
  technical_fit: 85,
  set_aside_match: 100,
  competition_level: 70,
  contract_value: 150000,
  timeline_feasibility: 80,
  relationship: 60,
  strategic_value: 75,
});

// Generate compliance documents
const company = await handlers.submit_company_info({ company_name: "True North Data Strategies LLC" });

// Run intake wizard → initialize maturity tracker
const intake = await handlers.run_intake_wizard({ company_id: company.id });
const tracker = await handlers.initialize_maturity_tracker({ company_id: company.id });

// Generate all compliance packages
await handlers.generate_all_compliance_packages({ company_id: company.id });

// Generate bid package
const bidPackage = await handlers.generate_full_bid_package({
  opportunity_id: "a0000000-0000-4000-8000-000000000001",
});
```

---

## Company Configuration

| Field | Value |
|-------|-------|
| Company | True North Data Strategies LLC |
| Owner | Jacob Johnston |
| Location | Colorado Springs, CO |
| Certification | SBA-certified VOSB/SDVOSB |
| Primary NAICS | 541511, 541512, 541519, 541611 |
| Set-Asides | SDVOSB, VOSB, Small Business, Full & Open |

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [Developer Guide](./docs/DEVELOPER_GUIDE.md) | Architecture deep-dive, service APIs, extending the module |
| [User Manual](./docs/USER_MANUAL.md) | Operational guide for running the module day-to-day |
| [API Reference](./docs/API_REFERENCE.md) | Complete tool definitions, entity schemas, service methods |

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
