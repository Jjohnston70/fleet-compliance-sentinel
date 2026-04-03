export type PackageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CompanyRecord {
  id: string;
  company_name: string;
  company_short_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  ceo?: string;
  cfo?: string;
  cto?: string;
  ciso?: string;
  hr_director?: string;
  compliance_officer?: string;
  industry?: string;
  employee_count?: number;
  annual_revenue?: string;
  primary_contact?: string;
  company_email?: string;
  company_phone?: string;
  ein?: string;
  state_of_incorporation?: string;
  year_founded?: string;
  entity_type?: string;
  cage_code?: string;
  duns_number?: string;
  sam_uei?: string;
  naics_codes?: string;
  sic_codes?: string;
  contract_types?: string;
  clearance_level?: string;
  set_aside_status?: string;
  it_poc?: string;
  security_poc?: string;
  compliance_poc?: string;
  remote_workforce?: string;
  cloud_provider?: string;
  email_platform?: string;
  insurance_carrier?: string;
  cyber_insurance?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocumentRecord {
  template_id: string;
  title: string;
  generated_url: string;
  generated_pdf_url: string;
  generated_docx_url: string;
  generated_at: string;
}

export interface CompliancePackageRecord {
  id: string;
  company_id: string;
  package_number: PackageNumber;
  package_name: string;
  status: "pending" | "generating" | "complete" | "error";
  documents: GeneratedDocumentRecord[];
  generated_at: string;
  generated_by: string;
}

export interface TemplateRecord {
  id: string;
  package_number: PackageNumber;
  title: string;
  template_content: string;
  placeholders: string[];
  version: string;
  active: boolean;
}

export interface ComplianceFrameworkControl {
  control_id: string;
  title: string;
  description: string;
  implementation_status: "not_started" | "in_progress" | "implemented";
}

export interface ComplianceFrameworkRecord {
  id: string;
  name: "CMMC" | "SOC2" | "FedRAMP" | "NIST_800_53" | "HIPAA" | "PCI";
  version: string;
  controls: ComplianceFrameworkControl[];
}

export const COLLECTIONS = {
  companies: "companies",
  compliance_packages: "compliance_packages",
  templates: "templates",
  compliance_frameworks: "compliance_frameworks",
} as const;
