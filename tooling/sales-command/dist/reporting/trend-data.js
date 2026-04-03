import { getTrendData } from '../services/analytics-engine';
export async function getTrendChartData(dateFrom, dateTo, groupBy = 'monthly') {
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
