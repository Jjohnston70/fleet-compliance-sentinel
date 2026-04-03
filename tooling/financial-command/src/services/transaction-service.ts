import { Transaction, TransactionSchema } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';

export interface TransactionFilter {
  categoryId?: string;
  accountId?: string;
  entity?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export class TransactionService {
  constructor(private repo: IRepository) {}

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const tx = TransactionSchema.parse(data);
    return this.repo.addTransaction(tx);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.repo.getTransaction(id);
  }

  async listTransactions(filters?: TransactionFilter): Promise<Transaction[]> {
    const filterRecord: Record<string, unknown> | undefined = filters ? {
      categoryId: filters.categoryId,
      accountId: filters.accountId,
      entity: filters.entity,
      startDate: filters.startDate,
      endDate: filters.endDate,
    } : undefined;
    return this.repo.listTransactions(filterRecord);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return this.repo.updateTransaction(id, updates);
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.repo.deleteTransaction(id);
  }

  async searchTransactions(query: string, limit: number = 50): Promise<Transaction[]> {
    const allTx = await this.repo.listTransactions();
    const lowerQuery = query.toLowerCase();
    return allTx
      .filter(t => t.description.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date, entity?: string): Promise<Transaction[]> {
    const filterRecord: Record<string, unknown> = {
      startDate,
      endDate,
    };
    if (entity) filterRecord.entity = entity;
    return this.repo.listTransactions(filterRecord);
  }

  async getTotalsByCategory(categoryId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const filterRecord: Record<string, unknown> = { categoryId };
    if (startDate) filterRecord.startDate = startDate;
    if (endDate) filterRecord.endDate = endDate;
    const txs = await this.repo.listTransactions(filterRecord);
    return txs.reduce((sum, tx) => sum + tx.amount, 0);
  }
}
