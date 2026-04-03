import { DocumentType, GeneratedDocument } from '../data/schema.js';
import { Repository } from '../data/repository.js';
export interface DocumentGenerator {
    generateDocument(requestId: string, type: DocumentType, data: Record<string, any>): Promise<GeneratedDocument>;
    renderTemplate(template: string, data: Record<string, any>): string;
}
export declare class StandardDocumentGenerator implements DocumentGenerator {
    private repo;
    constructor(repo: Repository);
    generateDocument(requestId: string, type: DocumentType, data: Record<string, any>): Promise<GeneratedDocument>;
    renderTemplate(template: string, data: Record<string, any>): string;
}
//# sourceMappingURL=document-generator.d.ts.map