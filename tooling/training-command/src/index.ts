// Exports for public API

// Data layer
export {
  IRepository,
  InMemoryRepository,
} from './data/repository';
export * from './data/schema';
export { seedCourses, seedStudents, seedWorkshops } from './data/seed';

// Services
export {
  CourseService,
  EnrollmentService,
  ProgressService,
  WorkshopService,
  ConsultationService,
  ResourceService,
  CertificateService,
} from './services';
export type { ProgressSummary } from './services/progress-service';

// API
export { APIHandlers } from './api/handlers';

// Hooks
export { EnrollmentTrigger, type EnrollmentEvent } from './hooks/enrollment-trigger';
export { CompletionHandler, type CompletionEvent } from './hooks/completion-handler';
export { ReminderScheduler } from './hooks/reminder-scheduler';

// Reporting
export { StudentProgressReport } from './reporting/student-progress-report';
export type {
  StudentProgressMetrics,
  AggregateProgressMetrics,
} from './reporting/student-progress-report';
export { CourseAnalytics } from './reporting/course-analytics';
export type { CourseAnalytics as CourseAnalyticsType } from './reporting/course-analytics';
export { RevenueReport } from './reporting/revenue-report';
export type { RevenueMetrics } from './reporting/revenue-report';

// Config
export { PLATFORM_CONFIG, PRICING_TIERS, COURSE_CATALOG_RULES, WORKSHOP_RULES, CERTIFICATE_RULES, CONSULTATION_RULES } from './config/index';

// LLM Tools
export { createToolDefinitions, createToolHandlers, TRAINING_COMMAND_TOOLS } from './tools';
export type { ToolDefinition, ToolInput, ToolHandler } from './tools';
