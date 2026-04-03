import { TaxService, TaxSummary } from '../services/tax-service.js';

export interface TaxLineItem {
  schedule: string;
  lineNumber: string;
  description: string;
  amount: number; // cents
}

export interface DetailedTaxSummary extends TaxSummary {
  lineItems: TaxLineItem[];
}

export class TaxSummaryReport {
  constructor(private taxService: TaxService) {}

  async generateAnnualTaxSummary(year: number, entity: string): Promise<DetailedTaxSummary> {
    const summary = await this.taxService.getTaxSummary(year, entity);

    const lineItems: TaxLineItem[] = [];

    // Add Schedule C items
    for (const [lineNumber, amount] of Object.entries(summary.scheduleC)) {
      lineItems.push({
        schedule: 'C',
        lineNumber,
        description: `Schedule C Line ${lineNumber}`,
        amount,
      });
    }

    // Add Schedule A items
    for (const [lineNumber, amount] of Object.entries(summary.scheduleA)) {
      lineItems.push({
        schedule: 'A',
        lineNumber,
        description: `Schedule A Line ${lineNumber}`,
        amount,
      });
    }

    // Add SE tax
    if (summary.scheduleSE > 0) {
      lineItems.push({
        schedule: 'SE',
        lineNumber: '15',
        description: 'Self-Employment Tax',
        amount: summary.scheduleSE,
      });
    }

    return {
      ...summary,
      lineItems,
    };
  }

  async generateQuarterlyEstimate(year: number, entity: string, quarter: 1 | 2 | 3 | 4): Promise<number> {
    // Simplified: calculate annual tax and divide by 4
    const summary = await this.taxService.getTaxSummary(year, entity);
    return Math.floor(summary.estimatedTaxLiability / 4);
  }
}
