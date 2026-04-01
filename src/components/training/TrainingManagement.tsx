'use client';

import { useState, useEffect } from 'react';

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  module_count: number;
  required_badge: string;
}

interface TrainingAssignment {
  id: string;
  employee_id: string;
  plan_id: string;
  plan_name: string;
  status: 'assigned' | 'in_progress' | 'complete' | 'overdue';
  completion_pct: number;
  deadline: string | null;
  assigned_date: string;
}

const STATUS_STYLES: Record<string, string> = {
  complete: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  assigned: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  complete: 'Complete',
  in_progress: 'In Progress',
  assigned: 'Assigned',
  overdue: 'Overdue',
};

export default function TrainingManagement() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Inline assign form state (keyed by plan id)
  const [assigningPlanId, setAssigningPlanId] = useState<string | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');

  async function fetchData() {
    try {
      const [plansRes, assignRes] = await Promise.all([
        fetch('/api/v1/training/plans'),
        fetch('/api/v1/training/assignments'),
      ]);
      if (!plansRes.ok || !assignRes.ok) {
        setError('Failed to load training data');
        return;
      }
      const plansData = await plansRes.json();
      const assignData = await assignRes.json();
      setPlans(Array.isArray(plansData) ? plansData : plansData.plans || []);
      setAssignments(Array.isArray(assignData) ? assignData : assignData.assignments || []);
    } catch {
      setError('Network error loading training data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAssign(planId: string) {
    if (!assignEmployeeId.trim()) {
      setAssignError('Employee ID is required');
      return;
    }
    setAssignSubmitting(true);
    setAssignError('');
    try {
      const res = await fetch('/api/v1/training/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          employee_id: assignEmployeeId.trim(),
          deadline: assignDeadline || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAssignError(data.error || 'Failed to create assignment');
        return;
      }
      // Reset form and refresh
      setAssigningPlanId(null);
      setAssignEmployeeId('');
      setAssignDeadline('');
      setLoading(true);
      await fetchData();
    } catch {
      setAssignError('Network error creating assignment');
    } finally {
      setAssignSubmitting(false);
    }
  }

  // Stats
  const totalPlans = plans.length;
  const totalAssignments = assignments.length;
  const completeCount = assignments.filter((a) => a.status === 'complete').length;
  const completionRate = totalAssignments > 0
    ? Math.round((completeCount / totalAssignments) * 100)
    : 0;
  const overdueCount = assignments.filter((a) => a.status === 'overdue').length;

  const filteredAssignments = statusFilter === 'all'
    ? assignments
    : assignments.filter((a) => a.status === statusFilter);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => { setError(''); setLoading(true); fetchData(); }}
            className="mt-3 px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Training Management</h1>
        <p className="text-slate-500 mt-1">Manage training plans and employee assignments</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Total Plans</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalPlans}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Total Assignments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAssignments}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Completion Rate</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{completionRate}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Training Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Training Plans</h2>
        {plans.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
            <p className="text-slate-500">No training plans created yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:border-teal-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>{plan.module_count} modules</span>
                      {plan.required_badge && (
                        <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                          {plan.required_badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAssigningPlanId(assigningPlanId === plan.id ? null : plan.id);
                      setAssignEmployeeId('');
                      setAssignDeadline('');
                      setAssignError('');
                    }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors ml-4"
                  >
                    {assigningPlanId === plan.id ? 'Cancel' : 'Assign'}
                  </button>
                </div>

                {/* Inline assign form */}
                {assigningPlanId === plan.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Employee ID</label>
                        <input
                          type="text"
                          value={assignEmployeeId}
                          onChange={(e) => setAssignEmployeeId(e.target.value)}
                          placeholder="e.g. EMP-001"
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Deadline (optional)</label>
                        <input
                          type="date"
                          value={assignDeadline}
                          onChange={(e) => setAssignDeadline(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <button
                        onClick={() => handleAssign(plan.id)}
                        disabled={assignSubmitting}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                      >
                        {assignSubmitting ? 'Assigning...' : 'Confirm'}
                      </button>
                    </div>
                    {assignError && (
                      <p className="mt-2 text-sm text-red-600">{assignError}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
            <p className="text-slate-500">
              {statusFilter === 'all' ? 'No assignments yet.' : `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} assignments.`}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Employee ID</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Plan Name</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Completion</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Deadline</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-700">{a.employee_id}</td>
                      <td className="px-4 py-3 text-slate-900">{a.plan_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[a.status] || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[a.status] || a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-200 h-2 rounded-full overflow-hidden w-20">
                            <div
                              className="h-full bg-teal-600"
                              style={{ width: `${a.completion_pct}%` }}
                            />
                          </div>
                          <span className="text-slate-600">{a.completion_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.deadline
                          ? new Date(a.deadline).toLocaleDateString()
                          : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(a.assigned_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
