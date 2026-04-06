# ARCHITECTURE.md Additions
# Fleet Compliance Sentinel → CommandStack Platform
# ERP Research Integration + Financial Command Industry Module

**Document Type:** Architecture Addendum  
**Version:** 1.0  
**Date:** April 4, 2026  
**Owner:** Jacob Johnston, True North Data Strategies  
**Integrates With:** ARCHITECTURE.md v2.0 (World Model Analysis Edition)  
**Status:** Draft — Insert into ARCHITECTURE.md at appropriate section breaks

---

## SECTION A: ERP Research Context (Insert after Section 6: CommandStack Evolution Strategy)

---

## 11. ERP Landscape Research for CommandStack Vertical Expansion

### Why This Section Exists

The NextGenERP.dev research package (Q1 2025) documented the ERP evaluation landscape for downstream petroleum distributors. That research is directly applicable to CommandStack's multi-vertical expansion strategy — specifically:

1. It validates the exact ICP pain points (disconnected systems, manual IFTA, no delivery profitability visibility) that Fleet Command and Financial Command are designed to solve.
2. It maps the competitive ERP vendor landscape that CommandStack modules will augment, integrate with, or displace.
3. It informs how Financial Command should be scoped and positioned as an industry module.

The findings below are operational intelligence, not academic. They reflect real operator pain from the Example Fleet Co environment and have direct bearing on module design decisions.

---

### 11.1 ERP Landscape Summary (Downstream Energy / Fleet Ops)

The fuel, lubricant, and fleet distribution sector is a documented ERP desert — operators run million-dollar businesses on QuickBooks Desktop, handwritten driver tickets, and disconnected dispatch spreadsheets. ERP vendor adoption is low. Switching costs are high. Operator sophistication is low. This is the same profile as CommandStack's target ICP.

#### Vendors Evaluated (NextGenERP.dev Research)

| Vendor | Category | Strengths | Gap CommandStack Addresses |
|--------|----------|-----------|-----------------------------|
| **Cargas Energy** | Fuel-specific ERP | Dispatch, mobile delivery, CRM | No AI compliance layer, no DOT integration |
| **Blue Cow Software** | Mid-market lube/cardlock | Delivery workflows, IFTA | No real-time telematics, no automated alerts |
| **Petro RX** | All-in-one fuel/lube | Inventory + dispatch + taxes | No predictive compliance, no knowledge assistant |
| **PDI Technologies** | Enterprise downstream logistics | Full-stack downstream | Enterprise price point, not SMB-accessible |
| **NetSuite** | General cloud ERP | Partner modules, financials | No downstream-specific compliance intelligence |
| **Sage Intacct** | Finance-forward cloud ERP | Reporting, multi-entity | No operational/field data integration |
| **TankLogix** | Tank monitoring + delivery | Real-time tank levels | Narrow scope, no driver compliance features |

#### Key Finding

None of the evaluated vendors provide:
- Real-time DOT compliance monitoring tied to driver/vehicle records
- AI-assisted regulatory interpretation (CFR 49 knowledge)
- Automated drug/alcohol clearinghouse integration
- Predictive violation prevention via telematics

**This is the Fleet Command + Pipeline Penny whitespace.** These vendors are not competitors — they are integration targets or adjacent market signals.

---

### 11.2 Operator Pain Points (ICP Validated)

The NextGenERP.dev ERP Readiness Assessment validated the following operator failure modes — all of which map directly to CommandStack module capabilities:

| Operator Pain Point | ERP Research Evidence | CommandStack Response |
|--------------------|-----------------------|----------------------|
| Deliveries scheduled on spreadsheets or paper | 80% of assessed operators | asset-command (fleet tracker) |
| Handwritten driver tickets | Identified in Quiz + Starter Kit | asset-command + compliance-ops |
| No real-time inventory visibility | Core finding across all vendors | Financial Command (inventory module) |
| Manual IFTA/motor fuel tax calculation | Documented as primary compliance risk | Financial Command (tax ledger) |
| Re-entering data across multiple systems | Cited in readiness checklist | office-command (workspace integration) |
| No gross profit visibility by route or delivery | Identified as strategic blind spot | Financial Command (profitability module) |
| Disconnected customer/accounting/dispatch records | Core architecture gap | data-command + financial-command |

---

### 11.3 ERP Integration Architecture Considerations

