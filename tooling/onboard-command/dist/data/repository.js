import { QueueItemStatus, OnboardingRequestSchema, ProvisioningQueueItemSchema, OnboardingConfigSchema, GeneratedDocumentSchema, AuditLogEntrySchema, } from './schema.js';
export class InMemoryRepository {
    constructor() {
        this.requests = new Map();
        this.queueItems = new Map();
        this.configs = new Map();
        this.documents = new Map();
        this.auditLogs = [];
    }
    async createRequest(req) {
        const parsed = OnboardingRequestSchema.parse(req);
        this.requests.set(parsed.id, parsed);
        return parsed;
    }
    async getRequest(id) {
        return this.requests.get(id) || null;
    }
    async listRequests(filters) {
        let result = Array.from(this.requests.values());
        if (filters?.status) {
            result = result.filter((r) => r.status === filters.status);
        }
        if (filters?.mode) {
            result = result.filter((r) => r.mode === filters.mode);
        }
        return result;
    }
    async updateRequest(id, partial) {
        const existing = this.requests.get(id);
        if (!existing) {
            throw new Error(`Request ${id} not found`);
        }
        const updated = OnboardingRequestSchema.parse({ ...existing, ...partial, id });
        this.requests.set(id, updated);
        return updated;
    }
    async createQueueItem(item) {
        const parsed = ProvisioningQueueItemSchema.parse(item);
        this.queueItems.set(parsed.id, parsed);
        return parsed;
    }
    async getQueueItem(id) {
        return this.queueItems.get(id) || null;
    }
    async getQueueItemsByRequest(requestId) {
        return Array.from(this.queueItems.values()).filter((item) => item.request_id === requestId);
    }
    async getNextQueuedItem() {
        const items = Array.from(this.queueItems.values())
            .filter((item) => item.status === QueueItemStatus.Queued)
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
        return items[0] || null;
    }
    async updateQueueItem(id, partial) {
        const existing = this.queueItems.get(id);
        if (!existing) {
            throw new Error(`Queue item ${id} not found`);
        }
        const updated = ProvisioningQueueItemSchema.parse({ ...existing, ...partial, id });
        this.queueItems.set(id, updated);
        return updated;
    }
    async listQueueItems(filters) {
        let result = Array.from(this.queueItems.values());
        if (filters?.status) {
            result = result.filter((item) => item.status === filters.status);
        }
        if (filters?.requestId) {
            result = result.filter((item) => item.request_id === filters.requestId);
        }
        return result;
    }
    async createConfig(config) {
        const parsed = OnboardingConfigSchema.parse(config);
        this.configs.set(parsed.id, parsed);
        return parsed;
    }
    async getConfig(id) {
        return this.configs.get(id) || null;
    }
    async listConfigs() {
        return Array.from(this.configs.values());
    }
    async updateConfig(id, partial) {
        const existing = this.configs.get(id);
        if (!existing) {
            throw new Error(`Config ${id} not found`);
        }
        const updated = OnboardingConfigSchema.parse({ ...existing, ...partial, id });
        this.configs.set(id, updated);
        return updated;
    }
    async createDocument(doc) {
        const parsed = GeneratedDocumentSchema.parse(doc);
        this.documents.set(parsed.id, parsed);
        return parsed;
    }
    async getDocument(id) {
        return this.documents.get(id) || null;
    }
    async getDocumentsByRequest(requestId) {
        return Array.from(this.documents.values()).filter((doc) => doc.request_id === requestId);
    }
    async createAuditLog(entry) {
        const parsed = AuditLogEntrySchema.parse(entry);
        this.auditLogs.push(parsed);
        return parsed;
    }
    async listAuditLogs(filters) {
        let result = this.auditLogs;
        if (filters?.requestId) {
            result = result.filter((log) => log.request_id === filters.requestId);
        }
        if (filters?.actor) {
            result = result.filter((log) => log.actor === filters.actor);
        }
        if (filters?.status) {
            result = result.filter((log) => log.status === filters.status);
        }
        return result;
    }
    // Helper for testing
    clear() {
        this.requests.clear();
        this.queueItems.clear();
        this.configs.clear();
        this.documents.clear();
        this.auditLogs = [];
    }
}
