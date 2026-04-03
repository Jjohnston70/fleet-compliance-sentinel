export const COMPLIANCE_PACKAGES: Record<number, { name: string; slug: string }> = {
  1: { name: "Internal Compliance", slug: "internal_compliance" },
  2: { name: "Security Handbook", slug: "security_handbook" },
  3: { name: "Data Handling and Privacy", slug: "data_handling_privacy" },
  4: { name: "Government Contracting", slug: "government_contracting" },
  5: { name: "Google Partner", slug: "google_partner" },
  6: { name: "Business Operations", slug: "business_operations" },
  7: { name: "Advanced Compliance", slug: "advanced_compliance" },
};

export const MODULE_META = {
  module: "compliance-command",
  version: "1.0.0",
  actions: [
    "submitCompanyInfo",
    "generatePackage",
    "generateAll",
    "getCompanyInfo",
    "listCompanies",
    "getPackageStatus",
    "getStatus",
  ],
} as const;

export const DEFAULT_TIMEZONE = "America/Denver";
