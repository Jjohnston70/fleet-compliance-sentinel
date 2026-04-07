import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  loadModuleRuntimeState,
  saveModuleRuntimeState,
} from '@/lib/module-runtime-state';

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
const PROPOSAL_COMMAND_MODULE_PATH = path.join(
  process.cwd(),
  'tooling',
  'proposal-command',
  'dist',
  'src',
  'index.js',
);

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
    const moduleUrl = pathToFileURL(PROPOSAL_COMMAND_MODULE_PATH).href;
    proposalModulePromise = import(/* webpackIgnore: true */ moduleUrl) as Promise<ProposalCommandModule>;
  }
  return proposalModulePromise;
}

async function serializeProposalState(repository: any): Promise<Record<string, unknown>> {
  const [proposals, clients, templates] = await Promise.all([
    repository.listProposals(),
    repository.listClients(),
    repository.listTemplates(),
  ]);
  // Line items and activities are per-proposal; collect them all
  const lineItems: unknown[] = [];
  const activities: unknown[] = [];
  for (const p of proposals) {
    const [items, acts] = await Promise.all([
      repository.listLineItems(p.id),
      repository.listActivities(p.id),
    ]);
    lineItems.push(...items);
    activities.push(...acts);
  }
  return { proposals, clients, templates, lineItems, activities };
}

async function hydrateProposalState(repository: any, state: Record<string, unknown>): Promise<void> {
  const proposals = Array.isArray(state.proposals) ? state.proposals : [];
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const templates = Array.isArray(state.templates) ? state.templates : [];
  const lineItems = Array.isArray(state.lineItems) ? state.lineItems : [];
  const activities = Array.isArray(state.activities) ? state.activities : [];

  for (const t of templates) await repository.saveTemplate(t);
  for (const c of clients) await repository.saveClient(c);
  for (const p of proposals) await repository.saveProposal(p);
  for (const li of lineItems) await repository.saveLineItem(li);
  for (const a of activities) await repository.saveActivity(a);
}

function createPersistenceProxy(orgId: string, repository: any): any {
  const mutatingMethods = new Set([
    'saveProposal', 'deleteProposal', 'saveClient', 'deleteClient',
    'saveTemplate', 'saveLineItem', 'deleteLineItem', 'saveActivity', 'clear',
  ]);
  return new Proxy(repository, {
    get(target: any, prop: string) {
      const value = target[prop];
      if (typeof value !== 'function' || !mutatingMethods.has(prop)) return value;
      return async (...args: unknown[]) => {
        const result = await value.apply(target, args);
        const snapshot = await serializeProposalState(target);
        await saveModuleRuntimeState(orgId, 'proposal-command', snapshot);
        return result;
      };
    },
  });
}

export async function getProposalRuntime(orgId: string): Promise<ProposalRuntime> {
  const existing = runtimeByOrg.get(orgId);
  if (existing) return existing;

  const moduleRef = await loadProposalCommandModule();
  const rawRepository = new moduleRef.InMemoryRepository();

  // Hydrate from Postgres if state exists
  const snapshot = await loadModuleRuntimeState(orgId, 'proposal-command');
  if (snapshot) {
    await hydrateProposalState(rawRepository, snapshot);
  }

  // Always ensure default templates exist
  const templates = [...moduleRef.DEFAULT_TEMPLATES];
  const existingTemplates = await rawRepository.listTemplates();
  const existingTemplateIds = new Set(existingTemplates.map((t: any) => t.id));
  for (const template of templates) {
    if (!existingTemplateIds.has(template.id)) {
      await rawRepository.saveTemplate(template);
    }
  }

  const repository = createPersistenceProxy(orgId, rawRepository);
  const proposalService = new moduleRef.ProposalService(repository);
  const clientService = new moduleRef.ClientService(repository);
  const pricingService = new moduleRef.PricingService(repository);
  const emailService = new moduleRef.EmailService();

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
