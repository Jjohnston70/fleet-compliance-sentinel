import { Repository } from '../data/repository.js';
import { OnboardingStatus, QueueItemStatus } from '../data/schema.js';

export interface OnboardingStatusReport {
  totalRequests: number;
  byStatus: Record<OnboardingStatus, number>;
  averageCompletionTime: number;
  queueCompletionRate: number;
  activeRequests: number;
  failedRequests: number;
  partialRequests: number;
  completedRequests: number;
}

export class StatusReportGenerator {
  constructor(private repo: Repository) {}

  async generate(): Promise<OnboardingStatusReport> {
    const requests = await this.repo.listRequests();
    const statuses = requests.map((r) => r.status);

    // Count by status
    const byStatus: Record<OnboardingStatus, number> = {
      [OnboardingStatus.Pending]: 0,
      [OnboardingStatus.Provisioning]: 0,
      [OnboardingStatus.Complete]: 0,
      [OnboardingStatus.Partial]: 0,
      [OnboardingStatus.Failed]: 0,
      [OnboardingStatus.RolledBack]: 0,
    };

    for (const status of statuses) {
      byStatus[status]++;
    }

    // Calculate average completion time
    const completedRequests = requests.filter((r) => r.status === OnboardingStatus.Complete);
    let totalTime = 0;
    for (const req of completedRequests) {
      if (req.completed_at && req.created_at) {
        totalTime += req.completed_at.getTime() - req.created_at.getTime();
      }
    }
    const averageCompletionTime = completedRequests.length > 0 ? totalTime / completedRequests.length : 0;

    // Calculate queue completion rate
    const allQueueItems = await this.repo.listQueueItems();
    const completedQueueItems = allQueueItems.filter((item) => item.status === QueueItemStatus.Complete);
    const queueCompletionRate =
      allQueueItems.length > 0 ? (completedQueueItems.length / allQueueItems.length) * 100 : 0;

    return {
      totalRequests: requests.length,
      byStatus,
      averageCompletionTime,
      queueCompletionRate,
      activeRequests: byStatus[OnboardingStatus.Provisioning],
      failedRequests: byStatus[OnboardingStatus.Failed],
      partialRequests: byStatus[OnboardingStatus.Partial],
      completedRequests: byStatus[OnboardingStatus.Complete],
    };
  }
}
