/**
 * Compliance Service - Track certifications, registrations, and expirations
 */

import { ComplianceItem } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
import { COMPLIANCE_REMINDER_DAYS } from "../config/index.js";

export class ComplianceService {
  constructor(private repo: InMemoryRepository) {}

  async createComplianceItem(
    name: string,
    description: string,
    itemType: ComplianceItem["item_type"],
    authority: ComplianceItem["authority"],
    expirationDate: Date,
    options?: Partial<ComplianceItem>
  ): Promise<ComplianceItem> {
    return this.repo.createComplianceItem({
      name,
      description,
      item_type: itemType,
      authority,
      expiration_date: expirationDate,
      status: "current",
      reminder_days_before: 30,
      ...options,
    });
  }

  async getComplianceItem(id: string): Promise<ComplianceItem | null> {
    return this.repo.getComplianceItem(id);
  }

  async listComplianceItems(filters?: {
    authority?: ComplianceItem["authority"];
    status?: ComplianceItem["status"];
    itemType?: ComplianceItem["item_type"];
  }): Promise<ComplianceItem[]> {
    let items = await this.repo.listComplianceItems();

    if (filters) {
      if (filters.authority) {
        items = items.filter((i) => i.authority === filters.authority);
      }
      if (filters.status) {
        items = items.filter((i) => i.status === filters.status);
      }
      if (filters.itemType) {
        items = items.filter((i) => i.item_type === filters.itemType);
      }
    }

    return items;
  }

  async updateComplianceItem(
    id: string,
    updates: Partial<ComplianceItem>
  ): Promise<ComplianceItem> {
    return this.repo.updateComplianceItem(id, updates);
  }

  async markRenewed(id: string, newExpirationDate: Date): Promise<ComplianceItem> {
    return this.repo.updateComplianceItem(id, {
      status: "current",
      effective_date: new Date(),
      expiration_date: newExpirationDate,
    });
  }

  async getExpiringItems(daysThreshold: number = 90): Promise<ComplianceItem[]> {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    const items = await this.repo.listComplianceItems();
    return items.filter((item) => {
      if (!item.expiration_date) return false;
      const isExpiring =
        item.expiration_date > now && item.expiration_date <= thresholdDate;
      const isNotExpired = item.status !== "expired";
      return isExpiring && isNotExpired;
    });
  }

  async getExpiredItems(): Promise<ComplianceItem[]> {
    const now = new Date();
    const items = await this.repo.listComplianceItems();
    return items.filter((item) => {
      if (!item.expiration_date) return false;
      return item.expiration_date < now && item.status !== "expired";
    });
  }

  async getComplianceAlerts(): Promise<{
    critical: ComplianceItem[];
    warning: ComplianceItem[];
    upcoming: ComplianceItem[];
  }> {
    const expired = await this.getExpiredItems();
    const expiring7 = await this.getExpiringItems(COMPLIANCE_REMINDER_DAYS.warning7);
    const expiring30 = await this.getExpiringItems(COMPLIANCE_REMINDER_DAYS.warning30);

    const critical = expired;
    const warning = expiring7.filter((i) => !critical.find((c) => c.id === i.id));
    const upcoming = expiring30.filter(
      (i) => !critical.find((c) => c.id === i.id) && !warning.find((w) => w.id === i.id)
    );

    return { critical, warning, upcoming };
  }

  async checkAuthorityCompliance(
    authority: ComplianceItem["authority"]
  ): Promise<{
    compliant: boolean;
    items: ComplianceItem[];
    alerts: string[];
  }> {
    const items = await this.listComplianceItems({ authority });
    const alerts: string[] = [];
    let compliant = true;

    for (const item of items) {
      if (item.status === "expired") {
        compliant = false;
        alerts.push(`${item.name} has EXPIRED`);
      } else if (item.expiration_date) {
        const daysUntilExpiry = Math.floor(
          (item.expiration_date.getTime() - new Date().getTime()) /
            (24 * 60 * 60 * 1000)
        );

        if (daysUntilExpiry <= 0) {
          compliant = false;
          alerts.push(`${item.name} EXPIRED`);
        } else if (daysUntilExpiry <= 7) {
          alerts.push(`${item.name} expires in ${daysUntilExpiry} days`);
        } else if (daysUntilExpiry <= 30) {
          alerts.push(`${item.name} expires in ${daysUntilExpiry} days`);
        }
      }
    }

    return { compliant, items, alerts };
  }
}
