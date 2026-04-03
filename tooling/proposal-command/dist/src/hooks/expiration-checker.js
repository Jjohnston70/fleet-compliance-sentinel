/**
 * Expiration Checker - Find and mark expired proposals
 * Run this periodically to check proposals whose validity period has ended
 */
export class ExpirationChecker {
    repository;
    proposalService;
    constructor(repository, proposalService) {
        this.repository = repository;
        this.proposalService = proposalService;
    }
    /**
     * Check and expire proposals
     * Returns list of proposal IDs that were expired
     */
    async checkAndExpireProposals() {
        const proposals = await this.repository.listProposals();
        const now = new Date();
        const expiredIds = [];
        // Find proposals that should be expired
        const expirableProposals = proposals.filter(p => (p.status === 'generated' || p.status === 'sent' || p.status === 'viewed') &&
            p.validUntil < now);
        // Mark each as expired
        for (const proposal of expirableProposals) {
            try {
                await this.proposalService.markAsExpired(proposal.id);
                expiredIds.push(proposal.id);
                console.log(`Expired proposal: ${proposal.proposalNumber}`);
            }
            catch (error) {
                console.error(`Failed to expire proposal ${proposal.id}:`, error);
            }
        }
        return expiredIds;
    }
    /**
     * Get proposals expiring in N days
     */
    async getExpiringProposals(daysFromNow = 7) {
        const proposals = await this.repository.listProposals();
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
        return proposals.filter(p => (p.status === 'sent' || p.status === 'viewed') &&
            p.validUntil > now &&
            p.validUntil <= futureDate);
    }
    /**
     * Send reminder emails for expiring proposals (stub)
     */
    async sendExpiringReminders(daysFromNow = 7) {
        const expiringProposals = await this.getExpiringProposals(daysFromNow);
        // TODO: Implement email sending for reminders
        console.log(`Found ${expiringProposals.length} proposals expiring in ${daysFromNow} days`);
        return expiringProposals.length;
    }
}
