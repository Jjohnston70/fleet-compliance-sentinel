/**
 * Outreach API handlers
 */
export function createOutreachAPI(service) {
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
//# sourceMappingURL=outreach-api.js.map