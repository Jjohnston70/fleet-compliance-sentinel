import {
  OnboardingRequest,
  ProvisioningQueueItem,
  OnboardingConfig,
  GeneratedDocument,
  AuditLogEntry,
  OnboardingStatus,
  QueueItemStatus,
  OnboardingRequestSchema,
  ProvisioningQueueItemSchema,
  OnboardingConfigSchema,
  GeneratedDocumentSchema,
  AuditLogEntrySchema,
} from './schema.js';

export interface Repository {
  // Onboarding Requests
  createRequest(req: Omit<OnboardingRequest, 'id' | 'created_at'>): Promise<OnboardingRequest>;
  getRequest(id: string): Promise<OnboardingRequest | null>;
  listRequests(filters?: { status?: OnboardingStatus; mode?: string }): Promise<OnboardingRequest[]>;
  updateRequest(id: string, partial: Partial<OnboardingRequest>): Promise<OnboardingRequest>;

  // Provisioning Queue
  createQueueItem(item: Omit<ProvisioningQueueItem, 'id' | 'created_at'>): Promise<ProvisioningQueueItem>;
  getQueueItem(id: string): Promise<ProvisioningQueueItem | null>;
  getQueueItemsByRequest(requestId: string): Promise<ProvisioningQueueItem[]>;
  getNextQueuedItem(): Promise<ProvisioningQueueItem | null>;
  updateQueueItem(id: string, partial: Partial<ProvisioningQueueItem>): Promise<ProvisioningQueueItem>;
  listQueueItems(filters?: { status?: QueueItemStatus; requestId?: string }): Promise<ProvisioningQueueItem[]>;

  // Onboarding Config
  createConfig(config: OnboardingConfig): Promise<OnboardingConfig>;
  getConfig(id: string): Promise<OnboardingConfig | null>;
  listConfigs(): Promise<OnboardingConfig[]>;
  updateConfig(id: string, partial: Partial<OnboardingConfig>): Promise<OnboardingConfig>;

  // Generated Documents
  createDocument(doc: Omit<GeneratedDocument, 'id' | 'created_at'>): Promise<GeneratedDocument>;
  getDocument(id: string): Promise<GeneratedDocument | null>;
  getDocumentsByRequest(requestId: string): Promise<GeneratedDocument[]>;

  // Audit Log
  createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
  listAuditLogs(filters?: { requestId?: string; actor?: string; status?: string }): Promise<AuditLogEntry[]>;
}

export class InMemoryRepository implements Repository {
  private requests = new Map<string, OnboardingRequest>();
  private queueItems = new Map<string, ProvisioningQueueItem>();
  private configs = new Map<string, OnboardingConfig>();
  private documents = new Map<string, GeneratedDocument>();
  private auditLogs: AuditLogEntry[] = [];

  async createRequest(req: Omit<OnboardingRequest, 'id' | 'created_at'>): Promise<OnboardingRequest> {
    const parsed = OnboardingRequestSchema.parse(req);
    this.requests.set(parsed.id, parsed);
    return parsed;
  }

  async getRequest(id: string): Promise<OnboardingRequest | null> {
    return this.requests.get(id) || null;
  }

  async listRequests(
    filters?: { status?: OnboardingStatus; mode?: string }
  ): Promise<OnboardingRequest[]> {
    let result = Array.from(this.requests.values());
    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.mode) {
      result = result.filter((r) => r.mode === filters.mode);
    }
    return result;
  }

  async updateRequest(id: string, partial: Partial<OnboardingRequest>): Promise<OnboardingRequest> {
    const existing = this.requests.get(id);
    if (!existing) {
      throw new Error(`Request ${id} not found`);
    }
    const updated = OnboardingRequestSchema.parse({ ...existing, ...partial, id });
    this.requests.set(id, updated);
    return updated;
  }

  async createQueueItem(item: Omit<ProvisioningQueueItem, 'id' | 'created_at'>): Promise<ProvisioningQueueItem> {
    const parsed = ProvisioningQueueItemSchema.parse(item);
    this.queueItems.set(parsed.id, parsed);
    return parsed;
  }

  async getQueueItem(id: string): Promise<ProvisioningQueueItem | null> {
    return this.queueItems.get(id) || null;
  }

  async getQueueItemsByRequest(requestId: string): Promise<ProvisioningQueueItem[]> {
    return Array.from(this.queueItems.values()).filter((item) => item.request_id === requestId);
  }

  async getNextQueuedItem(): Promise<ProvisioningQueueItem | null> {
    const items = Array.from(this.queueItems.values())
      .filter((item) => item.status === QueueItemStatus.Queued)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    return items[0] || null;
  }

  async updateQueueItem(id: string, partial: Partial<ProvisioningQueueItem>): Promise<ProvisioningQueueItem> {
    const existing = this.queueItems.get(id);
    if (!existing) {
      throw new Error(`Queue item ${id} not found`);
    }
    const updated = ProvisioningQueueItemSchema.parse({ ...existing, ...partial, id });
    this.queueItems.set(id, updated);
    return updated;
  }

  async listQueueItems(
    filters?: { status?: QueueItemStatus; requestId?: string }
  ): Promise<ProvisioningQueueItem[]> {
    let result = Array.from(this.queueItems.values());
    if (filters?.status) {
      result = result.filter((item) => item.status === filters.status);
    }
    if (filters?.requestId) {
      result = result.filter((item) => item.request_id === filters.requestId);
    }
    return result;
  }

  async createConfig(config: OnboardingConfig): Promise<OnboardingConfig> {
    const parsed = OnboardingConfigSchema.parse(config);
    this.configs.set(parsed.id, parsed);
    return parsed;
  }

  async getConfig(id: string): Promise<OnboardingConfig | null> {
    return this.configs.get(id) || null;
  }

  async listConfigs(): Promise<OnboardingConfig[]> {
    return Array.from(this.configs.values());
  }

  async updateConfig(id: string, partial: Partial<OnboardingConfig>): Promise<OnboardingConfig> {
    const existing = this.configs.get(id);
    if (!existing) {
      throw new Error(`Config ${id} not found`);
    }
    const updated = OnboardingConfigSchema.parse({ ...existing, ...partial, id });
    this.configs.set(id, updated);
    return updated;
  }

  async createDocument(doc: Omit<GeneratedDocument, 'id' | 'created_at'>): Promise<GeneratedDocument> {
    const parsed = GeneratedDocumentSchema.parse(doc);
    this.documents.set(parsed.id, parsed);
    return parsed;
  }

  async getDocument(id: string): Promise<GeneratedDocument | null> {
    return this.documents.get(id) || null;
  }

  async getDocumentsByRequest(requestId: string): Promise<GeneratedDocument[]> {
    return Array.from(this.documents.values()).filter((doc) => doc.request_id === requestId);
  }

  async createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const parsed = AuditLogEntrySchema.parse(entry);
    this.auditLogs.push(parsed);
    return parsed;
  }

  async listAuditLogs(
    filters?: { requestId?: string; actor?: string; status?: string }
  ): Promise<AuditLogEntry[]> {
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
  clear(): void {
    this.requests.clear();
    this.queueItems.clear();
    this.configs.clear();
    this.documents.clear();
    this.auditLogs = [];
  }
}
