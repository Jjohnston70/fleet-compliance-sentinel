import { IRepository } from '../data/repository';
export interface StudentProgressMetrics {
    studentId: string;
    studentName: string;
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    completionRate: number;
    totalLearningHours: number;
    averageModuleScore: number;
    certificatesEarned: number;
}
export interface AggregateProgressMetrics {
    totalStudents: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageCompletionRate: number;
    averageLearningHours: number;
    totalCertificatesIssued: number;
}
export declare class StudentProgressReport {
    private repo;
    constructor(repo: IRepository);
    getStudentProgress(studentId: string): Promise<StudentProgressMetrics>;
    getAggregateProgress(): Promise<AggregateProgressMetrics>;
}
//# sourceMappingURL=student-progress-report.d.ts.map