# Developer Guide: govcon-compliance-command

*Internal Reference Document*

**Version**: 1.0.0
**Last Updated**: 2026-04-05
**Maintained by**: Jacob Johnston

---

## Purpose

This guide covers the internal architecture, service APIs, data layer, and extension patterns for `@tnds/govcon-compliance-command`. Use it when building on, integrating with, or maintaining this module.

---

## Architecture Overview

The module follows the TNDS 6-layer pattern used across all Command modules (sales-command, realty-command, proposal-command):

```
config → data → services → api → hooks → reporting
                                              ↓
                                          tools.ts → index.ts
```

Each layer depends only on layers above it. Services depend on data and config. APIs wrap services. Hooks and reporting consume services. Tools wire everything together for LLM consumption.

### Layer Responsibilities

**config/** - Static configuration: company info, brand colors, NAICS codes, set-aside types, compliance framework definitions, governance weights, thresholds, and compliance seed items.

**data/** - Zod schemas for all 12 entities, the InMemoryRepository class (complete CRUD), seed data, and Handlebars compliance package templates with placeholder mappings.

**services/** - Business logic. Nine services covering opportunity management, bid decisions, outreach tracking, compliance monitoring, pipeline metrics, compliance package generation, template rendering, document output, intake analysis, maturity scoring, and bid document creation.

**api/** - Five REST-style API adapters that wrap services into request/response patterns. These are factory functions that accept a repository and return an API object.

**hooks/** - Two monitoring services: DeadlineMonitor (tracks opportunity response deadlines at week/3-day/1-day severity) and ComplianceMonitor (tracks certification expirations at critical/warning/upcoming severity with 90/60/30/7 day thresholds).

**reporting/** - Three reporting generators: PipelineDashboard (aggregate metrics, action items, high-value opportunities), WinLossReportGenerator (performance analysis, loss patterns), OutreachReport (engagement metrics, cold contacts, OSDBU summary).

**tools.ts** - 20 LLM tool definitions with JSON Schema input specifications. The `createToolHandlers()` factory instantiates all services and returns a handler map.

**index.ts** - Public exports. Everything accessible from outside the module is re-exported here.

---

## Data Layer

### Repository Pattern

All data flows through `InMemoryRepository`. It stores entities in `Map<string, T>` collections and exposes typed CRUD methods for each of the 12 entities.

```typescript
import { InMemoryRepository } from "./data/repository.js";

const repo = new InMemoryRepository();
```

Key methods beyond basic CRUD:

| Method | Returns | Purpose |
|--------|---------|---------|
| `getCompanyByName(name)` | CompanyRecord or null | Lookup by company name |
| `listCompliancePackagesByCompany(id)` | CompliancePackage[] | All packages for a company |
| `getIntakeResultByCompany(id)` | IntakeResult or null | Most recent intake result |
| `getMaturityTrackerByCompany(id)` | MaturityTracker or null | Current maturity tracker |
| `listBidDocumentsByOpportunity(id)` | BidDocument[] | All bid docs for an opportunity |
| `getBidDecisionByOpportunity(id)` | BidDecision or null | Bid decision for an opportunity |

To extend to Firestore or another persistence layer, implement the same interface with real database calls. The service layer doesn't care where data lives.

### Zod Schemas

All 12 entities are defined as Zod schemas in `data/schemas.ts`. TypeScript types are inferred from schemas:

```typescript
import { OpportunitySchema, type Opportunity } from "./data/schemas.js";

// Validate incoming data
const parsed = OpportunitySchema.parse(rawData);

// Type is automatically inferred
const opp: Opportunity = parsed;
```

Schema features: UUID auto-generation via `randomUUID()`, date coercion with `z.coerce.date()`, sensible defaults for optional fields, enum validation for status fields and types.

### Seed Data

`data/seeds.ts` provides:
- 2 sample opportunities (VA and DoD)
- 2 sample outreach contacts
- 8 compliance items (SAM.gov, SDVOSB cert, CO business license, etc.)
- 7 Handlebars compliance package templates with full markdown content
- 26 placeholder-to-field mappings (PLACEHOLDER_MAP)

Call `seedDatabase(repo)` to populate the repository with sample data for development and testing.

---

## Services

### OpportunityService

Manages the opportunity pipeline lifecycle.

```typescript
const oppService = new OpportunityService(repo);

// Create
const opp = await oppService.createOpportunity(
  title, solicitation_number, agency, response_deadline,
  set_aside_type, naics_code, naics_description, description,
  { estimated_value: 150000 }
);

// Filter
const results = await oppService.listOpportunities({
  agency: "VA",
  status: "evaluating",
  set_aside_type: "SDVOSB",
});

// Deadlines
const upcoming = await oppService.getUpcomingDeadlines(7);

// Status counts
const counts = await oppService.getStatusCounts();

// Pipeline value
const value = await oppService.getPipelineValue();
```

### BidDecisionService

Weighted scoring engine with 7 criteria and configurable weights (total weight: 14 points).

**Default Weights**:

| Criterion | Weight | Max Contribution |
|-----------|--------|-----------------|
| Technical Fit | 3 | 21.4% |
| Set-Aside Match | 3 | 21.4% |
| Competition Level | 2 | 14.3% |
| Contract Value | 2 | 14.3% |
| Timeline Feasibility | 2 | 14.3% |
| Relationship | 1 | 7.1% |
| Strategic Value | 1 | 7.1% |

**Contract Value Scoring**: Normalized based on thresholds. Below micro-purchase ($10K) scores 30-50. Between micro-purchase and small business ($250K) scores 50-85. Above $250K scores 85.

**Decision Thresholds**: Score >= 70 = strong bid recommendation. Score 55-69 = conditional bid. Score 40-54 = conditional no-bid. Score < 40 = pass.

```typescript
const bidService = new BidDecisionService(repo);

const decision = await bidService.runBidDecision("opp-001", {
  technicalFit: 85,
  setAsideMatch: 100,
  competitionLevel: 70,
  contractValue: 150000,
  timelineFeasibility: 80,
  relationship: 60,
  strategicValue: 75,
});
// Returns: { decision: "bid", score: 82, criteria_scores: [...], rationale: "..." }
```

### OutreachService

Contact management with activity logging and auto-status transitions.

```typescript
const outreachService = new OutreachService(repo);

// Create contact
const contact = await outreachService.createContact("VA", "Jane Smith", "Contracting Officer", "jane@va.gov");

// Log activity (auto-increments contact_count, updates last_contacted)
await outreachService.logActivity(contact.id, "email", "Initial introduction");

// Get interaction history
const history = await outreachService.getContactHistory(contact.id);

// Filter contacts
const warmContacts = await outreachService.listContacts({ status: "warm" });

// Pending follow-ups
const followUps = await outreachService.getPendingFollowUps();
```

### ComplianceService

Tracks certifications, registrations, and renewals with expiration monitoring.

```typescript
const complianceService = new ComplianceService(repo);

// Check by authority
const samStatus = await complianceService.checkAuthorityCompliance("SAM");

// Get expiring items (uses 90/60/30/7 day thresholds)
const expiring = await complianceService.getExpiringItems();

// Update status
await complianceService.updateItemStatus(itemId, "current");
```

### PipelineService

Aggregate metrics and win-loss analysis.

```typescript
const pipelineService = new PipelineService(repo);

// Live metrics
const metrics = await pipelineService.getLiveMetrics();

// Win-loss analysis (last N days)
const analysis = await pipelineService.getWinLossAnalysis(180);

// Pipeline summary
const summary = await pipelineService.getPipelineSummary();
```

### CompliancePackageService

Generates compliance document packages using Handlebars templates.

```typescript
const packageService = new CompliancePackageService(repo);

// Generate single package (package numbers 1-7)
const pkg = await packageService.generatePackage("company-001", 3, ["docx", "pdf", "markdown"]);

// Generate all 7 packages
const allPkgs = await packageService.generateAll("company-001");

// Check status
const status = await packageService.getPackageStatus("company-001");
```

The generation pipeline: fetch company record → build replacement values (39 tokens) → render Handlebars template → generate DOCX/PDF/Markdown outputs.

### Template Engine

Renders Handlebars templates with company data and regulatory content.

```typescript
import { renderTemplate, renderMarkdownTemplate, buildReplacementValues } from "./services/template-engine.js";

// Build token values from company record
const values = buildReplacementValues(companyRecord);

// Render compliance package template
const rendered = renderTemplate(templateContent, values);

// Render regulatory template from template library
const regulatory = renderMarkdownTemplate(templatePath, values);
```

39 placeholder tokens include: COMPANY_NAME, OWNER_NAME, ADDRESS, CITY, STATE, ZIP, PHONE, EMAIL, WEBSITE, UEI, CAGE_CODE, EIN, NAICS_PRIMARY, BUSINESS_TYPE, EMPLOYEE_COUNT, SECURITY_OFFICER, PRIVACY_OFFICER, COMPLIANCE_OFFICER, IT_CONTACT, CLOUD_PROVIDER, CURRENT_DATE, CURRENT_YEAR, and more.

### Document Generator

Produces DOCX, PDF, and Markdown output files.

```typescript
import { generateDocx, generatePdf, generateDocumentOutputs } from "./services/document-generator.js";

// Generate all three formats at once
const docs = await generateDocumentOutputs(title, markdownContent);
// Returns: { docx: Buffer, pdf: Buffer, markdown: string }

// Generate individual formats
const docxBuffer = await generateDocx(title, markdownContent);
const pdfBuffer = await generatePdf(title, markdownContent);
```

DOCX generation parses markdown headings (H1-H4) and renders with proper heading styles. PDF generation uses pdf-lib with word wrapping and TNDS brand colors (Navy headers, body text layout).

### IntakeService

Maps business profiles to compliance skill domain recommendations.

```typescript
const intakeService = new IntakeService(repo);

const result = await intakeService.runIntake("company-001");
// Returns: {
//   recommended_skills: [
//     { skill_id: "security-governance", priority: "CRITICAL", reason: "..." },
//     { skill_id: "government-contracting", priority: "HIGH", reason: "..." },
//     ...
//   ]
// }
```

Conditional logic: federal contracts trigger Government Contracting (CRITICAL) + Contracts & Risk (HIGH). PHI data adds Data Handling (CRITICAL). PCI data adds Data Handling (CRITICAL) + Cloud Security (HIGH). CUI data adds Security Governance (CRITICAL) + Government Contracting (CRITICAL). Google Cloud adds Cloud Platform Security. Requested frameworks map directly to relevant skill domains.

### MaturityService

Governance-weighted compliance maturity scoring.

```typescript
const maturityService = new MaturityService(repo);

// Initialize tracker with all templates
const tracker = await maturityService.initializeTracker("company-001");

// Update template status
await maturityService.updateTemplateStatus(tracker.id, "template-001", "implemented");

// Get score (0-10 scale)
const score = await maturityService.calculateScore(tracker.id);

// Get breakdown by domain
const breakdown = await maturityService.getScoreBreakdown("company-001");
// Returns: { overall: 4.2, domains: { "security-governance": 6.1, ... } }
```

Scoring algorithm: each template's status score (0, 0.25, 0.75, 1.0) is multiplied by its governance weight (ROOT=3.0 through SUPPORT=1.0). Weighted average across all templates produces the final 0-10 score.

### BidDocumentService

Generates 7 types of bid documents auto-populated with opportunity and company data.

```typescript
const bidDocService = new BidDocumentService(repo);

// Generate single document
const doc = await bidDocService.generateBidDocument(
  "opp-001",
  "capability_statement",
  "company-001",
  ["docx", "pdf", "markdown"]
);

// Generate full bid package (all 7 documents)
const fullPackage = await bidDocService.generateFullBidPackage("opp-001");

// List documents for opportunity
const docs = await bidDocService.listBidDocuments("opp-001");
```

Document types: capability_statement, technical_approach, past_performance, price_proposal, management_approach, compliance_matrix, full_proposal. Each template is pre-built with sections appropriate to that document type. Full proposal combines all sections.

---

## API Layer

Five factory functions create API adapters that wrap services:

```typescript
import { createOpportunitiesAPI } from "./api/opportunities-api.js";
import { createBidDecisionAPI } from "./api/bid-decision-api.js";
import { createOutreachAPI } from "./api/outreach-api.js";
import { createComplianceAPI } from "./api/compliance-api.js";
import { createPipelineAPI } from "./api/pipeline-api.js";

const oppAPI = createOpportunitiesAPI(repo);
const bidAPI = createBidDecisionAPI(repo);
const outreachAPI = createOutreachAPI(repo);
const complianceAPI = createComplianceAPI(repo);
const pipelineAPI = createPipelineAPI(repo);
```

Each API returns an object with methods matching the REST convention (list, get, create, update, delete). Use these when integrating with an HTTP server or similar request/response pattern.

---

## Hooks

### DeadlineMonitor

Watches opportunity response deadlines and generates alerts at three severity levels.

```typescript
const deadlineMonitor = new DeadlineMonitor(oppService);
const alerts = await deadlineMonitor.checkDeadlines();
// Returns: DeadlineAlert[] with severity: "week" | "threeDay" | "oneDay"
```

### ComplianceMonitor

Watches certification and registration expirations.

```typescript
const complianceMonitor = new ComplianceMonitor(complianceService);
const alerts = await complianceMonitor.checkCompliance();
// Returns: ComplianceAlert[] with severity: "critical" | "warning" | "upcoming"
```

Alert thresholds: critical (expired or within 7 days), warning (within 30 days), upcoming (within 90 days).

---

## Reporting

### PipelineDashboard

```typescript
const dashboard = new PipelineDashboard(oppService, pipelineService);

const metrics = await dashboard.getDashboard();
const actions = await dashboard.getActionItems();
const highValue = await dashboard.getHighValueOpportunities(100000);
```

### WinLossReportGenerator

```typescript
const winLoss = new WinLossReportGenerator(pipelineService);

const report = await winLoss.generateReport(180);
const lossReasons = await winLoss.analyzeLossReasons(180);
```

### OutreachReport

```typescript
const outreach = new OutreachReport(outreachService);

const metrics = await outreach.generateMetrics();
const engaged = await outreach.getHighEngagementContacts(3);
const cold = await outreach.getColdContacts(60);
const osdbu = await outreach.getOSDBUSummary();
```

---

## LLM Integration

The module is designed for LLM tool use. `GOVCON_COMPLIANCE_TOOLS` exports 20 tool definitions in JSON Schema format compatible with Claude, GPT, and other LLM tool calling systems.

```typescript
import { GOVCON_COMPLIANCE_TOOLS, createToolHandlers } from "@tnds/govcon-compliance-command";

// Get tool definitions for LLM system prompt
const tools = GOVCON_COMPLIANCE_TOOLS;
// Each tool has: name, description, inputSchema (JSON Schema)

// Create handlers
const repo = new InMemoryRepository();
await seedDatabase(repo);
const handlers = createToolHandlers(repo);

// Handle LLM tool call
const toolName = "search_opportunities";
const toolInput = { agency: "VA", set_aside_type: "SDVOSB" };
const result = await handlers[toolName](toolInput);
```

The `createToolHandlers()` factory instantiates all 9 services, 2 monitors, and 3 reporters from a single repository instance. Every tool handler returns a plain object suitable for JSON serialization back to the LLM.

---

## Extending the Module

### Adding a New Entity

1. Define Zod schema in `data/schemas.ts`
2. Add CRUD methods to `InMemoryRepository` in `data/repository.ts`
3. Export type from `index.ts`

### Adding a New Service

1. Create service file in `services/`
2. Accept `InMemoryRepository` in constructor
3. Implement business logic methods
4. Export from `index.ts`

### Adding a New LLM Tool

1. Add tool definition to `GOVCON_COMPLIANCE_TOOLS` array in `tools.ts`
2. Add handler function to `createToolHandlers()` return object
3. Follow the existing inputSchema pattern (JSON Schema with type, properties, required)

### Adding a New Compliance Package Template

1. Add template to `COMPLIANCE_PACKAGE_TEMPLATES` in `data/seeds.ts`
2. Use `{{PLACEHOLDER_NAME}}` syntax for dynamic content
3. Add any new placeholder mappings to `PLACEHOLDER_MAP`
4. Update `COMPLIANCE_PACKAGES` config if adding a new package number

### Adding a New Regulatory Template

1. Add markdown file to appropriate skill domain directory in `templates/`
2. Include YAML frontmatter with template metadata (framework tags, skill domain)
3. Template will be automatically available through the template engine

### Moving to Firestore

Replace `InMemoryRepository` with a Firestore implementation that exposes the same methods. The service layer is persistence-agnostic by design. Each entity maps to a Firestore collection. Zod schemas handle validation on read/write.

---

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Tests use Vitest. Each service should have a corresponding test file that initializes a fresh `InMemoryRepository`, seeds it with test data, and verifies service behavior.

---

## Build

```bash
npm run build         # Compile to dist/
npm run dev           # Watch mode compilation
npm run lint          # Type-check without emit
```

TypeScript compiles to `dist/` with declaration files. The module is consumed as `@tnds/govcon-compliance-command` from the monorepo.

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
