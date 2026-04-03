/**
 * Firestore Data Schema - Type Definitions
 * Defines all data structures stored in Firestore
 */

import { ProposalStatus, ServiceType, ActivityType, PricingCategory } from '../config';
export { ServiceType };

/**
 * Proposal - Main proposal document record
 * Collection: proposals
 */
export interface Proposal {
  id: string;
  proposalNumber: string; // PROP-{YYYY}-{sequence}
  clientId: string;
  templateId: string;
  serviceType: ServiceType;
  title: string;
  description?: string;
  status: ProposalStatus;
  totalValue: number;
  validUntil: Date;
  generatedPdfUrl?: string;
  generatedDocxUrl?: string;
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  response?: 'accepted' | 'declined';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client - Company/contact information
 * Collection: clients
 */
export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  source: 'form' | 'manual' | 'import';
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * ProposalTemplate - Service-specific proposal templates
 * Collection: proposal_templates
 */
export interface ProposalTemplate {
  id: string;
  name: string;
  serviceType: ServiceType;
  sections: TemplateSection[];
  defaultTerms: string;
  defaultValidityDays: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TemplateSection - Section within a proposal template
 */
export interface TemplateSection {
  id: string;
  title: string;
  contentTemplate: string; // Handlebars with {{PLACEHOLDERS}}
  order: number;
  optional: boolean;
}

/**
 * LineItem - Individual pricing line item within a proposal
 * Collection: line_items
 */
export interface LineItem {
  id: string;
  proposalId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: PricingCategory;
  order: number;
  createdAt: Date;
}

/**
 * ProposalActivity - Audit trail of proposal events
 * Collection: proposal_activities
 */
export interface ProposalActivity {
  id: string;
  proposalId: string;
  activityType: ActivityType;
  description: string;
  actor: string; // User ID or system
  timestamp: Date;
}

/**
 * PricingSummary - Computed totals for a proposal
 * Not stored, computed from line_items
 */
export interface PricingSummary {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}
