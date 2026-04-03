import { ModuleCompletion } from '../data/schema';
import { IRepository } from '../data/repository';
export interface ProgressSummary {
    enrollmentId: string;
    studentId: string;
    courseId: string;
    progressPct: number;
    modulesCompleted: number;
    totalModules: number;
    timeSpentHours: number;
    currentStreak: number;
    lastActivity: Date | null;
    averageScore: number;
}
export declare class ProgressService {
    private repo;
    constructor(repo: IRepository);
    recordModuleCompletion(enrollmentId: string, moduleId: string, score?: number, timeSpentMinutes?: number): Promise<ModuleCompletion>;
    getProgressSummary(enrollmentId: string): Promise<ProgressSummary>;
    getStudentProgressAcrossEnrollments(studentId: string): Promise<ProgressSummary[]>;
    private calculateStreak;
    getStudentStats(studentId: string): Promise<{
        totalCoursesEnrolled: number;
        totalCoursesCompleted: number;
        totalLearningHours: number;
        averageProgressAcrossActive: number;
    }>;
}
//# sourceMappingURL=progress-service.d.ts.map