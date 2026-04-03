import { query } from '../data/db';
export async function generateMovingAverageForecast(productId, monthsAhead = 3, windowSize = 3) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (productId) {
        whereClause += ' AND sr.product_id = $1';
        params.push(productId);
    }
    const historicalResult = await query(`SELECT
      date_trunc('month', sr.date)::date as month,
      COALESCE(SUM(sr.total_revenue), 0) as monthly_revenue
    FROM sales_records sr
    ${whereClause}
    GROUP BY date_trunc('month', sr.date)
    ORDER BY month DESC
    LIMIT ${windowSize}`, params);
    const monthlyData = historicalResult.rows
        .reverse()
        .map((row) => ({
        month: row.month,
        revenue: parseFloat(row.monthly_revenue)
    }));
    if (monthlyData.length === 0) {
        return [];
    }
    const avgRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0) / monthlyData.length;
    const forecasts = [];
    const lastMonth = new Date(monthlyData[monthlyData.length - 1].month);
    for (let i = 1; i <= monthsAhead; i++) {
        const forecastStart = new Date(lastMonth);
        forecastStart.setMonth(forecastStart.getMonth() + i);
        forecastStart.setDate(1);
        const forecastEnd = new Date(forecastStart);
        forecastEnd.setMonth(forecastEnd.getMonth() + 1);
        forecastEnd.setDate(0);
        const forecast = {
            id: `forecast_${Date.now()}_${i}`,
            productId: productId || undefined,
            periodStart: forecastStart.toISOString().split('T')[0],
            periodEnd: forecastEnd.toISOString().split('T')[0],
            predictedRevenue: Math.round(avgRevenue * 100) / 100,
            confidencePct: 75 - (i * 5),
            modelVersion: 'ma_v1'
        };
        forecasts.push(forecast);
    }
    return forecasts;
}
export async function saveForecast(forecast) {
    await query(`INSERT INTO sales_forecasts 
    (product_id, period_start, period_end, predicted_revenue, confidence_pct, model_version)
    VALUES ($1, $2, $3, $4, $5, $6)`, [
        forecast.productId || null,
        forecast.periodStart,
        forecast.periodEnd,
        forecast.predictedRevenue,
        forecast.confidencePct || null,
        forecast.modelVersion || null
    ]);
}
export async function getForecast(productId, limit = 12) {
    let whereClause = '1=1';
    const params = [];
    if (productId) {
        whereClause = 'product_id = $1';
        params.push(productId);
    }
    const result = await query(`SELECT * FROM sales_forecasts WHERE ${whereClause} ORDER BY period_start DESC LIMIT $${params.length + 1}`, [...params, limit]);
    return result.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        periodStart: row.period_start,
        periodEnd: row.period_end,
        predictedRevenue: parseFloat(row.predicted_revenue),
        confidencePct: row.confidence_pct ? parseFloat(row.confidence_pct) : undefined,
        modelVersion: row.model_version
    }));
}
