/**
 * Pricing Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PricingService } from '../src/services/pricing-service';
import { InMemoryRepository } from '../src/data/in-memory-repository';

describe('PricingService', () => {
  let repository: InMemoryRepository;
  let service: PricingService;

  beforeEach(async () => {
    repository = new InMemoryRepository();
    service = new PricingService(repository);
  });

  it('should add line item to proposal', async () => {
    const item = await service.addLineItem(
      'prop-123',
      'Web Development',
      1,
      15000,
      'Development'
    );

    expect(item.id).toBeDefined();
    expect(item.proposalId).toBe('prop-123');
    expect(item.description).toBe('Web Development');
    expect(item.total).toBe(15000);
  });

  it('should calculate total automatically', async () => {
    const item = await service.addLineItem('prop-123', 'Design', 2, 5000, 'Design');

    expect(item.total).toBe(10000);
  });

  it('should get all line items for proposal', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 15000, 'Development');
    await service.addLineItem('prop-123', 'Design', 1, 5000, 'Design');

    const items = await service.getLineItems('prop-123');

    expect(items.length).toBe(2);
    expect(items[0].order).toBe(1);
    expect(items[1].order).toBe(2);
  });

  it('should calculate pricing summary', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 10000, 'Development');
    await service.addLineItem('prop-123', 'Design', 1, 5000, 'Design');

    const summary = await service.calculatePricingSummary('prop-123');

    expect(summary.subtotal).toBe(15000);
    expect(summary.total).toBe(15000);
    expect(summary.taxAmount).toBe(0);
    expect(summary.discountAmount).toBe(0);
  });

  it('should apply tax correctly', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 10000, 'Development');

    const summary = await service.calculatePricingSummary('prop-123', 10, 0);

    expect(summary.subtotal).toBe(10000);
    expect(summary.taxRate).toBe(10);
    expect(summary.taxAmount).toBe(1000);
    expect(summary.total).toBe(11000);
  });

  it('should apply discount correctly', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 10000, 'Development');

    const summary = await service.calculatePricingSummary('prop-123', 0, 10);

    expect(summary.subtotal).toBe(10000);
    expect(summary.discountPercent).toBe(10);
    expect(summary.discountAmount).toBe(1000);
    expect(summary.total).toBe(9000);
  });

  it('should apply tax and discount together', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 10000, 'Development');

    const summary = await service.calculatePricingSummary('prop-123', 10, 10);

    expect(summary.subtotal).toBe(10000);
    expect(summary.taxAmount).toBe(1000);
    expect(summary.discountAmount).toBe(1000);
    expect(summary.total).toBe(10000);
  });

  it('should update line item', async () => {
    const item = await service.addLineItem('prop-123', 'Development', 1, 15000, 'Development');

    const updated = await service.updateLineItem(item.id, {
      quantity: 2,
      unitPrice: 10000,
    });

    expect(updated.quantity).toBe(2);
    expect(updated.unitPrice).toBe(10000);
    expect(updated.total).toBe(20000);
  });

  it('should delete line item', async () => {
    const item = await service.addLineItem('prop-123', 'Development', 1, 15000, 'Development');

    await service.deleteLineItem(item.id);

    const items = await service.getLineItems('prop-123');
    expect(items.length).toBe(0);
  });

  it('should group line items by category', async () => {
    await service.addLineItem('prop-123', 'Development Hours', 100, 150, 'Development');
    await service.addLineItem('prop-123', 'Design Hours', 50, 100, 'Design');
    await service.addLineItem('prop-123', 'More Dev Hours', 50, 150, 'Development');

    const grouped = await service.getLineItemsByCategory('prop-123');

    expect(grouped.size).toBe(2);
    expect(grouped.get('Development')?.length).toBe(2);
    expect(grouped.get('Design')?.length).toBe(1);
  });

  it('should get subtotal by category', async () => {
    await service.addLineItem('prop-123', 'Development', 100, 150, 'Development');
    await service.addLineItem('prop-123', 'Design', 50, 100, 'Design');

    const subtotals = await service.getSubtotalByCategory('prop-123');

    expect(subtotals.get('Development')).toBe(15000);
    expect(subtotals.get('Design')).toBe(5000);
  });

  it('should validate discount range', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 10000, 'Development');

    try {
      await service.applyDiscount('prop-123', 150);
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('must be between 0 and 100');
    }
  });

  it('should validate tax range', async () => {
    await service.addLineItem('prop-123', 'Development', 1, 10000, 'Development');

    try {
      await service.applyTax('prop-123', -5);
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('must be between 0 and 100');
    }
  });
});
