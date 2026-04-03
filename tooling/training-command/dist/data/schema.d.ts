import { z } from 'zod';
export declare const CourseCategory: z.ZodEnum<["ai_fundamentals", "data_strategy", "automation", "industry_specific", "leadership"]>;
export declare const CourseLevel: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
export declare const ContentType: z.ZodEnum<["video", "reading", "exercise", "quiz"]>;
export declare const PlanType: z.ZodEnum<["free", "basic", "professional", "enterprise"]>;
export declare const EnrollmentStatus: z.ZodEnum<["active", "completed", "paused", "dropped"]>;
export declare const WorkshopStatus: z.ZodEnum<["scheduled", "live", "completed", "cancelled"]>;
export declare const WorkshopFormat: z.ZodEnum<["virtual", "in_person", "hybrid"]>;
export declare const RegistrationStatus: z.ZodEnum<["registered", "attended", "no_show", "cancelled"]>;
export declare const ConsultationType: z.ZodEnum<["one_on_one", "team", "assessment_review"]>;
export declare const ConsultationStatus: z.ZodEnum<["scheduled", "completed", "cancelled", "no_show"]>;
export declare const ResourceType: z.ZodEnum<["case_study", "white_paper", "guide", "video", "template"]>;
export declare const ResourceAccessLevel: z.ZodEnum<["free", "basic", "professional"]>;
export declare const ModuleSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
    duration_minutes: z.ZodNumber;
    content_type: z.ZodEnum<["video", "reading", "exercise", "quiz"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    order: number;
    duration_minutes: number;
    content_type: "video" | "reading" | "exercise" | "quiz";
}, {
    title: string;
    description: string;
    order: number;
    duration_minutes: number;
    content_type: "video" | "reading" | "exercise" | "quiz";
    id?: string | undefined;
}>;
export type Module = z.infer<typeof ModuleSchema>;
export declare const CourseSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["ai_fundamentals", "data_strategy", "automation", "industry_specific", "leadership"]>;
    level: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    modules: z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        order: z.ZodNumber;
        duration_minutes: z.ZodNumber;
        content_type: z.ZodEnum<["video", "reading", "exercise", "quiz"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        order: number;
        duration_minutes: number;
        content_type: "video" | "reading" | "exercise" | "quiz";
    }, {
        title: string;
        description: string;
        order: number;
        duration_minutes: number;
        content_type: "video" | "reading" | "exercise" | "quiz";
        id?: string | undefined;
    }>, "many">;
    total_duration_minutes: z.ZodNumber;
    price_cents: z.ZodNumber;
    instructor_id: z.ZodString;
    prerequisites: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodEnum<["draft", "published", "archived"]>;
    max_students: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    enrolled_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    rating: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    created_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    updated_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    status: "draft" | "published" | "archived";
    category: "ai_fundamentals" | "data_strategy" | "automation" | "industry_specific" | "leadership";
    level: "beginner" | "intermediate" | "advanced";
    modules: {
        id: string;
        title: string;
        description: string;
        order: number;
        duration_minutes: number;
        content_type: "video" | "reading" | "exercise" | "quiz";
    }[];
    total_duration_minutes: number;
    price_cents: number;
    instructor_id: string;
    prerequisites: string[];
    tags: string[];
    max_students: number;
    enrolled_count: number;
    rating: number;
    created_at: Date;
    updated_at: Date;
}, {
    title: string;
    description: string;
    status: "draft" | "published" | "archived";
    category: "ai_fundamentals" | "data_strategy" | "automation" | "industry_specific" | "leadership";
    level: "beginner" | "intermediate" | "advanced";
    modules: {
        title: string;
        description: string;
        order: number;
        duration_minutes: number;
        content_type: "video" | "reading" | "exercise" | "quiz";
        id?: string | undefined;
    }[];
    total_duration_minutes: number;
    price_cents: number;
    instructor_id: string;
    id?: string | undefined;
    prerequisites?: string[] | undefined;
    tags?: string[] | undefined;
    max_students?: number | undefined;
    enrolled_count?: number | undefined;
    rating?: number | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
}>;
export type Course = z.infer<typeof CourseSchema>;
export declare const CertificationSchema: z.ZodObject<{
    course_id: z.ZodString;
    issued_at: z.ZodDate;
    certificate_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    course_id: string;
    issued_at: Date;
    certificate_url: string;
}, {
    course_id: string;
    issued_at: Date;
    certificate_url: string;
}>;
export type Certification = z.infer<typeof CertificationSchema>;
export declare const StudentSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    email: z.ZodString;
    company: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    role: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    industry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    plan: z.ZodEnum<["free", "basic", "professional", "enterprise"]>;
    enrolled_courses: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    completed_courses: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    total_learning_hours: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    certifications: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        course_id: z.ZodString;
        issued_at: z.ZodDate;
        certificate_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        course_id: string;
        issued_at: Date;
        certificate_url: string;
    }, {
        course_id: string;
        issued_at: Date;
        certificate_url: string;
    }>, "many">>>;
    created_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    updated_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    email: string;
    company: string;
    role: string;
    industry: string;
    plan: "free" | "basic" | "professional" | "enterprise";
    enrolled_courses: string[];
    completed_courses: string[];
    total_learning_hours: number;
    certifications: {
        course_id: string;
        issued_at: Date;
        certificate_url: string;
    }[];
}, {
    name: string;
    email: string;
    plan: "free" | "basic" | "professional" | "enterprise";
    id?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    company?: string | undefined;
    role?: string | undefined;
    industry?: string | undefined;
    enrolled_courses?: string[] | undefined;
    completed_courses?: string[] | undefined;
    total_learning_hours?: number | undefined;
    certifications?: {
        course_id: string;
        issued_at: Date;
        certificate_url: string;
    }[] | undefined;
}>;
export type Student = z.infer<typeof StudentSchema>;
export declare const ModuleCompletionSchema: z.ZodObject<{
    module_id: z.ZodString;
    completed_at: z.ZodDate;
    score: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    module_id: string;
    completed_at: Date;
    score?: number | undefined;
}, {
    module_id: string;
    completed_at: Date;
    score?: number | undefined;
}>;
export type ModuleCompletion = z.infer<typeof ModuleCompletionSchema>;
export declare const EnrollmentSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    student_id: z.ZodString;
    course_id: z.ZodString;
    status: z.ZodEnum<["active", "completed", "paused", "dropped"]>;
    enrolled_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    completed_at: z.ZodOptional<z.ZodDate>;
    progress_pct: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    current_module_id: z.ZodOptional<z.ZodString>;
    module_completions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        module_id: z.ZodString;
        completed_at: z.ZodDate;
        score: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        module_id: string;
        completed_at: Date;
        score?: number | undefined;
    }, {
        module_id: string;
        completed_at: Date;
        score?: number | undefined;
    }>, "many">>>;
    time_spent_minutes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "active" | "completed" | "paused" | "dropped";
    course_id: string;
    student_id: string;
    enrolled_at: Date;
    progress_pct: number;
    module_completions: {
        module_id: string;
        completed_at: Date;
        score?: number | undefined;
    }[];
    time_spent_minutes: number;
    completed_at?: Date | undefined;
    current_module_id?: string | undefined;
}, {
    status: "active" | "completed" | "paused" | "dropped";
    course_id: string;
    student_id: string;
    id?: string | undefined;
    completed_at?: Date | undefined;
    enrolled_at?: Date | undefined;
    progress_pct?: number | undefined;
    current_module_id?: string | undefined;
    module_completions?: {
        module_id: string;
        completed_at: Date;
        score?: number | undefined;
    }[] | undefined;
    time_spent_minutes?: number | undefined;
}>;
export type Enrollment = z.infer<typeof EnrollmentSchema>;
export declare const WorkshopMaterialSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
}, {
    name: string;
    url: string;
}>;
export type WorkshopMaterial = z.infer<typeof WorkshopMaterialSchema>;
export declare const WorkshopSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    description: z.ZodString;
    instructor_id: z.ZodString;
    instructor_name: z.ZodString;
    date: z.ZodDate;
    start_time: z.ZodString;
    end_time: z.ZodString;
    timezone: z.ZodString;
    max_participants: z.ZodNumber;
    registered_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    price_cents: z.ZodNumber;
    format: z.ZodEnum<["virtual", "in_person", "hybrid"]>;
    meeting_url: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["scheduled", "live", "completed", "cancelled"]>;
    recording_url: z.ZodOptional<z.ZodString>;
    materials: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        url: string;
    }, {
        name: string;
        url: string;
    }>, "many">>>;
    created_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    status: "completed" | "scheduled" | "live" | "cancelled";
    date: Date;
    price_cents: number;
    instructor_id: string;
    created_at: Date;
    instructor_name: string;
    start_time: string;
    end_time: string;
    timezone: string;
    max_participants: number;
    registered_count: number;
    format: "virtual" | "in_person" | "hybrid";
    materials: {
        name: string;
        url: string;
    }[];
    meeting_url?: string | undefined;
    location?: string | undefined;
    recording_url?: string | undefined;
}, {
    title: string;
    description: string;
    status: "completed" | "scheduled" | "live" | "cancelled";
    date: Date;
    price_cents: number;
    instructor_id: string;
    instructor_name: string;
    start_time: string;
    end_time: string;
    timezone: string;
    max_participants: number;
    format: "virtual" | "in_person" | "hybrid";
    id?: string | undefined;
    created_at?: Date | undefined;
    registered_count?: number | undefined;
    meeting_url?: string | undefined;
    location?: string | undefined;
    recording_url?: string | undefined;
    materials?: {
        name: string;
        url: string;
    }[] | undefined;
}>;
export type Workshop = z.infer<typeof WorkshopSchema>;
export declare const WorkshopRegistrationSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    workshop_id: z.ZodString;
    student_id: z.ZodString;
    status: z.ZodEnum<["registered", "attended", "no_show", "cancelled"]>;
    registered_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    attended_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "cancelled" | "registered" | "attended" | "no_show";
    student_id: string;
    workshop_id: string;
    registered_at: Date;
    attended_at?: Date | undefined;
}, {
    status: "cancelled" | "registered" | "attended" | "no_show";
    student_id: string;
    workshop_id: string;
    id?: string | undefined;
    registered_at?: Date | undefined;
    attended_at?: Date | undefined;
}>;
export type WorkshopRegistration = z.infer<typeof WorkshopRegistrationSchema>;
export declare const ConsultationSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    student_id: z.ZodString;
    consultant_id: z.ZodString;
    type: z.ZodEnum<["one_on_one", "team", "assessment_review"]>;
    date: z.ZodDate;
    start_time: z.ZodString;
    end_time: z.ZodString;
    timezone: z.ZodString;
    status: z.ZodEnum<["scheduled", "completed", "cancelled", "no_show"]>;
    meeting_url: z.ZodOptional<z.ZodString>;
    notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    follow_up_actions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    price_cents: z.ZodNumber;
    created_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "one_on_one" | "team" | "assessment_review";
    status: "completed" | "scheduled" | "cancelled" | "no_show";
    date: Date;
    price_cents: number;
    created_at: Date;
    student_id: string;
    start_time: string;
    end_time: string;
    timezone: string;
    consultant_id: string;
    notes: string;
    follow_up_actions: string[];
    meeting_url?: string | undefined;
}, {
    type: "one_on_one" | "team" | "assessment_review";
    status: "completed" | "scheduled" | "cancelled" | "no_show";
    date: Date;
    price_cents: number;
    student_id: string;
    start_time: string;
    end_time: string;
    timezone: string;
    consultant_id: string;
    id?: string | undefined;
    created_at?: Date | undefined;
    meeting_url?: string | undefined;
    notes?: string | undefined;
    follow_up_actions?: string[] | undefined;
}>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export declare const ResourceSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<["case_study", "white_paper", "guide", "video", "template"]>;
    category: z.ZodString;
    industry: z.ZodString;
    url: z.ZodString;
    download_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    access_level: z.ZodEnum<["free", "basic", "professional"]>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    created_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    type: "video" | "case_study" | "white_paper" | "guide" | "template";
    category: string;
    tags: string[];
    created_at: Date;
    industry: string;
    url: string;
    download_count: number;
    access_level: "free" | "basic" | "professional";
}, {
    title: string;
    description: string;
    type: "video" | "case_study" | "white_paper" | "guide" | "template";
    category: string;
    industry: string;
    url: string;
    access_level: "free" | "basic" | "professional";
    id?: string | undefined;
    tags?: string[] | undefined;
    created_at?: Date | undefined;
    download_count?: number | undefined;
}>;
export type Resource = z.infer<typeof ResourceSchema>;
export declare const CertificateSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    student_id: z.ZodString;
    course_id: z.ZodString;
    title: z.ZodString;
    issued_at: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    certificate_number: z.ZodString;
    verification_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    course_id: string;
    issued_at: Date;
    student_id: string;
    certificate_number: string;
    verification_url: string;
}, {
    title: string;
    course_id: string;
    student_id: string;
    certificate_number: string;
    verification_url: string;
    id?: string | undefined;
    issued_at?: Date | undefined;
}>;
export type Certificate = z.infer<typeof CertificateSchema>;
//# sourceMappingURL=schema.d.ts.map