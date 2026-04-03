import { COMPLIANCE_PACKAGES } from "../config/module-config.js";
import type { CompliancePackageRecord, PackageNumber } from "../data/firestore-schema.js";
import type { ComplianceRepository } from "../data/repository.js";
import { generateDocumentOutputs } from "./document-generator.js";
import { buildReplacementValues, renderTemplate } from "./template-engine.js";

export class CompliancePackageService {
  constructor(private readonly repo: ComplianceRepository) {}

  async generatePackage(
    companyId: string,
    packageNumber: number,
    generatedBy = "api",
  ): Promise<{
    packageName: string;
    packageNumber: number;
    documentsGenerated: number;
    folderUrl: string;
    unresolvedPlaceholders: string[];
  }> {
    const pkgNum = packageNumber as PackageNumber;
    const packageMeta = COMPLIANCE_PACKAGES[pkgNum];
    if (!packageMeta) {
      throw new Error("Invalid packageNumber. Must be 1-7.");
    }

    const company = this.repo.getCompanyById(companyId);
    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }

    this.repo.upsertPackage({
      company_id: companyId,
      package_number: pkgNum,
      package_name: packageMeta.name,
      status: "generating",
      documents: [],
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
    });

    const templates = this.repo.listTemplatesForPackage(pkgNum);
    const replacementValues = buildReplacementValues(company);

    const documents: CompliancePackageRecord["documents"] = [];
    const unresolvedPlaceholders = new Set<string>();

    for (const template of templates) {
      const rendered = renderTemplate(template.template_content, replacementValues);
      rendered.unresolvedPlaceholders.forEach((token) => unresolvedPlaceholders.add(token));

      const outputs = await generateDocumentOutputs(rendered.renderedContent);
      const generatedAt = new Date().toISOString();
      documents.push({
        template_id: template.id,
        title: template.title,
        generated_url: outputs.pdf.dataUrl,
        generated_pdf_url: outputs.pdf.dataUrl,
        generated_docx_url: outputs.docx.dataUrl,
        generated_at: generatedAt,
      });
    }

    this.repo.upsertPackage({
      company_id: companyId,
      package_number: pkgNum,
      package_name: packageMeta.name,
      status: "complete",
      documents,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
    });

    return {
      packageName: packageMeta.name,
      packageNumber: pkgNum,
      documentsGenerated: documents.length,
      folderUrl: `memory://compliance/${companyId}/${pkgNum}`,
      unresolvedPlaceholders: [...unresolvedPlaceholders],
    };
  }

  async generateAll(
    companyId: string,
    generatedBy = "api",
  ): Promise<{
    packages: Array<{
      packageNumber: number;
      packageName: string;
      documentsGenerated: number;
      folderUrl: string;
      status: "generated" | "error";
      error?: string;
    }>;
    totalDocuments: number;
    folderUrl: string;
  }> {
    const results: Array<{
      packageNumber: number;
      packageName: string;
      documentsGenerated: number;
      folderUrl: string;
      status: "generated" | "error";
      error?: string;
    }> = [];

    let totalDocuments = 0;

    for (let pkgNum = 1; pkgNum <= 7; pkgNum += 1) {
      try {
        const result = await this.generatePackage(companyId, pkgNum, generatedBy);
        totalDocuments += result.documentsGenerated;
        results.push({
          packageNumber: pkgNum,
          packageName: result.packageName,
          documentsGenerated: result.documentsGenerated,
          folderUrl: result.folderUrl,
          status: "generated",
        });
      } catch (error) {
        const packageName = COMPLIANCE_PACKAGES[pkgNum as PackageNumber]?.name ?? `Package ${pkgNum}`;
        results.push({
          packageNumber: pkgNum,
          packageName,
          documentsGenerated: 0,
          folderUrl: "",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      packages: results,
      totalDocuments,
      folderUrl: `memory://compliance/${companyId}`,
    };
  }

  getPackageStatus(companyId: string): {
    companyId: string;
    packages: Array<{
      name: string;
      status: "not_generated" | "generated" | "error";
      documentCount: number;
      lastGenerated: string | null;
      folderUrl?: string;
    }>;
  } {
    const statusRows = Object.entries(COMPLIANCE_PACKAGES).map(([pkgNum, meta]) => {
      const stored = this.repo.getPackage(companyId, Number(pkgNum) as PackageNumber);
      if (!stored) {
        return {
          name: meta.name,
          status: "not_generated" as const,
          documentCount: 0,
          lastGenerated: null,
        };
      }

      return {
        name: meta.name,
        status: stored.status === "error" ? ("error" as const) : ("generated" as const),
        documentCount: stored.documents.length,
        lastGenerated: stored.generated_at,
        folderUrl: `memory://compliance/${companyId}/${pkgNum}`,
      };
    });

    return { companyId, packages: statusRows };
  }
}
