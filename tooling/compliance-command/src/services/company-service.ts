import type { CompanyRecord } from "../data/firestore-schema.js";
import type { ComplianceRepository } from "../data/repository.js";

export type CompanyInput = {
  companyName: string;
  primaryContact: string;
  companyShortName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  ein?: string;
  stateOfIncorporation?: string;
  yearFounded?: string;
  entityType?: string;
  cageCode?: string;
  dunsNumber?: string;
  samUei?: string;
  naicsCodes?: string;
  sicCodes?: string;
  contractTypes?: string;
  clearanceLevel?: string;
  setAsideStatus?: string;
  ceo?: string;
  cfo?: string;
  cto?: string;
  ciso?: string;
  itPoc?: string;
  securityPoc?: string;
  compliancePoc?: string;
  hrPoc?: string;
  employeeCount?: number;
  annualRevenue?: string;
  remoteWorkforce?: string;
  cloudProvider?: string;
  emailPlatform?: string;
  insuranceCarrier?: string;
  cyberInsurance?: string;
};

export class CompanyService {
  constructor(private readonly repo: ComplianceRepository) {}

  submitCompanyInfo(input: CompanyInput): { companyId: string; status: "created" | "updated"; timestamp: string } {
    if (!input.companyName?.trim()) {
      throw new Error("companyName is required");
    }
    if (!input.primaryContact?.trim()) {
      throw new Error("primaryContact is required");
    }

    const existing = this.repo
      .listCompanies()
      .find((company) => company.company_name.toLowerCase() === input.companyName.trim().toLowerCase());

    const upserted = this.repo.upsertCompanyByName({
      company_name: input.companyName.trim(),
      primary_contact: input.primaryContact.trim(),
      company_short_name: input.companyShortName,
      address: input.companyAddress,
      city: input.companyCity,
      state: input.companyState,
      zip: input.companyZip,
      company_email: input.companyEmail,
      company_phone: input.companyPhone,
      website: input.website,
      ein: input.ein,
      state_of_incorporation: input.stateOfIncorporation,
      year_founded: input.yearFounded,
      entity_type: input.entityType,
      cage_code: input.cageCode,
      duns_number: input.dunsNumber,
      sam_uei: input.samUei,
      naics_codes: input.naicsCodes,
      sic_codes: input.sicCodes,
      contract_types: input.contractTypes,
      clearance_level: input.clearanceLevel,
      set_aside_status: input.setAsideStatus,
      ceo: input.ceo,
      cfo: input.cfo,
      cto: input.cto,
      ciso: input.ciso,
      it_poc: input.itPoc,
      security_poc: input.securityPoc,
      compliance_poc: input.compliancePoc,
      hr_director: input.hrPoc,
      employee_count: input.employeeCount,
      annual_revenue: input.annualRevenue,
      remote_workforce: input.remoteWorkforce,
      cloud_provider: input.cloudProvider,
      email_platform: input.emailPlatform,
      insurance_carrier: input.insuranceCarrier,
      cyber_insurance: input.cyberInsurance,
    });

    return {
      companyId: upserted.id,
      status: existing ? "updated" : "created",
      timestamp: upserted.updated_at,
    };
  }

  getCompanyInfo(companyId: string): CompanyRecord {
    const company = this.repo.getCompanyById(companyId);
    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }
    return company;
  }

  listCompanies(): { companies: Array<{ companyId: string; companyName: string; primaryContact?: string; updatedAt: string }>; count: number } {
    const companies = this.repo.listCompanies().map((company) => ({
      companyId: company.id,
      companyName: company.company_name,
      primaryContact: company.primary_contact,
      updatedAt: company.updated_at,
    }));

    return { companies, count: companies.length };
  }
}
