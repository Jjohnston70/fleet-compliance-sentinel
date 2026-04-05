/**
 * LLM Tool Definitions for govcon-compliance-command
 * 20 tools covering pipeline, compliance docs, intake, maturity, and bid documents
 */

import { InMemoryRepository } from "./data/repository.js";
import { OpportunityService } from "./services/opportunity-service.js";
import { BidDecisionService, BidScoreInput } from "./services/bid-decision-service.js";
import { OutreachService } from "./services/outreach-service.js";
import { ComplianceService } from "./services/compliance-service.js";
import { PipelineService } from "./services/pipeline-service.js";
import { CompliancePackageService } from "./services/package-service.js";
import { IntakeService } from "./services/intake-service.js";
import { MaturityService } from "./services/maturity-service.js";
import { BidDocumentService } from "./services/bid-document-service.js";
import { DeadlineMonitor } from "./hooks/deadline-monitor.js";
import { ComplianceMonitor } from "./hooks/compliance-monitor.js";
import { PipelineDashboard } from "./reporting/pipeline-dashboard.js";
import { WinLossReportGenerator } from "./reporting/win-loss-report.js";
import { OutreachReport } from "./reporting/outreach-report.js";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

export type ToolHandler = (input: any) => Promise<any>;

export const GOVCON_COMPLIANCE_TOOLS: ToolDefinition[] = [
  // ============================================================
  // GOVCON PIPELINE TOOLS (1-10, from govcon-command)
  // ============================================================
  {
    name: "search_opportunities",
    description: "Search and filter federal contracting opportunities",
    inputSchema: {
      type: "object",
      properties: {
        agency: { type: "string", description: "Filter by agency name" },
        naics_code: { type: "string", description: "Filter by NAICS code" },
        set_aside_type: { type: "string", enum: ["SDVOSB", "VOSB", "8a", "HUBZone", "WOSB", "small_business", "full_open"], description: "Filter by set-aside type" },
        status: { type: "string", enum: ["identified", "evaluating", "bid", "no_bid", "submitted", "awarded", "lost"], description: "Filter by status" },
      },
      required: [],
    },
  },
  {
    name: "run_bid_decision",
    description: "Run weighted bid/no-bid decision for an opportunity with detailed scoring",
    inputSchema: {
      type: "object",
      properties: {
        opportunity_id: { type: "string", description: "ID of the opportunity" },
        technical_fit: { type: "number", minimum: 0, maximum: 100, description: "Technical capability match (0-100)" },
        set_aside_match: { type: "number", minimum: 0, maximum: 100, description: "Set-aside eligibility (0-100)" },
        competition_level: { type: "number", minimum: 0, maximum: 100, description: "Expected competition (0=high, 100=low)" },
        contract_value: { type: "number", description: "Estimated contract value in dollars" },
        timeline_feasibility: { type: "number", minimum: 0, maximum: 100, description: "Can we meet delivery timeline (0-100)" },
        relationship: { type: "number", minimum: 0, maximum: 100, description: "Existing relationship with agency (0-100)" },
        strategic_value: { type: "number", minimum: 0, maximum: 100, description: "Strategic importance (0-100)" },
      },
      required: ["opportunity_id", "technical_fit", "set_aside_match", "competition_level", "contract_value", "timeline_feasibility", "relationship", "strategic_value"],
    },
  },
  {
    name: "get_pipeline_status",
    description: "Get comprehensive view of federal contracting pipeline and metrics",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "log_outreach_activity",
    description: "Log outreach activity (email, call, meeting, etc.) with a contact",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: { type: "string", description: "ID of the contact" },
        activity_type: { type: "string", enum: ["email", "phone", "meeting", "event", "linkedin"], description: "Type of outreach" },
        subject: { type: "string", description: "Activity subject or description" },
      },
      required: ["contact_id", "activity_type", "subject"],
    },
  },
  {
    name: "check_compliance_status",
    description: "Check compliance and certification status with expiration alerts",
    inputSchema: {
      type: "object",
      properties: { authority: { type: "string", enum: ["SBA", "SAM", "IRS", "state", "VA"], description: "Filter by authority" } },
      required: [],
    },
  },
  {
    name: "get_upcoming_deadlines",
    description: "Get opportunities with upcoming response deadlines",
    inputSchema: {
      type: "object",
      properties: { days_from_now: { type: "number", description: "Number of days to look ahead (default 7)" } },
      required: [],
    },
  },
  {
    name: "create_opportunity",
    description: "Create a new opportunity in the pipeline",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        solicitation_number: { type: "string" },
        agency: { type: "string" },
        response_deadline: { type: "string", description: "ISO date string" },
        set_aside_type: { type: "string", enum: ["SDVOSB", "VOSB", "8a", "HUBZone", "WOSB", "small_business", "full_open"] },
        naics_code: { type: "string" },
        naics_description: { type: "string" },
        description: { type: "string" },
        estimated_value: { type: "number", description: "Optional contract value" },
      },
      required: ["title", "solicitation_number", "agency", "response_deadline", "set_aside_type", "naics_code", "naics_description", "description"],
    },
  },
  {
    name: "get_win_loss_report",
    description: "Generate win-loss analysis and performance metrics",
    inputSchema: {
      type: "object",
      properties: { days: { type: "number", description: "Number of days to analyze (default 180)" } },
      required: [],
    },
  },
  {
    name: "list_contacts",
    description: "List outreach contacts with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        agency: { type: "string", description: "Filter by agency" },
        status: { type: "string", enum: ["prospect", "warm", "active", "cold"], description: "Filter by contact status" },
      },
      required: [],
    },
  },
  {
    name: "get_bid_recommendation",
    description: "Get bid recommendation for an opportunity based on all available criteria",
    inputSchema: {
      type: "object",
      properties: { opportunity_id: { type: "string", description: "ID of the opportunity" } },
      required: ["opportunity_id"],
    },
  },

  // ============================================================
  // COMPLIANCE DOCUMENT TOOLS (11-14, from compliance-command)
  // ============================================================
  {
    name: "submit_company_info",
    description: "Submit or update company information for compliance document generation. Accepts 40+ fields including company name, certifications, personnel, security posture.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "Company legal name" },
        owner_name: { type: "string" },
        owner_title: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        zip: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        uei: { type: "string" },
        cage_code: { type: "string" },
        naics_primary: { type: "string" },
        business_type: { type: "string" },
        employee_count: { type: "number" },
        security_officer: { type: "string" },
        privacy_officer: { type: "string" },
        compliance_officer: { type: "string" },
        cloud_provider: { type: "string" },
        federal_contracts: { type: "boolean" },
        handles_phi: { type: "boolean" },
        handles_pci: { type: "boolean" },
        handles_cui: { type: "boolean" },
        frameworks_required: { type: "array", items: { type: "string" }, description: "Required compliance frameworks (cmmc, soc2, fedramp, etc.)" },
      },
      required: ["company_name"],
    },
  },
  {
    name: "generate_compliance_package",
    description: "Generate a compliance document package (1-7) for a company. Outputs DOCX, PDF, and Markdown. Packages: 1=Internal Policy, 2=Security Handbook, 3=Data Privacy, 4=GovCon, 5=Google Partner, 6=Business Ops, 7=CMMC/FedRAMP",
    inputSchema: {
      type: "object",
      properties: {
        company_id: { type: "string", description: "Company ID" },
        package_number: { type: "number", minimum: 1, maximum: 7, description: "Package number (1-7)" },
        formats: { type: "array", items: { type: "string", enum: ["docx", "pdf", "markdown"] }, description: "Output formats (default: all three)" },
      },
      required: ["company_id", "package_number"],
    },
  },
  {
    name: "generate_all_compliance_packages",
    description: "Generate all 7 compliance packages for a company at once",
    inputSchema: {
      type: "object",
      properties: {
        company_id: { type: "string", description: "Company ID" },
        formats: { type: "array", items: { type: "string", enum: ["docx", "pdf", "markdown"] } },
      },
      required: ["company_id"],
    },
  },
  {
    name: "get_package_status",
    description: "Get generation status for all 7 compliance packages for a company",
    inputSchema: {
      type: "object",
      properties: { company_id: { type: "string", description: "Company ID" } },
      required: ["company_id"],
    },
  },

  // ============================================================
  // INTAKE & MATURITY TOOLS (15-17, from compliance-gov-module)
  // ============================================================
  {
    name: "run_intake_wizard",
    description: "Run the compliance intake wizard for a company. Analyzes business profile and recommends compliance skill domains based on industry, data types, federal contracts, and frameworks.",
    inputSchema: {
      type: "object",
      properties: { company_id: { type: "string", description: "Company ID (must have company info submitted first)" } },
      required: ["company_id"],
    },
  },
  {
    name: "get_maturity_score",
    description: "Get the compliance maturity score (0-10) for a company with breakdown by skill domain",
    inputSchema: {
      type: "object",
      properties: { company_id: { type: "string", description: "Company ID" } },
      required: ["company_id"],
    },
  },
  {
    name: "update_template_status",
    description: "Update implementation status of a compliance template in the maturity tracker",
    inputSchema: {
      type: "object",
      properties: {
        tracker_id: { type: "string", description: "Maturity tracker ID" },
        template_id: { type: "string", description: "Template ID to update" },
        status: { type: "string", enum: ["not_started", "in_progress", "implemented", "verified"], description: "New implementation status" },
        notes: { type: "string", description: "Optional implementation notes" },
      },
      required: ["tracker_id", "template_id", "status"],
    },
  },

  // ============================================================
  // BID DOCUMENT TOOLS (18-20, new for merged module)
  // ============================================================
  {
    name: "generate_bid_document",
    description: "Generate a specific bid document for an opportunity. Types: capability_statement, technical_approach, past_performance, price_proposal, management_approach, compliance_matrix, full_proposal",
    inputSchema: {
      type: "object",
      properties: {
        opportunity_id: { type: "string", description: "Opportunity ID" },
        document_type: { type: "string", enum: ["capability_statement", "technical_approach", "past_performance", "price_proposal", "management_approach", "compliance_matrix", "full_proposal"], description: "Type of bid document" },
        company_id: { type: "string", description: "Company ID (optional, uses TNDS defaults if not provided)" },
        formats: { type: "array", items: { type: "string", enum: ["docx", "pdf", "markdown"] } },
      },
      required: ["opportunity_id", "document_type"],
    },
  },
  {
    name: "generate_full_bid_package",
    description: "Generate a complete bid package (all 7 document types) for an opportunity in DOCX, PDF, and Markdown",
    inputSchema: {
      type: "object",
      properties: {
        opportunity_id: { type: "string", description: "Opportunity ID" },
        company_id: { type: "string", description: "Company ID (optional)" },
        formats: { type: "array", items: { type: "string", enum: ["docx", "pdf", "markdown"] } },
      },
      required: ["opportunity_id"],
    },
  },
  {
    name: "list_bid_documents",
    description: "List all bid documents generated for an opportunity",
    inputSchema: {
      type: "object",
      properties: { opportunity_id: { type: "string", description: "Opportunity ID" } },
      required: ["opportunity_id"],
    },
  },
];

