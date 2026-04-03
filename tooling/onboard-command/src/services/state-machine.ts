import {
  OnboardingRequest,
  OnboardingStatus,
  QueueActionType,
  QueueItemStatus,
  ProvisioningQueueItem,
} from '../data/schema.js';
import { Repository } from '../data/repository.js';

export interface StateMachine {
  initializeRequest(request: OnboardingRequest): Promise<OnboardingRequest>;
  evaluateState(requestId: string): Promise<OnboardingStatus>;
  transitionState(requestId: string, newStatus: OnboardingStatus): Promise<OnboardingRequest>;
}

export class OnboardingStateMachine implements StateMachine {
  constructor(private repo: Repository) {}

  async initializeRequest(request: OnboardingRequest): Promise<OnboardingRequest> {
    // First ensure the request exists in the repo
    let storedRequest = await this.repo.getRequest(request.id);
    if (!storedRequest) {
      storedRequest = await this.repo.createRequest({
        client_name: request.client_name,
        contact_email: request.contact_email,
        employees: request.employees,
        mode: request.mode,
        status: request.status,
        error_log: request.error_log,
      });
    }

    // Create queue items for each employee for each action
    const actions = [
      QueueActionType.CreateUser,
      QueueActionType.AssignLicense,
      QueueActionType.CreateDrive,
      QueueActionType.CreateFolders,
      QueueActionType.CreateLabels,
      QueueActionType.GenerateDocs,
    ];

    for (const employee of storedRequest.employees) {
      for (const action of actions) {
        await this.repo.createQueueItem({
          request_id: storedRequest.id,
          employee_email: employee.email,
          employee_id: employee.id,
          action,
          status: QueueItemStatus.Queued,
          retry_count: 0,
          result: null,
        });
      }
    }

    // Transition to provisioning
    return this.repo.updateRequest(storedRequest.id, {
      status: OnboardingStatus.Provisioning,
    });
  }

  async evaluateState(requestId: string): Promise<OnboardingStatus> {
    const queueItems = await this.repo.getQueueItemsByRequest(requestId);

    if (queueItems.length === 0) {
      return OnboardingStatus.Pending;
    }

    const statuses = queueItems.map((item) => item.status);
    const hasQueued = statuses.includes(QueueItemStatus.Queued);
    const hasProcessing = statuses.includes(QueueItemStatus.Processing);
    const hasComplete = statuses.includes(QueueItemStatus.Complete);
    const hasFailed = statuses.includes(QueueItemStatus.Failed);
    const hasSkipped = statuses.includes(QueueItemStatus.Skipped);

    // If still processing
    if (hasQueued || hasProcessing) {
      return OnboardingStatus.Provisioning;
    }

    // All items are done (none queued or processing)
    // Count what's done vs what failed
    const totalItems = queueItems.length;
    const completeOrSkipped = queueItems.filter(
      (item) => item.status === QueueItemStatus.Complete || item.status === QueueItemStatus.Skipped
    ).length;
    const failed = queueItems.filter((item) => item.status === QueueItemStatus.Failed).length;

    // If all items completed or skipped (no failures)
    if (failed === 0 && completeOrSkipped === totalItems) {
      return OnboardingStatus.Complete;
    }

    // If some failed but some also completed (partial success)
    if (failed > 0 && completeOrSkipped > 0) {
      return OnboardingStatus.Partial;
    }

    // If all failed
    if (failed === totalItems) {
      return OnboardingStatus.Failed;
    }

    return OnboardingStatus.Provisioning;
  }

  async transitionState(requestId: string, newStatus: OnboardingStatus): Promise<OnboardingRequest> {
    const request = await this.repo.getRequest(requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    const completedAt = newStatus === OnboardingStatus.Complete ? new Date() : request.completed_at;

    return this.repo.updateRequest(requestId, {
      status: newStatus,
      completed_at: completedAt,
    });
  }
}
