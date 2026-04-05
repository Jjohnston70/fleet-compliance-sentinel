/**
 * In-memory repository implementing repository pattern
 * Covers all govcon pipeline + compliance document + intake/maturity + bid document entities
 */
import { Opportunity, BidDecision, Proposal, OutreachContact, OutreachActivity, ComplianceItem, PipelineMetrics, CompanyRecord, CompliancePackage, IntakeResult, MaturityTracker, BidDocument } from "./schemas.js";
export declare class InMemoryRepository {
    private opportunities;
    private bidDecisions;
    private proposals;
    private outreachContacts;
    private outreachActivities;
    private complianceItems;
    private pipelineMetrics;
    private companies;
    private compliancePackages;
    private intakeResults;
    private maturityTrackers;
    private bidDocuments;
    createOpportunity(data: unknown): Promise<Opportunity>;
    getOpportunity(id: string): Promise<Opportunity | null>;
    listOpportunities(): Promise<Opportunity[]>;
    updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity>;
    deleteOpportunity(id: string): Promise<void>;
    createBidDecision(data: unknown): Promise<BidDecision>;
    getBidDecision(id: string): Promise<BidDecision | null>;
    getBidDecisionByOpportunity(opportunityId: string): Promise<BidDecision | null>;
    listBidDecisions(): Promise<BidDecision[]>;
    createProposal(data: unknown): Promise<Proposal>;
    getProposal(id: string): Promise<Proposal | null>;
    listProposals(): Promise<Proposal[]>;
    updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal>;
    createOutreachContact(data: unknown): Promise<OutreachContact>;
    getOutreachContact(id: string): Promise<OutreachContact | null>;
    listOutreachContacts(): Promise<OutreachContact[]>;
    updateOutreachContact(id: string, data: Partial<OutreachContact>): Promise<OutreachContact>;
    createOutreachActivity(data: unknown): Promise<OutreachActivity>;
    getOutreachActivity(id: string): Promise<OutreachActivity | null>;
    listOutreachActivitiesByContact(contactId: string): Promise<OutreachActivity[]>;
    listOutreachActivities(): Promise<OutreachActivity[]>;
    createComplianceItem(data: unknown): Promise<ComplianceItem>;
    getComplianceItem(id: string): Promise<ComplianceItem | null>;
    listComplianceItems(): Promise<ComplianceItem[]>;
    updateComplianceItem(id: string, data: Partial<ComplianceItem>): Promise<ComplianceItem>;
    createPipelineMetrics(data: unknown): Promise<PipelineMetrics>;
    listPipelineMetrics(): Promise<PipelineMetrics[]>;
    getPipelineMetricsByPeriod(period: "monthly" | "quarterly" | "annual"): Promise<PipelineMetrics[]>;
    createCompany(data: unknown): Promise<CompanyRecord>;
    getCompany(id: string): Promise<CompanyRecord | null>;
    getCompanyByName(name: string): Promise<CompanyRecord | null>;
    listCompanies(): Promise<CompanyRecord[]>;
    updateCompany(id: string, data: Partial<CompanyRecord>): Promise<CompanyRecord>;
    createCompliancePackage(data: unknown): Promise<CompliancePackage>;
    getCompliancePackage(id: string): Promise<CompliancePackage | null>;
    listCompliancePackagesByCompany(companyId: string): Promise<CompliancePackage[]>;
    updateCompliancePackage(id: string, data: Partial<CompliancePackage>): Promise<CompliancePackage>;
    createIntakeResult(data: unknown): Promise<IntakeResult>;
    getIntakeResult(id: string): Promise<IntakeResult | null>;
    getIntakeResultByCompany(companyId: string): Promise<IntakeResult | null>;
    createMaturityTracker(data: unknown): Promise<MaturityTracker>;
    getMaturityTracker(id: string): Promise<MaturityTracker | null>;
    getMaturityTrackerByCompany(companyId: string): Promise<MaturityTracker | null>;
    updateMaturityTracker(id: string, data: Partial<MaturityTracker>): Promise<MaturityTracker>;
    createBidDocument(data: unknown): Promise<BidDocument>;
    getBidDocument(id: string): Promise<BidDocument | null>;
    listBidDocumentsByOpportunity(opportunityId: string): Promise<BidDocument[]>;
    updateBidDocument(id: string, data: Partial<BidDocument>): Promise<BidDocument>;
    clear(): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map