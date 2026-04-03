import { describe, it, expect, beforeEach } from 'vitest';
import { RecurringPaymentService } from '../src/services/recurring-payment-service.js';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';

describe('RecurringPaymentService', () => {
  let service: RecurringPaymentService;
  let repo: InMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryRepository();
    service = new RecurringPaymentService(repo);
  });

  it('should create recurring payment', async () => {
    const payment = await service.createRecurringPayment({
      name: 'Monthly subscription',
      amount: 9999,
      frequency: 'monthly',
      nextDate: new Date('2024-02-01'),
      accountId: 'acc-1',
      categoryId: 'cat-1',
      entity: 'personal',
      active: true,
    });

    expect(payment.id).toBeDefined();
    expect(payment.name).toBe('Monthly subscription');
    expect(payment.frequency).toBe('monthly');
  });

  it('should get due payments', async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    
    const payment = await service.createRecurringPayment({
      name: 'Overdue payment',
      amount: 5000,
      frequency: 'monthly',
      nextDate: pastDate,
      accountId: 'acc-1',
      categoryId: 'cat-1',
      entity: 'personal',
      active: true,
    });

    const duePayments = await service.getDuePayments();
    expect(duePayments.length).toBeGreaterThan(0);
    expect(duePayments.some(p => p.id === payment.id)).toBe(true);
  });

  it('should get upcoming payments within timeframe', async () => {
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    
    const payment = await service.createRecurringPayment({
      name: 'Upcoming payment',
      amount: 5000,
      frequency: 'monthly',
      nextDate: futureDate,
      accountId: 'acc-1',
      categoryId: 'cat-1',
      entity: 'personal',
      active: true,
    });

    const upcoming = await service.getUpcomingPayments(30);
    expect(upcoming.some(p => p.id === payment.id)).toBe(true);
  });
});
