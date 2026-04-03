import { TransactionService } from '../services/transaction-service.js';
import { AccountService } from '../services/account-service.js';
import { CategorizationService } from '../services/categorization-service.js';
import { TaxService, TaxSummary } from '../services/tax-service.js';
import { ImportService } from '../services/import-service.js';
import { BudgetService, BudgetVariance } from '../services/budget-service.js';
import { RecurringPaymentService } from '../services/recurring-payment-service.js';
import { Transaction, Account } from '../data/firestore-schema.js';

export class APIHandlers {
  constructor(
    private txService: TransactionService,
    private accountService: AccountService,
    private categService: CategorizationService,
    private taxService: TaxService,
    private importService: ImportService,
    private budgetService: BudgetService,
    private recurringService: RecurringPaymentService
  ) {}

  // Transaction handlers
  async createTransaction(data: Parameters<TransactionService['createTransaction']>[0]): Promise<Transaction> {
    return this.txService.createTransaction(data);
  }

  async listTransactions(): Promise<Transaction[]> {
    return this.txService.listTransactions();
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.txService.getTransaction(id);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return this.txService.updateTransaction(id, updates);
  }

  // Account handlers
  async createAccount(data: Parameters<AccountService['createAccount']>[0]): Promise<Account> {
    return this.accountService.createAccount(data);
  }

  async listAccounts(): Promise<Account[]> {
    return this.accountService.listAccounts();
  }

  // Import handlers
  async importCSV(csv: string, accountId: string, entity: string, importedBy: string) {
    return this.importService.importUSAACSV(csv, accountId, entity, importedBy);
  }

  // Tax handlers
  async getTaxSummary(year: number, entity: string): Promise<TaxSummary> {
    return this.taxService.getTaxSummary(year, entity);
  }

  // Budget handlers
  async getBudgetVariances(month: string): Promise<BudgetVariance[]> {
    return this.budgetService.getMonthlyVariances(month);
  }

  // Categorization
  async categorizeTransaction(description: string) {
    return this.categService.categorizeTransaction(description);
  }
}
