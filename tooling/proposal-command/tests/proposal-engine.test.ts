/**
 * Proposal Engine Tests
 */

import { describe, it, expect } from 'vitest';
import { ProposalEngine } from '../src/services/proposal-engine';
import { Proposal, ProposalTemplate, LineItem } from '../src/data/firestore-schema';

describe('ProposalEngine', () => {
  const mockProposal: Proposal = {
    id: 'prop-123',
    proposalNumber: 'PROP-2026-1001',
    clientId: 'client-123',
    templateId: 'tpl-web-dev',
    serviceType: 'Web Development',
    title: 'Website Redesign',
    status: 'draft',
    totalValue: 15000,
    validUntil: new Date('2026-04-30'),
    createdAt: new Date('2026-03-30'),
    updatedAt: new Date('2026-03-30'),
  };

  const mockTemplate: ProposalTemplate = {
    id: 'tpl-web-dev',
    name: 'Web Development Proposal',
    serviceType: 'Web Development',
    sections: [
      {
        id: 'sec-1',
        title: 'Overview',
        contentTemplate: 'Project: {{PROJECT_TITLE}}',
        order: 1,
        optional: false,
      },
    ],
    defaultTerms: 'Standard payment terms apply',
    defaultValidityDays: 30,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLineItems: LineItem[] = [
    {
      id: 'item-1',
      proposalId: 'prop-123',
      description: 'Web Development',
      quantity: 1,
      unitPrice: 15000,
      total: 15000,
      category: 'Development',
      order: 1,
      createdAt: new Date(),
    },
  ];

  const mockPricingSummary = {
    subtotal: 15000,
    taxRate: 0,
    taxAmount: 0,
    discountPercent: 0,
    discountAmount: 0,
    total: 15000,
  };

  it('should generate proposal with correct structure', () => {
    const proposal = ProposalEngine.generateProposal({
      proposal: mockProposal,
      template: mockTemplate,
      lineItems: mockLineItems,
      pricingSummary: mockPricingSummary,
      clientName: 'John Doe',
      clientCompany: 'Acme Corp',
      clientEmail: 'john@acme.com',
      projectDescription: 'Complete website redesign',
      timeline: '8 weeks',
    });

    expect(proposal).toContain('PROPOSAL');
    expect(proposal).toContain('Website Redesign');
    expect(proposal).toContain('Acme Corp');
    expect(proposal).toContain('John Doe');
  });

  it('should include pricing table', () => {
    const proposal = ProposalEngine.generateProposal({
      proposal: mockProposal,
      template: mockTemplate,
      lineItems: mockLineItems,
      pricingSummary: mockPricingSummary,
      clientName: 'John Doe',
      clientCompany: 'Acme Corp',
      clientEmail: 'john@acme.com',
      projectDescription: 'Complete website redesign',
      timeline: '8 weeks',
    });

    expect(proposal).toContain('Web Development');
    expect(proposal).toContain('15000');
    expect(proposal).toContain('Investment & Pricing');
  });

  it('should handle multiple line items', () => {
    const multipleItems = [
      {
        ...mockLineItems[0],
        id: 'item-1',
        description: 'Development',
        unitPrice: 10000,
        total: 10000,
      },
      {
        ...mockLineItems[0],
        id: 'item-2',
        description: 'Design',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      },
    ];

    const proposal = ProposalEngine.generateProposal({
      proposal: mockProposal,
      template: mockTemplate,
      lineItems: multipleItems,
      pricingSummary: { ...mockPricingSummary, total: 15000 },
      clientName: 'John Doe',
      clientCompany: 'Acme Corp',
      clientEmail: 'john@acme.com',
      projectDescription: 'Complete website redesign',
      timeline: '8 weeks',
    });

    expect(proposal).toContain('Development');
    expect(proposal).toContain('Design');
  });

  it('should include terms and conditions', () => {
    const proposal = ProposalEngine.generateProposal({
      proposal: mockProposal,
      template: mockTemplate,
      lineItems: mockLineItems,
      pricingSummary: mockPricingSummary,
      clientName: 'John Doe',
      clientCompany: 'Acme Corp',
      clientEmail: 'john@acme.com',
      projectDescription: 'Complete website redesign',
      timeline: '8 weeks',
    });

    expect(proposal).toContain('Terms & Conditions');
    expect(proposal).toContain('Standard payment terms apply');
  });

  it('should format dates correctly', () => {
    const proposal = ProposalEngine.generateProposal({
      proposal: mockProposal,
      template: mockTemplate,
      lineItems: mockLineItems,
      pricingSummary: mockPricingSummary,
      clientName: 'John Doe',
      clientCompany: 'Acme Corp',
      clientEmail: 'john@acme.com',
      projectDescription: 'Complete website redesign',
      timeline: '8 weeks',
    });

    // Should contain a date in format MM/DD/YYYY
    expect(proposal).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
