/**
 * TNDS Proposal Command Module
 * Main entry point - exports all public APIs
 *
 * Stack: Next.js 14 + Vercel + Firebase/Firestore + TypeScript
 * Zero external TNDS dependencies - fully standalone
 */

// Config
export { CONFIG } from './config';
export type { ServiceType, ProposalStatus, ActivityType, PricingCategory } from './config';

// Data Layer
export {
  Proposal,
  Client,
  ProposalTemplate,
  LineItem,
  ProposalActivity,
  TemplateSection,
  PricingSummary,
} from './data/firestore-schema';

export { InMemoryRepository } from './data/in-memory-repository';
export { DEFAULT_TEMPLATES } from './data/seed-templates';

// Services
export { ProposalEngine, ProposalRenderData } from './services/proposal-engine';
export { ProposalService } from './services/proposal-service';
export { ClientService } from './services/client-service';
export { PricingService } from './services/pricing-service';
export { PDFGenerator } from './services/pdf-generator';
export { EmailService, EmailPayload } from './services/email-service';

// API Handlers (for Next.js API routes)
export {
  createProposal,
  listProposals,
  getProposal,
  updateProposal,
  sendProposal,
  trackProposal,
} from './api/proposals';

export { createClient, listClients, getClient, updateClient } from './api/clients';
export { listTemplates, getTemplate } from './api/templates';

// Hooks
export { ExpirationChecker } from './hooks/expiration-checker';
export { FollowUpReminder, FollowUpCandidate } from './hooks/follow-up-reminder';

// Reporting
export { PipelineReport, PipelineMetrics } from './reporting/pipeline-report';
export { ServiceBreakdownReport, ServiceMetrics, ServiceBreakdown } from './reporting/service-breakdown';

// LLM Tools
export { PROPOSAL_COMMAND_TOOLS, toolHandlers, ToolHandler } from './tools';

/**
 * Module Version
 */
export const MODULE_VERSION = '1.0.0';
export const MODULE_NAME = 'TNDS Proposal Command';
