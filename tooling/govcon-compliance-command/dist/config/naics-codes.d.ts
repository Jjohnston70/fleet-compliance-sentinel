/**
 * NAICS codes relevant to True North Data Strategies
 * All codes are real and based on Bureau of Labor Statistics
 */
export interface NAICSCode {
    code: string;
    title: string;
    description: string;
    primary: boolean;
}
export declare const NAICS_CODES: NAICSCode[];
export declare function getNAICSByCode(code: string): NAICSCode | undefined;
export declare function getPrimaryNAICS(): NAICSCode[];
//# sourceMappingURL=naics-codes.d.ts.map