/**
 * Pipeline Dashboard - Real-time view of opportunity pipeline
 */
import { OpportunityService } from "../services/opportunity-service.js";
import { PipelineService } from "../services/pipeline-service.js";
import { Opportunity } from "../data/schemas.js";
export interface DashboardMetrics {
    activeOpportunities: number;
    pipelineValue: number;
    upcomingDeadlines: Opportunity[];
    statusDistribution: Record<Opportunity["status"], number>;
    setAsideDistribution: Record<string, number>;
    estimatedWinRate: number;
    averageBidValue: number;
}
export declare class PipelineDashboard {
    private opportunityService;
    private pipelineService;
    constructor(opportunityService: OpportunityService, pipelineService: PipelineService);
    getDashboard(): Promise<DashboardMetrics>;
    getActionItems(): Promise<{
        readyForBidDecision: Opportunity[];
        pastDeadline: Opportunity[];
        upcomingDeadlines: Opportunity[];
    }>;
    getHighValueOpportunities(threshold?: number): Promise<Opportunity[]>;
}
//# sourceMappingURL=pipeline-dashboard.d.ts.map