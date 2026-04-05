/**
 * Bid Decision Service - Weighted scoring engine for bid/no-bid decisions
 */
import { BID_DECISION_THRESHOLDS, MICRO_PURCHASE_THRESHOLD, SMALL_BUSINESS_THRESHOLD, } from "../config/index.js";
export class BidDecisionService {
    constructor(repo) {
        this.repo = repo;
        this.weights = {
            technicalFit: 3,
            setAsideMatch: 3,
            competitionLevel: 2,
            contractValue: 2,
            timelineFeasibility: 2,
            relationship: 1,
            strategicValue: 1,
        };
    }
    scoreContractValue(value) {
        if (!value || value === 0)
            return 40;
        if (value < MICRO_PURCHASE_THRESHOLD) {
            return Math.min(30 + (value / MICRO_PURCHASE_THRESHOLD) * 20, 50);
        }
        if (value < SMALL_BUSINESS_THRESHOLD) {
            const normalized = (value - MICRO_PURCHASE_THRESHOLD) /
                (SMALL_BUSINESS_THRESHOLD - MICRO_PURCHASE_THRESHOLD);
            return 50 + normalized * 35;
        }
        return 85;
    }
    async runBidDecision(opportunityId, input, decidedBy = "system") {
        const opp = await this.repo.getOpportunity(opportunityId);
        if (!opp) {
            throw new Error(`Opportunity ${opportunityId} not found`);
        }
        const contractValueScore = this.scoreContractValue(input.contractValue);
        const criteriaScores = [
            {
                criterion: "Technical Fit",
                score: input.technicalFit,
                weight: this.weights.technicalFit / 14,
                notes: input.technicalFit >= 70
                    ? "Strong capability match"
                    : input.technicalFit >= 40
                        ? "Moderate capability gap"
                        : "Significant capability gap",
            },
            {
                criterion: "Set-Aside Match",
                score: input.setAsideMatch,
                weight: this.weights.setAsideMatch / 14,
                notes: input.setAsideMatch >= 80
                    ? "Perfect set-aside alignment"
                    : input.setAsideMatch >= 50
                        ? "Partial set-aside eligibility"
                        : "No set-aside advantage",
            },
            {
                criterion: "Competition Level",
                score: input.competitionLevel,
                weight: this.weights.competitionLevel / 14,
                notes: input.competitionLevel >= 70
                    ? "Low competition expected"
                    : input.competitionLevel >= 40
                        ? "Moderate competition"
                        : "High competition expected",
            },
            {
                criterion: "Contract Value",
                score: contractValueScore,
                weight: this.weights.contractValue / 14,
                notes: contractValueScore >= 85
                    ? "Major contract opportunity"
                    : contractValueScore >= 70
                        ? "Substantial contract value"
                        : contractValueScore >= 50
                            ? "Moderate contract value"
                            : "Micro-purchase or low value",
            },
            {
                criterion: "Timeline Feasibility",
                score: input.timelineFeasibility,
                weight: this.weights.timelineFeasibility / 14,
                notes: input.timelineFeasibility >= 70
                    ? "Achievable timeline"
                    : input.timelineFeasibility >= 40
                        ? "Tight but feasible"
                        : "Challenging timeline",
            },
            {
                criterion: "Relationship",
                score: input.relationship,
                weight: this.weights.relationship / 14,
                notes: input.relationship >= 70
                    ? "Strong existing relationship"
                    : input.relationship >= 40
                        ? "Some existing contact"
                        : "No existing relationship",
            },
            {
                criterion: "Strategic Value",
                score: input.strategicValue,
                weight: this.weights.strategicValue / 14,
                notes: input.strategicValue >= 70
                    ? "High strategic importance"
                    : input.strategicValue >= 40
                        ? "Moderate strategic value"
                        : "Limited strategic value",
            },
        ];
        let totalScore = 0;
        for (const criterion of criteriaScores) {
            totalScore += criterion.score * criterion.weight;
        }
        const finalScore = Math.round(totalScore);
        const decision = finalScore >= BID_DECISION_THRESHOLDS.highRecommendation
            ? "bid"
            : finalScore >= BID_DECISION_THRESHOLDS.conditional
                ? finalScore >= 55
                    ? "bid"
                    : "no_bid"
                : "no_bid";
        const rationale = finalScore >= BID_DECISION_THRESHOLDS.highRecommendation
            ? `Strong recommendation to bid (score: ${finalScore}/100). Multiple criteria score well.`
            : finalScore >= BID_DECISION_THRESHOLDS.conditional
                ? `Conditional recommendation. Score: ${finalScore}/100. Evaluate based on team bandwidth and priority.`
                : `Recommendation to pass. Score: ${finalScore}/100. Significant capability or alignment gaps.`;
        const bidDecision = await this.repo.createBidDecision({
            opportunity_id: opportunityId,
            decision,
            score: finalScore,
            criteria_scores: criteriaScores,
            decided_by: decidedBy,
            rationale,
        });
        return bidDecision;
    }
    async getBidDecision(opportunityId) {
        return this.repo.getBidDecisionByOpportunity(opportunityId);
    }
    async listBidDecisions() {
        return this.repo.listBidDecisions();
    }
    async getWinRate(days = 90) {
        const decisions = await this.repo.listBidDecisions();
        const recent = decisions.filter((d) => {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - days);
            return d.decision_date >= daysAgo;
        });
        if (recent.length === 0)
            return 0;
        const bidDecisions = recent.filter((d) => d.decision === "bid");
        return bidDecisions.length / recent.length;
    }
}
//# sourceMappingURL=bid-decision-service.js.map