import {
  loadModuleRuntimeState,
  saveModuleRuntimeState,
} from '@/lib/module-runtime-state';

interface GovConCommandModule {
  InMemoryRepository: new () => any;
  OpportunityService: new (repository: any) => any;
  BidDecisionService: new (repository: any) => any;
  OutreachService: new (repository: any) => any;
  ComplianceService: new (repository: any) => any;
  PipelineService: new (repository: any) => any;
  CompliancePackageService: new (repository: any) => any;
  IntakeService: new (repository: any) => any;
  MaturityService: new (repository: any) => any;
  BidDocumentService: new (repository: any) => any;
  DeadlineMonitor: new (opportunityService: any) => any;
  ComplianceMonitor: new (complianceService: any) => any;
  PipelineDashboard: new (opportunityService: any, pipelineService: any) => any;
  WinLossReportGenerator: new (pipelineService: any) => any;
  OutreachReport: new (outreachService: any) => any;
  generateDocumentOutputs: (
    title: string,
    slug: string,
    content: string,
    formats?: ('docx' | 'pdf' | 'markdown')[],
  ) => Promise<Array<{
    filename: string;
    format: 'docx' | 'pdf' | 'markdown';
    content: Buffer | string;
    mimeType: string;
  }>>;
}

export interface GovConRuntime {
  repo: any;
  opportunityService: any;
  bidDecisionService: any;
  outreachService: any;
  complianceService: any;
  pipelineService: any;
  packageService: any;
  intakeService: any;
  maturityService: any;
  bidDocumentService: any;
  deadlineMonitor: any;
  complianceMonitor: any;
  dashboard: any;
  winLossReport: any;
  outreachReport: any;
}

export type OpportunityStatus =
  | 'identified'
  | 'evaluating'
  | 'bid'
  | 'no_bid'
  | 'submitted'
  | 'awarded'
  | 'lost';

export type SetAsideType =
  | 'SDVOSB'
  | 'VOSB'
  | '8a'
  | 'HUBZone'
  | 'WOSB'
  | 'small_business'
  | 'full_open'
  | 'sole_source';

let govConModulePromise: Promise<GovConCommandModule> | null = null;
const runtimeByOrg = new Map<string, GovConRuntime>();

const GOVCON_MUTATING_REPOSITORY_METHODS = new Set([
  'createOpportunity',
  'updateOpportunity',
  'deleteOpportunity',
  'createBidDecision',
  'createProposal',
  'updateProposal',
  'createOutreachContact',
  'updateOutreachContact',
  'createOutreachActivity',
  'createComplianceItem',
  'updateComplianceItem',
  'createPipelineMetrics',
  'createCompany',
  'updateCompany',
  'createCompliancePackage',
  'updateCompliancePackage',
  'createIntakeResult',
  'createMaturityTracker',
  'updateMaturityTracker',
  'createBidDocument',
  'updateBidDocument',
  'clear',
]);

interface GovConRuntimeSnapshot {
  opportunities: any[];
  bidDecisions: any[];
  proposals: any[];
  outreachContacts: any[];
  outreachActivities: any[];
  complianceItems: any[];
  pipelineMetrics: any[];
  companies: any[];
  compliancePackages: any[];
  intakeResults: any[];
  maturityTrackers: any[];
  bidDocuments: any[];
}

function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function toIsoString(value: unknown): string | null {
  const date = normalizeDate(value);
  return date ? date.toISOString() : null;
}

export function normalizeOpportunityStatus(value: unknown): OpportunityStatus | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'identified'
    || normalized === 'evaluating'
    || normalized === 'bid'
    || normalized === 'no_bid'
    || normalized === 'submitted'
    || normalized === 'awarded'
    || normalized === 'lost'
  ) {
    return normalized;
  }
  return null;
}

export function normalizeSetAsideType(value: unknown): SetAsideType | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'SDVOSB'
    || normalized === 'VOSB'
    || normalized === '8a'
    || normalized === 'HUBZone'
    || normalized === 'WOSB'
    || normalized === 'small_business'
    || normalized === 'full_open'
    || normalized === 'sole_source'
  ) {
    return normalized;
  }
  return null;
}

