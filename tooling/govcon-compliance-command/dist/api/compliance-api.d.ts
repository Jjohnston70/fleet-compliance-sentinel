/**
 * Compliance API handlers
 */
import { ComplianceService } from "../services/compliance-service.js";
import { ComplianceItem } from "../data/schemas.js";
export interface ComplianceAPI {
    listComplianceItems(filters?: {
        authority?: ComplianceItem["authority"];
        status?: ComplianceItem["status"];
    }): Promise<ComplianceItem[]>;
    getComplianceItem(id: string): Promise<ComplianceItem | null>;
    updateComplianceItem(id: string, updates: Partial<ComplianceItem>): Promise<ComplianceItem>;
    markRenewed(id: string, newExpirationDate: Date): Promise<ComplianceItem>;
    getExpiringItems(daysThreshold?: number): Promise<ComplianceItem[]>;
    getComplianceAlerts(): Promise<{
        critical: ComplianceItem[];
        warning: ComplianceItem[];
        upcoming: ComplianceItem[];
    }>;
    checkAuthorityCompliance(authority: ComplianceItem["authority"]): Promise<{
        compliant: boolean;
        items: ComplianceItem[];
        alerts: string[];
    }>;
}
export declare function createComplianceAPI(service: ComplianceService): ComplianceAPI;
//# sourceMappingURL=compliance-api.d.ts.map