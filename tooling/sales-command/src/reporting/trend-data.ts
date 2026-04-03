import { getTrendData } from '../services/analytics-engine';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}

export async function getTrendChartData(
  dateFrom: string,
  dateTo: string,
  groupBy: 'daily' | 'weekly' | 'monthly' = 'monthly'
): Promise<ChartData> {
  const trends = await getTrendData(dateFrom, dateTo, groupBy);
  
  return {
    labels: trends.map(t => t.period),
    datasets: [
      {
        label: 'Revenue',
        data: trends.map(t => t.revenue),
        borderColor: '#0077cc',
        backgroundColor: '#0077cc20',
        fill: true
      },
      {
        label: 'Gross Profit',
        data: trends.map(t => t.grossProfit),
        borderColor: '#ff9900',
        backgroundColor: '#ff990020',
        fill: true
      }
    ]
  };
}
