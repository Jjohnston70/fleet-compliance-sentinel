import {
  Assessment,
  AssessmentClient,
  Question,
  Response,
  Recommendation,
  AssessmentTemplate,
} from './firestore-schema.js';

// Simple in-memory repository for testing and development
// In production, replace with Firestore operations

export class InMemoryRepository {
  private assessments = new Map<string, Assessment>();
  private clients = new Map<string, AssessmentClient>();
  private questions = new Map<string, Question>();
  private responses = new Map<string, Response>();
  private recommendations = new Map<string, Recommendation>();
  private templates = new Map<string, AssessmentTemplate>();

  // Assessment methods
  createAssessment(assessment: Assessment): void {
    this.assessments.set(assessment.id, { ...assessment });
  }

  getAssessment(id: string): Assessment | undefined {
    const a = this.assessments.get(id);
    return a ? { ...a } : undefined;
  }

  updateAssessment(assessment: Assessment): void {
    this.assessments.set(assessment.id, { ...assessment });
  }

  deleteAssessment(id: string): void {
    this.assessments.delete(id);
  }

  getAllAssessments(): Assessment[] {
    return Array.from(this.assessments.values()).map((a) => ({ ...a }));
  }

  // Client methods
  createClient(client: AssessmentClient): void {
    this.clients.set(client.id, { ...client });
  }

  getClient(id: string): AssessmentClient | undefined {
    const c = this.clients.get(id);
    return c ? { ...c } : undefined;
  }

  updateClient(client: AssessmentClient): void {
    this.clients.set(client.id, { ...client });
  }

  getAllClients(): AssessmentClient[] {
    return Array.from(this.clients.values()).map((c) => ({ ...c }));
  }

  // Question methods
  createQuestion(question: Question): void {
    this.questions.set(question.id, { ...question });
  }

  getQuestion(id: string): Question | undefined {
    const q = this.questions.get(id);
    return q ? { ...q } : undefined;
  }

  getQuestionsByTemplate(templateId: string): Question[] {
    return Array.from(this.questions.values())
      .filter((q) => q.templateId === templateId)
      .map((q) => ({ ...q }))
      .sort((a, b) => a.order - b.order);
  }

  getAllQuestions(): Question[] {
    return Array.from(this.questions.values()).map((q) => ({ ...q }));
  }

  // Response methods
  createResponse(response: Response): void {
    this.responses.set(response.id, { ...response });
  }

  getResponse(id: string): Response | undefined {
    const r = this.responses.get(id);
    return r ? { ...r } : undefined;
  }

  getResponsesByAssessment(assessmentId: string): Response[] {
    return Array.from(this.responses.values())
      .filter((r) => r.assessmentId === assessmentId)
      .map((r) => ({ ...r }));
  }

  // Recommendation methods
  createRecommendation(recommendation: Recommendation): void {
    this.recommendations.set(recommendation.id, { ...recommendation });
  }

  getRecommendationsByAssessment(assessmentId: string): Recommendation[] {
    return Array.from(this.recommendations.values())
      .filter((r) => r.assessmentId === assessmentId)
      .map((r) => ({ ...r }));
  }

  // Template methods
  createTemplate(template: AssessmentTemplate): void {
    this.templates.set(template.id, { ...template });
  }

  getTemplate(id: string): AssessmentTemplate | undefined {
    const t = this.templates.get(id);
    return t ? { ...t } : undefined;
  }

  getAllTemplates(): AssessmentTemplate[] {
    return Array.from(this.templates.values()).map((t) => ({ ...t }));
  }

  getActiveTemplates(): AssessmentTemplate[] {
    return Array.from(this.templates.values())
      .filter((t) => t.active)
      .map((t) => ({ ...t }));
  }

  // Utility methods
  clear(): void {
    this.assessments.clear();
    this.clients.clear();
    this.questions.clear();
    this.responses.clear();
    this.recommendations.clear();
    this.templates.clear();
  }
}
