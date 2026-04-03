import { DigestConfig, Recipient } from '../data/schema.js';

export interface DeliveryQueue {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface DeliveryStatus {
  recipient: string;
  status: 'sent' | 'bounced' | 'failed';
  error?: string;
  timestamp: Date;
}

export class DistributionManager {
  private deliveryLog: Map<string, DeliveryStatus[]> = new Map();

  /**
   * Build a delivery queue from digest config
   */
  buildDeliveryQueue(config: DigestConfig, subject: string, html: string, text?: string): DeliveryQueue {
    const recipients = this.resolveRecipients(config.recipients);

    return {
      to: recipients.to,
      cc: recipients.cc.length > 0 ? recipients.cc : undefined,
      bcc: recipients.bcc.length > 0 ? recipients.bcc : undefined,
      subject,
      html,
      text,
    };
  }

  /**
   * Resolve recipients from config with role-based grouping
   */
  private resolveRecipients(recipients: Recipient[]): {
    to: string[];
    cc: string[];
    bcc: string[];
  } {
    const primary: string[] = [];
    const cc: string[] = [];
    const bcc: string[] = [];

    recipients.forEach((recipient) => {
      const address = `${recipient.name} <${recipient.email}>`;
      switch (recipient.role.toLowerCase()) {
        case 'primary':
        case 'to':
          primary.push(address);
          break;
        case 'cc':
          cc.push(address);
          break;
        case 'bcc':
          bcc.push(address);
          break;
        default:
          primary.push(address);
      }
    });

    return {
      to: primary.length > 0 ? primary : recipients.map((r) => `${r.name} <${r.email}>`),
      cc,
      bcc,
    };
  }

  /**
   * Track delivery status
   */
  recordDelivery(recipientEmail: string, status: DeliveryStatus): void {
    const key = recipientEmail;
    if (!this.deliveryLog.has(key)) {
      this.deliveryLog.set(key, []);
    }
    this.deliveryLog.get(key)!.push(status);
  }

  /**
   * Get delivery history for a recipient
   */
  getDeliveryHistory(recipientEmail: string): DeliveryStatus[] {
    return this.deliveryLog.get(recipientEmail) ?? [];
  }

  /**
   * Get summary of delivery statuses
   */
  getDeliverySummary(): {
    total: number;
    sent: number;
    bounced: number;
    failed: number;
  } {
    let total = 0;
    let sent = 0;
    let bounced = 0;
    let failed = 0;

    this.deliveryLog.forEach((statuses) => {
      statuses.forEach((status) => {
        total++;
        switch (status.status) {
          case 'sent':
            sent++;
            break;
          case 'bounced':
            bounced++;
            break;
          case 'failed':
            failed++;
            break;
        }
      });
    });

    return { total, sent, bounced, failed };
  }

  /**
   * Clear delivery log (for testing)
   */
  clearLog(): void {
    this.deliveryLog.clear();
  }
}
