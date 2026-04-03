export class StandardAuditService {
    constructor(repo) {
        this.repo = repo;
    }
    async log(entry) {
        // Ensure no PII (email addresses) in the log entry
        const sanitized = this.sanitizeEntry(entry);
        return this.repo.createAuditLog(sanitized);
    }
    async listByRequest(requestId) {
        return this.repo.listAuditLogs({ requestId });
    }
    async listByActor(actor) {
        return this.repo.listAuditLogs({ actor });
    }
    async listByStatus(status) {
        return this.repo.listAuditLogs({ status: status });
    }
    sanitizeEntry(entry) {
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
