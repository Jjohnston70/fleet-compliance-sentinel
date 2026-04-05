# financial-command

A full-stack TypeScript financial tracking service with IRS compliance features. This module provides personal and business financial management with automated categorization, tax calculations, budget tracking, and comprehensive reporting.

## Architecture and Roadmap

Forward implementation for accounting-grade functionality is now tracked in:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Target system design (double-entry ledger, AR/AP subledgers, reporting model, dashboard and ODBC strategy)
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Phase-by-phase execution plan to move from prototype to production accounting core

Historical build snapshot remains in:

- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)

## Architecture

The module follows a 6-layer architecture:

```
financial-command/
  src/
    config/           # Configuration, tax codes, category definitions
    data/             # Firestore schemas, in-memory repository
    services/         # Business logic services
    api/              # REST endpoint handlers
    hooks/            # Automation processors
    reporting/        # Dashboard & tax reports
  tests/              # Comprehensive Vitest test suite
  src/tools.ts        # LLM tool definitions
```

## Features

### Core Financial Management
- **Transaction Tracking**: Create, read, update, delete transactions with automatic categorization
- **Multi-Account Support**: Track checking, savings, credit, and investment accounts
- **Entity Support**: Manage personal and business finances separately
- **Search & Filter**: Find transactions by date, category, amount, and keywords

### Intelligent Categorization
- Automatic categorization by keyword matching
- USAA-specific transaction rules
- Customizable category hierarchy with tax codes
- Deduction percentage tracking

### Tax Compliance
- Schedule C (Self-Employment Income)
- Schedule SE (Self-Employment Tax)
- Schedule A (Itemized Deductions)
- Schedule 1 (Additional Income)
- Automatic deduction calculations with proper rounding
- Self-employment tax computation (15.3% of 92.35% net earnings)
- Quarterly estimated tax calculations

### Budget Management
- Monthly budget planning by category
- Automatic variance calculations
- Under/over budget alerts
- Quarterly budget reports

### Recurring Payments
- Weekly, biweekly, monthly, quarterly, annual frequencies
- Automatic payment processing
- Due payment alerts
- Upcoming payment forecasting

### Bank Import
- USAA CSV format parser
- Batch import tracking
- Automatic categorization during import
- Error handling and reporting

### Reporting
- Dashboard with income/expense summary
- Category breakdowns
- Account balance tracking
- Tax summary reports by schedule
- Budget variance reports

## Data Model

### Collections

**transactions**: Daily transactions with categorization and tax attributes
- Stores both personal and business transactions
- Tracks import source and batch ID
- Supports receipt URLs for audit trail

**accounts**: Financial accounts (checking, savings, credit, investment)
- Maintains running balance in cents
- Last 4 digits of account number for privacy
- Institution tracking

**categories**: Expense, income, and transfer categories
- Hierarchical structure with parent categories
- Keywords for automatic matching
- Tax codes and deductibility percentages

**tax_items**: Pre-calculated tax line items
- Organized by tax year, schedule, and line number
- Tracks both total and deductible amounts
- Entity-specific calculations

**budgets**: Monthly budget allocations
- Planned vs actual tracking
- Per-category, per-entity budgets

**recurring_payments**: Automated payment templates
- Multiple frequency options
- Auto-generates transactions on schedule
- Status tracking (active/inactive)

**import_batches**: Import operation history
- Tracks row counts and error statistics
- Audit trail of who imported what and when

**audit_log**: Complete change history
- Before/after snapshots
- Actor and timestamp tracking
- Entity type and ID indexing

## API Handlers

```typescript
// Transactions
createTransaction(data: TransactionData): Promise<Transaction>
listTransactions(filters?: TransactionFilter): Promise<Transaction[]>
getTransaction(id: string): Promise<Transaction | null>
updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>

// Accounts
createAccount(data: AccountData): Promise<Account>
listAccounts(entity?: string): Promise<Account[]>

// Imports
importCSV(csv: string, accountId: string, entity: string): Promise<ImportResult>

// Tax
getTaxSummary(year: number, entity: string): Promise<TaxSummary>

// Budget
getBudgetVariances(month: string): Promise<BudgetVariance[]>

// Categorization
categorizeTransaction(description: string): Promise<Category | null>
```