export function serializeOpportunity(opportunity: any): Record<string, unknown> {
  return {
    id: String(opportunity?.id ?? ''),
    title: String(opportunity?.title ?? ''),
    solicitation_number: String(opportunity?.solicitation_number ?? ''),
    agency: String(opportunity?.agency ?? ''),
    sub_agency: opportunity?.sub_agency ? String(opportunity.sub_agency) : null,
    posted_date: toIsoString(opportunity?.posted_date),
    response_deadline: toIsoString(opportunity?.response_deadline),
    set_aside_type: String(opportunity?.set_aside_type ?? ''),
    naics_code: String(opportunity?.naics_code ?? ''),
    naics_description: String(opportunity?.naics_description ?? ''),
    estimated_value: opportunity?.estimated_value == null ? null : Number(opportunity.estimated_value),
    place_of_performance: opportunity?.place_of_performance ? String(opportunity.place_of_performance) : null,
    description: String(opportunity?.description ?? ''),
    url: opportunity?.url ? String(opportunity.url) : null,
    status: String(opportunity?.status ?? ''),
    source: String(opportunity?.source ?? ''),
    created_at: toIsoString(opportunity?.created_at),
    updated_at: toIsoString(opportunity?.updated_at),
  };
}

export function serializeBidDecision(decision: any): Record<string, unknown> {
  return {
    id: String(decision?.id ?? ''),
    opportunity_id: String(decision?.opportunity_id ?? ''),
    decision: String(decision?.decision ?? ''),
    score: Number(decision?.score ?? 0),
    criteria_scores: Array.isArray(decision?.criteria_scores)
      ? decision.criteria_scores.map((criterion: any) => ({
        criterion: String(criterion?.criterion ?? ''),
        score: Number(criterion?.score ?? 0),
        weight: Number(criterion?.weight ?? 0),
        notes: criterion?.notes ? String(criterion.notes) : null,
      }))
      : [],
    decision_date: toIsoString(decision?.decision_date),
    decided_by: String(decision?.decided_by ?? ''),
    rationale: String(decision?.rationale ?? ''),
  };
}

export function serializeContact(contact: any): Record<string, unknown> {
  return {
    id: String(contact?.id ?? ''),
    agency: String(contact?.agency ?? ''),
    office: contact?.office ? String(contact.office) : null,
    name: String(contact?.name ?? ''),
    title: String(contact?.title ?? ''),
    email: String(contact?.email ?? ''),
    phone: contact?.phone ? String(contact.phone) : null,
    osdbu: Boolean(contact?.osdbu),
    last_contacted: toIsoString(contact?.last_contacted),
    contact_count: Number(contact?.contact_count ?? 0),
    notes: contact?.notes ? String(contact.notes) : null,
    status: String(contact?.status ?? ''),
    created_at: toIsoString(contact?.created_at),
  };
}

export function serializeActivity(activity: any): Record<string, unknown> {
  return {
    id: String(activity?.id ?? ''),
    contact_id: String(activity?.contact_id ?? ''),
    activity_type: String(activity?.activity_type ?? ''),
    subject: String(activity?.subject ?? ''),
    notes: activity?.notes ? String(activity.notes) : null,
    follow_up_date: toIsoString(activity?.follow_up_date),
    completed: Boolean(activity?.completed),
    created_at: toIsoString(activity?.created_at),
  };
}

export function serializeComplianceItem(item: any): Record<string, unknown> {
  return {
    id: String(item?.id ?? ''),
    item_type: String(item?.item_type ?? ''),
    name: String(item?.name ?? ''),
    description: String(item?.description ?? ''),
    authority: String(item?.authority ?? ''),
    status: String(item?.status ?? ''),
    effective_date: toIsoString(item?.effective_date),
    expiration_date: toIsoString(item?.expiration_date),
    reminder_days_before: Number(item?.reminder_days_before ?? 0),
    notes: item?.notes ? String(item.notes) : null,
  };
}

export function serializeBidDocument(document: any): Record<string, unknown> {
  return {
    id: String(document?.id ?? ''),
    opportunity_id: String(document?.opportunity_id ?? ''),
    document_type: String(document?.document_type ?? ''),
    title: String(document?.title ?? ''),
    status: String(document?.status ?? ''),
    version: Number(document?.version ?? 1),
    output_formats: Array.isArray(document?.output_formats) ? document.output_formats : [],
    created_at: toIsoString(document?.created_at),
    updated_at: toIsoString(document?.updated_at),
  };
}

