import {
  OnboardingRequest,
  OnboardingStatus,
  OnboardingMode,
  ProvisioningQueueItem,
  QueueItemStatus,
  OnboardingConfig,
} from '../data/schema.js';
import { Repository } from '../data/repository.js';
import { OnboardingStateMachine } from '../services/state-machine.js';
import { StandardQueueService } from '../services/queue-service.js';
import { StandardRollbackEngine } from '../services/rollback-engine.js';
import { StandardAuditService } from '../services/audit-service.js';

export interface ApiHandlers {
  startOnboarding(clientName: string, contactEmail: string, employees: any[]): Promise<OnboardingRequest>;
  getOnboardingStatus(requestId: string): Promise<OnboardingRequest | null>;
  listOnboardingRequests(filters?: { status?: OnboardingStatus; mode?: string }): Promise<OnboardingRequest[]>;
  processQueueItem(itemId: string): Promise<ProvisioningQueueItem>;
  getQueueStatus(requestId: string): Promise<ProvisioningQueueItem[]>;
  rollbackOnboarding(requestId: string, reason: string): Promise<OnboardingRequest>;
  getAuditLog(filters?: { requestId?: string; actor?: string }): Promise<any[]>;
  getConfig(department: string): Promise<OnboardingConfig | null>;
  updateConfig(department: string, config: Partial<OnboardingConfig>): Promise<OnboardingConfig>;
}

export class StandardApiHandlers implements ApiHandlers {
  private stateMachine: OnboardingStateMachine;
  private queueService: StandardQueueService;
  private rollbackEngine: StandardRollbackEngine;
  private auditService: StandardAuditService;

  constructor(private repo: Repository) {
    this.auditService = new StandardAuditService(repo);
    this.stateMachine = new OnboardingStateMachine(repo);
    this.queueService = new StandardQueueService(repo);
    this.rollbackEngine = new StandardRollbackEngine(repo, this.auditService);
  }

  async startOnboarding(
    clientName: string,
    contactEmail: string,
    employees: any[]
  ): Promise<OnboardingRequest> {
    const request = await this.repo.createRequest({
      client_name: clientName,
      contact_email: contactEmail,
      employees,
      mode: OnboardingMode.Test,
      status: OnboardingStatus.Pending,
      error_log: [],
    });

    await this.auditService.log({
      request_id: request.id,
      action: 'ONBOARDING_STARTED',
      actor: 'api',
      target: `Request ${request.id}`,
      status: 'success' as any,
      details: {},
    });

    return this.stateMachine.initializeRequest(request);
  }

  async getOnboardingStatus(requestId: string): Promise<OnboardingRequest | null> {
    return this.repo.getRequest(requestId);
  }

  async listOnboardingRequests(filters?: { status?: OnboardingStatus; mode?: string }): Promise<OnboardingRequest[]> {
    return this.repo.listRequests(filters);
  }

  async processQueueItem(itemId: string): Promise<ProvisioningQueueItem> {
    const item = await this.repo.getQueueItem(itemId);
    if (!item) {
      throw new Error(`Queue item ${itemId} not found`);
    }

    // Simulate processing
    await this.queueService.processItem(itemId);

    // Mark as complete (in real scenario, would execute actual provisioning)
    const processed = await this.queueService.markComplete(itemId, {
      simulated: true,
    });

    // Re-evaluate request state
    const newStatus = await this.stateMachine.evaluateState(item.request_id);
    await this.stateMachine.transitionState(item.request_id, newStatus);

    return processed;
  }

  async getQueueStatus(requestId: string): Promise<ProvisioningQueueItem[]> {
    return this.repo.getQueueItemsByRequest(requestId);
  }

  async rollbackOnboarding(requestId: string, reason: string): Promise<OnboardingRequest> {
    return this.rollbackEngine.rollbackRequest(requestId, reason);
  }

  async getAuditLog(filters?: { requestId?: string; actor?: string }): Promise<any[]> {
    return this.repo.listAuditLogs(filters as any);
  }

  async getConfig(department: string): Promise<OnboardingConfig | null> {
    return this.repo.getConfig(department);
  }

  async updateConfig(department: string, config: Partial<OnboardingConfig>): Promise<OnboardingConfig> {
    const existing = await this.repo.getConfig(department);
    if (!existing) {
      throw new Error(`Config for ${department} not found`);
    }

    return this.repo.updateConfig(department, config);
  }
}
