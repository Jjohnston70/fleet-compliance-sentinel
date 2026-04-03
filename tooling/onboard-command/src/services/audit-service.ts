import { AuditLogEntry, AuditStatus } from '../data/schema.js';
import { Repository } from '../data/repository.js';

export interface AuditService {
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
  listByRequest(requestId: string): Promise<AuditLogEntry[]>;
  listByActor(actor: string): Promise<AuditLogEntry[]>;
  listByStatus(status: AuditStatus): Promise<AuditLogEntry[]>;
}

export class StandardAuditService implements AuditService {
  constructor(private repo: Repository) {}

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    // Ensure no PII (email addresses) in the log entry
    const sanitized = this.sanitizeEntry(entry);
    return this.repo.createAuditLog(sanitized);
  }

  async listByRequest(requestId: string): Promise<AuditLogEntry[]> {
    return this.repo.listAuditLogs({ requestId });
  }

  async listByActor(actor: string): Promise<AuditLogEntry[]> {
    return this.repo.listAuditLogs({ actor });
  }

  async listByStatus(status: AuditStatus): Promise<AuditLogEntry[]> {
    return this.repo.listAuditLogs({ status: status as any });
  }

  private sanitizeEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Omit<AuditLogEntry, 'id' | 'timestamp'> {
    // Remove email addresses and other PII from details
    const details = { ...entry.details };

    // Remove common PII fields
    delete details.email;
    delete details.employee_email;
    delete details.contact_email;
    delete details.password;
    delete details.token;
    delete details.api_key;

    return {
      ...entry,
      details,
    };
  }
}
