/**
 * Auto-Renewer Hook
 * Automatically renew contracts with auto_renew=true at end_date
 */

import { ContractService } from '../services/contract-service.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';

export class AutoRenewer {
  /**
   * Process auto-renewal for contracts that expire today
   */
  static async processRenewals() {
    console.log('[AutoRenewer] Starting auto-renewal check...');

    try {
      const allContracts = await ContractService.list();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let renewed = 0;
      let failures = 0;

      for (const contract of allContracts) {
        if (!contract.auto_renew) continue;

        const endDate = new Date(contract.end_date);
        endDate.setHours(0, 0, 0, 0);

        // Check if contract expires today
        if (endDate.getTime() === today.getTime()) {
          try {
            const newContract = await this.renewContract(contract);
            console.log(`[AutoRenewer] Renewed contract: ${newContract.id}`);
            renewed++;
          } catch (error) {
            console.error(`[AutoRenewer] Failed to renew ${contract.id}:`, error);
            failures++;
          }
        }
      }

      console.log(`[AutoRenewer] Renewed ${renewed} contracts (${failures} failures)`);

      return {
        success: true,
        renewed,
        failures,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[AutoRenewer] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Renew a single contract
   */
  static async renewContract(contract: any) {
    if (!contract.auto_renew) {
      throw new Error('Contract does not have auto_renew enabled');
    }

    // Calculate new end date (typically 1 year from current end date)
    const currentEndDate = new Date(contract.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    // Create new contract
    const newContract = await ContractService.create({
      title: `${contract.title} (Renewed)`,
      contract_number: contract.contract_number ? `${contract.contract_number}-R${new Date().getFullYear()}` : undefined,
      party_id: contract.party_id,
      contract_type: contract.contract_type,
      start_date: currentEndDate,
      end_date: newEndDate,
      value: contract.value,
      currency: contract.currency,
      payment_terms: contract.payment_terms,
      auto_renew: contract.auto_renew,
      renewal_notice_days: contract.renewal_notice_days,
      document_url: contract.document_url,
      notes: `Auto-renewed from ${contract.id}. Original end date: ${contract.end_date}`
    });

    // Update original contract status to 'renewed'
    await ContractService.updateStatus(
      contract.id,
      'renewed',
      `Auto-renewed as ${newContract.id}`
    );

    // Create alert log entry
    await inMemoryRepository.createAlert({
      contract_id: contract.id,
      alert_type: 'auto_renewal',
      message: `Contract auto-renewed. New contract: ${newContract.id}`,
      acknowledged: false
    });

    return newContract;
  }

  /**
   * Get contracts eligible for renewal
   */
  static async getEligibleForRenewal() {
    const allContracts = await ContractService.list();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eligible = [];

    for (const contract of allContracts) {
      if (!contract.auto_renew) continue;

      const endDate = new Date(contract.end_date);
      endDate.setHours(0, 0, 0, 0);

      if (endDate <= today && contract.status !== 'renewed') {
        eligible.push({
          id: contract.id,
          title: contract.title,
          endDate: contract.end_date,
          daysOverdue: Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)),
          status: contract.status
        });
      }
    }

    return eligible;
  }

  /**
   * Generate renewal report
   */
  static async generateReport() {
    const allContracts = await ContractService.list();
    const eligible = await this.getEligibleForRenewal();

    const autoRenewContracts = allContracts.filter(c => c.auto_renew);

    return {
      totalAutoRenewContracts: autoRenewContracts.length,
      eligibleForRenewal: eligible.length,
      eligible,
      by_status: autoRenewContracts.reduce((acc: any, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

/**
 * Export as Next.js API route handler
 */
export async function handleAutoRenewal(req: { method: string }) {
  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const result = await AutoRenewer.processRenewals();
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}
