# TNDS Proposal Command Module

A standalone, enterprise-grade proposal generation system built with Next.js 14, TypeScript, Firebase/Firestore, and powered by Vercel.

**Stack:** Next.js 14 + Vercel + Firebase/Firestore + TypeScript  
**Zero Dependencies:** No external TNDS module dependencies

## Overview

The Proposal Command Module automates proposal generation from client data and templates. It handles:

- **Proposal Creation** - Generate proposals from templates with automatic numbering (PROP-{YYYY}-{sequence})
- **Template Management** - 5 built-in service type templates (Web Dev, Consulting, Design, Data Analytics, Strategy)
- **PDF Generation** - Generate DOCX proposals using the `docx` library with TNDS branding
- **Email Delivery** - Send proposals to clients via Resend API (stub pattern for easy integration)
- **Pricing & Line Items** - Server-side line item calculations with tax and discount support
- **Client Management** - CRUD operations with email-based deduplication
- **Pipeline Analytics** - Proposal tracking by status, conversion metrics, and service breakdown
- **LLM Integration** - 12+ Claude-compatible tools for proposal automation

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Resend credentials

# Run development server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck
```

### Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
# ... other Firebase credentials

# Email (Resend)
RESEND_API_KEY=re_your_api_key

# Company
COMPANY_NAME=Your Company Name
COMPANY_PHONE=(555) 123-4567
COMPANY_WEBSITE=https://yoursite.com
```

## Architecture

### 6-Layer Structure

#### 1. Data Layer (`src/data/`)
- **firestore-schema.ts** - TypeScript interfaces for all Firestore collections
- **in-memory-repository.ts** - Test implementation of repository pattern
- **seed-templates.ts** - 5 default proposal templates

**Collections:**
- `proposals` - Main proposal records
- `clients` - Client/company information
- `proposal_templates` - Service-type templates
- `line_items` - Pricing line items
- `proposal_activities` - Audit trail

#### 2. Services Layer (`src/services/`)
- **proposal-engine.ts** - Template rendering with Handlebars
- **proposal-service.ts** - CRUD, numbering, status transitions
- **client-service.ts** - Client CRUD with deduplication
- **pricing-service.ts** - Line item calculations
- **pdf-generator.ts** - DOCX generation using `docx` library
- **email-service.ts** - Email delivery (Resend pattern stub)

#### 3. API Layer (`src/api/`)
- **proposals.ts** - Proposal endpoints
- **clients.ts** - Client endpoints
- **templates.ts** - Template endpoints

**Endpoints:**
```
POST   /api/proposals                 # Create proposal
GET    /api/proposals                 # List proposals
GET    /api/proposals/[id]            # Get proposal with line items
PUT    /api/proposals/[id]            # Update proposal
POST   /api/proposals/[id]/send       # Generate PDF & send email
GET    /api/proposals/[id]/track      # View confirmation pixel

GET    /api/clients                   # List clients
POST   /api/clients                   # Create client
GET    /api/templates                 # List templates
POST   /api/reports/pipeline          # Pipeline metrics
POST   /api/reports/service-breakdown # Service breakdown
```

#### 4. Automation Hooks (`src/hooks/`)
- **expiration-checker.ts** - Mark expired proposals, send reminders
- **follow-up-reminder.ts** - Identify proposals awaiting response

#### 5. Reporting (`src/reporting/`)
- **pipeline-report.ts** - Status distribution, conversion rates, days-to-close
- **service-breakdown.ts** - Revenue by service type

#### 6. LLM Integration (`src/tools.ts`)
12 Claude-compatible tools for proposal automation:
- `generate_proposal` - Create new proposal
- `send_proposal` - Send proposal email
- `get_proposal_status` - Check proposal status & activity
- `get_pipeline_summary` - Pipeline metrics
- `calculate_pricing` - Apply tax/discount
- `list_follow_ups` - Proposals needing follow-up
- `list_expiring_proposals` - Expiring soon
- `get_service_breakdown` - Revenue analysis
- `list_proposals` - Search proposals
- `mark_proposal_accepted/declined` - Update status
- `customize_template` - Adjust template sections

## Key Features

### Proposal Numbering (No Gaps)
Automatic sequential numbering: `PROP-2026-1001`, `PROP-2026-1002`, etc.

### Service Types (5 Templates)
1. **Web Development** - Custom development with design & deployment
2. **Consulting** - Strategy, analysis, recommendations
3. **Design** - UI/UX, branding, design systems
4. **Data Analytics** - Analytics, dashboards, insights
5. **Strategy** - Strategic planning, competitive positioning

### TNDS Branding
- **Primary Color:** `#1a3a5c` (Navy)
- **Secondary Color:** `#3d8eb9` (Teal)
- **Font:** Arial
- Consistent across PDFs and emails

### Pricing Model
Line items with:
- Quantity × Unit Price = Total (computed server-side)
- Subtotal calculation
- Tax (configurable %)
- Discount (configurable %)
- Final Total

### Status Workflow
```
draft → generated → sent → viewed → accepted
                        ↘ declined
                        ↘ expired
```

### Client Deduplication
Automatically finds existing client by email, avoiding duplicates.

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test --watch

# Coverage report
npm test -- --coverage

