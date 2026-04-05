/**
 * Compliance Monitor Hook - Check for approaching expirations
 */
import { ComplianceService } from "../services/compliance-service.js";
import { ComplianceItem } from "../data/schemas.js";
export interface ComplianceAlert {
    itemId: string;
    name: string;
    expirationDate: Date;
    daysRemaining: number;
    severity: "critical" | "warning" | "upcoming";
}
export declare class ComplianceMonitor {
    private complianceService;
    constructor(complianceService: ComplianceService);
    checkCompliance(): Promise<ComplianceAlert[]>;
    checkAuthorityStatus(authority: ComplianceItem["authority"]): Promise<{
        compliant: boolean;
        alerts: string[];
    }>;
}
//# sourceMappingURL=compliance-monitor.d.ts.map