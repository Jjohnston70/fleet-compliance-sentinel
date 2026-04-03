import { AuditLogEntry, AuditStatus } from '../data/schema.js';
import { Repository } from '../data/repository.js';
export interface AuditService {
    log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
    listByRequest(requestId: string): Promise<AuditLogEntry[]>;
    listByActor(actor: string): Promise<AuditLogEntry[]>;
    listByStatus(status: AuditStatus): Promise<AuditLogEntry[]>;
}
export declare class StandardAuditService implements AuditService {
    private repo;
    constructor(repo: Repository);
    log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
    listByRequest(requestId: string): Promise<AuditLogEntry[]>;
    listByActor(actor: string): Promise<AuditLogEntry[]>;
    listByStatus(status: AuditStatus): Promise<AuditLogEntry[]>;
    private sanitizeEntry;
}
//# sourceMappingURL=audit-service.d.ts.map