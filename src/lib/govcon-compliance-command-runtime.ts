type GovConToolName =
  | 'search_opportunities'
  | 'run_bid_decision'
  | 'get_pipeline_status'
  | 'log_outreach_activity'
  | 'check_compliance_status'
  | 'get_upcoming_deadlines'
  | 'create_opportunity'
  | 'get_win_loss_report'
  | 'list_contacts'
  | 'get_bid_recommendation'
  | 'submit_company_info'
  | 'generate_compliance_package'
  | 'generate_all_compliance_packages'
  | 'get_package_status'
  | 'run_intake_wizard'
  | 'get_maturity_score'
  | 'update_template_status'
  | 'generate_bid_document'
  | 'generate_full_bid_package'
  | 'list_bid_documents';

type ToolHandler = (params: Record<string, unknown>) => Promise<unknown>;

interface GovConToolDefinition {
  name: string;
  handler: ToolHandler;
}

interface GovConCommandModuleShape {
  tools?: GovConToolDefinition[];
  default?: {
    tools?: GovConToolDefinition[];
  };
}

let govconModulePromise: Promise<GovConCommandModuleShape> | null = null;

function extractTools(moduleRef: GovConCommandModuleShape): GovConToolDefinition[] {
  if (Array.isArray(moduleRef.tools)) return moduleRef.tools;
  if (Array.isArray(moduleRef.default?.tools)) return moduleRef.default.tools;
  return [];
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function loadGovConCommandModule(): Promise<GovConCommandModuleShape> {
  if (!govconModulePromise) {
    govconModulePromise = import('../../tooling/govcon-compliance-command/dist/tools.js') as Promise<GovConCommandModuleShape>;
  }
  return govconModulePromise;
}

export async function runGovConCommandTool<T>(
  toolName: GovConToolName,
  params: Record<string, unknown> = {},
): Promise<T> {
  const moduleRef = await loadGovConCommandModule();
  const tools = extractTools(moduleRef);
  const tool = tools.find((entry) => entry.name === toolName);

  if (!tool) {
    throw new Error(`govcon-compliance-command tool "${toolName}" is not available`);
  }

  try {
    const result = await tool.handler(params);
    return result as T;
  } catch (error) {
    throw new Error(`govcon-compliance-command tool "${toolName}" failed: ${toErrorMessage(error)}`);
  }
}
