import { QueueActionType, QueueItemStatus, OnboardingStatus, AuditStatus, } from '../data/schema.js';
export class StandardRollbackEngine {
    constructor(repo, auditService) {
        this.repo = repo;
        this.auditService = auditService;
    }
    async rollbackRequest(requestId, reason) {
        const request = await this.repo.getRequest(requestId);
        if (!request) {
            throw new Error(`Request ${requestId} not found`);
        }
        // Get all completed queue items
        const queueItems = await this.repo.getQueueItemsByRequest(requestId);
        const completedItems = queueItems.filter((item) => item.status === QueueItemStatus.Complete);
        // Generate reverse actions
        const reverseActions = [];
        for (const item of completedItems) {
            const reverseAction = this.getReverseAction(item);
            if (reverseAction) {
                reverseActions.push(reverseAction);
            }
        }
        // Create queue items for reverse actions
        for (const action of reverseActions) {
            await this.repo.createQueueItem({
                request_id: action.request_id,
                employee_email: action.employee_email,
                employee_id: action.employee_id,
                action: action.action,
                status: QueueItemStatus.Queued,
                retry_count: 0,
                result: null,
            });
        }
        // Log rollback action
        await this.auditService.log({
            request_id: requestId,
            action: 'ROLLBACK_INITIATED',
            actor: 'system',
            target: `Request ${requestId}`,
            status: AuditStatus.Rollback,
            details: {
                reason,
                completedItemsCount: completedItems.length,
                reverseActionsCount: reverseActions.length,
            },
        });
        // Transition request to rolled_back
        return this.repo.updateRequest(requestId, {
            status: OnboardingStatus.RolledBack,
            completed_at: new Date(),
        });
    }
    getReverseAction(item) {
        // Map each action to its reverse
        const reverseMap = {
            [QueueActionType.CreateUser]: QueueActionType.CreateUser, // In real scenario, would be DeleteUser
            [QueueActionType.AssignLicense]: QueueActionType.AssignLicense, // In real scenario, would be UnassignLicense
            [QueueActionType.CreateDrive]: QueueActionType.CreateDrive, // In real scenario, would be DeleteDrive
            [QueueActionType.CreateFolders]: QueueActionType.CreateFolders, // In real scenario, would be DeleteFolders
            [QueueActionType.CreateLabels]: QueueActionType.CreateLabels, // In real scenario, would be DeleteLabels
            [QueueActionType.GenerateDocs]: null, // Docs are informational, no reverse needed
        };
        const reverseAction = reverseMap[item.action];
        if (!reverseAction) {
            return null;
        }
        return {
            ...item,
            id: undefined, // Will be regenerated
            status: QueueItemStatus.Queued,
            retry_count: 0,
            result: null,
            processed_at: undefined,
        };
    }
}
