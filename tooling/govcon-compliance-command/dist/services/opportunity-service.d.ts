/**
 * Opportunity Service - CRUD and search/filter operations
 * Handles deadline tracking and automatic status updates
 */
import { Opportunity } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export declare class OpportunityService {
    private repo;
    constructor(repo: InMemoryRepository);
    createOpportunity(title: string, solicitation_number: string, agency: string, response_deadline: Date, set_aside_type: Opportunity["set_aside_type"], naics_code: string, naics_description: string, description: string, options?: Partial<Opportunity>): Promise<Opportunity>;
    getOpportunity(id: string): Promise<Opportunity | null>;
    listOpportunities(filters?: {
        agency?: string;
        naics_code?: string;
        set_aside_type?: Opportunity["set_aside_type"];
        status?: Opportunity["status"];
    }): Promise<Opportunity[]>;
    updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity>;
    markBidDecision(id: string, decision: "bid" | "no_bid"): Promise<Opportunity>;
    markSubmitted(id: string): Promise<Opportunity>;
    getUpcomingDeadlines(daysFromNow?: number): Promise<Opportunity[]>;
    getExpiredOpportunities(): Promise<Opportunity[]>;
    getActiveOpportunities(): Promise<Opportunity[]>;
    getPipelineValue(): Promise<number>;
    countByStatus(): Promise<Record<Opportunity["status"], number>>;
}
//# sourceMappingURL=opportunity-service.d.ts.map