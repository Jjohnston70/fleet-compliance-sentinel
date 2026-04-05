/**
 * Compliance Package Service - Generate 7 compliance packages from company data
 * Merges company info with template masters to produce DOCX/PDF/MD documents
 */
import { CompliancePackage } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
import { GeneratedDocument } from "./document-generator.js";
export declare class CompliancePackageService {
    private repo;
    constructor(repo: InMemoryRepository);
    /**
     * Generate a single compliance package for a company
     */
    generatePackage(companyId: string, packageNumber: number, formats?: ("docx" | "pdf" | "markdown")[]): Promise<{
        package: CompliancePackage;
        documents: GeneratedDocument[];
        unresolvedPlaceholders: string[];
    }>;
    /**
     * Generate all 7 compliance packages for a company
     */
    generateAll(companyId: string, formats?: ("docx" | "pdf" | "markdown")[]): Promise<{
        results: Array<{
            packageNumber: number;
            packageName: string;
            status: "complete" | "error";
            documents?: GeneratedDocument[];
            unresolvedPlaceholders?: string[];
            error?: string;
        }>;
        summary: {
            total: number;
            completed: number;
            failed: number;
        };
    }>;
    /**
     * Get generation status for all packages for a company
     */
    getPackageStatus(companyId: string): Promise<Array<{
        packageNumber: number;
        packageName: string;
        status: string;
        generatedAt?: Date;
    }>>;
}
//# sourceMappingURL=package-service.d.ts.map