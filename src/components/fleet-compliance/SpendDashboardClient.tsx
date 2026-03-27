'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CategoryTotals = {
  maintenance: number;
  permits: number;
  fuel: number;
  insurance: number;
  other: number;
  total: number;
};

type SpendSummary = {
  month: string;
  categories: CategoryTotals;
};

type CostBreakdown = {
  parts: number;
  labor: number;
  shopSupplies: number;
  tax: number;
  other: number;
  total: number;
};

type AssetSpend = {
  assetId: string;
  label: string;
  total: number;
  parts: number;
  labor: number;
  invoiceCount: number;
  lastServiceDate: string;
};

type SpendResponse = {
  months: SpendSummary[];
  currentMonth: CategoryTotals;
  quarter: CategoryTotals;
  year: CategoryTotals;
  costBreakdown: CostBreakdown;
  assetSpend: AssetSpend[];
};

type SortKey = 'assetId' | 'total' | 'parts' | 'labor' | 'invoiceCount' | 'lastServiceDate';

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDate(dateText: string): string {
  if (!dateText) return '—';
  const parsed = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return dateText;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const EMPTY_TOTALS: CategoryTotals = {
  maintenance: 0,
  permits: 0,
  fuel: 0,
  insurance: 0,
  other: 0,
  total: 0,
};

const EMPTY_BREAKDOWN: CostBreakdown = {
  parts: 0,
  labor: 0,
  shopSupplies: 0,
  tax: 0,
  other: 0,
  total: 0,
};

export default function SpendDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<SpendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/fleet-compliance/spend', {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = (await response.json()) as SpendResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? `Failed to load spend dashboard (${response.status})`);
        }

        if (!alive) return;
        setData(payload);
      } catch (loadError: unknown) {
        if (!alive) return;
        setError(String(loadError));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  function setSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(nextKey);
    setSortDir(nextKey === 'assetId' || nextKey === 'lastServiceDate' ? 'asc' : 'desc');
  }

  const sortedAssetSpend = useMemo(() => {
    if (!data?.assetSpend) return [];
    const rows = [...data.assetSpend];
    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'assetId') return dir * a.assetId.localeCompare(b.assetId);
      if (sortKey === 'lastServiceDate') return dir * a.lastServiceDate.localeCompare(b.lastServiceDate);
      return dir * ((a[sortKey] as number) - (b[sortKey] as number));
    });
    return rows;
  }, [data?.assetSpend, sortDir, sortKey]);

  if (loading) {
    return (
      <div className="fleet-compliance-empty-state">
        <h3>Loading spend dashboard…</h3>
        <p>Pulling invoices and maintenance costs for this organization.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fleet-compliance-empty-state">
        <h3>Could not load spend data</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fleet-compliance-empty-state">
        <h3>No spend data available</h3>
        <p>Import invoices or maintenance costs to populate this dashboard.</p>
      </div>
    );
  }

  const trendRows = data.months.slice(-6);
  const currentMonthTotals = data.currentMonth ?? EMPTY_TOTALS;
  const breakdown = data.costBreakdown ?? EMPTY_BREAKDOWN;

  return (
    <>
      <section className="fleet-compliance-stats">
        <article className="fleet-compliance-stat-card">
          <p className="fleet-compliance-stat-label">This Month</p>
          <p className="fleet-compliance-stat-value">{formatMoney(currentMonthTotals.total)}</p>
        </article>
        <article className="fleet-compliance-stat-card">
          <p className="fleet-compliance-stat-label">Last 90 Days</p>
          <p className="fleet-compliance-stat-value">{formatMoney(data.quarter.total)}</p>
        </article>
        <article className="fleet-compliance-stat-card">
          <p className="fleet-compliance-stat-label">Last 12 Months</p>
          <p className="fleet-compliance-stat-value">{formatMoney(data.year.total)}</p>
        </article>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Current Month</p>
            <h2>Category Breakdown</h2>
          </div>
        </div>
        <div className="fleet-compliance-import-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Maintenance</td><td>{formatMoney(currentMonthTotals.maintenance)}</td></tr>
              <tr><td>Permits</td><td>{formatMoney(currentMonthTotals.permits)}</td></tr>
              <tr><td>Fuel</td><td>{formatMoney(currentMonthTotals.fuel)}</td></tr>
              <tr><td>Insurance</td><td>{formatMoney(currentMonthTotals.insurance)}</td></tr>
              <tr><td>Other</td><td>{formatMoney(currentMonthTotals.other)}</td></tr>
              <tr><td>Total</td><td>{formatMoney(currentMonthTotals.total)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Monthly Trend</p>
            <h2>Last 6 Months</h2>
          </div>
        </div>
        <div className="fleet-compliance-table-wrap">
          <table className="fleet-compliance-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Maintenance</th>
                <th>Permits</th>
                <th>Fuel</th>
                <th>Insurance</th>
                <th>Other</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {trendRows.map((row) => (
                <tr key={row.month}>
                  <td>{formatMonth(row.month)}</td>
                  <td>{formatMoney(row.categories.maintenance)}</td>
                  <td>{formatMoney(row.categories.permits)}</td>
                  <td>{formatMoney(row.categories.fuel)}</td>
                  <td>{formatMoney(row.categories.insurance)}</td>
                  <td>{formatMoney(row.categories.other)}</td>
                  <td>{formatMoney(row.categories.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Current Month</p>
            <h2>Cost Breakdown</h2>
          </div>
        </div>
        <div className="fleet-compliance-import-table">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Parts</td><td>{formatMoney(breakdown.parts)}</td></tr>
              <tr><td>Labor</td><td>{formatMoney(breakdown.labor)}</td></tr>
              <tr><td>Shop Supplies</td><td>{formatMoney(breakdown.shopSupplies)}</td></tr>
              <tr><td>Tax</td><td>{formatMoney(breakdown.tax)}</td></tr>
              <tr><td>Other</td><td>{formatMoney(breakdown.other)}</td></tr>
              <tr><td>Total</td><td>{formatMoney(breakdown.total)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Asset Analysis</p>
            <h2>Spend by Asset</h2>
          </div>
        </div>
        {sortedAssetSpend.length === 0 ? (
          <div className="fleet-compliance-empty-state">
            <p>No asset-linked spend records available.</p>
          </div>
        ) : (
          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th><button type="button" onClick={() => setSort('assetId')} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>Asset</button></th>
                  <th><button type="button" onClick={() => setSort('total')} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>Total</button></th>
                  <th><button type="button" onClick={() => setSort('parts')} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>Parts</button></th>
                  <th><button type="button" onClick={() => setSort('labor')} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>Labor</button></th>
                  <th><button type="button" onClick={() => setSort('invoiceCount')} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>Invoices</button></th>
                  <th><button type="button" onClick={() => setSort('lastServiceDate')} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>Last Service</button></th>
                </tr>
              </thead>
              <tbody>
                {sortedAssetSpend.map((asset) => (
                  <tr
                    key={asset.assetId}
                    onClick={() => router.push(`/fleet-compliance/assets/${encodeURIComponent(asset.assetId)}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <strong>{asset.assetId}</strong>
                      <p className="fleet-compliance-table-note">{asset.label}</p>
                    </td>
                    <td>{formatMoney(asset.total)}</td>
                    <td>{formatMoney(asset.parts)}</td>
                    <td>{formatMoney(asset.labor)}</td>
                    <td>{asset.invoiceCount}</td>
                    <td>{formatDate(asset.lastServiceDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
