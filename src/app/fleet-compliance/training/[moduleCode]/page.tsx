'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TrainingDeckViewer from '@/components/training/TrainingDeckViewer';
import TrainingAssessment from '@/components/training/TrainingAssessment';

type ViewState = 'deck' | 'assessment' | 'complete';

export default function TrainingModulePage() {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const router = useRouter();
  const [view, setView] = useState<ViewState>('deck');
  const [assessmentResult, setAssessmentResult] = useState<{
    passed: boolean;
    score: number;
    total: number;
    percentage: number;
  } | null>(null);

  function handleDeckComplete() {
    setView('assessment');
  }

  function handleAssessmentComplete(result: {
    passed: boolean;
    score: number;
    total: number;
    percentage: number;
  }) {
    setAssessmentResult(result);
    if (result.passed) {
      setView('complete');
    }
  }

  function handleRetake() {
    setView('assessment');
    setAssessmentResult(null);
  }

  function handleBackToCatalog() {
    router.push('/fleet-compliance/training');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleBackToCatalog}
          className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
        >
          &larr; Back to Training
        </button>
        <span className="text-xs font-mono text-slate-400">{moduleCode}</span>
      </div>

      {/* Deck Viewer */}
      {view === 'deck' && (
        <TrainingDeckViewer
          moduleCode={moduleCode}
          onDeckComplete={handleDeckComplete}
        />
      )}

      {/* Assessment */}
      {view === 'assessment' && (
        <TrainingAssessment
          moduleCode={moduleCode}
          onComplete={handleAssessmentComplete}
          onRetake={handleRetake}
        />
      )}

      {/* Completion */}
      {view === 'complete' && assessmentResult && (
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-8">
            <div className="text-5xl mb-4">{'\u2713'}</div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">
              Module Complete
            </h2>
            <p className="text-lg text-slate-600 mb-2">
              Score: {assessmentResult.score}/{assessmentResult.total} (
              {assessmentResult.percentage}%)
            </p>
            <p className="text-emerald-700 mb-6">
              Your training record has been updated.
            </p>
            <button
              onClick={handleBackToCatalog}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Return to Training Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
