/**
 * In-memory repository implementing repository pattern
 * Covers all govcon pipeline + compliance document + intake/maturity + bid document entities
 */

import {
  Opportunity,
  BidDecision,
  Proposal,
  OutreachContact,
  OutreachActivity,
  ComplianceItem,
  PipelineMetrics,
  CompanyRecord,
  CompliancePackage,
  IntakeResult,
  MaturityTracker,
  BidDocument,
  OpportunitySchema,
  BidDecisionSchema,
  ProposalSchema,
  OutreachContactSchema,
  OutreachActivitySchema,
  ComplianceItemSchema,
  PipelineMetricsSchema,
  CompanyRecordSchema,
  CompliancePackageSchema,
  IntakeResultSchema,
  MaturityTrackerSchema,
  BidDocumentSchema,
} from "./schemas.js";

export class InMemoryRepository {
  // Govcon pipeline
  private opportunities: Map<string, Opportunity> = new Map();
  private bidDecisions: Map<string, BidDecision> = new Map();
  private proposals: Map<string, Proposal> = new Map();
  private outreachContacts: Map<string, OutreachContact> = new Map();
  private outreachActivities: Map<string, OutreachActivity> = new Map();
  private complianceItems: Map<string, ComplianceItem> = new Map();
  private pipelineMetrics: Map<string, PipelineMetrics> = new Map();

  // Compliance document generation
  private companies: Map<string, CompanyRecord> = new Map();
  private compliancePackages: Map<string, CompliancePackage> = new Map();

  // Intake and maturity
  private intakeResults: Map<string, IntakeResult> = new Map();
  private maturityTrackers: Map<string, MaturityTracker> = new Map();

  // Bid documents
  private bidDocuments: Map<string, BidDocument> = new Map();

  // ============================================================
  // OPPORTUNITIES
  // ============================================================

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

  // ============================================================
  // BID DECISIONS
  // ============================================================

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

  // ============================================================
  // PROPOSALS
  // ============================================================

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

  // ============================================================
  // OUTREACH CONTACTS
  // ============================================================

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

  // ============================================================
  // OUTREACH ACTIVITIES
  // ============================================================

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

  // ============================================================
  // COMPLIANCE ITEMS
  // ============================================================

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

  // ============================================================
  // PIPELINE METRICS
  // ============================================================

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

  // ============================================================
  // COMPANY RECORDS (compliance document generation)
  // ============================================================

  async createCompany(data: unknown): Promise<CompanyRecord> {
    const company = CompanyRecordSchema.parse(data);
    this.companies.set(company.id, company);
    return company;
  }

  async getCompany(id: string): Promise<CompanyRecord | null> {
    return this.companies.get(id) || null;
  }

  async getCompanyByName(name: string): Promise<CompanyRecord | null> {
    for (const company of this.companies.values()) {
      if (company.company_name.toLowerCase() === name.toLowerCase()) {
        return company;
      }
    }
    return null;
  }

  async listCompanies(): Promise<CompanyRecord[]> {
    return Array.from(this.companies.values());
  }

  async updateCompany(
    id: string,
    data: Partial<CompanyRecord>
  ): Promise<CompanyRecord> {
    const existing = this.companies.get(id);
    if (!existing) throw new Error(`Company ${id} not found`);
    const updated = CompanyRecordSchema.parse({
      ...existing,
      ...data,
      id,
      updated_at: new Date(),
    });
    this.companies.set(id, updated);
    return updated;
  }

  // ============================================================
  // COMPLIANCE PACKAGES
  // ============================================================

  async createCompliancePackage(data: unknown): Promise<CompliancePackage> {
    const pkg = CompliancePackageSchema.parse(data);
    this.compliancePackages.set(pkg.id, pkg);
    return pkg;
  }

  async getCompliancePackage(id: string): Promise<CompliancePackage | null> {
    return this.compliancePackages.get(id) || null;
  }

