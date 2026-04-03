import { describe, it, expect } from 'vitest';
import { ActionItemExtractor, EmailData } from '../src/services/action-item-extractor.js';

describe('ActionItemExtractor', () => {
  const extractor = new ActionItemExtractor({
    vip_senders: ['boss@example.com', 'client@example.com'],
  });

  const createEmail = (overrides: Partial<EmailData> = {}): EmailData => ({
    thread_id: 'thread-1',
    subject: 'Test Subject',
    sender: 'test@example.com',
    body: 'Test body',
    received_at: new Date(),
    ...overrides,
  });

  it('should extract action item from urgent email', () => {
    const email = createEmail({
      subject: 'URGENT: Action Required',
      body: 'Please review this immediately',
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem).toBeDefined();
    expect(actionItem?.priority).toMatch(/high|medium/);
  });

  it('should set critical priority for VIP + urgent', () => {
    const email = createEmail({
      subject: 'URGENT: Review needed',
      sender: 'boss@example.com',
      body: 'Need immediate action',
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem?.priority).toBe('critical');
  });

  it('should return null for low priority emails', () => {
    const email = createEmail({
      subject: 'FYI: Report attached',
      body: 'Just informational',
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem).toBeNull();
  });

  it('should detect multiple urgent keywords', () => {
    const keywords = ['urgent', 'asap', 'deadline', 'critical', 'immediate'];
    keywords.forEach((keyword) => {
      const email = createEmail({
        subject: `Test ${keyword}`,
        body: 'body',
      });

      const actionItem = extractor.extractActionItems(email, 'digest-1');
      expect(actionItem).not.toBeNull();
    });
  });

  it('should mark old emails with actions as high priority', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 2); // 2 days old

    const email = createEmail({
      subject: 'Action Required',
      received_at: oldDate,
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem?.priority).toMatch(/high|critical/);
  });

  it('should extract description from subject and body', () => {
    const email = createEmail({
      subject: 'Review Q1 Budget',
      body: 'Please review the attached Q1 budget document and provide feedback by Friday.',
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem?.description).toContain('Review Q1 Budget');
  });

  it('should have pending status initially', () => {
    const email = createEmail({
      subject: 'URGENT: Action Required',
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem?.status).toBe('pending');
  });

  it('should be able to extract items from VIP senders', () => {
    const email = createEmail({
      sender: 'client@example.com',
      subject: 'Important Update',
      body: 'This is from a VIP client',
    });

    const actionItem = extractor.extractActionItems(email, 'digest-1');
    expect(actionItem?.priority).toMatch(/high|critical|medium/);
  });
});
