/**
 * dq-command — Document Service
 * Handles document uploads, status tracking, verification, and generation triggers.
 */

import { InMemoryDqRepository } from '../data/repository';
import type {
  DqDocument,
  DqDocType,
  DqDocStatus,
  UploadDocumentInput,
  GenerateDocumentInput,
} from '../data/schema';

/** Document types that can be auto-generated from intake data */
const GENERATABLE_DOC_TYPES: DqDocType[] = [
  'application_for_employment',
  'record_of_violations',
  'clearinghouse_consent_pre_emp',
  'nrcme_verification_note',
  'annual_review_note',
  'clearinghouse_consent_annual',
  'dhf_driver_authorization',
];

export class DocumentService {
  constructor(private repo: InMemoryDqRepository) {}

  /**
   * Record a document upload and update its checklist status.
   */
  async uploadDocument(orgId: string, input: UploadDocumentInput): Promise<DqDocument | null> {
    const docs = await this.repo.getDocumentsForFile(input.dq_file_id);
    const doc = docs.find((d) => d.doc_type === input.doc_type);
    if (!doc) return null;

    const now = new Date().toISOString();
    await this.repo.updateDocumentStatus(doc.id, 'uploaded', {
      file_path: input.file_path,
      uploaded_at: now,
      expires_at: input.expires_at ?? doc.expires_at,
    });

    await this.repo.addAuditEntry({
      dq_file_id: input.dq_file_id,
      org_id: orgId,
      actor_id: 'user', // caller provides actual userId in production
      actor_type: 'user',
      action: 'doc.uploaded',
      doc_type: input.doc_type,
      metadata: { file_path: input.file_path },
    });

    return this.repo.getDocument(doc.id);
  }

  /**
   * Trigger document generation from intake data.
   * In production, this calls PaperStack's pdf_generator.
   * Here it marks the document as generated and records the path.
   */
  async generateDocument(orgId: string, input: GenerateDocumentInput): Promise<DqDocument | null> {
    if (!GENERATABLE_DOC_TYPES.includes(input.doc_type)) {
      return null; // Not a generatable doc type
    }

    const docs = await this.repo.getDocumentsForFile(input.dq_file_id);
    const doc = docs.find((d) => d.doc_type === input.doc_type);
    if (!doc) return null;

    const now = new Date().toISOString();
    const generatedPath = `/generated/dq/${input.dq_file_id}/${input.doc_type}_${Date.now()}.pdf`;

    await this.repo.updateDocumentStatus(doc.id, 'generated', {
      generated_at: now,
      generated_doc_path: generatedPath,
    });

    await this.repo.addAuditEntry({
      dq_file_id: input.dq_file_id,
      org_id: orgId,
      actor_id: 'system',
      actor_type: 'system',
      action: 'doc.generated',
      doc_type: input.doc_type,
      metadata: { generated_doc_path: generatedPath, options: input.generation_options },
    });

    return this.repo.getDocument(doc.id);
  }

  /**
   * Mark a document as verified by a fleet manager.
   */
  async markVerified(documentId: number, reviewerId: string, notes?: string): Promise<DqDocument | null> {
    const doc = await this.repo.getDocument(documentId);
    if (!doc) return null;
    if (doc.status !== 'uploaded' && doc.status !== 'generated') return null;

    const now = new Date().toISOString();
    await this.repo.updateDocumentStatus(documentId, 'verified', {
      reviewed_by: reviewerId,
      reviewed_at: now,
      notes: notes ?? doc.notes,
    });

    await this.repo.addAuditEntry({
      dq_file_id: doc.dq_file_id,
      org_id: doc.org_id,
      actor_id: reviewerId,
      actor_type: 'user',
      action: 'doc.verified',
      doc_type: doc.doc_type,
      metadata: { notes },
    });

    return this.repo.getDocument(documentId);
  }

  /**
   * Get all documents with a specific status across the org.
   */
  async getDocumentsByStatus(orgId: string, status: DqDocStatus): Promise<DqDocument[]> {
    if (status === 'missing') {
      return this.repo.getMissingDocuments(orgId);
    }
    // For other statuses, filter from all files
    const files = await this.repo.listDqFiles(orgId);
    const allDocs: DqDocument[] = [];
    for (const file of files) {
      const docs = await this.repo.getDocumentsForFile(file.id);
      allDocs.push(...docs.filter((d) => d.status === status));
    }
    return allDocs;
  }
}
