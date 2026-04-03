import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionService } from '../src/services/transaction-service.js';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';

describe('TransactionService', () => {
  let service: TransactionService;
  let repo: InMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryRepository();
    service = new TransactionService(repo);
  });

  it('should create a transaction', async () => {
    const tx = await service.createTransaction({
      date: new Date('2024-01-15'),
      description: 'Test transaction',
      amount: 10000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    expect(tx.id).toBeDefined();
    expect(tx.description).toBe('Test transaction');
    expect(tx.amount).toBe(10000);
  });

  it('should list all transactions', async () => {
    await service.createTransaction({
      date: new Date('2024-01-15'),
      description: 'Transaction 1',
      amount: 10000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    await service.createTransaction({
      date: new Date('2024-01-16'),
      description: 'Transaction 2',
      amount: 20000,
      categoryId: 'cat-2',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    const txs = await service.listTransactions();
    expect(txs.length).toBe(2);
  });

  it('should search transactions by keyword', async () => {
    await service.createTransaction({
      date: new Date('2024-01-15'),
      description: 'Grocery shopping',
      amount: 5000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    await service.createTransaction({
      date: new Date('2024-01-16'),
      description: 'Office supplies',
      amount: 3000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    const results = await service.searchTransactions('grocery');
    expect(results.length).toBe(1);
    expect(results[0].description).toBe('Grocery shopping');
  });

  it('should calculate totals by category', async () => {
    await service.createTransaction({
      date: new Date('2024-01-15'),
      description: 'Transaction 1',
      amount: 10000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    await service.createTransaction({
      date: new Date('2024-01-16'),
      description: 'Transaction 2',
      amount: 5000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      entity: 'personal',
      taxRelevant: false,
      importSource: 'manual',
    });

    const total = await service.getTotalsByCategory('cat-1');
    expect(total).toBe(15000);
  });
});
