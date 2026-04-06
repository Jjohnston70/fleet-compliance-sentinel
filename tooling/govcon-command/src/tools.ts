/**
 * LLM Tool Definitions for govcon-command
 * Exported for use with Claude and other LLMs
 */

import { InMemoryRepository } from "./data/repository.js";
import { OpportunityService } from "./services/opportunity-service.js";
import { BidDecisionService, BidScoreInput } from "./services/bid-decision-service.js";
import { OutreachService } from "./services/outreach-service.js";
import { ComplianceService } from "./services/compliance-service.js";
import { PipelineService } from "./services/pipeline-service.js";
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

export const GOVCON_COMMAND_TOOLS: ToolDefinition[] = [
  {
    name: "search_opportunities",
    description: "Search and filter federal contracting opportunities",
    inputSchema: {
      type: "object",
      properties: {
        agency: { type: "string", description: "Filter by agency name" },
        naics_code: { type: "string", description: "Filter by NAICS code" },
        set_aside_type: {
          type: "string",
          enum: ["SDVOSB", "VOSB", "8a", "HUBZone", "WOSB", "small_business", "full_open"],
          description: "Filter by set-aside type",
        },
        status: {
          type: "string",
          enum: [
            "identified",
            "evaluating",
            "bid",
            "no_bid",
            "submitted",
            "awarded",
            "lost",
          ],
          description: "Filter by status",
        },
      },
      required: [],
    },
  },
  {
    name: "run_bid_decision",
    description:
      "Run weighted bid/no-bid decision for an opportunity with detailed scoring",
    inputSchema: {
      type: "object",
      properties: {
        opportunity_id: {
          type: "string",
          description: "ID of the opportunity",
        },
        technical_fit: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Technical capability match (0-100)",
        },
        set_aside_match: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Set-aside eligibility (0-100)",
        },
        competition_level: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Expected competition (0=high, 100=low)",
        },
        contract_value: {
          type: "number",
          description: "Estimated contract value in dollars",
        },
        timeline_feasibility: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Can we meet delivery timeline (0-100)",
        },
        relationship: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Existing relationship with agency (0-100)",
        },
        strategic_value: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Strategic importance (0-100)",
        },
      },
      required: [
        "opportunity_id",
        "technical_fit",
        "set_aside_match",
        "competition_level",
        "contract_value",
        "timeline_feasibility",
        "relationship",
        "strategic_value",
      ],
    },
  },
  {
    name: "get_pipeline_status",
    description:
      "Get comprehensive view of federal contracting pipeline and metrics",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "log_outreach_activity",
    description: "Log outreach activity (email, call, meeting, etc.) with a contact",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: { type: "string", description: "ID of the contact" },
        activity_type: {
          type: "string",
          enum: ["email", "phone", "meeting", "event", "linkedin"],
          description: "Type of outreach",
        },
        subject: {
          type: "string",
          description: "Activity subject or description",
        },
      },
      required: ["contact_id", "activity_type", "subject"],
    },
  },
  {
    name: "check_compliance_status",
    description: "Check compliance and certification status with expiration alerts",
    inputSchema: {
      type: "object",
      properties: {
        authority: {
          type: "string",
          enum: ["SBA", "SAM", "IRS", "state", "VA"],
          description: "Filter by authority",
        },
      },
      required: [],
    },
  },
  {
    name: "get_upcoming_deadlines",
    description: "Get opportunities with upcoming response deadlines",
    inputSchema: {
      type: "object",
      properties: {
        days_from_now: {
          type: "number",
          description: "Number of days to look ahead (default 7)",
        },
      },
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
        set_aside_type: {
          type: "string",
          enum: ["SDVOSB", "VOSB", "8a", "HUBZone", "WOSB", "small_business", "full_open"],
        },
        naics_code: { type: "string" },
        naics_description: { type: "string" },
        description: { type: "string" },
        estimated_value: { type: "number", description: "Optional contract value" },
      },
      required: [
        "title",
        "solicitation_number",
        "agency",
        "response_deadline",
        "set_aside_type",
        "naics_code",
        "naics_description",
        "description",
      ],
    },
  },
  {
    name: "get_win_loss_report",
    description: "Generate win-loss analysis and performance metrics",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to analyze (default 180)",
        },
      },
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
        status: {
          type: "string",
          enum: ["prospect", "warm", "active", "cold"],
          description: "Filter by contact status",
        },
      },
      required: [],
    },
  },
  {
    name: "get_bid_recommendation",
    description:
      "Get bid recommendation for an opportunity based on all available criteria",
    inputSchema: {
      type: "object",
      properties: {
        opportunity_id: { type: "string", description: "ID of the opportunity" },
      },
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
  const deadlineMonitor = new DeadlineMonitor(oppService);
  const complianceMonitor = new ComplianceMonitor(complianceService);
  const dashboard = new PipelineDashboard(oppService, pipelineService);
  const winLossReport = new WinLossReportGenerator(pipelineService);
  const outreachReport = new OutreachReport(outreachService);

  return {
    async search_opportunities(input) {
      return oppService.listOpportunities({
        agency: input.agency,
        naics_code: input.naics_code,
        set_aside_type: input.set_aside_type,
        status: input.status,
      });
    },

    async run_bid_decision(input) {
      const scores: BidScoreInput = {
        technicalFit: input.technical_fit,
        setAsideMatch: input.set_aside_match,
        competitionLevel: input.competition_level,
        contractValue: input.contract_value,
        timelineFeasibility: input.timeline_feasibility,
        relationship: input.relationship,
        strategicValue: input.strategic_value,
      };
      return bidService.runBidDecision(input.opportunity_id, scores);
    },

    async get_pipeline_status() {
      return dashboard.getDashboard();
    },

    async log_outreach_activity(input) {
      return outreachService.logActivity(
        input.contact_id,
        input.activity_type,
        input.subject
      );
    },

    async check_compliance_status(input) {
      if (input.authority) {
        return complianceService.checkAuthorityCompliance(input.authority);
      }
      const alerts = await complianceMonitor.checkCompliance();
      return alerts;
    },

    async get_upcoming_deadlines(input) {
      const days = input.days_from_now || 7;
      return oppService.getUpcomingDeadlines(days);
    },

    async create_opportunity(input) {
      return oppService.createOpportunity(
        input.title,
        input.solicitation_number,
        input.agency,
        new Date(input.response_deadline),
        input.set_aside_type,
        input.naics_code,
        input.naics_description,
        input.description,
        { estimated_value: input.estimated_value }
      );
    },

    async get_win_loss_report(input) {
      const days = input.days || 180;
      return winLossReport.generateReport(days);
    },

    async list_contacts(input) {
      return outreachService.listContacts({
        agency: input.agency,
        status: input.status,
      });
    },

    async get_bid_recommendation(input) {
      const decision = await bidService.getBidDecision(
        input.opportunity_id
      );
      if (decision) {
        return decision;
      }
      const opp = await oppService.getOpportunity(input.opportunity_id);
      if (!opp) {
        throw new Error(`Opportunity ${input.opportunity_id} not found`);
      }
      return {
        message: "No bid decision yet. Use run_bid_decision to evaluate.",
        opportunity: opp,
      };
    },
  };
}
