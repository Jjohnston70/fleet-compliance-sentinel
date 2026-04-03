import { OnboardingRequest, OnboardingStatus, ProvisioningQueueItem, OnboardingConfig } from '../data/schema.js';
import { Repository } from '../data/repository.js';
export interface ApiHandlers {
    startOnboarding(clientName: string, contactEmail: string, employees: any[]): Promise<OnboardingRequest>;
    getOnboardingStatus(requestId: string): Promise<OnboardingRequest | null>;
    listOnboardingRequests(filters?: {
        status?: OnboardingStatus;
        mode?: string;
    }): Promise<OnboardingRequest[]>;
    processQueueItem(itemId: string): Promise<ProvisioningQueueItem>;
    getQueueStatus(requestId: string): Promise<ProvisioningQueueItem[]>;
    rollbackOnboarding(requestId: string, reason: string): Promise<OnboardingRequest>;
    getAuditLog(filters?: {
        requestId?: string;
        actor?: string;
    }): Promise<any[]>;
    getConfig(department: string): Promise<OnboardingConfig | null>;
    updateConfig(department: string, config: Partial<OnboardingConfig>): Promise<OnboardingConfig>;
}
export declare class StandardApiHandlers implements ApiHandlers {
    private repo;
    private stateMachine;
    private queueService;
    private rollbackEngine;
    private auditService;
    constructor(repo: Repository);
    startOnboarding(clientName: string, contactEmail: string, employees: any[]): Promise<OnboardingRequest>;
    getOnboardingStatus(requestId: string): Promise<OnboardingRequest | null>;
    listOnboardingRequests(filters?: {
        status?: OnboardingStatus;
        mode?: string;
    }): Promise<OnboardingRequest[]>;
    processQueueItem(itemId: string): Promise<ProvisioningQueueItem>;
    getQueueStatus(requestId: string): Promise<ProvisioningQueueItem[]>;
    rollbackOnboarding(requestId: string, reason: string): Promise<OnboardingRequest>;
    getAuditLog(filters?: {
        requestId?: string;
        actor?: string;
    }): Promise<any[]>;
    getConfig(department: string): Promise<OnboardingConfig | null>;
    updateConfig(department: string, config: Partial<OnboardingConfig>): Promise<OnboardingConfig>;
}
//# sourceMappingURL=handlers.d.ts.map