/**
 * Compliance API handlers
 */

import { ComplianceService } from "../services/compliance-service.js";
import { ComplianceItem } from "../data/schemas.js";

export interface ComplianceAPI {
  listComplianceItems(filters?: {
    authority?: ComplianceItem["authority"];
    status?: ComplianceItem["status"];
  }): Promise<ComplianceItem[]>;

  getComplianceItem(id: string): Promise<ComplianceItem | null>;

  updateComplianceItem(
    id: string,
    updates: Partial<ComplianceItem>
  ): Promise<ComplianceItem>;

  markRenewed(id: string, newExpirationDate: Date): Promise<ComplianceItem>;

  getExpiringItems(daysThreshold?: number): Promise<ComplianceItem[]>;

  getComplianceAlerts(): Promise<{
    critical: ComplianceItem[];
    warning: ComplianceItem[];
    upcoming: ComplianceItem[];
  }>;

  checkAuthorityCompliance(
    authority: ComplianceItem["authority"]
  ): Promise<{
    compliant: boolean;
    items: ComplianceItem[];
    alerts: string[];
  }>;
}

export function createComplianceAPI(service: ComplianceService): ComplianceAPI {
  return {
    async listComplianceItems(filters) {
      return service.listComplianceItems(filters);
    },

    async getComplianceItem(id) {
      return service.getComplianceItem(id);
    },

    async updateComplianceItem(id, updates) {
      return service.updateComplianceItem(id, updates);
    },

    async markRenewed(id, newExpirationDate) {
      return service.markRenewed(id, newExpirationDate);
    },

    async getExpiringItems(daysThreshold) {
      return service.getExpiringItems(daysThreshold);
    },

    async getComplianceAlerts() {
      return service.getComplianceAlerts();
    },

    async checkAuthorityCompliance(authority) {
      return service.checkAuthorityCompliance(authority);
    },
  };
}
