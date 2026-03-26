'use client';

import { useEffect, useState } from 'react';

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

type SpendResponse = {
  months: SpendSummary[];
  currentMonth: CategoryTotals;
  quarter: CategoryTotals;
  year: CategoryTotals;
};

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

const EMPTY_TOTALS: CategoryTotals = {
  maintenance: 0,
  permits: 0,
  fuel: 0,
  insurance: 0,
  other: 0,
  total: 0,
};

export default function SpendDashboardClient() {
  const [data, setData] = useState<SpendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    </>
  );
}
