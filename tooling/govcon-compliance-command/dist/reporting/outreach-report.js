/**
 * Outreach Report - Contact activity and engagement summary
 */
export class OutreachReport {
    constructor(outreachService) {
        this.outreachService = outreachService;
    }
    async generateMetrics() {
        const [contacts, statusCounts, pendingFollowUps] = await Promise.all([
            this.outreachService.listContacts(),
            this.outreachService.countByStatus(),
            this.outreachService.getPendingFollowUps(),
        ]);
        const activitiesByType = {};
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
    async getHighEngagementContacts(minContactCount = 3) {
        const contacts = await this.outreachService.listContacts();
        return contacts.filter((c) => c.contact_count >= minContactCount).sort((a, b) => b.contact_count - a.contact_count);
    }
    async getColdContacts(daysSinceContact = 60) {
        const contacts = await this.outreachService.listContacts({ status: "cold" });
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSinceContact);
        return contacts.filter((c) => !c.last_contacted || c.last_contacted < cutoffDate);
    }
    async getOSDBUSummary() {
        const osdbuContacts = await this.outreachService.listContacts({ osdbu: true });
        const byStatus = { prospect: 0, warm: 0, active: 0, cold: 0 };
        for (const contact of osdbuContacts) {
            byStatus[contact.status]++;
        }
        const recentContacts = osdbuContacts.filter((c) => c.last_contacted)
            .sort((a, b) => (b.last_contacted?.getTime() || 0) - (a.last_contacted?.getTime() || 0)).slice(0, 5);
        return { totalOSDBU: osdbuContacts.length, byStatus, recentContacts };
    }
}
//# sourceMappingURL=outreach-report.js.map