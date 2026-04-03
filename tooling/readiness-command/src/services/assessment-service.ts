import {
  Assessment,
  AssessmentClient,
  Question,
  Response,
  Recommendation,
} from '../data/firestore-schema.js';
import { InMemoryRepository } from '../data/in-memory-repository.js';
import { ScoringEngine } from './scoring-engine.js';
import { RecommendationEngine } from './recommendation-engine.js';

export class AssessmentService {
  private scoringEngine: ScoringEngine;
  private recommendationEngine: RecommendationEngine;

  constructor(private repository: InMemoryRepository) {
    this.scoringEngine = new ScoringEngine(repository);
    this.recommendationEngine = new RecommendationEngine();
  }

  startAssessment(
    clientId: string,
    assessorEmail: string,
    templateId: string,
    assessmentType: 'full' | 'quick' | 'technical' | 'process'
  ): Assessment {
    const id = `asmnt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const assessment: Assessment = {
      id,
      clientId,
      assessorEmail,
      assessmentType,
      status: 'in_progress',
      totalScore: 0,
      categoryScores: {},
      startedAt: now,
      expiresAt,
    };

    this.repository.createAssessment(assessment);
    return assessment;
  }

  submitResponse(
    assessmentId: string,
    questionId: string,
    responseValue: string | number | string[],
    notes?: string
  ): Response {
    const assessment = this.repository.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const question = this.repository.getQuestion(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    // Calculate response score
    const score = this.scoringEngine.computeResponseScore(
      responseValue,
      question
    );

    const id = `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const response: Response = {
      id,
      assessmentId,
      questionId,
      value: responseValue,
      score,
      notes,
      answeredAt: new Date(),
    };

    this.repository.createResponse(response);
    return response;
  }

  completeAssessment(assessmentId: string): Assessment {
    const assessment = this.repository.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    if (assessment.status === 'completed') {
      throw new Error('Assessment already completed');
    }

    // Get all responses for this assessment
    const responses = this.repository.getResponsesByAssessment(assessmentId);
    if (responses.length === 0) {
      throw new Error('No responses submitted for assessment');
    }

    // Get all questions
    const questions = this.repository.getAllQuestions();

    // Calculate scores
    const { totalScore, categoryScores } = this.scoringEngine.calculateAssessmentScore(
      responses,
      questions
    );

    // Update assessment
    assessment.status = 'completed';
    assessment.totalScore = totalScore;
    assessment.categoryScores = categoryScores;
    assessment.completedAt = new Date();

    this.repository.updateAssessment(assessment);

    // Generate recommendations
    const recommendations = this.recommendationEngine.generateRecommendations(
      assessmentId,
      totalScore,
      categoryScores
    );

    for (const rec of recommendations) {
      this.repository.createRecommendation(rec);
    }

    return assessment;
  }

  getAssessmentResults(assessmentId: string): {
    assessment: Assessment;
    responses: Response[];
    recommendations: Recommendation[];
  } {
    const assessment = this.repository.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const responses = this.repository.getResponsesByAssessment(assessmentId);
    const recommendations = this.repository.getRecommendationsByAssessment(
      assessmentId
    );

    return { assessment, responses, recommendations };
  }

  getNextQuestions(
    assessmentId: string,
    templateId: string,
    count: number = 5
  ): Question[] {
    const allQuestions = this.repository.getQuestionsByTemplate(templateId);
    const responses = this.repository.getResponsesByAssessment(assessmentId);

    const answeredIds = new Set(responses.map((r) => r.questionId));
    const unanswered = allQuestions.filter((q) => !answeredIds.has(q.id));

    return unanswered.slice(0, count);
  }

  expireOldAssessments(): string[] {
    const expiredIds: string[] = [];
    const now = new Date();

    const allAssessments = this.repository.getAllAssessments();
    for (const assessment of allAssessments) {
      if (
        assessment.status === 'in_progress' &&
        assessment.expiresAt < now
      ) {
        assessment.status = 'expired';
        this.repository.updateAssessment(assessment);
        expiredIds.push(assessment.id);
      }
    }

    return expiredIds;
  }
}
