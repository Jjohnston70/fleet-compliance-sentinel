import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';
import { ScoringEngine } from '../src/services/scoring-engine.js';
import { Question, Response } from '../src/data/firestore-schema.js';

describe('ScoringEngine', () => {
  let repository: InMemoryRepository;
  let scoringEngine: ScoringEngine;

  beforeEach(() => {
    repository = new InMemoryRepository();
    scoringEngine = new ScoringEngine(repository);
  });

  it('should calculate zero score when no responses', () => {
    const { totalScore, categoryScores } = scoringEngine.calculateAssessmentScore(
      [],
      []
    );

    expect(totalScore).toBe(0);
    expect(Object.keys(categoryScores).length).toBeGreaterThan(0);
  });

  it('should handle scale questions (1-10)', () => {
    const question: Question = {
      id: 'q1',
      templateId: 'tmpl-1',
      category: 'process_maturity',
      text: 'Test Question',
      questionType: 'scale',
      weight: 2,
      order: 1,
    };

    const response: Response = {
      id: 'r1',
      assessmentId: 'a1',
      questionId: 'q1',
      value: 8,
      score: 8, // Scale values are already 0-10
      answeredAt: new Date(),
    };

    const { totalScore } = scoringEngine.calculateAssessmentScore(
      [response],
      [question]
    );

    expect(totalScore).toBeGreaterThan(0);
    expect(totalScore).toBeLessThanOrEqual(100);
  });

  it('should handle select questions with scored options', () => {
    const question: Question = {
      id: 'q2',
      templateId: 'tmpl-1',
      category: 'data_readiness',
      text: 'Data Source Type',
      questionType: 'select',
      weight: 2,
      order: 2,
      options: [
        { value: 'rdb', label: 'Relational Database', score: 3 },
        { value: 'spreadsheets', label: 'Spreadsheets', score: 2 },
      ],
    };

    const response: Response = {
      id: 'r2',
      assessmentId: 'a1',
      questionId: 'q2',
      value: 'rdb',
      score: 3, // Score from option
      answeredAt: new Date(),
    };

    const { totalScore } = scoringEngine.calculateAssessmentScore(
      [response],
      [question]
    );

    expect(totalScore).toBeGreaterThan(0);
  });

  it('should normalize scores to 0-100 range', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        templateId: 'tmpl-1',
        category: 'process_maturity',
        text: 'Q1',
        questionType: 'scale',
        weight: 1,
        order: 1,
      },
    ];

    const responses: Response[] = [
      {
        id: 'r1',
        assessmentId: 'a1',
        questionId: 'q1',
        value: 10,
        score: 10,
        answeredAt: new Date(),
      },
    ];

    const { totalScore } = scoringEngine.calculateAssessmentScore(
      responses,
      questions
    );

    expect(totalScore).toBeLessThanOrEqual(100);
    expect(totalScore).toBeGreaterThanOrEqual(0);
  });

  it('should weight questions correctly', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        templateId: 'tmpl-1',
        category: 'process_maturity',
        text: 'Q1',
        questionType: 'scale',
        weight: 3, // Higher weight
        order: 1,
      },
      {
        id: 'q2',
        templateId: 'tmpl-1',
        category: 'process_maturity',
        text: 'Q2',
        questionType: 'scale',
        weight: 1, // Lower weight
        order: 2,
      },
    ];

    const responses: Response[] = [
      {
        id: 'r1',
        assessmentId: 'a1',
        questionId: 'q1',
        value: 10,
        score: 10,
        answeredAt: new Date(),
      },
      {
        id: 'r2',
        assessmentId: 'a1',
        questionId: 'q2',
        value: 0,
        score: 0,
        answeredAt: new Date(),
      },
    ];

    const { categoryScores } = scoringEngine.calculateAssessmentScore(
      responses,
      questions
    );

    // With higher weight on q1, score should be closer to 10 than 0
    const score = categoryScores['process_maturity'].pct;
    expect(score).toBeGreaterThan(50);
  });

  it('should compute response scores for different question types', () => {
    const scaleQuestion: Question = {
      id: 'q-scale',
      templateId: 'tmpl-1',
      category: 'process_maturity',
      text: 'Scale Q',
      questionType: 'scale',
      weight: 1,
      order: 1,
    };

    const score1 = scoringEngine.computeResponseScore(5, scaleQuestion);
    expect(score1).toBe(5);

    const score2 = scoringEngine.computeResponseScore(10, scaleQuestion);
    expect(score2).toBe(10);

    const score3 = scoringEngine.computeResponseScore(0, scaleQuestion);
    expect(score3).toBe(0);
  });

  it('should handle multi-select normalization', () => {
    const multiQuestion: Question = {
      id: 'q-multi',
      templateId: 'tmpl-1',
      category: 'data_readiness',
      text: 'Multi Select',
      questionType: 'multi_select',
      weight: 2,
      order: 1,
      options: [
        { value: 'opt1', label: 'Option 1', score: 2 },
        { value: 'opt2', label: 'Option 2', score: 2 },
      ],
    };

    const score = scoringEngine.computeResponseScore(['opt1', 'opt2'], multiQuestion);
    expect(score).toBeLessThanOrEqual(10);
  });
});