As CommandStack evolves toward multi-vertical deployment, modules will need to coexist with — or ingest data from — existing ERP systems operators already have. The following integration patterns are recommended:

#### Integration Tier 1: File-Based (Immediate)
- Accept XLSX/CSV exports from QuickBooks, Cargas, Blue Cow
- Import via existing validated pipeline (13 collection schemas)
- Transform to CommandStack data model at ingest
- **No API required. Works today.**

#### Integration Tier 2: API-Based (Month 3+)
- QuickBooks Online API (REST, OAuth2) — most common SMB accounting
- PDI API (downstream logistics data) — enterprise targets
- Verizon Reveal (already production) — telematics
- FMCSA API / QCMobile — DOT compliance data
- Drug & Alcohol Clearinghouse API — driver status

#### Integration Tier 3: Webhook / Real-Time (CommandStack v2)
- Trigger CommandStack compliance alerts from ERP events
- Push compliance status back to ERP records
- Bidirectional sync for driver and vehicle records

#### Architecture Principle

CommandStack is not trying to replace ERP systems. CommandStack layers compliance intelligence, AI assistance, and operational visibility on top of whatever operators already use. The positioning is: **"Your ERP handles transactions. CommandStack handles compliance and decisions."**

This is the same play Verizon Reveal runs alongside fleet ERP — they don't replace, they augment with real-time intelligence.

---

### 11.4 Competitive Differentiation Matrix

| Capability | Cargas / Blue Cow / Petro RX | NetSuite / Sage | CommandStack (FCS + Modules) |
|------------|------------------------------|-----------------|-------------------------------|
| DOT Compliance Tracking | Partial (permit tracking only) | None | Full (Part 40, 382, 391, 395, 396) |
| AI Regulatory Assistant | None | None | Pipeline Penny (RAG, CFR 49) |
| Real-Time Telematics | Limited | None | Verizon Reveal integration (production) |
| Drug/Alcohol Clearinghouse | None | None | Roadmap (FMCSA API) |
| Automated Compliance Alerts | Partial | None | Full (daily cron, email engine) |
| Training LMS with Cert Tracking | None | None | Full (hazmat, DOT, assessment engine) |
| Financial Intelligence (Route P&L) | Basic | Advanced (generic) | Financial Command (industry-specific) |
| Multi-Tenant SaaS | Yes | Yes | Yes (current architecture) |
| SMB Price Point | Yes | No | Yes |

**CommandStack's moat is the compliance + AI layer. No ERP vendor is building this for the SMB downstream market.**

---

### 11.5 ERP Research Gaps — Recommended Additional Research

The NextGenERP.dev package provided solid directional intelligence but was scoped to the fuel/lube distribution vertical. For CommandStack's multi-vertical strategy, the following research is recommended before building out additional industry modules:

#### For Fleet Command (Expand Beyond Petroleum)
- [ ] Evaluate DOT compliance coverage for general trucking (not just fuel distribution)
- [ ] Research Motive (MotorCarrier), Fleetio, WorkWave — ERP-adjacent fleet tools
- [ ] Identify FMCSA API capabilities for direct carrier data integration
- [ ] Assess PSP (Pre-Employment Screening Program) data integration feasibility
- [ ] Map which CFR Parts apply to non-hazmat vs. hazmat vs. fuel carriers

#### For Realty Command (Month 3 Target)
- [ ] Research property management ERP landscape (AppFolio, Buildium, Yardi, MRI)
- [ ] Identify compliance obligations (state landlord/tenant law, fair housing, ADA)
- [ ] Evaluate document management patterns (lease lifecycle, inspection records)
- [ ] Map ICP pain points (late rent, maintenance chaos, no P&L by unit)

#### For Financial Command (This Document — See Section 12)
- [ ] QuickBooks Online API documentation (data model, webhook events)
- [ ] IFTA reporting requirements by state (rate tables, filing deadlines)
- [ ] Motor fuel tax compliance — state-by-state variation
- [ ] Route profitability calculation methodology (cost-per-mile, load contribution margin)
- [ ] Cash flow forecasting models for distribution businesses

#### For Gov Command (Future Vertical)
- [ ] Research GSA Schedule compliance requirements
- [ ] Evaluate CMMC Level 1/2 documentation obligations
- [ ] Map SAM.gov data integration opportunities
- [ ] Identify small business certification tracking requirements (SDVOSB, 8(a), HUBZone)

