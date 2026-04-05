/**
 * Outreach API handlers
 */

import { OutreachService } from "../services/outreach-service.js";
import { OutreachContact, OutreachActivity } from "../data/schemas.js";

export interface OutreachAPI {
  createContact(name: string, email: string, agency: string, title: string): Promise<OutreachContact>;
  listContacts(filters?: { agency?: string; status?: OutreachContact["status"] }): Promise<OutreachContact[]>;
  getContact(id: string): Promise<OutreachContact | null>;
  logOutreachActivity(contactId: string, activityType: OutreachActivity["activity_type"], subject: string): Promise<OutreachActivity>;
  getOutreachHistory(contactId: string): Promise<OutreachActivity[]>;
  scheduleFollowUp(contactId: string, subject: string, followUpDate: Date): Promise<OutreachActivity>;
  getPendingFollowUps(): Promise<OutreachActivity[]>;
  countByStatus(): Promise<Record<OutreachContact["status"], number>>;
}

export function createOutreachAPI(service: OutreachService): OutreachAPI {
  return {
    async createContact(name, email, agency, title) { return service.createContact(name, email, agency, title); },
    async listContacts(filters) { return service.listContacts(filters); },
    async getContact(id) { return service.getContact(id); },
    async logOutreachActivity(contactId, activityType, subject) { return service.logActivity(contactId, activityType, subject); },
    async getOutreachHistory(contactId) { return service.getContactHistory(contactId); },
    async scheduleFollowUp(contactId, subject, followUpDate) { return service.scheduleFollowUp(contactId, subject, followUpDate); },
    async getPendingFollowUps() { return service.getPendingFollowUps(); },
    async countByStatus() { return service.countByStatus(); },
  };
}
