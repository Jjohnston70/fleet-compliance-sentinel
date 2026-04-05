/**
 * Maturity Scoring Service - Governance-weighted compliance maturity assessment
 * Ported from compliance-gov-module maturity scoring algorithm
 */
import { GOVERNANCE_WEIGHTS, STATUS_SCORES, COMPLIANCE_SKILL_DOMAINS, } from "../config/index.js";
export class MaturityService {
    constructor(repo) {
        this.repo = repo;
    }
    /**
     * Initialize a maturity tracker for a company based on intake results
     */
    async initializeTracker(companyId, templateIds) {
        const templateStatuses = templateIds.map((t) => ({
            template_id: t.template_id,
            skill_domain: t.skill_domain,
            governance_level: t.governance_level,
            status: "not_started",
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
    async updateTemplateStatus(trackerId, templateId, status, notes) {
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
    calculateScore(templateStatuses) {
        if (templateStatuses.length === 0)
            return 0;
        let weightedScore = 0;
        let totalWeight = 0;
        for (const template of templateStatuses) {
            const weight = GOVERNANCE_WEIGHTS[template.governance_level] ||
                GOVERNANCE_WEIGHTS["SUPPORT"];
            const score = STATUS_SCORES[template.status] || 0;
            weightedScore += weight * score;
            totalWeight += weight;
        }
        if (totalWeight === 0)
            return 0;
        const maturityScore = (weightedScore / totalWeight) * 10.0;
        return Math.round(maturityScore * 100) / 100;
    }
    /**
     * Get maturity tracker for a company
     */
    async getTracker(companyId) {
        return this.repo.getMaturityTrackerByCompany(companyId);
    }
    /**
     * Get maturity score breakdown by skill domain
     */
    async getScoreBreakdown(companyId) {
        const tracker = await this.repo.getMaturityTrackerByCompany(companyId);
        if (!tracker)
            return null;
        const byDomain = COMPLIANCE_SKILL_DOMAINS.map((domain) => {
            const domainTemplates = tracker.template_statuses.filter((t) => t.skill_domain === domain.id);
            const domainScore = this.calculateScore(domainTemplates);
            const completedCount = domainTemplates.filter((t) => t.status === "implemented" || t.status === "verified").length;
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
//# sourceMappingURL=maturity-service.js.map