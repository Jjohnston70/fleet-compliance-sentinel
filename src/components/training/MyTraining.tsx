'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModuleProgress {
  module_code: string;
  title: string;
  status: 'not_started' | 'viewing' | 'passed' | 'failed';
}

interface AssignmentProgress {
  id: string;
  plan_name: string;
  status: 'assigned' | 'in_progress' | 'complete' | 'overdue';
  completion_pct: number;
  deadline: string | null;
  modules: ModuleProgress[];
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

const MODULE_DOT: Record<string, string> = {
  not_started: 'bg-slate-400',
  viewing: 'bg-blue-500',
  passed: 'bg-emerald-500',
  failed: 'bg-red-500',
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function deadlineLabel(deadline: string | null, status: string): JSX.Element | null {
  if (!deadline) return null;
  if (status === 'complete') {
    return <span className="text-sm text-slate-500">Due {new Date(deadline).toLocaleDateString()}</span>;
  }
  const days = daysUntil(deadline);
  if (days < 0) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        Overdue
      </span>
    );
  }
  if (days === 0) {
    return <span className="text-sm font-medium text-amber-600">Due today</span>;
  }
  if (days <= 7) {
    return <span className="text-sm font-medium text-amber-600">Due in {days} day{days !== 1 ? 's' : ''}</span>;
  }
  return <span className="text-sm text-slate-500">Due in {days} days</span>;
}

function moduleAction(status: string): string {
  switch (status) {
    case 'not_started': return 'Start';
    case 'viewing': return 'Continue';
    case 'failed': return 'Retake';
    case 'passed': return 'Completed';
    default: return 'Start';
  }
}

export default function MyTraining() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/v1/training/progress');
        if (!res.ok) {
          setError('Failed to load training progress');
          return;
        }
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : data.assignments || []);
      } catch {
        setError('Network error loading training progress');
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-40 bg-slate-200 rounded-lg" />
          <div className="h-40 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => { setError(''); setLoading(true); window.location.reload(); }}
            className="mt-3 px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Training</h1>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500 text-lg">No training assigned yet.</p>
          <p className="text-slate-400 text-sm mt-2">
            When your manager assigns training plans, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Sort non-complete assignments by deadline (nearest first), null deadlines last
  const upcoming = assignments
    .filter((a) => a.status !== 'complete')
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const completed = assignments.filter((a) => a.status === 'complete');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Training</h1>
        <p className="text-slate-500 mt-1">Your assigned training plans and progress</p>
      </div>

      {/* What's Due Next */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">What&apos;s Due Next</h2>
          <div className="grid gap-4">
            {upcoming.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:border-teal-400 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{assignment.plan_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[assignment.status] || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[assignment.status] || assignment.status}
                      </span>
                      {deadlineLabel(assignment.deadline, assignment.status)}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-teal-600">{assignment.completion_pct}%</span>
                </div>

                {/* Progress bar */}
                <div className="bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-teal-600 transition-all"
                    style={{ width: `${assignment.completion_pct}%` }}
                  />
                </div>

                {/* Modules */}
                {assignment.modules && assignment.modules.length > 0 && (
                  <div className="space-y-2">
                    {assignment.modules.map((mod) => (
                      <div
                        key={mod.module_code}
                        className="flex items-center justify-between py-2 px-3 rounded bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${MODULE_DOT[mod.status] || 'bg-slate-400'}`} />
                          <span className="text-sm font-mono text-slate-500">{mod.module_code}</span>
                          <span className="text-sm text-slate-700">{mod.title}</span>
                        </div>
                        <button
                          onClick={() => router.push(`/fleet-compliance/training/${mod.module_code}`)}
                          disabled={mod.status === 'passed'}
                          className={
                            mod.status === 'passed'
                              ? 'px-4 py-1 text-xs rounded-lg font-medium bg-emerald-50 text-emerald-600 cursor-default'
                              : 'px-4 py-1 text-xs rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors'
                          }
                        >
                          {moduleAction(mod.status)}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Completed</h2>
          <div className="grid gap-4">
            {completed.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white border border-slate-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{assignment.plan_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                        Complete
                      </span>
                      {deadlineLabel(assignment.deadline, assignment.status)}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">100%</span>
                </div>
                <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
