# Contract Command - TNDS Module

Comprehensive contract management system for True North Data Strategies. Built with Next.js 14, TypeScript, Vercel, and Neon PostgreSQL.

## Overview

The Contract Command module provides enterprise-grade contract lifecycle management including:

- **Contract CRUD**: Full lifecycle management (draft → pending_review → active → expiring/expired/renewed)
- **Party Management**: Vendor, client, partner, and subcontractor management
- **Milestone Tracking**: Key dates, deliverables, and completion tracking
- **Amendment Management**: Track contract modifications and value changes
- **Renewal Automation**: Automatic renewal notifications and contract generation
- **Comprehensive Reporting**: Dashboard summaries, vendor analysis, expiration calendars
- **LLM Integration**: Claude-callable tools for contract operations

## Architecture

```
src/
  data/
    schema.sql              # Database schema
    db.ts                   # Neon PostgreSQL connection
    types.ts                # TypeScript interfaces
    in-memory-repository.ts # Testing repository
    seed.sql                # Sample data
  
  services/
    contract-service.ts     # Contract CRUD & status management
    party-service.ts        # Vendor/client management
    milestone-service.ts    # Milestone tracking
    amendment-service.ts    # Amendment management
    notification-service.ts # Alert scheduling
  
  hooks/
    renewal-checker.ts      # Daily cron for renewal alerts
    auto-renewer.ts         # Auto-renewal processing
  
  reporting/
    contract-summary.ts     # Dashboard summaries
    vendor-analysis.ts      # Spend analysis & concentration
    expiration-calendar.ts  # 90/180/365 day calendars
  
  api/
    contracts.ts            # Contract endpoints
    parties.ts              # Party endpoints
    reports.ts              # Reporting endpoints
  
  config/
    index.ts                # Configuration & environment
  
  tools.ts                  # LLM tool definitions

tests/
  contract-service.test.ts
  renewal-checker.test.ts
  vendor-analysis.test.ts
```

## Installation

```bash
npm install

# Set up environment
cp .env.example .env.local

# Run tests
npm run test

# Type check
npm run build
```

## Configuration

### Environment Variables

```env
DATABASE_URL=postgres://user:pass@host/dbname
APP_URL=http://localhost:3000
TIMEZONE=America/Denver

COMPANY_NAME=Your Company
COMPANY_EMAIL=contracts@company.com
COMPANY_PHONE=+1-555-0100

NOTIFICATION_EMAIL=admin@company.com
```

### Alert Settings

Renewal notifications trigger at: **90, 60, 30, 14, 7 days** before contract end date.

## Database Schema

### Tables

- **parties**: Vendors, clients, partners, subcontractors
- **contracts**: Main contract records with lifecycle status
- **contract_milestones**: Key dates and deliverables
- **contract_amendments**: Modifications and value changes
- **contract_notifications**: Alert scheduling
- **alerts_log**: Historical alert/notification records

### Key Relationships

- `contracts.party_id` → `parties.id` (required)
- `contract_milestones.contract_id` → `contracts.id` (cascade delete)
- `contract_amendments.contract_id` → `contracts.id` (cascade delete)
- `contract_notifications.contract_id` → `contracts.id` (cascade delete)

## API Endpoints

### Contracts

```
GET    /api/contracts                  List contracts
POST   /api/contracts                  Create contract
GET    /api/contracts/[id]             Get by ID
PUT    /api/contracts/[id]             Update contract
DELETE /api/contracts/[id]             Delete contract
GET    /api/contracts/expiring         Get expiring (query: days=30)
```

### Parties

```
GET    /api/parties                    List all parties
POST   /api/parties                    Create party
GET    /api/parties/[id]               Get by ID
PUT    /api/parties/[id]               Update party
GET    /api/parties/[id]/contracts     Get party contracts
GET    /api/parties/[id]/stats         Get vendor statistics
```

### Reports

```
GET    /api/reports/summary            Contract summary & health
GET    /api/reports/vendor-analysis    Spend analysis & concentration
GET    /api/reports/expiration-calendar Expiration calendar (query: months=3|6|12)
GET    /api/reports/health             System health indicators
GET    /api/reports/concentration      Vendor concentration analysis
```

## LLM Tools

Available tools for Claude and other LLMs:

### add_contract
Create a new contract with full details.

```typescript
{
  name: 'add_contract',
  params: {
    title: string,
    party_id: string,
    contract_type: 'client_service' | 'vendor' | 'nda' | 'lease' | 'employment' | 'subcontractor' | 'saas',
    start_date: 'YYYY-MM-DD',
    end_date: 'YYYY-MM-DD',
    value: number,
    payment_terms?: 'net_15' | 'net_30' | 'net_60' | 'monthly' | 'quarterly' | 'annual',
    auto_renew?: boolean,
    renewal_notice_days?: number,
    notes?: string
  }
}
```

### get_expiring_contracts
List contracts expiring within N days.

```typescript
{
  name: 'get_expiring_contracts',
  params: {
    days?: number  // default: 30
  }
}
```

### get_vendor_analysis
Analyze spending and contract patterns.

```typescript
{
  name: 'get_vendor_analysis',
  params: {
    party_id?: string,  // specific vendor
    limit?: number      // default: 10
  }
}
```

### create_amendment
Add an amendment to a contract.

```typescript
{
  name: 'create_amendment',
  params: {
    contract_id: string,
    description: string,
    value_change?: number,
    new_end_date?: 'YYYY-MM-DD'
  }
}
```

