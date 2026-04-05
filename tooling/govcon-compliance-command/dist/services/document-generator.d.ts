/**
 * Document Generator - Creates DOCX, PDF, and Markdown output files
 * from rendered compliance templates and bid documents
 */
export interface GeneratedDocument {
    filename: string;
    format: "docx" | "pdf" | "markdown";
    content: Buffer | string;
    mimeType: string;
}
/**
 * Generate a DOCX document from markdown-style content
 */
export declare function generateDocx(title: string, content: string, options?: {
    footer?: string;
}): Promise<Buffer>;
/**
 * Generate a PDF document from markdown-style content
 */
export declare function generatePdf(title: string, content: string, options?: {
    footer?: string;
}): Promise<Buffer>;
/**
 * Generate all three output formats from rendered content
 */
export declare function generateDocumentOutputs(title: string, slug: string, content: string, formats?: ("docx" | "pdf" | "markdown")[]): Promise<GeneratedDocument[]>;
//# sourceMappingURL=document-generator.d.ts.map