---

## SECTION B: Financial Command Industry Module (Insert after Section 11)

---

## 12. Financial Command — Industry Module Specification

### Module Identity

```
Module Name:    financial-command
Module Type:    Industry Module (Add-On)
Target Vertical: Field Service + Distribution Operations (Petroleum, Fleet, Construction, HVAC)
Base Modules Required: data-command, office-command
Current Status: Specification (Pre-Build)
Build Target:   Month 2 (per COMMAND-STACK-DECISIONS.md parallel build)
Platform:       CommandStack (commandstack.com)
```

---

### 12.1 Strategic Rationale

Every operator CommandStack targets has the same financial blind spot: **they can't see if they're making money on individual jobs, routes, or customers.** They know the bank balance. They don't know the margin.

The Financial Command module closes that gap. It is not an accounting system. It is a **financial intelligence layer** — purpose-built to answer the questions that generic ERP and accounting tools bury in reports that take an hour to build and a CPA to interpret.

**Three questions Financial Command answers in real time:**
1. Am I making money on this route / job / customer?
2. Will I have enough cash next month?
3. Am I compliant with my tax obligations?

No operator running QuickBooks Desktop and a spreadsheet can answer all three without significant manual work. Financial Command makes these answers automatic.

---

### 12.2 Module Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Financial Command Module                       │
│              (CommandStack Industry Add-On)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Data Ingestion  │  │  Intelligence │  │   Output Layer   │
│  Layer           │  │  Engine       │  │                  │
│                  │  │               │  │                  │
│ - XLSX/CSV import│  │ - P&L calc    │  │ - Dashboard view │
│ - QB API (v2)    │  │ - Cash flow   │  │ - Alert engine   │
│ - Manual entry   │  │ - Tax ledger  │  │ - Email reports  │
│ - ERP webhook    │  │ - Route margin│  │ - PDF exports    │
└──────────┬───────┘  └──────┬────────┘  └──────────────────┘
           │                 │
           ▼                 ▼
┌──────────────────────────────────────────────────────────────┐
│                  Neon Postgres (Shared)                       │
│         financial_command schema (tenant-isolated)           │
│                                                              │
│  Tables: transactions, routes, customers, tax_events,        │
│          cash_forecast, invoices, cost_centers               │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│            CommandStack AI Layer (Future)                     │
│   "Why did my margin drop this month?" → LLM + data context  │
└──────────────────────────────────────────────────────────────┘
```

---

### 12.3 Core Capabilities

#### Capability 1: Route / Job Profitability Tracker

**Problem it solves:** Operators know they delivered 8,000 gallons today. They have no idea if they made money on any individual route.

**What it does:**
- Records revenue per delivery/job (pulled from ERP, QB, or manual entry)
- Records direct costs: fuel, driver pay, vehicle cost-per-mile, tolls
- Calculates contribution margin per route, per driver, per customer
- Surfaces bottom-performing routes/customers automatically

**World Model mapping:**
- State: Revenue, costs, margin per route (real-time as transactions import)
- Action: Flag low-margin routes for renegotiation or elimination
- Transition: Margin improves → system confirms via next period comparison
- Feedback: Monthly actual vs. predicted margin tracked

**Data Inputs:**
- Delivery tickets (XLSX/CSV import or manual)
- QuickBooks invoice data (API or export)
- Fuel cost from asset-command module
- Driver pay from HR records or manual rate entry

**Outputs:**
- Route P&L dashboard (real-time)
- Customer margin ranking (sortable)
- Low-margin alerts (configurable threshold)

---

#### Capability 2: Cash Flow Forecaster

**Problem it solves:** Operators get surprised by payroll hitting while waiting on a large AR payment. They are constantly reactive with cash.

**What it does:**
- Tracks outstanding invoices by due date
- Tracks known upcoming payables (payroll schedule, loan payments, fuel purchases)
- Projects 30/60/90-day cash position
- Alerts when projected balance drops below configurable threshold

**World Model mapping:**
- State: Current cash + AR aging + AP schedule
- Action: Alert operator to collect on specific overdue invoices
- Transition: Collection received → cash position updates
- Feedback: Forecast accuracy tracked (predicted vs. actual)

**Forecast Logic (MVP):**
```
projected_cash[day] = 
  current_balance 
  + sum(AR_expected_by_day) 
  - sum(AP_due_by_day)
  ± recurring_adjustments

