# Complete Module Inventory

**Last Updated:** 2026-03-31

## Summary

- **20 total modules** across TypeScript, Python, and deployed platform
- **14 TypeScript command modules** (all follow 6-layer architecture)
- **3 Python modules** (ML + invoice)
- **1 deployed platform** (Fleet Compliance Sentinel)
- **1 AI assistant** (Pipeline Penny)
- **1 active standalone petroleum module** (ML-EIA Petroleum Intel)
- **~80+ LLM tools** across all modules

---

## TypeScript Command Modules

All follow the TNDS 6-layer pattern: data/ services/ api/ hooks/ config/ reporting/ + tools.ts

| # | Module | Category | Files | DB | Status | Description |
|---|--------|----------|-------|-----|--------|-------------|
| 1 | command-center | Core | 15 | In-memory | Complete | Hub/registry: discovers, routes, and monitors all other modules. Penny's gateway. 10 meta-tools. |
| 2 | compliance-command | Compliance | 19 | Firestore | Complete | Auto-generates 7 compliance packages across 6 frameworks (CMMC, SOC2, FedRAMP, NIST, HIPAA, PCI). 40+ field intake form. |
| 3 | contract-command | Contracts | 18 | Neon PG | Complete | Contract lifecycle: parties, milestones, amendments, renewal automation, vendor analysis, expiration calendars. |
| 4 | dispatch-command | Fleet | 19 | In-memory | Complete | HVAC emergency dispatch: driver assignment, SLA monitoring, routing (Haversine), ETA, truck capacity. |
| 5 | email-command | People | 18 | Firebase | Complete | Email analytics: z-score anomaly detection, digest generation, action item extraction, HTML templates. 63 tests. |
| 6 | financial-command | Business | 25 | In-memory | Complete | Full financials: transactions, IRS Schedule C/SE/A, budgets, USAA CSV import, recurring payments, categorization. 100+ tests. |
| 7 | govcon-command | Contracts | 24 | In-memory | Complete | Federal contracting: opportunity management, weighted bid/no-bid scoring (7 criteria), SAM.gov ready, SDVOSB/VOSB compliance. |
| 8 | onboard-command | People | 14 | Firebase | Partial | Google Workspace provisioning: user creation, license assignment, folder setup, rollback engine. TS complete, Apps Script pending. |
| 9 | proposal-command | Contracts | 19 | Firestore | Complete | Proposal generation: templates, PDF/DOCX, auto-numbering (PROP-YYYY-NNN), email delivery, pipeline analytics. |
| 10 | readiness-command | Compliance | 10 | Firebase | Complete | AI readiness assessments: 5 templates, weighted scoring (0-100), recommendations by score range. 22 tests. |
| 11 | realty-command | Industry | 15 | Neon PG | Complete | Real estate ops: lead scoring, property listings, deal pipeline (8 stages), commission forecasting. |
| 12 | sales-command | Business | 12 | Neon PG | Complete | Sales analytics: CSV import, KPIs (revenue, deal size, conversion, margin), YoY/MoM comparison, forecasting. |
| 13 | task-command | Business | 19 | Neon PG | Complete | Task management: assignments, status workflow, workload analysis, overdue detection, departmental visibility. 16 tests. |
| 14 | training-command | People | 21 | In-memory | Complete | AI consulting platform: courses, enrollments, workshops, consultations, certificates, plan-based access control. |

## Python Modules

| # | Module | Category | Files | Status | Description |
|---|--------|----------|-------|--------|-------------|
| 15 | ML-SIGNAL-STACK-TNCC | Compliance | ~10 | Complete | SARIMA forecasting for 5 business signals (Sales, Ops Pulse, Cash Flow, Pipeline, Team Tempo). 90-120 day horizons. Word reports. |
| 16 | invoice-module | Business | 10 | Complete (v1.1.0) | PDF invoice extraction: 12 vendors (text + OCR), Excel export (2 formats), SOC2 compliant. 24 tests. |
| 17 | ML-EIA-PETROLEUM-INTEL | Petroleum | 40+ files | Active (standalone complete) | EIA + client ingest, EIA API updater, SARIMA forecasting, regime/seasonal/strategy/weather analysis, alerting, report/json export, Penny context, CDOT traffic sidecar ingest. See PLAN.md. |

## Deployed Platform

| # | Module | Status | URL |
|---|--------|--------|-----|
| 18 | Fleet Compliance Sentinel | Live | pipelinepunks.com |
| 19 | Pipeline Penny AI | Live | pipelinepunks.com/penny |

## Sub-Projects (in tooling/)

| # | Folder | Status | Notes |
|---|--------|--------|-------|
| 20 | fleet-compliance-sentinel | Active (has .git) | CFR scraping, import builders, demo data. Last commit 2 days ago. KEEP .git. |

---

## Database Backend Distribution

| Database | Modules | Migration Path |
|----------|---------|---------------|
| **Neon PostgreSQL** (Sentinel's DB) | contract, sales, realty, task | Ready - same DB |
| **Firebase/Firestore** | compliance, email, onboard, proposal, readiness | Needs migration to Neon |
| **In-memory** (test/dev) | command-center, dispatch, financial, govcon, training | Needs Neon persistence layer |
| **Python/SQLite** | ML-Signal-Stack, invoice-module, ML-EIA | Use Neon via Railway backend |

## LLM Tool Count by Module

| Module | Tool Count | Key Tools |
|--------|-----------|-----------|
| command-center | 10 | discover_modules, route_tool_call, search_tools |
| compliance-command | 4+ | generate_package, list_frameworks |
| contract-command | 7+ | create_contract, track_milestone, get_renewals |
| dispatch-command | 10 | create_dispatch, assign_driver, find_nearest_driver |
| email-command | 8 | generate_digest, detect_anomalies, extract_action_items |
| financial-command | 9 | categorize_transaction, get_tax_summary, import_bank_csv |
| govcon-command | 10 | search_opportunities, run_bid_decision, check_compliance |
| onboard-command | 10 | start_onboarding, rollback_onboarding, get_queue_status |
| proposal-command | 12+ | create_proposal, generate_pdf, send_proposal |
| readiness-command | 7+ | run_assessment, get_score, get_recommendations |
| realty-command | 5+ | score_lead, track_deal, forecast_commission |
| sales-command | 6+ | get_kpis, import_csv, get_forecast |
| task-command | 9 | create_task, assign_task, get_workload |
| training-command | 10 | list_courses, enroll_student, book_consultation |
| ML-EIA Petroleum Intel | 10 | get_price_forecast, get_market_regime, get_spread_analysis |
| **TOTAL** | **~80+** | |
