import { Budget, BudgetSchema } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';
import { TransactionService } from './transaction-service.js';

export interface BudgetVariance {
  budgetId: string;
  categoryId: string;
  month: string;
  planned: number; // cents
  actual: number; // cents
  variance: number; // cents (positive = under budget)
  variancePercent: number;
}

export class BudgetService {
  constructor(
    private repo: IRepository,
    private txService: TransactionService
  ) {}

  async createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    const budget = BudgetSchema.parse(data);
    return this.repo.addBudget(budget);
  }

  async getBudget(id: string): Promise<Budget | null> {
    return this.repo.getBudget(id);
  }

  async listBudgets(month: string): Promise<Budget[]> {
    return this.repo.listBudgets(month);
  }

  async calculateVariance(budgetId: string): Promise<BudgetVariance> {
    const budget = await this.repo.getBudget(budgetId);
    if (!budget) throw new Error(`Budget ${budgetId} not found`);

    // Parse month to get date range
    const [year, month] = budget.month.split('-');
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // last day of month

    // Get actual spending
    const txs = await this.txService.getTransactionsByDateRange(startDate, endDate, budget.entity);
    const categoryTxs = txs.filter(t => t.categoryId === budget.categoryId);
    const actual = categoryTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const variance = budget.planned - actual;
    const variancePercent = budget.planned > 0 ? (variance / budget.planned) * 100 : 0;

    return {
      budgetId,
      categoryId: budget.categoryId,
      month: budget.month,
      planned: budget.planned,
      actual,
      variance,
      variancePercent,
    };
  }

  async getMonthlyVariances(month: string): Promise<BudgetVariance[]> {
    const budgets = await this.listBudgets(month);
    return Promise.all(budgets.map(b => this.calculateVariance(b.id)));
  }
}
