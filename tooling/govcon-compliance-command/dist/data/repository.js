/**
 * In-memory repository implementing repository pattern
 * Covers all govcon pipeline + compliance document + intake/maturity + bid document entities
 */
import { OpportunitySchema, BidDecisionSchema, ProposalSchema, OutreachContactSchema, OutreachActivitySchema, ComplianceItemSchema, PipelineMetricsSchema, CompanyRecordSchema, CompliancePackageSchema, IntakeResultSchema, MaturityTrackerSchema, BidDocumentSchema, } from "./schemas.js";
export class InMemoryRepository {
    constructor() {
        // Govcon pipeline
        this.opportunities = new Map();
        this.bidDecisions = new Map();
        this.proposals = new Map();
        this.outreachContacts = new Map();
        this.outreachActivities = new Map();
        this.complianceItems = new Map();
        this.pipelineMetrics = new Map();
        // Compliance document generation
        this.companies = new Map();
        this.compliancePackages = new Map();
        // Intake and maturity
        this.intakeResults = new Map();
        this.maturityTrackers = new Map();
        // Bid documents
        this.bidDocuments = new Map();
    }
    // ============================================================
    // OPPORTUNITIES
    // ============================================================
    async createOpportunity(data) {
        const opp = OpportunitySchema.parse(data);
        this.opportunities.set(opp.id, opp);
        return opp;
    }
    async getOpportunity(id) {
        return this.opportunities.get(id) || null;
    }
    async listOpportunities() {
        return Array.from(this.opportunities.values());
    }
    async updateOpportunity(id, data) {
        const existing = this.opportunities.get(id);
        if (!existing)
            throw new Error(`Opportunity ${id} not found`);
        const updated = OpportunitySchema.parse({
            ...existing,
            ...data,
            id,
            updated_at: new Date(),
        });
        this.opportunities.set(id, updated);
        return updated;
    }
    async deleteOpportunity(id) {
        this.opportunities.delete(id);
    }
    // ============================================================
    // BID DECISIONS
    // ============================================================
    async createBidDecision(data) {
        const decision = BidDecisionSchema.parse(data);
        this.bidDecisions.set(decision.id, decision);
        return decision;
    }
    async getBidDecision(id) {
        return this.bidDecisions.get(id) || null;
    }
    async getBidDecisionByOpportunity(opportunityId) {
        for (const decision of this.bidDecisions.values()) {
            if (decision.opportunity_id === opportunityId)
                return decision;
        }
        return null;
    }
    async listBidDecisions() {
        return Array.from(this.bidDecisions.values());
    }
    // ============================================================
    // PROPOSALS
    // ============================================================
    async createProposal(data) {
        const proposal = ProposalSchema.parse(data);
        this.proposals.set(proposal.id, proposal);
        return proposal;
    }
    async getProposal(id) {
        return this.proposals.get(id) || null;
    }
    async listProposals() {
        return Array.from(this.proposals.values());
    }
    async updateProposal(id, data) {
        const existing = this.proposals.get(id);
        if (!existing)
            throw new Error(`Proposal ${id} not found`);
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
    async createOutreachContact(data) {
        const contact = OutreachContactSchema.parse(data);
        this.outreachContacts.set(contact.id, contact);
        return contact;
    }
    async getOutreachContact(id) {
        return this.outreachContacts.get(id) || null;
    }
    async listOutreachContacts() {
        return Array.from(this.outreachContacts.values());
    }
    async updateOutreachContact(id, data) {
        const existing = this.outreachContacts.get(id);
        if (!existing)
            throw new Error(`Contact ${id} not found`);
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
    async createOutreachActivity(data) {
        const activity = OutreachActivitySchema.parse(data);
        this.outreachActivities.set(activity.id, activity);
        return activity;
    }
    async getOutreachActivity(id) {
        return this.outreachActivities.get(id) || null;
    }
    async listOutreachActivitiesByContact(contactId) {
        return Array.from(this.outreachActivities.values()).filter((a) => a.contact_id === contactId);
    }
    async listOutreachActivities() {
        return Array.from(this.outreachActivities.values());
    }
    // ============================================================
    // COMPLIANCE ITEMS
    // ============================================================
    async createComplianceItem(data) {
        const item = ComplianceItemSchema.parse(data);
        this.complianceItems.set(item.id, item);
        return item;
    }
    async getComplianceItem(id) {
        return this.complianceItems.get(id) || null;
    }
    async listComplianceItems() {
        return Array.from(this.complianceItems.values());
    }
    async updateComplianceItem(id, data) {
        const existing = this.complianceItems.get(id);
        if (!existing)
            throw new Error(`Compliance item ${id} not found`);
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
    async createPipelineMetrics(data) {
        const metrics = PipelineMetricsSchema.parse(data);
        this.pipelineMetrics.set(metrics.id, metrics);
        return metrics;
    }
    async listPipelineMetrics() {
        return Array.from(this.pipelineMetrics.values());
    }
    async getPipelineMetricsByPeriod(period) {
        return Array.from(this.pipelineMetrics.values()).filter((m) => m.period === period);
    }
    // ============================================================
    // COMPANY RECORDS (compliance document generation)
    // ============================================================
    async createCompany(data) {
        const company = CompanyRecordSchema.parse(data);
        this.companies.set(company.id, company);
        return company;
    }
    async getCompany(id) {
        return this.companies.get(id) || null;
    }
    async getCompanyByName(name) {
        for (const company of this.companies.values()) {
            if (company.company_name.toLowerCase() === name.toLowerCase()) {
                return company;
            }
        }
        return null;
    }
    async listCompanies() {
        return Array.from(this.companies.values());
    }
    async updateCompany(id, data) {
        const existing = this.companies.get(id);
        if (!existing)
            throw new Error(`Company ${id} not found`);
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
    async createCompliancePackage(data) {
        const pkg = CompliancePackageSchema.parse(data);
        this.compliancePackages.set(pkg.id, pkg);
        return pkg;
    }
    async getCompliancePackage(id) {
        return this.compliancePackages.get(id) || null;
    }
    async listCompliancePackagesByCompany(companyId) {
        return Array.from(this.compliancePackages.values()).filter((p) => p.company_id === companyId);
    }
    async updateCompliancePackage(id, data) {
        const existing = this.compliancePackages.get(id);
        if (!existing)
            throw new Error(`Compliance package ${id} not found`);
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
    async createIntakeResult(data) {
        const result = IntakeResultSchema.parse(data);
        this.intakeResults.set(result.id, result);
        return result;
    }
    async getIntakeResult(id) {
        return this.intakeResults.get(id) || null;
    }
    async getIntakeResultByCompany(companyId) {
        for (const result of this.intakeResults.values()) {
            if (result.company_id === companyId)
                return result;
        }
        return null;
    }
    // ============================================================
    // MATURITY TRACKERS
    // ============================================================
    async createMaturityTracker(data) {
        const tracker = MaturityTrackerSchema.parse(data);
        this.maturityTrackers.set(tracker.id, tracker);
        return tracker;
    }
    async getMaturityTracker(id) {
        return this.maturityTrackers.get(id) || null;
    }
    async getMaturityTrackerByCompany(companyId) {
        for (const tracker of this.maturityTrackers.values()) {
            if (tracker.company_id === companyId)
                return tracker;
        }
        return null;
    }
    async updateMaturityTracker(id, data) {
        const existing = this.maturityTrackers.get(id);
        if (!existing)
            throw new Error(`Maturity tracker ${id} not found`);
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
    async createBidDocument(data) {
        const doc = BidDocumentSchema.parse(data);
        this.bidDocuments.set(doc.id, doc);
        return doc;
    }
    async getBidDocument(id) {
        return this.bidDocuments.get(id) || null;
    }
    async listBidDocumentsByOpportunity(opportunityId) {
        return Array.from(this.bidDocuments.values()).filter((d) => d.opportunity_id === opportunityId);
    }
    async updateBidDocument(id, data) {
        const existing = this.bidDocuments.get(id);
        if (!existing)
            throw new Error(`Bid document ${id} not found`);
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
    async clear() {
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
//# sourceMappingURL=repository.js.map