// Firestore Schema Definitions for AI Readiness Assessment
// Firebase Project: singular-silo-463000-j6

export interface Assessment {
  id: string;
  clientId: string;
  assessorEmail: string;
  assessmentType: 'full' | 'quick' | 'technical' | 'process';
  status: 'in_progress' | 'completed' | 'expired';
  totalScore: number; // 0-100
  categoryScores: Record<
    string,
    { score: number; maxScore: number; pct: number }
  >;
  startedAt: Date;
  completedAt?: Date;
  expiresAt: Date; // 30 days from start
}

export interface AssessmentClient {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  employeeCount: number;
  currentTechStack: string[];
  createdAt: Date;
}

export interface Question {
  id: string;
  templateId: string;
  category:
    | 'process_maturity'
    | 'data_readiness'
    | 'tech_infrastructure'
    | 'team_capability'
    | 'budget_alignment';
  text: string;
  description?: string;
  questionType: 'scale' | 'select' | 'multi_select' | 'text' | 'boolean';
  options?: Array<{ value: string; label: string; score: number }>;
  weight: number; // 1-10
  order: number;
}

export interface Response {
  id: string;
  assessmentId: string;
  questionId: string;
  value: string | number | string[];
  score: number; // computed: question weight * answer score
  notes?: string;
  answeredAt: Date;
}

export interface Recommendation {
  id: string;
  assessmentId: string;
  category: string;
  priority: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  title: string;
  description: string;
  estimatedRoi: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  toolsSuggested: string[];
  createdAt: Date;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  categories: string[];
  questionCount: number;
  estimatedMinutes: number;
  active: boolean;
}
