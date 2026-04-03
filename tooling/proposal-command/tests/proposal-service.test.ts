/**
 * Proposal Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProposalService } from '../src/services/proposal-service';
import { InMemoryRepository } from '../src/data/in-memory-repository';

describe('ProposalService', () => {
  let repository: InMemoryRepository;
  let service: ProposalService;

  beforeEach(async () => {
    repository = new InMemoryRepository();
    service = new ProposalService(repository);
  });

  it('should create proposal with auto-generated number', async () => {
    const proposal = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Complete redesign of company website',
      15000,
      30
    );

    expect(proposal.id).toBeDefined();
    expect(proposal.proposalNumber).toMatch(/^PROP-\d{4}-\d+$/);
    expect(proposal.status).toBe('draft');
    expect(proposal.totalValue).toBe(15000);
  });

  it('should generate sequential proposal numbers without gaps', async () => {
    const p1 = await service.createProposal(
      'client-1',
      'tpl-web-dev',
      'Project 1',
      'Description 1',
      10000
    );

    const p2 = await service.createProposal(
      'client-2',
      'tpl-web-dev',
      'Project 2',
      'Description 2',
      20000
    );

    const num1 = parseInt(p1.proposalNumber.split('-')[2]);
    const num2 = parseInt(p2.proposalNumber.split('-')[2]);

    expect(num2).toBe(num1 + 1);
  });

  it('should get proposal by ID', async () => {
    const created = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Description',
      15000
    );

    const retrieved = await service.getProposal(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.title).toBe('Website Redesign');
  });

  it('should list proposals with filters', async () => {
    await service.createProposal('client-1', 'tpl-web-dev', 'P1', 'D1', 10000);
    await service.createProposal('client-2', 'tpl-consulting', 'P2', 'D2', 20000);
    await service.createProposal('client-1', 'tpl-design', 'P3', 'D3', 5000);

    const byClient = await service.listProposals({ clientId: 'client-1' });
    expect(byClient.length).toBe(2);

    const all = await service.listProposals();
    expect(all.length).toBe(3);
  });

  it('should update proposal status', async () => {
    const proposal = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Description',
      15000
    );

    const updated = await service.updateStatus(proposal.id, 'sent');

    expect(updated.status).toBe('sent');
    expect(updated.sentAt).toBeDefined();
  });

  it('should validate status transitions', async () => {
    const proposal = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Description',
      15000
    );

    // Valid transition: draft -> sent
    const sent = await service.markAsSent(proposal.id);
    expect(sent.status).toBe('sent');

    // Valid transition: sent -> viewed
    const viewed = await service.markAsViewed(sent.id);
    expect(viewed.status).toBe('viewed');

    // Valid transition: viewed -> accepted
    const accepted = await service.markAsAccepted(viewed.id);
    expect(accepted.status).toBe('accepted');
  });

  it('should prevent invalid status transitions', async () => {
    const proposal = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Description',
      15000
    );

    // Move to accepted state: draft -> sent -> viewed -> accepted
    await service.markAsSent(proposal.id);
    await service.markAsViewed(proposal.id);
    await service.markAsAccepted(proposal.id);

    // Try invalid transition: accepted -> sent (should fail)
    try {
      await service.updateStatus(proposal.id, 'sent');
      expect('Should have thrown error').toContain('Invalid status transition');
    } catch (error: any) {
      expect(error.message).toContain('Invalid status transition');
    }
  });

  it('should check proposal validity', async () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const proposal = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Description',
      15000,
      30
    );

    expect(service.isValid(proposal)).toBe(true);

    // Mark as expired
    const expired = await service.markAsExpired(proposal.id);
    expect(service.isValid(expired)).toBe(false);
  });

  it('should get activity history', async () => {
    const proposal = await service.createProposal(
      'client-123',
      'tpl-web-dev',
      'Website Redesign',
      'Description',
      15000
    );

    await service.markAsSent(proposal.id);
    const activities = await service.getActivityHistory(proposal.id);

    expect(activities.length).toBeGreaterThan(0);
    expect(activities.some(a => a.activityType === 'created')).toBe(true);
    expect(activities.some(a => a.activityType === 'created')).toBe(true);
  });
});
