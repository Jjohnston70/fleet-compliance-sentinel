/**
 * Expiration Calendar Reporting
 * Contracts ending in next 90 days, grouped by month
 */

import { ContractService } from '../services/contract-service.js';

export interface ExpirationByMonth {
  month: string;
  year: number;
  contracts: Array<{
    id: string;
    title: string;
    party_name: string;
    end_date: string;
    days_until: number;
    value: number;
    auto_renew: boolean;
  }>;
  count: number;
  total_value: number;
}

export class ExpirationCalendar {
  /**
   * Get expiration calendar for next 90 days
   */
  static async generate90Days() {
    const expiringContracts = await ContractService.getExpiringWithin(90);
    return this.groupByMonth(expiringContracts);
  }

  /**
   * Get expiration calendar for next 6 months
   */
  static async generate6Months() {
    const expiringContracts = await ContractService.getExpiringWithin(180);
    return this.groupByMonth(expiringContracts);
  }

  /**
   * Get expiration calendar for next 12 months
   */
  static async generate12Months() {
    const expiringContracts = await ContractService.getExpiringWithin(365);
    return this.groupByMonth(expiringContracts);
  }

  /**
   * Group contracts by expiration month
   */
  private static async groupByMonth(contracts: any[]): Promise<ExpirationByMonth[]> {
    const grouped: Record<string, ExpirationByMonth> = {};
    const now = new Date();

    // Fetch party information for each contract
    const { PartyService } = await import('../services/party-service.js');

    for (const contract of contracts) {
      const endDate = new Date(contract.end_date);
      const monthKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthName,
          year: endDate.getFullYear(),
          contracts: [],
          count: 0,
          total_value: 0
        };
      }

      const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      try {
        const party = await PartyService.getById(contract.party_id);
        grouped[monthKey].contracts.push({
          id: contract.id,
          title: contract.title,
          party_name: party.name,
          end_date: contract.end_date.toISOString().split('T')[0],
          days_until: daysUntil,
          value: contract.value || 0,
          auto_renew: contract.auto_renew
        });
      } catch (e) {
        grouped[monthKey].contracts.push({
          id: contract.id,
          title: contract.title,
          party_name: 'Unknown',
          end_date: contract.end_date.toISOString().split('T')[0],
          days_until: daysUntil,
          value: contract.value || 0,
          auto_renew: contract.auto_renew
        });
      }

      grouped[monthKey].count++;
      grouped[monthKey].total_value += contract.value || 0;
    }

    // Sort contracts within each month by expiration date
    Object.values(grouped).forEach(month => {
      month.contracts.sort((a, b) => a.days_until - b.days_until);
    });

    // Return sorted by month
    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(`${a.year}-${String(a.month.split(' ')[1]).padStart(2, '0')}`);
      const dateB = new Date(`${b.year}-${String(b.month.split(' ')[1]).padStart(2, '0')}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Get summary of upcoming expirations
   */
  static async getSummary() {
    const calendar90 = await this.generate90Days();
    const calendar365 = await this.generate12Months();

    const next30 = await ContractService.getExpiringWithin(30);
    const next60 = await ContractService.getExpiringWithin(60);
    const next90 = await ContractService.getExpiringWithin(90);
    const next365 = await ContractService.getExpiringWithin(365);

    return {
      next_30_days: {
        count: next30.length,
        value: next30.reduce((sum, c) => sum + (c.value || 0), 0)
      },
      next_60_days: {
        count: next60.length,
        value: next60.reduce((sum, c) => sum + (c.value || 0), 0)
      },
      next_90_days: {
        count: next90.length,
        value: next90.reduce((sum, c) => sum + (c.value || 0), 0)
      },
      next_365_days: {
        count: next365.length,
        value: next365.reduce((sum, c) => sum + (c.value || 0), 0)
      },
      calendar_90_days: calendar90,
      calendar_365_days: calendar365.slice(0, 12),
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Get contracts expiring on specific date
   */
  static async getExpiringOn(date: Date) {
    const allContracts = await ContractService.list({ status: 'active' });
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return allContracts.filter(c => {
      const endDate = new Date(c.end_date);
      return endDate >= startOfDay && endDate <= endOfDay;
    });
  }

  /**
   * Get contracts expiring in specific month
   */
  static async getExpiringInMonth(year: number, month: number) {
    const allContracts = await ContractService.list({ status: 'active' });
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    return allContracts.filter(c => {
      const endDate = new Date(c.end_date);
      return endDate >= monthStart && endDate <= monthEnd;
    });
  }
}
