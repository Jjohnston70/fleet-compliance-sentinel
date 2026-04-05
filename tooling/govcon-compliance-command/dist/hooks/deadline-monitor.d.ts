/**
 * Deadline Monitor Hook - Check for approaching response deadlines
 */
import { OpportunityService } from "../services/opportunity-service.js";
export interface DeadlineAlert {
    opportunityId: string;
    title: string;
    deadline: Date;
    daysRemaining: number;
    severity: "week" | "threeDay" | "oneDay";
}
export declare class DeadlineMonitor {
    private opportunityService;
    constructor(opportunityService: OpportunityService);
    checkDeadlines(): Promise<DeadlineAlert[]>;
}
//# sourceMappingURL=deadline-monitor.d.ts.map