import { z } from 'zod';

// Enums
export const CourseCategory = z.enum([
  'ai_fundamentals',
  'data_strategy',
  'automation',
  'industry_specific',
  'leadership',
]);

export const CourseLevel = z.enum(['beginner', 'intermediate', 'advanced']);

export const ContentType = z.enum(['video', 'reading', 'exercise', 'quiz']);

export const PlanType = z.enum(['free', 'basic', 'professional', 'enterprise']);

export const EnrollmentStatus = z.enum([
  'active',
  'completed',
  'paused',
  'dropped',
]);

export const WorkshopStatus = z.enum([
  'scheduled',
  'live',
  'completed',
  'cancelled',
]);

export const WorkshopFormat = z.enum(['virtual', 'in_person', 'hybrid']);

export const RegistrationStatus = z.enum([
  'registered',
  'attended',
  'no_show',
  'cancelled',
]);

export const ConsultationType = z.enum([
  'one_on_one',
  'team',
  'assessment_review',
]);

export const ConsultationStatus = z.enum([
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
]);

export const ResourceType = z.enum([
  'case_study',
  'white_paper',
  'guide',
  'video',
  'template',
]);

export const ResourceAccessLevel = z.enum(['free', 'basic', 'professional']);

// Module schema
export const ModuleSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  title: z.string(),
  description: z.string(),
  order: z.number().int().min(1),
  duration_minutes: z.number().int().min(1),
  content_type: ContentType,
});

export type Module = z.infer<typeof ModuleSchema>;

// Course schema
export const CourseSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  title: z.string(),
  description: z.string(),
  category: CourseCategory,
  level: CourseLevel,
  modules: z.array(ModuleSchema),
  total_duration_minutes: z.number().int().min(1),
  price_cents: z.number().int().min(0),
  instructor_id: z.string().uuid(),
  prerequisites: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published', 'archived']),
  max_students: z.number().int().min(1).optional().default(100),
  enrolled_count: z.number().int().min(0).optional().default(0),
  rating: z.number().min(0).max(5).optional().default(0),
  created_at: z.date().optional().default(() => new Date()),
  updated_at: z.date().optional().default(() => new Date()),
});

export type Course = z.infer<typeof CourseSchema>;

// Student schema
export const CertificationSchema = z.object({
  course_id: z.string().uuid(),
  issued_at: z.date(),
  certificate_url: z.string().url(),
});

export type Certification = z.infer<typeof CertificationSchema>;

export const StudentSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional().default(''),
  role: z.string().optional().default(''),
  industry: z.string().optional().default(''),
  plan: PlanType,
  enrolled_courses: z.array(z.string().uuid()).optional().default([]),
  completed_courses: z.array(z.string().uuid()).optional().default([]),
  total_learning_hours: z.number().min(0).optional().default(0),
  certifications: z.array(CertificationSchema).optional().default([]),
  created_at: z.date().optional().default(() => new Date()),
  updated_at: z.date().optional().default(() => new Date()),
});

export type Student = z.infer<typeof StudentSchema>;

// Enrollment schema
export const ModuleCompletionSchema = z.object({
  module_id: z.string().uuid(),
  completed_at: z.date(),
  score: z.number().min(0).max(100).optional(),
});

export type ModuleCompletion = z.infer<typeof ModuleCompletionSchema>;

export const EnrollmentSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  status: EnrollmentStatus,
  enrolled_at: z.date().optional().default(() => new Date()),
  completed_at: z.date().optional(),
  progress_pct: z.number().int().min(0).max(100).optional().default(0),
  current_module_id: z.string().uuid().optional(),
  module_completions: z.array(ModuleCompletionSchema).optional().default([]),
  time_spent_minutes: z.number().int().min(0).optional().default(0),
});

export type Enrollment = z.infer<typeof EnrollmentSchema>;

// Workshop schema
export const WorkshopMaterialSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export type WorkshopMaterial = z.infer<typeof WorkshopMaterialSchema>;

export const WorkshopSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  title: z.string(),
  description: z.string(),
  instructor_id: z.string().uuid(),
  instructor_name: z.string(),
  date: z.date(),
  start_time: z.string(), // HH:MM format
  end_time: z.string(), // HH:MM format
  timezone: z.string(),
  max_participants: z.number().int().min(1),
  registered_count: z.number().int().min(0).optional().default(0),
  price_cents: z.number().int().min(0),
  format: WorkshopFormat,
  meeting_url: z.string().url().optional(),
  location: z.string().optional(),
  status: WorkshopStatus,
  recording_url: z.string().url().optional(),
  materials: z.array(WorkshopMaterialSchema).optional().default([]),
  created_at: z.date().optional().default(() => new Date()),
});

export type Workshop = z.infer<typeof WorkshopSchema>;

// Workshop registration schema
export const WorkshopRegistrationSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  workshop_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: RegistrationStatus,
  registered_at: z.date().optional().default(() => new Date()),
  attended_at: z.date().optional(),
});

export type WorkshopRegistration = z.infer<typeof WorkshopRegistrationSchema>;

// Consultation schema
export const ConsultationSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  student_id: z.string().uuid(),
  consultant_id: z.string().uuid(),
  type: ConsultationType,
  date: z.date(),
  start_time: z.string(), // HH:MM format
  end_time: z.string(), // HH:MM format
  timezone: z.string(),
  status: ConsultationStatus,
  meeting_url: z.string().url().optional(),
  notes: z.string().optional().default(''),
  follow_up_actions: z.array(z.string()).optional().default([]),
  price_cents: z.number().int().min(0),
  created_at: z.date().optional().default(() => new Date()),
});

export type Consultation = z.infer<typeof ConsultationSchema>;

// Resource schema
export const ResourceSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  title: z.string(),
  description: z.string(),
  type: ResourceType,
  category: z.string(),
  industry: z.string(),
  url: z.string().url(),
  download_count: z.number().int().min(0).optional().default(0),
  access_level: ResourceAccessLevel,
  tags: z.array(z.string()).optional().default([]),
  created_at: z.date().optional().default(() => new Date()),
});

export type Resource = z.infer<typeof ResourceSchema>;

// Certificate schema
export const CertificateSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string(),
  issued_at: z.date().optional().default(() => new Date()),
  certificate_number: z.string(),
  verification_url: z.string().url(),
});

export type Certificate = z.infer<typeof CertificateSchema>;
