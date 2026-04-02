/**
 * dq-command — DQ File Service
 * Core business logic for DQ file lifecycle, checklist generation, and compliance scoring.
 */

import { InMemoryDqRepository } from '../data/repository';
import type {
  DqFile,
  DqChecklist,
  DqChecklistItem,
  DqOrgSummary,
  CreateDqFileInput,
  DqFileType,
} from '../data/schema';
import { DQ_CHECKLIST_CONFIG } from '../config/index';

export class DqFileService {
  constructor(private repo: InMemoryDqRepository) {}

  /**
   * Create a new DQ file pair (DQF + DHF) for a driver.
   * Returns the DQF record with the intake token.
   */
  async createDqFile(orgId: string, input: CreateDqFileInput): Promise<DqFile> {
    const dqf = await this.repo.createDqFile(orgId, input);

    await this.repo.addAuditEntry({
      dq_file_id: dqf.id,
      org_id: orgId,
      actor_id: 'system',
      actor_type: 'system',
      action: 'file.created',
      doc_type: null,
      metadata: { driver_id: input.driver_id, cdl_holder: input.cdl_holder },
    });

    return dqf;
  }

  /**
   * Build the full checklist view for a DQ file.
   */
  async getChecklist(dqFileId: number): Promise<DqChecklist | null> {
    const file = await this.repo.getDqFile(dqFileId);
    if (!file) return null;

    const docs = await this.repo.getDocumentsForFile(dqFileId);
    const now = new Date();

    const items: DqChecklistItem[] = docs.map((doc) => {
      let daysUntilExpiry: number | null = null;
      if (doc.expires_at) {
        const diff = new Date(doc.expires_at).getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      // Determine the appropriate action
      const cfg = DQ_CHECKLIST_CONFIG.find((c) => c.doc_type === doc.doc_type);
      let action: 'view' | 'upload' | 'generate' = 'upload';
      if (doc.status === 'uploaded' || doc.status === 'generated' || doc.status === 'verified') {
        action = 'view';
      } else if (cfg?.source === 'generated') {
        action = 'generate';
      }

      return {
        doc_type: doc.doc_type,
        doc_label: doc.doc_label,
        cfr_reference: doc.cfr_reference,
        status: doc.status,
        required_for: doc.required_for,
        cadence: doc.cadence,
        expires_at: doc.expires_at,
        days_until_expiry: daysUntilExpiry,
        action,
      };
    });

    const completedStatuses = ['uploaded', 'generated', 'verified'];
    const completedDocs = items.filter((i) => completedStatuses.includes(i.status)).length;

    return {
      dq_file_id: dqFileId,
      driver_id: file.driver_id,
      driver_name: file.driver_name,
      file_type: file.file_type,
      status: file.status,
      items,
      total_docs: items.length,
      completed_docs: completedDocs,
      completion_pct: items.length > 0 ? Math.round((completedDocs / items.length) * 100) : 0,
    };
  }

  /**
   * Get org-level DQ compliance summary.
   */
  async getOrgSummary(orgId: string): Promise<DqOrgSummary> {
    const allFiles = await this.repo.listDqFiles(orgId, 'dqf');
    const expiring = await this.repo.getExpiringDocuments(orgId, 30);

    // Deduplicate expiring docs by driver
    const driversWithExpiring = new Set(expiring.map((d) => {
      const file = allFiles.find((f) => f.id === d.dq_file_id);
      return file?.driver_id;
    }));

    return {
      org_id: orgId,
      total_drivers: allFiles.length,
      complete: allFiles.filter((f) => f.status === 'complete').length,
      incomplete: allFiles.filter((f) => f.status === 'incomplete').length,
      expired: allFiles.filter((f) => f.status === 'expired').length,
      flagged: allFiles.filter((f) => f.status === 'flagged').length,
      expiring_within_30_days: driversWithExpiring.size,
      completion_pct: allFiles.length > 0
        ? Math.round((allFiles.filter((f) => f.status === 'complete').length / allFiles.length) * 100)
        : 0,
    };
  }

  /**
   * Archive a DQ file (driver terminated).
   * Sets retention_delete_after = termination_date + 3 years per §391.51(c).
   */
  async archiveDqFile(dqFileId: number, terminationDate: string, reason?: string): Promise<void> {
    const termDate = new Date(terminationDate);
    termDate.setFullYear(termDate.getFullYear() + 3);
    const retentionDeleteAfter = termDate.toISOString();

    await this.repo.softDeleteDqFile(dqFileId, retentionDeleteAfter);

    const file = await this.repo.getDqFile(dqFileId);
    if (file) {
      await this.repo.addAuditEntry({
        dq_file_id: dqFileId,
        org_id: file.org_id,
        actor_id: 'system',
        actor_type: 'system',
        action: 'file.archived',
        doc_type: null,
        metadata: { termination_date: terminationDate, reason, retention_delete_after: retentionDeleteAfter },
      });
    }
  }
}
