/**
 * Follow-Up Reminder - Find proposals awaiting response
 * Identifies proposals sent > N days ago with no response
 */

import { InMemoryRepository } from '../data/in-memory-repository';

export interface FollowUpCandidate {
  proposalId: string;
  proposalNumber: string;
  clientName: string;
  clientEmail: string;
  totalValue: number;
  daysSinceSent: number;
  lastActivity: string;
}

export class FollowUpReminder {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Get proposals needing follow-up
   * Default: sent > 3 days ago with no response
   */
  async getFollowUpCandidates(daysThreshold: number = 3): Promise<FollowUpCandidate[]> {
    const proposals = await this.repository.listProposals();
    const now = new Date();
    const candidates: FollowUpCandidate[] = [];

    for (const proposal of proposals) {
      // Only check sent/viewed proposals with no response
      if (!['sent', 'viewed'].includes(proposal.status) || proposal.respondedAt) {
        continue;
      }

      if (!proposal.sentAt) continue;

      const daysSinceSent = (now.getTime() - proposal.sentAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceSent >= daysThreshold) {
        const client = await this.repository.getClient(proposal.clientId);

        if (client) {
          candidates.push({
            proposalId: proposal.id,
            proposalNumber: proposal.proposalNumber,
            clientName: client.contactName,
            clientEmail: client.email,
            totalValue: proposal.totalValue,
            daysSinceSent: Math.floor(daysSinceSent),
            lastActivity: proposal.viewedAt ? 'viewed' : 'sent',
          });
        }
      }
    }

    return candidates.sort((a, b) => b.totalValue - a.totalValue);
  }

  /**
   * Get high-priority follow-ups (> $50k, no response after 7+ days)
   */
  async getHighPriorityFollowUps(): Promise<FollowUpCandidate[]> {
    const candidates = await this.getFollowUpCandidates(7);
    return candidates.filter(c => c.totalValue >= 50000);
  }

  /**
   * Get urgent follow-ups (> 14 days with no response)
   */
  async getUrgentFollowUps(): Promise<FollowUpCandidate[]> {
    return this.getFollowUpCandidates(14);
  }

  /**
   * Send follow-up reminders (stub)
   */
  async sendFollowUpReminders(daysThreshold: number = 3): Promise<number> {
    const candidates = await this.getFollowUpCandidates(daysThreshold);

    // TODO: Implement email sending for follow-ups
    console.log(`Found ${candidates.length} proposals requiring follow-up`);

    return candidates.length;
  }

  /**
   * Generate follow-up summary
   */
  async generateFollowUpSummary(): Promise<{
    urgent: number;
    highPriority: number;
    total: number;
  }> {
    const urgent = await this.getUrgentFollowUps();
    const highPriority = await this.getHighPriorityFollowUps();
    const total = await this.getFollowUpCandidates();

    return {
      urgent: urgent.length,
      highPriority: highPriority.length,
      total: total.length,
    };
  }
}
