import { IRepository } from '../data/repository';
import { CertificateService } from '../services/certificate-service';
export interface CompletionEvent {
    enrollmentId: string;
    studentId: string;
    courseId: string;
    completedAt: Date;
}
export declare class CompletionHandler {
    private repo;
    private certificateService;
    constructor(repo: IRepository, certificateService: CertificateService);
    onCourseCompleted(event: CompletionEvent): Promise<void>;
    private offerFollowUpConsultation;
}
//# sourceMappingURL=completion-handler.d.ts.map