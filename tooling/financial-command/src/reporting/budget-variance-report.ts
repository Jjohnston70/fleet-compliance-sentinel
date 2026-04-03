import { BudgetService, BudgetVariance } from '../services/budget-service.js';

export interface VarianceReport {
  period: {
    startMonth: string;
    endMonth: string;
  };
  variances: BudgetVariance[];
  summary: {
    totalPlanned: number;
    totalActual: number;
    totalVariance: number;
    averageVariancePercent: number;
    categoriesUnderBudget: number;
    categoriesOverBudget: number;
  };
}

export class BudgetVarianceReport {
  constructor(private budgetService: BudgetService) {}

  async generateMonthlyReport(month: string): Promise<VarianceReport> {
    const variances = await this.budgetService.getMonthlyVariances(month);

    const totalPlanned = variances.reduce((sum, v) => sum + v.planned, 0);
    const totalActual = variances.reduce((sum, v) => sum + v.actual, 0);
    const totalVariance = totalPlanned - totalActual;

    const avgVariancePercent =
      variances.length > 0
        ? variances.reduce((sum, v) => sum + v.variancePercent, 0) / variances.length
        : 0;

    const categoriesUnderBudget = variances.filter(v => v.variance > 0).length;
    const categoriesOverBudget = variances.filter(v => v.variance < 0).length;

    return {
      period: {
        startMonth: month,
        endMonth: month,
      },
      variances,
      summary: {
        totalPlanned,
        totalActual,
        totalVariance,
        averageVariancePercent: avgVariancePercent,
        categoriesUnderBudget,
        categoriesOverBudget,
      },
    };
  }

  async generateQuarterlyReport(year: number, quarter: 1 | 2 | 3 | 4): Promise<VarianceReport> {
    const startMonth = (quarter - 1) * 3 + 1;
    const months = [
      `${year}-${String(startMonth).padStart(2, '0')}`,
      `${year}-${String(startMonth + 1).padStart(2, '0')}`,
      `${year}-${String(startMonth + 2).padStart(2, '0')}`,
    ];

    const allVariances: BudgetVariance[] = [];
    for (const month of months) {
      const monthlyVariances = await this.budgetService.getMonthlyVariances(month);
      allVariances.push(...monthlyVariances);
    }

    const totalPlanned = allVariances.reduce((sum, v) => sum + v.planned, 0);
    const totalActual = allVariances.reduce((sum, v) => sum + v.actual, 0);
    const totalVariance = totalPlanned - totalActual;

    const avgVariancePercent =
      allVariances.length > 0
        ? allVariances.reduce((sum, v) => sum + v.variancePercent, 0) / allVariances.length
        : 0;

    const categoriesUnderBudget = allVariances.filter(v => v.variance > 0).length;
    const categoriesOverBudget = allVariances.filter(v => v.variance < 0).length;

    return {
      period: {
        startMonth: months[0],
        endMonth: months[2],
      },
      variances: allVariances,
      summary: {
        totalPlanned,
        totalActual,
        totalVariance,
        averageVariancePercent: avgVariancePercent,
        categoriesUnderBudget,
        categoriesOverBudget,
      },
    };
  }
}
