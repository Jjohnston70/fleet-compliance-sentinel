/**
 * dq-command — In-Memory Repository
 * Test-ready data layer. Replace with Postgres/Supabase repository for production.
 */

import { randomUUID } from 'crypto';
import type {
  DqFile,
  DqDocument,
  DqIntakeResponse,
  DqAuditLogEntry,
  DqFileStatus,
  DqFileType,
  DqDocType,
  DqDocStatus,
  CreateDqFileInput,
} from './schema';
import { DQ_CHECKLIST_CONFIG } from '../config/index';

export class InMemoryDqRepository {
  private files: DqFile[] = [];
  private documents: DqDocument[] = [];
  private intakeResponses: DqIntakeResponse[] = [];
  private auditLog: DqAuditLogEntry[] = [];
  private nextFileId = 1;
  private nextDocId = 1;
  private nextIntakeId = 1;
  private nextAuditId = 1;

  // ── DQ Files ─────────────────────────────────────────────────────────────

  async createDqFile(orgId: string, input: CreateDqFileInput): Promise<DqFile> {
    const token = randomUUID();
    const now = new Date().toISOString();

    // Create both DQF and DHF records
    const dqf: DqFile = {
      id: this.nextFileId++,
      org_id: orgId,
      driver_id: input.driver_id,
      driver_name: input.driver_name,
      cdl_holder: input.cdl_holder,
      status: 'incomplete',
      file_type: 'dqf',
      intake_token: token,
      intake_completed_at: null,
      retention_delete_after: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    this.files.push(dqf);

    const dhf: DqFile = {
      ...dqf,
      id: this.nextFileId++,
      file_type: 'dhf',
      intake_token: null, // intake token only on the DQF
    };
    this.files.push(dhf);

    // Scaffold checklist documents for both files
    this.scaffoldChecklist(dqf);
    this.scaffoldChecklist(dhf);

    return dqf;
  }

  private scaffoldChecklist(file: DqFile): void {
    const configs = DQ_CHECKLIST_CONFIG.filter((c) => c.file_type === file.file_type);
    for (const cfg of configs) {
      // Skip docs not applicable to this driver
      if (cfg.required_for === 'cdl_only' && !file.cdl_holder) continue;
      if (cfg.required_for === 'non_cdl_only' && file.cdl_holder) continue;

      const doc: DqDocument = {
        id: this.nextDocId++,
        dq_file_id: file.id,
        org_id: file.org_id,
        doc_type: cfg.doc_type,
        doc_label: cfg.doc_label,
        cfr_reference: cfg.cfr_reference,
        status: 'missing',
        required_for: cfg.required_for,
        cadence: cfg.cadence,
        expires_at: null,
        uploaded_at: null,
        generated_at: null,
        file_path: null,
        generated_doc_path: null,
        notes: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      };
      this.documents.push(doc);
    }
  }

  async getDqFile(id: number): Promise<DqFile | null> {
    return this.files.find((f) => f.id === id && !f.deleted_at) ?? null;
  }

  async getDqFileByToken(token: string): Promise<DqFile | null> {
    return this.files.find((f) => f.intake_token === token && !f.deleted_at) ?? null;
  }

  async listDqFiles(orgId: string, fileType?: DqFileType): Promise<DqFile[]> {
    return this.files.filter((f) =>
      f.org_id === orgId &&
      !f.deleted_at &&
      (fileType ? f.file_type === fileType : true)
    );
  }

  async updateDqFileStatus(id: number, status: DqFileStatus): Promise<void> {
    const file = this.files.find((f) => f.id === id);
    if (file) {
      file.status = status;
      file.updated_at = new Date().toISOString();
    }
  }

  async softDeleteDqFile(id: number, retentionDeleteAfter: string): Promise<void> {
    const file = this.files.find((f) => f.id === id);
    if (file) {
      file.deleted_at = new Date().toISOString();
      file.retention_delete_after = retentionDeleteAfter;
      file.updated_at = new Date().toISOString();
    }
  }

  // ── Documents ────────────────────────────────────────────────────────────

  async getDocumentsForFile(dqFileId: number): Promise<DqDocument[]> {
    return this.documents.filter((d) => d.dq_file_id === dqFileId);
  }

  async getDocument(id: number): Promise<DqDocument | null> {
    return this.documents.find((d) => d.id === id) ?? null;
  }

  async updateDocumentStatus(id: number, status: DqDocStatus, updates?: Partial<DqDocument>): Promise<void> {
    const doc = this.documents.find((d) => d.id === id);
    if (doc) {
      doc.status = status;
      if (updates) Object.assign(doc, updates);
    }
  }

  async getExpiringDocuments(orgId: string, withinDays: number): Promise<DqDocument[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return this.documents.filter((d) =>
      d.org_id === orgId &&
      d.expires_at &&
      new Date(d.expires_at) <= cutoff
    );
  }

  async getMissingDocuments(orgId: string): Promise<DqDocument[]> {
    return this.documents.filter((d) => d.org_id === orgId && d.status === 'missing');
  }

  // ── Intake Responses ─────────────────────────────────────────────────────

  async saveIntakeResponse(dqFileId: number, orgId: string, section: DqIntakeResponse['section'], data: Record<string, unknown>): Promise<DqIntakeResponse> {
    const response: DqIntakeResponse = {
      id: this.nextIntakeId++,
      dq_file_id: dqFileId,
      org_id: orgId,
      section,
      response_data: data,
      submitted_at: new Date().toISOString(),
    };
    this.intakeResponses.push(response);
    return response;
  }

  async getIntakeResponses(dqFileId: number): Promise<DqIntakeResponse[]> {
    return this.intakeResponses.filter((r) => r.dq_file_id === dqFileId);
  }

  // ── Audit Log ────────────────────────────────────────────────────────────

  async addAuditEntry(entry: Omit<DqAuditLogEntry, 'id' | 'created_at'>): Promise<void> {
    this.auditLog.push({
      ...entry,
      id: this.nextAuditId++,
      created_at: new Date().toISOString(),
    });
  }

  async getAuditLog(dqFileId: number): Promise<DqAuditLogEntry[]> {
    return this.auditLog.filter((e) => e.dq_file_id === dqFileId);
  }
}
