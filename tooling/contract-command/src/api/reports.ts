/**
 * Reports API Routes
 * GET /api/reports/summary
 * GET /api/reports/vendor-analysis
 * GET /api/reports/expiration-calendar
 * GET /api/reports/health
 */

import { ContractSummary } from '../reporting/contract-summary.js';
import { VendorAnalysis } from '../reporting/vendor-analysis.js';
import { ExpirationCalendar } from '../reporting/expiration-calendar.js';

/**
 * GET /api/reports/summary - Contract summary report
 */
export async function getSummaryReport(req?: any) {
  try {
    const summary = await ContractSummary.generate();
    const report = await ContractSummary.generateReport();
    const health = await ContractSummary.getHealthIndicators();

    return {
      status: 200,
      data: {
        summary,
        report: report.summary_text,
        health,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/reports/vendor-analysis - Vendor spending analysis
 * Query params: party_id (optional), limit (default: 10)
 */
export async function getVendorAnalysisReport(req: { query?: Record<string, any> }) {
  try {
    const report = await VendorAnalysis.generateReport();
    const concentration = await VendorAnalysis.getConcentrationAnalysis();

    const response: any = {
      ...report,
      concentration_analysis: concentration
    };

    if (req.query?.party_id) {
      const partyAnalysis = await VendorAnalysis.analyzeParty(req.query.party_id);
      response.specific_party = partyAnalysis;
    }

    return {
      status: 200,
      data: response
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/reports/expiration-calendar - Contract expiration calendar
 * Query params: months (6, 12, default: 3 for 90 days)
 */
export async function getExpirationCalendarReport(req: { query?: Record<string, any> }) {
  try {
    const months = parseInt(req.query?.months || '3');
    let calendar;

    if (months === 6) {
      calendar = await ExpirationCalendar.generate6Months();
    } else if (months === 12) {
      calendar = await ExpirationCalendar.generate12Months();
    } else {
      calendar = await ExpirationCalendar.generate90Days();
    }

    const summary = await ExpirationCalendar.getSummary();

    return {
      status: 200,
      data: {
        calendar,
        summary,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/reports/health - System health indicators
 */
export async function getHealthReport(req?: any) {
  try {
    const health = await ContractSummary.getHealthIndicators();
    const summary = await ContractSummary.generate();

    const healthStatus = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      indicators: health,
      alerts: [] as string[]
    };

    // Generate alerts based on thresholds
    if (health.contracts_requiring_attention > 5) {
      healthStatus.alerts.push(`${health.contracts_requiring_attention} contracts requiring attention`);
    }
    if (health.expired_contracts > 0) {
      healthStatus.alerts.push(`${health.expired_contracts} expired contracts`);
    }
    if (parseFloat(health.renewal_rate) < 50) {
      healthStatus.alerts.push('Low renewal rate - may indicate contract management issues');
    }

    if (healthStatus.alerts.length > 0) {
      healthStatus.status = 'warning';
    }
    if (health.expired_contracts > 10) {
      healthStatus.status = 'critical';
    }

    return {
      status: 200,
      data: {
        ...healthStatus,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/reports/concentration - Vendor concentration analysis
 */
export async function getConcentrationReport(req?: any) {
  try {
    const concentration = await VendorAnalysis.getConcentrationAnalysis();

    return {
      status: 200,
      data: {
        ...concentration,
        summary: `Top 3 vendors account for ${concentration.top_3_percent}% of spending. Risk level: ${concentration.risk_level}.`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
