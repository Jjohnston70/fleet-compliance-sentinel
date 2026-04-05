/**
 * Compliance Package Service - Generate 7 compliance packages from company data
 * Merges company info with template masters to produce DOCX/PDF/MD documents
 */
import { COMPLIANCE_PACKAGES } from "../config/index.js";
import { COMPLIANCE_PACKAGE_TEMPLATES } from "../data/seeds.js";
import { renderTemplate } from "./template-engine.js";
import { generateDocumentOutputs } from "./document-generator.js";
export class CompliancePackageService {
    constructor(repo) {
        this.repo = repo;
    }
    /**
     * Generate a single compliance package for a company
     */
    async generatePackage(companyId, packageNumber, formats = ["docx", "pdf", "markdown"]) {
        const company = await this.repo.getCompany(companyId);
        if (!company) {
            throw new Error(`Company ${companyId} not found`);
        }
        const pkgConfig = COMPLIANCE_PACKAGES.find((p) => p.id === packageNumber);
        if (!pkgConfig) {
            throw new Error(`Invalid package number: ${packageNumber}. Must be 1-7.`);
        }
        const templateContent = COMPLIANCE_PACKAGE_TEMPLATES[packageNumber];
        if (!templateContent) {
            throw new Error(`No template found for package ${packageNumber}`);
        }
        // Create or update package record
        let pkg = await this.repo.createCompliancePackage({
            company_id: companyId,
            package_number: packageNumber,
            package_name: pkgConfig.name,
            slug: pkgConfig.slug,
            status: "generating",
            output_formats: formats,
        });
        try {
            // Render template with company data
            const { rendered, unresolvedPlaceholders } = renderTemplate(templateContent, company);
            // Generate output documents
            const documents = await generateDocumentOutputs(pkgConfig.name, pkgConfig.slug, rendered, formats);
            // Update package status
            pkg = await this.repo.updateCompliancePackage(pkg.id, {
                status: "complete",
                generated_content: rendered,
                generated_at: new Date(),
            });
            return { package: pkg, documents, unresolvedPlaceholders };
        }
        catch (error) {
            await this.repo.updateCompliancePackage(pkg.id, {
                status: "error",
                error_message: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
        }
    }
    /**
     * Generate all 7 compliance packages for a company
     */
    async generateAll(companyId, formats = ["docx", "pdf", "markdown"]) {
        const results = [];
        for (const pkgConfig of COMPLIANCE_PACKAGES) {
            try {
                const result = await this.generatePackage(companyId, pkgConfig.id, formats);
                results.push({
                    packageNumber: pkgConfig.id,
                    packageName: pkgConfig.name,
                    status: "complete",
                    documents: result.documents,
                    unresolvedPlaceholders: result.unresolvedPlaceholders,
                });
            }
            catch (error) {
                results.push({
                    packageNumber: pkgConfig.id,
                    packageName: pkgConfig.name,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
        const completed = results.filter((r) => r.status === "complete").length;
        const failed = results.filter((r) => r.status === "error").length;
        return {
            results,
            summary: {
                total: COMPLIANCE_PACKAGES.length,
                completed,
                failed,
            },
        };
    }
    /**
     * Get generation status for all packages for a company
     */
    async getPackageStatus(companyId) {
        const packages = await this.repo.listCompliancePackagesByCompany(companyId);
        return COMPLIANCE_PACKAGES.map((pkgConfig) => {
            const existing = packages.find((p) => p.package_number === pkgConfig.id);
            return {
                packageNumber: pkgConfig.id,
                packageName: pkgConfig.name,
                status: existing?.status || "not_generated",
                generatedAt: existing?.generated_at,
            };
        });
    }
}
//# sourceMappingURL=package-service.js.map