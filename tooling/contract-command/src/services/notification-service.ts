/**
 * Notification Service
 * Generate and manage contract notifications
 */

import { ContractNotification, NotificationType } from '../data/types.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';
import { ContractService } from './contract-service.js';
import { NOTIFICATION_DAYS } from '../config/index.js';

export class NotificationService {
  /**
   * Create notification
   */
  static async create(notification: Omit<ContractNotification, 'id' | 'created_at'>) {
    if (!notification.contract_id || !notification.notification_type || !notification.trigger_date) {
      throw new Error('contract_id, notification_type, and trigger_date are required');
    }

    return inMemoryRepository.createNotification(notification);
  }

  /**
   * Generate renewal notifications for contracts expiring soon
   */
  static async generateRenewalNotifications(days: number = 30): Promise<number> {
    const expiringContracts = await ContractService.getExpiringWithin(days);
    let created = 0;

    for (const contract of expiringContracts) {
      // Check if notification already exists for this contract at this threshold
      const existing = await inMemoryRepository.getPendingNotifications();
      const alreadyExists = existing.some(
        n => n.contract_id === contract.id &&
        n.notification_type === 'renewal_reminder' &&
        !n.sent
      );

      if (!alreadyExists) {
        const daysUntilExpiration = ContractService.daysUntilExpiration(contract);
        await this.create({
          contract_id: contract.id,
          notification_type: 'renewal_reminder',
          trigger_date: new Date(),
          sent: false,
          message: `Contract "${contract.title}" expires in ${daysUntilExpiration} days. Renewal notice period: ${contract.renewal_notice_days} days.`,
          recipient_email: process.env.NOTIFICATION_EMAIL || 'admin@example.com'
        });
        created++;
      }
    }

    return created;
  }

  /**
   * Get pending notifications
   */
  static async getPending() {
    return inMemoryRepository.getPendingNotifications();
  }

  /**
   * Mark notification as sent
   */
  static async markSent(id: string, sentAt?: Date) {
    return inMemoryRepository.updateNotification(id, {
      sent: true,
      sent_at: sentAt || new Date()
    });
  }

  /**
   * Send all pending notifications
   */
  static async sendPending(): Promise<number> {
    const pending = await this.getPending();
    let sent = 0;

    for (const notification of pending) {
      try {
        // In production, this would call actual email service
        await this.markSent(notification.id);
        sent++;
        console.log(`Notification sent: ${notification.id}`);
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error);
      }
    }

    return sent;
  }

  /**
   * Generate notifications based on renewal notice days
   */
  static async generateNotificationsByThreshold() {
    let created = 0;

    for (const days of NOTIFICATION_DAYS) {
      const count = await this.generateRenewalNotifications(days);
      created += count;
    }

    return { created };
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOld(olderThanDays: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const allNotifications = await inMemoryRepository.getPendingNotifications();
    let deleted = 0;

    // In memory, just tracking; in production would delete from DB
    for (const notification of allNotifications) {
      if (notification.created_at < cutoffDate && notification.sent) {
        // Mark for deletion (would be actual delete in DB)
        deleted++;
      }
    }

    return { deleted };
  }
}
