/**
 * Outreach Service - Contact management and activity tracking
 */
export class OutreachService {
    constructor(repo) {
        this.repo = repo;
    }
    async createContact(name, email, agency, title, options) {
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
    async getContact(id) {
        return this.repo.getOutreachContact(id);
    }
    async listContacts(filters) {
        let contacts = await this.repo.listOutreachContacts();
        if (filters) {
            if (filters.agency) {
                contacts = contacts.filter((c) => c.agency.toLowerCase().includes(filters.agency.toLowerCase()));
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
    async logActivity(contactId, activityType, subject, options) {
        const contact = await this.repo.getOutreachContact(contactId);
        if (!contact) {
            throw new Error(`Contact ${contactId} not found`);
        }
        const activity = await this.repo.createOutreachActivity({
            contact_id: contactId,
            activity_type: activityType,
            subject,
            completed: true,
            ...options,
        });
        await this.repo.updateOutreachContact(contactId, {
            last_contacted: new Date(),
            contact_count: contact.contact_count + 1,
            status: contact.status === "prospect" && activityType !== "linkedin"
                ? "warm"
                : contact.status,
        });
        return activity;
    }
    async getContactHistory(contactId) {
        return this.repo.listOutreachActivitiesByContact(contactId);
    }
    async scheduleFollowUp(contactId, subject, followUpDate) {
        return this.repo.createOutreachActivity({
            contact_id: contactId,
            activity_type: "email",
            subject: `[FOLLOW-UP] ${subject}`,
            follow_up_date: followUpDate,
            completed: false,
        });
    }
    async getPendingFollowUps() {
        const activities = await this.repo.listOutreachActivities();
        const now = new Date();
        return activities
            .filter((a) => !a.completed &&
            a.follow_up_date &&
            a.follow_up_date <= now)
            .sort((a, b) => (a.follow_up_date?.getTime() || 0) -
            (b.follow_up_date?.getTime() || 0));
    }
    async markActive(contactId) {
        return this.repo.updateOutreachContact(contactId, {
            status: "active",
            last_contacted: new Date(),
        });
    }
    async countByStatus() {
        const contacts = await this.repo.listOutreachContacts();
        const counts = {
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
//# sourceMappingURL=outreach-service.js.map