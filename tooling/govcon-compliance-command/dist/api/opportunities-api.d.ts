/**
 * Opportunity API handlers
 */
import { OpportunityService } from "../services/opportunity-service.js";
import { Opportunity } from "../data/schemas.js";
export interface OpportunitiesAPI {
    createOpportunity(params: {
        title: string;
        solicitation_number: string;
        agency: string;
        response_deadline: Date;
        set_aside_type: Opportunity["set_aside_type"];
        naics_code: string;
        naics_description: string;
        description: string;
    }): Promise<Opportunity>;
    listOpportunities(filters?: {
        agency?: string;
        naics_code?: string;
        set_aside_type?: Opportunity["set_aside_type"];
        status?: Opportunity["status"];
    }): Promise<Opportunity[]>;
    getOpportunity(id: string): Promise<Opportunity | null>;
    updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity>;
    getUpcomingDeadlines(daysFromNow?: number): Promise<Opportunity[]>;
    getActiveOpportunities(): Promise<Opportunity[]>;
    getPipelineValue(): Promise<number>;
    countByStatus(): Promise<Record<Opportunity["status"], number>>;
}
export declare function createOpportunitiesAPI(service: OpportunityService): OpportunitiesAPI;
//# sourceMappingURL=opportunities-api.d.ts.map