Alert if projected_cash[day] < threshold for any day in window
```

**Data Inputs:**
- Invoice aging (XLSX from QB or API)
- Known payables (payroll dates, loan schedule — manual or integrated)
- Bank balance (manual refresh or future Plaid integration)

**Outputs:**
- 90-day cash runway chart
- Overdue AR priority list with collection urgency score
- Cash crunch alerts (email + dashboard)

---

#### Capability 3: Tax Ledger and Compliance Tracker

**Problem it solves:** Fuel distributors have IFTA filings, motor fuel tax obligations, sales tax, and payroll tax — all on different schedules, often managed in disconnected spreadsheets or handed entirely to a CPA who may not flag issues in time.

**What it does:**
- Tracks tax obligation events by type and jurisdiction
- Calculates IFTA mileage/fuel data per quarter (when asset-command provides telematics)
- Maintains tax payment log with due dates
- Alerts 30/15/7 days before filing deadlines
- Records payments and generates audit-ready log

**Tax Types Supported (MVP):**

| Tax Type | Trigger | Frequency | Data Source |
|----------|---------|-----------|-------------|
| IFTA (motor fuel tax) | Interstate mileage | Quarterly | asset-command telematics |
| Motor Fuel Tax (state) | Fuel purchased/sold | Monthly or quarterly | Manual or ERP import |
| Sales Tax | Customer invoices | Monthly or quarterly | QB or manual |
| Payroll Tax (941) | Payroll run | Monthly / quarterly | Manual or QB |
| Annual (state/federal) | Calendar trigger | Annual | System-prompted |

**World Model mapping:**
- State: Tax obligation status per type per jurisdiction
- Action: File + pay by deadline
- Transition: Filed → Confirmed → Archived
- Feedback: Any late filings or penalties tracked as system failures

**Note:** Financial Command does not prepare tax returns. It ensures no deadline is missed and the data is organized. CPA-prepared returns remain the operator's responsibility.

---

#### Capability 4: Financial Health Dashboard

**Problem it solves:** Operators have no single view of their financial position. They open QB for one thing, a spreadsheet for another, and their bank app for a third.

**What it does:**
- Single-screen view of: cash position, AR aging, margin by segment, upcoming obligations
- Weekly email summary (auto-generated, no setup required)
- Configurable KPI tiles per operator type (distribution vs. service vs. contracting)
- Month-over-month trend lines for key metrics

**KPI Tiles (Default Set):**

| KPI | Calculation | Alert Threshold |
|-----|------------|-----------------|
| Current Cash | Bank balance (manual refresh) | < $X (operator-set) |
| AR Aging (30/60/90+) | Sum of outstanding invoices by age bucket | >$X in 90+ bucket |
| Gross Margin % | (Revenue - Direct Costs) / Revenue | < X% (operator-set) |
| Highest-Margin Customer | Ranked by contribution margin | — (informational) |
| Lowest-Margin Route | Ranked by route P&L | — (alert on threshold) |
| Next Tax Due | Earliest upcoming tax obligation | < 30 days |
| Cash Runway | Days until projected cash < threshold | < 30 days |

---

### 12.4 Database Schema (Neon Postgres — financial_command schema)

```sql
-- Tenant-isolated. All tables include tenant_id.

CREATE TABLE fc_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  transaction_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'revenue' | 'expense' | 'transfer'
  category VARCHAR(50),      -- 'fuel_sale' | 'labor' | 'equipment' | 'tax' | ...
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  route_id UUID REFERENCES fc_routes(id),
  customer_id UUID REFERENCES fc_customers(id),
  source VARCHAR(20),        -- 'manual' | 'xlsx_import' | 'qb_api' | 'erp_webhook'
  source_ref VARCHAR(100),   -- External system ID for deduplication
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fc_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  route_name VARCHAR(100) NOT NULL,
  driver_id UUID,
  vehicle_id UUID,
  customer_id UUID REFERENCES fc_customers(id),
  avg_revenue_per_run DECIMAL(10,2),
  avg_direct_cost_per_run DECIMAL(10,2),
  avg_margin_pct DECIMAL(5,2),
  run_count INTEGER DEFAULT 0,
  last_run_date DATE,
  status VARCHAR(20) DEFAULT 'active' -- 'active' | 'suspended' | 'archived'
);

