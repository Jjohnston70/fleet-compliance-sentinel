/**
 * Outreach Service - Contact management and activity tracking
 */

import { OutreachContact, OutreachActivity } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";

export class OutreachService {
  constructor(private repo: InMemoryRepository) {}

  /**
   * Create a new outreach contact
   */
  async createContact(
    name: string,
    email: string,
    agency: string,
    title: string,
    options?: Partial<OutreachContact>
  ): Promise<OutreachContact> {
    return this.repo.createOutreachContact({
      name,
      email,
      agency,
      title,
      status: "prospect",
      contact_count: 0,
      osdbu: false,
      ...options,
    });
  }

  /**
   * Get contact by ID
   */
  async getContact(id: string): Promise<OutreachContact | null> {
    return this.repo.getOutreachContact(id);
  }

  /**
   * List all contacts with optional filtering
   */
  async listContacts(filters?: {
    agency?: string;
    status?: OutreachContact["status"];
    osdbu?: boolean;
  }): Promise<OutreachContact[]> {
    let contacts = await this.repo.listOutreachContacts();

    if (filters) {
      if (filters.agency) {
        contacts = contacts.filter((c) =>
          c.agency.toLowerCase().includes(filters.agency!.toLowerCase())
        );
      }
      if (filters.status) {
        contacts = contacts.filter((c) => c.status === filters.status);
      }
      if (filters.osdbu !== undefined) {
        contacts = contacts.filter((c) => c.osdbu === filters.osdbu);
      }
    }

    return contacts;
  }

  /**
   * Log an outreach activity
   */
  async logActivity(
    contactId: string,
    activityType: OutreachActivity["activity_type"],
    subject: string,
    options?: Partial<OutreachActivity>
  ): Promise<OutreachActivity> {
    const contact = await this.repo.getOutreachContact(contactId);
    if (!contact) {
      throw new Error(`Contact ${contactId} not found`);
    }

    // Create activity
    const activity = await this.repo.createOutreachActivity({
      contact_id: contactId,
      activity_type: activityType,
      subject,
      completed: true,
      ...options,
    });

    // Update contact with last contact date and increment contact count
    await this.repo.updateOutreachContact(contactId, {
      last_contacted: new Date(),
      contact_count: contact.contact_count + 1,
      status:
        contact.status === "prospect" && activityType !== "linkedin"
          ? "warm"
          : contact.status,
    });

    return activity;
  }

  /**
   * Get outreach history for a contact
   */
  async getContactHistory(contactId: string): Promise<OutreachActivity[]> {
    return this.repo.listOutreachActivitiesByContact(contactId);
  }

  /**
   * Schedule follow-up
   */
  async scheduleFollowUp(
    contactId: string,
    subject: string,
    followUpDate: Date
  ): Promise<OutreachActivity> {
    return this.repo.createOutreachActivity({
      contact_id: contactId,
      activity_type: "email",
      subject: `[FOLLOW-UP] ${subject}`,
      follow_up_date: followUpDate,
      completed: false,
    });
  }

  /**
   * Get pending follow-ups
   */
  async getPendingFollowUps(): Promise<OutreachActivity[]> {
    const activities = await this.repo.listOutreachActivities();
    const now = new Date();
    return activities
      .filter(
        (a) =>
          !a.completed &&
          a.follow_up_date &&
          a.follow_up_date <= now
      )
      .sort(
        (a, b) =>
          (a.follow_up_date?.getTime() || 0) -
          (b.follow_up_date?.getTime() || 0)
      );
  }

  /**
   * Mark contact as active relationship
   */
  async markActive(contactId: string): Promise<OutreachContact> {
    return this.repo.updateOutreachContact(contactId, {
      status: "active",
      last_contacted: new Date(),
    });
  }

  /**
   * Count contacts by status
   */
  async countByStatus(): Promise<Record<OutreachContact["status"], number>> {
    const contacts = await this.repo.listOutreachContacts();
    const counts: Record<OutreachContact["status"], number> = {
      prospect: 0,
      warm: 0,
      active: 0,
      cold: 0,
    };

    for (const contact of contacts) {
      counts[contact.status]++;
    }

    return counts;
  }
}
