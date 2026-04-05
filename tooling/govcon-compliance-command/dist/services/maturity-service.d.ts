/**
 * Maturity Scoring Service - Governance-weighted compliance maturity assessment
 * Ported from compliance-gov-module maturity scoring algorithm
 */
import { MaturityTracker } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export declare class MaturityService {
    private repo;
    constructor(repo: InMemoryRepository);
    /**
     * Initialize a maturity tracker for a company based on intake results
     */
    initializeTracker(companyId: string, templateIds: Array<{
        template_id: string;
        skill_domain: string;
        governance_level: string;
    }>): Promise<MaturityTracker>;
    /**
     * Update a single template's implementation status
     */
    updateTemplateStatus(trackerId: string, templateId: string, status: "not_started" | "in_progress" | "implemented" | "verified", notes?: string): Promise<MaturityTracker>;
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
    calculateScore(templateStatuses: Array<{
        governance_level: string;
        status: string;
    }>): number;
    /**
     * Get maturity tracker for a company
     */
    getTracker(companyId: string): Promise<MaturityTracker | null>;
    /**
     * Get maturity score breakdown by skill domain
     */
    getScoreBreakdown(companyId: string): Promise<{
        overall: number;
        byDomain: Array<{
            domain: string;
            domainName: string;
            score: number;
            templateCount: number;
            completedCount: number;
        }>;
    } | null>;
}
//# sourceMappingURL=maturity-service.d.ts.map