# govcon-command

LLM-droppable TypeScript service for federal government contracting operations. Designed for True North Data Strategies LLC (SDVOSB/VOSB) to manage federal contracting pipeline, bid decisions, compliance tracking, and outreach.

## Features

- **Opportunity Management**: Track federal contracting opportunities with SAM.gov integration potential
- **Weighted Bid/No-Bid Scoring**: AI-backed evaluation engine with 7 weighted criteria
- **Pipeline Dashboard**: Real-time visibility into pipeline value, deadlines, and status
- **Compliance Tracking**: Monitor certifications (SDVOSB, SAM.gov, state licenses) with expiration alerts
- **Outreach Management**: Contact database with activity logging and follow-up scheduling
- **Win-Loss Analysis**: Track performance by agency, NAICS code, and contract value
- **LLM Tools**: 10+ tools for Claude and other LLMs to interact with the system
- **In-Memory Repository**: Full TypeScript support with Zod validation, no external database required

## Architecture

### 6-Layer Design

```
govcon-command/
  src/
    config/           # Branding, NAICS codes, set-asides, compliance templates
    data/             # Zod schemas, InMemoryRepository, seed data
    services/         # Core business logic (5 services)
    api/              # REST-like API handlers (5 API adapters)
    hooks/            # Deadline monitor, compliance monitor
    reporting/        # Dashboard, win-loss report, outreach report
    tools.ts          # LLM tool definitions & handlers
  tests/              # Vitest unit tests
  package.json
  tsconfig.json
```

### Services

1. **OpportunityService** - CRUD, search/filter by agency/NAICS/set-aside/status, deadline tracking
2. **BidDecisionService** - Weighted scoring engine (technical fit 3x, set-aside 3x, competition 2x, value 2x, timeline 2x, relationship 1x, strategic 1x)
3. **OutreachService** - Contact management, activity logging, follow-up scheduling
4. **ComplianceService** - Track registrations/certifications with expiration alerts (90/60/30/7 day thresholds)
5. **PipelineService** - Aggregate metrics, win rate, bid value tracking

### Data Model

**Opportunities**: id, title, solicitation_number, agency, response_deadline, set_aside_type, naics_code, estimated_value, status, source

**Bid Decisions**: id, opportunity_id, decision, score (0-100), criteria_scores, rationale

**Proposals**: id, opportunity_id, title, version, status, submitted_date, contract_value

**Outreach Contacts**: id, agency, name, title, email, phone, osdbu, last_contacted, contact_count, status

**Outreach Activities**: id, contact_id, activity_type, subject, follow_up_date, completed

**Compliance Items**: id, name, authority (SBA/SAM/IRS/state/VA), status, expiration_date

**Pipeline Metrics**: period, date, opportunities_identified, bids_submitted, wins, win_rate, total_bid_value

## Quick Start

### Installation

```bash
npm install
npx tsc --noEmit  # Verify TypeScript
npm test          # Run Vitest
```

### Basic Usage

```typescript
import { initializeGovconCommand } from "@tnds/govcon-command";

// Initialize with seed data
const { opportunityService, bidDecisionService, tools } = 
  await initializeGovconCommand(true);

// List opportunities
const opps = await opportunityService.listOpportunities({
  agency: "General Services Administration",
  set_aside_type: "SDVOSB"
});

// Run bid decision
const decision = await bidDecisionService.runBidDecision(oppId, {
  technicalFit: 85,
  setAsideMatch: 90,
  competitionLevel: 70,
  contractValue: 150_000,
  timelineFeasibility: 80,
  relationship: 60,
  strategicValue: 75,
});

// Get pipeline dashboard
const dashboard = await pipelineService.getPipelineSummary();
```

## LLM Tools (Claude Integration)

10 tools available for LLM use:

1. **search_opportunities** - Filter by agency, NAICS, set-aside, status
2. **run_bid_decision** - Weighted scoring (technical, set-aside, competition, value, timeline, relationship, strategic)
3. **get_pipeline_status** - Real-time dashboard metrics
4. **log_outreach_activity** - Email, phone, meeting, event, LinkedIn logging
5. **check_compliance_status** - SAM/SBA/IRS/state/VA compliance alerts
6. **get_upcoming_deadlines** - Response deadlines (7/3/1 day warnings)
7. **create_opportunity** - Add new opportunity to pipeline
8. **get_win_loss_report** - Performance analysis by agency/NAICS
9. **list_contacts** - Search outreach contacts
10. **get_bid_recommendation** - Check bid decision for opportunity

### Example Claude Integration

