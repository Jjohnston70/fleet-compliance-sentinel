import { getKPISummary, getTrendData, comparePeriods, getTopProducts, getChannelBreakdown } from './services/analytics-engine';
import { importSalesData } from './services/csv-importer';
import { generateMovingAverageForecast } from './services/forecast-service';

export const tools = [
  {
    name: 'get_sales_trend',
    description: 'Get sales trend data for a date range, grouped by day/week/month',
    parameters: {
      type: 'object',
      properties: {
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        group_by: { type: 'string', enum: ['daily', 'weekly', 'monthly'], description: 'Grouping period' },
        channel: { type: 'string', description: 'Optional channel filter' },
        product_id: { type: 'string', description: 'Optional product ID filter' }
      },
      required: ['date_from', 'date_to', 'group_by']
    },
    handler: async (params: any) => {
      const trends = await getTrendData(params.date_from, params.date_to, params.group_by);
      return {
        status: 'success',
        data: trends,
        count: trends.length
      };
    }
  },
  {
    name: 'compare_periods',
    description: 'Compare sales metrics between two time periods',
    parameters: {
      type: 'object',
      properties: {
        period1_start: { type: 'string', description: 'Period 1 start date (YYYY-MM-DD)' },
        period1_end: { type: 'string', description: 'Period 1 end date (YYYY-MM-DD)' },
        period2_start: { type: 'string', description: 'Period 2 start date (YYYY-MM-DD)' },
        period2_end: { type: 'string', description: 'Period 2 end date (YYYY-MM-DD)' }
      },
      required: ['period1_start', 'period1_end', 'period2_start', 'period2_end']
    },
    handler: async (params: any) => {
      const comparison = await comparePeriods(params.period1_start, params.period1_end, params.period2_start, params.period2_end);
      return {
        status: 'success',
        data: comparison
      };
    }
  },
  {
    name: 'forecast_revenue',
    description: 'Forecast revenue for upcoming period based on historical data',
    parameters: {
      type: 'object',
      properties: {
        months_ahead: { type: 'number', description: 'Number of months to forecast ahead', default: 3 },
        product_id: { type: 'string', description: 'Optional product ID to forecast for' }
      },
      required: ['months_ahead']
    },
    handler: async (params: any) => {
      const forecasts = await generateMovingAverageForecast(params.product_id || null, params.months_ahead);
      return {
        status: 'success',
        data: forecasts,
        count: forecasts.length
      };
    }
  },
  {
    name: 'import_csv',
    description: 'Import sales data from CSV content',
    parameters: {
      type: 'object',
      properties: {
        csv_content: { type: 'string', description: 'CSV file content (raw text)' },
        has_header: { type: 'boolean', description: 'Whether CSV has header row', default: true }
      },
      required: ['csv_content']
    },
    handler: async (params: any) => {
      const result = await importSalesData(params.csv_content);
      return {
        status: result.success ? 'success' : 'error',
        rowsProcessed: result.rowsProcessed,
        rowsInserted: result.rowsInserted,
        errors: result.errors
      };
    }
  },
  {
    name: 'get_top_products',
    description: 'Get top performing products by revenue for a date range',
    parameters: {
      type: 'object',
      properties: {
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        limit: { type: 'number', description: 'Number of products to return', default: 10 }
      },
      required: ['date_from', 'date_to']
    },
    handler: async (params: any) => {
      const products = await getTopProducts(params.date_from, params.date_to, params.limit || 10);
      return {
        status: 'success',
        data: products,
        count: products.length
      };
    }
  },
  {
    name: 'get_kpi_summary',
    description: 'Get KPI dashboard data: total revenue, avg deal size, top channel, growth rate',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'monthly' },
        date: { type: 'string', description: 'End date for period (YYYY-MM-DD), defaults to today' }
      }
    },
    handler: async (params: any) => {
      const kpi = await getKPISummary(params.period || 'monthly', params.date);
      return {
        status: 'success',
        data: kpi
      };
    }
  },
  {
    name: 'get_channel_breakdown',
    description: 'Get sales breakdown by channel',
    parameters: {
      type: 'object',
      properties: {
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' }
      },
      required: ['date_from', 'date_to']
    },
    handler: async (params: any) => {
      const channels = await getChannelBreakdown(params.date_from, params.date_to);
      return {
        status: 'success',
        data: channels,
        count: channels.length
      };
    }
  }
];
