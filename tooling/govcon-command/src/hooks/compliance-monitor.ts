/**
 * Compliance Monitor Hook - Check for approaching expirations
 */

import { ComplianceService } from "../services/compliance-service.js";
import { ComplianceItem } from "../data/schemas.js";
import { COMPLIANCE_REMINDER_DAYS } from "../config/index.js";

export interface ComplianceAlert {
  itemId: string;
  name: string;
  expirationDate: Date;
  daysRemaining: number;
  severity: "critical" | "warning" | "upcoming";
}

export class ComplianceMonitor {
  constructor(private complianceService: ComplianceService) {}

  /**
   * Check for compliance alerts
   */
  async checkCompliance(): Promise<ComplianceAlert[]> {
    const { critical, warning, upcoming } =
      await this.complianceService.getComplianceAlerts();

    const alerts: ComplianceAlert[] = [];

    // Critical (expired)
    for (const item of critical) {
      if (item.expiration_date) {
        alerts.push({
          itemId: item.id,
          name: item.name,
          expirationDate: item.expiration_date,
          daysRemaining: Math.ceil(
            (item.expiration_date.getTime() - new Date().getTime()) /
              (24 * 60 * 60 * 1000)
          ),
          severity: "critical",
        });
      }
    }

    // Warning (7 days or less)
    for (const item of warning) {
      if (item.expiration_date) {
        alerts.push({
          itemId: item.id,
          name: item.name,
          expirationDate: item.expiration_date,
          daysRemaining: Math.ceil(
            (item.expiration_date.getTime() - new Date().getTime()) /
              (24 * 60 * 60 * 1000)
          ),
          severity: "warning",
        });
      }
    }

    // Upcoming (30 days or less)
    for (const item of upcoming) {
      if (item.expiration_date) {
        alerts.push({
          itemId: item.id,
          name: item.name,
          expirationDate: item.expiration_date,
          daysRemaining: Math.ceil(
            (item.expiration_date.getTime() - new Date().getTime()) /
              (24 * 60 * 60 * 1000)
          ),
          severity: "upcoming",
        });
      }
    }

    // Sort by days remaining (most urgent first)
    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Check compliance for specific authority (SAM, SBA, etc.)
   */
  async checkAuthorityStatus(
    authority: ComplianceItem["authority"]
  ): Promise<{
    compliant: boolean;
    alerts: string[];
  }> {
    return this.complianceService.checkAuthorityCompliance(authority);
  }
}
