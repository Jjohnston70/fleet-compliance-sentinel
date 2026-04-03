import { IRepository } from '../data/repository';
import { Course, Workshop, Consultation } from '../data/schema';
export declare class APIHandlers {
    private courseService;
    private enrollmentService;
    private progressService;
    private workshopService;
    private consultationService;
    private resourceService;
    private certificateService;
    constructor(repo: IRepository);
    listCourses(filters?: {
        category?: string;
        level?: string;
    }): Promise<Course[]>;
    getCourse(id: string): Promise<Course | null>;
    createCourse(course: Course): Promise<Course>;
    enrollStudent(studentId: string, courseId: string): Promise<{
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
    }>;
    getEnrollmentProgress(enrollmentId: string): Promise<{
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
    } | null>;
    completeModule(enrollmentId: string, moduleId: string, score?: number): Promise<{
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
    }>;
    getProgressSummary(enrollmentId: string): Promise<import("../services").ProgressSummary>;
    getStudentStats(studentId: string): Promise<{
        totalCoursesEnrolled: number;
        totalCoursesCompleted: number;
        totalLearningHours: number;
        averageProgressAcrossActive: number;
    }>;
    listWorkshops(filters?: {
        status?: string;
    }): Promise<Workshop[]>;
    getWorkshop(id: string): Promise<Workshop | null>;
    registerForWorkshop(workshopId: string, studentId: string): Promise<{
        id: string;
        status: "cancelled" | "registered" | "attended" | "no_show";
        student_id: string;
        workshop_id: string;
        registered_at: Date;
        attended_at?: Date | undefined;
    }>;
    recordAttendance(registrationId: string, attended: boolean): Promise<{
        id: string;
        status: "cancelled" | "registered" | "attended" | "no_show";
        student_id: string;
        workshop_id: string;
        registered_at: Date;
        attended_at?: Date | undefined;
    }>;
    bookConsultation(studentId: string, consultantId: string, type: 'one_on_one' | 'team' | 'assessment_review', date: Date, startTime: string, endTime: string, timezone: string): Promise<Consultation>;
    listConsultations(studentId: string, filters?: {
        status?: string;
    }): Promise<{
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
    }[]>;
    listResources(filters?: {
        type?: string;
        category?: string;
        studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise';
    }): Promise<{
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
    }[]>;
    getResource(id: string, studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise'): Promise<{
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
    } | null>;
    getStudentCertificates(studentId: string): Promise<{
        id: string;
        title: string;
        course_id: string;
        issued_at: Date;
        student_id: string;
        certificate_number: string;
        verification_url: string;
    }[]>;
    issueCertificate(studentId: string, courseId: string, courseTitle: string): Promise<{
        id: string;
        title: string;
        course_id: string;
        issued_at: Date;
        student_id: string;
        certificate_number: string;
        verification_url: string;
    }>;
    verifyCertificate(certificateNumber: string): Promise<{
        id: string;
        title: string;
        course_id: string;
        issued_at: Date;
        student_id: string;
        certificate_number: string;
        verification_url: string;
    } | null>;
    getStudentDashboard(studentId: string): Promise<{
        student: any;
        stats: {
            totalCoursesEnrolled: number;
            totalCoursesCompleted: number;
            totalLearningHours: number;
            averageProgressAcrossActive: number;
        };
        activeEnrollments: import("../services").ProgressSummary[];
        certificates: {
            id: string;
            title: string;
            course_id: string;
            issued_at: Date;
            student_id: string;
            certificate_number: string;
            verification_url: string;
        }[];
    } | null>;
}
//# sourceMappingURL=handlers.d.ts.map