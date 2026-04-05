/**
 * Outreach Service - Contact management and activity tracking
 */
import { OutreachContact, OutreachActivity } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export declare class OutreachService {
    private repo;
    constructor(repo: InMemoryRepository);
    createContact(name: string, email: string, agency: string, title: string, options?: Partial<OutreachContact>): Promise<OutreachContact>;
    getContact(id: string): Promise<OutreachContact | null>;
    listContacts(filters?: {
        agency?: string;
        status?: OutreachContact["status"];
        osdbu?: boolean;
    }): Promise<OutreachContact[]>;
    logActivity(contactId: string, activityType: OutreachActivity["activity_type"], subject: string, options?: Partial<OutreachActivity>): Promise<OutreachActivity>;
    getContactHistory(contactId: string): Promise<OutreachActivity[]>;
    scheduleFollowUp(contactId: string, subject: string, followUpDate: Date): Promise<OutreachActivity>;
    getPendingFollowUps(): Promise<OutreachActivity[]>;
    markActive(contactId: string): Promise<OutreachContact>;
    countByStatus(): Promise<Record<OutreachContact["status"], number>>;
}
//# sourceMappingURL=outreach-service.d.ts.map