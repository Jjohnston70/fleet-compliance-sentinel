import { Transaction, TaxItem, TaxItemSchema } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';
import { getTaxCodeByCode, getTaxCodesBySchedule } from '../config/tax-codes.js';

export interface TaxSummary {
  year: number;
  entity: string;
  grossIncome: number; // cents
  totalDeductions: number; // cents
  scheduleC: Record<string, number>;
  scheduleSE: number;
  scheduleA: Record<string, number>;
  estimatedTaxLiability: number; // cents
}

export class TaxService {
  constructor(private repo: IRepository) {}

  async getTaxSummary(year: number, entity: string): Promise<TaxSummary> {
    const taxItems = await this.repo.getTaxItemsByYear(year, entity);
    
    const scheduleC: Record<string, number> = {};
    const scheduleA: Record<string, number> = {};
    let scheduleSEAmount = 0;
    let grossIncome = 0;

    for (const item of taxItems) {
      if (item.schedule === 'C') {
        scheduleC[item.lineNumber] = (scheduleC[item.lineNumber] ?? 0) + item.deductibleAmount;
        grossIncome += item.deductibleAmount;
      } else if (item.schedule === 'SE') {
        scheduleSEAmount += item.amount;
      } else if (item.schedule === 'A') {
        scheduleA[item.lineNumber] = (scheduleA[item.lineNumber] ?? 0) + item.deductibleAmount;
      }
    }

    const totalDeductions = Object.values(scheduleC).reduce((a, b) => a + b, 0) +
                           Object.values(scheduleA).reduce((a, b) => a + b, 0);

    const estimatedTaxLiability = this.calculateTaxLiability(grossIncome, totalDeductions, scheduleSEAmount);

    return {
      year,
      entity,
      grossIncome,
      totalDeductions,
      scheduleC,
      scheduleSE: scheduleSEAmount,
      scheduleA,
      estimatedTaxLiability,
    };
  }

  private calculateTaxLiability(grossIncome: number, deductions: number, seTax: number): number {
    // Simplified federal tax calculation (not comprehensive)
    const taxableIncome = Math.max(0, grossIncome - deductions);
    
    // 2024 tax brackets (simplified for example)
    let federalTax = 0;
    if (taxableIncome <= 11600 * 100) {
      federalTax = Math.floor(taxableIncome * 0.10);
    } else if (taxableIncome <= 47150 * 100) {
      federalTax = Math.floor(1160 * 100 + (taxableIncome - 11600 * 100) * 0.12);
    } else {
      federalTax = Math.floor(5426 * 100 + (taxableIncome - 47150 * 100) * 0.22);
    }

    // Self-employment tax: 15.3% of net earnings (92.35%)
    const seBase = Math.floor(grossIncome * 0.9235);
    const seTaxCalculated = Math.floor(seBase * 0.153);

    return federalTax + seTaxCalculated;
  }

  async recordTaxItem(item: Omit<TaxItem, 'id'>): Promise<TaxItem> {
    const taxItem = TaxItemSchema.parse(item);
    return this.repo.addTaxItem(taxItem);
  }

  async getDeductionsBySchedule(year: number, schedule: 'C' | 'SE' | 'A' | '1', entity?: string): Promise<TaxItem[]> {
    const items = await this.repo.getTaxItemsByYear(year, entity);
    return items.filter(i => i.schedule === schedule);
  }

  async calculateSEDeductibility(grossSEIncome: number): Promise<number> {
    // SE tax is partially deductible
    const seTax = Math.floor(grossSEIncome * 0.9235 * 0.153);
    return Math.floor(seTax / 2);
  }
}
