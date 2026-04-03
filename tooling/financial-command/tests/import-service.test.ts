import { describe, it, expect, beforeEach } from 'vitest';
import { ImportService } from '../src/services/import-service.js';
import { CategorizationService } from '../src/services/categorization-service.js';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';
import { CategorySchema } from '../src/data/firestore-schema.js';

describe('ImportService', () => {
  let service: ImportService;
  let categService: CategorizationService;
  let repo: InMemoryRepository;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    categService = new CategorizationService(repo);
    service = new ImportService(repo, categService);

    // Add test category
    const category = CategorySchema.parse({
      name: 'Test Category',
      type: 'expense',
      keywords: ['test'],
      deductiblePct: 100,
    });
    await repo.addCategory(category);
  });

  it('should parse USAA CSV format', async () => {
    const csv = `Date,Description,Amount,Balance
2024-01-15,Test transaction,100.00,5000.00
2024-01-16,Another transaction,-50.00,4950.00`;

    const accountId = 'test-account';
    const result = await service.importUSAACSV(csv, accountId, 'personal', 'test-user');

    expect(result.transactions.length).toBe(2);
    expect(result.batch.importedCount).toBe(2);
    expect(result.batch.rowCount).toBe(2);
  });

  it('should convert dollars to cents', async () => {
    const csv = `Date,Description,Amount,Balance
2024-01-15,Test,99.99,5000.00`;

    const result = await service.importUSAACSV(csv, 'test-account', 'personal', 'test-user');

    expect(result.transactions[0].amount).toBe(9999); // 99.99 * 100
  });

  it('should handle invalid CSV rows', async () => {
    const csv = `Date,Description,Amount,Balance
2024-01-15,Valid transaction,100.00,5000.00
invalid,row,data
2024-01-17,Another valid,50.00,5050.00`;

    const result = await service.importUSAACSV(csv, 'test-account', 'personal', 'test-user');

    expect(result.batch.importedCount).toBe(2);
    expect(result.batch.skippedCount).toBe(1);
  });
});
