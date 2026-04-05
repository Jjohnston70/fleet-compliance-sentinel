/**
 * Outreach Report - Contact activity and engagement summary
 */
import { OutreachService } from "../services/outreach-service.js";
import { OutreachContact } from "../data/schemas.js";
export interface OutreachMetrics {
    totalContacts: number;
    byStatus: Record<OutreachContact["status"], number>;
    totalActivities: number;
    activitiesByType: Record<string, number>;
    averageContactsPerContact: number;
    pendingFollowUps: number;
    osdbuContacts: number;
    lastContactDate: Date | null;
}
export declare class OutreachReport {
    private outreachService;
    constructor(outreachService: OutreachService);
    generateMetrics(): Promise<OutreachMetrics>;
    getHighEngagementContacts(minContactCount?: number): Promise<OutreachContact[]>;
    getColdContacts(daysSinceContact?: number): Promise<OutreachContact[]>;
    getOSDBUSummary(): Promise<{
        totalOSDBU: number;
        byStatus: Record<OutreachContact["status"], number>;
        recentContacts: OutreachContact[];
    }>;
}
//# sourceMappingURL=outreach-report.d.ts.map