import { RecurringPaymentService } from '../services/recurring-payment-service.js';
import { TransactionService } from '../services/transaction-service.js';

export interface ProcessingResult {
  processed: number;
  errors: string[];
}

export class RecurringPaymentProcessor {
  constructor(
    private recurringService: RecurringPaymentService,
    private txService: TransactionService
  ) {}

  async processDuePayments(): Promise<ProcessingResult> {
    const duePayments = await this.recurringService.getDuePayments();
    const errors: string[] = [];
    let processed = 0;

    for (const payment of duePayments) {
      try {
        const tx = await this.recurringService.generateTransaction(payment.id);
        await this.txService.createTransaction(tx);
        processed++;
      } catch (err) {
        errors.push(`Failed to process ${payment.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { processed, errors };
  }

  async getUpcomingAlerts(daysAhead: number = 7): Promise<Array<{ paymentId: string; name: string; daysUntilDue: number }>> {
    const upcoming = await this.recurringService.getUpcomingPayments(daysAhead);
    const now = new Date();
    
    return upcoming.map(p => ({
      paymentId: p.id,
      name: p.name,
      daysUntilDue: Math.ceil((new Date(p.nextDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    }));
  }
}
