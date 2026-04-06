/**
 * In-memory repository implementing repository pattern for testing and demo
 */

import {
  Opportunity,
  BidDecision,
  Proposal,
  OutreachContact,
  OutreachActivity,
  ComplianceItem,
  PipelineMetrics,
  OpportunitySchema,
  BidDecisionSchema,
  ProposalSchema,
  OutreachContactSchema,
  OutreachActivitySchema,
  ComplianceItemSchema,
  PipelineMetricsSchema,
} from "./schemas.js";

export class InMemoryRepository {
  private opportunities: Map<string, Opportunity> = new Map();
  private bidDecisions: Map<string, BidDecision> = new Map();
  private proposals: Map<string, Proposal> = new Map();
  private outreachContacts: Map<string, OutreachContact> = new Map();
  private outreachActivities: Map<string, OutreachActivity> = new Map();
  private complianceItems: Map<string, ComplianceItem> = new Map();
  private pipelineMetrics: Map<string, PipelineMetrics> = new Map();

  // Opportunities
  async createOpportunity(data: unknown): Promise<Opportunity> {
    const opp = OpportunitySchema.parse(data);
    this.opportunities.set(opp.id, opp);
    return opp;
  }

  async getOpportunity(id: string): Promise<Opportunity | null> {
    return this.opportunities.get(id) || null;
  }

  async listOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values());
  }

  async updateOpportunity(
    id: string,
    data: Partial<Opportunity>
  ): Promise<Opportunity> {
    const existing = this.opportunities.get(id);
    if (!existing) throw new Error(`Opportunity ${id} not found`);
    const updated = OpportunitySchema.parse({
      ...existing,
      ...data,
      id,
      updated_at: new Date(),
    });
    this.opportunities.set(id, updated);
    return updated;
  }

  async deleteOpportunity(id: string): Promise<void> {
    this.opportunities.delete(id);
  }

  // Bid Decisions
  async createBidDecision(data: unknown): Promise<BidDecision> {
    const decision = BidDecisionSchema.parse(data);
    this.bidDecisions.set(decision.id, decision);
    return decision;
  }

  async getBidDecision(id: string): Promise<BidDecision | null> {
    return this.bidDecisions.get(id) || null;
  }

  async getBidDecisionByOpportunity(
    opportunityId: string
  ): Promise<BidDecision | null> {
    for (const decision of this.bidDecisions.values()) {
      if (decision.opportunity_id === opportunityId) return decision;
    }
    return null;
  }

  async listBidDecisions(): Promise<BidDecision[]> {
    return Array.from(this.bidDecisions.values());
  }

  // Proposals
  async createProposal(data: unknown): Promise<Proposal> {
    const proposal = ProposalSchema.parse(data);
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  async getProposal(id: string): Promise<Proposal | null> {
    return this.proposals.get(id) || null;
  }

  async listProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal> {
    const existing = this.proposals.get(id);
    if (!existing) throw new Error(`Proposal ${id} not found`);
    const updated = ProposalSchema.parse({
      ...existing,
      ...data,
      id,
      updated_at: new Date(),
    });
    this.proposals.set(id, updated);
    return updated;
  }

  // Outreach Contacts
  async createOutreachContact(data: unknown): Promise<OutreachContact> {
    const contact = OutreachContactSchema.parse(data);
    this.outreachContacts.set(contact.id, contact);
    return contact;
  }

  async getOutreachContact(id: string): Promise<OutreachContact | null> {
    return this.outreachContacts.get(id) || null;
  }

  async listOutreachContacts(): Promise<OutreachContact[]> {
    return Array.from(this.outreachContacts.values());
  }

  async updateOutreachContact(
    id: string,
    data: Partial<OutreachContact>
  ): Promise<OutreachContact> {
    const existing = this.outreachContacts.get(id);
    if (!existing) throw new Error(`Contact ${id} not found`);
    const updated = OutreachContactSchema.parse({
      ...existing,
      ...data,
      id,
    });
    this.outreachContacts.set(id, updated);
    return updated;
  }

  // Outreach Activities
  async createOutreachActivity(data: unknown): Promise<OutreachActivity> {
    const activity = OutreachActivitySchema.parse(data);
    this.outreachActivities.set(activity.id, activity);
    return activity;
  }

  async getOutreachActivity(id: string): Promise<OutreachActivity | null> {
    return this.outreachActivities.get(id) || null;
  }

  async listOutreachActivitiesByContact(
    contactId: string
  ): Promise<OutreachActivity[]> {
    return Array.from(this.outreachActivities.values()).filter(
      (a) => a.contact_id === contactId
    );
  }

  async listOutreachActivities(): Promise<OutreachActivity[]> {
    return Array.from(this.outreachActivities.values());
  }

  // Compliance Items
  async createComplianceItem(data: unknown): Promise<ComplianceItem> {
    const item = ComplianceItemSchema.parse(data);
    this.complianceItems.set(item.id, item);
    return item;
  }

  async getComplianceItem(id: string): Promise<ComplianceItem | null> {
    return this.complianceItems.get(id) || null;
  }

  async listComplianceItems(): Promise<ComplianceItem[]> {
    return Array.from(this.complianceItems.values());
  }

  async updateComplianceItem(
    id: string,
    data: Partial<ComplianceItem>
  ): Promise<ComplianceItem> {
    const existing = this.complianceItems.get(id);
    if (!existing) throw new Error(`Compliance item ${id} not found`);
    const updated = ComplianceItemSchema.parse({
      ...existing,
      ...data,
      id,
    });
    this.complianceItems.set(id, updated);
    return updated;
  }

  // Pipeline Metrics
  async createPipelineMetrics(data: unknown): Promise<PipelineMetrics> {
    const metrics = PipelineMetricsSchema.parse(data);
    this.pipelineMetrics.set(metrics.id, metrics);
    return metrics;
  }

  async listPipelineMetrics(): Promise<PipelineMetrics[]> {
    return Array.from(this.pipelineMetrics.values());
  }

  async getPipelineMetricsByPeriod(
    period: "monthly" | "quarterly" | "annual"
  ): Promise<PipelineMetrics[]> {
    return Array.from(this.pipelineMetrics.values()).filter(
      (m) => m.period === period
    );
  }

  // Clear all data (for testing)
  async clear(): Promise<void> {
    this.opportunities.clear();
    this.bidDecisions.clear();
    this.proposals.clear();
    this.outreachContacts.clear();
    this.outreachActivities.clear();
    this.complianceItems.clear();
    this.pipelineMetrics.clear();
  }
}
