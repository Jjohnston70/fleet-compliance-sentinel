/**
 * Intake Wizard Service - Maps business profile to recommended compliance skills
 * Ported from compliance-gov-module intake logic
 */
import { IntakeResult } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export declare class IntakeService {
    private repo;
    constructor(repo: InMemoryRepository);
    /**
     * Run the intake wizard for a company
     * Analyzes business profile and recommends compliance skill domains
     */
    runIntake(companyId: string): Promise<IntakeResult>;
    /**
     * Get previous intake result for a company
     */
    getIntakeResult(companyId: string): Promise<IntakeResult | null>;
}
//# sourceMappingURL=intake-service.d.ts.map