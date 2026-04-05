/**
 * Opportunity API handlers
 */
export function createOpportunitiesAPI(service) {
    return {
        async createOpportunity(params) {
            return service.createOpportunity(params.title, params.solicitation_number, params.agency, params.response_deadline, params.set_aside_type, params.naics_code, params.naics_description, params.description);
        },
        async listOpportunities(filters) { return service.listOpportunities(filters); },
        async getOpportunity(id) { return service.getOpportunity(id); },
        async updateOpportunity(id, updates) { return service.updateOpportunity(id, updates); },
        async getUpcomingDeadlines(daysFromNow) { return service.getUpcomingDeadlines(daysFromNow); },
        async getActiveOpportunities() { return service.getActiveOpportunities(); },
        async getPipelineValue() { return service.getPipelineValue(); },
        async countByStatus() { return service.countByStatus(); },
    };
}
//# sourceMappingURL=opportunities-api.js.map