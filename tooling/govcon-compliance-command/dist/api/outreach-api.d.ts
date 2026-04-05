/**
 * Outreach API handlers
 */
import { OutreachService } from "../services/outreach-service.js";
import { OutreachContact, OutreachActivity } from "../data/schemas.js";
export interface OutreachAPI {
    createContact(name: string, email: string, agency: string, title: string): Promise<OutreachContact>;
    listContacts(filters?: {
        agency?: string;
        status?: OutreachContact["status"];
    }): Promise<OutreachContact[]>;
    getContact(id: string): Promise<OutreachContact | null>;
    logOutreachActivity(contactId: string, activityType: OutreachActivity["activity_type"], subject: string): Promise<OutreachActivity>;
    getOutreachHistory(contactId: string): Promise<OutreachActivity[]>;
    scheduleFollowUp(contactId: string, subject: string, followUpDate: Date): Promise<OutreachActivity>;
    getPendingFollowUps(): Promise<OutreachActivity[]>;
    countByStatus(): Promise<Record<OutreachContact["status"], number>>;
}
export declare function createOutreachAPI(service: OutreachService): OutreachAPI;
//# sourceMappingURL=outreach-api.d.ts.map