/**
 * govcon-compliance-command - Unified Federal Government Contracting & Compliance System
 *
 * Merges govcon pipeline management, compliance document generation, regulatory templates,
 * intake wizard, maturity scoring, and bid document creation into a single module.
 *
 * Main entry point exporting all services, APIs, tools, and utilities.
 */
export * from "./config/index.js";
export * from "./config/naics-codes.js";
export * from "./config/set-aside-types.js";
export { DEFAULT_COMPLIANCE_ITEMS, getComplianceItemsForAuthority } from "./config/compliance-seeds.js";
export { InMemoryRepository } from "./data/repository.js";
export type { Opportunity, BidDecision, Proposal, OutreachContact, OutreachActivity, ComplianceItem, PipelineMetrics, CompanyRecord, CompliancePackage, IntakeResult, MaturityTracker, BidDocument, } from "./data/schemas.js";
export { SEED_OPPORTUNITIES, SEED_OUTREACH_CONTACTS, SEED_COMPLIANCE_ITEMS, COMPLIANCE_PACKAGE_TEMPLATES, PLACEHOLDER_MAP, seedDatabase, } from "./data/seeds.js";
export { OpportunityService } from "./services/opportunity-service.js";
export { BidDecisionService, type BidScoreInput, type BidScoringWeights } from "./services/bid-decision-service.js";
export { OutreachService } from "./services/outreach-service.js";
export { ComplianceService } from "./services/compliance-service.js";
export { PipelineService } from "./services/pipeline-service.js";
export { CompliancePackageService } from "./services/package-service.js";
export { renderTemplate, renderMarkdownTemplate, buildReplacementValues } from "./services/template-engine.js";
export { generateDocx, generatePdf, generateDocumentOutputs, type GeneratedDocument } from "./services/document-generator.js";
export { IntakeService } from "./services/intake-service.js";
export { MaturityService } from "./services/maturity-service.js";
export { BidDocumentService } from "./services/bid-document-service.js";
export { createOpportunitiesAPI, type OpportunitiesAPI } from "./api/opportunities-api.js";
export { createBidDecisionAPI, type BidDecisionAPI } from "./api/bid-decision-api.js";
export { createOutreachAPI, type OutreachAPI } from "./api/outreach-api.js";
export { createComplianceAPI, type ComplianceAPI } from "./api/compliance-api.js";
export { createPipelineAPI, type PipelineAPI } from "./api/pipeline-api.js";
export { DeadlineMonitor, type DeadlineAlert } from "./hooks/deadline-monitor.js";
export { ComplianceMonitor, type ComplianceAlert } from "./hooks/compliance-monitor.js";
export { PipelineDashboard, type DashboardMetrics } from "./reporting/pipeline-dashboard.js";
export { WinLossReportGenerator, type WinLossReport } from "./reporting/win-loss-report.js";
export { OutreachReport, type OutreachMetrics } from "./reporting/outreach-report.js";
export { GOVCON_COMPLIANCE_TOOLS, createToolHandlers, type ToolDefinition, type ToolHandler } from "./tools.js";
//# sourceMappingURL=index.d.ts.map