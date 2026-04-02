'use client';

import { useState, useEffect } from 'react';

interface AssessmentOption {
  label: string;
  text: string;
}

interface AssessmentQuestion {
  number: number;
  question_type: string;
  question_text: string;
  options: AssessmentOption[];
  cfr_reference?: string;
}

interface AssessmentData {
  module_code: string;
  title: string;
  passing_score: number;
  question_count: number;
  questions: AssessmentQuestion[];
}

interface AssessmentResult {
  passed: boolean;
  score: number;
  total: number;
  percentage: number;
  passing_score: number;
}

interface TrainingAssessmentProps {
  moduleCode: string;
  onComplete: (result: AssessmentResult) => void;
  onRetake: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TrainingAssessment({
  moduleCode,
  onComplete,
  onRetake,
}: TrainingAssessmentProps) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch(`/api/v1/training/${moduleCode}/deck`);
        if (!res.ok) {
          setError('Failed to load assessment');
          return;
        }
        const assessRes = await fetch(`/api/v1/training/${moduleCode}/assessment/attempts`);
        if (!assessRes.ok) {
          const payload = await assessRes.json().catch(() => null) as { error?: string } | null;
          setError(payload?.error || 'Failed to load assessment data');
          return;
        }
        const data = await assessRes.json();
        setAssessment(data.assessment);
        setQuestions(shuffleArray(data.assessment.questions));
      } catch {
        setError('Network error loading assessment');
      } finally {
        setLoading(false);
      }
    }
    void loadAssessment();
  }, [moduleCode]);

  function handleSelectAnswer(label: string) {
    setSelectedAnswer(label);
  }

  function handleNextQuestion() {
    if (!selectedAnswer || !questions[currentQuestion]) return;
    const question = questions[currentQuestion];
    const nextAnswers = {
      ...answers,
      [question.number]: selectedAnswer,
    };
    setAnswers(nextAnswers);

    if (currentQuestion >= questions.length - 1) {
      void submitAssessment(nextAnswers);
      return;
    }
    setCurrentQuestion((prev) => prev + 1);
    setSelectedAnswer(null);
  }

  async function submitAssessment(finalAnswers: Record<number, string>) {
    if (!assessment) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/training/${moduleCode}/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const payload = await response.json().catch(() => null) as
        | {
            error?: string;
            passed?: boolean;
            score?: number;
            total?: number;
            percentage?: number;
            passing_score?: number;
          }
        | null;

      if (!response.ok) {
        setError(payload?.error || 'Unable to submit assessment.');
        return;
      }

      const assessmentResult: AssessmentResult = {
        passed: Boolean(payload?.passed),
        score: Number(payload?.score || 0),
        total: Number(payload?.total || questions.length),
        percentage: Number(payload?.percentage || 0),
        passing_score: Number(payload?.passing_score || assessment.passing_score),
      };

      setResult(assessmentResult);
      setShowResult(true);
      onComplete(assessmentResult);
    } catch {
      setError('Network error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetakeClick() {
    setShowResult(false);
    setResult(null);
    setError('');
    setSubmitting(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuestions((prev) => shuffleArray(prev));
    onRetake();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error && !showResult) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className={`rounded-lg p-8 text-center ${
            result.passed
              ? 'bg-emerald-50 border-2 border-emerald-300'
              : 'bg-red-50 border-2 border-red-300'
          }`}
        >
          <div className="text-5xl mb-4">{result.passed ? '\u2713' : '\u2717'}</div>
          <h3 className="text-2xl font-bold mb-2">
            {result.passed ? 'Assessment Passed' : 'Assessment Not Passed'}
          </h3>
          <p className="text-lg text-slate-600 mb-6">
            You scored {result.score} out of {result.total} ({result.percentage}%)
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Passing score: {result.passing_score}%
          </p>

          {result.passed ? (
            <p className="text-emerald-700 font-medium">
              Your compliance record will be updated automatically.
            </p>
          ) : (
            <div>
              <p className="text-red-700 mb-4">
                Review the material and try again. You may retake the assessment.
              </p>
              <button
                onClick={handleRetakeClick}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) return null;

  const question = questions[currentQuestion];
  const questionProgress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>{assessment.title}</span>
        </div>
        <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all duration-300"
            style={{ width: `${questionProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3 mb-1">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-600 uppercase">
            {question.question_type.replace('_', ' ')}
          </span>
          {question.cfr_reference && (
            <span className="inline-block px-2 py-1 text-xs rounded bg-slate-50 text-slate-500">
              {question.cfr_reference}
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-slate-900 mt-3">
          {question.question_text}
        </h3>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const optionStyle = selectedAnswer === option.label
            ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
            : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50';

          return (
            <button
              key={option.label}
              onClick={() => handleSelectAnswer(option.label)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-current text-sm font-bold flex-shrink-0">
                  {option.label}
                </span>
                <span className="text-slate-800 pt-1">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || submitting}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentQuestion >= questions.length - 1
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {submitting
            ? 'Submitting...'
            : currentQuestion >= questions.length - 1
              ? 'Finish Assessment'
              : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
