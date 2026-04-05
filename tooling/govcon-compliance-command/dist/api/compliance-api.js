/**
 * Compliance API handlers
 */
export function createComplianceAPI(service) {
    return {
        async listComplianceItems(filters) { return service.listComplianceItems(filters); },
        async getComplianceItem(id) { return service.getComplianceItem(id); },
        async updateComplianceItem(id, updates) { return service.updateComplianceItem(id, updates); },
        async markRenewed(id, newExpirationDate) { return service.markRenewed(id, newExpirationDate); },
        async getExpiringItems(daysThreshold) { return service.getExpiringItems(daysThreshold); },
        async getComplianceAlerts() { return service.getComplianceAlerts(); },
        async checkAuthorityCompliance(authority) { return service.checkAuthorityCompliance(authority); },
    };
}
//# sourceMappingURL=compliance-api.js.map