/**
 * Contract Summary Reporting
 * Dashboard summary: active/expired/expiring counts, total value, by type
 */

import { ContractService } from '../services/contract-service.js';

export class ContractSummary {
  /**
   * Get complete contract summary
   */
  static async generate() {
    const allContracts = await ContractService.list();
    const now = new Date();

    const summary = {
      total: allContracts.length,
      active: 0,
      expiring_soon: 0,
      expired: 0,
      pending: 0,
      terminated: 0,
      total_value: 0,
      by_type: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
      value_by_type: {} as Record<string, number>,
      value_by_status: {} as Record<string, number>,
      generated_at: new Date().toISOString()
    };

    // Calculate 30-day threshold
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const contract of allContracts) {
      const status = contract.status;
      const value = contract.value || 0;

      // By status
      summary.by_status[status] = (summary.by_status[status] || 0) + 1;
      summary.value_by_status[status] = (summary.value_by_status[status] || 0) + value;

      // By type
      summary.by_type[contract.contract_type] = (summary.by_type[contract.contract_type] || 0) + 1;
      summary.value_by_type[contract.contract_type] = (summary.value_by_type[contract.contract_type] || 0) + value;

      // Total value
      summary.total_value += value;

      // Status counts
      if (status === 'active') {
        summary.active++;

        const endDate = new Date(contract.end_date);
        if (endDate >= now && endDate <= thirtyDaysFromNow) {
          summary.expiring_soon++;
        }
      } else if (status === 'expired') {
        summary.expired++;
      } else if (status === 'draft' || status === 'pending_review') {
        summary.pending++;
      } else if (status === 'terminated') {
        summary.terminated++;
      }
    }

    return summary;
  }

  /**
   * Get summary as formatted report
   */
  static async generateReport() {
    const summary = await this.generate();

    return {
      ...summary,
      summary_text: `
Contract Summary Report
========================
Total Contracts: ${summary.total}
  - Active: ${summary.active}
  - Expiring Soon (30 days): ${summary.expiring_soon}
  - Expired: ${summary.expired}
  - Pending: ${summary.pending}
  - Terminated: ${summary.terminated}

Total Contract Value: $${summary.total_value.toFixed(2)}

By Contract Type:
${Object.entries(summary.by_type)
  .map(([type, count]) => `  - ${type}: ${count} contracts ($${(summary.value_by_type[type] || 0).toFixed(2)})`)
  .join('\n')}

By Status:
${Object.entries(summary.by_status)
  .map(([status, count]) => `  - ${status}: ${count} contracts ($${(summary.value_by_status[status] || 0).toFixed(2)})`)
  .join('\n')}

Generated: ${summary.generated_at}
      `
    };
  }

  /**
   * Health check indicators
   */
  static async getHealthIndicators() {
    const summary = await this.generate();

    return {
      contracts_requiring_attention: summary.expiring_soon,
      expired_contracts: summary.expired,
      pending_contracts: summary.pending,
      total_value_at_risk: (summary.value_by_status['expired'] || 0) + (summary.value_by_status['expiring'] || 0),
      renewal_rate: summary.total > 0 ? (summary.active / summary.total * 100).toFixed(1) : '0',
      average_contract_value: summary.total > 0 ? (summary.total_value / summary.total).toFixed(2) : '0'
    };
  }
}
