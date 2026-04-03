import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/in-memory-repository.js';
import { AssessmentService } from '../src/services/assessment-service.js';
import { SEED_QUESTIONS, TEMPLATES } from '../src/data/seed-questions.js';

describe('AssessmentService', () => {
  let repository: InMemoryRepository;
  let service: AssessmentService;

  beforeEach(() => {
    repository = new InMemoryRepository();
    service = new AssessmentService(repository);

    // Seed data
    for (const template of TEMPLATES) {
      repository.createTemplate(template);
    }
    for (const question of SEED_QUESTIONS) {
      repository.createQuestion(question);
    }
  });

  it('should start a new assessment', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-data-scan',
      'full'
    );

    expect(assessment.id).toBeDefined();
    expect(assessment.status).toBe('in_progress');
    expect(assessment.totalScore).toBe(0);
    expect(assessment.expiresAt).toBeDefined();
  });

  it('should submit a response to a question', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-data-scan',
      'full'
    );

    const questions = repository.getQuestionsByTemplate('tmpl-data-scan');
    const scaleQuestion = questions.find((q) => q.questionType === 'scale');
    expect(scaleQuestion).toBeDefined();

    const response = service.submitResponse(
      assessment.id,
      scaleQuestion!.id,
      7,
      'Good data completeness'
    );

    expect(response.id).toBeDefined();
    expect(response.score).toBe(7);
    expect(response.notes).toBe('Good data completeness');
  });

  it('should complete an assessment and generate recommendations', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-data-scan',
      'full'
    );

    const questions = repository.getQuestionsByTemplate('tmpl-data-scan');

    // Submit responses for at least a few questions
    for (let i = 0; i < Math.min(5, questions.length); i++) {
      const q = questions[i];
      if (q.questionType === 'scale') {
        service.submitResponse(assessment.id, q.id, 7);
      } else if (q.questionType === 'select') {
        service.submitResponse(assessment.id, q.id, q.options?.[0].value || 'value1');
      } else {
        service.submitResponse(assessment.id, q.id, 'Test response');
      }
    }

    const completed = service.completeAssessment(assessment.id);

    expect(completed.status).toBe('completed');
    expect(completed.totalScore).toBeGreaterThanOrEqual(0);
    expect(completed.totalScore).toBeLessThanOrEqual(100);
  });

  it('should retrieve assessment results', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-process-audit',
      'full'
    );

    const questions = repository.getQuestionsByTemplate('tmpl-process-audit');
    for (let i = 0; i < Math.min(3, questions.length); i++) {
      service.submitResponse(assessment.id, questions[i].id, 5);
    }

    service.completeAssessment(assessment.id);

    const results = service.getAssessmentResults(assessment.id);

    expect(results.assessment).toBeDefined();
    expect(results.responses.length).toBeGreaterThan(0);
    expect(results.recommendations.length).toBeGreaterThan(0);
  });

  it('should get next unanswered questions', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-tech-stack',
      'full'
    );

    const firstQuestions = service.getNextQuestions(assessment.id, 'tmpl-tech-stack', 3);
    expect(firstQuestions.length).toBeGreaterThan(0);

    // Answer the first question
    service.submitResponse(assessment.id, firstQuestions[0].id, 'response');

    const secondQuestions = service.getNextQuestions(assessment.id, 'tmpl-tech-stack', 3);

    // Should not include the already answered question
    const answeredIds = new Set([firstQuestions[0].id]);
    expect(secondQuestions.every((q) => !answeredIds.has(q.id))).toBe(true);
  });

  it('should expire old assessments', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-data-scan',
      'full'
    );

    // Manually set expiration date to past
    const retrievedAssessment = repository.getAssessment(assessment.id);
    if (retrievedAssessment) {
      retrievedAssessment.expiresAt = new Date(Date.now() - 1000);
      repository.updateAssessment(retrievedAssessment);
    }

    const expired = service.expireOldAssessments();

    expect(expired).toContain(assessment.id);

    const updated = repository.getAssessment(assessment.id);
    expect(updated?.status).toBe('expired');
  });

  it('should throw error when completing non-existent assessment', () => {
    expect(() => {
      service.completeAssessment('non-existent-id');
    }).toThrow();
  });

  it('should throw error when submitting response to non-existent question', () => {
    const assessment = service.startAssessment(
      'client-1',
      'assessor@example.com',
      'tmpl-data-scan',
      'full'
    );

    expect(() => {
      service.submitResponse(assessment.id, 'non-existent-q', 'value');
    }).toThrow();
  });
});
