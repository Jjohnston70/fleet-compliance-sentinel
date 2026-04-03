/**
 * Follow-Up Reminder - Find proposals awaiting response
 * Identifies proposals sent > N days ago with no response
 */
export class FollowUpReminder {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Get proposals needing follow-up
     * Default: sent > 3 days ago with no response
     */
    async getFollowUpCandidates(daysThreshold = 3) {
        const proposals = await this.repository.listProposals();
        const now = new Date();
        const candidates = [];
        for (const proposal of proposals) {
            // Only check sent/viewed proposals with no response
            if (!['sent', 'viewed'].includes(proposal.status) || proposal.respondedAt) {
                continue;
            }
            if (!proposal.sentAt)
                continue;
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
    async getHighPriorityFollowUps() {
        const candidates = await this.getFollowUpCandidates(7);
        return candidates.filter(c => c.totalValue >= 50000);
    }
    /**
     * Get urgent follow-ups (> 14 days with no response)
     */
    async getUrgentFollowUps() {
        return this.getFollowUpCandidates(14);
    }
    /**
     * Send follow-up reminders (stub)
     */
    async sendFollowUpReminders(daysThreshold = 3) {
        const candidates = await this.getFollowUpCandidates(daysThreshold);
        // TODO: Implement email sending for follow-ups
        console.log(`Found ${candidates.length} proposals requiring follow-up`);
        return candidates.length;
    }
    /**
     * Generate follow-up summary
     */
    async generateFollowUpSummary() {
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
