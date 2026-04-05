/**
 * Bid Document Service - Generate government contract bid documents
 * Creates capability statements, technical approaches, compliance matrices,
 * and full proposal packages in DOCX/PDF/Markdown
 */
import { BidDocument } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
import { GeneratedDocument } from "./document-generator.js";
type BidDocumentType = BidDocument["document_type"];
export declare class BidDocumentService {
    private repo;
    constructor(repo: InMemoryRepository);
    /**
     * Generate a specific bid document type for an opportunity
     */
    generateBidDocument(opportunityId: string, documentType: BidDocumentType, companyId?: string, formats?: ("docx" | "pdf" | "markdown")[]): Promise<{
        bidDocument: BidDocument;
        outputs: GeneratedDocument[];
    }>;
    /**
     * Generate a full bid package (all document types) for an opportunity
     */
    generateFullBidPackage(opportunityId: string, companyId?: string, formats?: ("docx" | "pdf" | "markdown")[]): Promise<{
        documents: Array<{
            type: BidDocumentType;
            bidDocument: BidDocument;
            outputs: GeneratedDocument[];
        }>;
        summary: {
            total: number;
            generated: number;
        };
    }>;
    /**
     * List bid documents for an opportunity
     */
    listBidDocuments(opportunityId: string): Promise<BidDocument[]>;
    /**
     * Get a specific bid document
     */
    getBidDocument(id: string): Promise<BidDocument | null>;
}
export {};
//# sourceMappingURL=bid-document-service.d.ts.map