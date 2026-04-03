import { IRepository } from '../data/repository';
export interface CourseAnalyticsData {
    courseId: string;
    courseTitle: string;
    totalEnrolled: number;
    totalCompleted: number;
    completionRate: number;
    averageProgressPercentage: number;
    averageTimeSpentHours: number;
    averageModuleScore: number;
    dropoutRate: number;
    mostPopularModule: string;
}
export interface CourseEnrollmentTrend {
    date: Date;
    newEnrollments: number;
    completions: number;
    totalActive: number;
}
export declare class CourseAnalytics {
    private repo;
    constructor(repo: IRepository);
    getCourseAnalytics(courseId: string): Promise<CourseAnalyticsData>;
    getAllCoursesAnalytics(): Promise<CourseAnalyticsData[]>;
}
//# sourceMappingURL=course-analytics.d.ts.map