/**
 * Pipeline API handlers
 */

import { PipelineService } from "../services/pipeline-service.js";
import { Opportunity, BidDecision } from "../data/schemas.js";

export interface PipelineAPI {
  getPipelineSummary(): Promise<any>;
  getWinLossAnalysis(days?: number): Promise<{
    wins: Array<{ opportunity: Opportunity; decision?: BidDecision; value: number }>;
    losses: Array<{ opportunity: Opportunity; decision?: BidDecision; value: number }>;
    noBids: Array<{ opportunity: Opportunity; value: number }>;
  }>;
  getAverageBidValue(): Promise<number>;
}

export function createPipelineAPI(service: PipelineService): PipelineAPI {
  return {
    async getPipelineSummary() { return service.getPipelineSummary(); },
    async getWinLossAnalysis(days) { return service.getWinLossAnalysis(days); },
    async getAverageBidValue() { return service.getAverageBidValue(); },
  };
}
