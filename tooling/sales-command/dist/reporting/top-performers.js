import { getTopProducts, getChannelBreakdown } from '../services/analytics-engine';
export async function getTopProductsByRevenue(dateFrom, dateTo, limit = 10) {
    const products = await getTopProducts(dateFrom, dateTo, limit);
    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    return products.map((p, index) => ({
        rank: index + 1,
        name: p.productName,
        revenue: p.totalRevenue,
        percentage: totalRevenue > 0 ? (p.totalRevenue / totalRevenue) * 100 : 0
    }));
}
export async function getTopChannels(dateFrom, dateTo) {
    const channels = await getChannelBreakdown(dateFrom, dateTo);
    return channels.map((c, index) => ({
        rank: index + 1,
        name: c.channel,
        revenue: c.revenue,
        percentage: c.percentage
    }));
}
