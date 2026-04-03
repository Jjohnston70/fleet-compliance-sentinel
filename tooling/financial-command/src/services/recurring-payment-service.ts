import { RecurringPayment, RecurringPaymentSchema, Transaction } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';

export class RecurringPaymentService {
  constructor(private repo: IRepository) {}

  async createRecurringPayment(data: Omit<RecurringPayment, 'id'>): Promise<RecurringPayment> {
    const payment = RecurringPaymentSchema.parse(data);
    return this.repo.addRecurringPayment(payment);
  }

  async listRecurringPayments(entity?: string): Promise<RecurringPayment[]> {
    return this.repo.listRecurringPayments(entity);
  }

  async updateRecurringPayment(id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> {
    return this.repo.updateRecurringPayment(id, updates);
  }

  async getDuePayments(): Promise<RecurringPayment[]> {
    const now = new Date();
    const allPayments = await this.repo.listRecurringPayments();
    return allPayments.filter(p => p.active && new Date(p.nextDate) <= now);
  }

  async getUpcomingPayments(daysAhead: number = 30): Promise<RecurringPayment[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const allPayments = await this.repo.listRecurringPayments();
    return allPayments.filter(
      p => p.active && 
           new Date(p.nextDate) > now && 
           new Date(p.nextDate) <= futureDate
    );
  }

  private getNextDate(currentDate: Date, frequency: RecurringPayment['frequency']): Date {
    const next = new Date(currentDate);
    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'annual':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  async generateTransaction(paymentId: string): Promise<Transaction> {
    const payment = await this.repo.getRecurringPayment?.(paymentId);
    if (!payment) throw new Error(`RecurringPayment ${paymentId} not found`);

    const tx: Transaction = {
      id: crypto.randomUUID(),
      date: new Date(),
      description: `Recurring: ${payment.name}`,
      amount: payment.amount,
      categoryId: payment.categoryId,
      accountId: payment.accountId,
      entity: payment.entity,
      taxRelevant: false,
      importSource: 'manual',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update next date
    const nextDate = this.getNextDate(new Date(payment.nextDate), payment.frequency);
    await this.repo.updateRecurringPayment(paymentId, { nextDate });

    return tx;
  }
}
