/**
 * dq-command — DQ Compliance Sweep
 * Daily cron hook that flags expiring/missing docs and creates suspense items.
 */

import { InMemoryDqRepository } from '../data/repository';
import type { DqSuspenseItem, DqDocument } from '../data/schema';
import { EXPIRY_THRESHOLDS, DQF_COMPLETION_DEADLINE_DAYS } from '../config/index';

export interface SweepResult {
  org_id: string;
  suspense_items_created: number;
  expired_docs_flagged: number;
  missing_docs_flagged: number;
  incomplete_files_flagged: number;
  dry_run: boolean;
  items: DqSuspenseItem[];
}

export class DqComplianceSweep {
  constructor(private repo: InMemoryDqRepository) {}

  /**
   * Run the compliance sweep for an org.
   * Creates suspense items for missing/expiring/overdue documents.
   */
  async run(orgId: string, dryRun = false): Promise<SweepResult> {
    const items: DqSuspenseItem[] = [];
    const now = new Date();

    // 1. Flag expiring documents at each threshold
    for (const [severity, days] of Object.entries(EXPIRY_THRESHOLDS)) {
      const expiring = await this.repo.getExpiringDocuments(orgId, days);
      for (const doc of expiring) {
        const file = await this.repo.getDqFile(doc.dq_file_id);
        if (!file) continue;

        const daysUntil = doc.expires_at
          ? Math.ceil((new Date(doc.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const isOverdue = daysUntil <= 0;

        items.push({
          collection: 'suspense_items',
          org_id: orgId,
          data: {
            title: isOverdue
              ? `DQ Doc Expired -- ${file.driver_name}`
              : `DQ Doc Expiring (${daysUntil}d) -- ${file.driver_name}`,
            description: `${doc.doc_label} (${doc.cfr_reference ?? 'N/A'})`,
            severity: this.mapSeverity(severity),
            due_date: doc.expires_at ?? now.toISOString(),
            owner: null,
            source: 'dq-command',
            source_id: doc.dq_file_id,
            cfr_reference: doc.cfr_reference ?? '49 CFR §391.51',
          },
        });
      }
    }

    // 2. Flag missing documents for files older than 30 days
    const allFiles = await this.repo.listDqFiles(orgId, 'dqf');
    for (const file of allFiles) {
      const fileAge = Math.ceil((now.getTime() - new Date(file.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (fileAge <= DQF_COMPLETION_DEADLINE_DAYS) continue;

      const docs = await this.repo.getDocumentsForFile(file.id);
      const missing = docs.filter((d) => d.status === 'missing' && d.required_for !== 'conditional');

      if (missing.length > 0) {
        const missingLabels = missing.map((d) => d.doc_label).join(', ');
        items.push({
          collection: 'suspense_items',
          org_id: orgId,
          data: {
            title: `DQ File Incomplete -- ${file.driver_name}`,
            description: `Missing: ${missingLabels}`,
            severity: 'high',
            due_date: new Date(new Date(file.created_at).getTime() + DQF_COMPLETION_DEADLINE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            owner: null,
            source: 'dq-command',
            source_id: file.id,
            cfr_reference: '49 CFR §391.51',
          },
        });
      }
    }

    // Deduplicate by source_id + title pattern
    const deduped = this.deduplicateItems(items);

    if (!dryRun) {
      for (const item of deduped) {
        // In production, this writes to the suspense_items collection
        await this.repo.addAuditEntry({
          dq_file_id: item.data.source_id,
          org_id: orgId,
          actor_id: 'system',
          actor_type: 'system',
          action: 'suspense.created',
          doc_type: null,
          metadata: { title: item.data.title, severity: item.data.severity },
        });
      }
    }

    return {
      org_id: orgId,
      suspense_items_created: deduped.length,
      expired_docs_flagged: deduped.filter((i) => i.data.title.includes('Expired')).length,
      missing_docs_flagged: deduped.filter((i) => i.data.title.includes('Missing')).length,
      incomplete_files_flagged: deduped.filter((i) => i.data.title.includes('Incomplete')).length,
      dry_run: dryRun,
      items: deduped,
    };
  }

  private mapSeverity(threshold: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (threshold) {
      case 'WARNING':  return 'medium';
      case 'HIGH':     return 'high';
      case 'CRITICAL': return 'critical';
      case 'OVERDUE':  return 'critical';
      default:         return 'medium';
    }
  }

  private deduplicateItems(items: DqSuspenseItem[]): DqSuspenseItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.data.source_id}:${item.data.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
