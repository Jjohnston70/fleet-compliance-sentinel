import { Account, AccountSchema } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';

export class AccountService {
  constructor(private repo: IRepository) {}

  async createAccount(data: Omit<Account, 'id'>): Promise<Account> {
    const account = AccountSchema.parse(data);
    return this.repo.addAccount(account);
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.repo.getAccount(id);
  }

  async listAccounts(entity?: string): Promise<Account[]> {
    const all = await this.repo.listAccounts();
    if (entity) {
      return all.filter(a => a.entity === entity);
    }
    return all;
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    return this.repo.updateAccount(id, updates);
  }

  async updateBalance(id: string, amount: number): Promise<Account> {
    const account = await this.repo.getAccount(id);
    if (!account) throw new Error(`Account ${id} not found`);
    return this.repo.updateAccount(id, { balance: account.balance + amount });
  }

  async getTotalBalance(entity?: string): Promise<number> {
    const accounts = await this.listAccounts(entity);
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  }
}