```typescript
import { GOVCON_COMMAND_TOOLS, createToolHandlers } from "@tnds/govcon-command";

const repo = new InMemoryRepository();
const handlers = createToolHandlers(repo);

// Pass GOVCON_COMMAND_TOOLS to Claude API as tool definitions
// When Claude calls a tool, use handlers[toolName](input)
```

## Bid Decision Scoring

Score ranges:

- **70+**: Strong recommendation to bid
- **40-69**: Conditional (evaluate team bandwidth)
- **<40**: Recommendation to pass

Criteria weights (total 14 points):

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Technical Fit | 3 | Skills/past performance match |
| Set-Aside Match | 3 | SDVOSB/VOSB alignment |
| Competition | 2 | Expected competitor count |
| Contract Value | 2 | Worth the effort (normalized) |
| Timeline | 2 | Can deliver on schedule |
| Relationship | 1 | Existing agency contact |
| Strategic Value | 1 | Door-opener opportunity |

All scores are transparent and auditable (show all criteria scores in decision rationale).

## Compliance Tracking

**Default Items** (auto-seeded):

- SAM.gov registration (annual)
- SDVOSB certification (3-year)
- Colorado business license (annual)
- Federal/state tax returns (annual)
- General liability insurance (annual)
- DUNS number (24-month)
- Cyber security/NIST compliance (24-month)

**Alert Thresholds**:

- 90 days before expiration: upcoming
- 30 days before expiration: warning
- 7 days before expiration: critical
- After expiration: expired

## Config

**Company Information**:

```typescript
COMPANY_CONFIG = {
  name: "True North Data Strategies LLC",
  owner: "Jacob Johnston",
  address: "123 Example St, Anytown, CO 80000",
  phone: "555-555-5555",
  email: "jacob@truenorthstrategyops.com",
  uei: "pending",
  cageCode: "pending",
}
```

**Brand Colors**:

- Primary Navy: #1a3a5c
- Secondary Teal: #3d8eb9
- Light Gray: #cccccc

**NAICS Codes** (7 primary codes):

- 541511: Custom Computer Programming
- 541512: Computer Systems Design
- 541519: Other Computer Related Services
- 541611: Admin Management Consulting
- 541690: Scientific/Technical Consulting
- 518210: Data Processing/Hosting
- 611430: Professional Development Training

**Set-Asides** (Eligible for TNDS):

- SDVOSB (Service-Disabled Veteran-Owned)
- VOSB (Veteran-Owned)
- Small Business
- Full & Open Competition

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npx vitest run       # Vitest directly
```

**Test Coverage**:

- Bid decision scoring (thresholds, weights, micro-purchase contracts)
- Opportunity filtering and deadline tracking
- Compliance alerts (90/60/30/7 day thresholds)
- Outreach activity logging and contact status transitions
- Pipeline metrics aggregation

## Development

```bash
npm run build        # Compile TypeScript
npm run dev          # Watch compilation
npm run lint         # Type check with TSC
```

## Environment Variables

```env
# Firebase (optional for real integration)
FIREBASE_PROJECT_ID=true-north-contracting
FIREBASE_API_KEY=your-api-key

# SAM.gov (optional for real integration)
SAM_GOV_API_KEY=your-api-key

# Company
COMPANY_NAME=True North Data Strategies LLC
OWNER_NAME=Jacob Johnston
UEI=pending
CAGE_CODE=pending

# Thresholds
BID_DECISION_THRESHOLD_HIGH=70
BID_DECISION_THRESHOLD_LOW=40
```

## Design Principles

1. **Type Safety**: Strict TypeScript, Zod validation on all data
2. **Transparency**: All scoring/decisions show full criteria breakdown
3. **Auditability**: Every decision includes rationale and timestamp
4. **Testability**: In-memory repository, no external dependencies required
5. **LLM-First**: Built for Claude and other LLMs via tool definitions
6. **No Hidden Logic**: All weights, thresholds, and formulas are explicit and configurable

## Real-World Integration

For production use with Firestore:

1. Extend `InMemoryRepository` to `FirestoreRepository` (implement same interface)
2. Add SAM.gov API integration to `DeadlineMonitor` for live opportunity syncing
3. Add email service for compliance/deadline notifications
4. Connect to real authentication (SBA Portal API for SDVOSB verification)

The current in-memory implementation is perfect for:

- Development and testing
- Prototyping with Claude
- Demo instances
- Offline capability
- Zero cloud infrastructure cost

## License

MIT © True North Data Strategies LLC

---

**Created for**: True North Data Strategies LLC (SDVOSB/VOSB)
**Owner**: Jacob Johnston (20-year Army vet, Bronze Star)
**Location**: Colorado Springs, CO
