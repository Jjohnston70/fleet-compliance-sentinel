/**
 * Client Service - Client CRUD & Deduplication
 */
export class ClientService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Create or retrieve existing client (deduplicate by email)
     */
    async getOrCreateClient(clientData) {
        // Check if client exists by email
        const existing = await this.repository.findClientByEmail(clientData.email);
        if (existing) {
            // Update existing client with new info
            return this.updateClient(existing.id, clientData);
        }
        // Create new client
        return this.createClient(clientData);
    }
    /**
     * Create new client
     */
    async createClient(clientData) {
        const client = {
            id: this.generateId(),
            ...clientData,
            email: clientData.email.toLowerCase(),
            source: 'form',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.repository.saveClient(client);
        return client;
    }
    /**
     * Get client by ID
     */
    async getClient(id) {
        return this.repository.getClient(id);
    }
    /**
     * Get client by email
     */
    async getClientByEmail(email) {
        return this.repository.findClientByEmail(email);
    }
    /**
     * List all clients
     */
    async listClients() {
        return this.repository.listClients();
    }
    /**
     * Update client information
     */
    async updateClient(id, updates) {
        const client = await this.getClient(id);
        if (!client)
            throw new Error(`Client not found: ${id}`);
        const updated = {
            ...client,
            ...updates,
            id: client.id,
            createdAt: client.createdAt,
            updatedAt: new Date(),
            email: (updates.email || client.email).toLowerCase(),
        };
        await this.repository.saveClient(updated);
        return updated;
    }
    /**
     * Delete client
     */
    async deleteClient(id) {
        await this.repository.deleteClient(id);
    }
    /**
     * Search clients by company name or contact name
     */
    async searchClients(query) {
        const allClients = await this.listClients();
        const lowerQuery = query.toLowerCase();
        return allClients.filter(c => c.companyName.toLowerCase().includes(lowerQuery) ||
            c.contactName.toLowerCase().includes(lowerQuery) ||
            c.email.toLowerCase().includes(lowerQuery));
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
