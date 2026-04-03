import { InMemoryRepository } from './data/in-memory-repository.js';
import { AssessmentService } from './services/assessment-service.js';
import { ClientService } from './services/client-service.js';
import { ReportGenerator } from './services/report-generator.js';
import { TEMPLATES, SEED_QUESTIONS } from './data/seed-questions.js';

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

// Initialize services
const repository = new InMemoryRepository();
const assessmentService = new AssessmentService(repository);
const clientService = new ClientService(repository);
const reportGenerator = new ReportGenerator(repository);

// Seed data
for (const template of TEMPLATES) {
  repository.createTemplate(template);
}
for (const question of SEED_QUESTIONS) {
  repository.createQuestion(question);
}

export const tools: ToolDefinition[] = [
  {
    name: 'start_assessment',
    description: 'Start a new AI readiness assessment for a client',
    parameters: {
      type: 'object',
      properties: {
        client_name: { type: 'string', description: 'Name of the client company' },
        client_email: { type: 'string', description: 'Contact email for the client' },
        company: { type: 'string', description: 'Company name' },
        industry: { type: 'string', description: 'Industry classification' },
        assessment_type: {
          type: 'string',
          enum: ['full', 'quick', 'technical', 'process'],
          description: 'Type of assessment to conduct',
        },
        template_id: {
          type: 'string',
          description:
            'Assessment template ID (tmpl-data-scan, tmpl-doc-scan, tmpl-process-audit, tmpl-tech-stack)',
        },
        employee_count: {
          type: 'number',
          description: 'Number of employees',
        },
        tech_stack: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current technology stack',
        },
      },
      required: [
        'client_name',
        'client_email',
        'company',
        'industry',
        'assessment_type',
        'template_id',
      ],
    },
    handler: async (params) => {
      const client = clientService.createClient(
        params.company as string,
        params.client_name as string,
        params.client_email as string,
        params.industry as string,
        (params.employee_count as number) || 0,
        (params.tech_stack as string[]) || []
      );

      const assessment = assessmentService.startAssessment(
        client.id,
        params.client_email as string,
        params.template_id as string,
        params.assessment_type as any
      );

      return {
        success: true,
        assessmentId: assessment.id,
        clientId: client.id,
        message: `Assessment started for ${client.companyName}`,
      };
    },
  },

  {
    name: 'submit_response',
    description: 'Submit a response to an assessment question',
    parameters: {
      type: 'object',
      properties: {
        assessment_id: { type: 'string', description: 'Assessment ID' },
        question_id: { type: 'string', description: 'Question ID' },
        value: {
          type: ['string', 'number', 'array'],
          description: 'Response value',
        },
        notes: {
          type: 'string',
          description: 'Optional notes or explanations',
        },
      },
      required: ['assessment_id', 'question_id', 'value'],
    },
    handler: async (params) => {
      const response = assessmentService.submitResponse(
        params.assessment_id as string,
        params.question_id as string,
        params.value as any,
        params.notes as string
      );

      return {
        success: true,
        responseId: response.id,
        score: response.score,
        message: 'Response recorded',
      };
    },
  },

  {
    name: 'get_score',
    description: 'Get current assessment score and category breakdown',
    parameters: {
      type: 'object',
      properties: {
        assessment_id: { type: 'string', description: 'Assessment ID' },
      },
      required: ['assessment_id'],
    },
    handler: async (params) => {
      const assessment = repository.getAssessment(params.assessment_id as string);
      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      return {
        success: true,
        assessmentId: assessment.id,
        totalScore: assessment.totalScore,
        status: assessment.status,
        categoryScores: assessment.categoryScores,
      };
    },
  },

  {
    name: 'get_recommendations',
    description: 'Get AI readiness recommendations based on assessment results',
    parameters: {
      type: 'object',
      properties: {
        assessment_id: { type: 'string', description: 'Assessment ID' },
      },
      required: ['assessment_id'],
    },
    handler: async (params) => {
      const recommendations = repository.getRecommendationsByAssessment(
        params.assessment_id as string
      );

      if (recommendations.length === 0) {
        return {
          success: false,
          error: 'Assessment not yet completed. Complete the assessment first.',
        };
      }

      return {
        success: true,
        assessmentId: params.assessment_id,
        recommendationCount: recommendations.length,
        recommendations: recommendations.map((r) => ({
          id: r.id,
          priority: r.priority,
          title: r.title,
          description: r.description,
          estimatedRoi: r.estimatedRoi,
          estimatedEffort: r.estimatedEffort,
          toolsSuggested: r.toolsSuggested,
        })),
      };
    },
  },

  {
    name: 'generate_report',
    description: 'Generate a formatted assessment report',
    parameters: {
      type: 'object',
      properties: {
        assessment_id: { type: 'string', description: 'Assessment ID' },
      },
      required: ['assessment_id'],
    },
    handler: async (params) => {
      const { assessment, responses, recommendations } =
        assessmentService.getAssessmentResults(params.assessment_id as string);

      const report = reportGenerator.generateReport(
        assessment,
        responses,
        recommendations
      );

      return {
        success: true,
        report,
      };
    },
  },

  {
    name: 'get_next_questions',
    description: 'Get the next unanswered questions for an assessment',
    parameters: {
      type: 'object',
      properties: {
        assessment_id: { type: 'string', description: 'Assessment ID' },
        template_id: { type: 'string', description: 'Template ID' },
        count: {
          type: 'number',
          description: 'Number of questions to retrieve (default: 5)',
        },
      },
      required: ['assessment_id', 'template_id'],
    },
    handler: async (params) => {
      const questions = assessmentService.getNextQuestions(
        params.assessment_id as string,
        params.template_id as string,
        (params.count as number) || 5
      );

      return {
        success: true,
        assessmentId: params.assessment_id,
        questionCount: questions.length,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          category: q.category,
          type: q.questionType,
          options: q.options,
          description: q.description,
        })),
      };
    },
  },

  {
    name: 'complete_assessment',
    description: 'Complete an assessment and generate recommendations',
    parameters: {
      type: 'object',
      properties: {
        assessment_id: { type: 'string', description: 'Assessment ID' },
      },
      required: ['assessment_id'],
    },
    handler: async (params) => {
      const assessment = assessmentService.completeAssessment(
        params.assessment_id as string
      );

      return {
        success: true,
        assessmentId: assessment.id,
        totalScore: assessment.totalScore,
        status: assessment.status,
        completedAt: assessment.completedAt?.toISOString(),
        message: 'Assessment completed and recommendations generated',
      };
    },
  },
];
