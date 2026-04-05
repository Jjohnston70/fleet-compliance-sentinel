/**
 * Compliance Service - Track certifications, registrations, and expirations
 */
import { ComplianceItem } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export declare class ComplianceService {
    private repo;
    constructor(repo: InMemoryRepository);
    createComplianceItem(name: string, description: string, itemType: ComplianceItem["item_type"], authority: ComplianceItem["authority"], expirationDate: Date, options?: Partial<ComplianceItem>): Promise<ComplianceItem>;
    getComplianceItem(id: string): Promise<ComplianceItem | null>;
    listComplianceItems(filters?: {
        authority?: ComplianceItem["authority"];
        status?: ComplianceItem["status"];
        itemType?: ComplianceItem["item_type"];
    }): Promise<ComplianceItem[]>;
    updateComplianceItem(id: string, updates: Partial<ComplianceItem>): Promise<ComplianceItem>;
    markRenewed(id: string, newExpirationDate: Date): Promise<ComplianceItem>;
    getExpiringItems(daysThreshold?: number): Promise<ComplianceItem[]>;
    getExpiredItems(): Promise<ComplianceItem[]>;
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
//# sourceMappingURL=compliance-service.d.ts.map