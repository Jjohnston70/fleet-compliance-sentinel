import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../src/services/recommendation-engine.js';

describe('RecommendationEngine', () => {
  const engine = new RecommendationEngine();

  it('should assign immediate priority for very low scores', () => {
    const categoryScores = {
      process_maturity: { score: 10, maxScore: 100, pct: 10 },
      data_readiness: { score: 5, maxScore: 100, pct: 5 },
      tech_infrastructure: { score: 15, maxScore: 100, pct: 15 },
      team_capability: { score: 8, maxScore: 100, pct: 8 },
      budget_alignment: { score: 5, maxScore: 100, pct: 5 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      15,
      categoryScores
    );

    const immediateRecs = recs.filter((r) => r.priority === 'immediate');
    expect(immediateRecs.length).toBeGreaterThan(0);
  });

  it('should assign short-term priority for low-medium scores', () => {
    const categoryScores = {
      process_maturity: { score: 30, maxScore: 100, pct: 30 },
      data_readiness: { score: 35, maxScore: 100, pct: 35 },
      tech_infrastructure: { score: 40, maxScore: 100, pct: 40 },
      team_capability: { score: 25, maxScore: 100, pct: 25 },
      budget_alignment: { score: 30, maxScore: 100, pct: 30 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      32,
      categoryScores
    );

    const shortTermRecs = recs.filter((r) => r.priority === 'short_term');
    expect(shortTermRecs.length).toBeGreaterThan(0);
  });

  it('should assign medium-term priority for medium-high scores', () => {
    const categoryScores = {
      process_maturity: { score: 60, maxScore: 100, pct: 60 },
      data_readiness: { score: 65, maxScore: 100, pct: 65 },
      tech_infrastructure: { score: 70, maxScore: 100, pct: 70 },
      team_capability: { score: 55, maxScore: 100, pct: 55 },
      budget_alignment: { score: 60, maxScore: 100, pct: 60 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      62,
      categoryScores
    );

    const mediumTermRecs = recs.filter((r) => r.priority === 'medium_term');
    expect(mediumTermRecs.length).toBeGreaterThan(0);
  });

  it('should assign long-term priority for high scores', () => {
    const categoryScores = {
      process_maturity: { score: 90, maxScore: 100, pct: 90 },
      data_readiness: { score: 85, maxScore: 100, pct: 85 },
      tech_infrastructure: { score: 80, maxScore: 100, pct: 80 },
      team_capability: { score: 85, maxScore: 100, pct: 85 },
      budget_alignment: { score: 80, maxScore: 100, pct: 80 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      84,
      categoryScores
    );

    const longTermRecs = recs.filter((r) => r.priority === 'long_term');
    expect(longTermRecs.length).toBeGreaterThan(0);
  });

  it('should provide category-specific recommendations for low-scoring areas', () => {
    const categoryScores = {
      process_maturity: { score: 80, maxScore: 100, pct: 80 },
      data_readiness: { score: 20, maxScore: 100, pct: 20 }, // Low
      tech_infrastructure: { score: 70, maxScore: 100, pct: 70 },
      team_capability: { score: 60, maxScore: 100, pct: 60 },
      budget_alignment: { score: 70, maxScore: 100, pct: 70 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      60,
      categoryScores
    );

    const dataRecs = recs.filter((r) => r.category === 'data_readiness');
    expect(dataRecs.length).toBeGreaterThan(0);
  });

  it('should include estimated ROI and effort in recommendations', () => {
    const categoryScores = {
      process_maturity: { score: 50, maxScore: 100, pct: 50 },
      data_readiness: { score: 50, maxScore: 100, pct: 50 },
      tech_infrastructure: { score: 50, maxScore: 100, pct: 50 },
      team_capability: { score: 50, maxScore: 100, pct: 50 },
      budget_alignment: { score: 50, maxScore: 100, pct: 50 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      50,
      categoryScores
    );

    for (const rec of recs) {
      expect(rec.estimatedRoi).toBeDefined();
      expect(rec.estimatedEffort).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(rec.estimatedEffort);
    }
  });

  it('should include tools suggested for each recommendation', () => {
    const categoryScores = {
      process_maturity: { score: 40, maxScore: 100, pct: 40 },
      data_readiness: { score: 40, maxScore: 100, pct: 40 },
      tech_infrastructure: { score: 40, maxScore: 100, pct: 40 },
      team_capability: { score: 40, maxScore: 100, pct: 40 },
      budget_alignment: { score: 40, maxScore: 100, pct: 40 },
    };

    const recs = engine.generateRecommendations(
      'asmnt-1',
      40,
      categoryScores
    );

    const recsWithTools = recs.filter((r) => r.toolsSuggested && r.toolsSuggested.length > 0);
    expect(recsWithTools.length).toBeGreaterThan(0);
  });
});
