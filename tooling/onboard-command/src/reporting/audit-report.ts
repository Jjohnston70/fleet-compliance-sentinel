import { Repository } from '../data/repository.js';
import { AuditLogEntry } from '../data/schema.js';

export interface AuditReportEntry {
  requestId?: string;
  action: string;
  actor: string;
  status: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface AuditReport {
  generatedAt: Date;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  rollbackActions: number;
  entries: AuditReportEntry[];
}

export class AuditReportGenerator {
  constructor(private repo: Repository) {}

  async generate(requestId?: string, startDate?: Date, endDate?: Date): Promise<AuditReport> {
    let logs = await this.repo.listAuditLogs(requestId ? { requestId } : undefined);

    // Filter by date range if provided
    if (startDate || endDate) {
      logs = logs.filter((log) => {
        if (startDate && log.timestamp < startDate) return false;
        if (endDate && log.timestamp > endDate) return false;
        return true;
      });
    }

    const entries: AuditReportEntry[] = logs.map((log) => ({
      requestId: log.request_id || undefined,
      action: log.action,
      actor: log.actor,
      status: log.status,
      timestamp: log.timestamp,
      details: log.details,
    }));

    const successfulActions = logs.filter((log) => log.status === 'success').length;
    const failedActions = logs.filter((log) => log.status === 'failure').length;
    const rollbackActions = logs.filter((log) => log.status === 'rollback').length;

    return {
      generatedAt: new Date(),
      totalActions: logs.length,
      successfulActions,
      failedActions,
      rollbackActions,
      entries,
    };
  }
}
