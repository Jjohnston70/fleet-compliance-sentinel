import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getKPISummary, getTrendData, comparePeriods, getTopProducts } from '../src/services/analytics-engine';
// Mock the database query
vi.mock('../src/data/db', () => ({
    query: vi.fn()
}));
import { query } from '../src/data/db';
describe('Analytics Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('getKPISummary', () => {
        it('should calculate KPI metrics for a period', async () => {
            query.mockResolvedValueOnce({
                rows: [{
                        total_revenue: '50000',
                        avg_deal_size: '5000',
                        total_records: '10',
                        units_sold: '100',
                        gross_profit: '15000'
                    }]
            });
            const kpi = await getKPISummary('monthly', '2023-12-31');
            expect(kpi.totalRevenue).toBe(50000);
            expect(kpi.avgDealSize).toBe(5000);
            expect(kpi.unitsSold).toBe(100);
            expect(kpi.grossProfit).toBe(15000);
        });
        it('should handle missing data gracefully', async () => {
            query.mockResolvedValueOnce({
                rows: [{
                        total_revenue: null,
                        avg_deal_size: null,
                        total_records: '0',
                        units_sold: null,
                        gross_profit: null
                    }]
            });
            const kpi = await getKPISummary('daily');
            expect(kpi.totalRevenue).toBe(0);
            expect(kpi.avgDealSize).toBe(0);
            expect(kpi.unitsSold).toBe(0);
        });
        it('should calculate gross margin percentage', async () => {
            query.mockResolvedValueOnce({
                rows: [{
                        total_revenue: '100000',
                        avg_deal_size: '10000',
                        total_records: '10',
                        units_sold: '100',
                        gross_profit: '30000'
                    }]
            });
            const kpi = await getKPISummary('monthly');
            expect(kpi.avgGrossMargin).toBe(30);
        });
    });
    describe('getTrendData', () => {
        it('should return trend data points for a date range', async () => {
            query.mockResolvedValueOnce({
                rows: [
                    {
                        period: new Date('2023-01-01'),
                        revenue: '50000',
                        units_sold: '100',
                        gross_profit: '15000',
                        avg_deal_size: '5000'
                    },
                    {
                        period: new Date('2023-02-01'),
                        revenue: '55000',
                        units_sold: '110',
                        gross_profit: '16500',
                        avg_deal_size: '5500'
                    }
                ]
            });
            const trends = await getTrendData('2023-01-01', '2023-02-28', 'monthly');
            expect(trends.length).toBe(2);
            expect(trends[0].revenue).toBe(50000);
            expect(trends[1].revenue).toBe(55000);
        });
    });
    describe('comparePeriods', () => {
        it('should calculate period-over-period changes', async () => {
            query
                .mockResolvedValueOnce({
                rows: [{
                        total_revenue: '50000',
                        avg_deal_size: '5000',
                        total_records: '10',
                        units_sold: '100',
                        gross_profit: '15000'
                    }]
            })
                .mockResolvedValueOnce({
                rows: [{
                        total_revenue: '55000',
                        avg_deal_size: '5500',
                        total_records: '11',
                        units_sold: '110',
                        gross_profit: '16500'
                    }]
            });
            const comparison = await comparePeriods('2023-01-01', '2023-01-31', '2023-02-01', '2023-02-28');
            expect(comparison.changes.revenueChange).toBe(10);
            expect(comparison.period1.totalRevenue).toBe(50000);
            expect(comparison.period2.totalRevenue).toBe(55000);
        });
    });
    describe('getTopProducts', () => {
        it('should return top products by revenue', async () => {
            query.mockResolvedValueOnce({
                rows: [
                    {
                        product_id: '123',
                        product_name: 'Product A',
                        total_revenue: '100000',
                        units_sold: '500'
                    },
                    {
                        product_id: '456',
                        product_name: 'Product B',
                        total_revenue: '80000',
                        units_sold: '400'
                    }
                ]
            });
            const products = await getTopProducts('2023-01-01', '2023-12-31', 10);
            expect(products.length).toBe(2);
            expect(products[0].productName).toBe('Product A');
            expect(products[0].totalRevenue).toBe(100000);
        });
    });
});
