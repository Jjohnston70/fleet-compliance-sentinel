/**
 * Expiration Checker - Find and mark expired proposals
 * Run this periodically to check proposals whose validity period has ended
 */

import { ProposalService } from '../services/proposal-service';
import { InMemoryRepository } from '../data/in-memory-repository';

export class ExpirationChecker {
  constructor(private repository: InMemoryRepository, private proposalService: ProposalService) {}

  /**
   * Check and expire proposals
   * Returns list of proposal IDs that were expired
   */
  async checkAndExpireProposals(): Promise<string[]> {
    const proposals = await this.repository.listProposals();
    const now = new Date();
    const expiredIds: string[] = [];

    // Find proposals that should be expired
    const expirableProposals = proposals.filter(
      p =>
        (p.status === 'generated' || p.status === 'sent' || p.status === 'viewed') &&
        p.validUntil < now
    );

    // Mark each as expired
    for (const proposal of expirableProposals) {
      try {
        await this.proposalService.markAsExpired(proposal.id);
        expiredIds.push(proposal.id);
        console.log(`Expired proposal: ${proposal.proposalNumber}`);
      } catch (error) {
        console.error(`Failed to expire proposal ${proposal.id}:`, error);
      }
    }

    return expiredIds;
  }

  /**
   * Get proposals expiring in N days
   */
  async getExpiringProposals(daysFromNow: number = 7): Promise<any[]> {
    const proposals = await this.repository.listProposals();
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    return proposals.filter(
      p =>
        (p.status === 'sent' || p.status === 'viewed') &&
        p.validUntil > now &&
        p.validUntil <= futureDate
    );
  }

  /**
   * Send reminder emails for expiring proposals (stub)
   */
  async sendExpiringReminders(daysFromNow: number = 7): Promise<number> {
    const expiringProposals = await this.getExpiringProposals(daysFromNow);

    // TODO: Implement email sending for reminders
    console.log(`Found ${expiringProposals.length} proposals expiring in ${daysFromNow} days`);

    return expiringProposals.length;
  }
}
