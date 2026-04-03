import Handlebars from "handlebars";

import type { CompanyRecord } from "../data/firestore-schema.js";

export const PLACEHOLDER_MAP: Record<string, keyof CompanyRecord | "_currentDate" | "_currentYear" | "_generatedBy"> = {
  COMPANY_NAME: "company_name",
  COMPANY_SHORT_NAME: "company_short_name",
  COMPANY_ADDRESS: "address",
  COMPANY_CITY: "city",
  COMPANY_STATE: "state",
  COMPANY_ZIP: "zip",
  COMPANY_EMAIL: "company_email",
  COMPANY_PHONE: "company_phone",
  WEBSITE: "website",
  EIN: "ein",
  STATE_OF_INCORPORATION: "state_of_incorporation",
  YEAR_FOUNDED: "year_founded",
  ENTITY_TYPE: "entity_type",
  CAGE_CODE: "cage_code",
  DUNS_NUMBER: "duns_number",
  SAM_UEI: "sam_uei",
  NAICS_CODES: "naics_codes",
  SIC_CODES: "sic_codes",
  CONTRACT_TYPES: "contract_types",
  CLEARANCE_LEVEL: "clearance_level",
  SET_ASIDE_STATUS: "set_aside_status",
  CEO: "ceo",
  CFO: "cfo",
  CTO: "cto",
  CISO: "ciso",
  PRIMARY_CONTACT: "primary_contact",
  IT_POC: "it_poc",
  SECURITY_POC: "security_poc",
  COMPLIANCE_POC: "compliance_poc",
  HR_POC: "hr_director",
  EMPLOYEE_COUNT: "employee_count",
  ANNUAL_REVENUE: "annual_revenue",
  REMOTE_WORKFORCE: "remote_workforce",
  CLOUD_PROVIDER: "cloud_provider",
  EMAIL_PLATFORM: "email_platform",
  INSURANCE_CARRIER: "insurance_carrier",
  CYBER_INSURANCE: "cyber_insurance",
  CURRENT_DATE: "_currentDate",
  CURRENT_YEAR: "_currentYear",
  GENERATED_BY: "_generatedBy",
};

export type RenderResult = {
  renderedContent: string;
  unresolvedPlaceholders: string[];
};

export function buildReplacementValues(company: CompanyRecord, now: Date = new Date()): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [token, field] of Object.entries(PLACEHOLDER_MAP)) {
    if (field === "_currentDate") {
      values[token] = now.toISOString().slice(0, 10);
    } else if (field === "_currentYear") {
      values[token] = String(now.getUTCFullYear());
    } else if (field === "_generatedBy") {
      values[token] = "True North Data Strategies - compliance-command";
    } else {
      const raw = company[field];
      values[token] = raw === undefined || raw === null ? "" : String(raw);
    }
  }

  const fullAddress = [company.address, company.city, company.state, company.zip].filter(Boolean).join(", ");
  values.FULL_ADDRESS = fullAddress;
  return values;
}

export function renderTemplate(templateContent: string, replacementValues: Record<string, string>): RenderResult {
  const tokens = new Set<string>();
  for (const match of templateContent.matchAll(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g)) {
    tokens.add(match[1]);
  }

  const compiled = Handlebars.compile(templateContent, { noEscape: true, strict: false });
  const renderedContent = compiled(replacementValues);

  const unresolvedPlaceholders = [...tokens].filter((token) => {
    const value = replacementValues[token];
    return value === undefined || value === null || value === "";
  });

  return { renderedContent, unresolvedPlaceholders };
}
