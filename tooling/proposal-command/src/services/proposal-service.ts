/**
 * Proposal Service - CRUD & Business Logic
 * Handles proposal creation, updates, status transitions, and numbering
 */

import { Proposal, ProposalActivity } from '../data/firestore-schema';
import { CONFIG, ProposalStatus } from '../config';
import { InMemoryRepository } from '../data/in-memory-repository';

export class ProposalService {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Create new proposal with auto-generated proposal number
   * Format: PROP-{YYYY}-{sequential}
   */
  async createProposal(
    clientId: string,
    templateId: string,
    title: string,
    description: string,
    totalValue: number,
    validityDays: number = CONFIG.PROPOSAL.DEFAULT_VALIDITY_DAYS
  ): Promise<Proposal> {
    const proposalNumber = await this.generateProposalNumber();

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + validityDays);

    const proposal: Proposal = {
      id: this.generateId(),
      proposalNumber,
      clientId,
      templateId,
      serviceType: 'Consulting', // Will be overridden by caller
      title,
      description,
      status: 'draft',
      totalValue,
      validUntil,
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.saveProposal(proposal);
    await this.logActivity(proposal.id, 'created', 'Proposal created');

    return proposal;
  }

  /**
   * Get proposal by ID
   */
  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.repository.getProposal(id);
  }

  /**
   * List proposals with optional filters
   */
  async listProposals(filters?: {
    clientId?: string;
    status?: ProposalStatus;
    templateId?: string;
  }): Promise<Proposal[]> {
    const proposals = await this.repository.listProposals();

    if (!filters) return proposals;

    return proposals.filter(p => {
      if (filters.clientId && p.clientId !== filters.clientId) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.templateId && p.templateId !== filters.templateId) return false;
      return true;
    });
  }

  /**
   * Update proposal status with validation
   */
  async updateStatus(
    proposalId: string,
    newStatus: ProposalStatus,
    reason: string = ''
  ): Promise<Proposal> {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) throw new Error(`Proposal not found: ${proposalId}`);

    // Validate status transition
    this.validateStatusTransition(proposal.status, newStatus);

    proposal.status = newStatus;
    proposal.updatedAt = new Date();

    // Set metadata based on status
    if (newStatus === 'sent') {
      proposal.sentAt = new Date();
    } else if (newStatus === 'viewed') {
      proposal.viewedAt = new Date();
    } else if (newStatus === 'accepted' || newStatus === 'declined') {
      proposal.respondedAt = new Date();
      proposal.response = newStatus === 'accepted' ? 'accepted' : 'declined';
    }

    await this.repository.saveProposal(proposal);
    await this.logActivity(proposalId, 'created', `Status changed to ${newStatus}. ${reason}`);

    return proposal;
  }

  /**
   * Update proposal details
   */
  async updateProposal(
    id: string,
    updates: Partial<Proposal>
  ): Promise<Proposal> {
    const proposal = await this.getProposal(id);
    if (!proposal) throw new Error(`Proposal not found: ${id}`);

    const updated = {
      ...proposal,
      ...updates,
      id: proposal.id, // Never override ID
      proposalNumber: proposal.proposalNumber, // Never override number
      createdAt: proposal.createdAt, // Never override creation time
      updatedAt: new Date(),
    };

    await this.repository.saveProposal(updated);
    return updated;
  }

  /**
   * Mark proposal as sent
   */
  async markAsSent(proposalId: string): Promise<Proposal> {
    return this.updateStatus(proposalId, 'sent', 'Proposal email sent to client');
  }

  /**
   * Mark proposal as viewed
   */
  async markAsViewed(proposalId: string): Promise<Proposal> {
    return this.updateStatus(proposalId, 'viewed', 'Client viewed proposal');
  }

  /**
   * Mark proposal as accepted
   */
  async markAsAccepted(proposalId: string): Promise<Proposal> {
    return this.updateStatus(proposalId, 'accepted', 'Client accepted proposal');
  }

  /**
   * Mark proposal as declined
   */
  async markAsDeclined(proposalId: string, reason?: string): Promise<Proposal> {
    return this.updateStatus(proposalId, 'declined', `Client declined. ${reason || ''}`);
  }

  /**
   * Mark proposal as expired
   */
  async markAsExpired(proposalId: string): Promise<Proposal> {
    return this.updateStatus(proposalId, 'expired', 'Proposal validity period expired');
  }

  /**
   * Check if proposal is still valid
   */
  isValid(proposal: Proposal): boolean {
    if (proposal.status === 'expired' || proposal.status === 'accepted' || proposal.status === 'declined') {
      return false;
    }
    return new Date() <= proposal.validUntil;
  }

  /**
   * Generate next proposal number without gaps
   * Format: PROP-2026-1001
   */
  private async generateProposalNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const proposals = await this.repository.listProposals();

    // Find all proposal numbers for this year
    const yearProposals = proposals.filter(p => p.proposalNumber.startsWith(`PROP-${year}`));

    if (yearProposals.length === 0) {
      return `${CONFIG.PROPOSAL.NUMBERING_PREFIX}-${year}-${CONFIG.PROPOSAL.SEQUENCE_START}`;
    }

    // Extract sequence numbers and find the highest
    const sequences = yearProposals
      .map(p => {
        const match = p.proposalNumber.match(/-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .sort((a, b) => b - a);

    const nextSequence = sequences[0] + 1;
    return `${CONFIG.PROPOSAL.NUMBERING_PREFIX}-${year}-${nextSequence}`;
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(current: ProposalStatus, next: ProposalStatus): void {
    const validTransitions: Record<ProposalStatus, ProposalStatus[]> = {
      draft: ['generated', 'sent', 'expired'],
      generated: ['sent', 'draft', 'expired'],
      sent: ['viewed', 'draft', 'expired'],
      viewed: ['accepted', 'declined', 'draft', 'expired'],
      accepted: [],
      declined: ['draft'],
      expired: [],
    };

    if (!validTransitions[current].includes(next)) {
      throw new Error(`Invalid status transition: ${current} -> ${next}`);
    }
  }

  /**
   * Log activity for audit trail
   */
  private async logActivity(
    proposalId: string,
    type: string,
    description: string
  ): Promise<void> {
    const activity: ProposalActivity = {
      id: this.generateId(),
      proposalId,
      activityType: type as any,
      description,
      actor: 'system',
      timestamp: new Date(),
    };

    await this.repository.saveActivity(activity);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get proposal activity history
   */
  async getActivityHistory(proposalId: string): Promise<ProposalActivity[]> {
    return this.repository.listActivities(proposalId);
  }
}
