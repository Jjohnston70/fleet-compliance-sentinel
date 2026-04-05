/**
 * Central configuration for govcon-compliance-command
 * Brand colors, company info, operational thresholds, and compliance settings
 */
export declare const COMPANY_CONFIG: {
    name: string;
    owner: string;
    address: string;
    phone: string;
    email: string;
    uei: string;
    cageCode: string;
    website: string;
    certification: string;
};
export declare const BRAND_COLORS: {
    primary: {
        name: string;
        light: string;
        dark: string;
    };
    secondary: {
        name: string;
        standard: string;
        light: string;
    };
    neutral: {
        lightGray: string;
        darkGray: string;
        white: string;
    };
};
export declare const FONTS: {
    headers: string;
    body: string;
};
export declare const BID_DECISION_THRESHOLDS: {
    highRecommendation: number;
    conditional: number;
    noRecommendation: number;
};
export declare const COMPLIANCE_REMINDER_DAYS: {
    warning90: number;
    warning60: number;
    warning30: number;
    warning7: number;
};
export declare const DEADLINE_ALERT_DAYS: {
    week: number;
    threeDay: number;
    oneDay: number;
};
export declare const MICRO_PURCHASE_THRESHOLD = 10000;
export declare const SMALL_BUSINESS_THRESHOLD = 250000;
export declare const COMPLIANCE_PACKAGES: readonly [{
    readonly id: 1;
    readonly name: "Internal Compliance Policy";
    readonly slug: "internal-compliance";
}, {
    readonly id: 2;
    readonly name: "Security Compliance Handbook";
    readonly slug: "security-handbook";
}, {
    readonly id: 3;
    readonly name: "Data Handling & Privacy Policy";
    readonly slug: "data-privacy";
}, {
    readonly id: 4;
    readonly name: "Government Contracting Compliance";
    readonly slug: "govcon-compliance";
}, {
    readonly id: 5;
    readonly name: "Google Partner Compliance";
    readonly slug: "google-partner";
}, {
    readonly id: 6;
    readonly name: "Business Operations Compliance";
    readonly slug: "business-ops";
}, {
    readonly id: 7;
    readonly name: "Advanced Compliance (CMMC/FedRAMP)";
    readonly slug: "cmmc-fedramp";
}];
export declare const COMPLIANCE_FRAMEWORKS: readonly [{
    readonly id: "cmmc";
    readonly name: "CMMC";
    readonly description: "Cybersecurity Maturity Model Certification";
}, {
    readonly id: "soc2";
    readonly name: "SOC 2";
    readonly description: "Service Organization Control 2";
}, {
    readonly id: "fedramp";
    readonly name: "FedRAMP";
    readonly description: "Federal Risk and Authorization Management Program";
}, {
    readonly id: "nist-800-53";
    readonly name: "NIST 800-53";
    readonly description: "Security and Privacy Controls for Information Systems";
}, {
    readonly id: "nist-800-171";
    readonly name: "NIST 800-171";
    readonly description: "Protecting Controlled Unclassified Information";
}, {
    readonly id: "hipaa";
    readonly name: "HIPAA";
    readonly description: "Health Insurance Portability and Accountability Act";
}, {
    readonly id: "pci";
    readonly name: "PCI DSS";
    readonly description: "Payment Card Industry Data Security Standard";
}, {
    readonly id: "gdpr";
    readonly name: "GDPR";
    readonly description: "General Data Protection Regulation";
}, {
    readonly id: "ccpa";
    readonly name: "CCPA/CPRA";
    readonly description: "California Consumer Privacy Act";
}, {
    readonly id: "iso-27001";
    readonly name: "ISO 27001";
    readonly description: "Information Security Management Systems";
}];
export declare const COMPLIANCE_SKILL_DOMAINS: readonly [{
    readonly id: "security-governance";
    readonly name: "Security Governance";
    readonly governance: "ROOT";
    readonly weight: 3;
}, {
    readonly id: "internal-compliance";
    readonly name: "Internal Compliance";
    readonly governance: "BASELINE";
    readonly weight: 2.5;
}, {
    readonly id: "data-handling-privacy";
    readonly name: "Data Handling & Privacy";
    readonly governance: "BASELINE";
    readonly weight: 2.5;
}, {
    readonly id: "cloud-platform-security";
    readonly name: "Cloud Platform Security";
    readonly governance: "PLATFORM";
    readonly weight: 2;
}, {
    readonly id: "business-operations";
    readonly name: "Business Operations";
    readonly governance: "SUPPORT";
    readonly weight: 1;
}, {
    readonly id: "government-contracting";
    readonly name: "Government Contracting";
    readonly governance: "CONTRACTUAL";
    readonly weight: 1.5;
}, {
    readonly id: "contracts-risk-assurance";
    readonly name: "Contracts & Risk Assurance";
    readonly governance: "CONTRACTUAL";
    readonly weight: 1.5;
}, {
    readonly id: "compliance-audit";
    readonly name: "Compliance Audit";
    readonly governance: "BASELINE";
    readonly weight: 2.5;
}, {
    readonly id: "compliance-research";
    readonly name: "Compliance Research";
    readonly governance: "SUPPORT";
    readonly weight: 1;
}, {
    readonly id: "compliance-usage";
    readonly name: "Usage Guides";
    readonly governance: "SUPPORT";
    readonly weight: 1;
}];
export declare const GOVERNANCE_WEIGHTS: Record<string, number>;
export declare const STATUS_SCORES: Record<string, number>;
export declare const DOCUMENT_FORMATS: readonly ["docx", "pdf", "markdown"];
export type DocumentFormat = (typeof DOCUMENT_FORMATS)[number];
//# sourceMappingURL=index.d.ts.map