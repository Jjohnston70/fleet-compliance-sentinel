/**
 * Default compliance tracking items for True North Data Strategies
 */
export interface ComplianceSeedItem {
    itemType: string;
    name: string;
    description: string;
    authority: "SBA" | "SAM" | "IRS" | "state" | "VA";
    renewalFrequencyMonths: number;
    reminderDaysBefore: number;
}
export declare const DEFAULT_COMPLIANCE_ITEMS: ComplianceSeedItem[];
export declare function getComplianceItemsForAuthority(authority: ComplianceSeedItem["authority"]): ComplianceSeedItem[];
//# sourceMappingURL=compliance-seeds.d.ts.map