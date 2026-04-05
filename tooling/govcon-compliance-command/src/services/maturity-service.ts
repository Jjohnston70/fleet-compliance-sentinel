/**
 * Maturity Scoring Service - Governance-weighted compliance maturity assessment
 * Ported from compliance-gov-module maturity scoring algorithm
 */

import { MaturityTracker } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
import {
  GOVERNANCE_WEIGHTS,
  STATUS_SCORES,
  COMPLIANCE_SKILL_DOMAINS,
} from "../config/index.js";

export class MaturityService {
  constructor(private repo: InMemoryRepository) {}

  /**
   * Initialize a maturity tracker for a company based on intake results
   */
  async initializeTracker(
    companyId: string,
    templateIds: Array<{
      template_id: string;
      skill_domain: string;
      governance_level: string;
    }>
  ): Promise<MaturityTracker> {
    const templateStatuses = templateIds.map((t) => ({
      template_id: t.template_id,
      skill_domain: t.skill_domain,
      governance_level: t.governance_level,
      status: "not_started" as const,
      updated_at: new Date(),
    }));

    return this.repo.createMaturityTracker({
      company_id: companyId,
      template_statuses: templateStatuses,
      overall_score: 0,
    });
  }

  /**
   * Update a single template's implementation status
   */
  async updateTemplateStatus(
    trackerId: string,
    templateId: string,
    status: "not_started" | "in_progress" | "implemented" | "verified",
    notes?: string
  ): Promise<MaturityTracker> {
    const tracker = await this.repo.getMaturityTracker(trackerId);
    if (!tracker) {
      throw new Error(`Maturity tracker ${trackerId} not found`);
    }

    const updatedStatuses = tracker.template_statuses.map((t) => {
      if (t.template_id === templateId) {
        return { ...t, status, notes: notes || t.notes, updated_at: new Date() };
      }
      return t;
    });

    // Recalculate score after status update
    const newScore = this.calculateScore(updatedStatuses);

    return this.repo.updateMaturityTracker(trackerId, {
      template_statuses: updatedStatuses,
      overall_score: newScore,
      last_scored_at: new Date(),
    });
  }

  /**
   * Calculate governance-weighted maturity score (0-10)
   *
   * Algorithm:
   * For each template:
   *   weight = GOVERNANCE_WEIGHTS[governance_level]
   *   score = STATUS_SCORES[status]
   *   weighted_score += weight * score
   *
   * maturity_score = (weighted_score / total_weight) * 10.0
   */
  calculateScore(
    templateStatuses: Array<{
      governance_level: string;
      status: string;
    }>
  ): number {
    if (templateStatuses.length === 0) return 0;

    let weightedScore = 0;
    let totalWeight = 0;

    for (const template of templateStatuses) {
      const weight =
        GOVERNANCE_WEIGHTS[template.governance_level] ||
        GOVERNANCE_WEIGHTS["SUPPORT"];
      const score = STATUS_SCORES[template.status] || 0;

      weightedScore += weight * score;
      totalWeight += weight;
    }

    if (totalWeight === 0) return 0;

    const maturityScore = (weightedScore / totalWeight) * 10.0;
    return Math.round(maturityScore * 100) / 100;
  }

  /**
   * Get maturity tracker for a company
   */
  async getTracker(companyId: string): Promise<MaturityTracker | null> {
    return this.repo.getMaturityTrackerByCompany(companyId);
  }

  /**
   * Get maturity score breakdown by skill domain
   */
  async getScoreBreakdown(
    companyId: string
  ): Promise<{
    overall: number;
    byDomain: Array<{
      domain: string;
      domainName: string;
      score: number;
      templateCount: number;
      completedCount: number;
    }>;
  } | null> {
    const tracker = await this.repo.getMaturityTrackerByCompany(companyId);
    if (!tracker) return null;

    const byDomain = COMPLIANCE_SKILL_DOMAINS.map((domain) => {
      const domainTemplates = tracker.template_statuses.filter(
        (t) => t.skill_domain === domain.id
      );

      const domainScore = this.calculateScore(domainTemplates);
      const completedCount = domainTemplates.filter(
        (t) => t.status === "implemented" || t.status === "verified"
      ).length;

      return {
        domain: domain.id,
        domainName: domain.name,
        score: domainScore,
        templateCount: domainTemplates.length,
        completedCount,
      };
    }).filter((d) => d.templateCount > 0);

    return {
      overall: tracker.overall_score,
      byDomain,
    };
  }
}
