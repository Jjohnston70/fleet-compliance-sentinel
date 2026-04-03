import { query } from '../data/db';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface KPIData {
  totalRevenue: number;
  avgDealSize: number;
  conversionRate: number;
  periodOverPeriodChange: number;
  unitsSold: number;
  grossProfit: number;
  avgGrossMargin: number;
}

export interface TrendDataPoint {
  period: string;
  revenue: number;
  unitsSold: number;
  grossProfit: number;
  avgDealSize: number;
}

export interface ComparisonMetrics {
  period1: KPIData;
  period2: KPIData;
  changes: {
    revenueChange: number;
    dealSizeChange: number;
    conversionRateChange: number;
    profitChange: number;
  };
}

export async function getKPISummary(
  period: TimePeriod = 'monthly',
  endDate?: string
): Promise<KPIData> {
  const date = endDate || new Date().toISOString().split('T')[0];
  
  let dateFilter = '';
  const params: any[] = [date];
  
  switch (period) {
    case 'daily':
      dateFilter = 'WHERE sr.date = $1';
      break;
    case 'weekly':
      dateFilter = `WHERE sr.date >= date_trunc('week', $1::date) AND sr.date < date_trunc('week', $1::date) + interval '7 days'`;
      break;
    case 'monthly':
      dateFilter = `WHERE sr.date >= date_trunc('month', $1::date) AND sr.date < date_trunc('month', $1::date) + interval '1 month'`;
      break;
    case 'quarterly':
      dateFilter = `WHERE sr.date >= date_trunc('quarter', $1::date) AND sr.date < date_trunc('quarter', $1::date) + interval '3 months'`;
      break;
  }

  const result = await query(
    `
    SELECT
      COALESCE(SUM(sr.total_revenue), 0) as total_revenue,
      COALESCE(AVG(sr.total_revenue), 0) as avg_deal_size,
      COUNT(sr.id) as total_records,
      COALESCE(SUM(sr.quantity), 0) as units_sold,
      COALESCE(SUM(sr.gross_profit), 0) as gross_profit
    FROM sales_records sr
    ${dateFilter}
    `,
    params
  );

  const row = result.rows[0];
  const totalRevenue = parseFloat(row.total_revenue) || 0;
  const avgDealSize = parseFloat(row.avg_deal_size) || 0;
  const totalRecords = parseInt(row.total_records) || 0;
  const unitsSold = parseInt(row.units_sold) || 0;
  const grossProfit = parseFloat(row.gross_profit) || 0;
  
  return {
    totalRevenue,
    avgDealSize,
    conversionRate: totalRecords > 0 ? (totalRecords / (totalRecords + 10)) * 100 : 0,
    periodOverPeriodChange: 0,
    unitsSold,
    grossProfit,
    avgGrossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  };
}

export async function getTrendData(
  dateFrom: string,
  dateTo: string,
  groupBy: TimePeriod = 'daily'
): Promise<TrendDataPoint[]> {
  let dateGroup = '';
  
  switch (groupBy) {
    case 'daily':
      dateGroup = "DATE(sr.date)";
      break;
    case 'weekly':
      dateGroup = "date_trunc('week', sr.date)::date";
      break;
    case 'monthly':
      dateGroup = "date_trunc('month', sr.date)::date";
      break;
    case 'quarterly':
      dateGroup = "date_trunc('quarter', sr.date)::date";
      break;
  }

  const result = await query(
    `
    SELECT
      ${dateGroup} as period,
      COALESCE(SUM(sr.total_revenue), 0) as revenue,
      COALESCE(SUM(sr.quantity), 0) as units_sold,
      COALESCE(SUM(sr.gross_profit), 0) as gross_profit,
      COALESCE(AVG(sr.total_revenue), 0) as avg_deal_size
    FROM sales_records sr
    WHERE sr.date >= $1::date AND sr.date <= $2::date
    GROUP BY ${dateGroup}
    ORDER BY period ASC
    `,
    [dateFrom, dateTo]
  );

  return result.rows.map(row => ({
    period: row.period.toISOString().split('T')[0],
    revenue: parseFloat(row.revenue) || 0,
    unitsSold: parseInt(row.units_sold) || 0,
    grossProfit: parseFloat(row.gross_profit) || 0,
    avgDealSize: parseFloat(row.avg_deal_size) || 0
  }));
}

export async function comparePeriods(
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string
): Promise<ComparisonMetrics> {
  const [kpi1, kpi2] = await Promise.all([
    getKPISummary('monthly', period1End),
    getKPISummary('monthly', period2End)
  ]);

  const revenueChange = kpi1.totalRevenue > 0 
    ? ((kpi2.totalRevenue - kpi1.totalRevenue) / kpi1.totalRevenue) * 100 
    : 0;

  const dealSizeChange = kpi1.avgDealSize > 0
    ? ((kpi2.avgDealSize - kpi1.avgDealSize) / kpi1.avgDealSize) * 100
    : 0;

  const conversionRateChange = kpi1.conversionRate > 0
    ? ((kpi2.conversionRate - kpi1.conversionRate) / kpi1.conversionRate) * 100
    : 0;

  const profitChange = kpi1.grossProfit > 0
    ? ((kpi2.grossProfit - kpi1.grossProfit) / kpi1.grossProfit) * 100
    : 0;

  return {
    period1: kpi1,
    period2: kpi2,
    changes: {
      revenueChange,
      dealSizeChange,
      conversionRateChange,
      profitChange
    }
  };
}

export async function getTopProducts(
  dateFrom: string,
  dateTo: string,
  limit: number = 10
): Promise<Array<{ productId: string; productName: string; totalRevenue: number; unitsSold: number }>> {
  const result = await query(
    `
    SELECT
      p.id as product_id,
      p.name as product_name,
      COALESCE(SUM(sr.total_revenue), 0) as total_revenue,
      COALESCE(SUM(sr.quantity), 0) as units_sold
    FROM sales_records sr
    LEFT JOIN products p ON sr.product_id = p.id
    WHERE sr.date >= $1::date AND sr.date <= $2::date
    GROUP BY p.id, p.name
    ORDER BY total_revenue DESC
    LIMIT $3
    `,
    [dateFrom, dateTo, limit]
  );

  return result.rows.map(row => ({
    productId: row.product_id || 'unknown',
    productName: row.product_name || 'Unknown Product',
    totalRevenue: parseFloat(row.total_revenue) || 0,
    unitsSold: parseInt(row.units_sold) || 0
  }));
}

export async function getChannelBreakdown(
  dateFrom: string,
  dateTo: string
): Promise<Array<{ channel: string; revenue: number; percentage: number }>> {
  const result = await query(
    `
    SELECT
      sr.channel,
      COALESCE(SUM(sr.total_revenue), 0) as revenue
    FROM sales_records sr
    WHERE sr.date >= $1::date AND sr.date <= $2::date AND sr.channel IS NOT NULL
    GROUP BY sr.channel
    ORDER BY revenue DESC
    `,
    [dateFrom, dateTo]
  );

  const total = result.rows.reduce((sum, row) => sum + parseFloat(row.revenue), 0);

  return result.rows.map(row => ({
    channel: row.channel || 'Unknown',
    revenue: parseFloat(row.revenue) || 0,
    percentage: total > 0 ? (parseFloat(row.revenue) / total) * 100 : 0
  }));
}
