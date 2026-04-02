import { readFile } from 'fs/promises';
import path from 'path';

interface TrainingAssessmentOption {
  label: string;
  text: string;
  is_correct?: boolean;
}

interface TrainingAssessmentQuestion {
  number: number;
  question_type: string;
  question_text: string;
  options: TrainingAssessmentOption[];
  correct_answer?: string;
  explanation?: string;
  cfr_reference?: string;
}

export interface TrainingAssessment {
  module_code: string;
  title: string;
  passing_score: number;
  question_count: number;
  questions: TrainingAssessmentQuestion[];
}

export interface TrainingAssessmentQuestionClient {
  number: number;
  question_type: string;
  question_text: string;
  options: Array<{
    label: string;
    text: string;
  }>;
  cfr_reference?: string;
}

export interface TrainingAssessmentClient {
  module_code: string;
  title: string;
  passing_score: number;
  question_count: number;
  questions: TrainingAssessmentQuestionClient[];
}

export interface TrainingAssessmentGrade {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
}

function resolveAssessmentPath(moduleCode: string): string {
  return path.join(
    process.cwd(),
    'knowledge',
    'training-content',
    'assessments',
    `${moduleCode}-assessment.json`,
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function normalizeAnswerMap(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const out: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(value as Record<string, unknown>)) {
    if (typeof rawValue !== 'string') return null;
    const trimmed = rawValue.trim();
    if (!trimmed) continue;
    out[String(key)] = trimmed;
  }
  return out;
}

export async function loadTrainingAssessment(moduleCode: string): Promise<TrainingAssessment | null> {
  const assessmentPath = resolveAssessmentPath(moduleCode);
  try {
    const json = await readFile(assessmentPath, 'utf-8');
    const parsed = JSON.parse(json) as Partial<TrainingAssessment>;
    if (
      !parsed
      || typeof parsed !== 'object'
      || typeof parsed.module_code !== 'string'
      || typeof parsed.title !== 'string'
      || !Array.isArray(parsed.questions)
      || !isFiniteNumber(parsed.passing_score)
    ) {
      return null;
    }
    const questions = parsed.questions.filter(
      (question): question is TrainingAssessmentQuestion =>
        Boolean(question)
        && typeof question === 'object'
        && isFiniteNumber((question as TrainingAssessmentQuestion).number)
        && typeof (question as TrainingAssessmentQuestion).question_text === 'string'
        && Array.isArray((question as TrainingAssessmentQuestion).options),
    );
    return {
      module_code: parsed.module_code,
      title: parsed.title,
      passing_score: parsed.passing_score,
      question_count: questions.length,
      questions,
    };
  } catch {
    return null;
  }
}

export function sanitizeTrainingAssessmentForClient(assessment: TrainingAssessment): TrainingAssessmentClient {
  return {
    module_code: assessment.module_code,
    title: assessment.title,
    passing_score: assessment.passing_score,
    question_count: assessment.questions.length,
    questions: assessment.questions.map((question) => ({
      number: question.number,
      question_type: question.question_type,
      question_text: question.question_text,
      cfr_reference: question.cfr_reference,
      options: question.options.map((option) => ({
        label: option.label,
        text: option.text,
      })),
    })),
  };
}

function resolveCorrectAnswer(question: TrainingAssessmentQuestion): string | null {
  if (typeof question.correct_answer === 'string' && question.correct_answer.trim().length > 0) {
    return question.correct_answer.trim();
  }
  const option = question.options.find((entry) => entry.is_correct === true);
  if (!option || typeof option.label !== 'string' || option.label.trim().length === 0) return null;
  return option.label.trim();
}

export function gradeTrainingAssessment(
  assessment: TrainingAssessment,
  answers: Record<string, string>,
  passingScoreOverride: number | null = null,
): TrainingAssessmentGrade {
  const total = assessment.questions.length;
  let score = 0;

  for (const question of assessment.questions) {
    const submitted = answers[String(question.number)] || '';
    if (!submitted) continue;
    const correct = resolveCorrectAnswer(question);
    if (correct && submitted === correct) {
      score += 1;
    }
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passingScore = Number.isFinite(passingScoreOverride)
    ? Number(passingScoreOverride)
    : assessment.passing_score;
  const passed = percentage >= passingScore;

  return {
    score,
    total,
    percentage,
    passed,
    passingScore,
  };
}
