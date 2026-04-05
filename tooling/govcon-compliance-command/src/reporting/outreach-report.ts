/**
 * Outreach Report - Contact activity and engagement summary
 */

import { OutreachService } from "../services/outreach-service.js";
import { OutreachContact } from "../data/schemas.js";

export interface OutreachMetrics {
  totalContacts: number;
  byStatus: Record<OutreachContact["status"], number>;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  averageContactsPerContact: number;
  pendingFollowUps: number;
  osdbuContacts: number;
  lastContactDate: Date | null;
}

export class OutreachReport {
  constructor(private outreachService: OutreachService) {}

  async generateMetrics(): Promise<OutreachMetrics> {
    const [contacts, statusCounts, pendingFollowUps] = await Promise.all([
      this.outreachService.listContacts(),
      this.outreachService.countByStatus(),
      this.outreachService.getPendingFollowUps(),
    ]);

    const activitiesByType: Record<string, number> = {};
    let totalActivities = 0;
    for (const contact of contacts) {
      const history = await this.outreachService.getContactHistory(contact.id);
      for (const activity of history) {
        activitiesByType[activity.activity_type] = (activitiesByType[activity.activity_type] || 0) + 1;
        totalActivities++;
      }
    }

    const osdbuContacts = contacts.filter((c) => c.osdbu).length;
    const averageContactsPerContact = contacts.length > 0
      ? contacts.reduce((sum, c) => sum + c.contact_count, 0) / contacts.length : 0;
    const lastContactDate = contacts.filter((c) => c.last_contacted)
      .sort((a, b) => (b.last_contacted?.getTime() || 0) - (a.last_contacted?.getTime() || 0))[0]?.last_contacted || null;

    return { totalContacts: contacts.length, byStatus: statusCounts, totalActivities, activitiesByType, averageContactsPerContact, pendingFollowUps: pendingFollowUps.length, osdbuContacts, lastContactDate };
  }

  async getHighEngagementContacts(minContactCount: number = 3): Promise<OutreachContact[]> {
    const contacts = await this.outreachService.listContacts();
    return contacts.filter((c) => c.contact_count >= minContactCount).sort((a, b) => b.contact_count - a.contact_count);
  }

  async getColdContacts(daysSinceContact: number = 60): Promise<OutreachContact[]> {
    const contacts = await this.outreachService.listContacts({ status: "cold" });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceContact);
    return contacts.filter((c) => !c.last_contacted || c.last_contacted < cutoffDate);
  }

  async getOSDBUSummary(): Promise<{ totalOSDBU: number; byStatus: Record<OutreachContact["status"], number>; recentContacts: OutreachContact[] }> {
    const osdbuContacts = await this.outreachService.listContacts({ osdbu: true });
    const byStatus: Record<OutreachContact["status"], number> = { prospect: 0, warm: 0, active: 0, cold: 0 };
    for (const contact of osdbuContacts) { byStatus[contact.status]++; }
    const recentContacts = osdbuContacts.filter((c) => c.last_contacted)
      .sort((a, b) => (b.last_contacted?.getTime() || 0) - (a.last_contacted?.getTime() || 0)).slice(0, 5);
    return { totalOSDBU: osdbuContacts.length, byStatus, recentContacts };
  }
}