CREATE TABLE fc_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_name VARCHAR(150) NOT NULL,
  ytd_revenue DECIMAL(12,2) DEFAULT 0,
  ytd_costs DECIMAL(12,2) DEFAULT 0,
  ytd_margin_pct DECIMAL(5,2),
  ar_current DECIMAL(10,2) DEFAULT 0,
  ar_30 DECIMAL(10,2) DEFAULT 0,
  ar_60 DECIMAL(10,2) DEFAULT 0,
  ar_90_plus DECIMAL(10,2) DEFAULT 0,
  payment_terms VARCHAR(50),
  last_invoice_date DATE
);

CREATE TABLE fc_tax_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  tax_type VARCHAR(50) NOT NULL,  -- 'IFTA' | 'motor_fuel' | 'sales' | 'payroll_941' | 'annual'
  jurisdiction VARCHAR(50),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  amount_owed DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming' | 'filed' | 'paid' | 'overdue' | 'waived'
  filing_reference VARCHAR(100),
  notes TEXT,
  alert_30_sent BOOLEAN DEFAULT false,
  alert_15_sent BOOLEAN DEFAULT false,
  alert_7_sent BOOLEAN DEFAULT false
);

CREATE TABLE fc_cash_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  forecast_date DATE NOT NULL,
  projected_balance DECIMAL(12,2) NOT NULL,
  expected_inflows DECIMAL(12,2) DEFAULT 0,
  expected_outflows DECIMAL(12,2) DEFAULT 0,
  confidence_level VARCHAR(10) DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, forecast_date)
);

-- Indexes for performance
CREATE INDEX idx_fc_transactions_tenant_date 
  ON fc_transactions(tenant_id, transaction_date DESC);

CREATE INDEX idx_fc_tax_events_due 
  ON fc_tax_events(tenant_id, due_date, status) 
  WHERE status IN ('upcoming', 'overdue');

CREATE INDEX idx_fc_customers_ar 
  ON fc_customers(tenant_id, ar_90_plus DESC) 
  WHERE ar_90_plus > 0;
```

---

### 12.5 API Surface (FastAPI)

Financial Command exposes the following endpoints within the CommandStack backend:

```
POST   /api/financial/import              — XLSX/CSV transaction import
GET    /api/financial/dashboard           — KPI tiles (current period)
GET    /api/financial/routes/margin       — Route P&L sorted by margin
GET    /api/financial/customers/margin    — Customer P&L sorted by margin
GET    /api/financial/cash/forecast       — 90-day cash projection
GET    /api/financial/tax/upcoming        — Tax obligations by due date
POST   /api/financial/tax/:id/mark-filed  — Update tax event status
GET    /api/financial/reports/weekly      — Weekly summary (email trigger)
POST   /api/financial/transactions        — Manual transaction entry
```

---

### 12.6 Alert Engine Integration

Financial Command hooks into the existing CommandStack alert infrastructure (same engine as Fleet Compliance alerts). No new alert infrastructure required.

**Alert Types:**

| Alert | Trigger Condition | Channel | Frequency |
|-------|-------------------|---------|-----------|
| Cash crunch warning | Projected balance < threshold in next 30 days | Email | Daily (when triggered) |
| AR overdue escalation | Customer >60 days past due, balance >$X | Email | Weekly |
| Low-margin route | Route P&L falls below threshold | Email | Monthly |
| Tax deadline approaching | 30 / 15 / 7 days before due_date | Email | Per threshold |
| Tax overdue | Status = 'upcoming' past due_date | Email | Immediate |
| Import validation failure | XLSX import schema mismatch | Email | Immediate |

---

### 12.7 World Model Analysis — Financial Command

Applying the same LeCun framework used to assess the FCS production system:

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **State Capture** | 8/10 | Cash, AR, transactions, tax obligations all tracked. Gap: bank balance requires manual refresh (no live bank feed at MVP). |
| **Action Mapping** | 7/10 | Alerts drive specific actions (collect AR, file tax). Gap: No in-module action completion tracking at MVP. |
| **Transition Modeling** | 7/10 | Tax event state machine is explicit. Cash forecast models future state. Gap: Route margin improvement loop not closed. |
| **Feedback Loops** | 6/10 | Import validation is closed. Tax filing status is tracked. Gap: Forecast accuracy not measured vs. actual. |
| **Physics Grounding** | 8/10 | Date-based triggers (tax deadlines, AR aging) are deterministic. Cash math is precise. |

**MVP Target Score: 7.2/10** (Strong enough for initial customer value. Graph RAG and AI layer upgrades move this to 9+.)

**Known Open Loops at Launch (Acceptable):**
- Cash forecast accuracy not tracked against actual outcomes (Month 2 fix)
- Route margin improvement not confirmed via follow-up (Month 3 fix)
- Bank balance requires manual refresh (Plaid integration, Month 4)

---

### 12.8 Integration with Fleet Command

Financial Command and Fleet Command share data at three points:

1. **Vehicle cost-per-mile** → Fleet Command telematics (Verizon Reveal) feeds into Financial Command route cost calculations. Without this, direct costs require manual entry.

2. **Driver allocation by route** → Fleet Command driver assignment feeds into Financial Command labor cost tracking per route.

3. **IFTA mileage data** → Fleet Command GPS/telematics provides interstate mileage by vehicle per quarter — the primary input for IFTA tax calculation in Financial Command.

**Module dependency declaration:**
```
financial-command
  requires: data-command (base)
  recommends: asset-command (vehicle cost data)
  recommends: fleet-command (telematics, IFTA mileage)
  optional: office-command (email alert delivery)
