import { StandardQueueService } from '../services/queue-service.js';
import { OnboardingStateMachine } from '../services/state-machine.js';
import { isTestMode } from '../config/index.js';
export class StandardQueueProcessor {
    constructor(repo) {
        this.repo = repo;
        this.queueService = new StandardQueueService(repo);
        this.stateMachine = new OnboardingStateMachine(repo);
    }
    async processNextItem() {
        const item = await this.repo.getNextQueuedItem();
        if (!item) {
            return null;
        }
        try {
            // Mark as processing
            await this.queueService.processItem(item.id);
            // Simulate action execution
            if (isTestMode()) {
                // In test mode, always succeed
                await this.queueService.markComplete(item.id, {
                    simulated: true,
                    action: String(item.action),
                    employee: item.employee_email,
                });
            }
            else {
                // In production, this would delegate to Apps Script
                // For now, simulate success
                await this.queueService.markComplete(item.id, {
                    action: String(item.action),
                    employee: item.employee_email,
                });
            }
            // Re-evaluate request state
            const newStatus = await this.stateMachine.evaluateState(item.request_id);
            await this.stateMachine.transitionState(item.request_id, newStatus);
            return this.repo.getQueueItem(item.id);
        }
        catch (error) {
            // Mark as failed
            await this.queueService.markFailed(item.id, String(error));
            // Re-evaluate request state
            const newStatus = await this.stateMachine.evaluateState(item.request_id);
            await this.stateMachine.transitionState(item.request_id, newStatus);
            return this.repo.getQueueItem(item.id);
        }
    }
    async processAllQueued() {
        const results = [];
        let item = await this.processNextItem();
        while (item) {
            results.push(item);
            item = await this.processNextItem();
        }
        return results;
    }
}
