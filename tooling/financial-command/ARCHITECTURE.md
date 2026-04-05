# financial-command Architecture

## 1. Purpose

`financial-command` is the accounting core for Fleet-Compliance Sentinel.  
It must support:

- Small-business accounting fundamentals (double-entry, period close, audit trail)
- Operational integrations (invoices, maintenance, sales, dispatch, payroll-related feeds)
- Executive and accounting reports (P&L, Balance Sheet, Trial Balance, General Ledger, AR/AP aging, Gross Profit, expense analysis)
- Dashboard and ad hoc reporting (internal UI + optional Excel/ODBC access)

This architecture replaces a transaction-tracker pattern with an accounting-ledger pattern.

## 2. Design Principles

- Ledger-first, not report-first
- Posted entries are immutable (reversals only)
- Tenant isolation at every layer (`org_id`)
- Deterministic money math (`integer cents`)
- Idempotent posting from upstream modules
- Read-optimized reporting models separate from write models
- Human-auditable provenance from source event -> journal entry -> report line

## 3. Logical Architecture

1. Ingestion Layer
- Accepts source events from modules (invoice import, payment, bank import, recurring, adjustments)
- Normalizes into canonical accounting events

2. Posting Engine
- Applies posting templates/rules to produce balanced journal entries
- Enforces debit/credit equality in a single DB transaction
- Guarantees idempotency by external reference key

3. Ledger Storage (System of Record)
- Chart of accounts
- Journal entry headers
- Journal entry lines
- Subledgers (AR/AP)
- Accounting periods and close state

4. Reporting Models
- SQL views/materialized views for statements and dashboards
- Period snapshots where needed for performance

5. Access Layer
- Internal API handlers for app dashboards
- Tool handlers for command-center and module-gateway
- Optional ODBC read access via Postgres-compatible drivers

## 4. Core Data Model (Target)

## 4.1 Master Data

- `gl_accounts`
  - `id`, `org_id`, `code`, `name`, `account_type` (`asset|liability|equity|revenue|expense|cogs`)
  - `normal_balance` (`debit|credit`)
  - `parent_account_id` (hierarchy)
  - `is_active`

- `accounting_periods`
  - `id`, `org_id`, `period_key` (`YYYY-MM`)
  - `start_date`, `end_date`
  - `status` (`open|soft_closed|closed`)
  - `closed_at`, `closed_by`

## 4.2 Ledger

- `gl_journal_entries`
  - `id`, `org_id`, `entry_no`, `entry_date`, `period_key`
  - `source_module`, `source_type`, `source_id`, `external_ref`
  - `memo`, `status` (`draft|posted|reversed`)
  - `created_at`, `posted_at`, `posted_by`

- `gl_journal_lines`
  - `id`, `org_id`, `journal_entry_id`, `line_no`
  - `account_id`
  - `debit_cents`, `credit_cents` (one side > 0)
  - `counterparty_type`, `counterparty_id` (customer/vendor/employee optional)
  - `class_id`, `location_id`, `asset_id` (dimensions)
  - `description`

## 4.3 Subledgers

- `ar_invoices`
  - `id`, `org_id`, `customer_id`, `invoice_no`, `issue_date`, `due_date`
  - `total_cents`, `open_cents`, `status`
  - `journal_entry_id` (posting link)

- `ar_receipts`
  - `id`, `org_id`, `customer_id`, `receipt_date`, `amount_cents`
  - `payment_method`, `journal_entry_id`

- `ar_allocations`
  - `id`, `org_id`, `receipt_id`, `invoice_id`, `allocated_cents`

- `ap_bills`
  - `id`, `org_id`, `vendor_id`, `bill_no`, `bill_date`, `due_date`
  - `total_cents`, `open_cents`, `status`
  - `journal_entry_id`

- `ap_payments`
  - `id`, `org_id`, `vendor_id`, `payment_date`, `amount_cents`
  - `payment_method`, `journal_entry_id`

- `ap_allocations`
  - `id`, `org_id`, `payment_id`, `bill_id`, `allocated_cents`

## 4.4 Governance

- `posting_templates`
  - maps source events to debit/credit account rules

- `posting_runs`
  - idempotency and replay protection metadata

- `ledger_audit_log`
  - append-only event trail for create/post/reverse/close actions

## 5. Report Model Strategy

All core reports are generated from ledger/subledger tables, not raw operational transactions.

- `rpt_trial_balance`
- `rpt_general_ledger`
- `rpt_profit_loss`
- `rpt_balance_sheet`
- `rpt_ar_aging_summary`
- `rpt_ar_aging_detail`
- `rpt_ap_aging_summary`
- `rpt_ap_aging_detail`
- `rpt_gross_profit`
- `rpt_expense_by_vendor`
- `rpt_expense_by_category`

For scale, use materialized views for heavy aggregates with scheduled refresh.

## 6. Module Integration Contract

Each upstream module emits canonical accounting events:

- `invoice.created`
- `invoice.voided`
- `payment.received`
- `bill.recorded`
- `bill.paid`
- `bank.transaction.imported`
- `adjustment.manual`

Required event payload:

- `org_id`
- `event_id` (globally unique)
- `event_type`
- `event_time`
- `source_module`
- `source_id`
- accounting fields (amount, due date, counterparty, dimension keys, etc.)

Posting engine behavior:

- Ignore duplicate `event_id`
- Resolve posting template
- Create balanced journal entry + subledger rows
- Return `journal_entry_id`

## 7. Dashboards

Primary dashboard KPI set:

- Revenue MTD/QTD/YTD
- COGS MTD/QTD/YTD
- Gross Profit + Margin %
- Opex by category
- Net Income
- AR open + aging buckets
- AP open + aging buckets
- Cash position trend

Dashboard reads from report models only.

## 8. ODBC / Excel Strategy

Using ODBC with Excel is not a bad idea if treated as read-only reporting.

Recommended approach:

- Expose a read-only Postgres role (`financial_reporting_ro`)
- Restrict access to report views/materialized views only
- Do not expose write tables directly to analysts
- Enforce tenant scoping (separate DSN per tenant or secure row-filtering boundary)
- Set query timeouts and audit all reporting queries

Good for:

- Finance team pivot tables
- Ad hoc slicing
- Scheduled workbook refreshes

Not good for:

- Core transaction entry
- Period-close adjustments via spreadsheet
- Any writeback into accounting tables

## 9. Security and Compliance

- Tenant isolation by `org_id` on every table and query path
- Immutable posted ledger records
- Reversal workflow instead of destructive edits
- PII minimization in logs
- Full audit attribution (`actor`, `timestamp`, `source`)
- Backup/recovery and period-close controls

## 10. Migration from Current State

Current module is a prototype service layer with in-memory repository and placeholder tool execution.  
Target migration path:

1. Introduce Postgres repository and new schema
2. Keep old APIs behind compatibility facade
3. Incrementally move reports to ledger-backed views
4. Deprecate direct transaction-sum report logic
5. Wire real tool handlers in command-center/module-gateway

## 11. Success Criteria

- P&L, Balance Sheet, Trial Balance tie out from same source data
- AR/AP aging matches open-item balances exactly
- Gross profit derives from revenue and COGS accounts, not heuristic tags
- Idempotent posting prevents duplicate accounting impact
- Excel/ODBC users can self-serve reporting without risking ledger integrity

