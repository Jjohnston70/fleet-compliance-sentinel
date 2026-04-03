import type {
  CompanyRecord,
  ComplianceFrameworkRecord,
  CompliancePackageRecord,
  PackageNumber,
  TemplateRecord,
} from "./firestore-schema.js";

export interface ComplianceRepository {
  upsertCompanyByName(company: Omit<CompanyRecord, "id" | "created_at" | "updated_at">): CompanyRecord;
  getCompanyById(companyId: string): CompanyRecord | null;
  listCompanies(): CompanyRecord[];
  upsertPackage(record: Omit<CompliancePackageRecord, "id">): CompliancePackageRecord;
  getPackage(companyId: string, packageNumber: PackageNumber): CompliancePackageRecord | null;
  listPackages(companyId: string): CompliancePackageRecord[];
  listTemplatesForPackage(packageNumber: PackageNumber): TemplateRecord[];
  listFrameworks(): ComplianceFrameworkRecord[];
}