## Services

### TransactionService
Handles all transaction CRUD operations and queries. Supports:
- Date range filtering
- Category and account filtering
- Full-text search
- Category totals calculation

### AccountService
Manages accounts and balances. Provides:
- Account creation and updates
- Balance tracking
- Multi-entity aggregation
- Total balance calculations

### CategorizationService
Intelligent transaction categorization with:
- Keyword-based matching
- USAA-specific rules
- Default category fallback
- Category type detection

### TaxService
Comprehensive tax calculations including:
- Schedule C deductions aggregation
- Self-employment tax (15.3%)
- Estimated quarterly tax liability
- Deduction tracking by schedule
- Multi-year tax history

### ImportService
Bank data import with:
- USAA CSV parsing (Date, Description, Amount, Balance)
- Automatic categorization of imported rows
- Batch tracking and error reporting
- Transaction creation with proper cents conversion

### BudgetService
Budget planning and tracking with:
- Monthly budget creation
- Variance calculations (planned vs actual)
- Category-specific budgeting
- Multi-month reporting

### RecurringPaymentService
Recurring transaction management with:
- Multiple frequency support
- Automatic date advancement
- Due payment detection
- Transaction generation

## LLM Tools

The module exports 9 LLM-compatible tools with OpenAI function-calling schema:

1. **categorize_transaction** - Auto-categorize by description
2. **get_tax_summary** - Annual tax report by year/entity
3. **import_bank_csv** - Batch import from USAA CSV
4. **get_dashboard_data** - Monthly income/expense overview
5. **get_budget_variance** - Budget vs actual by month
6. **create_transaction** - Add new transaction
7. **list_transactions** - Query transactions with filters
8. **get_account_balances** - View account balances
9. **process_recurring_payments** - Process due payments

## Installation

```bash
npm install
npm run build    # Type check
npm test         # Run tests
```

## Environment Variables

Create `.env.example`:

```env
FIREBASE_PROJECT_ID=financial-command-dev
FIREBASE_API_KEY=your-api-key
TAX_YEAR=2024
```

## Testing

Comprehensive test suite with Vitest:

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
```

Coverage includes:
- Tax calculation accuracy
- Categorization engine
- CSV import parsing
- Budget variance
- Recurring payment processing
- Date range filtering
- Entity isolation

## Monetary Values

All monetary amounts are stored as **CENTS** (integers) to avoid floating-point arithmetic errors.

Example: $99.99 = 9999 cents

## Key Design Decisions

1. **Cents Storage**: All calculations use integer cents, ensuring deterministic, auditable math
2. **In-Memory Repository**: Tests use InMemoryRepository; production uses real Firestore
3. **Multi-Entity**: Personal vs business transaction separation at the data level
4. **Keyword Categorization**: Flexible and extensible automatic categorization
5. **IRS Schedule Alignment**: Tax calculations map directly to IRS forms
6. **Zod Validation**: Schema validation at entity boundaries
7. **No PII in Logs**: Accounts masked to last 4 digits, no email storage

## Module Status

Complete implementation with:
- 7 core services
- Full CRUD operations
- 3 reporting engines
- 2 automation hooks
- 9 LLM tools
- 100+ Vitest tests
- Production-ready TypeScript types

## Usage Example

```typescript
import { InMemoryRepository } from './src/data/in-memory-repository.js';
import { TransactionService } from './src/services/transaction-service.js';
import { TaxService } from './src/services/tax-service.js';

const repo = new InMemoryRepository();
const txService = new TransactionService(repo);
const taxService = new TaxService(repo);

// Create transaction
const tx = await txService.createTransaction({
  date: new Date(),
  description: 'Office supplies',
  amount: 5000, // $50.00
  categoryId: 'expense-office',
  accountId: 'checking-1',
  entity: 'business',
  taxRelevant: true,
  taxCode: 'OFFICE_EXPENSE',
});

// Get tax summary
const summary = await taxService.getTaxSummary(2024, 'business');
console.log(`Estimated tax liability: $${summary.estimatedTaxLiability / 100}`);
```

## License

Private module - True North Data Strategies
