import { Response, Question } from '../data/firestore-schema.js';
import { InMemoryRepository } from '../data/in-memory-repository.js';

// Scoring Engine: Weighted average scoring across 5 categories normalized to 0-100
// Category score = sum(response_score * question_weight) / sum(max_possible * question_weight) * 100

const CATEGORIES = [
  'process_maturity',
  'data_readiness',
  'tech_infrastructure',
  'team_capability',
  'budget_alignment',
];

export interface CategoryScore {
  score: number;
  maxScore: number;
  pct: number;
}

export class ScoringEngine {
  constructor(private repository: InMemoryRepository) {}

  calculateAssessmentScore(
    responses: Response[],
    questions: Question[]
  ): { totalScore: number; categoryScores: Record<string, CategoryScore> } {
    const categoryScores: Record<string, CategoryScore> = {};

    // Initialize all categories
    for (const category of CATEGORIES) {
      categoryScores[category] = {
        score: 0,
        maxScore: 0,
        pct: 0,
      };
    }

    // Map questions by id for quick lookup
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Calculate category scores
    for (const response of responses) {
      const question = questionMap.get(response.questionId);
      if (!question) continue;

      const category = question.category;
      const weight = question.weight;

      // Response score is already computed, just add weighted score
      categoryScores[category].score += response.score * weight;
      categoryScores[category].maxScore += 10 * weight; // Max score is 10 per response
    }

    // Normalize to 0-100 for each category
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const category of CATEGORIES) {
      const catScore = categoryScores[category];
      if (catScore.maxScore > 0) {
        catScore.pct = (catScore.score / catScore.maxScore) * 100;
      } else {
        catScore.pct = 0;
      }

      // For total score, weight categories equally
      totalWeightedScore += catScore.pct;
      totalWeight += 1;
    }

    const totalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      totalScore: Math.round(totalScore * 10) / 10,
      categoryScores,
    };
  }

  // Helper to convert response value to numeric score (0-10)
  computeResponseScore(
    responseValue: string | number | string[],
    question: Question
  ): number {
    if (question.questionType === 'scale') {
      // Scale values are 1-10, normalize to 0-10
      const num = typeof responseValue === 'number' ? responseValue : parseInt(String(responseValue), 10);
      return Math.max(0, Math.min(10, num));
    }

    if (question.questionType === 'select' || question.questionType === 'multi_select') {
      if (!question.options) return 0;

      let totalScore = 0;
      const values = Array.isArray(responseValue)
        ? responseValue
        : [String(responseValue)];

      for (const value of values) {
        const option = question.options.find((o) => o.value === value);
        if (option) {
          totalScore += option.score;
        }
      }

      // Normalize multi-select to 0-10 range
      if (question.questionType === 'multi_select' && question.options.length > 0) {
        const maxPossible = question.options.reduce((sum, o) => sum + o.score, 0);
        if (maxPossible > 0) {
          return Math.min(10, (totalScore / maxPossible) * 10);
        }
      }

      return Math.min(10, totalScore);
    }

    if (question.questionType === 'text' || question.questionType === 'boolean') {
      // Text and boolean responses don't contribute numeric score
      // They might be used for qualitative analysis
      return 0;
    }

    return 0;
  }
}
