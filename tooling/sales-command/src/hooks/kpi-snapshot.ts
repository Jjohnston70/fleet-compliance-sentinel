import { query } from '../data/db';
import { TimePeriod } from '../services/analytics-engine';

export type SnapshotPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export async function createKPISnapshot(date: string, period: SnapshotPeriod): Promise<void> {
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

  const metrics = [
    { name: 'TotalRevenue', query: 'COALESCE(SUM(sr.total_revenue), 0)' },
    { name: 'AvgDealSize', query: 'COALESCE(AVG(sr.total_revenue), 0)' },
    { name: 'UnitsSold', query: 'COALESCE(SUM(sr.quantity), 0)' },
    { name: 'GrossProfit', query: 'COALESCE(SUM(sr.gross_profit), 0)' },
    { name: 'RecordCount', query: 'COUNT(sr.id)' }
  ];

  for (const metric of metrics) {
    const metricResult = await query(
      `SELECT ${metric.query} as value FROM sales_records sr ${dateFilter}`,
      params
    );
    
    const currentValue = parseFloat(metricResult.rows[0].value) || 0;
    
    // Get previous value for comparison
    let previousValue = 0;
    const prevDate = calculatePreviousPeriod(date, period);
    if (prevDate) {
      let prevParams: any[] = [prevDate];
      let prevFilter = '';
      
      switch (period) {
        case 'daily':
          prevFilter = 'WHERE sr.date = $1';
          break;
        case 'weekly':
          prevFilter = `WHERE sr.date >= date_trunc('week', $1::date) AND sr.date < date_trunc('week', $1::date) + interval '7 days'`;
          break;
        case 'monthly':
          prevFilter = `WHERE sr.date >= date_trunc('month', $1::date) AND sr.date < date_trunc('month', $1::date) + interval '1 month'`;
          break;
        case 'quarterly':
          prevFilter = `WHERE sr.date >= date_trunc('quarter', $1::date) AND sr.date < date_trunc('quarter', $1::date) + interval '3 months'`;
          break;
      }
      
      const prevResult = await query(
        `SELECT ${metric.query} as value FROM sales_records sr ${prevFilter}`,
        prevParams
      );
      
      previousValue = parseFloat(prevResult.rows[0].value) || 0;
    }
    
    const changePct = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    await query(
      `INSERT INTO kpi_snapshots (date, period_type, metric_name, metric_value, previous_value, change_pct)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (date, period_type, metric_name) DO UPDATE SET 
       metric_value = $4, previous_value = $5, change_pct = $6`,
      [date, period, metric.name, currentValue, previousValue, changePct]
    );
  }
}

export async function dailyKPISnapshot(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await createKPISnapshot(today, 'daily');
}

export async function weeklyKPISnapshot(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await createKPISnapshot(today, 'weekly');
}

export async function monthlyKPISnapshot(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await createKPISnapshot(today, 'monthly');
}

export async function quarterlyKPISnapshot(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await createKPISnapshot(today, 'quarterly');
}

function calculatePreviousPeriod(date: string, period: SnapshotPeriod): string | null {
  const d = new Date(date);
  
  switch (period) {
    case 'daily':
      d.setDate(d.getDate() - 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() - 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() - 1);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() - 3);
      break;
  }
  
  return d.toISOString().split('T')[0];
}
