import { TransactionService } from '../services/transaction-service.js';
import { AccountService } from '../services/account-service.js';

export interface DashboardData {
  totalIncome: number; // cents
  totalExpenses: number; // cents
  netIncome: number; // cents
  totalBalance: number; // cents
  categoryBreakdown: Array<{ categoryId: string; name: string; amount: number }>;
  accountBalances: Array<{ accountId: string; name: string; balance: number }>;
  period: {
    start: Date;
    end: Date;
  };
}

export class DashboardReport {
  constructor(
    private txService: TransactionService,
    private accountService: AccountService
  ) {}

  async generateMonthlyDashboard(year: number, month: number, entity?: string): Promise<DashboardData> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const txs = await this.txService.getTransactionsByDateRange(startDate, endDate, entity);

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map<string, { id: string; name: string; amount: number }>();

    for (const tx of txs) {
      if (tx.amount > 0) {
        totalIncome += tx.amount;
      } else {
        totalExpenses += Math.abs(tx.amount);
      }
      
      const current = categoryMap.get(tx.categoryId) ?? { id: tx.categoryId, name: tx.categoryId, amount: 0 };
      current.amount += tx.amount;
      categoryMap.set(tx.categoryId, current);
    }

    const accounts = await this.accountService.listAccounts(entity);
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      totalBalance,
      categoryBreakdown: Array.from(categoryMap.values()).map(v => ({
        categoryId: v.id,
        name: v.name,
        amount: v.amount,
      })),
      accountBalances: accounts.map(a => ({
        accountId: a.id,
        name: a.name,
        balance: a.balance,
      })),
      period: { start: startDate, end: endDate },
    };
  }
}
