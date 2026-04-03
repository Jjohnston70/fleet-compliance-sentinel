import {
  Transaction,
  Account,
  Category,
  TaxItem,
  Budget,
  RecurringPayment,
  ImportBatch,
  AuditLog,
} from './firestore-schema.js';

export interface IRepository {
  // Transactions
  addTransaction(tx: Transaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | null>;
  listTransactions(filters?: Record<string, unknown>): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Accounts
  addAccount(account: Account): Promise<Account>;
  getAccount(id: string): Promise<Account | null>;
  listAccounts(): Promise<Account[]>;
  updateAccount(id: string, updates: Partial<Account>): Promise<Account>;

  // Categories
  addCategory(category: Category): Promise<Category>;
  getCategory(id: string): Promise<Category | null>;
  listCategories(): Promise<Category[]>;

  // Tax Items
  addTaxItem(item: TaxItem): Promise<TaxItem>;
  getTaxItemsByYear(year: number, entity?: string): Promise<TaxItem[]>;

  // Budgets
  addBudget(budget: Budget): Promise<Budget>;
  getBudget(id: string): Promise<Budget | null>;
  listBudgets(month: string): Promise<Budget[]>;

  // Recurring Payments
  addRecurringPayment(payment: RecurringPayment): Promise<RecurringPayment>;
  listRecurringPayments(entity?: string): Promise<RecurringPayment[]>;
  updateRecurringPayment(id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment>;
  getRecurringPayment(id: string): Promise<RecurringPayment | null>;

  // Import Batches
  addImportBatch(batch: ImportBatch): Promise<ImportBatch>;
  getImportBatch(id: string): Promise<ImportBatch | null>;
  updateImportBatch(id: string, updates: Partial<ImportBatch>): Promise<ImportBatch>;

  // Audit Log
  addAuditLog(log: AuditLog): Promise<AuditLog>;
}

export class InMemoryRepository implements IRepository {
  private transactions: Map<string, Transaction> = new Map();
  private accounts: Map<string, Account> = new Map();
  private categories: Map<string, Category> = new Map();
  private taxItems: Map<string, TaxItem> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private recurringPayments: Map<string, RecurringPayment> = new Map();
  private importBatches: Map<string, ImportBatch> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();

  async addTransaction(tx: Transaction): Promise<Transaction> {
    this.transactions.set(tx.id, tx);
    return tx;
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) ?? null;
  }

  async listTransactions(filters?: Record<string, unknown>): Promise<Transaction[]> {
    let result = Array.from(this.transactions.values());
    
    if (filters) {
      if (filters.categoryId) {
        result = result.filter(t => t.categoryId === filters.categoryId);
      }
      if (filters.accountId) {
        result = result.filter(t => t.accountId === filters.accountId);
      }
      if (filters.entity) {
        result = result.filter(t => t.entity === filters.entity);
      }
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate as string);
        const end = new Date(filters.endDate as string);
        result = result.filter(t => t.date >= start && t.date <= end);
      }
    }

    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const tx = this.transactions.get(id);
    if (!tx) throw new Error(`Transaction ${id} not found`);
    const updated = { ...tx, ...updates, id, updatedAt: new Date() };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    this.transactions.delete(id);
  }

  async addAccount(account: Account): Promise<Account> {
    this.accounts.set(account.id, account);
    return account;
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.accounts.get(id) ?? null;
  }

  async listAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const account = this.accounts.get(id);
    if (!account) throw new Error(`Account ${id} not found`);
    const updated = { ...account, ...updates, id };
    this.accounts.set(id, updated);
    return updated;
  }

  async addCategory(category: Category): Promise<Category> {
    this.categories.set(category.id, category);
    return category;
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categories.get(id) ?? null;
  }

  async listCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async addTaxItem(item: TaxItem): Promise<TaxItem> {
    this.taxItems.set(item.id, item);
    return item;
  }

  async getTaxItemsByYear(year: number, entity?: string): Promise<TaxItem[]> {
    let result = Array.from(this.taxItems.values()).filter(t => t.year === year);
    if (entity) {
      result = result.filter(t => t.entity === entity);
    }
    return result;
  }

  async addBudget(budget: Budget): Promise<Budget> {
    this.budgets.set(budget.id, budget);
    return budget;
  }

  async getBudget(id: string): Promise<Budget | null> {
    return this.budgets.get(id) ?? null;
  }

  async listBudgets(month: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(b => b.month === month);
  }

  async addRecurringPayment(payment: RecurringPayment): Promise<RecurringPayment> {
    this.recurringPayments.set(payment.id, payment);
    return payment;
  }

  async listRecurringPayments(entity?: string): Promise<RecurringPayment[]> {
    let result = Array.from(this.recurringPayments.values());
    if (entity) {
      result = result.filter(p => p.entity === entity);
    }
    return result;
  }

  async getRecurringPayment(id: string): Promise<RecurringPayment | null> {
    return this.recurringPayments.get(id) ?? null;
  }

  async updateRecurringPayment(id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> {
    const payment = this.recurringPayments.get(id);
    if (!payment) throw new Error(`RecurringPayment ${id} not found`);
    const updated = { ...payment, ...updates, id };
    this.recurringPayments.set(id, updated);
    return updated;
  }

  async addImportBatch(batch: ImportBatch): Promise<ImportBatch> {
    this.importBatches.set(batch.id, batch);
    return batch;
  }

  async getImportBatch(id: string): Promise<ImportBatch | null> {
    return this.importBatches.get(id) ?? null;
  }

  async updateImportBatch(id: string, updates: Partial<ImportBatch>): Promise<ImportBatch> {
    const batch = this.importBatches.get(id);
    if (!batch) throw new Error(`ImportBatch ${id} not found`);
    const updated = { ...batch, ...updates, id };
    this.importBatches.set(id, updated);
    return updated;
  }

  async addAuditLog(log: AuditLog): Promise<AuditLog> {
    this.auditLogs.set(log.id, log);
    return log;
  }
}
