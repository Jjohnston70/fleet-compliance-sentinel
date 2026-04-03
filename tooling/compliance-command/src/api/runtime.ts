import { createInMemoryComplianceRepository } from "../data/in-memory-repository.js";
import { FRAMEWORK_SEED, TEMPLATE_SEED } from "../data/seed-data.js";
import { CompanyService } from "../services/company-service.js";
import { FrameworkService } from "../services/framework-service.js";
import { CompliancePackageService } from "../services/package-service.js";

const repository = createInMemoryComplianceRepository({ templates: TEMPLATE_SEED, frameworks: FRAMEWORK_SEED });

export const runtime = {
  companyService: new CompanyService(repository),
  packageService: new CompliancePackageService(repository),
  frameworkService: new FrameworkService(repository),
};
