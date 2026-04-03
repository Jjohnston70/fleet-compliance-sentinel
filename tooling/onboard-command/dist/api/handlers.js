import { OnboardingStatus, OnboardingMode, } from '../data/schema.js';
import { OnboardingStateMachine } from '../services/state-machine.js';
import { StandardQueueService } from '../services/queue-service.js';
import { StandardRollbackEngine } from '../services/rollback-engine.js';
import { StandardAuditService } from '../services/audit-service.js';
export class StandardApiHandlers {
    constructor(repo) {
        this.repo = repo;
        this.auditService = new StandardAuditService(repo);
        this.stateMachine = new OnboardingStateMachine(repo);
        this.queueService = new StandardQueueService(repo);
        this.rollbackEngine = new StandardRollbackEngine(repo, this.auditService);
    }
    async startOnboarding(clientName, contactEmail, employees) {
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
            status: 'success',
            details: {},
        });
        return this.stateMachine.initializeRequest(request);
    }
    async getOnboardingStatus(requestId) {
        return this.repo.getRequest(requestId);
    }
    async listOnboardingRequests(filters) {
        return this.repo.listRequests(filters);
    }
    async processQueueItem(itemId) {
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
    async getQueueStatus(requestId) {
        return this.repo.getQueueItemsByRequest(requestId);
    }
    async rollbackOnboarding(requestId, reason) {
        return this.rollbackEngine.rollbackRequest(requestId, reason);
    }
    async getAuditLog(filters) {
        return this.repo.listAuditLogs(filters);
    }
    async getConfig(department) {
        return this.repo.getConfig(department);
    }
    async updateConfig(department, config) {
        const existing = await this.repo.getConfig(department);
        if (!existing) {
            throw new Error(`Config for ${department} not found`);
        }
        return this.repo.updateConfig(department, config);
    }
}
