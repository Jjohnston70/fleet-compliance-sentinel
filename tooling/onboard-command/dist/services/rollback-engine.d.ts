import { OnboardingRequest } from '../data/schema.js';
import { Repository } from '../data/repository.js';
import { AuditService } from './audit-service.js';
export interface RollbackEngine {
    rollbackRequest(requestId: string, reason: string): Promise<OnboardingRequest>;
}
export declare class StandardRollbackEngine implements RollbackEngine {
    private repo;
    private auditService;
    constructor(repo: Repository, auditService: AuditService);
    rollbackRequest(requestId: string, reason: string): Promise<OnboardingRequest>;
    private getReverseAction;
}
//# sourceMappingURL=rollback-engine.d.ts.map