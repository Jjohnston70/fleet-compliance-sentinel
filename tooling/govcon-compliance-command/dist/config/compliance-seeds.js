/**
 * Default compliance tracking items for True North Data Strategies
 */
export const DEFAULT_COMPLIANCE_ITEMS = [
    {
        itemType: "registration",
        name: "SAM.gov Registration",
        description: "System for Award Management (SAM.gov) federal contractor registration. Required to bid on federal contracts.",
        authority: "SAM",
        renewalFrequencyMonths: 12,
        reminderDaysBefore: 60,
    },
    {
        itemType: "certification",
        name: "SDVOSB Certification",
        description: "Service-Disabled Veteran-Owned Small Business certification. Enables access to dedicated federal set-asides.",
        authority: "SBA",
        renewalFrequencyMonths: 36,
        reminderDaysBefore: 90,
    },
    {
        itemType: "registration",
        name: "Colorado Business License",
        description: "Colorado state business registration and license renewal.",
        authority: "state",
        renewalFrequencyMonths: 12,
        reminderDaysBefore: 60,
    },
    {
        itemType: "filing",
        name: "Federal Tax Return (1120-S or 1040-C)",
        description: "Annual IRS federal income tax return filing for sole proprietorship or S-corp.",
        authority: "IRS",
        renewalFrequencyMonths: 12,
        reminderDaysBefore: 30,
    },
    {
        itemType: "filing",
        name: "Colorado State Tax Return",
        description: "Annual Colorado state income tax return filing.",
        authority: "IRS",
        renewalFrequencyMonths: 12,
        reminderDaysBefore: 30,
    },
    {
        itemType: "certification",
        name: "General Liability Insurance",
        description: "Business liability insurance coverage. Often required by contract terms.",
        authority: "state",
        renewalFrequencyMonths: 12,
        reminderDaysBefore: 60,
    },
    {
        itemType: "registration",
        name: "DUNS Number (Dun & Bradstreet)",
        description: "Dun & Bradstreet unique identifier. Often cross-referenced in federal procurement.",
        authority: "SAM",
        renewalFrequencyMonths: 24,
        reminderDaysBefore: 90,
    },
    {
        itemType: "certification",
        name: "Cyber Security / Cloud Security Compliance",
        description: "NIST SP 800-171 compliance documentation for federal IT contracting (if applicable to contracts pursued).",
        authority: "SBA",
        renewalFrequencyMonths: 24,
        reminderDaysBefore: 90,
    },
];
export function getComplianceItemsForAuthority(authority) {
    return DEFAULT_COMPLIANCE_ITEMS.filter((item) => item.authority === authority);
}
//# sourceMappingURL=compliance-seeds.js.map