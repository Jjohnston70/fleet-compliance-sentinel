import { getTopProducts, getChannelBreakdown } from '../services/analytics-engine';

export interface TopPerformer {
  rank: number;
  name: string;
  revenue: number;
  percentage: number;
}

export async function getTopProductsByRevenue(
  dateFrom: string,
  dateTo: string,
  limit: number = 10
): Promise<TopPerformer[]> {
  const products = await getTopProducts(dateFrom, dateTo, limit);
  
  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  
  return products.map((p, index) => ({
    rank: index + 1,
    name: p.productName,
    revenue: p.totalRevenue,
    percentage: totalRevenue > 0 ? (p.totalRevenue / totalRevenue) * 100 : 0
  }));
}

export async function getTopChannels(
  dateFrom: string,
  dateTo: string
): Promise<TopPerformer[]> {
  const channels = await getChannelBreakdown(dateFrom, dateTo);
  
  return channels.map((c, index) => ({
    rank: index + 1,
    name: c.channel,
    revenue: c.revenue,
    percentage: c.percentage
  }));
}
