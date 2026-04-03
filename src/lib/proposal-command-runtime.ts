interface ProposalCommandModule {
  InMemoryRepository: new () => any;
  ProposalService: new (repository: any) => any;
  ClientService: new (repository: any) => any;
  PricingService: new (repository: any) => any;
  EmailService: new () => any;
  PDFGenerator: any;
  DEFAULT_TEMPLATES: any[];
}

export type ProposalStatus =
  | 'draft'
  | 'generated'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired';

export interface ProposalLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'Development' | 'Design' | 'Consulting' | 'Training' | 'Support' | 'Other';
}

interface ProposalRuntime {
  repository: any;
  proposalService: any;
  clientService: any;
  pricingService: any;
  emailService: any;
  pdfGenerator: any;
  templates: any[];
}

let proposalModulePromise: Promise<ProposalCommandModule> | null = null;
const runtimeByOrg = new Map<string, ProposalRuntime>();

function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function toIsoString(value: unknown): string | null {
  const parsed = normalizeDate(value);
  return parsed ? parsed.toISOString() : null;
}

export function normalizeLineItemCategory(
  value: unknown,
): ProposalLineItemInput['category'] {
  const normalized = String(value ?? '').trim();
  if (normalized === 'Development') return 'Development';
  if (normalized === 'Design') return 'Design';
  if (normalized === 'Consulting') return 'Consulting';
  if (normalized === 'Training') return 'Training';
  if (normalized === 'Support') return 'Support';
  return 'Other';
}

export function normalizeProposalStatus(value: unknown): ProposalStatus | null {
  const status = String(value ?? '').trim();
  if (
    status === 'draft' ||
    status === 'generated' ||
    status === 'sent' ||
    status === 'viewed' ||
    status === 'accepted' ||
    status === 'declined' ||
    status === 'expired'
  ) {
    return status;
  }
  return null;
}

async function loadProposalCommandModule(): Promise<ProposalCommandModule> {
  if (!proposalModulePromise) {
    proposalModulePromise = import('../../tooling/proposal-command/dist/src/index.js') as Promise<ProposalCommandModule>;
  }
  return proposalModulePromise;
}

export async function getProposalRuntime(orgId: string): Promise<ProposalRuntime> {
  const existing = runtimeByOrg.get(orgId);
  if (existing) return existing;

  const moduleRef = await loadProposalCommandModule();
  const repository = new moduleRef.InMemoryRepository();
  const proposalService = new moduleRef.ProposalService(repository);
  const clientService = new moduleRef.ClientService(repository);
  const pricingService = new moduleRef.PricingService(repository);
  const emailService = new moduleRef.EmailService();

  const templates = [...moduleRef.DEFAULT_TEMPLATES];
  for (const template of templates) {
    await repository.saveTemplate(template);
  }

  const runtime: ProposalRuntime = {
    repository,
    proposalService,
    clientService,
    pricingService,
    emailService,
    pdfGenerator: moduleRef.PDFGenerator,
    templates,
  };
  runtimeByOrg.set(orgId, runtime);

  return runtime;
}

export async function getProposalTemplateByServiceType(
  orgId: string,
  serviceType: string,
): Promise<any | undefined> {
  const runtime = await getProposalRuntime(orgId);
  return runtime.templates.find((template) => template.serviceType === serviceType);
}

export async function getProposalTemplateById(
  orgId: string,
  templateId: string,
): Promise<any | undefined> {
  const runtime = await getProposalRuntime(orgId);
  return runtime.templates.find((template) => template.id === templateId);
}
