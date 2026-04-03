'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TrendGroupBy = 'daily' | 'weekly' | 'monthly';

interface KPIData {
  totalRevenue: number;
  avgDealSize: number;
  conversionRate: number;
  dealsClosed: number;
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

interface ComparisonData {
  period1: {
    totalRevenue: number;
    avgDealSize: number;
    conversionRate: number;
    grossProfit: number;
  };
  period2: {
    totalRevenue: number;
    avgDealSize: number;
    conversionRate: number;
    grossProfit: number;
  };
  changes: {
    revenueChange: number;
    dealSizeChange: number;
    conversionRateChange: number;
    profitChange: number;
  };
}

interface TopProduct {
  rank: number;
  productId: string;
  productName: string;
  totalRevenue: number;
  unitsSold: number;
  growthPct: number;
}

interface ChannelMetric {
  channel: string;
  revenue: number;
  percentage: number;
}

interface ForecastData {
  periodStart: string;
  periodEnd: string;
  predictedRevenue: number;
  confidencePct: number;
  rangeLow: number;
  rangeHigh: number;
}

interface SalesDashboardResponse {
  ok: boolean;
  dateRange: {
    dateFrom: string;
    dateTo: string;
    groupBy: TrendGroupBy;
  };
  kpis: KPIData;
  trends: TrendPoint[];
  comparison: ComparisonData | null;
  topProducts: TopProduct[];
  channels: ChannelMetric[];
  forecast: ForecastData | null;
  error?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const channelColors = ['#0f766e', '#2563eb', '#ca8a04', '#9333ea', '#dc2626', '#0891b2'];

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatUsd(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number): string {
  const parsed = Number.isFinite(value) ? value : 0;
  return `${parsed.toFixed(1)}%`;
}

function formatDateLabel(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function percentColor(value: number): string {
  if (value > 0) return '#16a34a';
  if (value < 0) return '#dc2626';
  return '#64748b';
}

export default function SalesDashboardPage() {
  const now = new Date();
  const defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 6);

  const [groupBy, setGroupBy] = useState<TrendGroupBy>('monthly');
  const [dateFrom, setDateFrom] = useState(toIsoDate(defaultFrom));
  const [dateTo, setDateTo] = useState(toIsoDate(now));
  const [data, setData] = useState<SalesDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams({
        dateFrom,
        dateTo,
        groupBy,
      });

      const response = await fetch(`/api/fleet-compliance/sales?${query.toString()}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as SalesDashboardResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Failed to load dashboard');
      }
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, groupBy]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const comparisonBars = useMemo(() => {
    if (!data?.comparison) return [];
    return [
      {
        metric: 'Revenue',
        previous: data.comparison.period1.totalRevenue,
        current: data.comparison.period2.totalRevenue,
      },
      {
        metric: 'Avg Deal',
        previous: data.comparison.period1.avgDealSize,
        current: data.comparison.period2.avgDealSize,
      },
      {
        metric: 'Profit',
        previous: data.comparison.period1.grossProfit,
        current: data.comparison.period2.grossProfit,
      },
    ];
  }, [data]);

  async function handleImport() {
    if (!csvFile) {
      setImportMessage('Select a CSV file before importing.');
      return;
    }

    setImporting(true);
    setImportMessage('');
    try {
      const formData = new FormData();
      formData.set('file', csvFile);
      formData.set('hasHeader', 'true');

      const response = await fetch('/api/fleet-compliance/sales/import', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as {
        ok: boolean;
        rowsProcessed: number;
        rowsInserted: number;
        errors?: string[];
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        const firstError = payload.errors?.[0];
        throw new Error(firstError || payload.error || 'Import failed');
      }

      setImportMessage(
        `Import complete: ${payload.rowsInserted} inserted of ${payload.rowsProcessed} processed.`,
      );
      setCsvFile(null);
      await fetchDashboard();
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Finance</p>
            <h1>Sales Analytics</h1>
            <p className="fleet-compliance-subcopy">
              Track trend lines, period comparisons, top products, channel mix, and forecasted revenue.
            </p>
          </div>
        </div>

        <div className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
          <h3>Dashboard Filters</h3>
          <div
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              alignItems: 'end',
            }}
          >
            <label className="fleet-compliance-field-stack">
              <span>Date From</span>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Date To</span>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Trend Grouping</span>
              <select
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value as TrendGroupBy)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <button className="btn-primary" onClick={() => void fetchDashboard()} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
          <h3>CSV Import</h3>
          <p className="fleet-compliance-table-note" style={{ marginBottom: '0.75rem' }}>
            Import historical sales records to populate trends, rankings, and forecasts.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
            />
            <button className="btn-secondary" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import CSV'}
            </button>
            {csvFile ? (
              <span className="fleet-compliance-table-note">Selected: {csvFile.name}</span>
            ) : null}
          </div>
          {importMessage ? (
            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>{importMessage}</p>
          ) : null}
        </div>

        {error ? (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        ) : data ? (
          <>
            <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Total Revenue</p>
                <p className="fleet-compliance-stat-value">{formatUsd(data.kpis.totalRevenue)}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Avg Deal Size</p>
                <p className="fleet-compliance-stat-value">{formatUsd(data.kpis.avgDealSize)}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Conversion Rate</p>
                <p className="fleet-compliance-stat-value">{formatPercent(data.kpis.conversionRate)}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Deals Closed</p>
                <p className="fleet-compliance-stat-value">{numberFormatter.format(data.kpis.dealsClosed)}</p>
              </article>
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              }}
            >
              <article className="fleet-compliance-list-card">
                <h3>Sales Trend</h3>
                {data.trends.length === 0 ? (
                  <p className="fleet-compliance-table-note">No trend data yet.</p>
                ) : (
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <LineChart data={data.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tickFormatter={formatDateLabel} />
                        <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString('en-US')}`} />
                        <Tooltip
                          formatter={(value: number, name: string) =>
                            name === 'unitsSold'
                              ? [numberFormatter.format(value), 'Units Sold']
                              : [formatUsd(value), name === 'grossProfit' ? 'Gross Profit' : 'Revenue']
                          }
                          labelFormatter={(value: string) => formatDateLabel(value)}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                        <Line
                          type="monotone"
                          dataKey="grossProfit"
                          stroke="#0f766e"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              <article className="fleet-compliance-list-card">
                <h3>Forecast</h3>
                {data.forecast ? (
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    <div>
                      <p className="fleet-compliance-stat-label">Projected Revenue</p>
                      <p className="fleet-compliance-stat-value">{formatUsd(data.forecast.predictedRevenue)}</p>
                    </div>
                    <div>
                      <p className="fleet-compliance-stat-label">Confidence Range</p>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--navy)' }}>
                        {formatUsd(data.forecast.rangeLow)} to {formatUsd(data.forecast.rangeHigh)}
                      </p>
                      <p className="fleet-compliance-table-note">
                        {formatDateLabel(data.forecast.periodStart)} - {formatDateLabel(data.forecast.periodEnd)} •{' '}
                        {formatPercent(data.forecast.confidencePct)} confidence
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="fleet-compliance-table-note">Not enough data to generate a forecast.</p>
                )}
              </article>
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              }}
            >
              <article className="fleet-compliance-list-card">
                <h3>Period Comparison (Current vs Previous)</h3>
                {comparisonBars.length === 0 ? (
                  <p className="fleet-compliance-table-note">No comparison data yet.</p>
                ) : (
                  <>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={comparisonBars}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString('en-US')}`} />
                          <Tooltip formatter={(value: number) => formatUsd(value)} />
                          <Legend />
                          <Bar dataKey="previous" fill="#94a3b8" name="Previous Period" />
                          <Bar dataKey="current" fill="#2563eb" name="Current Period" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {data.comparison ? (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '0.5rem 0.75rem',
                        }}
                      >
                        <span style={{ color: percentColor(data.comparison.changes.revenueChange) }}>
                          Revenue: {formatPercent(data.comparison.changes.revenueChange)}
                        </span>
                        <span style={{ color: percentColor(data.comparison.changes.dealSizeChange) }}>
                          Avg Deal: {formatPercent(data.comparison.changes.dealSizeChange)}
                        </span>
                        <span style={{ color: percentColor(data.comparison.changes.profitChange) }}>
                          Profit: {formatPercent(data.comparison.changes.profitChange)}
                        </span>
                      </div>
                    ) : null}
                  </>
                )}
              </article>

              <article className="fleet-compliance-list-card">
                <h3>Channel Breakdown</h3>
                {data.channels.length === 0 ? (
                  <p className="fleet-compliance-table-note">No channel data yet.</p>
                ) : (
                  <>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={data.channels}
                            dataKey="revenue"
                            nameKey="channel"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={2}
                          >
                            {data.channels.map((entry, index) => (
                              <Cell
                                key={`channel-${entry.channel}`}
                                fill={channelColors[index % channelColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatUsd(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      {data.channels.map((channel, index) => (
                        <div
                          key={channel.channel}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <span>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: channelColors[index % channelColors.length],
                                marginRight: 8,
                              }}
                            />
                            {channel.channel}
                          </span>
                          <span className="fleet-compliance-table-note">
                            {formatPercent(channel.percentage)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </article>
            </div>

            <article className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>Top Products</h3>
              {data.topProducts.length === 0 ? (
                <p className="fleet-compliance-table-note">No product performance data yet.</p>
              ) : (
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Product</th>
                        <th>Revenue</th>
                        <th>Units</th>
                        <th>Growth %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((product) => (
                        <tr key={`${product.productId}-${product.rank}`}>
                          <td>{product.rank}</td>
                          <td>{product.productName}</td>
                          <td>{formatUsd(product.totalRevenue)}</td>
                          <td>{numberFormatter.format(product.unitsSold)}</td>
                          <td style={{ color: percentColor(product.growthPct) }}>
                            {formatPercent(product.growthPct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </>
        ) : null}
      </section>
    </main>
  );
}
