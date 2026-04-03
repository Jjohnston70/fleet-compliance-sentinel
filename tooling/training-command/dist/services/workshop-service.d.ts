import { Workshop, WorkshopRegistration } from '../data/schema';
import { IRepository } from '../data/repository';
export declare class WorkshopService {
    private repo;
    constructor(repo: IRepository);
    createWorkshop(workshop: Workshop): Promise<Workshop>;
    getWorkshop(id: string): Promise<Workshop | null>;
    listWorkshops(filters?: {
        status?: string;
        instructorId?: string;
    }): Promise<Workshop[]>;
    updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop>;
    deleteWorkshop(id: string): Promise<void>;
    registerForWorkshop(workshopId: string, studentId: string): Promise<WorkshopRegistration>;
    cancelRegistration(registrationId: string): Promise<WorkshopRegistration>;
    recordAttendance(registrationId: string, attended: boolean): Promise<WorkshopRegistration>;
    getRegistrationsForWorkshop(workshopId: string): Promise<WorkshopRegistration[]>;
    getStudentRegistrations(studentId: string): Promise<WorkshopRegistration[]>;
}
//# sourceMappingURL=workshop-service.d.ts.map