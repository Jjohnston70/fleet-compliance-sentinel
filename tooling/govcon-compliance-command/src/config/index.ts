/**
 * Central configuration for govcon-compliance-command
 * Brand colors, company info, operational thresholds, and compliance settings
 */

export const COMPANY_CONFIG = {
  name: "True North Data Strategies LLC",
  owner: "Jacob Johnston",
  address: "123 Example St, Anytown, CO 80000",
  phone: "555-555-5555",
  email: "jacob@truenorthstrategyops.com",
  uei: process.env.UEI || "pending",
  cageCode: process.env.CAGE_CODE || "pending",
  website: "https://truenorthstrategyops.com",
  certification: "SBA-certified VOSB/SDVOSB",
};

export const BRAND_COLORS = {
  primary: {
    name: "Navy",
    light: "#1a3a5c",
    dark: "#0a1a2d",
  },
  secondary: {
    name: "Teal",
    standard: "#3d8eb9",
    light: "#5ca8cc",
  },
  neutral: {
    lightGray: "#cccccc",
    darkGray: "#333333",
    white: "#ffffff",
  },
};

export const FONTS = {
  headers: "Montserrat",
  body: "Open Sans",
};

export const BID_DECISION_THRESHOLDS = {
  highRecommendation: 70,
  conditional: 40,
  noRecommendation: 0,
};

export const COMPLIANCE_REMINDER_DAYS = {
  warning90: 90,
  warning60: 60,
  warning30: 30,
  warning7: 7,
};

export const DEADLINE_ALERT_DAYS = {
  week: 7,
  threeDay: 3,
  oneDay: 1,
};

export const MICRO_PURCHASE_THRESHOLD = 10_000;
export const SMALL_BUSINESS_THRESHOLD = 250_000;

// Compliance document generation config
export const COMPLIANCE_PACKAGES = [
  { id: 1, name: "Internal Compliance Policy", slug: "internal-compliance" },
  { id: 2, name: "Security Compliance Handbook", slug: "security-handbook" },
  { id: 3, name: "Data Handling & Privacy Policy", slug: "data-privacy" },
  { id: 4, name: "Government Contracting Compliance", slug: "govcon-compliance" },
  { id: 5, name: "Google Partner Compliance", slug: "google-partner" },
  { id: 6, name: "Business Operations Compliance", slug: "business-ops" },
  { id: 7, name: "Advanced Compliance (CMMC/FedRAMP)", slug: "cmmc-fedramp" },
] as const;

export const COMPLIANCE_FRAMEWORKS = [
  { id: "cmmc", name: "CMMC", description: "Cybersecurity Maturity Model Certification" },
  { id: "soc2", name: "SOC 2", description: "Service Organization Control 2" },
  { id: "fedramp", name: "FedRAMP", description: "Federal Risk and Authorization Management Program" },
  { id: "nist-800-53", name: "NIST 800-53", description: "Security and Privacy Controls for Information Systems" },
  { id: "nist-800-171", name: "NIST 800-171", description: "Protecting Controlled Unclassified Information" },
  { id: "hipaa", name: "HIPAA", description: "Health Insurance Portability and Accountability Act" },
  { id: "pci", name: "PCI DSS", description: "Payment Card Industry Data Security Standard" },
  { id: "gdpr", name: "GDPR", description: "General Data Protection Regulation" },
  { id: "ccpa", name: "CCPA/CPRA", description: "California Consumer Privacy Act" },
  { id: "iso-27001", name: "ISO 27001", description: "Information Security Management Systems" },
] as const;

// Skill domain definitions (from compliance-gov-module)
export const COMPLIANCE_SKILL_DOMAINS = [
  { id: "security-governance", name: "Security Governance", governance: "ROOT", weight: 3.0 },
  { id: "internal-compliance", name: "Internal Compliance", governance: "BASELINE", weight: 2.5 },
  { id: "data-handling-privacy", name: "Data Handling & Privacy", governance: "BASELINE", weight: 2.5 },
  { id: "cloud-platform-security", name: "Cloud Platform Security", governance: "PLATFORM", weight: 2.0 },
  { id: "business-operations", name: "Business Operations", governance: "SUPPORT", weight: 1.0 },
  { id: "government-contracting", name: "Government Contracting", governance: "CONTRACTUAL", weight: 1.5 },
  { id: "contracts-risk-assurance", name: "Contracts & Risk Assurance", governance: "CONTRACTUAL", weight: 1.5 },
  { id: "compliance-audit", name: "Compliance Audit", governance: "BASELINE", weight: 2.5 },
  { id: "compliance-research", name: "Compliance Research", governance: "SUPPORT", weight: 1.0 },
  { id: "compliance-usage", name: "Usage Guides", governance: "SUPPORT", weight: 1.0 },
] as const;

// Governance weights for maturity scoring
export const GOVERNANCE_WEIGHTS: Record<string, number> = {
  ROOT: 3.0,
  BASELINE: 2.5,
  PLATFORM: 2.0,
  CONTRACTUAL: 1.5,
  SUPPORT: 1.0,
};

// Template status scores for maturity scoring
export const STATUS_SCORES: Record<string, number> = {
  not_started: 0.0,
  in_progress: 0.25,
  implemented: 0.75,
  verified: 1.0,
};

// Document output formats
export const DOCUMENT_FORMATS = ["docx", "pdf", "markdown"] as const;
export type DocumentFormat = (typeof DOCUMENT_FORMATS)[number];
