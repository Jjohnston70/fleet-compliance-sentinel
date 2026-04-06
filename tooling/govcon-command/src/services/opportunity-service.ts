/**
 * Opportunity Service - CRUD and search/filter operations
 * Handles deadline tracking and automatic status updates
 */

import { Opportunity } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";

export class OpportunityService {
  constructor(private repo: InMemoryRepository) {}

  /**
   * Create a new opportunity
   */
  async createOpportunity(
    title: string,
    solicitation_number: string,
    agency: string,
    response_deadline: Date,
    set_aside_type: Opportunity["set_aside_type"],
    naics_code: string,
    naics_description: string,
    description: string,
    options?: Partial<Opportunity>
  ): Promise<Opportunity> {
    return this.repo.createOpportunity({
      title,
      solicitation_number,
      agency,
      response_deadline,
      set_aside_type,
      naics_code,
      naics_description,
      description,
      posted_date: options?.posted_date || new Date(),
      status: options?.status || "identified",
      source: options?.source || "manual",
      ...options,
    });
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(id: string): Promise<Opportunity | null> {
    return this.repo.getOpportunity(id);
  }

  /**
   * List all opportunities with optional filtering
   */
  async listOpportunities(filters?: {
    agency?: string;
    naics_code?: string;
    set_aside_type?: Opportunity["set_aside_type"];
    status?: Opportunity["status"];
  }): Promise<Opportunity[]> {
    let opps = await this.repo.listOpportunities();

    if (filters) {
      if (filters.agency) {
        opps = opps.filter((o) =>
          o.agency.toLowerCase().includes(filters.agency!.toLowerCase())
        );
      }
      if (filters.naics_code) {
        opps = opps.filter((o) => o.naics_code === filters.naics_code);
      }
      if (filters.set_aside_type) {
        opps = opps.filter((o) => o.set_aside_type === filters.set_aside_type);
      }
      if (filters.status) {
        opps = opps.filter((o) => o.status === filters.status);
      }
    }

    return opps;
  }

  /**
   * Update opportunity status and metadata
   */
  async updateOpportunity(
    id: string,
    updates: Partial<Opportunity>
  ): Promise<Opportunity> {
    return this.repo.updateOpportunity(id, updates);
  }

  /**
   * Mark opportunity as bid or no-bid
   */
  async markBidDecision(
    id: string,
    decision: "bid" | "no_bid"
  ): Promise<Opportunity> {
    return this.repo.updateOpportunity(id, {
      status: decision === "bid" ? "bid" : "no_bid",
      updated_at: new Date(),
    });
  }

  /**
   * Mark opportunity as submitted
   */
  async markSubmitted(id: string): Promise<Opportunity> {
    return this.repo.updateOpportunity(id, {
      status: "submitted",
      updated_at: new Date(),
    });
  }

  /**
   * Check for expired opportunities (past deadline with no submission)
   */
  async getUpcomingDeadlines(daysFromNow: number = 7): Promise<Opportunity[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    const opps = await this.repo.listOpportunities();
    return opps.filter((o) => {
      const isActive =
        o.status !== "submitted" &&
        o.status !== "awarded" &&
        o.status !== "lost" &&
        o.status !== "no_bid";
      const isSoonDeadline =
        o.response_deadline >= now && o.response_deadline <= futureDate;
      return isActive && isSoonDeadline;
    });
  }

  /**
   * Get expired opportunities (past deadline)
   */
  async getExpiredOpportunities(): Promise<Opportunity[]> {
    const now = new Date();
    const opps = await this.repo.listOpportunities();
    return opps.filter((o) => {
      const isPastDeadline = o.response_deadline < now;
      const notResolved =
        o.status !== "submitted" &&
        o.status !== "awarded" &&
        o.status !== "lost";
      return isPastDeadline && notResolved;
    });
  }

  /**
   * Get opportunities by priority status
   */
  async getActiveOpportunities(): Promise<Opportunity[]> {
    return this.repo.listOpportunities().then((opps) =>
      opps.filter(
        (o) =>
          o.status === "identified" ||
          o.status === "evaluating" ||
          o.status === "bid"
      )
    );
  }

  /**
   * Get estimated total pipeline value
   */
  async getPipelineValue(): Promise<number> {
    const opps = await this.getActiveOpportunities();
    return opps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  }

  /**
   * Count opportunities by status
   */
  async countByStatus(): Promise<Record<Opportunity["status"], number>> {
    const opps = await this.repo.listOpportunities();
    const counts: Record<Opportunity["status"], number> = {
      identified: 0,
      evaluating: 0,
      bid: 0,
      no_bid: 0,
      submitted: 0,
      awarded: 0,
      lost: 0,
    };

    for (const opp of opps) {
      counts[opp.status]++;
    }

    return counts;
  }
}
