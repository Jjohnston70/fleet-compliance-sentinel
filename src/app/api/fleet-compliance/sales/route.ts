export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
} from '@/lib/fleet-compliance-auth';
import { runSalesCommandTool } from '@/lib/sales-command-runtime';

type TrendGroupBy = 'daily' | 'weekly' | 'monthly';

interface KPIData {
  totalRevenue: number;
  avgDealSize: number;
  conversionRate: number;
  unitsSold: number;
  grossProfit: number;
  avgGrossMargin: number;
}

interface TrendPoint {
  period: string;
  revenue: number;
  unitsSold: number;
  grossProfit: number;
  avgDealSize: number;
}

interface PeriodComparison {
  period1: KPIData;
  period2: KPIData;
  changes: {
    revenueChange: number;
    dealSizeChange: number;
    conversionRateChange: number;
    profitChange: number;
  };
}

interface ProductMetric {
  productId: string;
  productName: string;
  totalRevenue: number;
  unitsSold: number;
}

interface ChannelMetric {
  channel: string;
  revenue: number;
  percentage: number;
}

interface ForecastMetric {
  periodStart: string;
  periodEnd: string;
  predictedRevenue: number;
  confidencePct?: number;
}

interface ToolResult<T> {
  status?: string;
  data?: T;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDateOrFallback(raw: string | null, fallback: Date): Date {
  if (!raw) return fallback;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed;
}

function clampGroupBy(raw: string | null): TrendGroupBy {
  if (raw === 'daily' || raw === 'weekly' || raw === 'monthly') return raw;
  return 'monthly';
}

function numberOrZero(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function positiveIntOrDefault(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded <= 0) return fallback;
  return rounded;
}

function deriveDealsClosed(kpi: KPIData): number {
  if (!kpi.avgDealSize || kpi.avgDealSize <= 0) return 0;
  return Math.round(kpi.totalRevenue / kpi.avgDealSize);
}

function previousRange(dateFrom: Date, dateTo: Date): { from: string; to: string } {
  const durationDays = Math.max(1, Math.round((dateTo.getTime() - dateFrom.getTime()) / DAY_MS) + 1);
  const prevTo = new Date(dateFrom);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - (durationDays - 1));
  return { from: toIsoDate(prevFrom), to: toIsoDate(prevTo) };
}

function getCurrentAndPreviousMonthRanges(referenceDate: Date) {
  const currentStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const currentEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  const previousStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const previousEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
  return {
    currentStart: toIsoDate(currentStart),
    currentEnd: toIsoDate(currentEnd),
    previousStart: toIsoDate(previousStart),
    previousEnd: toIsoDate(previousEnd),
  };
}

function moduleSetupResponse(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes('Cannot find module')) return null;
  return NextResponse.json(
    {
      ok: false,
      error:
        'sales-command dist bundle is missing. Build it first: cd tooling/sales-command && npx tsc --outDir dist --rootDir src --module ESNext --target ES2020 --moduleResolution bundler --declaration false --noEmit false',
    },
    { status: 503 },
  );
}

