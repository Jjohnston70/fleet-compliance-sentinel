/**
 * In-Memory Repository for Testing
 * Simulates Firestore CRUD operations without external dependencies
 */
export class InMemoryRepository {
    proposals = new Map();
    clients = new Map();
    templates = new Map();
    lineItems = new Map();
    activities = new Map();
    // Proposals
    async saveProposal(proposal) {
        this.proposals.set(proposal.id, proposal);
    }
    async getProposal(id) {
        return this.proposals.get(id);
    }
    async listProposals(filter) {
        return Array.from(this.proposals.values()).filter(p => {
            if (!filter)
                return true;
            return Object.entries(filter).every(([key, value]) => p[key] === value);
        });
    }
    async deleteProposal(id) {
        this.proposals.delete(id);
    }
    // Clients
    async saveClient(client) {
        this.clients.set(client.id, client);
    }
    async getClient(id) {
        return this.clients.get(id);
    }
    async findClientByEmail(email) {
        return Array.from(this.clients.values()).find(c => c.email.toLowerCase() === email.toLowerCase());
    }
    async listClients() {
        return Array.from(this.clients.values());
    }
    async deleteClient(id) {
        this.clients.delete(id);
    }
    // Templates
    async saveTemplate(template) {
        this.templates.set(template.id, template);
    }
    async getTemplate(id) {
        return this.templates.get(id);
    }
    async listTemplates(serviceType) {
        return Array.from(this.templates.values()).filter(t => !serviceType || t.serviceType === serviceType);
    }
    // Line Items
    async saveLineItem(item) {
        this.lineItems.set(item.id, item);
    }
    async getLineItem(id) {
        return this.lineItems.get(id);
    }
    async listLineItems(proposalId) {
        return Array.from(this.lineItems.values())
            .filter(item => item.proposalId === proposalId)
            .sort((a, b) => a.order - b.order);
    }
    async deleteLineItem(id) {
        this.lineItems.delete(id);
    }
    // Activities
    async saveActivity(activity) {
        this.activities.set(activity.id, activity);
    }
    async listActivities(proposalId) {
        return Array.from(this.activities.values())
            .filter(a => a.proposalId === proposalId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    // Utility: Clear all data
    async clear() {
        this.proposals.clear();
        this.clients.clear();
        this.templates.clear();
        this.lineItems.clear();
        this.activities.clear();
    }
}
