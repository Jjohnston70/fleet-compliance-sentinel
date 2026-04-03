import { comparePeriods } from '../services/analytics-engine';

export interface ComparisonReport {
  period1: {
    label: string;
    revenue: number;
    dealSize: number;
    profit: number;
  };
  period2: {
    label: string;
    revenue: number;
    dealSize: number;
    profit: number;
  };
  changes: {
    revenueChangePercent: number;
    revenueChangeDollars: number;
    dealSizeChangePercent: number;
    profitChangePercent: number;
  };
}

export async function generatePeriodComparison(
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string,
  period1Label: string = 'Period 1',
  period2Label: string = 'Period 2'
): Promise<ComparisonReport> {
  const metrics = await comparePeriods(period1Start, period1End, period2Start, period2End);
  
  return {
    period1: {
      label: period1Label,
      revenue: metrics.period1.totalRevenue,
      dealSize: metrics.period1.avgDealSize,
      profit: metrics.period1.grossProfit
    },
    period2: {
      label: period2Label,
      revenue: metrics.period2.totalRevenue,
      dealSize: metrics.period2.avgDealSize,
      profit: metrics.period2.grossProfit
    },
    changes: {
      revenueChangePercent: metrics.changes.revenueChange,
      revenueChangeDollars: metrics.period2.totalRevenue - metrics.period1.totalRevenue,
      dealSizeChangePercent: metrics.changes.dealSizeChange,
      profitChangePercent: metrics.changes.profitChange
    }
  };
}
