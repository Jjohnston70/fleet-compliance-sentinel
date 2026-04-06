/**
 * Opportunity API handlers
 */

import { OpportunityService } from "../services/opportunity-service.js";
import { Opportunity } from "../data/schemas.js";

export interface OpportunitiesAPI {
  createOpportunity(params: {
    title: string;
    solicitation_number: string;
    agency: string;
    response_deadline: Date;
    set_aside_type: Opportunity["set_aside_type"];
    naics_code: string;
    naics_description: string;
    description: string;
  }): Promise<Opportunity>;

  listOpportunities(filters?: {
    agency?: string;
    naics_code?: string;
    set_aside_type?: Opportunity["set_aside_type"];
    status?: Opportunity["status"];
  }): Promise<Opportunity[]>;

  getOpportunity(id: string): Promise<Opportunity | null>;

  updateOpportunity(
    id: string,
    updates: Partial<Opportunity>
  ): Promise<Opportunity>;

  getUpcomingDeadlines(daysFromNow?: number): Promise<Opportunity[]>;

  getActiveOpportunities(): Promise<Opportunity[]>;

  getPipelineValue(): Promise<number>;

  countByStatus(): Promise<Record<Opportunity["status"], number>>;
}

export function createOpportunitiesAPI(
  service: OpportunityService
): OpportunitiesAPI {
  return {
    async createOpportunity(params) {
      return service.createOpportunity(
        params.title,
        params.solicitation_number,
        params.agency,
        params.response_deadline,
        params.set_aside_type,
        params.naics_code,
        params.naics_description,
        params.description
      );
    },

    async listOpportunities(filters) {
      return service.listOpportunities(filters);
    },

    async getOpportunity(id) {
      return service.getOpportunity(id);
    },

    async updateOpportunity(id, updates) {
      return service.updateOpportunity(id, updates);
    },

    async getUpcomingDeadlines(daysFromNow) {
      return service.getUpcomingDeadlines(daysFromNow);
    },

    async getActiveOpportunities() {
      return service.getActiveOpportunities();
    },

    async getPipelineValue() {
      return service.getPipelineValue();
    },

    async countByStatus() {
      return service.countByStatus();
    },
  };
}