# UI dashboard
npm test:ui
```

**Test Suite:**
- `proposal-engine.test.ts` - Template rendering, placeholder replacement
- `proposal-service.test.ts` - CRUD, numbering, status transitions
- `pricing-service.test.ts` - Line item calculations, tax/discount

Uses **Vitest** + **In-Memory Repository** (no external DB needed for tests)

## Usage Examples

### Create Proposal
```typescript
const proposal = await proposalService.createProposal(
  clientId: 'client-123',
  templateId: 'tpl-web-dev',
  title: 'Website Redesign',
  description: 'Complete redesign of company website',
  totalValue: 25000,
  validityDays: 30
);

// Add line items
await pricingService.addLineItem(
  proposal.id,
  'Web Development',
  1,
  25000,
  'Development'
);

// Calculate pricing
const summary = await pricingService.calculatePricingSummary(
  proposal.id,
  taxRate: 10,
  discountPercent: 0
);
```

### Generate & Send PDF
```typescript
// Get data
const proposal = await proposalService.getProposal(id);
const template = await getTemplate(proposal.templateId);
const lineItems = await pricingService.getLineItems(proposal.id);
const pricing = await pricingService.calculatePricingSummary(proposal.id);

// Generate PDF
const pdfBuffer = await PDFGenerator.generateDocx(
  proposal,
  template,
  clientName,
  clientCompany,
  lineItems,
  pricing.subtotal,
  pricing.taxAmount,
  pricing.discountAmount,
  pricing.total
);

// Send email
const emailPayload = EmailService.createProposalEmailPayload(
  clientEmail,
  clientName,
  projectTitle,
  clientCompany,
  pdfBuffer,
  proposalNumber
);

const result = await emailService.sendProposalEmail(emailPayload);

// Mark as sent
await proposalService.markAsSent(proposal.id);
```

### Pipeline Analytics
```typescript
const pipelineReport = new PipelineReport(repository);
const metrics = await pipelineReport.generateReport();

console.log(metrics.totalCount);           // Total proposals
console.log(metrics.totalValue);           // Total pipeline value
console.log(metrics.byStatus);             // Count & value by status
console.log(metrics.conversionMetrics);    // Conversion & acceptance rates
```

### Service Breakdown
```typescript
const serviceReport = new ServiceBreakdownReport(repository);
const breakdown = await serviceReport.generateReport();

// Breakdown by service type with conversion rates
breakdown.totalByService.forEach(metric => {
  console.log(`${metric.serviceType}: $${metric.totalValue}, ${metric.conversionRate*100}% conversion`);
});
```

## Deployment

### Vercel Deployment

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import from Git
   - Select this repository
   - Add environment variables from `.env.example`
   - Deploy

3. **Configure Firebase:**
   - Set Firestore collection security rules
   - Enable Firestore API
   - Configure Firebase credentials in Vercel environment

4. **Test API:**
   ```bash
   curl -X POST https://your-deployment.vercel.app/api/proposals \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

## API Documentation

### POST /api/proposals
Create a new proposal.

**Request:**
```json
{
  "clientName": "John Doe",
  "clientCompany": "Acme Corp",
  "clientEmail": "john@acme.com",
  "projectTitle": "Website Redesign",
  "projectDescription": "Complete redesign of company website",
  "serviceType": "Web Development",
  "lineItems": [
    {
      "description": "Web Development",
      "quantity": 1,
      "unitPrice": 25000,
      "category": "Development"
    }
  ],
  "validityDays": 30
}
```

**Response:**
```json
{
  "id": "prop-123-abc",
  "proposalNumber": "PROP-2026-1001",
  "status": "draft",
  "clientId": "client-456",
  "createdAt": "2026-03-30T00:00:00Z"
}
```

### GET /api/proposals?status=sent&clientId=client-123
List proposals with filters.

### POST /api/proposals/[id]/send
Generate PDF and send email to client.

**Response:**
```json
{
  "success": true,
  "messageId": "email-msg-789",
  "proposal": { ... }
}
```

### GET /api/proposals/[id]/track
View confirmation tracking pixel (returns 1x1 PNG, marks proposal as viewed).

## Configuration Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `FIREBASE_PROJECT_ID` | string | - | Firebase project ID |
| `RESEND_API_KEY` | string | - | Resend email API key |
| `COMPANY_NAME` | string | - | Company name for branding |
| `COMPANY_PHONE` | string | - | Contact phone number |
| `COMPANY_WEBSITE` | string | - | Company website URL |
| `TIMEZONE` | string | America/Chicago | App timezone |
| `DEFAULT_VALIDITY_DAYS` | number | 30 | Default proposal validity |

## TypeScript Compilation

```bash
# Check for type errors
npm run typecheck

# Build production bundle
npm run build
```

All files pass strict TypeScript checking with `--noEmit`.

## Performance Notes

- **Line Item Calculations:** Server-side only (no client-side math)
- **Template Rendering:** Handlebars with cached compilation
- **PDF Generation:** Async DOCX generation, suitable for serverless
- **Email Delivery:** Non-blocking, uses Resend pattern for easy integration

## License

MIT

## Support

For issues, feature requests, or documentation updates, contact:
- **Email:** proposals@truenorthstrategyops.com
- **Phone:** (555) 123-4567
