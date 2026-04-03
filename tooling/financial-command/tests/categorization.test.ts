import { describe, it, expect, beforeEach } from 'vitest';
import { CategorizationService } from '../src/services/categorization-service.js';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';
import { CategorySchema } from '../src/data/firestore-schema.js';

describe('CategorizationService', () => {
  let service: CategorizationService;
  let repo: InMemoryRepository;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    service = new CategorizationService(repo);

    // Add test categories
    const expenseCategory = CategorySchema.parse({
      name: 'Advertising',
      type: 'expense',
      keywords: ['ads', 'advertising', 'marketing'],
      deductiblePct: 100,
    });

    const incomeCategory = CategorySchema.parse({
      name: 'Interest Income',
      type: 'income',
      keywords: ['interest', 'apy'],
      deductiblePct: 0,
    });

    await repo.addCategory(expenseCategory);
    await repo.addCategory(incomeCategory);
  });

  it('should categorize by keyword match', async () => {
    const result = await service.categorizeTransaction('Facebook ads campaign');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Advertising');
  });

  it('should handle USAA-specific rules', async () => {
    // Add insurance category
    const insuranceCategory = CategorySchema.parse({
      name: 'Insurance',
      type: 'expense',
      keywords: ['insurance'],
      deductiblePct: 100,
    });
    await repo.addCategory(insuranceCategory);

    const result = await service.categorizeTransaction('USAA Insurance payment');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Insurance');
  });

  it('should return null for unmatched description', async () => {
    const result = await service.categorizeTransaction('Random text with no keywords');
    expect(result).toBeNull();
  });
});
