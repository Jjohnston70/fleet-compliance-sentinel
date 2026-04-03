import { OnboardingRequest, ProvisioningQueueItem, OnboardingConfig, GeneratedDocument, AuditLogEntry, OnboardingStatus, QueueItemStatus } from './schema.js';
export interface Repository {
    createRequest(req: Omit<OnboardingRequest, 'id' | 'created_at'>): Promise<OnboardingRequest>;
    getRequest(id: string): Promise<OnboardingRequest | null>;
    listRequests(filters?: {
        status?: OnboardingStatus;
        mode?: string;
    }): Promise<OnboardingRequest[]>;
    updateRequest(id: string, partial: Partial<OnboardingRequest>): Promise<OnboardingRequest>;
    createQueueItem(item: Omit<ProvisioningQueueItem, 'id' | 'created_at'>): Promise<ProvisioningQueueItem>;
    getQueueItem(id: string): Promise<ProvisioningQueueItem | null>;
    getQueueItemsByRequest(requestId: string): Promise<ProvisioningQueueItem[]>;
    getNextQueuedItem(): Promise<ProvisioningQueueItem | null>;
    updateQueueItem(id: string, partial: Partial<ProvisioningQueueItem>): Promise<ProvisioningQueueItem>;
    listQueueItems(filters?: {
        status?: QueueItemStatus;
        requestId?: string;
    }): Promise<ProvisioningQueueItem[]>;
    createConfig(config: OnboardingConfig): Promise<OnboardingConfig>;
    getConfig(id: string): Promise<OnboardingConfig | null>;
    listConfigs(): Promise<OnboardingConfig[]>;
    updateConfig(id: string, partial: Partial<OnboardingConfig>): Promise<OnboardingConfig>;
    createDocument(doc: Omit<GeneratedDocument, 'id' | 'created_at'>): Promise<GeneratedDocument>;
    getDocument(id: string): Promise<GeneratedDocument | null>;
    getDocumentsByRequest(requestId: string): Promise<GeneratedDocument[]>;
    createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
    listAuditLogs(filters?: {
        requestId?: string;
        actor?: string;
        status?: string;
    }): Promise<AuditLogEntry[]>;
}
export declare class InMemoryRepository implements Repository {
    private requests;
    private queueItems;
    private configs;
    private documents;
    private auditLogs;
    createRequest(req: Omit<OnboardingRequest, 'id' | 'created_at'>): Promise<OnboardingRequest>;
    getRequest(id: string): Promise<OnboardingRequest | null>;
    listRequests(filters?: {
        status?: OnboardingStatus;
        mode?: string;
    }): Promise<OnboardingRequest[]>;
    updateRequest(id: string, partial: Partial<OnboardingRequest>): Promise<OnboardingRequest>;
    createQueueItem(item: Omit<ProvisioningQueueItem, 'id' | 'created_at'>): Promise<ProvisioningQueueItem>;
    getQueueItem(id: string): Promise<ProvisioningQueueItem | null>;
    getQueueItemsByRequest(requestId: string): Promise<ProvisioningQueueItem[]>;
    getNextQueuedItem(): Promise<ProvisioningQueueItem | null>;
    updateQueueItem(id: string, partial: Partial<ProvisioningQueueItem>): Promise<ProvisioningQueueItem>;
    listQueueItems(filters?: {
        status?: QueueItemStatus;
        requestId?: string;
    }): Promise<ProvisioningQueueItem[]>;
    createConfig(config: OnboardingConfig): Promise<OnboardingConfig>;
    getConfig(id: string): Promise<OnboardingConfig | null>;
    listConfigs(): Promise<OnboardingConfig[]>;
    updateConfig(id: string, partial: Partial<OnboardingConfig>): Promise<OnboardingConfig>;
    createDocument(doc: Omit<GeneratedDocument, 'id' | 'created_at'>): Promise<GeneratedDocument>;
    getDocument(id: string): Promise<GeneratedDocument | null>;
    getDocumentsByRequest(requestId: string): Promise<GeneratedDocument[]>;
    createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
    listAuditLogs(filters?: {
        requestId?: string;
        actor?: string;
        status?: string;
    }): Promise<AuditLogEntry[]>;
    clear(): void;
}
//# sourceMappingURL=repository.d.ts.map