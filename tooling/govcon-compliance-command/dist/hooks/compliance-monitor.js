/**
 * Compliance Monitor Hook - Check for approaching expirations
 */
export class ComplianceMonitor {
    constructor(complianceService) {
        this.complianceService = complianceService;
    }
    async checkCompliance() {
        const { critical, warning, upcoming } = await this.complianceService.getComplianceAlerts();
        const alerts = [];
        for (const item of critical) {
            if (item.expiration_date) {
                alerts.push({
                    itemId: item.id, name: item.name, expirationDate: item.expiration_date,
                    daysRemaining: Math.ceil((item.expiration_date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)),
                    severity: "critical",
                });
            }
        }
        for (const item of warning) {
            if (item.expiration_date) {
                alerts.push({
                    itemId: item.id, name: item.name, expirationDate: item.expiration_date,
                    daysRemaining: Math.ceil((item.expiration_date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)),
                    severity: "warning",
                });
            }
        }
        for (const item of upcoming) {
            if (item.expiration_date) {
                alerts.push({
                    itemId: item.id, name: item.name, expirationDate: item.expiration_date,
                    daysRemaining: Math.ceil((item.expiration_date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)),
                    severity: "upcoming",
                });
            }
        }
        return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }
    async checkAuthorityStatus(authority) {
        return this.complianceService.checkAuthorityCompliance(authority);
    }
}
//# sourceMappingURL=compliance-monitor.js.map