### get_contract_summary
Get dashboard summary.

```typescript
{
  name: 'get_contract_summary',
  params: {}
}
```

### update_contract_status
Transition contract status.

```typescript
{
  name: 'update_contract_status',
  params: {
    contract_id: string,
    new_status: 'draft' | 'pending_review' | 'active' | 'expiring' | 'expired' | 'terminated' | 'renewed',
    notes?: string
  }
}
```

### get_expiration_calendar
Get expiration calendar.

```typescript
{
  name: 'get_expiration_calendar',
  params: {
    months?: 3 | 6 | 12  // default: 3
  }
}
```

### add_party
Create a new party.

```typescript
{
  name: 'add_party',
  params: {
    name: string,
    party_type: 'client' | 'vendor' | 'partner' | 'subcontractor',
    contact_name?: string,
    contact_email?: string,
    contact_phone?: string,
    address?: string
  }
}
```

## Service Classes

### ContractService

```typescript
// CRUD
await ContractService.create(contract)
await ContractService.getById(id)
await ContractService.list(filters?)
await ContractService.update(id, updates)
await ContractService.delete(id)

// Status & Expiration
await ContractService.updateStatus(id, newStatus, notes?)
await ContractService.getExpiringWithin(days)

// Utilities
ContractService.getDurationDays(contract)
ContractService.isActive(contract)
ContractService.daysUntilExpiration(contract)
```

### PartyService

```typescript
await PartyService.create(party)
await PartyService.getById(id)
await PartyService.list()
await PartyService.listByType(partyType)
await PartyService.update(id, updates)
await PartyService.getContracts(partyId)
await PartyService.getVendorStats(partyId)
```

### ContractSummary (Reporting)

```typescript
await ContractSummary.generate()        // Raw data
await ContractSummary.generateReport()  // Formatted report
await ContractSummary.getHealthIndicators()
```

### VendorAnalysis (Reporting)

```typescript
await VendorAnalysis.analyzeAll()
await VendorAnalysis.analyzeParty(partyId)
await VendorAnalysis.getTopVendorsBySpend(limit)
await VendorAnalysis.generateReport()
await VendorAnalysis.getConcentrationAnalysis()
```

### ExpirationCalendar (Reporting)

```typescript
await ExpirationCalendar.generate90Days()
await ExpirationCalendar.generate6Months()
await ExpirationCalendar.generate12Months()
await ExpirationCalendar.getSummary()
```

## Hooks/Automation

### RenewalChecker

Daily cron job to check for expiring contracts and generate notifications.

```typescript
await RenewalChecker.check()            // Daily execution
await RenewalChecker.checkContract(id)  // Single contract
await RenewalChecker.generateReport()   // Management report
```

### AutoRenewer

Process auto-renewal for contracts that expire today.

```typescript
await AutoRenewer.processRenewals()     // Daily execution
await AutoRenewer.renewContract(contract)
await AutoRenewer.getEligibleForRenewal()
```

## Contract Status Workflow

```
draft
  ↓ (review)
pending_review
  ↓ (approve) or ↓ (back to draft)
active ← (renew from expired)
  ↓
expiring ← (auto when within renewal notice)
  ↓
expired → renewed (if auto_renew=true)
  ↓
terminated (manual cancellation)
```

## Reporting Features

### Contract Summary
- Total count by status
- Active, expiring, expired, pending counts
- Total contract value
- Distribution by type and status
- Health indicators with alerts

### Vendor Analysis
- Total spend per party
- Contract count per vendor
- Average contract value
- Average contract duration
- Renewal rate
- Concentration analysis (Herfindahl index)
- Risk assessment

### Expiration Calendar
- 90-day, 6-month, 12-month views
- Contracts grouped by month
- Days until expiration
- Auto-renewal status
- Concentration by month

## Testing

```bash
# Run all tests
npm run test

# Run specific test
npm run test -- contract-service.test.ts

# Run with coverage
npm run test -- --coverage
```

Tests use in-memory repository for isolation and speed.

## Deployment

### Vercel + Neon

1. Create Neon PostgreSQL database
2. Set DATABASE_URL in Vercel environment
3. Deploy to Vercel
4. Initialize schema: `npm run db:init`

### Environment Setup

```bash
# Create .env.local with production values
cp .env.example .env.local
# Edit .env.local with real DATABASE_URL, company info, etc.
```

## Key Constraints

- Renewal alerts: **90, 60, 30, 14, 7 days** before end_date
- Auto-renew creates new contract linked to predecessor
- Status transitions are validated
- Contract value: NUMERIC(12,2) - max $9,999,999.99
- Timezone: **America/Denver**
- Currency: **USD** (primary, configurable per contract)
- All dates stored as DATE (no time component)

## Zero External Dependencies

This module is completely standalone:
- No external TNDS module dependencies
- Self-contained services and data layer
- In-memory repository for testing
- Database-agnostic business logic

## Error Handling

All service methods throw descriptive errors:
- Missing required fields
- Invalid status transitions
- Date validation (end_date > start_date)
- Resource not found (404 equivalents)
- Constraint violations

## Performance

- Indexed on: status, end_date, party_id, auto_renew
- Efficient date range queries
- In-memory caching in services
- Pagination support on list endpoints

## License

Private - True North Data Strategies

## Support

For issues or feature requests, contact: contracts@truenorth.com
