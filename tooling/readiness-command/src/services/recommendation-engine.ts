import { Recommendation } from '../data/firestore-schema.js';

export interface CategoryScore {
  score: number;
  maxScore: number;
  pct: number;
}

export class RecommendationEngine {
  generateRecommendations(
    assessmentId: string,
    totalScore: number,
    categoryScores: Record<string, CategoryScore>
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let id = 1;

    // Priority assignment based on total score
    const overallPriority = this.getPriority(totalScore);

    // Score-based recommendations
    if (totalScore < 25) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'overall',
        priority: 'immediate',
        title: 'Critical AI Readiness Assessment',
        description:
          'Your organization is at an early stage of AI readiness. Immediate action is required to establish foundational infrastructure and capabilities.',
        estimatedRoi: 'High (200-400%)',
        estimatedEffort: 'high',
        toolsSuggested: [
          'AI Readiness Assessment Framework',
          'Infrastructure Audit',
          'Change Management Training',
        ],
        createdAt: new Date(),
      });
    } else if (totalScore < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'overall',
        priority: 'short_term',
        title: 'Build AI Readiness Foundation',
        description:
          'Focus on establishing core AI capabilities and governance frameworks. Address foundational gaps before advanced implementations.',
        estimatedRoi: 'Very High (150-300%)',
        estimatedEffort: 'high',
        toolsSuggested: [
          'Data Governance Platform',
          'AI/ML Platform',
          'Skills Development Program',
        ],
        createdAt: new Date(),
      });
    } else if (totalScore < 75) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'overall',
        priority: 'medium_term',
        title: 'Scale AI Capabilities',
        description:
          'You have a solid foundation. Now focus on scaling successful pilots and expanding AI usage across more processes.',
        estimatedRoi: 'High (100-200%)',
        estimatedEffort: 'medium',
        toolsSuggested: [
          'AI Center of Excellence',
          'Advanced Analytics Platform',
          'Process Automation Tools',
        ],
        createdAt: new Date(),
      });
    } else {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'overall',
        priority: 'long_term',
        title: 'Optimize and Innovate',
        description:
          'Your organization has strong AI readiness. Focus on optimization, continuous improvement, and exploring cutting-edge AI technologies.',
        estimatedRoi: 'Medium (50-150%)',
        estimatedEffort: 'low',
        toolsSuggested: [
          'Advanced AI/ML Research',
          'Custom Model Development',
          'AI Ethics & Governance',
        ],
        createdAt: new Date(),
      });
    }

    // Category-specific recommendations
    const categoryRecs = this.getCategorySpecificRecommendations(
      assessmentId,
      categoryScores
    );
    recommendations.push(...categoryRecs);

    return recommendations;
  }

  private getPriority(
    score: number
  ): 'immediate' | 'short_term' | 'medium_term' | 'long_term' {
    if (score < 25) return 'immediate';
    if (score < 50) return 'short_term';
    if (score < 75) return 'medium_term';
    return 'long_term';
  }

  private getCategorySpecificRecommendations(
    assessmentId: string,
    categoryScores: Record<string, CategoryScore>
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let id = 100;

    // Process Maturity
    if (categoryScores['process_maturity']?.pct < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'process_maturity',
        priority: 'immediate',
        title: 'Establish Process Management Discipline',
        description:
          'Develop standardized processes, documentation, and governance frameworks for AI initiatives.',
        estimatedRoi: 'High',
        estimatedEffort: 'medium',
        toolsSuggested: [
          'Process Mining Software',
          'BPM Platform',
          'Documentation Tools',
        ],
        createdAt: new Date(),
      });
    } else if (categoryScores['process_maturity']?.pct < 75) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'process_maturity',
        priority: 'short_term',
        title: 'Optimize Process Workflows',
        description:
          'Refine existing processes and implement continuous improvement practices.',
        estimatedRoi: 'Medium',
        estimatedEffort: 'medium',
        toolsSuggested: ['Workflow Automation', 'Analytics Dashboard'],
        createdAt: new Date(),
      });
    }

    // Data Readiness
    if (categoryScores['data_readiness']?.pct < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'data_readiness',
        priority: 'immediate',
        title: 'Build Data Infrastructure',
        description:
          'Implement data management systems, data governance, and quality assurance processes.',
        estimatedRoi: 'Very High',
        estimatedEffort: 'high',
        toolsSuggested: ['Data Warehouse', 'Data Governance Platform', 'ETL Tools'],
        createdAt: new Date(),
      });
    } else if (categoryScores['data_readiness']?.pct < 75) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'data_readiness',
        priority: 'short_term',
        title: 'Enhance Data Quality and Integration',
        description:
          'Improve data quality, implement better integration mechanisms, and expand data accessibility.',
        estimatedRoi: 'High',
        estimatedEffort: 'medium',
        toolsSuggested: ['Data Quality Tools', 'Integration Platforms', 'APIs'],
        createdAt: new Date(),
      });
    }

    // Tech Infrastructure
    if (categoryScores['tech_infrastructure']?.pct < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'tech_infrastructure',
        priority: 'immediate',
        title: 'Modernize Technology Stack',
        description:
          'Upgrade outdated systems, improve infrastructure, and implement cloud-based solutions.',
        estimatedRoi: 'High',
        estimatedEffort: 'high',
        toolsSuggested: [
          'Cloud Platform (AWS/Azure/GCP)',
          'Infrastructure as Code',
          'Containerization',
        ],
        createdAt: new Date(),
      });
    } else if (categoryScores['tech_infrastructure']?.pct < 75) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'tech_infrastructure',
        priority: 'medium_term',
        title: 'Enhance Integration Capabilities',
        description:
          'Improve system integration and API accessibility for better data flow.',
        estimatedRoi: 'Medium',
        estimatedEffort: 'medium',
        toolsSuggested: ['API Gateway', 'Integration Middleware', 'Webhooks'],
        createdAt: new Date(),
      });
    }

    // Team Capability
    if (categoryScores['team_capability']?.pct < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'team_capability',
        priority: 'short_term',
        title: 'Develop AI Talent and Skills',
        description:
          'Implement training programs and hire specialized AI/ML talent to build organizational capability.',
        estimatedRoi: 'Very High',
        estimatedEffort: 'medium',
        toolsSuggested: [
          'Training Programs',
          'Hiring Partnerships',
          'Mentorship Programs',
        ],
        createdAt: new Date(),
      });
    } else if (categoryScores['team_capability']?.pct < 75) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'team_capability',
        priority: 'medium_term',
        title: 'Advance Technical Skills',
        description:
          'Deepen expertise in advanced AI/ML techniques and emerging technologies.',
        estimatedRoi: 'High',
        estimatedEffort: 'medium',
        toolsSuggested: ['Advanced Training', 'Certifications', 'Research Access'],
        createdAt: new Date(),
      });
    }

    // Budget Alignment
    if (categoryScores['budget_alignment']?.pct < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        assessmentId,
        category: 'budget_alignment',
        priority: 'short_term',
        title: 'Establish AI Investment Strategy',
        description:
          'Develop a clear business case and budget framework for AI initiatives aligned with strategic goals.',
        estimatedRoi: 'Critical for Planning',
        estimatedEffort: 'low',
        toolsSuggested: [
          'Financial Planning Tools',
          'ROI Calculator',
          'Business Case Templates',
        ],
        createdAt: new Date(),
      });
    }

    return recommendations;
  }
}
