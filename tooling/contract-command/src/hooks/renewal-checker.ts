/**
 * Renewal Checker Hook
 * Daily cron job to check for expiring contracts and generate notifications
 */

import { ContractService } from '../services/contract-service.js';
import { NotificationService } from '../services/notification-service.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';

export class RenewalChecker {
  /**
   * Check all contracts for expiration within renewal notice period
   * This runs daily as a cron job
   */
  static async check() {
    console.log('[RenewalChecker] Starting daily check...');

    try {
      // Check for contracts expiring within 90 days
      const expiringContracts = await ContractService.getExpiringWithin(90);
      console.log(`[RenewalChecker] Found ${expiringContracts.length} contracts expiring within 90 days`);

      // Update status to 'expiring' for contracts within renewal notice period
      let statusUpdated = 0;
      for (const contract of expiringContracts) {
        if (contract.status === 'active') {
          const daysUntil = ContractService.daysUntilExpiration(contract);

          // Update status to 'expiring' if within notice period
          if (daysUntil <= contract.renewal_notice_days) {
            await ContractService.updateStatus(
              contract.id,
              'expiring',
              `Auto-updated: ${daysUntil} days until expiration`
            );
            statusUpdated++;
          }
        }
      }

      console.log(`[RenewalChecker] Updated ${statusUpdated} contracts to 'expiring' status`);

      // Generate notifications
      const notificationsCreated = await NotificationService.generateNotificationsByThreshold();
      console.log(`[RenewalChecker] Created ${notificationsCreated.created} notifications`);

      // Send pending notifications
      const notificationsSent = await NotificationService.sendPending();
      console.log(`[RenewalChecker] Sent ${notificationsSent} notifications`);

      return {
        success: true,
        expiringContracts: expiringContracts.length,
        statusUpdated,
        notificationsCreated: notificationsCreated.created,
        notificationsSent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[RenewalChecker] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check specific contract for renewal
   */
  static async checkContract(contractId: string) {
    try {
      const contract = await ContractService.getById(contractId);
      const daysUntil = ContractService.daysUntilExpiration(contract);

      return {
        contractId,
        title: contract.title,
        endDate: contract.end_date,
        daysUntil,
        status: contract.status,
        renewalNotice: contract.renewal_notice_days,
        needsRenewalNotice: daysUntil <= contract.renewal_notice_days && contract.status === 'active',
        autoRenew: contract.auto_renew,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[RenewalChecker] Error checking contract:', error);
      throw error;
    }
  }

  /**
   * Generate report of contracts needing attention
   */
  static async generateReport() {
    const allContracts = await ContractService.list();
    const now = new Date();

    const report = {
      total: allContracts.length,
      active: 0,
      expiring: 0,
      expired: 0,
      pending: 0,
      needsRenewal: 0,
      contracts: [] as any[]
    };

    for (const contract of allContracts) {
      const status = contract.status;
      if (status === 'active') report.active++;
      else if (status === 'expiring') report.expiring++;
      else if (status === 'expired') report.expired++;
      else if (status === 'draft' || status === 'pending_review') report.pending++;

      const endDate = new Date(contract.end_date);
      const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (status === 'active' && daysUntil <= contract.renewal_notice_days) {
        report.needsRenewal++;
        report.contracts.push({
          id: contract.id,
          title: contract.title,
          endDate: contract.end_date,
          daysUntil,
          renewalNotice: contract.renewal_notice_days,
          autoRenew: contract.auto_renew
        });
      }
    }

    report.contracts.sort((a, b) => a.daysUntil - b.daysUntil);

    return report;
  }
}

/**
 * Export as Next.js API route handler
 */
export async function handleRenewalCheck(req: { method: string }) {
  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const result = await RenewalChecker.check();
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}
