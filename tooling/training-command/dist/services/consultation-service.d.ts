import { Consultation } from '../data/schema';
import { IRepository } from '../data/repository';
export declare class ConsultationService {
    private repo;
    constructor(repo: IRepository);
    bookConsultation(studentId: string, consultantId: string, type: 'one_on_one' | 'team' | 'assessment_review', date: Date, startTime: string, // HH:MM
    endTime: string, // HH:MM
    timezone: string): Promise<Consultation>;
    getConsultation(id: string): Promise<Consultation | null>;
    listStudentConsultations(studentId: string, filters?: {
        status?: string;
    }): Promise<Consultation[]>;
    cancelConsultation(id: string): Promise<Consultation>;
    completeConsultation(id: string, notes: string, followUpActions?: string[]): Promise<Consultation>;
    private calculatePrice;
}
//# sourceMappingURL=consultation-service.d.ts.map