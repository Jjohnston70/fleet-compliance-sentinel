/**
 * Vendor Analysis Reporting
 * Total spend per party, contract count, avg duration, renewal rate
 */

import { PartyService } from '../services/party-service.js';
import { ContractService } from '../services/contract-service.js';

export interface VendorAnalysisResult {
  party_id: string;
  party_name: string;
  party_type: string;
  contract_count: number;
  total_spend: number;
  avg_contract_value: number;
  active_contracts: number;
  expired_contracts: number;
  pending_contracts: number;
  avg_duration_days: number;
  renewal_rate_percent: number;
  latest_contract_date?: string;
}

export class VendorAnalysis {
  /**
   * Analyze all vendors/parties
   */
  static async analyzeAll(): Promise<VendorAnalysisResult[]> {
    const parties = await PartyService.list();
    const results: VendorAnalysisResult[] = [];

    for (const party of parties) {
      const analysis = await this.analyzeParty(party.id);
      if (analysis) {
        results.push(analysis);
      }
    }

    // Sort by total spend descending
    results.sort((a, b) => b.total_spend - a.total_spend);
    return results;
  }

  /**
   * Analyze single party
   */
  static async analyzeParty(partyId: string): Promise<VendorAnalysisResult | null> {
    try {
      const party = await PartyService.getById(partyId);
      const contracts = await PartyService.getContracts(partyId);

      if (contracts.length === 0) {
        return null;
      }

      let totalSpend = 0;
      let activeContracts = 0;
      let expiredContracts = 0;
      let pendingContracts = 0;
      let totalDuration = 0;
      let latestDate = new Date(0);

      for (const contract of contracts) {
        totalSpend += contract.value || 0;

        if (contract.status === 'active') activeContracts++;
        else if (contract.status === 'expired') expiredContracts++;
        else if (contract.status === 'draft' || contract.status === 'pending_review') pendingContracts++;

        const duration = ContractService.getDurationDays(contract);
        totalDuration += duration;

        const createdDate = new Date(contract.created_at);
        if (createdDate > latestDate) {
          latestDate = createdDate;
        }
      }

      const avgDuration = Math.floor(totalDuration / contracts.length);
      const renewalRate = ((activeContracts + expiredContracts) / contracts.length) * 100;

      return {
        party_id: party.id,
        party_name: party.name,
        party_type: party.party_type,
        contract_count: contracts.length,
        total_spend: totalSpend,
        avg_contract_value: totalSpend / contracts.length,
        active_contracts: activeContracts,
        expired_contracts: expiredContracts,
        pending_contracts: pendingContracts,
        avg_duration_days: avgDuration,
        renewal_rate_percent: parseFloat(renewalRate.toFixed(1)),
        latest_contract_date: latestDate > new Date(0) ? latestDate.toISOString().split('T')[0] : undefined
      };
    } catch (error) {
      console.error(`Error analyzing party ${partyId}:`, error);
      return null;
    }
  }

  /**
   * Get top vendors by spend
   */
  static async getTopVendorsBySpend(limit: number = 10) {
    const all = await this.analyzeAll();
    return all.slice(0, limit);
  }

  /**
   * Get vendors by type
   */
  static async analyzeByType(partyType: string) {
    const all = await this.analyzeAll();
    return all.filter(v => v.party_type === partyType);
  }

  /**
   * Generate analysis report
   */
  static async generateReport() {
    const allAnalysis = await this.analyzeAll();
    const topVendors = allAnalysis.slice(0, 10);

    const totalSpend = allAnalysis.reduce((sum, v) => sum + v.total_spend, 0);
    const totalContracts = allAnalysis.reduce((sum, v) => sum + v.contract_count, 0);
    const avgSpendPerVendor = totalSpend / allAnalysis.length;

    const byType = allAnalysis.reduce((acc: any, v) => {
      if (!acc[v.party_type]) {
        acc[v.party_type] = {
          count: 0,
          spend: 0,
          vendors: 0
        };
      }
      acc[v.party_type].count += v.contract_count;
      acc[v.party_type].spend += v.total_spend;
      acc[v.party_type].vendors++;
      return acc;
    }, {});

    return {
      total_vendors: allAnalysis.length,
      total_contracts: totalContracts,
      total_spend: totalSpend,
      avg_spend_per_vendor: avgSpendPerVendor,
      top_vendors: topVendors,
      by_type: byType,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Find vendor concentration risk
   */
  static async getConcentrationAnalysis() {
    const allAnalysis = await this.analyzeAll();
    const totalSpend = allAnalysis.reduce((sum, v) => sum + v.total_spend, 0);

    const concentration = allAnalysis.map(v => ({
      party_name: v.party_name,
      spend: v.total_spend,
      percentage: totalSpend > 0 ? (v.total_spend / totalSpend * 100).toFixed(2) : '0'
    }));

    concentration.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    // Calculate concentration ratio
    const top3 = concentration.slice(0, 3).reduce((sum, v) => sum + parseFloat(v.percentage), 0);
    const top5 = concentration.slice(0, 5).reduce((sum, v) => sum + parseFloat(v.percentage), 0);

    return {
      concentration_distribution: concentration,
      top_3_percent: parseFloat(top3.toFixed(2)),
      top_5_percent: parseFloat(top5.toFixed(2)),
      herfindahl_index: this.calculateHerfindahlIndex(allAnalysis, totalSpend),
      risk_level: this.assessRiskLevel(top3)
    };
  }

  /**
   * Calculate Herfindahl index for market concentration
   */
  private static calculateHerfindahlIndex(vendors: VendorAnalysisResult[], totalSpend: number): number {
    let sum = 0;
    for (const vendor of vendors) {
      const marketShare = (vendor.total_spend / totalSpend) * 100;
      sum += marketShare * marketShare;
    }
    return parseFloat(sum.toFixed(2));
  }

  /**
   * Assess risk level based on concentration
   */
  private static assessRiskLevel(top3Percent: number): string {
    if (top3Percent > 70) return 'HIGH';
    if (top3Percent > 50) return 'MEDIUM';
    return 'LOW';
  }
}