export function createToolHandlers(
  repo: InMemoryRepository
): Record<string, ToolHandler> {
  const oppService = new OpportunityService(repo);
  const bidService = new BidDecisionService(repo);
  const outreachService = new OutreachService(repo);
  const complianceService = new ComplianceService(repo);
  const pipelineService = new PipelineService(repo);
  const packageService = new CompliancePackageService(repo);
  const intakeService = new IntakeService(repo);
  const maturityService = new MaturityService(repo);
  const bidDocService = new BidDocumentService(repo);
  const deadlineMonitor = new DeadlineMonitor(oppService);
  const complianceMonitor = new ComplianceMonitor(complianceService);
  const dashboard = new PipelineDashboard(oppService, pipelineService);
  const winLossReport = new WinLossReportGenerator(pipelineService);
  const outreachReport = new OutreachReport(outreachService);

  return {
    // Pipeline tools
    async search_opportunities(input) {
      return oppService.listOpportunities({ agency: input.agency, naics_code: input.naics_code, set_aside_type: input.set_aside_type, status: input.status });
    },
    async run_bid_decision(input) {
      const scores: BidScoreInput = {
        technicalFit: input.technical_fit, setAsideMatch: input.set_aside_match, competitionLevel: input.competition_level,
        contractValue: input.contract_value, timelineFeasibility: input.timeline_feasibility, relationship: input.relationship, strategicValue: input.strategic_value,
      };
      return bidService.runBidDecision(input.opportunity_id, scores);
    },
    async get_pipeline_status() { return dashboard.getDashboard(); },
    async log_outreach_activity(input) { return outreachService.logActivity(input.contact_id, input.activity_type, input.subject); },
    async check_compliance_status(input) {
      if (input.authority) return complianceService.checkAuthorityCompliance(input.authority);
      return complianceMonitor.checkCompliance();
    },
    async get_upcoming_deadlines(input) { return oppService.getUpcomingDeadlines(input.days_from_now || 7); },
    async create_opportunity(input) {
      return oppService.createOpportunity(input.title, input.solicitation_number, input.agency, new Date(input.response_deadline),
        input.set_aside_type, input.naics_code, input.naics_description, input.description, { estimated_value: input.estimated_value });
    },
    async get_win_loss_report(input) { return winLossReport.generateReport(input.days || 180); },
    async list_contacts(input) { return outreachService.listContacts({ agency: input.agency, status: input.status }); },
    async get_bid_recommendation(input) {
      const decision = await bidService.getBidDecision(input.opportunity_id);
      if (decision) return decision;
      const opp = await oppService.getOpportunity(input.opportunity_id);
      if (!opp) throw new Error(`Opportunity ${input.opportunity_id} not found`);
      return { message: "No bid decision yet. Use run_bid_decision to evaluate.", opportunity: opp };
    },

    // Compliance document tools
    async submit_company_info(input) {
      const existing = await repo.getCompanyByName(input.company_name);
      if (existing) {
        return repo.updateCompany(existing.id, { ...input, updated_at: new Date() });
      }
      return repo.createCompany(input);
    },
    async generate_compliance_package(input) {
      return packageService.generatePackage(input.company_id, input.package_number, input.formats);
    },
    async generate_all_compliance_packages(input) {
      return packageService.generateAll(input.company_id, input.formats);
    },
    async get_package_status(input) {
      return packageService.getPackageStatus(input.company_id);
    },

    // Intake & maturity tools
    async run_intake_wizard(input) {
      return intakeService.runIntake(input.company_id);
    },
    async get_maturity_score(input) {
      return maturityService.getScoreBreakdown(input.company_id);
    },
    async update_template_status(input) {
      return maturityService.updateTemplateStatus(input.tracker_id, input.template_id, input.status, input.notes);
    },

    // Bid document tools
    async generate_bid_document(input) {
      return bidDocService.generateBidDocument(input.opportunity_id, input.document_type, input.company_id, input.formats);
    },
    async generate_full_bid_package(input) {
      return bidDocService.generateFullBidPackage(input.opportunity_id, input.company_id, input.formats);
    },
    async list_bid_documents(input) {
      return bidDocService.listBidDocuments(input.opportunity_id);
    },
  };
}
