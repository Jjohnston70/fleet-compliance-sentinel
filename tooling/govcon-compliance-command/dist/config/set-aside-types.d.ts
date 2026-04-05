/**
 * Federal set-aside type definitions per SBA and Federal Acquisition Regulations
 */
export interface SetAsideType {
    code: string;
    title: string;
    description: string;
    eligibility: string;
    eligible: boolean;
}
export declare const SET_ASIDE_TYPES: SetAsideType[];
export declare function getSetAsideType(code: string): SetAsideType | undefined;
export declare function getEligibleSetAsides(): SetAsideType[];
export declare function matchSetAsideValue(value: string): SetAsideType["code"] | undefined;
//# sourceMappingURL=set-aside-types.d.ts.map