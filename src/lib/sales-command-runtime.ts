type SalesToolName =
  | 'get_sales_trend'
  | 'compare_periods'
  | 'forecast_revenue'
  | 'import_csv'
  | 'get_top_products'
  | 'get_kpi_summary'
  | 'get_channel_breakdown';

type ToolHandler = (params: Record<string, unknown>) => Promise<unknown>;

interface SalesToolDefinition {
  name: string;
  handler: ToolHandler;
}

interface SalesCommandModuleShape {
  tools?: SalesToolDefinition[];
  default?: {
    tools?: SalesToolDefinition[];
  };
}

let salesModulePromise: Promise<SalesCommandModuleShape> | null = null;

function extractTools(moduleRef: SalesCommandModuleShape): SalesToolDefinition[] {
  if (Array.isArray(moduleRef.tools)) return moduleRef.tools;
  if (Array.isArray(moduleRef.default?.tools)) return moduleRef.default.tools;
  return [];
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function loadSalesCommandModule(): Promise<SalesCommandModuleShape> {
  if (!salesModulePromise) {
    salesModulePromise = import('../../tooling/sales-command/dist/tools.js') as Promise<SalesCommandModuleShape>;
  }
  return salesModulePromise;
}

export async function runSalesCommandTool<T>(
  toolName: SalesToolName,
  params: Record<string, unknown> = {},
): Promise<T> {
  const moduleRef = await loadSalesCommandModule();
  const tools = extractTools(moduleRef);
  const tool = tools.find((entry) => entry.name === toolName);

  if (!tool) {
    throw new Error(`sales-command tool "${toolName}" is not available`);
  }

  try {
    const result = await tool.handler(params);
    return result as T;
  } catch (error) {
    throw new Error(`sales-command tool "${toolName}" failed: ${toErrorMessage(error)}`);
  }
}
