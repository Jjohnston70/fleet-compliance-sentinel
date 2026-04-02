'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface HazmatTrainingRow {
  id: string;
  employee_id: string;
  employee_name: string;
  module_code: string;
  module_title: string;
  module_category: string;
  cfr_reference: string | null;
  phmsa_equivalent: string | null;
  status: string;
  credit_pathway: string | null;
  completion_date: string;
  next_due_date: string;
  days_until_due: number | null;
  certificate_status: 'available' | 'missing';
  certificate_url: string | null;
}

interface HazmatSummary {
  total_rows: number;
  complete: number;
  delinquent: number;
  at_risk: number;
  missing_certificates: number;
}

interface HazmatReportResponse {
  summary: HazmatSummary;
  rows: HazmatTrainingRow[];
}

interface HazmatTrainingReportsProps {
  orgId: string;
}

interface FiltersState {
  employee_id: string;
  module_code: string;
  status: string;
  credit_pathway: string;
  start_date: string;
  end_date: string;
}

const INITIAL_FILTERS: FiltersState = {
  employee_id: '',
  module_code: '',
  status: '',
  credit_pathway: '',
  start_date: '',
  end_date: '',
};

export default function HazmatTrainingReports({ orgId }: HazmatTrainingReportsProps) {
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [rows, setRows] = useState<HazmatTrainingRow[]>([]);
  const [summary, setSummary] = useState<HazmatSummary>({
    total_rows: 0,
    complete: 0,
    delinquent: 0,
    at_risk: 0,
    missing_certificates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploadingRecordId, setUploadingRecordId] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.employee_id.trim()) params.set('employee_id', filters.employee_id.trim());
    if (filters.module_code.trim()) params.set('module_code', filters.module_code.trim().toUpperCase());
    if (filters.status.trim()) params.set('status', filters.status.trim().toLowerCase());
    if (filters.credit_pathway.trim()) params.set('credit_pathway', filters.credit_pathway.trim());
    if (filters.start_date.trim()) params.set('start_date', filters.start_date.trim());
    if (filters.end_date.trim()) params.set('end_date', filters.end_date.trim());
    return params.toString();
  }, [filters]);

  const fetchReport = useCallback(async (isFilterSubmit = false) => {
    if (isFilterSubmit) setSubmitting(true);
    else setLoading(true);
    setError('');
    setNotice('');

    try {
      const base = `/api/v1/hazmat-training/org/${encodeURIComponent(orgId)}/report`;
      const url = queryString ? `${base}?${queryString}` : base;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || 'Failed to load hazmat report data');
        return;
      }
      const payload = await res.json() as HazmatReportResponse;
      setRows(Array.isArray(payload.rows) ? payload.rows : []);
      setSummary(payload.summary || {
        total_rows: 0,
        complete: 0,
        delinquent: 0,
        at_risk: 0,
        missing_certificates: 0,
      });
      if (isFilterSubmit) setNotice('Filters applied.');
    } catch {
      setError('Network error loading hazmat report data');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [orgId, queryString]);

  useEffect(() => {
    fetchReport(false);
  }, [fetchReport]);

  async function handleUpload(recordId: string, file: File) {
    if (!file) return;
    setUploadingRecordId(recordId);
    setError('');
    setNotice('');

    try {
      const formData = new FormData();
      formData.set('file', file);

      const res = await fetch(`/api/v1/hazmat-training/records/${encodeURIComponent(recordId)}/certificate`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || 'Failed to upload certificate');
        return;
      }
      setNotice('Certificate uploaded successfully.');
      await fetchReport(false);
    } catch {
      setError('Network error uploading certificate');
    } finally {
      setUploadingRecordId(null);
    }
  }

  function exportUrl(format: 'csv' | 'pdf') {
    const base = `/api/v1/hazmat-training/org/${encodeURIComponent(orgId)}/report`;
    const params = new URLSearchParams(queryString);
    params.set('format', format);
    return `${base}?${params.toString()}`;
  }

  const statusBadge = (status: string) => {
    if (status === 'complete') return 'bg-emerald-100 text-emerald-700';
    if (status === 'delinquent') return 'bg-red-100 text-red-700';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Hazmat Training Reports</h1>
        <p className="text-slate-500 mt-1">
          Filter training records, export audit-ready reports, and upload missing certificates.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500">Total Rows</p>
          <p className="text-2xl font-bold text-slate-900">{summary.total_rows}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500">Complete</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.complete}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500">At Risk</p>
          <p className="text-2xl font-bold text-amber-600">{summary.at_risk}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500">Delinquent</p>
          <p className="text-2xl font-bold text-red-600">{summary.delinquent}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500">Missing Certificates</p>
          <p className="text-2xl font-bold text-slate-900">{summary.missing_certificates}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            value={filters.employee_id}
            onChange={(e) => setFilters((s) => ({ ...s, employee_id: e.target.value }))}
            placeholder="Employee ID"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            value={filters.module_code}
            onChange={(e) => setFilters((s) => ({ ...s, module_code: e.target.value }))}
            placeholder="Module code"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="complete">Complete</option>
            <option value="delinquent">Delinquent</option>
          </select>
          <input
            value={filters.credit_pathway}
            onChange={(e) => setFilters((s) => ({ ...s, credit_pathway: e.target.value }))}
            placeholder="Credit pathway"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters((s) => ({ ...s, start_date: e.target.value }))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters((s) => ({ ...s, end_date: e.target.value }))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => fetchReport(true)}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Applying...' : 'Apply Filters'}
          </button>
          <button
            onClick={() => {
              setFilters(INITIAL_FILTERS);
              setTimeout(() => fetchReport(false), 0);
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Reset
          </button>
          <a
            href={exportUrl('csv')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Export CSV
          </a>
          <a
            href={exportUrl('pdf')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Export PDF
          </a>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Print
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-slate-500">Loading report data...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Employee</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Module</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Status</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Completion</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Due</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                      No training records match the current filters.
                    </td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{row.employee_name}</div>
                      <div className="font-mono text-xs text-slate-500">{row.employee_id}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{row.module_title}</div>
                      <div className="font-mono text-xs text-slate-500">{row.module_code}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge(row.status)}`}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {row.completion_date || '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <div>{row.next_due_date || '—'}</div>
                      {row.days_until_due !== null && (
                        <div className="text-xs text-slate-500">{row.days_until_due} days</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {row.certificate_status === 'available' ? (
                        <a
                          href={`/api/v1/training/certificates?employee_id=${encodeURIComponent(row.employee_id)}&module_code=${encodeURIComponent(row.module_code)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 underline hover:text-teal-900 text-sm"
                        >
                          View
                        </a>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-amber-700">Missing</span>
                          <label className="inline-block">
                            <span className="inline-block px-3 py-1 rounded border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                              {uploadingRecordId === row.id ? 'Uploading...' : 'Upload PDF'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              disabled={uploadingRecordId === row.id}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) handleUpload(row.id, file);
                                event.currentTarget.value = '';
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
