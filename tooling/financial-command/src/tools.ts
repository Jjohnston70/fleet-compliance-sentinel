import { z } from 'zod';

// Tool handler type
export type ToolHandler = (params: Record<string, unknown>) => Promise<Record<string, unknown>>;

// Define tool schemas with OpenAI function-calling schema compatibility
export const toolDefinitions = {
  categorize_transaction: {
    name: 'categorize_transaction',
    description: 'Automatically categorize a transaction by description',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Transaction description to categorize',
        },
      },
      required: ['description'],
    },
  },

  get_tax_summary: {
    name: 'get_tax_summary',
    description: 'Get annual tax summary for a given year and entity',
    parameters: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: 'Tax year (e.g., 2024)',
        },
        entity: {
          type: 'string',
          description: 'Entity type (personal, business, or entity name)',
        },
      },
      required: ['year', 'entity'],
    },
  },

  import_bank_csv: {
    name: 'import_bank_csv',
    description: 'Import transactions from USAA CSV format',
    parameters: {
      type: 'object',
      properties: {
        csv: {
          type: 'string',
          description: 'CSV content with Date,Description,Amount,Balance columns',
        },
        accountId: {
          type: 'string',
          description: 'Account ID to import into',
        },
        entity: {
          type: 'string',
          description: 'Entity (personal or business)',
        },
      },
      required: ['csv', 'accountId', 'entity'],
    },
  },

  get_dashboard_data: {
    name: 'get_dashboard_data',
    description: 'Get dashboard summary for a given month',
    parameters: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: 'Year (e.g., 2024)',
        },
        month: {
          type: 'number',
          description: 'Month (1-12)',
        },
        entity: {
          type: 'string',
          description: 'Optional entity filter (personal or business)',
        },
      },
      required: ['year', 'month'],
    },
  },

  get_budget_variance: {
    name: 'get_budget_variance',
    description: 'Get budget variance report for a given month',
    parameters: {
      type: 'object',
      properties: {
        month: {
          type: 'string',
          description: 'Month in YYYY-MM format',
        },
      },
      required: ['month'],
    },
  },

  create_transaction: {
    name: 'create_transaction',
    description: 'Create a new financial transaction',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Transaction date (ISO 8601)',
        },
        description: {
          type: 'string',
          description: 'Transaction description',
        },
        amount: {
          type: 'number',
          description: 'Amount in dollars (can be negative for expenses)',
        },
        categoryId: {
          type: 'string',
          description: 'Category ID',
        },
        accountId: {
          type: 'string',
          description: 'Account ID',
        },
        entity: {
          type: 'string',
          description: 'Entity (personal or business)',
        },
      },
      required: ['date', 'description', 'amount', 'categoryId', 'accountId', 'entity'],
    },
  },

  list_transactions: {
    name: 'list_transactions',
    description: 'List transactions with optional filters',
    parameters: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'string',
          description: 'Optional category filter',
        },
        accountId: {
          type: 'string',
          description: 'Optional account filter',
        },
        entity: {
          type: 'string',
          description: 'Optional entity filter',
        },
        startDate: {
          type: 'string',
          description: 'Start date (ISO 8601)',
        },
        endDate: {
          type: 'string',
          description: 'End date (ISO 8601)',
        },
      },
      required: [],
    },
  },

  get_account_balances: {
    name: 'get_account_balances',
    description: 'Get current account balances',
    parameters: {
      type: 'object',
      properties: {
        entity: {
          type: 'string',
          description: 'Optional entity filter',
        },
      },
      required: [],
    },
  },

  process_recurring_payments: {
    name: 'process_recurring_payments',
    description: 'Process due recurring payments and create transactions',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

export type ToolName = keyof typeof toolDefinitions;

export const toolHandlers: Record<ToolName, ToolHandler> = {
  categorize_transaction: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  get_tax_summary: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  import_bank_csv: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  get_dashboard_data: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  get_budget_variance: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  create_transaction: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  list_transactions: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  get_account_balances: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },

  process_recurring_payments: async (params) => {
    return {
      success: true,
      message: 'Tool handler placeholder',
    };
  },
};

export const tools = Object.values(toolDefinitions);