```

When Fleet Command is not active, Financial Command falls back to manual cost entry. The module functions without Fleet Command but loses automated cost tracking.

---

### 12.9 Positioning and Pricing

**Module Positioning:**

"Your accountant knows the score at year-end. Financial Command shows you the score every day — so you can actually change it."

Financial Command is not a bookkeeping tool. It does not replace QuickBooks. It augments it with real-time operational financial intelligence that no SMB accounting package provides natively.

**Pricing (CommandStack Platform):**

| Tier | Included | Monthly Add-On |
|------|----------|----------------|
| Base CommandStack | data-command, office-command | Included in platform fee |
| + Financial Command | Route P&L, Cash Forecast, Tax Ledger, Dashboard | +$149/month per tenant |
| + Fleet + Financial Bundle | All above + IFTA automation, vehicle cost integration | +$249/month per tenant |

**Initial Target Customers:**
- Petroleum distributors already running FCS (natural upsell)
- HVAC and field service operators (no IFTA, but route P&L and cash flow are universal pain)
- Small construction and equipment rental operators

---

### 12.10 Build Checklist (Month 2 Target)

**Week 5-6: Data Layer**
- [ ] Create `financial_command` schema in Neon Postgres
- [ ] Build XLSX/CSV import pipeline (transaction, invoice, customer formats)
- [ ] Implement QuickBooks export format parser (QB report XLSX)
- [ ] Write unit tests for all import validators
- [ ] Deploy schema migration (backward-compatible with FCS tables)

**Week 6-7: Intelligence Engine**
- [ ] Route P&L calculation service
- [ ] Customer margin ranking service
- [ ] Cash flow forecast engine (30/60/90-day)
- [ ] Tax event state machine
- [ ] Alert rule engine (hooks into existing alert infrastructure)

**Week 7: API + Dashboard**
- [ ] FastAPI endpoints (all routes above)
- [ ] Next.js Financial Command dashboard component
- [ ] Weekly email report template
- [ ] Tax deadline alert email templates
- [ ] Cash crunch alert email template

**Week 8: Testing + Integration**
- [ ] Integration test with Fleet Command data (IFTA mileage)
- [ ] Load test with 12 months of transaction data
- [ ] Validate alert engine fires correctly on all conditions
- [ ] Pilot with one FCS tenant (Example Fleet Co data — anonymized)
- [ ] Document API in README

---

## Document Control — Addendum

**Added By:** Jacob Johnston, True North Data Strategies LLC  
**Reason:** NextGenERP.dev package review + CommandStack parallel build planning  
**Integrate Into:** ARCHITECTURE.md after Section 6 (Section 11) and as new Section 12  
**Next Review:** Week 6 (when Month 2 build begins)  
**Location:** `/docs/ARCHITECTURE_ERP_ADDITIONS.md` → merge into `/docs/ARCHITECTURE.md`

---

**END OF ADDENDUM**