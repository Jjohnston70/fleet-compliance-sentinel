"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateSchema = exports.ResourceSchema = exports.ConsultationSchema = exports.WorkshopRegistrationSchema = exports.WorkshopSchema = exports.WorkshopMaterialSchema = exports.EnrollmentSchema = exports.ModuleCompletionSchema = exports.StudentSchema = exports.CertificationSchema = exports.CourseSchema = exports.ModuleSchema = exports.ResourceAccessLevel = exports.ResourceType = exports.ConsultationStatus = exports.ConsultationType = exports.RegistrationStatus = exports.WorkshopFormat = exports.WorkshopStatus = exports.EnrollmentStatus = exports.PlanType = exports.ContentType = exports.CourseLevel = exports.CourseCategory = void 0;
const zod_1 = require("zod");
// Enums
exports.CourseCategory = zod_1.z.enum([
    'ai_fundamentals',
    'data_strategy',
    'automation',
    'industry_specific',
    'leadership',
]);
exports.CourseLevel = zod_1.z.enum(['beginner', 'intermediate', 'advanced']);
exports.ContentType = zod_1.z.enum(['video', 'reading', 'exercise', 'quiz']);
exports.PlanType = zod_1.z.enum(['free', 'basic', 'professional', 'enterprise']);
exports.EnrollmentStatus = zod_1.z.enum([
    'active',
    'completed',
    'paused',
    'dropped',
]);
exports.WorkshopStatus = zod_1.z.enum([
    'scheduled',
    'live',
    'completed',
    'cancelled',
]);
exports.WorkshopFormat = zod_1.z.enum(['virtual', 'in_person', 'hybrid']);
exports.RegistrationStatus = zod_1.z.enum([
    'registered',
    'attended',
    'no_show',
    'cancelled',
]);
exports.ConsultationType = zod_1.z.enum([
    'one_on_one',
    'team',
    'assessment_review',
]);
exports.ConsultationStatus = zod_1.z.enum([
    'scheduled',
    'completed',
    'cancelled',
    'no_show',
]);
exports.ResourceType = zod_1.z.enum([
    'case_study',
    'white_paper',
    'guide',
    'video',
    'template',
]);
exports.ResourceAccessLevel = zod_1.z.enum(['free', 'basic', 'professional']);
// Module schema
exports.ModuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    order: zod_1.z.number().int().min(1),
    duration_minutes: zod_1.z.number().int().min(1),
    content_type: exports.ContentType,
});
// Course schema
exports.CourseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    category: exports.CourseCategory,
    level: exports.CourseLevel,
    modules: zod_1.z.array(exports.ModuleSchema),
    total_duration_minutes: zod_1.z.number().int().min(1),
    price_cents: zod_1.z.number().int().min(0),
    instructor_id: zod_1.z.string().uuid(),
    prerequisites: zod_1.z.array(zod_1.z.string()).optional().default([]),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    status: zod_1.z.enum(['draft', 'published', 'archived']),
    max_students: zod_1.z.number().int().min(1).optional().default(100),
    enrolled_count: zod_1.z.number().int().min(0).optional().default(0),
    rating: zod_1.z.number().min(0).max(5).optional().default(0),
    created_at: zod_1.z.date().optional().default(() => new Date()),
    updated_at: zod_1.z.date().optional().default(() => new Date()),
});
// Student schema
exports.CertificationSchema = zod_1.z.object({
    course_id: zod_1.z.string().uuid(),
    issued_at: zod_1.z.date(),
    certificate_url: zod_1.z.string().url(),
});
exports.StudentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    company: zod_1.z.string().optional().default(''),
    role: zod_1.z.string().optional().default(''),
    industry: zod_1.z.string().optional().default(''),
    plan: exports.PlanType,
    enrolled_courses: zod_1.z.array(zod_1.z.string().uuid()).optional().default([]),
    completed_courses: zod_1.z.array(zod_1.z.string().uuid()).optional().default([]),
    total_learning_hours: zod_1.z.number().min(0).optional().default(0),
    certifications: zod_1.z.array(exports.CertificationSchema).optional().default([]),
    created_at: zod_1.z.date().optional().default(() => new Date()),
    updated_at: zod_1.z.date().optional().default(() => new Date()),
});
// Enrollment schema
exports.ModuleCompletionSchema = zod_1.z.object({
    module_id: zod_1.z.string().uuid(),
    completed_at: zod_1.z.date(),
    score: zod_1.z.number().min(0).max(100).optional(),
});
exports.EnrollmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    student_id: zod_1.z.string().uuid(),
    course_id: zod_1.z.string().uuid(),
    status: exports.EnrollmentStatus,
    enrolled_at: zod_1.z.date().optional().default(() => new Date()),
    completed_at: zod_1.z.date().optional(),
    progress_pct: zod_1.z.number().int().min(0).max(100).optional().default(0),
    current_module_id: zod_1.z.string().uuid().optional(),
    module_completions: zod_1.z.array(exports.ModuleCompletionSchema).optional().default([]),
    time_spent_minutes: zod_1.z.number().int().min(0).optional().default(0),
});
// Workshop schema
exports.WorkshopMaterialSchema = zod_1.z.object({
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
});
exports.WorkshopSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    instructor_id: zod_1.z.string().uuid(),
    instructor_name: zod_1.z.string(),
    date: zod_1.z.date(),
    start_time: zod_1.z.string(), // HH:MM format
    end_time: zod_1.z.string(), // HH:MM format
    timezone: zod_1.z.string(),
    max_participants: zod_1.z.number().int().min(1),
    registered_count: zod_1.z.number().int().min(0).optional().default(0),
    price_cents: zod_1.z.number().int().min(0),
    format: exports.WorkshopFormat,
    meeting_url: zod_1.z.string().url().optional(),
    location: zod_1.z.string().optional(),
    status: exports.WorkshopStatus,
    recording_url: zod_1.z.string().url().optional(),
    materials: zod_1.z.array(exports.WorkshopMaterialSchema).optional().default([]),
    created_at: zod_1.z.date().optional().default(() => new Date()),
});
// Workshop registration schema
exports.WorkshopRegistrationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    workshop_id: zod_1.z.string().uuid(),
    student_id: zod_1.z.string().uuid(),
    status: exports.RegistrationStatus,
    registered_at: zod_1.z.date().optional().default(() => new Date()),
    attended_at: zod_1.z.date().optional(),
});
// Consultation schema
exports.ConsultationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    student_id: zod_1.z.string().uuid(),
    consultant_id: zod_1.z.string().uuid(),
    type: exports.ConsultationType,
    date: zod_1.z.date(),
    start_time: zod_1.z.string(), // HH:MM format
    end_time: zod_1.z.string(), // HH:MM format
    timezone: zod_1.z.string(),
    status: exports.ConsultationStatus,
    meeting_url: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().optional().default(''),
    follow_up_actions: zod_1.z.array(zod_1.z.string()).optional().default([]),
    price_cents: zod_1.z.number().int().min(0),
    created_at: zod_1.z.date().optional().default(() => new Date()),
});
// Resource schema
exports.ResourceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    type: exports.ResourceType,
    category: zod_1.z.string(),
    industry: zod_1.z.string(),
    url: zod_1.z.string().url(),
    download_count: zod_1.z.number().int().min(0).optional().default(0),
    access_level: exports.ResourceAccessLevel,
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    created_at: zod_1.z.date().optional().default(() => new Date()),
});
// Certificate schema
exports.CertificateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    student_id: zod_1.z.string().uuid(),
    course_id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    issued_at: zod_1.z.date().optional().default(() => new Date()),
    certificate_number: zod_1.z.string(),
    verification_url: zod_1.z.string().url(),
});
//# sourceMappingURL=schema.js.map