export function serializeGeneratedDocuments(documents: any[]): Record<string, unknown>[] {
  if (!Array.isArray(documents)) return [];
  return documents.map((document) => ({
    filename: String(document?.filename ?? ''),
    format: String(document?.format ?? ''),
    mimeType: String(document?.mimeType ?? ''),
    sizeBytes: typeof document?.content === 'string'
      ? Buffer.byteLength(document.content)
      : Buffer.isBuffer(document?.content)
        ? document.content.length
        : 0,
  }));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function getGovConModuleSetupError(error: unknown): string | null {
  const message = toErrorMessage(error);

  if (message.includes('Cannot find module')) {
    return 'govcon-compliance-command dist bundle is missing. Build it first: cd tooling/govcon-compliance-command && npm install && npm run build';
  }

  if (
    message.includes("Cannot find package 'pdf-lib'")
    || message.includes("Cannot find module 'pdf-lib'")
  ) {
    return 'pdf-lib dependency is missing. Install root dependencies before building the app.';
  }

  return null;
}

async function loadGovConCommandModule(): Promise<GovConCommandModule> {
  if (!govConModulePromise) {
    govConModulePromise = import('../../tooling/govcon-compliance-command/dist/index.js') as Promise<GovConCommandModule>;
  }
  return govConModulePromise;
}

export async function getGovConCommandModule(): Promise<GovConCommandModule> {
  return loadGovConCommandModule();
}

function serializeMapValues(value: unknown): any[] {
  if (value instanceof Map) return Array.from(value.values());
  return [];
}

function serializeGovConRepositoryState(repository: any): GovConRuntimeSnapshot {
  return {
    opportunities: serializeMapValues(repository.opportunities),
    bidDecisions: serializeMapValues(repository.bidDecisions),
    proposals: serializeMapValues(repository.proposals),
    outreachContacts: serializeMapValues(repository.outreachContacts),
    outreachActivities: serializeMapValues(repository.outreachActivities),
    complianceItems: serializeMapValues(repository.complianceItems),
    pipelineMetrics: serializeMapValues(repository.pipelineMetrics),
    companies: serializeMapValues(repository.companies),
    compliancePackages: serializeMapValues(repository.compliancePackages),
    intakeResults: serializeMapValues(repository.intakeResults),
    maturityTrackers: serializeMapValues(repository.maturityTrackers),
    bidDocuments: serializeMapValues(repository.bidDocuments),
  };
}

function normalizeSnapshotArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function hydrateGovConRepository(repository: any, snapshot: Record<string, unknown>) {
  repository.opportunities = new Map(
    normalizeSnapshotArray(snapshot.opportunities)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.bidDecisions = new Map(
    normalizeSnapshotArray(snapshot.bidDecisions)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.proposals = new Map(
    normalizeSnapshotArray(snapshot.proposals)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.outreachContacts = new Map(
    normalizeSnapshotArray(snapshot.outreachContacts)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.outreachActivities = new Map(
    normalizeSnapshotArray(snapshot.outreachActivities)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.complianceItems = new Map(
    normalizeSnapshotArray(snapshot.complianceItems)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.pipelineMetrics = new Map(
    normalizeSnapshotArray(snapshot.pipelineMetrics)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.companies = new Map(
    normalizeSnapshotArray(snapshot.companies)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.compliancePackages = new Map(
    normalizeSnapshotArray(snapshot.compliancePackages)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.intakeResults = new Map(
    normalizeSnapshotArray(snapshot.intakeResults)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.maturityTrackers = new Map(
    normalizeSnapshotArray(snapshot.maturityTrackers)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
  repository.bidDocuments = new Map(
    normalizeSnapshotArray(snapshot.bidDocuments)
      .map((entry) => [String(entry?.id ?? ''), entry] as const)
      .filter(([id]) => id.length > 0),
  );
}

function createPersistenceAwareGovConRepository(orgId: string, repository: any): any {
  let saveQueue: Promise<void> = Promise.resolve();

  const queueSave = async () => {
    saveQueue = saveQueue
      .catch(() => undefined)
      .then(async () => {
        const snapshot = serializeGovConRepositoryState(repository);
        await saveModuleRuntimeState(
          orgId,
          'govcon-compliance-command',
          snapshot as unknown as Record<string, unknown>,
        );
      });
    return saveQueue;
  };

  return new Proxy(repository, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof prop !== 'string' || typeof value !== 'function') return value;
      if (!GOVCON_MUTATING_REPOSITORY_METHODS.has(prop)) return value.bind(target);

      return async (...args: any[]) => {
        const result = await value.apply(target, args);
        await queueSave();
        return result;
      };
    },
  });
}

async function seedGovConRuntimeIfEmpty(runtimeRef: GovConRuntime) {
  const existingOpportunities = await runtimeRef.opportunityService.listOpportunities();
  if (Array.isArray(existingOpportunities) && existingOpportunities.length > 0) return;

  const now = new Date();

  await runtimeRef.opportunityService.createOpportunity(
    'Enterprise Data Governance Modernization',
    'GSA-2026-DATA-101',
    'General Services Administration',
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
    'small_business',
    '541512',
    'Computer Systems Design Services',
    'Modernize data governance workflows, reporting standards, and compliance automation across program offices.',
    {
      source: 'manual',
      status: 'evaluating',
      estimated_value: 240000,
      place_of_performance: 'Washington, DC',
      posted_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9),
    },
  );

  await runtimeRef.opportunityService.createOpportunity(
    'CUI Security Controls Implementation Support',
    'VA-2026-CUI-044',
    'Department of Veterans Affairs',
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
    'SDVOSB',
    '541519',
    'Other Computer Related Services',
    'Implement and validate NIST SP 800-171 control mappings for CUI handling and audit readiness.',
    {
      source: 'manual',
      status: 'identified',
      estimated_value: 165000,
      place_of_performance: 'Remote / Washington, DC',
      posted_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
    },
  );

  await runtimeRef.outreachService.createContact(
    'Alex Morgan',
    'alex.morgan@gsa.gov',
    'General Services Administration',
    'Contracting Specialist',
    {
      office: 'Federal Acquisition Service',
      phone: '202-555-0180',
      osdbu: false,
      status: 'warm',
      notes: 'Engaged during pre-solicitation market research call.',
    },
  );

  await runtimeRef.outreachService.createContact(
    'Jordan Reyes',
    'jordan.reyes@va.gov',
    'Department of Veterans Affairs',
    'OSDBU Liaison',
    {
      office: 'Office of Small and Disadvantaged Business Utilization',
      phone: '202-555-0192',
      osdbu: true,
      status: 'active',
      notes: 'Requested capability statement update for SDVOSB matching.',
    },
  );

  await runtimeRef.complianceService.createComplianceItem(
    'SAM Registration Renewal',
    'System for Award Management annual renewal requirement.',
    'renewal',
    'SAM',
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 22),
    { status: 'current', reminder_days_before: 30 },
  );

  await runtimeRef.complianceService.createComplianceItem(
    'SBA SDVOSB Certification Annual Validation',
    'Annual certification validation for SDVOSB designation.',
    'certification',
    'SBA',
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 58),
    { status: 'current', reminder_days_before: 60 },
  );
}

export async function getGovConRuntime(orgId: string): Promise<GovConRuntime> {
  const existing = runtimeByOrg.get(orgId);
  if (existing) return existing;

  const moduleRef = await loadGovConCommandModule();
  const rawRepo = new moduleRef.InMemoryRepository();
  const snapshot = await loadModuleRuntimeState(orgId, 'govcon-compliance-command');

  if (snapshot) {
    hydrateGovConRepository(rawRepo, snapshot);
  }

  const repo = createPersistenceAwareGovConRepository(orgId, rawRepo);

  const opportunityService = new moduleRef.OpportunityService(repo);
  const bidDecisionService = new moduleRef.BidDecisionService(repo);
  const outreachService = new moduleRef.OutreachService(repo);
  const complianceService = new moduleRef.ComplianceService(repo);
  const pipelineService = new moduleRef.PipelineService(repo);
  const packageService = new moduleRef.CompliancePackageService(repo);
  const intakeService = new moduleRef.IntakeService(repo);
  const maturityService = new moduleRef.MaturityService(repo);
  const bidDocumentService = new moduleRef.BidDocumentService(repo);
  const deadlineMonitor = new moduleRef.DeadlineMonitor(opportunityService);
  const complianceMonitor = new moduleRef.ComplianceMonitor(complianceService);
  const dashboard = new moduleRef.PipelineDashboard(opportunityService, pipelineService);
  const winLossReport = new moduleRef.WinLossReportGenerator(pipelineService);
  const outreachReport = new moduleRef.OutreachReport(outreachService);

  const runtimeRef: GovConRuntime = {
    repo,
    opportunityService,
    bidDecisionService,
    outreachService,
    complianceService,
    pipelineService,
    packageService,
    intakeService,
    maturityService,
    bidDocumentService,
    deadlineMonitor,
    complianceMonitor,
    dashboard,
    winLossReport,
    outreachReport,
  };

  if (!snapshot) {
    await seedGovConRuntimeIfEmpty(runtimeRef);
    await saveModuleRuntimeState(
      orgId,
      'govcon-compliance-command',
      serializeGovConRepositoryState(rawRepo) as unknown as Record<string, unknown>,
    );
  }
  runtimeByOrg.set(orgId, runtimeRef);
  return runtimeRef;
}
