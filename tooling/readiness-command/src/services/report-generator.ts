import { Assessment, Response, Recommendation } from '../data/firestore-schema.js';
import { InMemoryRepository } from '../data/in-memory-repository.js';

export interface AssessmentReport {
  assessmentId: string;
  assessmentType: string;
  status: string;
  completedAt?: string;
  totalScore: number;
  categoryScores: Record<string, any>;
  summary: string;
  recommendations: Array<{
    priority: string;
    title: string;
    description: string;
    estimatedRoi: string;
    estimatedEffort: string;
  }>;
  nextSteps: string[];
}

export class ReportGenerator {
  constructor(private repository: InMemoryRepository) {}

  generateReport(
    assessment: Assessment,
    responses: Response[],
    recommendations: Recommendation[]
  ): AssessmentReport {
    const summary = this.generateSummary(
      assessment.totalScore,
      assessment.categoryScores
    );

    const nextSteps = this.generateNextSteps(
      assessment.totalScore,
      recommendations
    );

    return {
      assessmentId: assessment.id,
      assessmentType: assessment.assessmentType,
      status: assessment.status,
      completedAt: assessment.completedAt?.toISOString(),
      totalScore: assessment.totalScore,
      categoryScores: assessment.categoryScores,
      summary,
      recommendations: recommendations.map((r) => ({
        priority: r.priority,
        title: r.title,
        description: r.description,
        estimatedRoi: r.estimatedRoi,
        estimatedEffort: r.estimatedEffort,
      })),
      nextSteps,
    };
  }

  private generateSummary(
    totalScore: number,
    categoryScores: Record<string, any>
  ): string {
    let summary = '';

    if (totalScore < 25) {
      summary =
        'Your organization is at an early stage of AI readiness. There are significant opportunities for improvement across all dimensions. ';
    } else if (totalScore < 50) {
      summary =
        'Your organization has foundational elements in place but needs to strengthen AI capabilities and governance. ';
    } else if (totalScore < 75) {
      summary =
        'Your organization has good AI readiness fundamentals. Focus on scaling and optimization to maximize value. ';
    } else {
      summary =
        'Your organization demonstrates strong AI readiness. Continue optimizing and exploring advanced applications. ';
    }

    // Add category insights
    const lowestCategory = Object.entries(categoryScores).sort(
      ([, a], [, b]) => (a.pct || 0) - (b.pct || 0)
    )[0];

    if (lowestCategory) {
      summary += `The lowest-scoring area is ${lowestCategory[0].replace(/_/g, ' ')}, which should be a priority for improvement.`;
    }

    return summary;
  }

  private generateNextSteps(
    totalScore: number,
    recommendations: Recommendation[]
  ): string[] {
    const nextSteps: string[] = [];

    // Sort recommendations by priority
    const immediateRecs = recommendations.filter((r) => r.priority === 'immediate');
    const shortTermRecs = recommendations.filter((r) => r.priority === 'short_term');

    if (totalScore < 50) {
      nextSteps.push('Schedule a strategic planning session with stakeholders');
      nextSteps.push(
        'Establish an AI governance committee or steering group'
      );
      if (immediateRecs.length > 0) {
        nextSteps.push(`Address immediate priorities: ${immediateRecs.map((r) => r.title).join(', ')}`);
      }
    } else if (totalScore < 75) {
      nextSteps.push('Create an AI Center of Excellence');
      nextSteps.push('Develop detailed implementation roadmap');
      if (shortTermRecs.length > 0) {
        nextSteps.push(`Focus on short-term initiatives: ${shortTermRecs.map((r) => r.title).join(', ')}`);
      }
    } else {
      nextSteps.push('Establish innovation labs for emerging technologies');
      nextSteps.push('Develop advanced AI/ML capabilities');
      nextSteps.push('Consider partnering with external research institutions');
    }

    nextSteps.push('Schedule quarterly reviews to track progress');
    return nextSteps;
  }
}
