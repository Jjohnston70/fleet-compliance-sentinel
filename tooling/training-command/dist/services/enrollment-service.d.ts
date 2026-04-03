import { Enrollment } from '../data/schema';
import { IRepository } from '../data/repository';
import { CertificateService } from './certificate-service';
export declare class EnrollmentService {
    private repo;
    private certificateService;
    constructor(repo: IRepository, certificateService: CertificateService);
    enrollStudent(studentId: string, courseId: string): Promise<Enrollment>;
    getEnrollmentProgress(enrollmentId: string): Promise<Enrollment | null>;
    completeModule(enrollmentId: string, moduleId: string, score?: number): Promise<Enrollment>;
    markCourseComplete(enrollmentId: string): Promise<Enrollment>;
    pauseEnrollment(enrollmentId: string): Promise<Enrollment>;
    resumeEnrollment(enrollmentId: string): Promise<Enrollment>;
    dropEnrollment(enrollmentId: string): Promise<Enrollment>;
    private getCourseLimitForPlan;
}
//# sourceMappingURL=enrollment-service.d.ts.map