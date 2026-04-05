/**
 * Compliance Monitor Hook - Check for approaching expirations
 */

import { ComplianceService } from "../services/compliance-service.js";
import { ComplianceItem } from "../data/schemas.js";

export interface ComplianceAlert {
  itemId: string;
  name: string;
  expirationDate: Date;
  daysRemaining: number;
  severity: "critical" | "warning" | "upcoming";
}

export class ComplianceMonitor {
  constructor(private complianceService: ComplianceService) {}

  async checkCompliance(): Promise<ComplianceAlert[]> {
    const { critical, warning, upcoming } = await this.complianceService.getComplianceAlerts();
    const alerts: ComplianceAlert[] = [];

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

  async checkAuthorityStatus(authority: ComplianceItem["authority"]): Promise<{ compliant: boolean; alerts: string[] }> {
    return this.complianceService.checkAuthorityCompliance(authority);
  }
}
