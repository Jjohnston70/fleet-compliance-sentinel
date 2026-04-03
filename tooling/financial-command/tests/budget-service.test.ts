import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetService } from '../src/services/budget-service.js';
import { TransactionService } from '../src/services/transaction-service.js';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';
import { BudgetSchema, TransactionSchema } from '../src/data/firestore-schema.js';

describe('BudgetService', () => {
  let service: BudgetService;
  let txService: TransactionService;
  let repo: InMemoryRepository;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    txService = new TransactionService(repo);
    service = new BudgetService(repo, txService);
  });

  it('should calculate budget variance correctly', async () => {
    // Create budget: $1000 for category for Jan 2024
    const budget = BudgetSchema.parse({
      categoryId: 'cat-1',
      month: '2024-01',
      planned: 100000, // $1000
      actual: 0,
      entity: 'personal',
    });
    const savedBudget = await repo.addBudget(budget);

    // Add transaction for same month and category
    const tx = TransactionSchema.parse({
      date: new Date('2024-01-15'),
      description: 'Test expense',
      amount: 30000, // $300
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
    });
    await repo.addTransaction(tx);

    const variance = await service.calculateVariance(savedBudget.id);

    expect(variance.planned).toBe(100000);
    expect(variance.actual).toBe(30000);
    expect(variance.variance).toBe(70000); // Under budget
    expect(variance.variancePercent).toBe(70);
  });

  it('should handle over-budget scenarios', async () => {
    const budget = BudgetSchema.parse({
      categoryId: 'cat-1',
      month: '2024-01',
      planned: 50000, // $500
      actual: 0,
      entity: 'personal',
    });
    const savedBudget = await repo.addBudget(budget);

    // Add $600 in expenses
    const tx = TransactionSchema.parse({
      date: new Date('2024-01-15'),
      description: 'Test expense',
      amount: 60000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
    });
    await repo.addTransaction(tx);

    const variance = await service.calculateVariance(savedBudget.id);

    expect(variance.variance).toBe(-10000); // Over budget
    expect(variance.variancePercent).toBe(-20);
  });
});