  async listCompliancePackagesByCompany(
    companyId: string
  ): Promise<CompliancePackage[]> {
    return Array.from(this.compliancePackages.values()).filter(
      (p) => p.company_id === companyId
    );
  }

  async updateCompliancePackage(
    id: string,
    data: Partial<CompliancePackage>
  ): Promise<CompliancePackage> {
    const existing = this.compliancePackages.get(id);
    if (!existing) throw new Error(`Compliance package ${id} not found`);
    const updated = CompliancePackageSchema.parse({
      ...existing,
      ...data,
      id,
    });
    this.compliancePackages.set(id, updated);
    return updated;
  }

  // ============================================================
  // INTAKE RESULTS
  // ============================================================

  async createIntakeResult(data: unknown): Promise<IntakeResult> {
    const result = IntakeResultSchema.parse(data);
    this.intakeResults.set(result.id, result);
    return result;
  }

  async getIntakeResult(id: string): Promise<IntakeResult | null> {
    return this.intakeResults.get(id) || null;
  }

  async getIntakeResultByCompany(companyId: string): Promise<IntakeResult | null> {
    for (const result of this.intakeResults.values()) {
      if (result.company_id === companyId) return result;
    }
    return null;
  }

  // ============================================================
  // MATURITY TRACKERS
  // ============================================================

  async createMaturityTracker(data: unknown): Promise<MaturityTracker> {
    const tracker = MaturityTrackerSchema.parse(data);
    this.maturityTrackers.set(tracker.id, tracker);
    return tracker;
  }

  async getMaturityTracker(id: string): Promise<MaturityTracker | null> {
    return this.maturityTrackers.get(id) || null;
  }

  async getMaturityTrackerByCompany(
    companyId: string
  ): Promise<MaturityTracker | null> {
    for (const tracker of this.maturityTrackers.values()) {
      if (tracker.company_id === companyId) return tracker;
    }
    return null;
  }

  async updateMaturityTracker(
    id: string,
    data: Partial<MaturityTracker>
  ): Promise<MaturityTracker> {
    const existing = this.maturityTrackers.get(id);
    if (!existing) throw new Error(`Maturity tracker ${id} not found`);
    const updated = MaturityTrackerSchema.parse({
      ...existing,
      ...data,
      id,
    });
    this.maturityTrackers.set(id, updated);
    return updated;
  }

  // ============================================================
  // BID DOCUMENTS
  // ============================================================

  async createBidDocument(data: unknown): Promise<BidDocument> {
    const doc = BidDocumentSchema.parse(data);
    this.bidDocuments.set(doc.id, doc);
    return doc;
  }

  async getBidDocument(id: string): Promise<BidDocument | null> {
    return this.bidDocuments.get(id) || null;
  }

  async listBidDocumentsByOpportunity(
    opportunityId: string
  ): Promise<BidDocument[]> {
    return Array.from(this.bidDocuments.values()).filter(
      (d) => d.opportunity_id === opportunityId
    );
  }

  async updateBidDocument(
    id: string,
    data: Partial<BidDocument>
  ): Promise<BidDocument> {
    const existing = this.bidDocuments.get(id);
    if (!existing) throw new Error(`Bid document ${id} not found`);
    const updated = BidDocumentSchema.parse({
      ...existing,
      ...data,
      id,
      updated_at: new Date(),
    });
    this.bidDocuments.set(id, updated);
    return updated;
  }

  // ============================================================
  // CLEAR ALL (for testing)
  // ============================================================

  async clear(): Promise<void> {
    this.opportunities.clear();
    this.bidDecisions.clear();
    this.proposals.clear();
    this.outreachContacts.clear();
    this.outreachActivities.clear();
    this.complianceItems.clear();
    this.pipelineMetrics.clear();
    this.companies.clear();
    this.compliancePackages.clear();
    this.intakeResults.clear();
    this.maturityTrackers.clear();
    this.bidDocuments.clear();
  }
}
