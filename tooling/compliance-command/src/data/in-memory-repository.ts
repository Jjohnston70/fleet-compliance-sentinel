import { randomUUID } from "node:crypto";

import type {
  CompanyRecord,
  ComplianceFrameworkRecord,
  CompliancePackageRecord,
  PackageNumber,
  TemplateRecord,
} from "./firestore-schema.js";
import type { ComplianceRepository } from "./repository.js";

type SeedData = {
  templates: TemplateRecord[];
  frameworks: ComplianceFrameworkRecord[];
};

export function createInMemoryComplianceRepository(seed: SeedData): ComplianceRepository {
  const companies = new Map<string, CompanyRecord>();
  const companiesByName = new Map<string, string>();
  const packages = new Map<string, CompliancePackageRecord>();

  const templates = [...seed.templates];
  const frameworks = [...seed.frameworks];

  const packageKey = (companyId: string, packageNumber: PackageNumber) => `${companyId}:${packageNumber}`;

  return {
    upsertCompanyByName(input) {
      const now = new Date().toISOString();
      const nameKey = input.company_name.trim().toLowerCase();
      const existingId = companiesByName.get(nameKey);

      if (existingId) {
        const existing = companies.get(existingId);
        if (!existing) {
          throw new Error("Repository state error: company index is out of sync.");
        }
        const updated: CompanyRecord = {
          ...existing,
          ...input,
          id: existing.id,
          created_at: existing.created_at,
          updated_at: now,
        };
        companies.set(existing.id, updated);
        return updated;
      }

      const created: CompanyRecord = {
        id: `comp_${randomUUID()}`,
        ...input,
        created_at: now,
        updated_at: now,
      };
      companies.set(created.id, created);
      companiesByName.set(nameKey, created.id);
      return created;
    },

    getCompanyById(companyId) {
      return companies.get(companyId) ?? null;
    },

    listCompanies() {
      return [...companies.values()].sort((a, b) => a.company_name.localeCompare(b.company_name));
    },

    upsertPackage(input) {
      const key = packageKey(input.company_id, input.package_number);
      const existing = packages.get(key);
      const record: CompliancePackageRecord = {
        id: existing?.id ?? `pkg_${randomUUID()}`,
        ...input,
      };
      packages.set(key, record);
      return record;
    },

    getPackage(companyId, packageNumber) {
      return packages.get(packageKey(companyId, packageNumber)) ?? null;
    },

    listPackages(companyId) {
      return [...packages.values()].filter((pkg) => pkg.company_id === companyId);
    },

    listTemplatesForPackage(packageNumber) {
      return templates.filter((tpl) => tpl.active && tpl.package_number === packageNumber);
    },

    listFrameworks() {
      return frameworks;
    },
  };
}
