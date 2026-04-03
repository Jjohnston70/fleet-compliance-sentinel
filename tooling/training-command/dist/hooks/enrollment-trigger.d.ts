import { IRepository } from '../data/repository';
export interface EnrollmentEvent {
    studentId: string;
    courseId: string;
    enrollmentId: string;
    timestamp: Date;
}
export declare class EnrollmentTrigger {
    private repo;
    constructor(repo: IRepository);
    onStudentEnrolled(event: EnrollmentEvent): Promise<void>;
    private sendWelcomeEmail;
}
//# sourceMappingURL=enrollment-trigger.d.ts.map