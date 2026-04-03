import { comparePeriods } from '../services/analytics-engine';
export async function generatePeriodComparison(period1Start, period1End, period2Start, period2End, period1Label = 'Period 1', period2Label = 'Period 2') {
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
