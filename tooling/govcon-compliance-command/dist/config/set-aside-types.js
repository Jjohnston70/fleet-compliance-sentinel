/**
 * Federal set-aside type definitions per SBA and Federal Acquisition Regulations
 */
export const SET_ASIDE_TYPES = [
    {
        code: "SDVOSB",
        title: "Service-Disabled Veteran-Owned Small Business",
        description: "Small businesses at least 51% owned and controlled by service-disabled veterans. Eligible for special procurement programs under VA and other agencies.",
        eligibility: "True North Data Strategies is pursuing SDVOSB certification with Jacob Johnston (Bronze Star recipient, 20 years Army service) as the service-disabled veteran owner.",
        eligible: true,
    },
    {
        code: "VOSB",
        title: "Veteran-Owned Small Business",
        description: "Small businesses at least 51% owned and controlled by veterans (not necessarily service-disabled). Eligible for special procurement programs.",
        eligibility: "Any business with 51%+ ownership by a veteran qualifies. True North Data Strategies qualifies.",
        eligible: true,
    },
    {
        code: "8a",
        title: "8(a) Business Development Program",
        description: "SBA program for small disadvantaged businesses, offering contracting assistance, training, and counseling. Includes federal contract set-asides and sole-source awards.",
        eligibility: "Requires socially and economically disadvantaged ownership (not currently pursued by True North).",
        eligible: false,
    },
    {
        code: "HUBZone",
        title: "HUBZone (Historically Underutilized Business Zone)",
        description: "Small businesses located in HUBZones (areas of economic distress). Primary office and 35% of employees must be in HUBZone.",
        eligibility: "Colorado Springs office location must be within designated HUBZone (current status not verified).",
        eligible: false,
    },
    {
        code: "WOSB",
        title: "Women-Owned Small Business",
        description: "Small businesses at least 51% owned and controlled by women. Eligible for federal contract set-asides and certifications.",
        eligibility: "Requires 51%+ women ownership (not applicable to True North at this time).",
        eligible: false,
    },
    {
        code: "small_business",
        title: "Small Business",
        description: "General federal small business set-aside. Size standards vary by NAICS code. True North Data Strategies qualifies as small under IT services standards.",
        eligibility: "Meets SBA small business size standards for NAICS 541511 (< 500 employees, no revenue limit).",
        eligible: true,
    },
    {
        code: "full_open",
        title: "Full & Open Competition",
        description: "Non-set-aside procurement open to all qualified contractors. Any size, any ownership structure.",
        eligibility: "True North Data Strategies can compete in all full and open procurements.",
        eligible: true,
    },
    {
        code: "sole_source",
        title: "Sole-Source Award",
        description: "Government awards contract to single contractor without competition. Rare, requires special justification.",
        eligibility: "Sole-source requires unique qualifications and government justification (rare for new vendors).",
        eligible: false,
    },
];
export function getSetAsideType(code) {
    return SET_ASIDE_TYPES.find((sat) => sat.code === code);
}
export function getEligibleSetAsides() {
    return SET_ASIDE_TYPES.filter((sat) => sat.eligible);
}
export function matchSetAsideValue(value) {
    const lower = value.toLowerCase();
    if (lower.includes("sdvosb"))
        return "SDVOSB";
    if (lower.includes("vosb") && !lower.includes("sdvosb"))
        return "VOSB";
    if (lower.includes("8a"))
        return "8a";
    if (lower.includes("hubzone"))
        return "HUBZone";
    if (lower.includes("women") || lower.includes("wosb"))
        return "WOSB";
    if (lower.includes("small"))
        return "small_business";
    if (lower.includes("full") || lower.includes("open"))
        return "full_open";
    if (lower.includes("sole"))
        return "sole_source";
    return undefined;
}
//# sourceMappingURL=set-aside-types.js.map