export async function GET(req: NextRequest) {
  try {
    await requireFleetComplianceOrg(req);
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const defaultDateFrom = new Date(now);
  defaultDateFrom.setMonth(defaultDateFrom.getMonth() - 6);

  const dateFrom = parseDateOrFallback(req.nextUrl.searchParams.get('dateFrom'), defaultDateFrom);
  const dateTo = parseDateOrFallback(req.nextUrl.searchParams.get('dateTo'), now);
  const groupBy = clampGroupBy(req.nextUrl.searchParams.get('groupBy'));
  const monthsAhead = positiveIntOrDefault(req.nextUrl.searchParams.get('monthsAhead'), 1);
  const topLimit = Math.min(
    25,
    positiveIntOrDefault(req.nextUrl.searchParams.get('topLimit'), 10),
  );

  const fromIso = toIsoDate(dateFrom);
  const toIso = toIsoDate(dateTo);
  const prevRange = previousRange(dateFrom, dateTo);
  const monthRanges = getCurrentAndPreviousMonthRanges(dateTo);

  try {
    const [
      kpiResult,
      trendResult,
      forecastResult,
      comparisonResult,
      topProductsCurrentResult,
      topProductsPreviousResult,
      channelsResult,
    ] = await Promise.all([
      runSalesCommandTool<ToolResult<KPIData>>('get_kpi_summary', {
        period: 'monthly',
        date: toIso,
      }),
      runSalesCommandTool<ToolResult<TrendPoint[]>>('get_sales_trend', {
        date_from: fromIso,
        date_to: toIso,
        group_by: groupBy,
      }),
      runSalesCommandTool<ToolResult<ForecastMetric[]>>('forecast_revenue', {
        months_ahead: monthsAhead,
      }),
      runSalesCommandTool<ToolResult<PeriodComparison>>('compare_periods', {
        period1_start: monthRanges.previousStart,
        period1_end: monthRanges.previousEnd,
        period2_start: monthRanges.currentStart,
        period2_end: monthRanges.currentEnd,
      }),
      runSalesCommandTool<ToolResult<ProductMetric[]>>('get_top_products', {
        date_from: fromIso,
        date_to: toIso,
        limit: topLimit,
      }),
      runSalesCommandTool<ToolResult<ProductMetric[]>>('get_top_products', {
        date_from: prevRange.from,
        date_to: prevRange.to,
        limit: 100,
      }),
      runSalesCommandTool<ToolResult<ChannelMetric[]>>('get_channel_breakdown', {
        date_from: fromIso,
        date_to: toIso,
      }),
    ]);

    const kpi = kpiResult.data || {
      totalRevenue: 0,
      avgDealSize: 0,
      conversionRate: 0,
      unitsSold: 0,
      grossProfit: 0,
      avgGrossMargin: 0,
    };

    const trends = Array.isArray(trendResult.data) ? trendResult.data : [];
    const comparison = comparisonResult.data;
    const channels = Array.isArray(channelsResult.data) ? channelsResult.data : [];
    const forecasts = Array.isArray(forecastResult.data) ? forecastResult.data : [];
    const currentTopProducts = Array.isArray(topProductsCurrentResult.data)
      ? topProductsCurrentResult.data
      : [];
    const previousTopProducts = Array.isArray(topProductsPreviousResult.data)
      ? topProductsPreviousResult.data
      : [];

    const previousRevenueByProduct = new Map<string, number>();
    for (const product of previousTopProducts) {
      previousRevenueByProduct.set(
        product.productId || product.productName,
        numberOrZero(product.totalRevenue),
      );
    }

    const topProducts = currentTopProducts.map((product, index) => {
      const key = product.productId || product.productName;
      const previousRevenue = previousRevenueByProduct.get(key) || 0;
      const currentRevenue = numberOrZero(product.totalRevenue);
      const growthPct =
        previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      return {
        rank: index + 1,
        productId: product.productId,
        productName: product.productName,
        totalRevenue: currentRevenue,
        unitsSold: numberOrZero(product.unitsSold),
        growthPct,
      };
    });

    const nextForecast = forecasts[0] || null;
    const confidencePct = numberOrZero(nextForecast?.confidencePct || 70);
    const predictedRevenue = numberOrZero(nextForecast?.predictedRevenue || 0);
    const uncertaintyFactor = Math.max(0.05, (100 - confidencePct) / 200);
    const forecastLow = Math.max(0, predictedRevenue * (1 - uncertaintyFactor));
    const forecastHigh = predictedRevenue * (1 + uncertaintyFactor);

    return NextResponse.json({
      ok: true,
      dateRange: {
        dateFrom: fromIso,
        dateTo: toIso,
        groupBy,
      },
      kpis: {
        totalRevenue: numberOrZero(kpi.totalRevenue),
        avgDealSize: numberOrZero(kpi.avgDealSize),
        conversionRate: numberOrZero(kpi.conversionRate),
        dealsClosed: deriveDealsClosed(kpi),
        unitsSold: numberOrZero(kpi.unitsSold),
        grossProfit: numberOrZero(kpi.grossProfit),
        avgGrossMargin: numberOrZero(kpi.avgGrossMargin),
      },
      trends,
      comparison: comparison || null,
      topProducts,
      channels,
      forecast: nextForecast
        ? {
            periodStart: nextForecast.periodStart,
            periodEnd: nextForecast.periodEnd,
            predictedRevenue,
            confidencePct,
            rangeLow: forecastLow,
            rangeHigh: forecastHigh,
          }
        : null,
    });
  } catch (error) {
    const setupResponse = moduleSetupResponse(error);
    if (setupResponse) return setupResponse;

    console.error('[sales-dashboard-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load sales dashboard' }, { status: 500 });
  }
}
