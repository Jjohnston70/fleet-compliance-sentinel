# financial-command Implementation Plan

This plan moves `financial-command` from prototype state to production accounting core.

## 1. Current Baseline

- TypeScript compiles
- Unit tests pass (prototype coverage)
- Tool definitions exist but handlers are placeholders
- In-memory repository is primary implementation
- No double-entry ledger or AR/AP subledger
- Reporting is transaction aggregation, not accounting statement logic

## 2. Delivery Phases

## Phase 0 - Foundation and Guardrails (Week 1)

Goals:

- Lock design decisions
- Add migration and test scaffolding
- Freeze legacy behavior behind compatibility layer

Tasks:

1. Create ADR docs for:
- ledger immutability
- period-close model
- AR/AP open-item method
- ODBC read-only strategy

2. Add DB migration framework for `financial-command` schema.

3. Add integration test harness with seeded accounting scenarios.

4. Mark `IMPLEMENTATION_STATUS.md` as legacy snapshot; use this plan going forward.

Exit criteria:

- ADR set approved
- migration pipeline working
- integration harness runs in CI

## Phase 1 - Ledger Core (Weeks 2-3)

Goals:

- Deliver accounting system of record

Tasks:

1. Create tables:
- `gl_accounts`
- `accounting_periods`
- `gl_journal_entries`
- `gl_journal_lines`
- `ledger_audit_log`

2. Implement posting engine:
- input: canonical accounting event
- output: balanced posted journal entry
- strict idempotency by `event_id`/`external_ref`

3. Add hard validation:
- debit sum == credit sum
- no posting into closed periods
- valid account references and normal-balance checks

4. Add reversal flow:
- reverse by new entry, never delete posted lines

Exit criteria:

- double-entry invariants enforced in DB + service tests
- reversals working
- period lock respected

## Phase 2 - Subledgers and Open Items (Weeks 4-5)

Goals:

- Implement AR/AP for aging and cash flow reporting

Tasks:

1. Create AR tables:
- `ar_invoices`
- `ar_receipts`
- `ar_allocations`

2. Create AP tables:
- `ap_bills`
- `ap_payments`
- `ap_allocations`

3. Build allocation logic:
- partial payments
- overpayments/credits
- open balance rollforward

4. Wire posting templates for:
- invoice created
- payment received
- bill recorded
- bill paid

Exit criteria:

- AR/AP open balances tie to control accounts
- aging buckets reproducible from open items

## Phase 3 - Reporting Models (Weeks 6-7)

Goals:

- Build accounting-grade statement layer

Tasks:

1. Implement SQL views/materialized views:
- `rpt_trial_balance`
- `rpt_general_ledger`
- `rpt_profit_loss`
- `rpt_balance_sheet`
- `rpt_ar_aging_summary`
- `rpt_ap_aging_summary`
- `rpt_gross_profit`
- `rpt_expense_by_vendor`

2. Add report service interfaces in `src/reporting`:
- typed report request/response contracts
- period and org filters

3. Add statement tie-out tests:
- P&L + Balance Sheet equation checks
- Trial Balance zero net check

Exit criteria:

- core reports generated from ledger only
- tie-out tests pass

## Phase 4 - Tooling and Gateway Wiring (Week 8)

Goals:

- Replace placeholder execution with real financial operations

Tasks:

1. Implement real handlers in `src/tools.ts` for:
- create/list/posting flows
- statement/report retrieval
- AR/AP aging retrieval

2. Register financial-command as executable module in module gateway runtime.

3. Update command-center route behavior for financial tools to execute real actions.

4. Add structured error codes for finance domain:
- posting validation failure
- period closed
- account mapping missing
- idempotency conflict

Exit criteria:

- all 9 tools return real results
- gateway run path supports financial-command execution

## Phase 5 - Dashboard + ODBC Read Surface (Weeks 9-10)

Goals:

- Enable finance user workflows in app and Excel

Tasks:

1. Build `/fleet-compliance/financial` UI routes:
- summary dashboard
- statements
- AR/AP aging pages
- close-period workflow

2. Create ODBC-safe report schema:
- view-only namespace (e.g., `reporting_finance`)
- stable column names for Excel models

3. Provision read-only DB role:
- `financial_reporting_ro`
- access only to curated report views

4. Publish Excel connectivity guide:
- DSN setup
- sample pivot model
- refresh schedule

Exit criteria:

- dashboard consumes report models
- Excel can refresh reports via read-only ODBC

## 3. Data Migration Plan

1. Preserve existing transaction records as historical source.
2. Backfill chart of accounts mappings.
3. Generate opening balances by org + as-of date.
4. Backfill journal entries from historical invoices and spend events.
5. Validate tie-out to historical totals before cutover.

Cutover rule:

- legacy transaction reporting remains read-only for comparison until two successful month-end closes.

## 4. Testing Strategy

Unit:

- posting template resolution
- debit/credit balancing
- tax/categorization utilities

Integration:

- invoice -> AR -> payment -> close invoice
- bill -> AP -> payment -> close bill
- reversal scenarios
- period close lock

Financial correctness:

- trial balance net = 0
- balance sheet equation holds
- AR/AP aging totals = open subledger totals

Regression:

- ensure existing spend/invoice UI endpoints do not break during migration

## 5. Operational Controls

- Daily backup verification for ledger tables
- Close-period checklist with dual approval option
- Monitoring:
  - posting failures
  - idempotency rejects
  - stale materialized views
  - ODBC heavy-query alerts

## 6. Risks and Mitigations

Risk: Inconsistent account mapping from upstream modules  
Mitigation: require posting-template completeness checks before event acceptance

Risk: Duplicate external events  
Mitigation: strict idempotency keys and replay-safe handlers

Risk: Spreadsheet misuse (writeback expectations)  
Mitigation: ODBC is read-only, no write paths, documented boundaries

Risk: Report performance at scale  
Mitigation: partitioned ledger lines + materialized views + scheduled refresh windows

## 7. Definition of Done

1. Double-entry ledger live in Postgres with immutable posted entries.
2. AR/AP open-item model supports aging reports.
3. P&L, Balance Sheet, Trial Balance, GL, Gross Profit, AR/AP aging available through API and UI.
4. Financial tools execute through command-center/module-gateway with real outputs.
5. Read-only ODBC/Excel reporting is operational and documented.
6. Month-end close completed successfully in staging with reconciliation evidence.

