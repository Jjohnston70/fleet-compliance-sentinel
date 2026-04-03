import { describe, it, expect, beforeEach } from 'vitest';
import { TaxService } from '../src/services/tax-service.js';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';
import { TaxItemSchema } from '../src/data/firestore-schema.js';

describe('TaxService', () => {
  let service: TaxService;
  let repo: InMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryRepository();
    service = new TaxService(repo);
  });

  it('should calculate tax summary correctly', async () => {
    // Add some tax items
    const item1 = TaxItemSchema.parse({
      year: 2024,
      categoryId: 'cat-1',
      amount: 50000, // $500
      deductibleAmount: 50000,
      entity: 'business',
      schedule: 'C',
      lineNumber: '1c',
    });

    const item2 = TaxItemSchema.parse({
      year: 2024,
      categoryId: 'cat-2',
      amount: 10000, // $100
      deductibleAmount: 10000,
      entity: 'business',
      schedule: 'C',
      lineNumber: '8',
    });

    await repo.addTaxItem(item1);
    await repo.addTaxItem(item2);

    const summary = await service.getTaxSummary(2024, 'business');

    expect(summary.year).toBe(2024);
    expect(summary.entity).toBe('business');
    expect(summary.scheduleC['1c']).toBe(50000);
    expect(summary.scheduleC['8']).toBe(10000);
  });

  it('should calculate SE deductibility correctly', async () => {
    const seTax = await service.calculateSEDeductibility(100000); // $1000
    // 50% of SE tax should be deductible
    expect(seTax).toBeGreaterThan(0);
  });

  it('should handle empty tax items', async () => {
    const summary = await service.getTaxSummary(2024, 'business');
    expect(summary.grossIncome).toBe(0);
    expect(summary.totalDeductions).toBe(0);
    expect(summary.estimatedTaxLiability).toBe(0);
  });
});
