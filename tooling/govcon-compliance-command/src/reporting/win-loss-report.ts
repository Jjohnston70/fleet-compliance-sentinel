/**
 * Win-Loss Report - Analysis of won, lost, and skipped opportunities
 */

import { PipelineService } from "../services/pipeline-service.js";

export interface WinLossReport {
  totalBidsSubmitted: number;
  totalWins: number;
  totalLosses: number;
  totalNoBids: number;
  winRate: number;
  totalWonValue: number;
  totalBidValue: number;
  averageWinValue: number;
  winsByAgency: Record<string, { wins: number; losses: number }>;
  winsByNAICS: Record<string, { wins: number; losses: number }>;
  periodAnalysis: { period: string; wins: number; losses: number; winRate: number }[];
}

export class WinLossReportGenerator {
  constructor(private pipelineService: PipelineService) {}

  async generateReport(days: number = 180): Promise<WinLossReport> {
    const { wins, losses, noBids } = await this.pipelineService.getWinLossAnalysis(days);

    const totalWins = wins.length;
    const totalLosses = losses.length;
    const totalNoBids = noBids.length;
    const totalBidsSubmitted = totalWins + totalLosses;
    const winRate = totalBidsSubmitted > 0 ? totalWins / totalBidsSubmitted : 0;

    const totalWonValue = wins.reduce((sum, w) => sum + w.value, 0);
    const totalBidValue = wins.reduce((sum, w) => sum + w.value, 0) + losses.reduce((sum, l) => sum + l.value, 0);
    const averageWinValue = totalWins > 0 ? totalWonValue / totalWins : 0;

    const winsByAgency: Record<string, { wins: number; losses: number }> = {};
    for (const win of wins) {
      if (!winsByAgency[win.opportunity.agency]) winsByAgency[win.opportunity.agency] = { wins: 0, losses: 0 };
      winsByAgency[win.opportunity.agency].wins++;
    }
    for (const loss of losses) {
      if (!winsByAgency[loss.opportunity.agency]) winsByAgency[loss.opportunity.agency] = { wins: 0, losses: 0 };
      winsByAgency[loss.opportunity.agency].losses++;
    }

    const winsByNAICS: Record<string, { wins: number; losses: number }> = {};
    for (const win of wins) {
      const code = win.opportunity.naics_code;
      if (!winsByNAICS[code]) winsByNAICS[code] = { wins: 0, losses: 0 };
      winsByNAICS[code].wins++;
    }
    for (const loss of losses) {
      const code = loss.opportunity.naics_code;
      if (!winsByNAICS[code]) winsByNAICS[code] = { wins: 0, losses: 0 };
      winsByNAICS[code].losses++;
    }

    return { totalBidsSubmitted, totalWins, totalLosses, totalNoBids, winRate, totalWonValue, totalBidValue, averageWinValue, winsByAgency, winsByNAICS, periodAnalysis: [] };
  }

  async analyzeLossReasons(days: number = 180): Promise<{ commonPatterns: string[]; byAgency: Record<string, number>; bySetAside: Record<string, number> }> {
    const { losses } = await this.pipelineService.getWinLossAnalysis(days);
    const byAgency: Record<string, number> = {};
    const bySetAside: Record<string, number> = {};
    for (const loss of losses) {
      byAgency[loss.opportunity.agency] = (byAgency[loss.opportunity.agency] || 0) + 1;
      bySetAside[loss.opportunity.set_aside_type] = (bySetAside[loss.opportunity.set_aside_type] || 0) + 1;
    }
    return {
      commonPatterns: ["Submitted but outcompeted on technical approach", "Missed opportunity identification window", "Unable to meet aggressive timeline", "Lacked specific past performance"],
      byAgency,
      bySetAside,
    };
  }
}
