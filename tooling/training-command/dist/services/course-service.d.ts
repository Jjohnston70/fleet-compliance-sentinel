import { Course } from '../data/schema';
import { IRepository } from '../data/repository';
export declare class CourseService {
    private repo;
    constructor(repo: IRepository);
    createCourse(course: Course): Promise<Course>;
    getCourse(id: string): Promise<Course | null>;
    listCourses(filters?: {
        category?: string;
        level?: string;
        tag?: string;
    }): Promise<Course[]>;
    updateCourse(id: string, updates: Partial<Course>): Promise<Course>;
    deleteCourse(id: string): Promise<void>;
    calculateCourseRating(courseId: string): Promise<number>;
    checkEnrollmentCapacity(courseId: string): Promise<boolean>;
    searchCourses(query: string): Promise<Course[]>;
}
//# sourceMappingURL=course-service.d.ts.map